import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from '../SocketContext';
import { useUser } from '../UserContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const getDecodedToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
};

const getUserIdFromToken = () => {
  const decoded = getDecodedToken();
  return decoded ? (decoded.id || decoded._id || decoded.userId || null) : null;
};

const getUserRoleFromToken = () => {
  const decoded = getDecodedToken();
  return decoded ? (decoded.role || decoded.userRole || (decoded.user && decoded.user.role) || null) : null;
};

function Messages() {
  const { socket, isConnected } = useSocket();
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [joinedSession, setJoinedSession] = useState(null);
  const [joinedSessionDetails, setJoinedSessionDetails] = useState(null);
  const [otherProfile, setOtherProfile] = useState(null);
  
  const [availableSessions, setAvailableSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessionProfiles, setSessionProfiles] = useState({});
  
  const messagesEndRef = useRef(null);

  const currentUserId = user?._id || user?.id || getUserIdFromToken();
  const currentUserRole = user?.role || getUserRoleFromToken() || localStorage.getItem('role') || 'user';

  const fetchSessionDetails = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://mind-space-ov3r.onrender.com/session/${id}`, {
        headers: { Authorization: `dash ${token}` },
      });
      const data = res.data?.data || res.data;
      if (data) {
        setJoinedSessionDetails(data);
      }
    } catch (error) {
      console.error('Failed to fetch session details:', error);
    }
  };

  useEffect(() => {
    if (joinedSession) {
      const found = availableSessions.find(s => s._id === joinedSession);
      if (found) {
        setJoinedSessionDetails(found);
      } else {
        fetchSessionDetails(joinedSession);
      }
    } else {
      setJoinedSessionDetails(null);
    }
  }, [joinedSession, availableSessions]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch available sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role') || 'user';
        
        // Use the appropriate endpoint based on role
        const endpoint = role === 'therapist' 
          ? 'https://mind-space-ov3r.onrender.com/session/therapist'
          : 'https://mind-space-ov3r.onrender.com/session/patient'; // Fallback for patient
          
        const res = await axios.get(endpoint, {
          headers: { Authorization: `dash ${token}` },
        });
        
        setAvailableSessions(res.data.data || res.data || []);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
        toast.error('Failed to load upcoming sessions');
      } finally {
        setLoadingSessions(false);
      }
    };
    
    fetchSessions();
  }, []);

  // Fetch profiles for "other" participants shown in session cards
  useEffect(() => {
    if (availableSessions.length === 0) return;
    const role = currentUserRole;
    const token = localStorage.getItem('token');
    if (!token) return;

    const idsToFetch = [];
    availableSessions.forEach((session) => {
      const otherUser = role === 'therapist'
        ? (session.userId || session.patientId)
        : session.therapistId;
      
      if (!otherUser) return;
      
      // If it's a string ID or an object missing userName, we need to fetch
      const id = typeof otherUser === 'string' ? otherUser : (otherUser._id || otherUser.id);
      const hasName = typeof otherUser === 'object' && otherUser.userName;
      const hasPfp = typeof otherUser === 'object' && (otherUser.pfp || otherUser.profilePic || otherUser.avatar);
      
      if (id && (!hasName || !hasPfp) && !sessionProfiles[id]) {
        idsToFetch.push(id);
      }
    });

    // Deduplicate
    const uniqueIds = [...new Set(idsToFetch)];
    if (uniqueIds.length === 0) return;

    const fetchProfiles = async () => {
      const newProfiles = {};
      for (const id of uniqueIds) {
        try {
          // Try therapist list first if looking for therapists
          if (role !== 'therapist') {
            try {
              const resDocs = await axios.get('https://mind-space-ov3r.onrender.com/user/get-therapists', {
                headers: { Authorization: `dash ${token}` }
              });
              const docs = resDocs.data?.therapists || resDocs.data?.data || resDocs.data || [];
              const found = docs.find(d => String(d._id || d.id) === String(id));
              if (found) {
                newProfiles[id] = found;
                continue;
              }
            } catch (e) { /* fall through */ }
          }

          // Try profile endpoint
          try {
            const res = await axios.get(`https://mind-space-ov3r.onrender.com/user/profile/${id}`, {
              headers: { Authorization: `dash ${token}` }
            });
            const data = res.data?.data || res.data;
            if (data && (data._id || data.id)) {
              newProfiles[id] = data;
              continue;
            }
          } catch (e) { /* fall through */ }

          // Fallback endpoint
          try {
            const res2 = await axios.get(`https://mind-space-ov3r.onrender.com/user/${id}`, {
              headers: { Authorization: `dash ${token}` }
            });
            const data2 = res2.data?.data || res2.data;
            if (data2 && (data2._id || data2.id)) {
              newProfiles[id] = data2;
            }
          } catch (e2) {
            console.error(`Failed to fetch profile for ${id}:`, e2);
          }
        } catch (err) {
          console.error(`Failed to fetch profile for ${id}:`, err);
        }
      }

      if (Object.keys(newProfiles).length > 0) {
        setSessionProfiles(prev => ({ ...prev, ...newProfiles }));
      }
    };

    fetchProfiles();
  }, [availableSessions, currentUserRole]);

  // DEBUG: Log ALL socket events to see exactly what's happening
  useEffect(() => {
    if (!socket) return;

    const debugAll = (eventName, ...args) => {
      console.log(`🔍 [Socket Event] "${eventName}":`, ...args);
    };

    const onDisconnect = (reason) => {
      console.error('🔌 Socket DISCONNECTED! Reason:', reason);
    };

    socket.onAny(debugAll);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.offAny(debugAll);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (response) => {
      console.log('📩 receiveMessage event:', response);
      setMessages((prev) => {
        // Avoid duplicate if we already added it optimistically
        const newMsg = response.data;
        if (newMsg && newMsg._id) {
          const exists = prev.some((m) => m._id === newMsg._id);
          if (exists) return prev;
        }
        return [...prev, newMsg];
      });
    };

    const handleMessageSent = (response) => {
      console.log('✅ messageSent event:', response);
      setMessages((prev) => {
        const newMsg = response.data;
        // Replace optimistic message with confirmed one
        if (newMsg && newMsg._id) {
          const exists = prev.some((m) => m._id === newMsg._id);
          if (exists) return prev;
        }
        // Remove the optimistic placeholder and add the real message
        const filtered = prev.filter((m) => !m._optimistic);
        return [...filtered, newMsg];
      });
    };

    const handleJoinedSession = (response) => {
      console.log('🔗 joinedSession event (FULL response):', JSON.stringify(response));
      // response.data could be a sessionId string or an object — extract the ID
      const sessionData = response.data;
      const sessionId = typeof sessionData === 'string' ? sessionData : (sessionData?._id || sessionData?.sessionId || sessionData);
      console.log('🔗 Extracted sessionId:', sessionId, '(type:', typeof sessionId, ')');
      setJoinedSession(sessionId);
      toast.success(response.message || 'Joined session successfully');
    };

    const handleError = (err) => {
      console.error('❌ Socket error event:', err);
      toast.error(err.message || 'An error occurred');
      // Remove optimistic messages on error
      setMessages((prev) => prev.filter((m) => !m._optimistic));
    };

    const handleSessionEnded = (response) => {
      console.log('🛑 sessionEnded event:', response);
      toast.info(response.message || 'Session has ended');
      
      const endedSessionId = response.data;
      
      setJoinedSession((prevJoined) => {
        const currentSessionId = typeof prevJoined === 'string' ? prevJoined : (prevJoined?._id || prevJoined?.sessionId || prevJoined);
        if (currentSessionId === endedSessionId) {
           setMessages([]);
           return null;
        }
        return prevJoined;
      });
      
      setAvailableSessions((prev) => prev.filter((s) => s._id !== endedSessionId));
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('messageSent', handleMessageSent);
    socket.on('joinedSession', handleJoinedSession);
    socket.on('sessionEnded', handleSessionEnded);
    socket.on('error', handleError);
    socket.on('errorMessage', handleError); // Safe alternative to reserved "error" event

    // Cleanup listeners on unmount
    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('messageSent', handleMessageSent);
      socket.off('joinedSession', handleJoinedSession);
      socket.off('sessionEnded', handleSessionEnded);
      socket.off('error', handleError);
      socket.off('errorMessage', handleError);
    };
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket || !joinedSession) return;

    // Resolve the sessionId — joinedSession could be a string ID or an object
    const sessionId = typeof joinedSession === 'string' ? joinedSession : (joinedSession?._id || joinedSession?.sessionId || joinedSession);

    console.log('📤 Sending message:', { sessionId, content: inputMessage });
    console.log('📤 joinedSession raw value:', joinedSession);

    // Optimistically add the message to the UI immediately
    const optimisticMsg = {
      sender: user?._id || user?.id || 'me',
      message: inputMessage,
      content: inputMessage,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    // Emit the message to the backend
    socket.emit('sendMessage', {
      sessionId: sessionId,
      content: inputMessage,
    });

    setInputMessage('');
  };

  const handleJoinSession = (sessionIdToJoin) => {
    if (!sessionIdToJoin || !socket) return;
    socket.emit('joinSession', { sessionId: sessionIdToJoin });
  };

  const handleLeaveSession = () => {
    if (!joinedSession || !socket) return;
    socket.emit('leaveSession', { sessionId: joinedSession });
    setJoinedSession(null);
    setMessages([]); // Clear chat history on leave
    toast.info("Left the session");
  };

  const handleEndSession = () => {
    console.log("End session clicked! joinedSession:", joinedSession, "socket:", !!socket);
    if (!joinedSession || !socket) return;
    
    const sessionId = typeof joinedSession === 'string' ? joinedSession : (joinedSession?._id || joinedSession?.sessionId || joinedSession);
    console.log("Extracted sessionId to end:", sessionId);
    
    if (window.confirm("Are you sure you want to end this session for both you and the patient?")) {
      console.log("Confirmed end session. Emitting 'endSession' event with:", { sessionId });
      socket.emit('endSession', { sessionId });
    } else {
      console.log("End session cancelled by user.");
    }
  };

  const currentSessionDetails = joinedSessionDetails;
  

  let otherParticipant = null;
  if (currentSessionDetails) {
    const patientObj = currentSessionDetails.userId || currentSessionDetails.patientId;
    const therapistObj = currentSessionDetails.therapistId;
    
    const patientId = patientObj ? (typeof patientObj === 'string' ? patientObj : (patientObj._id || patientObj.id)) : null;
    const therapistId = therapistObj ? (typeof therapistObj === 'string' ? therapistObj : (therapistObj._id || therapistObj.id)) : null;
    
    if (currentUserId && therapistId && String(currentUserId) === String(therapistId)) {
      otherParticipant = patientObj;
    } else if (currentUserId && patientId && String(currentUserId) === String(patientId)) {
      otherParticipant = therapistObj;
    } else {
      // Fallback using role
      if (currentUserRole === 'therapist') {
        otherParticipant = patientObj;
      } else {
        otherParticipant = therapistObj;
      }
    }
  }

  const otherParticipantId = otherParticipant 
    ? (typeof otherParticipant === 'string' ? otherParticipant : (otherParticipant._id || otherParticipant.id)) 
    : null;

  useEffect(() => {
    if (!otherParticipantId) {
      setOtherProfile(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        let data = null;

        // 1. If looking for a therapist, try finding in the therapists list first
        if (currentUserRole === 'user' || currentUserRole === 'patient') {
          try {
            const resDocs = await axios.get('https://mind-space-ov3r.onrender.com/user/get-therapists', {
              headers: { Authorization: `dash ${token}` }
            });
            const docs = resDocs.data?.therapists || resDocs.data?.data || resDocs.data || [];
            const foundDoc = docs.find(d => String(d._id || d.id) === String(otherParticipantId));
            if (foundDoc) {
              setOtherProfile(foundDoc);
              return;
            }
          } catch (err) {
            console.error("Failed to search therapist in list:", err);
          }
        }

        // 2. Primary profile endpoint with ID
        try {
          const res = await axios.get(`https://mind-space-ov3r.onrender.com/user/profile/${otherParticipantId}`, {
            headers: { Authorization: `dash ${token}` }
          });
          const fetchedData = res.data?.data || res.data;
          const fetchedId = fetchedData?._id || fetchedData?.id;
          if (fetchedId && currentUserId && String(fetchedId) === String(currentUserId)) {
            throw new Error("Returned current user instead of target user");
          }
          data = fetchedData;
        } catch (e) {
          // 3. Fallback endpoint
          try {
            const res2 = await axios.get(`https://mind-space-ov3r.onrender.com/user/${otherParticipantId}`, {
              headers: { Authorization: `dash ${token}` }
            });
            const fetchedData2 = res2.data?.data || res2.data;
            const fetchedId2 = fetchedData2?._id || fetchedData2?.id;
            if (fetchedId2 && currentUserId && String(fetchedId2) === String(currentUserId)) {
              throw new Error("Returned current user instead of target user");
            }
            data = fetchedData2;
          } catch (e2) {
            // 4. Try query parameter endpoint fallback
            try {
              const res3 = await axios.get(`https://mind-space-ov3r.onrender.com/user/profile?id=${otherParticipantId}`, {
                headers: { Authorization: `dash ${token}` }
              });
              const fetchedData3 = res3.data?.data || res3.data;
              const fetchedId3 = fetchedData3?._id || fetchedData3?.id;
              if (fetchedId3 && currentUserId && String(fetchedId3) === String(currentUserId)) {
                throw new Error("Returned current user instead of target user");
              }
              data = fetchedData3;
            } catch (e3) {
              console.error("All other profile fetches failed:", e3);
            }
          }
        }

        if (data) {
          setOtherProfile(data);
        }
      } catch (err) {
        console.error("Failed to fetch other participant profile:", err);
      }
    };
    fetchProfile();
  }, [otherParticipantId, currentUserRole, currentUserId]);

  const displayParticipant = otherProfile || (typeof otherParticipant === 'object' ? otherParticipant : null);
  const displayName = displayParticipant?.userName || 'Unknown User';

  let displayPfp = null;
  if (displayParticipant) {
    if (displayParticipant.pfp) {
      if (typeof displayParticipant.pfp === 'string') {
        displayPfp = displayParticipant.pfp;
      } else if (typeof displayParticipant.pfp === 'object') {
        displayPfp = displayParticipant.pfp.secure_url || displayParticipant.pfp.url || null;
      }
    }
    if (!displayPfp) {
      displayPfp = displayParticipant.profilePic || displayParticipant.avatar || null;
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>💬 Chat Session</h2>
      <div style={{ marginBottom: '20px', fontSize: '14px' }}>
        Status: {isConnected ? (
          <span style={{ color: '#10b981', fontWeight: 'bold', background: '#d1fae5', padding: '4px 8px', borderRadius: '12px' }}>🟢 Connected</span>
        ) : (
          <span style={{ color: '#ef4444', fontWeight: 'bold', background: '#fee2e2', padding: '4px 8px', borderRadius: '12px' }}>🔴 Disconnected</span>
        )}
      </div>

      {!joinedSession ? (
        <div style={{ marginBottom: '20px' }}>
          <h3>Available Sessions</h3>
          {loadingSessions ? (
            <p>Loading sessions...</p>
          ) : availableSessions.length === 0 ? (
            <p>No upcoming sessions found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {availableSessions.map((session) => {
                // Determine the "other" participant for this session card
                const sessionRole = currentUserRole;
                const rawOtherUser = sessionRole === 'therapist'
                  ? (session.userId || session.patientId)
                  : session.therapistId;
                
                // Get the ID so we can look up enriched profile
                const rawOtherId = rawOtherUser
                  ? (typeof rawOtherUser === 'string' ? rawOtherUser : (rawOtherUser._id || rawOtherUser.id))
                  : null;
                
                // Merge: use fetched profile if available, fall back to session data
                const enrichedProfile = rawOtherId ? sessionProfiles[rawOtherId] : null;
                const otherUser = enrichedProfile || (typeof rawOtherUser === 'object' ? rawOtherUser : null);
                const otherName = otherUser?.userName || 'Unknown';
                
                // Extract pfp from enriched or raw data
                let otherPfpUrl = null;
                if (otherUser) {
                  if (otherUser.pfp) {
                    if (typeof otherUser.pfp === 'string') {
                      otherPfpUrl = otherUser.pfp;
                    } else if (typeof otherUser.pfp === 'object') {
                      otherPfpUrl = otherUser.pfp.secure_url || otherUser.pfp.url || null;
                    }
                  }
                  if (!otherPfpUrl) {
                    otherPfpUrl = otherUser.profilePic || otherUser.avatar || null;
                  }
                }

                // Format session time
                const sessionTime = session.sessionTime
                  ? new Date(session.sessionTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                  : 'N/A';

                return (
                  <div key={session._id} style={{ 
                    padding: '16px 20px', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '14px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: '#ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                    cursor: 'default'
                  }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                      e.currentTarget.style.borderColor = '#c7d2fe';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    {/* Left side: PFP + Name + Session Time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {/* Avatar */}
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        {otherPfpUrl ? (
                          <img src={otherPfpUrl} alt={otherName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          (otherName?.[0] || 'U').toUpperCase()
                        )}
                      </div>
                      {/* Name + Time */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ 
                          fontSize: '15px', 
                          fontWeight: '600', 
                          color: '#1a1a2e' 
                        }}>
                          {otherName}
                        </span>
                        <span style={{ 
                          fontSize: '13px', 
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          🕐 {sessionTime}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          color: session.status === 'scheduled' ? '#3b82f6' : '#10b981',
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}>
                          {session.status}
                        </span>
                      </div>
                    </div>

                    {/* Right side: Join button */}
                    <button 
                      onClick={() => handleJoinSession(session._id)} 
                      style={{ 
                        padding: '10px 22px', 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '10px', 
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(59,130,246,0.25)'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.35)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.25)';
                      }}
                    >
                      Join Session
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          border: '1px solid #eaeaea',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '600px'
        }}>
          {/* MODERN CHAT HEADER */}
          <div style={{ 
            padding: '20px', 
            background: '#ffffff', 
            borderBottom: '1px solid #f0f0f0', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '18px',
                overflow: 'hidden'
              }}>
                {displayPfp ? (
                  <img src={displayPfp} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (displayName?.[0] || 'U').toUpperCase()
                )}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                  {displayName}
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
                  In Session
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {currentUserRole === 'therapist' && (
                <button 
                  onClick={handleEndSession} 
                  style={{ 
                    padding: '8px 16px', 
                    background: '#ef4444', 
                    color: '#ffffff', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
                >
                  End Session
                </button>
              )}
              <button 
                onClick={handleLeaveSession} 
                style={{ 
                  padding: '8px 16px', 
                  background: '#fee2e2', 
                  color: '#ef4444', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#fecaca'}
                onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
              >
                Leave Session
              </button>
            </div>
          </div>

          {/* CHAT MESSAGES AREA */}
          <div style={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: '24px',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>👋</div>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>Say hello!</p>
                <p style={{ margin: '4px 0 0', fontSize: '14px' }}>Start the conversation now.</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const senderId = typeof msg.sender === 'string' ? msg.sender : (msg.sender?._id || msg.sender?.id || msg.sender);
                const isMine = (currentUserId && senderId && String(senderId) === String(currentUserId)) || senderId === 'me' || msg._optimistic;
                return (
                  <div key={index} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                    margin: '4px 0'
                  }}>
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isMine ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#ffffff',
                      color: isMine ? '#ffffff' : '#334155',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      maxWidth: '75%',
                      wordBreak: 'break-word',
                      fontSize: '15px',
                      lineHeight: '1.5'
                    }}>
                      {msg.content || msg.message || msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* MESSAGE INPUT AREA */}
          <div style={{
            padding: '20px',
            background: '#ffffff',
            borderTop: '1px solid #f0f0f0'
          }}>
            <form onSubmit={handleSendMessage} style={{ 
              display: 'flex', 
              gap: '12px',
              background: '#f1f5f9',
              padding: '8px',
              borderRadius: '24px'
            }}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                style={{ 
                  flexGrow: 1, 
                  padding: '12px 16px', 
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '15px',
                  color: '#334155'
                }}
              />
              <button 
                type="submit" 
                disabled={!inputMessage.trim()}
                style={{ 
                  padding: '10px 24px', 
                  background: inputMessage.trim() ? '#3b82f6' : '#cbd5e1', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '20px', 
                  cursor: inputMessage.trim() ? 'pointer' : 'not-allowed', 
                  fontWeight: '600',
                  transition: 'background 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;
