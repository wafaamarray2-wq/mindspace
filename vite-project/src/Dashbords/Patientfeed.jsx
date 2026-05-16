import { useState, useRef, useEffect } from "react";
import {
  FiSmile,
  FiSend,
  FiMoreHorizontal,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiX,
  FiFilter,
  FiSearch,
} from "react-icons/fi";

import { FaHeart } from "react-icons/fa";

import { useDashUser } from "../Dashbords/DoctorDashbord";

import "./PatientFeed.css";

import axios from "axios";

const BASE_URL = "https://mind-space-ov3r.onrender.com";

/* ─── Helper: get userId from JWT ────── */
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

/* ─── Helper: get auth header ────────── */
function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `dash ${token}` };
}

/* ─── Avatar ───────────────────────────── */
function Avatar({
  text = "?",
  size = 42,
  bg = "#CECBF6",
  color = "#3C3489",
}) {
  return (
    <div
      className="pf-avatar"
      style={{ width: size, height: size, minWidth: size, background: bg, color }}
    >
      {text}
    </div>
  );
}

/* ─── Doctor Avatar ─────────────────────── */
function DoctorAvatar({ doctor, size = 42 }) {
  if (doctor?.pfp?.secure_url) {
    return (
      <img
        src={doctor.pfp.secure_url}
        alt="avatar"
        style={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }

  const initial = doctor?.userName?.charAt(0)?.toUpperCase() || "D";
  return <Avatar text={initial} size={size} />;
}

/* ─── Comment Item ────────────────────── */
function CommentItem({ comment, userImage }) {
  return (
    <div className="pf-comment-item">
      {userImage ? (
        <img
          src={userImage}
          alt="avatar"
          style={{
            width: 30,
            height: 30,
            minWidth: 30,
            borderRadius: "50%",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      ) : (
        <Avatar text={comment.author.charAt(0)} size={30} />
      )}
      <div>
        <div className="pf-comment-bubble">
          <div className="pf-comment-author">{comment.author}</div>
          <div>{comment.text}</div>
        </div>
        <div className="pf-comment-time">{comment.time}</div>
      </div>
    </div>
  );
}

/* ─── Post Card ───────────────────────── */
function PostCard({ post, onLike, onAddComment, onToggleComments, userImage, userName }) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    if (!draft.trim()) return;
    onAddComment(post.id, draft.trim());
    setDraft("");
  };

  return (
    <div className="pf-post-card">
      {/* Header */}
      <div className="pf-post-top">
        <DoctorAvatar doctor={post.publisher} size={30} />
        <div className="pf-post-meta">
          <div className="pf-post-name">
            Dr. {post.publisher?.userName || "Doctor"}
            <span className="pf-badge">{post.publisher?.specialization || "Therapist"}</span>
          </div>
          <div className="pf-post-time">{post.time}</div>
        </div>
        <button className="pf-icon-btn">
          <FiMoreHorizontal />
        </button>
      </div>

      {/* Text */}
      {post.text && <p className="pf-post-text">{post.text}</p>}

      {/* Image */}
      {post.img && (
        <img className="pf-post-img" src={post.img} alt="post" />
      )}

      {/* Stats */}
      <div className="pf-post-stats">
        <span>
          <FaHeart style={{ color: "#D4537E", fontSize: 12, verticalAlign: -1 }} />{" "}
          {post.likes} like{post.likes !== 1 ? "s" : ""}
        </span>

        <button
          className="pf-stat-link"
          onClick={() => onToggleComments(post.id)}
        >
          {post.commentsCount ?? post.comments.length} comment
          {(post.commentsCount ?? post.comments.length) !== 1 ? "s" : ""}
        </button>
      </div>

      {/* Reactions */}
      <div className="pf-reactions">
        <button
          className={`pf-react-btn${post.liked ? " liked" : ""}`}
          onClick={() => onLike(post.id)}
          disabled={post.likeLoading}
        >
          {post.liked ? (
            <FaHeart style={{ color: "#D4537E" }} />
          ) : (
            <FiHeart />
          )}
          {post.liked ? "Liked" : "Like"}
        </button>

        <button
          className="pf-react-btn"
          onClick={() => onToggleComments(post.id)}
        >
          <FiMessageCircle /> Comment
        </button>

        <button className="pf-react-btn">
          <FiShare2 /> Share
        </button>
      </div>

      {/* Comments */}
      {post.showComments && (
        <div className="pf-comments">
          {post.comments.map((c, i) => (
            <CommentItem key={i} comment={c} userImage={c.userImage} />
          ))}

          <div className="pf-comment-input-row">
            {userImage ? (
              <img
                src={userImage}
                alt="avatar"
                style={{
                  width: 32,
                  height: 32,
                  minWidth: 32,
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
            ) : (
              <Avatar text={userName?.charAt(0) || "U"} size={32} />
            )}
            <input
              className="pf-comment-input"
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
            <button className="pf-send-btn" onClick={submit}>
              <FiSend />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Helper: format comments ─────────── */
function formatComments(rawComments = [], userImage = null) {
  return rawComments.map((c) => ({
    author:
      c.author?.userName ||
      c.userId?.userName ||
      c.user?.userName ||
      "User",
    text: c.content,
    time: c.createdAt
      ? new Date(c.createdAt).toLocaleDateString()
      : "Recently",
    userImage: userImage,
  }));
}

/* ─── Helper: format article ──────────── */
function formatArticle(article, extra = {}) {
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
    time: article.createdAt
      ? new Date(article.createdAt).toLocaleDateString()
      : "Recently",
    ...extra,
  };
}

/* ─── MAIN FEED ───────────────────────── */
export default function PatientFeed() {
  const dashUser = useDashUser() || {};
  const user = dashUser.user || {};
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  /* ─── 1. Fetch Comments ─────────── */
  const fetchComments = async (articleId) => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) return [];

      const res = await axios.get(
        `${BASE_URL}/article/${articleId}/comment/${userId}`,
        { headers: authHeader() }
      );

      const comments = res.data?.data || res.data || [];
      
      return formatComments(comments, user?.pfp?.secure_url);
    } catch (err) {
      console.log(err.response?.data || err);
      return [];
    }
  };

  /* ─── 2. Fetch Posts ────────────── */
  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/article`, {
        headers: authHeader(),
      });

      const articles = res.data.data;

      const formattedPosts = await Promise.all(
        articles.map(async (article) => {
          const comments = await fetchComments(article._id);
          return formatArticle(article, {
            comments,
            commentsCount: comments.length,
          });
        })
      );

      setPosts(formattedPosts);
    } catch (err) {
      console.log(err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  /* ─── 3. Like / Unlike ──────────── */
  const handleLike = async (id) => {
    // Optimistic update
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

      // الـ like نجح - ما نرجع للقديم
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, likeLoading: false } : p
        )
      );
    } catch (err) {
      console.log(err.response?.data || err);

      // لو فشل - ارجع للحالة القديمة
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

  /* ─── 4. Toggle Comments ────────── */
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

  /* ─── 5. Add Comment ────────────── */
  const handleAddComment = async (id, text) => {
    try {
      const userId = getUserIdFromToken();

      await axios.post(
        `${BASE_URL}/article/${id}/comment/${userId}`,
        { content: text },
        { headers: authHeader() }
      );

      // الإنتظار قليلاً قبل Refresh الكومنتات
      setTimeout(async () => {
        const comments = await fetchComments(id);

        setPosts((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, showComments: true, comments, commentsCount: comments.length }
              : p
          )
        );
      }, 500);
    } catch (err) {
      console.log(err.response?.data || err);
    }
  };

  /* ─── Filtered Posts ─────────────── */
  const filteredPosts = posts.filter((p) => {
    const matchesSearch = 
      p.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.publisher?.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="pf-feed-wrap">
      {/* Header */}
      <div className="pf-header">
        <h2>Therapist feed</h2>
        <div className="pf-header-actions">
          <div className="pf-search-box">
            {user?.pfp?.secure_url ? (
              <img
                src={user.pfp.secure_url}
                alt="avatar"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
            ) : (
              <FiSearch />
            )}
            <input
              type="text"
              placeholder="Search doctors or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="pf-filter-btn">
            <FiFilter /> Filter
          </button>
        </div>
      </div>

      {/* Posts */}
      {filteredPosts.length > 0 ? (
        filteredPosts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            onLike={handleLike}
            onAddComment={handleAddComment}
            onToggleComments={handleToggleComments}
            userImage={user?.pfp?.secure_url}
            userName={user?.userName}
          />
        ))
      ) : (
        <div className="pf-empty">
          <p>No posts found</p>
        </div>
      )}
    </div>
  );
}