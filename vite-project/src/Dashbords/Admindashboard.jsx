import { useState, useEffect } from "react";
import {
  FiUsers,
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiEdit3,
  FiEye,
  FiShield,
  FiUserX,
  FiUserCheck,
  FiHelpCircle,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
  FiClipboard,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import axios from "axios";

import { toast } from "react-toastify";
import "./AdminDashboard.css";
import AdminGroupsPanel from "./Groups/Admingroups";

const BASE_URL = "https://mind-space-ov3r.onrender.com";

function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `dash ${token}` };
}

/* ─── Stat Card ─── */
function StatCard({ icon, label, value, color }) {
  return (
    <div className="admin-stat-card" style={{ "--accent": color }}>
      <div className="stat-icon-wrap">{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value ?? "—"}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

/* ─── Section Header ─── */
function SectionHeader({ icon, title, count }) {
  return (
    <div className="admin-section-header">
      <span className="section-icon">{icon}</span>
      <h2>{title}</h2>
      {count !== undefined && <span className="section-badge">{count}</span>}
    </div>
  );
}

/* ─── USERS PANEL ─── */
function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banDuration, setBanDuration] = useState({});

useEffect(() => {
  axios
    .get(`${BASE_URL}/admin/view-users`, { headers: authHeader() })
    .then((r) => {
      console.log("USERS DATA:", r.data);
      setUsers(r.data?.data || r.data || []);
    })
    .catch(console.log)
    .finally(() => setLoading(false));
}, []);

  const banUser = async (id) => {
    const duration = banDuration[id] || "10";
    try {
      await axios.delete(`${BASE_URL}/admin/${id}/ban-account`, {
        headers: authHeader(),
        data: { duration },
      });
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, bannedUntil : true } : u))
      );
    } catch (e) {
      console.log(e.response?.data || e);
    }
  };

  const unbanUser = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/admin/${id}/unban-account`, {
        headers: authHeader(),
      });
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, bannedUntil : false } : u))
      );
    } catch (e) {
      console.log(e.response?.data || e);
    }
  };

  if (loading) return <div className="panel-loading">Loading users…</div>;

  return (
    <div className="admin-panel">
      <SectionHeader icon={<FiUsers />} title="Users" count={users.length} />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className={u.bannedUntil  ? "row-banned" : ""}>
                <td>
                  <div className="user-cell">
                    {u.pfp?.secure_url ? (
                      <img src={u.pfp.secure_url} className="table-avatar" alt="" />
                    ) : (
                      <div className="table-avatar-placeholder">
                        {u.userName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                    <span>{u.userName}</span>
                  </div>
                </td>
                <td className="muted">{u.email}</td>
                <td>
                  <span className={`role-chip role-${u.role}`}>{u.role}</span>
                </td>
                <td>
                  {u.bannedUntil  ? (
                    <span className="status-chip banned">Banned</span>
                  ) : (
                    <span className="status-chip active">Active</span>
                  )}
                </td>
                <td>
                  <div className="action-row">
                    {!u.bannedUntil  ? (
                      <>
                        <input
                          type="number"
                          className="ban-duration-input"
                          placeholder="Days"
                          min="1"
                          value={banDuration[u._id] || ""}
                          onChange={(e) =>
                            setBanDuration((prev) => ({
                              ...prev,
                              [u._id]: e.target.value,
                            }))
                          }
                        />
                        <button
                          className="icon-btn danger"
                          title="Ban user"
                          onClick={() => banUser(u._id)}
                        >
                          <FiUserX />
                        </button>
                      </>
                    ) : (
                      <button
                        className="icon-btn success"
                        title="Unban user"
                        onClick={() => unbanUser(u._id)}
                      >
                        <FiUserCheck />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── CVS PANEL ─── */
function CVsPanel() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/admin/view-cvs`, { headers: authHeader() })
      .then((r) => setCvs(r.data?.data || r.data || []))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  const judge = async (therapistId, decision) => {
    try {
      await axios.patch(
        `${BASE_URL}/admin/judge-cv/${therapistId}`,
        { decision },
        { headers: authHeader() }
      );
      setCvs((prev) =>
        prev.map((c) =>
          (c.therapistId?._id || c._id) === therapistId
            ? { ...c, status: decision }
            : c
        )
      );
    } catch (e) {
      console.log(e.response?.data || e);
    }
  };

  if (loading) return <div className="panel-loading">Loading CVs…</div>;

  return (
    <div className="admin-panel">
      <SectionHeader icon={<FiFileText />} title="Therapist CVs" count={cvs.length} />
      {cvs.length === 0 ? (
        <div className="empty-panel">No CVs submitted yet.</div>
      ) : (
        <div className="cv-grid">
          {cvs.map((cv, i) => {
            const therapistId = cv.therapistId?._id || cv._id;
            const name = cv.therapistId?.userName || cv.userName || "Therapist";
            const email = cv.therapistId?.email || cv.email || "";
            const cvUrl = cv.cv?.secure_url || cv.cvUrl || null;
            const status = cv.status || "pending";

            return (
              <div key={i} className={`cv-card status-${status}`}>
                <div className="cv-card-header">
                  <div className="cv-avatar-wrap">
                    {cv.therapistId?.pfp?.secure_url ? (
                      <img src={cv.therapistId.pfp.secure_url} alt="" />
                    ) : (
                      <div className="cv-avatar-placeholder">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="cv-name">Dr. {name}</div>
                    <div className="cv-email muted">{email}</div>
                  </div>
                  <span className={`status-chip ${status}`}>{status}</span>
                </div>

                {cvUrl && (
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="cv-link"
                  >
                    <FiEye /> View CV
                  </a>
                )}

                {status === "pending" && (
                  <div className="cv-actions">
                    <button
                      className="cv-btn accept"
                      onClick={() => judge(therapistId, "accepted")}
                    >
                      <FiCheckCircle /> Accept
                    </button>
                    <button
                      className="cv-btn reject"
                      onClick={() => judge(therapistId, "rejected")}
                    >
                      <FiXCircle /> Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── REPORTS PANEL ─── */
function ReportsPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/admin/reports`, { headers: authHeader() })
      .then((r) => setReports(r.data?.data || r.data || []))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="panel-loading">Loading reports…</div>;

  return (
    <div className="admin-panel">
      <SectionHeader
        icon={<FiAlertCircle />}
        title="Reports"
        count={reports.length}
      />
      {reports.length === 0 ? (
        <div className="empty-panel">No reports yet.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reporter</th>
                <th>Reported</th>
                <th>Reason</th>
                <th>Content</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={i}>
                  <td>{r.reporterId?.userName || r.reporter?.userName || "—"}</td>
                  <td>{r.reportedId?.userName || r.reported?.userName || "—"}</td>
                  <td>
                    <span className="role-chip role-patient">{r.reason}</span>
                  </td>
                  <td className="muted">{r.content}</td>
                  <td className="muted">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



  

/* ─── QUESTIONS PANEL ─── */
function QuestionsPanel() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    type: "stress",
    answers: [
      { answer: "", points: 5 },
      { answer: "", points: 10 },
      { answer: "", points: 15 },
      { answer: "", points: 20 },
      { answer: "", points: 25 },
    ],
  });

  const fetchQuestions = () => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/admin/questions`, { headers: authHeader() })
      .then((r) => setQuestions(r.data?.data || r.data || []))
      .catch(console.log)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const deleteQuestion = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/admin/delete-question/${id}`, {
        headers: authHeader(),
      });
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (e) {
      console.log(e.response?.data || e);
    }
  };

  const saveEdit = async (id) => {
    try {
      await axios.patch(
        `${BASE_URL}/admin/edit-question/${id}`,
        { question: editText },
        { headers: authHeader() }
      );
      setQuestions((prev) =>
        prev.map((q) => (q._id === id ? { ...q, question: editText } : q))
      );
      setEditingId(null);
    } catch (e) {
      console.log(e.response?.data || e);
    }
  };

  const addQuestions = async () => {
    if (!newQuestion.question.trim()) return;
    try {
      await axios.post(
        `${BASE_URL}/admin/add-questions`,
        { questions: [newQuestion] },
        { headers: authHeader() }
      );
      setShowAddForm(false);
      setNewQuestion({
        question: "",
        type: "stress",
        answers: [
          { answer: "", points: 5 },
          { answer: "", points: 10 },
          { answer: "", points: 15 },
          { answer: "", points: 20 },
          { answer: "", points: 25 },
        ],
      });
      fetchQuestions();
    } catch (e) {
      console.log(e.response?.data || e);
    }
  };

  if (loading) return <div className="panel-loading">Loading questions…</div>;

  return (
    <div className="admin-panel">
      <div className="admin-section-header">
        <span className="section-icon"><FiHelpCircle /></span>
        <h2>Questions</h2>
        {questions.length !== undefined && (
          <span className="section-badge">{questions.length}</span>
        )}
        <button
          className="add-question-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <FiPlus /> Add Question
        </button>
      </div>

      {showAddForm && (
        <div className="add-question-form">
          <h4>New Question</h4>
          <input
            className="admin-input"
            placeholder="Question text..."
            value={newQuestion.question}
            onChange={(e) =>
              setNewQuestion((p) => ({ ...p, question: e.target.value }))
            }
          />
          <select
            className="admin-input"
            value={newQuestion.type}
            onChange={(e) =>
              setNewQuestion((p) => ({ ...p, type: e.target.value }))
            }
          >
            <option value="stress">Stress</option>
            <option value="anxiety">Anxiety</option>
            <option value="depression">Depression</option>
          </select>
          <div className="answers-grid">
            {newQuestion.answers.map((ans, i) => (
              <div key={i} className="answer-row">
                <input
                  className="admin-input answer-input"
                  placeholder={`Answer ${i + 1}`}
                  value={ans.answer}
                  onChange={(e) => {
                    const updated = [...newQuestion.answers];
                    updated[i] = { ...updated[i], answer: e.target.value };
                    setNewQuestion((p) => ({ ...p, answers: updated }));
                  }}
                />
                <input
                  type="number"
                  className="admin-input points-input"
                  value={ans.points}
                  onChange={(e) => {
                    const updated = [...newQuestion.answers];
                    updated[i] = {
                      ...updated[i],
                      points: Number(e.target.value),
                    };
                    setNewQuestion((p) => ({ ...p, answers: updated }));
                  }}
                />
              </div>
            ))}
          </div>
          <div className="form-actions">
            <button className="cv-btn accept" onClick={addQuestions}>
              <FiCheckCircle /> Save
            </button>
            <button
              className="cv-btn reject"
              onClick={() => setShowAddForm(false)}
            >
              <FiXCircle /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="questions-list">
        {questions.map((q) => (
          <div key={q._id} className="question-card">
            <div className="question-header">
              {editingId === q._id ? (
                <input
                  className="admin-input question-edit-input"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
              ) : (
                <p className="question-text">{q.question}</p>
              )}
              <span className={`role-chip role-${q.type}`}>{q.type}</span>
              <div className="action-row">
                {editingId === q._id ? (
                  <>
                    <button
                      className="icon-btn success"
                      onClick={() => saveEdit(q._id)}
                    >
                      <FiCheckCircle />
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => setEditingId(null)}
                    >
                      <FiXCircle />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="icon-btn"
                      title="Edit"
                      onClick={() => {
                        setEditingId(q._id);
                        setEditText(q.question);
                      }}
                    >
                      <FiEdit3 />
                    </button>
                    <button
                      className="icon-btn danger"
                      title="Delete"
                      onClick={() => deleteQuestion(q._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </>
                )}
              </div>
            </div>
            {q.answers && (
              <div className="answers-preview">
                {q.answers.map((a, i) => (
                  <span key={i} className="answer-chip">
                    {a.answer} <em>({a.points}pts)</em>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── TABS ─── */
const TABS = [
  { id: "users", label: "Users", icon: <FiUsers /> },
  { id: "cvs", label: "CVs", icon: <FiClipboard /> },
  { id: "reports", label: "Reports", icon: <FiAlertCircle /> },
  { id: "questions", label: "Questions", icon: <FiHelpCircle /> },
  { id: "groups", label: "groups", icon: <FiUsers /> },

];

/* ─── MAIN COMPONENT ─── */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
 const navigate = useNavigate();
 const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "https://mind-space-ov3r.onrender.com/auth/logout",
        { flag: "logoutFromAllDevices" },
        { headers: { Authorization: `dash ${token}` } }
      );
      toast.success("تم تسجيل الخروج بنجاح 👋");
    } catch (err) {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setTimeout(() => navigate("/login"), 1000);
  };

  return (
    <div className="admin-container">
      {/* Sidebar Tabs */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <FiShield className="brand-icon" />
          <span>Admin Panel</span>
        </div>
        <nav className="admin-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`admin-nav-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
          <li className="log-out">
                            <button onClick={handleLogout} aria-label="Logout">
                              <span>
                                <MdLogout />
                              </span>
                              <h5>Log Out</h5>
                            </button>
                          </li>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-top-bar">
          <h1 className="admin-page-title">
            {TABS.find((t) => t.id === activeTab)?.icon}{" "}
            {TABS.find((t) => t.id === activeTab)?.label}
          </h1>
        </header>

        <div className="admin-content">
          {activeTab === "users" && <UsersPanel />}
          {activeTab === "cvs" && <CVsPanel />}
          {activeTab === "reports" && <ReportsPanel />}
          {activeTab === "questions" && <QuestionsPanel />}
          {activeTab === "groups" && <AdminGroupsPanel />}
          
        </div>
      </main>
    </div>
  );
}