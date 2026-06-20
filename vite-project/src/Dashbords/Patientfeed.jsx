import { useState, useRef, useEffect } from "react";
import {
  FiSearch,
  FiFilter,
  FiHeart,
  FiMessageCircle,
  FiSend,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import "./Patientfeed.css";
import axios from "axios";
import { useLang } from "../i18n/LanguageContext";
const BASE_URL = "https://mind-space-ov3r.onrender.com";

/* ─── Helper Functions ─── */
function getUserIdFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || null;
  } catch {
    return null;
  }
}

function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `dash ${token}` };
}

function formatTime(date) {
  const now = new Date();
  const postDate = new Date(date);
  const diffInSeconds = Math.floor((now - postDate) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return postDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ─── Avatar Component ─── */
function Avatar({ initials, color = "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)", size = 44 }) {
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </div>
  );
}

/* ─── Doctor Avatar ─── */
function DoctorAvatar({ doctor, size = 44 }) {
  if (doctor?.pfp?.secure_url) {
    return (
      <img
        src={doctor.pfp.secure_url}
        alt={doctor.userName}
        className="avatar-img"
        style={{ width: size, height: size }}
      />
    );
  }
  const initial = doctor?.userName?.charAt(0)?.toUpperCase() || "D";
const colors = [
    "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
    "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
    "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
    "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)",
];
  const hash = doctor?.userName?.charCodeAt(0) || 0;
  return <Avatar initials={initial} color={colors[hash % colors.length]} size={size} />;
}

/* ─── Comment Item ─── */
function CommentItem({ comment }) {
  return (
    <div className="comment-item">
      <div className="comment-avatar">
        {comment.userImage ? (
          <img src={comment.userImage} alt={comment.author} />
        ) : (
          <Avatar initials={comment.author.charAt(0)} size={32} />
        )}
      </div>
      <div className="comment-content">
        <div className="comment-bubble">
          <div className="comment-author">{comment.author}</div>
          <div className="comment-text">{comment.text}</div>
        </div>
        <div className="comment-time">{comment.time}</div>
      </div>
    </div>
  );
}

/* ─── Post Card ─── */
function PostCard({ post, onLike, onAddComment, onToggleComments, onToggleLikesList, userImage, userName }) {
  const [draft, setDraft] = useState("");
  const { t } = useLang();

  const submit = () => {
    if (!draft.trim()) return;
    onAddComment(post.id, draft.trim());
    setDraft("");
  };

  // FIX: تجنب تكرار النص - لو النص أقل من 100 حرف متعرضوش في العنوان والوصف مع بعض
  const lines = post.text ? post.text.split("\n") : [];
  const hasTitle = lines.length > 1 && lines[0].trim().length > 0;
  const titleText = hasTitle ? lines[0] : null;
  const bodyText = hasTitle
    ? lines.slice(1).join("\n").trim()
    : post.text;

  return (
    <article className="post-card">
      {/* Header */}
      <div className="post-header">
        <DoctorAvatar doctor={post.publisher} size={48} />
        <div className="post-header-meta">
          <div className="post-author-name">
            Dr. {post.publisher?.userName || "Doctor"}
          </div>
          <div className="post-author-spec">
            {post.publisher?.specialization || "Therapist"}
          </div>
          <div className="post-time">{post.time}</div>
        </div>

      </div>

      {/* Content - FIX: إزالة تكرار النص */}
      {post.text && (
  <div className="post-content">
    {titleText && <h3 className="post-title">{titleText}</h3>}

    <p className="post-description">
      {(titleText ? bodyText : post.text)?.length > 300
        ? `${(titleText ? bodyText : post.text).substring(0, 300)}...`
        : (titleText ? bodyText : post.text)}
    </p>
  </div>
)}

      {/* Image */}
     {post.img && (
  <div className="post-image-container">
    <img
      src={post.img}
      alt="post"
      className="post-image"
      onClick={() => {
        const modal = document.createElement("div");
        modal.style.cssText = `
          position:fixed; inset:0; background:rgba(0,0,0,0.9);
          display:flex; align-items:center; justify-content:center;
          z-index:9999; cursor:pointer; flex-direction:column; gap:16px;
        `;

        const img = document.createElement("img");
        img.src = post.img;
        img.style.cssText = `
          max-width:90vw; max-height:85vh;
          object-fit:contain; border-radius:8px;
          box-shadow:0 20px 60px rgba(0,0,0,0.5);
        `;

        const btnRow = document.createElement("div");
        btnRow.style.cssText = "display:flex; gap:12px;";

        const downloadBtn = document.createElement("a");
        downloadBtn.href = post.img;
        downloadBtn.download = "image.jpg";
        downloadBtn.target = "_blank";
        downloadBtn.innerText = "⬇ تنزيل الصورة";
        downloadBtn.style.cssText = `
          background:#6366f1; color:#fff; padding:10px 20px;
          border-radius:8px; text-decoration:none; font-size:14px;
          font-weight:600; cursor:pointer;
        `;
        downloadBtn.onclick = (e) => e.stopPropagation();

        const closeBtn = document.createElement("button");
        closeBtn.innerText = "✕ إغلاق";
        closeBtn.style.cssText = `
          background:#334155; color:#fff; padding:10px 20px;
          border-radius:8px; border:none; font-size:14px;
          font-weight:600; cursor:pointer;
        `;
        closeBtn.onclick = () => document.body.removeChild(modal);

        btnRow.appendChild(downloadBtn);
        btnRow.appendChild(closeBtn);
        modal.appendChild(img);
        modal.appendChild(btnRow);
        modal.onclick = () => document.body.removeChild(modal);
        document.body.appendChild(modal);
      }}
    />
  </div>
)}

      {/* Stats */}
      <div className="post-stats">
        {/* FIX: زرار اللايكات بيفتح قائمة المعجبين */}
        <button
          className="stat-item stat-button"
          onClick={() => onToggleLikesList(post.id)}
        >
          <FaHeart className="stat-icon liked" />
          <span className="stat-number">{post.likes}</span>
         <span className="stat-label">{t("likes")}</span>
        </button>
        <button
          className="stat-item stat-button"
          onClick={() => onToggleComments(post.id)}
        >
          <FiMessageCircle className="stat-icon" />
          <span className="stat-number">{post.commentsCount ?? post.comments.length}</span>
         <span className="stat-label">{t("comments")}</span>
        </button>
      </div>

      {/* Actions */}
      <div className="post-actions">
        <button
          className={`action-btn ${post.liked ? "liked" : ""}`}
          onClick={() => onLike(post.id)}
          disabled={post.likeLoading}
        >
          {post.liked ? (
            <FaHeart className="icon liked" />
          ) : (
            <FiHeart className="icon" />
          )}
         <span>{post.liked ? t("liked") : t("like")}</span>
        </button>

        <button
          className="action-btn"
          onClick={() => onToggleComments(post.id)}
        >
          <FiMessageCircle className="icon" />
          <span>{t("comment")}</span>
        </button>
      </div>

      {/* Likes List Section */}
      {post.showLikesList && (
        <div className="likes-list-section" style={{ direction: "rtl", textAlign: "right" }}>
        <h4>{t("whoLiked")}</h4>
          <div className="likes-avatars-row">
            {post.likesList && post.likesList.length > 0 ? (
              post.likesList.map((likeUser, idx) => {
                const name = likeUser.userName || "مستخدم";
                const pfp = likeUser.pfp?.secure_url || null;
                return (
                  <div key={likeUser._id || idx} className="like-user-item">
                    {pfp ? (
                      <img src={pfp} alt={name} className="like-user-pfp" />
                    ) : (
                      <div className="like-user-avatar-placeholder">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="like-user-name">{name}</span>
                  </div>
                );
              })
            ) : (
            <div className="no-likes-text">{t("noLikesYet")}</div>
            )}
          </div>
        </div>
      )}

      {/* Comments Section */}
      {post.showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {post.comments.length > 0 ? (
              post.comments.map((c, i) => (
                <CommentItem key={i} comment={c} />
              ))
            ) : (
              <div className="no-comments">{t("noPostsFound")}</div>
            )}
          </div>

          <div className="comment-input-section">
            <div className="comment-input-avatar">
              {userImage ? (
                <img src={userImage} alt={userName} />
              ) : (
                <Avatar initials={userName?.charAt(0) || "U"} size={36} />
              )}
            </div>
            <div className="comment-input-wrapper">
              <input
                type="text"
                className="comment-input"
                placeholder={t("writeComment...")}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
              />
              <button
                className="comment-submit-btn"
                onClick={submit}
                disabled={!draft.trim()}
              >
                <FiSend />
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

/* ─── Format Helpers ─── */
// FIX: formatComments تتعامل مع كل الـ fields الممكنة من الـ API
function formatComments(rawComments = []) {
  return rawComments.map((c) => ({
    id: c._id,
    author:
      c.user?.userName ||
      c.author?.userName ||
      c.userId?.userName ||
      c.userName ||
      "User",
    text: c.content,
    time: c.createdAt ? formatTime(c.createdAt) : "Recently",
    userImage:
      c.user?.pfp?.secure_url ||
      c.author?.pfp?.secure_url ||
      c.userId?.pfp?.secure_url ||
      null,
  }));
}

function formatArticle(article) {
  const userId = getUserIdFromToken();
  const liked = Array.isArray(article.likes)
    ? article.likes.some((l) => l === userId || l?._id === userId)
    : false;

  // FIX: likesList تكون array من objects مش strings
  const likesList = Array.isArray(article.likes)
    ? article.likes.filter((l) => typeof l === "object" && l !== null)
    : [];

  return {
    ...article,
    id: article._id,
    publisher: article.publisher,
    text: article.content,
    img: article.attachments?.[0]?.secure_url || null,
    likes: article.likes?.length || 0,
    likesList,
    liked,
    likeLoading: false,
    comments: [],
    commentsCount: article.comments?.length || 0,
    showComments: false,
    showLikesList: false,
    time: formatTime(article.createdAt),
  };
}

/* ─── MAIN COMPONENT ─── */
export default function PatientFeed() {
  const { t } = useLang();
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [userImage, setUserImage] = useState(null);
  const [userName, setUserName] = useState("Patient");



    // ← ضيفي الـ dark mode state هنا
  const [isDark, setIsDark] = useState(false);

  // ← ضيفي الـ useEffect ده هنا
  useEffect(() => {
    const saved = localStorage.getItem("mindspace-theme-patient") || "light";
    document.documentElement.setAttribute("data-theme", saved);
    setIsDark(saved === "dark");
  }, []);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
 
localStorage.setItem("mindspace-theme-patient", next);
    setIsDark(!isDark);
  };

  
  /* ─── Fetch Comments - FIX: بنجيب كل الكومنتات مش بس بتاعت اليوزر ─── */
  const fetchComments = async (articleId) => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) return [];

      const res = await axios.get(
        `${BASE_URL}/article/${articleId}/comment/${userId}`,
        { headers: authHeader() }
      );

      const raw = res.data?.data || res.data || [];
      return formatComments(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.log("Error fetching comments:", err.response?.data || err);
      return [];
    }
  };

  /* ─── Fetch Likes List ─── */
  const fetchLikesList = async (articleId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/article/${articleId}`,
        { headers: authHeader() }
      );
      const article = res.data?.data || res.data;
      const likes = article?.likes || [];
      return likes.filter((l) => typeof l === "object" && l !== null);
    } catch (err) {
      console.log("Error fetching likes list:", err.response?.data || err);
      return [];
    }
  };

  /* ─── Fetch Posts ─── */
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/article`, {
        headers: authHeader(),
      });

      const articles = res.data.data || [];
      const formattedPosts = articles.map((article) => formatArticle(article));
      setPosts(formattedPosts);
    } catch (err) {
      console.log("Error fetching posts:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  /* ─── Handle Toggle Likes List - FIX: بنجيب اللايكات من الـ API ─── */
  const handleToggleLikesList = async (id) => {
    const post = posts.find((p) => p.id === id);

    // لو مفتوح، اقفله
    if (post?.showLikesList) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, showLikesList: false } : p
        )
      );
      return;
    }

    // افتح وجيب البيانات
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, showLikesList: true } : p
      )
    );

    // لو الـ likesList فاضية أو objects مش loaded، نجيبها
    if (!post?.likesList || post.likesList.length === 0) {
      const likesList = await fetchLikesList(id);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, likesList } : p
        )
      );
    }
  };

  /* ─── Handle Like ─── */
  const handleLike = async (id) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
              likeLoading: true,
            }
          : p
      )
    );

    try {
      await axios.patch(
        `${BASE_URL}/article/like-unlike/${id}`,
        {},
        { headers: authHeader() }
      );

      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, likeLoading: false } : p
        )
      );
    } catch (err) {
      console.log("Error liking post:", err.response?.data || err);
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                liked: !p.liked,
                likes: p.liked ? p.likes - 1 : p.likes + 1,
                likeLoading: false,
              }
            : p
        )
      );
    }
  };

  /* ─── Toggle Comments - FIX: بنجيب كل الكومنتات مش بس بتاعت اليوزر ─── */
  const handleToggleComments = async (id) => {
    const post = posts.find((p) => p.id === id);

    if (post?.showComments) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, showComments: false } : p
        )
      );
      return;
    }

    const comments = await fetchComments(id);

    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, showComments: true, comments, commentsCount: comments.length }
          : p
      )
    );
  };

  /* ─── Add Comment ─── */
  const handleAddComment = async (id, text) => {
    try {
      const userId = getUserIdFromToken();

      await axios.post(
        `${BASE_URL}/article/${id}/comment/${userId}`,
        { content: text },
        { headers: authHeader() }
      );

      setTimeout(async () => {
        const comments = await fetchComments(id);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, showComments: true, comments, commentsCount: comments.length }
              : p
          )
        );
      }, 300);
    } catch (err) {
      console.log("Error adding comment:", err.response?.data || err);
    }
  };

  /* ─── Filter Posts ─── */
  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.publisher?.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="feed-container">
      {/* ─── Header ─── */}
      <header className="feed-header">
        <div className="header-content">
          <div className="header-text">
          <h1 className="header-title">{t("mentalHealthFeed")}</h1>

          <p className="header-subtitle">{t("feedSubtitle")}</p>
          </div>

          <div className="header-controls">
            <div className="search-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
              placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="filter-btn">
              <FiFilter />
            <span>{t("filter")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Posts Feed ─── */}
      <main className="feed-main">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
          <p>{t("loadingPosts")}</p>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="posts-list">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onAddComment={handleAddComment}
                onToggleComments={handleToggleComments}
                onToggleLikesList={handleToggleLikesList}
                userImage={userImage}
                userName={userName}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
           <h3>{t("noPostsFound")}</h3>
         <p>{t("tryAdjusting")}</p>
          </div>
        )}
      </main>
    </div>
  );
}