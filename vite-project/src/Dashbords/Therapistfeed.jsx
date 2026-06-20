import { useState, useRef, useEffect } from "react";
import {
  FiImage,
  // FiSmile,
  // FiLink,
  FiSend,
  FiMoreHorizontal,
  FiHeart,
  FiMessageCircle,
  FiX,
  FiZap,
  FiGlobe,
  FiEdit,
  FiArchive,
  FiRotateCcw,
  FiTrash2,
  FiList,
  // بعد

  FiSearch,
  FiFilter,





} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { useDashUser } from "../Dashbords/DoctorDashbord";
import "./Therapistfeed.css";
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
  return postDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/* ─── Avatar Component ─── */
function Avatar({ initials, size = 44 }) {
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </div>
  );
}

/* ─── User Avatar ─── */
function UserAvatar({ size = 44 }) {
  const { user } = useDashUser();

  if (user?.pfp?.secure_url) {
    return (
      <img
        src={user.pfp.secure_url}
        alt={user.userName}
        className="avatar-img"
        style={{ width: size, height: size }}
      />
    );
  }

  const initial = user?.userName?.charAt(0)?.toUpperCase() || "D";
  return <Avatar initials={initial} size={size} />;
}

/* ─── Comment Item ─── */
function CommentItem({ comment, onDelete }) {
  const currentUserId = getUserIdFromToken();
  const canDelete = comment.userId === currentUserId;

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
        <div
          className="comment-time"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          {comment.time}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#e57373",
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
              title="Delete comment"
            >
              <FiTrash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Post Menu ─── */
function PostMenu({
  postId,
  isArchived,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const { t } = useLang();

  return (
    <div className="post-menu-container">
      <button
        className="post-menu-btn"
        onClick={() => setShowMenu(!showMenu)}
        title="More options"
        aria-label="More options"
      >
        <FiMoreHorizontal />
      </button>

      {showMenu && (
        <div className="post-menu-dropdown">
          <button
            className="menu-item"
            onClick={() => {
              onEdit(postId);
              setShowMenu(false);
            }}
          >
           <FiEdit size={16} /> {t("edit")}
          </button>

          {!isArchived ? (
            <button
              className="menu-item"
              onClick={() => {
                onArchive(postId);
                setShowMenu(false);
              }}
            >
              <FiArchive size={16} /> {t("archive")}
            </button>
          ) : (
            <button
              className="menu-item"
              onClick={() => {
                onRestore(postId);
                setShowMenu(false);
              }}
            >
         <FiRotateCcw size={16} /> {t("restore")}
            </button>
          )}

          <button
            className="menu-item delete"
            onClick={() => {
             if (window.confirm(t("moveToTrash"))) {
                onDelete(postId);
                setShowMenu(false);
              }
            }}
          >
          <FiTrash2 size={16} /> {t("delete")}
          </button>
        </div>
      )}
    </div>
  );
}

function renderTextWithLinks(text) {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const parts = text.split(urlRegex);
  const matches = text.match(urlRegex) || [];

  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {matches[i] && (
        <a
          href={matches[i]}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#534AB7",
            wordBreak: "break-all",
            textDecoration: "underline",
          }}
        >
          {matches[i]}
        </a>
      )}
    </span>
  ));
}
/* ─── Post Card ─── */
function PostCard({
  post,
  onLike,
  onAddComment,
  onToggleComments,
  onToggleLikesList, // FIX: أضفنا الـ prop
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  onDeleteComment,
  showMenuOptions = true,
}) {
   const { t,lang } = useLang();
  const { user } = useDashUser();
  const [draft, setDraft] = useState("");
  const currentUserId = getUserIdFromToken();

  const isMyPost = post.publisherId === currentUserId;

  const submit = () => {
    if (!draft.trim()) return;
    onAddComment(post.id, draft.trim());
    setDraft("");
  };

  return (
    <article className="post-card">
      {/* Header */}
      <div className="post-header">
        <div className="post-author">
          <div className="post-avatar">
            {post.image ? (
              <img
                src={post.image}
                alt={post.userNamee}
                className="avatar-img"
              />
            ) : (
              <Avatar
                initials={post.userNamee?.charAt(0)?.toUpperCase()}
                size={48}
              />
            )}
          </div>

          <div className="post-header-meta">
            <div className="post-author-name">
              Dr. {post?.userNamee || "Therapist"}
            </div>
            <div
              className="post-sub-meta"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <span className="post-role">
                {user?.role || "Mental Health Professional"}
              </span>
              <span className="post-time">{post.time}</span>
            </div>
          </div>

          {showMenuOptions && isMyPost && (
            <PostMenu
              postId={post.id}
              isArchived={post.isArchived}
              onEdit={onEdit}
              onArchive={onArchive}
              onRestore={onRestore}
              onDelete={onDelete}
            />
          )}
        </div>
      </div>

      {/* Content */}
      {post.text && (
        <div className="post-content">
          <p className="post-text">{renderTextWithLinks(post.text)}</p>
        </div>
      )}

      {/* Image */}
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

      {/* Stats - FIX: أضفنا زرار اللايكات زي صفحة المريض */}
      <div className="post-stats">
        <button
          className="stat-item stat-button"
          onClick={() => onToggleLikesList && onToggleLikesList(post.id)}
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
          <span className="stat-number">
            {post.commentsCount ?? post.comments.length}
          </span>
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

      {/* FIX: Likes List - زي صفحة المريض بالظبط */}
      {post.showLikesList && (
        <div
          className="likes-list-section"
          style={{ direction: "rtl", textAlign: "right" }}
        >
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

      {/* Comments */}
      {post.showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {post.comments.length > 0 ? (
              post.comments.map((c, i) => (
                <CommentItem
                  key={i}
                  comment={c}
                  onDelete={
                    onDeleteComment
                      ? (commentId) => onDeleteComment(post.id, commentId)
                      : undefined
                  }
                />
              ))
            ) : (
              <div className="no-comments">{t("noCommentsYet")}</div>
            )}
          </div>

         <div className="comment-input-section" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
            <UserAvatar size={36} />
            <div className="comment-input-wrapper" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
              <input
                type="text"
                className="comment-input"
               placeholder={t("writeResponse")}
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
                aria-label="Send comment"
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

/* ─── Create Modal ─── */
function CreateModal({
  open,
  onClose,
  onSubmit,
  docName,
  editingPost,
  onUpdatePost,
}) {
  const { t } = useLang();
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isNew, setIsNew] = useState(true);
  const fileRef = useRef();

  useEffect(() => {
    if (editingPost) {
      setText(editingPost.text || "");
      setPreview(editingPost.img || null);
      setImg(null);
      setIsNew(false);
    } else {
      setText("");
      setImg(null);
      setPreview(null);
      setIsNew(true);
    }
  }, [editingPost, open]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImg(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!text.trim() && !img && !preview) return;

    if (editingPost && !isNew) {
      await onUpdatePost(editingPost.id, { text: text.trim(), img });
    } else {
      await onSubmit({ text: text.trim(), img });
    }

    setText("");
    setImg(null);
    setPreview(null);
    setIsNew(true);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editingPost && !isNew ? t("editPost") : t("sharePost")}</h3>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FiX />
          </button>
        </div>

        <div className="modal-author">
          <UserAvatar size={42} />
          <div>
            <div className="modal-author-name">
              Dr. {docName || "Therapist"}
            </div>
            <div className="modal-author-status">
              <FiGlobe style={{ verticalAlign: -2, marginRight: 4 }} />
              {t("publicProfessional")}
            </div>
          </div>
        </div>

        <textarea
          className="modal-textarea"
        placeholder={t("shareTextPlaceholder...")} 
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          autoFocus
        />

        {preview && (
          <div className="modal-preview">
            <img src={preview} alt="preview" />
            <button
              className="modal-remove-img"
              onClick={() => {
                setImg(null);
                setPreview(null);
              }}
              aria-label="Remove image"
            >
              <FiX />
            </button>
          </div>
        )}

        <div className="modal-footer">
          <div className="modal-tools">
            <button
              className="modal-tool-btn"
              title={t("addPhoto")}
              onClick={() => fileRef.current.click()}
            >
              <FiImage />
            </button>
            {/* <button className="modal-tool-btn" title="Add emoji"><FiSmile /></button>
            <button className="modal-tool-btn" title="Add link"><FiLink /></button> */}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFile}
          />

          <button
            className="modal-post-btn"
            disabled={!text.trim() && !img && !preview}
            onClick={submit}
          >
            {editingPost && !isNew ? t("updatePost") : t("sharePost")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Format Helpers ─── */
// FIX: formatComments تتعامل مع كل الـ fields الممكنة
function formatComments(rawComments = []) {
  return rawComments.map((c) => ({
    id: c._id,
    userId: c.user?._id || c.userId?._id || c.author?._id || null,
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
      c.userId?.pfp?.secure_url ||
      c.author?.pfp?.secure_url ||
      null,
  }));
}

function formatArticle(article) {
  const userId = getUserIdFromToken();

  const liked = Array.isArray(article.likes)
    ? article.likes.some((l) => l === userId || l?._id === userId)
    : false;

  // FIX: likesList - objects فقط مش strings
  const likesList = Array.isArray(article.likes)
    ? article.likes.filter((l) => typeof l === "object" && l !== null)
    : [];

  return {
    ...article,
    id: article._id,
    text: article.content,
    img: article.attachments?.[0]?.secure_url || null,
    likes: article.likes?.length || 0,
    likesList,
    liked,
    likeLoading: false,
    comments: [],
    commentsCount: article.comments?.length || 0,
    showComments: false,
    showLikesList: false, // FIX: أضفنا showLikesList
    isArchived: article.isArchived || false,
    isDeleted: article.isDeleted || false,
    time: formatTime(article.createdAt),
    userNamee: article.publisher?.userName,
    image: article.publisher?.pfp?.secure_url,
    publisherId: article.publisher?._id,
  };
}

/* ─── MAIN COMPONENT ─── */
export default function TherapistFeed() {
  const { lang, t } = useLang();

  const { user } = useDashUser();
  const [posts, setPosts] = useState([]);
  const [archivedPosts, setArchivedPosts] = useState([]);
  const [trashedPosts, setTrashedPosts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [currentTab, setCurrentTab] = useState("feed");

  /* ─── Fetch Posts ─── */
 // بعد
const fetchAndSeparatePosts = async () => {
  setLoading(true);
  try {
    const res = await axios.get(`${BASE_URL}/article`, {
      headers: authHeader(),
    });
    const articles = res.data.data || [];

    const active = [],
      archived = [],
      trashed = [];

    articles.forEach((article) => {
      const formatted = formatArticle(article);
      if (article.isDeleted === true) trashed.push(formatted);
      else if (article.isArchived === true) archived.push(formatted);
      else active.push(formatted);
    });

    setPosts(active);
    setArchivedPosts(archived);
    setTrashedPosts(trashed);

    [...active, ...archived, ...trashed].forEach(async (post) => {
      const comments = await fetchComments(post.id);
      const updateCount = (prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, commentsCount: comments.length } : p,
        );
      setPosts(updateCount);
      setArchivedPosts(updateCount);
      setTrashedPosts(updateCount);
    });
  } catch (err) {
    console.log("Error fetching posts:", err.response?.data || err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAndSeparatePosts();
  }, []);

  /* ─── Helper: find post in all lists ─── */
  const findPostSetter = (id) => {
    if (posts.find((p) => p.id === id)) return [posts, setPosts];
    if (archivedPosts.find((p) => p.id === id))
      return [archivedPosts, setArchivedPosts];
    if (trashedPosts.find((p) => p.id === id))
      return [trashedPosts, setTrashedPosts];
    return [posts, setPosts];
  };

  /* ─── Fetch Comments - FIX: كل الكومنتات ─── */
// بعد
const fetchComments = async (articleId) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/article/${articleId}/comment`,
      { headers: authHeader() },
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
      const res = await axios.get(`${BASE_URL}/article/${articleId}`, {
        headers: authHeader(),
      });
      const article = res.data?.data || res.data;
      const likes = article?.likes || [];
      return likes.filter((l) => typeof l === "object" && l !== null);
    } catch (err) {
      console.log("Error fetching likes list:", err.response?.data || err);
      return [];
    }
  };

  /* ─── FIX: Handle Toggle Likes List ─── */
  const handleToggleLikesList = async (id) => {
    const [postsSet, setter] = findPostSetter(id);
    const post = postsSet.find((p) => p.id === id);

    if (post?.showLikesList) {
      setter((prev) =>
        prev.map((p) => (p.id === id ? { ...p, showLikesList: false } : p)),
      );
      return;
    }

    setter((prev) =>
      prev.map((p) => (p.id === id ? { ...p, showLikesList: true } : p)),
    );

    if (!post?.likesList || post.likesList.length === 0) {
      const likesList = await fetchLikesList(id);
      setter((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likesList } : p)),
      );
    }
  };

  /* ─── Handle Like ─── */
  const handleLike = async (id) => {
    const [, setter] = findPostSetter(id);

    setter((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
              likeLoading: true,
            }
          : p,
      ),
    );

    try {
      await axios.patch(
        `${BASE_URL}/article/like-unlike/${id}`,
        {},
        { headers: authHeader() },
      );
      setter((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likeLoading: false } : p)),
      );
    } catch (err) {
      console.log("Error liking post:", err.response?.data || err);
      setter((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                liked: !p.liked,
                likes: p.liked ? p.likes - 1 : p.likes + 1,
                likeLoading: false,
              }
            : p,
        ),
      );
    }
  };

  /* ─── Toggle Comments ─── */
  const handleToggleComments = async (id) => {
    const [postsSet, setter] = findPostSetter(id);
    const post = postsSet.find((p) => p.id === id);

    if (post?.showComments) {
      setter((prev) =>
        prev.map((p) => (p.id === id ? { ...p, showComments: false } : p)),
      );
      return;
    }

    const comments = await fetchComments(id);
    setter((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              showComments: true,
              comments,
              commentsCount: comments.length,
            }
          : p,
      ),
    );
  };

  /* ─── Add Comment ─── */
  const handleAddComment = async (id, text) => {
    try {
      const userId = getUserIdFromToken();
      await axios.post(
        `${BASE_URL}/article/${id}/comment/${userId}`,
        { content: text },
        { headers: authHeader() },
      );

      setTimeout(async () => {
        const comments = await fetchComments(id);
        const [, setter] = findPostSetter(id);
        setter((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  showComments: true,
                  comments,
                  commentsCount: comments.length,
                }
              : p,
          ),
        );
      }, 300);
    } catch (err) {
      console.log("Error adding comment:", err.response?.data || err);
    }
  };

  /* ─── Delete Comment ─── */
  const handleDeleteComment = async (articleId, commentId) => {
    try {
      await axios.delete(
        `${BASE_URL}/article/${articleId}/comment/${commentId}`,
        { headers: authHeader() },
      );

      const removeComment = (prev) =>
        prev.map((p) =>
          p.id === articleId
            ? {
                ...p,
                comments: p.comments.filter((c) => c.id !== commentId),
                commentsCount: Math.max((p.commentsCount || 1) - 1, 0),
              }
            : p,
        );

      setPosts(removeComment);
      setArchivedPosts(removeComment);
      setTrashedPosts(removeComment);
    } catch (err) {
      console.log("Error deleting comment:", err.response?.data || err);
    }
  };

  /* ─── Create Post ─── */
  const handleSubmitPost = async ({ text, img }) => {
    try {
      const formData = new FormData();
      if (text) formData.append("content", text);
      if (img) formData.append("attachments", img);

      const res = await axios.post(`${BASE_URL}/article`, formData, {
        headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
      });

      if (res.data?.data) {
        const articleData = res.data.data;

        // لو الـ API رجّع الـ publisher ناقص، نكمّله من بيانات الـ user عندنا
        if (!articleData.publisher?.userName && user) {
          articleData.publisher = {
            _id: user._id,
            userName: user.userName,
            pfp: user.pfp,
            specialization: user.specialization,
          };
        }

        setPosts((prev) => [formatArticle(articleData), ...prev]);
      }
    } catch (err) {
      console.log("Error creating post:", err.response?.data || err);
    }
  };

  /* ─── Edit Post ─── */
  const handleEditPost = (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setEditingPost(post);
      setModalOpen(true);
    }
  };

  /* ─── Update Post ─── */
  const handleUpdatePost = async (postId, { text, img }) => {
    try {
      const formData = new FormData();
      if (text) formData.append("content", text);
      if (img) formData.append("attachments", img);

      const res = await axios.put(
        `${BASE_URL}/article/update/${postId}`,
        formData,
        {
          headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
        },
      );

      if (res.data?.data) {
        const updatedPost = formatArticle(res.data.data);
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? updatedPost : p)),
        );
      }
      setEditingPost(null);
    } catch (err) {
      console.log("Error updating post:", err.response?.data || err);
    }
  };

  /* ─── Archive Post ─── */
  const handleArchivePost = async (postId) => {
    try {
      await axios.patch(
        `${BASE_URL}/article/archive/${postId}`,
        {},
        { headers: authHeader() },
      );
      const post = posts.find((p) => p.id === postId);
      if (post) {
        setArchivedPosts((prev) => [{ ...post, isArchived: true }, ...prev]);
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.log("Error archiving post:", err.response?.data || err);
    }
  };

  /* ─── Restore Post ─── */
  const handleRestorePost = async (postId) => {
    try {
      await axios.patch(
        `${BASE_URL}/article/restore/${postId}`,
        {},
        { headers: authHeader() },
      );
      const post = archivedPosts.find((p) => p.id === postId);
      if (post) {
        setPosts((prev) => [{ ...post, isArchived: false }, ...prev]);
        setArchivedPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.log("Error restoring post:", err.response?.data || err);
    }
  };

  /* ─── Delete Post ─── */
  const handleDeletePost = async (postId) => {
    try {
      const res = await axios.delete(`${BASE_URL}/article/${postId}`, {
        headers: authHeader(),
      });
      if (res.status === 200 || res.status === 204) {
        const post =
          posts.find((p) => p.id === postId) ||
          archivedPosts.find((p) => p.id === postId);
        if (post) {
          setTrashedPosts((prev) => [{ ...post, isDeleted: true }, ...prev]);
          setPosts((prev) => prev.filter((p) => p.id !== postId));
          setArchivedPosts((prev) => prev.filter((p) => p.id !== postId));
        }
      }
    } catch (err) {
      console.log("Error deleting post:", err.response?.data || err);
    }
  };

  /* ─── Undo Post ─── */
  const handleUndoPost = async (postId) => {
    try {
      const res = await axios.delete(`${BASE_URL}/article/undo/${postId}`, {
        headers: authHeader(),
      });
      if (res.status === 200 || res.status === 204) {
        const post = trashedPosts.find((p) => p.id === postId);
        if (post) {
          setPosts((prev) => [{ ...post, isDeleted: false }, ...prev]);
          setTrashedPosts((prev) => prev.filter((p) => p.id !== postId));
        }
      }
    } catch (err) {
      console.log("Error restoring from trash:", err.response?.data || err);
    }
  };

  return (
    <div className="feed-container">
      {/* ─── Tabs ─── */}
      <div className="feed-tabs">
        <button
          className={`tab-btn ${currentTab === "feed" ? "active" : ""}`}
          onClick={() => setCurrentTab("feed")}
        >
          <FiList size={18} /> {t("feed")} ({posts.length})
        </button>
        <button
          className={`tab-btn ${currentTab === "archives" ? "active" : ""}`}
          onClick={() => setCurrentTab("archives")}
        >
          <FiArchive size={18} /> {t("archives")} ({archivedPosts.length})
        </button>
      </div>

      {/* ─── CREATE CARD ─── */}
      {currentTab === "feed" && (
        <div className="create-card">
          <div className="create-top">
            <UserAvatar size={48} />
        <button 
  className="create-input" 
  onClick={() => { setEditingPost(null); setModalOpen(true); }}
  style={{ textAlign: lang === "ar" ? "right" : "left" }}
>
  {t("shareToday")}
</button>
          </div>

          <div className="create-actions">
            <button
              className="create-action-btn photo"
              onClick={() => {
                setEditingPost(null);
                setModalOpen(true);
              }}
            >
              <FiImage /> {t("photo")}
            </button>
            <button
              className="create-action-btn tip"
              onClick={() => {
                setEditingPost(null);
                setModalOpen(true);
              }}
            >
              <FiZap /> {t("mentalHealthTip")}
            </button>
            <button
              className="create-action-btn event"
              onClick={() => {
                setEditingPost(null);
                setModalOpen(true);
              }}
            >
              <FiZap /> {t("announcement")}
            </button>
          </div>
        </div>
      )}

      {/* ─── CONTENT ─── */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
         <p>{t("loadingPosts")}</p>
        </div>
      ) : currentTab === "feed" ? (
        posts.length > 0 ? (
          <div className="posts-list">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleLike(post.id)}
                onAddComment={handleAddComment}
                onToggleComments={handleToggleComments}
                onToggleLikesList={handleToggleLikesList} // FIX: أضفنا الـ prop
                onEdit={handleEditPost}
                onArchive={handleArchivePost}
                onRestore={() => {}}
                onDelete={handleDeletePost}
                onDeleteComment={handleDeleteComment}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
           <h3>{t("noPostsYet")}</h3>
           <p>{t("noPostsDesc")}</p>
            <button
              className="empty-action-btn"
              onClick={() => {
                setEditingPost(null);
                setModalOpen(true);
              }}
            >
              <FiZap />{t("createPost")}
            </button>
          </div>
        )
      ) : currentTab === "archives" ? (
        archivedPosts.length > 0 ? (
          <div className="posts-list">
            {archivedPosts.map((post) => (
              <div key={post.id} className="archive-post-item">
                <PostCard
                  post={post}
                  onLike={() => handleLike(post.id)}
                  onAddComment={handleAddComment}
                  onToggleComments={handleToggleComments}
                  onToggleLikesList={handleToggleLikesList}
                  onEdit={() => {}}
                  onArchive={() => {}}
                  onRestore={() => handleRestorePost(post.id)}
                  onDelete={handleDeletePost}
                  onDeleteComment={handleDeleteComment}
                  showMenuOptions={false}
                />
                <div className="archive-post-actions">
                  <button
                    className="archive-restore-btn"
                    onClick={() => handleRestorePost(post.id)}
                  >
                   <FiRotateCcw /> {t("restore")}
                  </button>
                  <button
                    className="archive-delete-btn"
                    onClick={() => handleDeletePost(post.id)}
                  >
                   <FiTrash2 /> {t("delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
           <h3>{t("noArchivedPosts")}</h3>
           <p>{t("noArchivedDesc")}</p>
          </div>
        )
      ) : null}

      {/* ─── Modal ─── */}
      <CreateModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPost(null);
        }}
        onSubmit={handleSubmitPost}
        onUpdatePost={handleUpdatePost}
        editingPost={editingPost}
        docName={user?.userName}
      />
    </div>
  );
}
