import { useState, useRef, useEffect } from "react";
import {
  FiSearch,
  FiFilter,
  FiHeart,
  FiMessageCircle,
  FiBookmark,
  FiMoreHorizontal,
  FiSend,
  FiX,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import "./Patientfeed.css";
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
function Avatar({ initials, color = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", size = 44 }) {
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
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
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
function PostCard({ post, onLike, onAddComment, onToggleComments, userImage, userName }) {
  const [draft, setDraft] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);

  const submit = () => {
    if (!draft.trim()) return;
    onAddComment(post.id, draft.trim());
    setDraft("");
  };

  const colorGradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  ];

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
        <button className="post-menu-btn" title="More options">
          <FiMoreHorizontal />
        </button>
      </div>

      {/* Content */}
      {post.text && (
        <div className="post-content">
          <h3 className="post-title">{post.text.split("\n")[0]}</h3>
          <p className="post-description">
            {post.text.length > 200 ? `${post.text.substring(0, 200)}...` : post.text}
          </p>
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
          onClick={() => {
            onToggleComments(post.id);
            setShowCommentForm(!showCommentForm);
          }}
        >
          <FiMessageCircle className="icon" />
          <span>Comment</span>
        </button>

        <button className="action-btn">
          <FiBookmark className="icon" />
          <span>Save</span>
        </button>
      </div>

      {/* Comments Section */}
      {post.showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {post.comments.length > 0 ? (
              post.comments.map((c, i) => (
                <CommentItem key={i} comment={c} />
              ))
            ) : (
              <div className="no-comments">No comments yet</div>
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
                placeholder="Write a comment..."
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
    publisher: article.publisher,
    text: article.content,
    img: article.attachments?.[0]?.secure_url || null,
    likes: article.likes?.length || 0,
    liked,
    likeLoading: false,
    comments: [],
    commentsCount: 0,
    showComments: false,
    time: formatTime(article.createdAt),
  };
}

/* ─── MAIN COMPONENT ─── */
export default function PatientFeed() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [userImage, setUserImage] = useState(null);
  const [userName, setUserName] = useState("Patient");

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

      const formattedPosts = await Promise.all(
        articles.map(async (article) => {
          const comments = await fetchComments(article._id);
          return formatArticle(article);
        })
      );

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
            <h1 className="header-title">Mental Health Feed</h1>
            <p className="header-subtitle">
              Connect with mental health professionals and discover valuable insights
            </p>
          </div>

          <div className="header-controls">
            <div className="search-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search doctors or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="filter-btn">
              <FiFilter />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Posts Feed ─── */}
      <main className="feed-main">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading posts...</p>
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
                userImage={userImage}
                userName={userName}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No posts found</h3>
            <p>Try adjusting your search terms</p>
          </div>
        )}
      </main>
    </div>
  );
}