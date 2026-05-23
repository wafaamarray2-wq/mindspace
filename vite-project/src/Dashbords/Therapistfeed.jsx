import { useState, useRef, useEffect } from "react";
import {
  FiImage,
  FiSmile,
  FiLink,
  FiSend,
  FiMoreHorizontal,
  FiHeart,
  FiMessageCircle,
  FiBookmark,
  FiX,
  FiZap,
  FiGlobe,
  FiEdit,
  FiArchive,
  FiRotateCcw,
  FiTrash2,
  FiList,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { useDashUser } from "../Dashbords/DoctorDashbord";
import "./Therapistfeed.css";
import axios from "axios";

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

console.log("TOKEN:", localStorage.getItem("token"));
console.log("ROLE:", localStorage.getItem("role"));

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

/* ─── Post Menu ─── */
function PostMenu({ postId, isArchived, onEdit, onArchive, onRestore, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleEdit = () => {
    onEdit(postId);
    setShowMenu(false);
  };

  const handleArchive = () => {
    onArchive(postId);
    setShowMenu(false);
  };

  const handleRestore = () => {
    onRestore(postId);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (window.confirm("Move this post to trash?")) {
      onDelete(postId);
      setShowMenu(false);
    }
  };

  return (
    <div className="post-menu-container">
      <button
        className="post-menu-btn"
        onClick={() => setShowMenu(!showMenu)}
        title="More options"
      >
        <FiMoreHorizontal />
      </button>

      {showMenu && (
        <div className="post-menu-dropdown">
          <button className="menu-item" onClick={handleEdit}>
            <FiEdit size={16} /> Edit
          </button>

          {!isArchived ? (
            <button className="menu-item" onClick={handleArchive}>
              <FiArchive size={16} /> Archive
            </button>
          ) : (
            <button className="menu-item" onClick={handleRestore}>
              <FiRotateCcw size={16} /> Restore
            </button>
          )}

          <button className="menu-item delete" onClick={handleDelete}>
            <FiTrash2 size={16} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Post Card ─── */
function PostCard({
  post,
  onLike,
  onAddComment,
  onToggleComments,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  showMenuOptions = true,
}) {
  const { user } = useDashUser();
  const [draft, setDraft] = useState("");

  const submit = () => {
    if (!draft.trim()) return;
    onAddComment(post.id, draft.trim());
    setDraft("");
  };

  return (
    <article className="post-card">
      {/* Header */}
      <div className="post-header">
        <UserAvatar size={48} />
        <div className="post-header-meta">
          <div className="post-author-name">
            Dr. {user?.userName || "Therapist"}
            <span className="therapist-badge">Verified</span>
          </div>
          <div className="post-role">{user?.role || "Mental Health Professional"}</div>
          <div className="post-time">{post.time}</div>
        </div>
        {showMenuOptions && (
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

      {/* Content */}
      {post.text && (
        <div className="post-content">
          <p className="post-text">{post.text}</p>
        </div>
      )}

      {/* Image */}
      {post.img && (
        <div className="post-image-container">
          <img src={post.img} alt="post" className="post-image" />
        </div>
      )}

      {/* Stats */}
      <div className="post-stats">
        <div className="stat-item">
          <FaHeart className="stat-icon liked" />
          <span className="stat-number">{post.likes}</span>
          <span className="stat-label">likes</span>
        </div>
        <button
          className="stat-item stat-button"
          onClick={() => onToggleComments(post.id)}
        >
          <FiMessageCircle className="stat-icon" />
          <span className="stat-number">{post.commentsCount ?? post.comments.length}</span>
          <span className="stat-label">comments</span>
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
          <span>{post.liked ? "Liked" : "Like"}</span>
        </button>

        <button
          className="action-btn"
          onClick={() => onToggleComments(post.id)}
        >
          <FiMessageCircle className="icon" />
          <span>Comment</span>
        </button>

        <button className="action-btn">
          <FiBookmark className="icon" />
          <span>Save</span>
        </button>
      </div>

      {/* Comments */}
      {post.showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {post.comments.length > 0 ? (
              post.comments.map((c, i) => (
                <CommentItem key={i} comment={c} />
              ))
            ) : (
              <div className="no-comments">No comments yet. Be the first!</div>
            )}
          </div>

          <div className="comment-input-section">
            <UserAvatar size={36} />
            <div className="comment-input-wrapper">
              <input
                type="text"
                className="comment-input"
                placeholder="Write a response..."
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

/* ─── Create Modal ─── */
function CreateModal({ open, onClose, onSubmit, docName, editingPost, onUpdatePost }) {
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
          <h3>{editingPost && !isNew ? "Edit post" : "Share a post"}</h3>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-author">
          <UserAvatar size={42} />
          <div>
            <div className="modal-author-name">Dr. {docName || "Therapist"}</div>
            <div className="modal-author-status">
              <FiGlobe style={{ verticalAlign: -2, marginRight: 4 }} />
              Public • Mental Health Professional
            </div>
          </div>
        </div>

        <textarea
          className="modal-textarea"
          placeholder="Share insights, tips, or mental health information with your audience..."
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
            >
              <FiX />
            </button>
          </div>
        )}

        <div className="modal-footer">
          <div className="modal-tools">
            <button
              className="modal-tool-btn"
              title="Add photo"
              onClick={() => fileRef.current.click()}
            >
              <FiImage />
            </button>
            <button className="modal-tool-btn" title="Add emoji">
              <FiSmile />
            </button>
            <button className="modal-tool-btn" title="Add link">
              <FiLink />
            </button>
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
            {editingPost && !isNew ? "Update Post" : "Share Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Format Helpers ─── */
function formatComments(rawComments = []) {
  return rawComments.map((c) => ({
    author: c.author?.userName || c.userId?.userName || c.user?.userName || "User",
    text: c.content,
    time: c.createdAt ? formatTime(c.createdAt) : "Recently",
    userImage: c.userId?.pfp?.secure_url || c.author?.pfp?.secure_url || c.user?.pfp?.secure_url || null,
  }));
}

function formatArticle(article) {
  const userId = getUserIdFromToken();
  const liked = Array.isArray(article.likes)
    ? article.likes.some((l) => l === userId || l?._id === userId)
    : false;

  return {
    ...article,
    id: article._id,
    text: article.content,
    img: article.attachments?.[0]?.secure_url || null,
    likes: article.likes?.length || 0,
    liked,
    likeLoading: false,
    comments: [],
    commentsCount: article.comments?.length || 0,
    showComments: false,
    isArchived: article.isArchived || false,
    isDeleted: article.isDeleted || false,
    time: formatTime(article.createdAt),
  };
}

/* ─── MAIN COMPONENT ─── */
export default function TherapistFeed() {
  const { user } = useDashUser();
  const [posts, setPosts] = useState([]);
  const [archivedPosts, setArchivedPosts] = useState([]);
  const [trashedPosts, setTrashedPosts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [currentTab, setCurrentTab] = useState("feed");

  /* ─── Fetch and Separate Posts ─── */
  const fetchAndSeparatePosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/article`, {
        headers: authHeader(),
      });

      const articles = res.data.data || [];

      const active = [];
      const archived = [];
      const trashed = [];

      articles.forEach((article) => {
        const formatted = formatArticle(article);
        
        // Check for deleted flag FIRST
        if (article.isDeleted === true) {
          trashed.push(formatted);
        }
        // Then check for archived
        else if (article.isArchived === true) {
          archived.push(formatted);
        }
        // Otherwise it's active
        else {
          active.push(formatted);
        }
      });

      console.log("Fetched Posts:", {
        active: active.length,
        archived: archived.length,
        trashed: trashed.length,
      });

      setPosts(active);
      setArchivedPosts(archived);
      setTrashedPosts(trashed);
    } catch (err) {
      console.log("Error fetching posts:", err.response?.data || err.message);
      alert("Error loading posts. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchAndSeparatePosts();
  }, []);

  /* ─── Fetch Comments ─── */
  const fetchComments = async (articleId) => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) return [];

      const res = await axios.get(
        `${BASE_URL}/article/${articleId}/comment/${userId}`,
        { headers: authHeader() }
      );

      return formatComments(res.data?.data || res.data || []);
    } catch (err) {
      console.log("Error fetching comments:", err.response?.data || err);
      return [];
    }
  };

  /* ─── Handle Like ─── */
  const handleLike = async (id) => {
    // Find which list contains this post
    let postsSet = posts;
    let setterFunc = setPosts;

    if (!posts.find((p) => p.id === id)) {
      if (archivedPosts.find((p) => p.id === id)) {
        postsSet = archivedPosts;
        setterFunc = setArchivedPosts;
      } else if (trashedPosts.find((p) => p.id === id)) {
        postsSet = trashedPosts;
        setterFunc = setTrashedPosts;
      }
    }

    setterFunc((prev) =>
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

      setterFunc((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likeLoading: false } : p))
      );
    } catch (err) {
      console.log("Error liking post:", err.response?.data || err);

      setterFunc((prev) =>
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

  /* ─── Toggle Comments ─── */
  const handleToggleComments = async (id) => {
    let postsSet = posts;
    let setterFunc = setPosts;

    if (!posts.find((p) => p.id === id)) {
      if (archivedPosts.find((p) => p.id === id)) {
        postsSet = archivedPosts;
        setterFunc = setArchivedPosts;
      } else if (trashedPosts.find((p) => p.id === id)) {
        postsSet = trashedPosts;
        setterFunc = setTrashedPosts;
      }
    }

    const post = postsSet.find((p) => p.id === id);

    if (post?.showComments) {
      setterFunc((prev) =>
        prev.map((p) => (p.id === id ? { ...p, showComments: false } : p))
      );
      return;
    }

    const comments = await fetchComments(id);

    setterFunc((prev) =>
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

        // Update in whichever list it's in
        if (posts.find((p) => p.id === id)) {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === id
                ? { ...p, showComments: true, comments, commentsCount: comments.length }
                : p
            )
          );
        } else if (archivedPosts.find((p) => p.id === id)) {
          setArchivedPosts((prev) =>
            prev.map((p) =>
              p.id === id
                ? { ...p, showComments: true, comments, commentsCount: comments.length }
                : p
            )
          );
        } else if (trashedPosts.find((p) => p.id === id)) {
          setTrashedPosts((prev) =>
            prev.map((p) =>
              p.id === id
                ? { ...p, showComments: true, comments, commentsCount: comments.length }
                : p
            )
          );
        }
      }, 300);
    } catch (err) {
      console.log("Error adding comment:", err.response?.data || err);
    }
  };

  /* ─── Create Post ─── */
  const handleSubmitPost = async ({ text, img }) => {
    try {
      const formData = new FormData();
      if (text) formData.append("content", text);
      if (img) formData.append("attachments", img);

      const res = await axios.post(`${BASE_URL}/article`, formData, {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.data) {
        const newPost = formatArticle(res.data.data);
        setPosts((prev) => [newPost, ...prev]);
        alert("Post created successfully!");
      }
    } catch (err) {
      console.log("Error creating post:", err.response?.data || err);
      alert("Error creating post. Please try again.");
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

      console.log("Updating post:", postId);

      const res = await axios.put(
        `${BASE_URL}/article/update/${postId}`,
        formData,
        {
          headers: {
            ...authHeader(),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Update response:", res.data);

      if (res.data?.data) {
        const updatedPost = formatArticle(res.data.data);
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? updatedPost : p))
        );
        alert("Post updated successfully!");
      }

      setEditingPost(null);
    } catch (err) {
      console.log("Error updating post:", err.response?.data || err);
      alert("Error updating post. Please try again.");
    }
  };

  /* ─── Archive Post ─── */
  const handleArchivePost = async (postId) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/article/archive/${postId}`,
        {},
        { headers: authHeader() }
      );

      if (res.data?.data || res.status === 200) {
        const post = posts.find((p) => p.id === postId);
        if (post) {
          setArchivedPosts((prev) => [{ ...post, isArchived: true }, ...prev]);
          setPosts((prev) => prev.filter((p) => p.id !== postId));
          alert("Post archived!");
        }
      }
    } catch (err) {
      console.log("Error archiving post:", err.response?.data || err);
      alert("Error archiving post.");
    }
  };

  /* ─── Restore Post ─── */
  const handleRestorePost = async (postId) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/article/restore/${postId}`,
        {},
        { headers: authHeader() }
      );

      if (res.data?.data || res.status === 200) {
        const post = archivedPosts.find((p) => p.id === postId);
        if (post) {
          setPosts((prev) => [{ ...post, isArchived: false }, ...prev]);
          setArchivedPosts((prev) => prev.filter((p) => p.id !== postId));
          alert("Post restored!");
        }
      }
    } catch (err) {
      console.log("Error restoring post:", err.response?.data || err);
      alert("Error restoring post.");
    }
  };

  /* ─── Delete Post (Move to Trash) ─── */
  const handleDeletePost = async (postId) => {
    try {
      const res = await axios.delete(
        `${BASE_URL}/article/${postId}`,
        { headers: authHeader() }
      );

      if (res.status === 200 || res.status === 204) {
        const post = posts.find((p) => p.id === postId) || 
                     archivedPosts.find((p) => p.id === postId);
        
        if (post) {
          setTrashedPosts((prev) => [{ ...post, isDeleted: true }, ...prev]);
          setPosts((prev) => prev.filter((p) => p.id !== postId));
          setArchivedPosts((prev) => prev.filter((p) => p.id !== postId));
          alert("Post moved to trash!");
        }
      }
    } catch (err) {
      console.log("Error deleting post:", err.response?.data || err);
      alert("Error moving post to trash.");
    }
  };

  /* ─── Undo (Restore from Trash) ─── */
  const handleUndoPost = async (postId) => {
    try {
      const res = await axios.delete(
        `${BASE_URL}/article/undo/${postId}`,
        { headers: authHeader() }
      );

      if (res.status === 200 || res.status === 204) {
        const post = trashedPosts.find((p) => p.id === postId);
        if (post) {
          setPosts((prev) => [{ ...post, isDeleted: false }, ...prev]);
          setTrashedPosts((prev) => prev.filter((p) => p.id !== postId));
          alert("Post restored from trash!");
        }
      }
    } catch (err) {
      console.log("Error restoring from trash:", err.response?.data || err);
      alert("Error restoring post.");
    }
  };

  /* ─── Permanently Delete from Trash ─── */
  const handlePermanentDelete = async (postId) => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      try {
        // Using undo endpoint to permanently delete
        const res = await axios.delete(
          `${BASE_URL}/article/${postId}`,
          { headers: authHeader() }
        );

        if (res.status === 200 || res.status === 204) {
          setTrashedPosts((prev) => prev.filter((p) => p.id !== postId));
          alert("Post permanently deleted!");
        }
      } catch (err) {
        console.log("Error permanently deleting:", err.response?.data || err);
        alert("Error deleting post.");
      }
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
          <FiList size={18} /> Feed ({posts.length})
        </button>
        <button
          className={`tab-btn ${currentTab === "archives" ? "active" : ""}`}
          onClick={() => setCurrentTab("archives")}
        >
          <FiArchive size={18} /> Archives ({archivedPosts.length})
        </button>
        <button
          className={`tab-btn ${currentTab === "trash" ? "active" : ""}`}
          onClick={() => setCurrentTab("trash")}
        >
          <FiTrash2 size={18} /> Trash ({trashedPosts.length})
        </button>
      </div>

      {/* ─── CREATE CARD (only in feed tab) ─── */}
      {currentTab === "feed" && (
        <div className="create-card">
          <div className="create-top">
            <UserAvatar size={48} />
            <button
              className="create-input"
              onClick={() => {
                setEditingPost(null);
                setModalOpen(true);
              }}
            >
              What would you like to share today?
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
              <FiImage /> Photo
            </button>

            <button
              className="create-action-btn tip"
              onClick={() => {
                setEditingPost(null);
                setModalOpen(true);
              }}
            >
              <FiZap /> Mental health tip
            </button>

            <button
              className="create-action-btn event"
              onClick={() => {
                setEditingPost(null);
                setModalOpen(true);
              }}
            >
              <FiZap /> Announcement
            </button>
          </div>
        </div>
      )}

      {/* ─── CONTENT ─── */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading posts...</p>
        </div>
      ) : currentTab === "feed" ? (
        posts.length > 0 ? (
          <div className="posts-list">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleLike(post.id)}
                onAddComment={(id, text) => handleAddComment(id, text)}
                onToggleComments={(id) => handleToggleComments(id)}
                onEdit={handleEditPost}
                onArchive={handleArchivePost}
                onRestore={() => {}}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No posts yet</h3>
            <p>Create your first post to connect with patients and share insights</p>
            <button
              className="empty-action-btn"
              onClick={() => {
                setEditingPost(null);
                setModalOpen(true);
              }}
            >
              <FiZap /> Create Post
            </button>
          </div>
        )
      ) : currentTab === "archives" ? (
        archivedPosts.length > 0 ? (
          <div className="posts-list">
            {archivedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleLike(post.id)}
                onAddComment={(id, text) => handleAddComment(id, text)}
                onToggleComments={(id) => handleToggleComments(id)}
                onEdit={() => {}}
                onArchive={() => {}}
                onRestore={() => handleRestorePost(post.id)}
                onDelete={handleDeletePost}
                showMenuOptions={false}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No archived posts</h3>
            <p>Posts you archive will appear here</p>
          </div>
        )
      ) : (
        <div className="trash-section">
          {trashedPosts.length > 0 ? (
            <div className="posts-list">
              {trashedPosts.map((post) => (
                <div key={post.id} className="trash-post-item">
                  <div className="trash-post-content">
                    <PostCard
                      post={post}
                      onLike={() => handleLike(post.id)}
                      onAddComment={(id, text) => handleAddComment(id, text)}
                      onToggleComments={(id) => handleToggleComments(id)}
                      onEdit={() => {}}
                      onArchive={() => {}}
                      onRestore={() => {}}
                      onDelete={() => {}}
                      showMenuOptions={false}
                    />
                  </div>
                  <div className="trash-post-actions">
                    <button
                      className="trash-restore-btn"
                      onClick={() => handleUndoPost(post.id)}
                      title="Restore from trash"
                    >
                      <FiRotateCcw /> Restore
                    </button>
                    <button
                      className="trash-delete-btn"
                      onClick={() => handlePermanentDelete(post.id)}
                      title="Permanently delete"
                    >
                      <FiTrash2 /> Delete Forever
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🗑️</div>
              <h3>Trash is empty</h3>
              <p>Deleted posts will appear here</p>
            </div>
          )}
        </div>
      )}

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