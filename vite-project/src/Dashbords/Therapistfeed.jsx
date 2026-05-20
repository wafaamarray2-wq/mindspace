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

/* ─── Post Card ─── */
function PostCard({ post, onLike, onAddComment, onToggleComments }) {
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
        <button className="post-menu-btn" title="More options">
          <FiMoreHorizontal />
        </button>
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
function CreateModal({ open, onClose, onSubmit, docName }) {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImg(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = () => {
    if (!text.trim() && !img) return;
    onSubmit({ text: text.trim(), img });
    setText("");
    setImg(null);
    setPreview(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share a post</h3>
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
            disabled={!text.trim() && !img}
            onClick={submit}
          >
            Share Post
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
    time: formatTime(article.createdAt),
  };
}

/* ─── MAIN COMPONENT ─── */
export default function ProfessionalTherapistFeed() {
  const { user } = useDashUser();
  const [posts, setPosts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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

  /* ─── Fetch Posts ─── */
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/article`, {
        headers: authHeader(),
      });

      const articles = res.data.data || [];

      const formattedPosts = articles.map((article) => {
        return formatArticle(article);
      });

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

  /* ─── Toggle Comments ─── */
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

  /* ─── Create Post ─── */
  const handleSubmitPost = async ({ text, img }) => {
    try {
      const formData = new FormData();
      formData.append("content", text);
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
      }
    } catch (err) {
      console.log("Error creating post:", err.response?.data || err);
    }
  };

  return (
    <div className="feed-container">
      {/* ─── Create Card ─── */}
      <div className="create-card">
        <div className="create-top">
          <UserAvatar size={48} />
          <button
            className="create-input"
            onClick={() => setModalOpen(true)}
          >
            What would you like to share today?
          </button>
        </div>

        <div className="create-actions">
          <button
            className="create-action-btn photo"
            onClick={() => setModalOpen(true)}
          >
            <FiImage /> Photo
          </button>

          <button
            className="create-action-btn tip"
            onClick={() => setModalOpen(true)}
          >
            <FiZap /> Mental health tip
          </button>

          <button
            className="create-action-btn event"
            onClick={() => setModalOpen(true)}
          >
            <FiZap /> Announcement
          </button>
        </div>
      </div>

      {/* ─── Posts Feed ─── */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading posts...</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="posts-list">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onAddComment={handleAddComment}
              onToggleComments={handleToggleComments}
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
            onClick={() => setModalOpen(true)}
          >
            <FiZap /> Create Post
          </button>
        </div>
      )}

      {/* ─── Modal ─── */}
      <CreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitPost}
        docName={user?.userName}
      />
    </div>
  );
}