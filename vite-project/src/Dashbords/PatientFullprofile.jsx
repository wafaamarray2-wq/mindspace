import { useState, useEffect, createContext, useContext, useCallback } from "react";
import "./PatientFullprofile.css";

// ─── API Layer ────────────────────────────────────────────────────────────────
const BASE = ""; // replace with real base URL
const getToken = () => localStorage.getItem("mh_token") || "demo_token";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `dash ${getToken()}`,
});

async function api(path, opts = {}) {
  // Simulate API calls with mock data in demo mode
  await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
  throw new Error("DEMO_MODE");
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK = {
  posts: [
    { id:1, author:"Amira K.", avatar:"🌿", content:"Today was really hard. I couldn't get out of bed until noon. But I made myself a cup of tea, sat by the window, and watched the leaves. It felt like a small victory.", time:"2h ago", likes:14, liked:false, comments:5, tags:["anxiety","self-care"] },
    { id:2, author:"Omar S.", avatar:"🌊", content:"Three months of therapy and I finally told my family about my depression. The relief of being honest is indescribable. You don't have to carry this alone.", time:"5h ago", likes:31, liked:true, comments:12, tags:["depression","family"] },
    { id:3, author:"Layla M.", avatar:"🌸", content:"Panic attack at work today. I used the breathing technique my therapist taught me and it actually helped. 4-7-8 breathing really does work. Sharing in case anyone needs it.", time:"1d ago", likes:48, liked:false, comments:23, tags:["anxiety","breathing"] },
    { id:4, author:"Yusuf A.", avatar:"☀️", content:"Grateful for this community. You've helped me more than you know. Starting to feel like myself again after a very dark year.", time:"2d ago", likes:76, liked:false, comments:18, tags:["gratitude","recovery"] },
  ],
  groups: [
    { id:1, name:"Anxiety Support Circle", desc:"A safe space to share experiences with anxiety and learn coping strategies together.", members:124, emoji:"🌿", joined:true, category:"Anxiety" },
    { id:2, name:"Grief & Loss", desc:"For those processing loss of any kind. No judgment, only compassion.", members:87, emoji:"🕊️", joined:false, category:"Grief" },
    { id:3, name:"Young Adults Mental Health", desc:"Navigating stress, relationships, and identity as a young adult.", members:203, emoji:"🌱", joined:false, category:"General" },
    { id:4, name:"Mindfulness & Meditation", desc:"Daily practices, guided meditations, and mindful living tips.", members:156, emoji:"🧘", joined:true, category:"Mindfulness" },
    { id:5, name:"Depression Warriors", desc:"Stories of resilience and recovery from depression.", members:95, emoji:"💛", joined:false, category:"Depression" },
    { id:6, name:"Trauma Survivors", desc:"Healing together from trauma with compassion and understanding.", members:71, emoji:"🌺", joined:false, category:"Trauma" },
  ],
  sessions: [
    { id:1, therapist:"Dr. Sara Hassan", specialty:"CBT", date:"2026-05-14", time:"10:00 AM", status:"confirmed", notes:"First session" },
    { id:2, therapist:"Dr. Khaled Nour", specialty:"Trauma", date:"2026-05-20", time:"3:00 PM", status:"pending", notes:"Discuss anxiety management" },
    { id:3, therapist:"Dr. Rana Youssef", specialty:"Mindfulness", date:"2026-04-30", time:"1:00 PM", status:"cancelled", notes:"" },
  ],
  questions: [
    { id:1, text:"Over the last 2 weeks, how often have you felt little interest or pleasure in doing things?", options:["Not at all","Several days","More than half the days","Nearly every day"] },
    { id:2, text:"How often have you felt down, depressed, or hopeless?", options:["Not at all","Several days","More than half the days","Nearly every day"] },
    { id:3, text:"How often have you had trouble falling or staying asleep, or sleeping too much?", options:["Not at all","Several days","More than half the days","Nearly every day"] },
    { id:4, text:"How often have you felt tired or had little energy?", options:["Not at all","Several days","More than half the days","Nearly every day"] },
    { id:5, text:"How often have you felt bad about yourself or that you have let yourself or your family down?", options:["Not at all","Several days","More than half the days","Nearly every day"] },
  ],
  feedbacks: [
    { id:1, therapist:"Dr. Sara Hassan", rating:5, text:"Incredibly empathetic and professional. She helped me see things from a new perspective.", date:"Apr 2026", author:"You" },
    { id:2, therapist:"Dr. Khaled Nour", rating:4, text:"Very knowledgeable about trauma. Sessions feel safe and structured.", date:"Mar 2026", author:"A.K." },
  ],
  users: [
    { id:1, name:"Amira K.", email:"amira@email.com", status:"active", joined:"Jan 2026", posts:12 },
    { id:2, name:"Omar S.", email:"omar@email.com", status:"active", joined:"Feb 2026", posts:7 },
    { id:3, name:"Layla M.", email:"layla@email.com", status:"banned", joined:"Dec 2025", posts:3 },
    { id:4, name:"Yusuf A.", email:"yusuf@email.com", status:"active", joined:"Mar 2026", posts:15 },
  ],
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

// ─── Utility Components ───────────────────────────────────────────────────────
function Spinner() {
  return <div className="loading-state"><div className="spinner"/><p>Loading…</p></div>;
}
function Alert({ type="info", children }) {
  const icons = { error:"⚠️", success:"✓", info:"ℹ" };
  return <div className={`alert alert-${type}`}>{icons[type]} {children}</div>;
}
function Modal({ title, onClose, footer, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────

// ── Home / Feed ──
function HomePage({ navigate }) {
  const [posts, setPosts] = useState(MOCK.posts);
  const [search, setSearch] = useState("");

  const toggleLike = id => {
    setPosts(ps => ps.map(p => p.id===id
      ? {...p, liked:!p.liked, likes:p.liked?p.likes-1:p.likes+1} : p));
  };

  const filtered = posts.filter(p =>
    p.content.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 style={{fontFamily:"'Lora',serif",fontSize:26,color:"var(--stone-dark)"}}>Community Feed</h1>
          <p className="text-muted text-sm mt-2">A safe space to share and support</p>
        </div>
        <button className="btn btn-primary" onClick={()=>navigate("create-post")}>✏️ Share Your Thoughts</button>
      </div>

      <div className="search-bar mb-4">
        <span className="search-icon">🔍</span>
        <input placeholder="Search posts…" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      <div style={{display:"flex",gap:10,marginBottom:24,flexWrap:"wrap"}}>
        {["All","Anxiety","Depression","Gratitude","Self-care"].map(t => (
          <button key={t} className="btn btn-sm" style={{background:"var(--sage-pale)",color:"var(--sage)",border:"none"}}>{t}</button>
        ))}
      </div>

      {filtered.length===0 && <div className="empty-state"><div className="empty-icon">🌿</div><h3>No posts found</h3><p>Be the first to share today.</p></div>}

      {filtered.map(post => (
        <div key={post.id} className="card post-card">
          <div className="post-card-inner">
            <div className="post-header">
              <div className="post-avatar">{post.avatar}</div>
              <div className="post-meta">
                <div className="author">{post.author}</div>
                <div className="time">{post.time}</div>
              </div>
            </div>
            {post.tags?.map(t=>(
              <span key={t} className="post-tag">#{t}</span>
            ))}
            <p className="post-content preview">{post.content}</p>
            <div className="post-actions">
              <button className={`action-btn ${post.liked?"liked":""}`} onClick={()=>toggleLike(post.id)}>
                {post.liked?"❤️":"🤍"} {post.likes}
              </button>
              <button className="action-btn">💬 {post.comments}</button>
              <button className="action-btn view-btn" onClick={()=>navigate("post-detail",post)}>
                Read more →
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Create Post ──
function CreatePostPage({ navigate }) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const addTag = e => {
    if ((e.key==="Enter"||e.key===",") && tagInput.trim()) {
      e.preventDefault();
      setTags(t=>[...t,tagInput.trim().replace(/^#/,"")]);
      setTagInput("");
    }
  };

  const submit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    await new Promise(r=>setTimeout(r,800));
    setSubmitting(false);
    setSuccess(true);
    setTimeout(()=>navigate("home"),1500);
  };

  const chars = content.length;
  const maxChars = 1000;

  return (
    <div style={{maxWidth:680}}>
      <div className="page-header">
        <h1>Share Your Thoughts</h1>
        <p className="text-muted">Express yourself freely. This is a safe, supportive space.</p>
      </div>

      {success && <Alert type="success">Your post has been shared with the community 💚</Alert>}

      <div className="card">
        <div className="card-body">
          <div className="form-group">
            <label>What's on your mind?</label>
            <textarea
              placeholder="Share your feelings, experiences, or thoughts… You don't have to be perfect here."
              value={content}
              onChange={e=>setContent(e.target.value.slice(0,maxChars))}
              style={{minHeight:200}}
            />
            <div style={{textAlign:"right",fontSize:12,color:chars>maxChars*0.9?"var(--blush)":"var(--text-soft)",marginTop:4}}>
              {chars}/{maxChars}
            </div>
          </div>

          <div className="form-group">
            <label>Tags (press Enter to add)</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
              {tags.map(t=>(
                <span key={t} className="post-tag" style={{cursor:"pointer"}} onClick={()=>setTags(ts=>ts.filter(x=>x!==t))}>
                  #{t} ×
                </span>
              ))}
            </div>
            <input
              placeholder="e.g. anxiety, gratitude, mindfulness"
              value={tagInput}
              onChange={e=>setTagInput(e.target.value)}
              onKeyDown={addTag}
            />
          </div>

          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div
              onClick={()=>setAnonymous(a=>!a)}
              style={{
                width:44,height:24,borderRadius:12,
                background:anonymous?"var(--sage)":"var(--mist)",
                cursor:"pointer",transition:"background var(--transition)",position:"relative",flexShrink:0,
              }}
            >
              <div style={{
                width:18,height:18,borderRadius:50,background:"#fff",position:"absolute",
                top:3,left:anonymous?23:3,transition:"left var(--transition)",boxShadow:"0 1px 4px rgba(0,0,0,.2)"
              }}/>
            </div>
            <label style={{margin:0,cursor:"pointer"}} onClick={()=>setAnonymous(a=>!a)}>
              Post anonymously
            </label>
          </div>

          <div style={{display:"flex",gap:12}}>
            <button className="btn btn-primary" onClick={submit} disabled={!content.trim()||submitting}>
              {submitting?"Sharing…":"Share Post 💚"}
            </button>
            <button className="btn btn-secondary" onClick={()=>navigate("home")}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Post Detail ──
function PostDetailPage({ post, navigate }) {
  const p = post || MOCK.posts[0];
  const [liked, setLiked] = useState(p.liked);
  const [likes, setLikes] = useState(p.likes);
  const [comments, setComments] = useState([
    { id:1, author:"Nadia R.", avatar:"🌷", text:"Thank you for sharing this. You're not alone.", time:"1h ago" },
    { id:2, author:"Karim B.", avatar:"🌊", text:"I felt exactly the same way last month. It does get better.", time:"3h ago" },
    { id:3, author:"Sara M.", avatar:"🌿", text:"Sending you so much love and support 💚", time:"5h ago" },
  ]);
  const [newComment, setNewComment] = useState("");

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments(cs=>[{id:Date.now(),author:"You",avatar:"🙂",text:newComment,time:"Just now"},...cs]);
    setNewComment("");
  };

  const delComment = id => setComments(cs=>cs.filter(c=>c.id!==id));

  return (
    <div style={{maxWidth:720}}>
      <button className="btn btn-secondary btn-sm mb-4" onClick={()=>navigate("home")}>← Back</button>

      <div className="card mb-4">
        <div className="card-body">
          <div className="post-header">
            <div className="post-avatar" style={{width:52,height:52,fontSize:22}}>{p.avatar}</div>
            <div className="post-meta">
              <div className="author" style={{fontSize:16}}>{p.author}</div>
              <div className="time">{p.time}</div>
            </div>
          </div>
          {p.tags?.map(t=><span key={t} className="post-tag">#{t}</span>)}
          <p className="post-content" style={{marginTop:12,fontSize:16,lineHeight:1.8}}>{p.content}</p>
          <div className="post-actions">
            <button className={`action-btn ${liked?"liked":""}`} onClick={()=>{setLiked(l=>!l);setLikes(n=>liked?n-1:n+1);}}>
              {liked?"❤️":"🤍"} {likes} {likes===1?"like":"likes"}
            </button>
            <button className="action-btn">💬 {comments.length} comments</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3 style={{fontFamily:"'Lora',serif",marginBottom:20,fontSize:18}}>Comments</h3>
          <div className="form-group" style={{display:"flex",gap:10,marginBottom:8}}>
            <textarea
              placeholder="Write a supportive comment…"
              value={newComment}
              onChange={e=>setNewComment(e.target.value)}
              style={{minHeight:72}}
            />
          </div>
          <button className="btn btn-primary btn-sm mb-4" onClick={addComment} disabled={!newComment.trim()}>
            Send 💬
          </button>
          <hr className="divider"/>
          {comments.map(c=>(
            <div key={c.id} className="comment-item">
              <div className="comment-avatar">{c.avatar}</div>
              <div className="comment-body" style={{flex:1}}>
                <div className="comment-author">{c.author}</div>
                <div className="comment-text">{c.text}</div>
                <div className="comment-time">{c.time}</div>
              </div>
              {c.author==="You" && (
                <button className="comment-del" onClick={()=>delComment(c.id)}>🗑</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Groups ──
function GroupsPage() {
  const [groups, setGroups] = useState(MOCK.groups);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({name:"",desc:"",category:"General"});
  const [tab, setTab] = useState("all");

  const toggleJoin = id => {
    setGroups(gs=>gs.map(g=>g.id===id?{...g,joined:!g.joined,members:g.joined?g.members-1:g.members+1}:g));
  };

  const createGroup = () => {
    if (!newGroup.name.trim()) return;
    const g = { id:Date.now(), ...newGroup, members:1, emoji:"🌟", joined:true };
    setGroups(gs=>[g,...gs]);
    setNewGroup({name:"",desc:"",category:"General"});
    setShowCreate(false);
  };

  const display = tab==="joined" ? groups.filter(g=>g.joined) : groups;

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 style={{fontFamily:"'Lora',serif",fontSize:26,color:"var(--stone-dark)"}}>Support Groups</h1>
          <p className="text-muted text-sm mt-2">Find your community</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowCreate(true)}>+ Create Group</button>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab==="all"?"active":""}`} onClick={()=>setTab("all")}>All Groups</button>
        <button className={`tab-btn ${tab==="joined"?"active":""}`} onClick={()=>setTab("joined")}>My Groups</button>
      </div>

      <div className="grid-3">
        {display.map(g=>(
          <div key={g.id} className="card group-card">
            <div className="group-icon">{g.emoji}</div>
            <h3>{g.name}</h3>
            <p>{g.desc}</p>
            <div className="group-meta">
              <span>👥 {g.members} members</span>
              <span>📂 {g.category}</span>
            </div>
            <div className="group-actions">
              <button
                className={`btn btn-sm ${g.joined?"btn-danger":"btn-primary"}`}
                onClick={()=>toggleJoin(g.id)}
              >
                {g.joined?"Leave":"Join"}
              </button>
              {g.joined && <button className="btn btn-sm btn-secondary">Open</button>}
            </div>
          </div>
        ))}
      </div>

      {display.length===0 && (
        <div className="empty-state"><div className="empty-icon">🌱</div><h3>No groups yet</h3><p>Create or join a group to get started.</p></div>
      )}

      {showCreate && (
        <Modal
          title="Create Support Group"
          onClose={()=>setShowCreate(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={()=>setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={createGroup}>Create Group</button>
          </>}
        >
          <div className="form-group">
            <label>Group Name</label>
            <input placeholder="e.g. Morning Mindfulness" value={newGroup.name} onChange={e=>setNewGroup(g=>({...g,name:e.target.value}))} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea placeholder="What is this group about?" value={newGroup.desc} onChange={e=>setNewGroup(g=>({...g,desc:e.target.value}))} style={{minHeight:80}} />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={newGroup.category} onChange={e=>setNewGroup(g=>({...g,category:e.target.value}))}>
              {["General","Anxiety","Depression","Trauma","Grief","Mindfulness","Recovery"].map(c=>(
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Sessions ──
function SessionsPage() {
  const [sessions, setSessions] = useState(MOCK.sessions);
  const [showBook, setShowBook] = useState(false);
  const [form, setForm] = useState({therapist:"",date:"",time:"",notes:""});
  const [booking, setBooking] = useState(false);
  const [tab, setTab] = useState("upcoming");

  const therapists = ["Dr. Sara Hassan (CBT)","Dr. Khaled Nour (Trauma)","Dr. Rana Youssef (Mindfulness)","Dr. Amr Badr (Group Therapy)"];

  const book = async () => {
    if (!form.therapist||!form.date||!form.time) return;
    setBooking(true);
    await new Promise(r=>setTimeout(r,800));
    const s = {
      id:Date.now(),
      therapist:form.therapist.split("(")[0].trim(),
      specialty:form.therapist.match(/\((.+)\)/)?.[1]||"General",
      date:form.date, time:form.time, status:"pending", notes:form.notes
    };
    setSessions(ss=>[s,...ss]);
    setForm({therapist:"",date:"",time:"",notes:""});
    setBooking(false);
    setShowBook(false);
  };

  const updateStatus = (id, status) => {
    setSessions(ss=>ss.map(s=>s.id===id?{...s,status}:s));
  };

  const upcoming = sessions.filter(s=>s.status!=="cancelled");
  const past = sessions.filter(s=>s.status==="cancelled");
  const display = tab==="upcoming"?upcoming:past;

  const statusConfig = {
    pending: { label:"Pending", cls:"badge-pending" },
    confirmed: { label:"Confirmed", cls:"badge-confirmed" },
    cancelled: { label:"Cancelled", cls:"badge-cancelled" },
    delayed: { label:"Delayed", cls:"badge-delayed" },
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 style={{fontFamily:"'Lora',serif",fontSize:26}}>Therapy Sessions</h1>
          <p className="text-muted text-sm mt-2">Book and manage your sessions</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowBook(true)}>+ Book Session</button>
      </div>

      <div className="tabs" style={{maxWidth:360}}>
        <button className={`tab-btn ${tab==="upcoming"?"active":""}`} onClick={()=>setTab("upcoming")}>Upcoming ({upcoming.length})</button>
        <button className={`tab-btn ${tab==="past"?"active":""}`} onClick={()=>setTab("past")}>Cancelled ({past.length})</button>
      </div>

      {display.map(s=>{
        const sc = statusConfig[s.status];
        return (
          <div key={s.id} className="card session-card">
            <div className="session-header">
              <div>
                <div style={{fontFamily:"'Lora',serif",fontSize:18,color:"var(--stone-dark)",fontWeight:600}}>{s.therapist}</div>
                <div style={{fontSize:13,color:"var(--text-soft)",marginTop:2}}>{s.specialty}</div>
              </div>
              <span className={`session-badge ${sc.cls}`}>{sc.label}</span>
            </div>
            <div className="session-info">
              <div className="session-field"><label>Date</label><p>📅 {s.date}</p></div>
              <div className="session-field"><label>Time</label><p>🕐 {s.time}</p></div>
              {s.notes && <div className="session-field" style={{gridColumn:"span 2"}}><label>Notes</label><p>{s.notes}</p></div>}
            </div>
            {s.status!=="cancelled" && (
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {s.status==="pending" && (
                  <button className="btn btn-primary btn-sm" onClick={()=>updateStatus(s.id,"confirmed")}>✓ Confirm</button>
                )}
                {s.status!=="delayed" && (
                  <button className="btn btn-secondary btn-sm" onClick={()=>updateStatus(s.id,"delayed")}>⏱ Delay</button>
                )}
                <button className="btn btn-danger btn-sm" onClick={()=>updateStatus(s.id,"cancelled")}>✕ Cancel</button>
              </div>
            )}
          </div>
        );
      })}

      {display.length===0 && (
        <div className="empty-state"><div className="empty-icon">🗓️</div><h3>No sessions here</h3><p>Book a session to get started.</p></div>
      )}

      {showBook && (
        <Modal
          title="Book a Therapy Session"
          onClose={()=>setShowBook(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={()=>setShowBook(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={book} disabled={booking||!form.therapist||!form.date||!form.time}>
              {booking?"Booking…":"Confirm Booking"}
            </button>
          </>}
        >
          <div className="form-group">
            <label>Select Therapist</label>
            <select value={form.therapist} onChange={e=>setForm(f=>({...f,therapist:e.target.value}))}>
              <option value="">Choose a therapist…</option>
              {therapists.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} min={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="form-group">
              <label>Time</label>
              <select value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))}>
                <option value="">Select…</option>
                {["9:00 AM","10:00 AM","11:00 AM","1:00 PM","2:00 PM","3:00 PM","4:00 PM"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Session Notes (optional)</label>
            <textarea placeholder="What would you like to discuss?" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={{minHeight:80}} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Tests ──
function TestsPage() {
  const [phase, setPhase] = useState("intro"); // intro | test | result
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);

  const setAnswer = (qid, idx) => setAnswers(a=>({...a,[qid]:idx}));

  const submit = async () => {
    setSubmitting(true);
    await new Promise(r=>setTimeout(r,1000));
    const total = Object.values(answers).reduce((s,v)=>s+v,0);
    const max = MOCK.questions.length * 3;
    setScore(Math.round((total/max)*100));
    setSubmitting(false);
    setPhase("result");
  };

  const allAnswered = MOCK.questions.every(q=>answers[q.id]!==undefined);

  const getResult = s => {
    if (s<25) return { label:"Minimal", desc:"Your responses suggest minimal stress levels. Keep maintaining healthy habits!", color:"var(--sage)" };
    if (s<50) return { label:"Mild", desc:"You're experiencing some stress. Consider mindfulness practices and self-care.", color:"var(--sand)" };
    if (s<75) return { label:"Moderate", desc:"Moderate stress detected. We recommend speaking with a mental health professional.", color:"var(--sand)" };
    return { label:"Severe", desc:"High stress levels detected. Please consider booking a session with one of our therapists.", color:"var(--blush)" };
  };

  if (phase==="intro") return (
    <div style={{maxWidth:600,margin:"0 auto"}}>
      <div className="card">
        <div className="card-body" style={{textAlign:"center",padding:"48px 40px"}}>
          <div style={{fontSize:56,marginBottom:20}}>🧠</div>
          <h2 style={{fontFamily:"'Lora',serif",fontSize:26,marginBottom:12}}>Psychological Wellbeing Assessment</h2>
          <p style={{color:"var(--text-soft)",lineHeight:1.7,marginBottom:8}}>
            This evidence-based questionnaire (adapted from PHQ-9) helps measure your current mental wellness levels.
          </p>
          <p style={{fontSize:13,color:"var(--text-soft)",marginBottom:32}}>
            Takes about 3–5 minutes · Results are private · Not a clinical diagnosis
          </p>
          <div style={{display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap",marginBottom:32}}>
            {["5 Questions","3 min","Anonymous","Evidence-based"].map(t=>(
              <span key={t} style={{background:"var(--sage-pale)",color:"var(--sage)",borderRadius:20,padding:"5px 14px",fontSize:12,fontWeight:500}}>{t}</span>
            ))}
          </div>
          <button className="btn btn-primary" style={{padding:"12px 36px",fontSize:15}} onClick={()=>setPhase("test")}>
            Start Assessment
          </button>
        </div>
      </div>
    </div>
  );

  if (phase==="result") {
    const r = getResult(score);
    return (
      <div style={{maxWidth:540,margin:"0 auto"}}>
        <div className="card result-card">
          <div style={{fontSize:48,marginBottom:16}}>✨</div>
          <div className="result-score" style={{color:r.color}}>{score}%</div>
          <div className="result-label">Stress Level: {r.label}</div>
          <div className="result-bar" style={{margin:"16px auto 20px",maxWidth:320}}>
            <div className="result-fill" style={{width:`${score}%`,background:`linear-gradient(90deg,var(--sage),${r.color})`}}/>
          </div>
          <p className="result-desc">{r.desc}</p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn btn-primary" onClick={()=>alert("Navigating to book a session…")}>Book a Session</button>
            <button className="btn btn-secondary" onClick={()=>{setPhase("intro");setAnswers({});}}>Retake Test</button>
          </div>
        </div>
      </div>
    );
  }

  const answered = Object.keys(answers).length;

  return (
    <div style={{maxWidth:680}}>
      <div className="page-header">
        <h1>Wellbeing Assessment</h1>
        <p className="text-muted">Over the last 2 weeks, how often have you experienced the following?</p>
      </div>

      <div style={{marginBottom:24}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--text-soft)",marginBottom:6}}>
          <span>{answered}/{MOCK.questions.length} answered</span>
          <span>{Math.round((answered/MOCK.questions.length)*100)}%</span>
        </div>
        <div className="result-bar"><div className="result-fill" style={{width:`${(answered/MOCK.questions.length)*100}%`}}/></div>
      </div>

      {MOCK.questions.map((q,qi)=>(
        <div key={q.id} className="card question-card">
          <div className="question-num">Question {qi+1} of {MOCK.questions.length}</div>
          <div className="question-text">{q.text}</div>
          <div className="options-grid">
            {q.options.map((opt,oi)=>(
              <button
                key={oi}
                className={`option-btn ${answers[q.id]===oi?"selected":""}`}
                onClick={()=>setAnswer(q.id,oi)}
              >
                <div className="option-radio"/>
                <span>{opt}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div style={{textAlign:"right",marginTop:8}}>
        <button className="btn btn-primary" style={{padding:"12px 32px"}} onClick={submit} disabled={!allAnswered||submitting}>
          {submitting?"Analyzing…":"Submit Assessment"}
        </button>
      </div>
    </div>
  );
}

// ── Feedback ──
function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState(MOCK.feedbacks);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({therapist:"",rating:5,text:""});
  const [hover, setHover] = useState(0);

  const therapists = ["Dr. Sara Hassan","Dr. Khaled Nour","Dr. Rana Youssef","Dr. Amr Badr"];

  const submit = () => {
    if (!form.therapist||!form.text.trim()) return;
    if (editId) {
      setFeedbacks(fs=>fs.map(f=>f.id===editId?{...f,...form,date:"May 2026"}:f));
      setEditId(null);
    } else {
      setFeedbacks(fs=>[{id:Date.now(),...form,date:"May 2026",author:"You"},...fs]);
    }
    setForm({therapist:"",rating:5,text:""});
    setShowAdd(false);
  };

  const startEdit = f => {
    setForm({therapist:f.therapist,rating:f.rating,text:f.text});
    setEditId(f.id);
    setShowAdd(true);
  };

  const del = id => setFeedbacks(fs=>fs.filter(f=>f.id!==id));

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 style={{fontFamily:"'Lora',serif",fontSize:26}}>Therapist Feedback</h1>
          <p className="text-muted text-sm mt-2">Share your experience to help others</p>
        </div>
        <button className="btn btn-primary" onClick={()=>{setShowAdd(true);setEditId(null);setForm({therapist:"",rating:5,text:""});}}>
          + Add Feedback
        </button>
      </div>

      <div style={{maxWidth:680}}>
        {feedbacks.map(f=>(
          <div key={f.id} className="card feedback-card">
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
              <div>
                <div style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:600,color:"var(--stone-dark)"}}>{f.therapist}</div>
                <div style={{fontSize:12,color:"var(--text-soft)",marginTop:2}}>by {f.author} · {f.date}</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {f.author==="You" && <>
                  <button className="btn btn-sm btn-secondary" onClick={()=>startEdit(f)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={()=>del(f.id)}>Delete</button>
                </>}
              </div>
            </div>
            <div className="rating-display mb-2">
              {"★".repeat(f.rating)}{"☆".repeat(5-f.rating)}
            </div>
            <p style={{fontSize:14,color:"var(--text)",lineHeight:1.6,fontStyle:"italic"}}>"{f.text}"</p>
          </div>
        ))}

        {feedbacks.length===0 && (
          <div className="empty-state"><div className="empty-icon">⭐</div><h3>No feedback yet</h3><p>Be the first to share your experience.</p></div>
        )}
      </div>

      {showAdd && (
        <Modal
          title={editId?"Edit Feedback":"Add Feedback"}
          onClose={()=>{setShowAdd(false);setEditId(null);}}
          footer={<>
            <button className="btn btn-secondary" onClick={()=>{setShowAdd(false);setEditId(null);}}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={!form.therapist||!form.text.trim()}>
              {editId?"Save Changes":"Submit Feedback"}
            </button>
          </>}
        >
          <div className="form-group">
            <label>Therapist</label>
            <select value={form.therapist} onChange={e=>setForm(f=>({...f,therapist:e.target.value}))}>
              <option value="">Select therapist…</option>
              {therapists.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Rating</label>
            <div className="stars">
              {[1,2,3,4,5].map(n=>(
                <span key={n} className="star"
                  style={{color:n<=(hover||form.rating)?"#f4b942":"var(--mist)",fontSize:28}}
                  onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)}
                  onClick={()=>setForm(f=>({...f,rating:n}))}
                >★</span>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Your Experience</label>
            <textarea placeholder="Share how your sessions went…" value={form.text} onChange={e=>setForm(f=>({...f,text:e.target.value}))} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Admin ──
function AdminPage() {
  const [users, setUsers] = useState(MOCK.users);
  const [tab, setTab] = useState("users");

  const toggleBan = id => {
    setUsers(us=>us.map(u=>u.id===id?{...u,status:u.status==="active"?"banned":"active"}:u));
  };

  const stats = [
    { icon:"👥", num:users.length, label:"Total Users" },
    { icon:"📝", num:42, label:"Total Posts" },
    { icon:"🗓️", num:18, label:"Sessions Booked" },
    { icon:"🧠", num:7, label:"Tests Taken" },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 style={{fontFamily:"'Lora',serif",fontSize:26}}>Admin Dashboard</h1>
        <p className="text-muted">Platform management and oversight</p>
      </div>

      <div className="grid-2 mb-6" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        {stats.map(s=>(
          <div key={s.label} className="card stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="tabs" style={{maxWidth:480}}>
        {[["users","Users"],["questions","Questions"],["cvs","CVs & Apps"],["reports","Reports"]].map(([k,v])=>(
          <button key={k} className={`tab-btn ${tab===k?"active":""}`} onClick={()=>setTab(k)}>{v}</button>
        ))}
      </div>

      {tab==="users" && (
        <div className="card">
          <div className="card-body" style={{padding:0}}>
            <div style={{padding:"20px 24px 12px",borderBottom:"1px solid var(--mist)"}}>
              <h3 style={{fontFamily:"'Lora',serif",fontSize:17}}>User Management</h3>
            </div>
            <div style={{overflowX:"auto"}}>
              <table className="data-table">
                <thead>
                  <tr><th>User</th><th>Email</th><th>Posts</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map(u=>(
                    <tr key={u.id}>
                      <td><strong>{u.name}</strong></td>
                      <td style={{color:"var(--text-soft)"}}>{u.email}</td>
                      <td>{u.posts}</td>
                      <td style={{color:"var(--text-soft)"}}>{u.joined}</td>
                      <td><span className={`status-chip ${u.status==="active"?"chip-active":"chip-banned"}`}>{u.status}</span></td>
                      <td>
                        <button
                          className={`btn btn-sm ${u.status==="active"?"btn-danger":"btn-primary"}`}
                          onClick={()=>toggleBan(u.id)}
                        >
                          {u.status==="active"?"Ban":"Unban"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab==="questions" && (
        <div style={{maxWidth:680}}>
          {MOCK.questions.map((q,i)=>(
            <div key={q.id} className="card" style={{padding:20,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:11,color:"var(--sage)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Q{i+1}</div>
                  <p style={{fontSize:15,color:"var(--stone-dark)",lineHeight:1.5}}>{q.text}</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
                    {q.options.map((o,oi)=>(
                      <span key={oi} style={{background:"var(--sand-pale)",color:"var(--stone)",borderRadius:6,padding:"3px 10px",fontSize:12}}>{o}</span>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",gap:6,marginLeft:16,flexShrink:0}}>
                  <button className="btn btn-sm btn-secondary">Edit</button>
                  <button className="btn btn-sm btn-danger">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="cvs" && (
        <div className="card">
          <div className="card-body">
            <h3 style={{fontFamily:"'Lora',serif",marginBottom:20}}>Therapist Applications</h3>
            {[
              { name:"Dr. Fatima Al-Rashid", specialty:"CBT & Anxiety", exp:"8 years", status:"pending" },
              { name:"Dr. Hassan Mostafa", specialty:"Trauma & PTSD", exp:"12 years", status:"approved" },
              { name:"Dr. Noura Ibrahim", specialty:"Child Psychology", exp:"5 years", status:"pending" },
            ].map((cv,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0",borderBottom:"1px solid var(--mist)"}}>
                <div>
                  <div style={{fontWeight:600,color:"var(--stone-dark)"}}>{cv.name}</div>
                  <div style={{fontSize:13,color:"var(--text-soft)",marginTop:2}}>{cv.specialty} · {cv.exp} experience</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span className={`status-chip ${cv.status==="approved"?"chip-active":"badge-pending"}`}>{cv.status}</span>
                  {cv.status==="pending" && <>
                    <button className="btn btn-sm btn-primary">Approve</button>
                    <button className="btn btn-sm btn-danger">Reject</button>
                  </>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="reports" && (
        <div style={{maxWidth:680}}>
          {[
            { reporter:"Layla M.", target:"Post #14", reason:"Harmful content", date:"May 8" },
            { reporter:"Omar S.", target:"User: anon99", reason:"Harassment in comments", date:"May 7" },
            { reporter:"System", target:"Session #22", reason:"No-show therapist", date:"May 5" },
          ].map((r,i)=>(
            <div key={i} className="card" style={{padding:20,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontWeight:600,color:"var(--stone-dark)",marginBottom:4}}>{r.target}</div>
                  <div style={{fontSize:13,color:"var(--text-soft)"}}>Reported by {r.reporter} · {r.date}</div>
                  <div style={{marginTop:8,fontSize:14,color:"var(--blush)",background:"#fdf0ef",display:"inline-block",padding:"3px 10px",borderRadius:6}}>⚠️ {r.reason}</div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button className="btn btn-sm btn-secondary">Review</button>
                  <button className="btn btn-sm btn-danger">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
const NAV = [
  { id:"home", icon:"🏠", label:"Feed" },
  { id:"create-post", icon:"✏️", label:"New Post" },
  null, // divider
  { id:"groups", icon:"👥", label:"Support Groups" },
  { id:"sessions", icon:"🗓️", label:"Sessions" },
  { id:"tests", icon:"🧠", label:"Wellness Test" },
  { id:"feedback", icon:"⭐", label:"Feedback" },
  null,
  { id:"admin", icon:"⚙️", label:"Admin", badge:"!" },
];

const QUOTES = [
  "You are braver than you believe.",
  "Healing is not linear, and that's okay.",
  "Your feelings are valid.",
  "Small steps still move you forward.",
];

export default function App() {
  const [page, setPage] = useState("home");
  const [pageData, setPageData] = useState(null);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random()*QUOTES.length)]);

  const navigate = (p, data=null) => {
    setPage(p);
    setPageData(data);
    window.scrollTo(0,0);
  };

  const titles = {
    home:"Community Feed", "create-post":"New Post", "post-detail":"Post Details",
    groups:"Support Groups", sessions:"Sessions", tests:"Wellness Test",
    feedback:"Feedback", admin:"Admin Dashboard"
  };

  const renderPage = () => {
    switch(page) {
      case "home": return <HomePage navigate={navigate}/>;
      case "create-post": return <CreatePostPage navigate={navigate}/>;
      case "post-detail": return <PostDetailPage post={pageData} navigate={navigate}/>;
      case "groups": return <GroupsPage/>;
      case "sessions": return <SessionsPage/>;
      case "tests": return <TestsPage/>;
      case "feedback": return <FeedbackPage/>;
      case "admin": return <AdminPage/>;
      default: return <HomePage navigate={navigate}/>;
    }
  };

  return (
    <>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <h2>🌿 Serenity</h2>
            <span>Mental Health Platform</span>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-section-title">Navigation</div>
            {NAV.map((item,i) => {
              if (!item) return <div key={i} style={{height:8}}/>;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${page===item.id||page==="post-detail"&&item.id==="home"?"active":""}`}
                  onClick={()=>navigate(item.id)}
                >
                  <span className="icon">{item.icon}</span>
                  {item.label}
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </button>
              );
            })}
          </nav>
          <div className="sidebar-user">
            <div className="user-avatar">AK</div>
            <div className="user-info">
              <div className="name">Amira K.</div>
              <div className="role">Member</div>
            </div>
            <button className="logout-btn" title="Sign out">↗</button>
          </div>
        </aside>

        <main className="main-content">
          <header className="topbar">
            <span className="topbar-title">
              {titles[page]?.split(" ").map((w,i)=>(
                <span key={i} style={i===0?{}:{color:"var(--sage)"}}>{i>0?" ":""}{w}</span>
              ))}
            </span>
            <div className="topbar-right">
              <span style={{fontSize:12,color:"var(--text-soft)",fontStyle:"italic",display:"block",maxWidth:280,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                "{quote}"
              </span>
              <div className="user-avatar" style={{width:36,height:36}}>AK</div>
            </div>
          </header>

          <div className="page-content">
            {renderPage()}
          </div>
        </main>
      </div>
    </>
  );
}