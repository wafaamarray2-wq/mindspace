import { useState, useRef } from "react";
import {
  FiImage, FiSmile, FiLink, FiSend, FiMoreHorizontal,
  FiHeart, FiMessageCircle, FiShare2, FiX,
  FiCalendar, FiZap, FiGlobe,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import "./Therapistfeed.css"

/* ─── helpers ──────────────────────────────────── */
function Avatar({ text = "?", size = 42, bg = "#CECBF6", color = "#3C3489" }) {
  return (
    <div
      className="tf-avatar"
      style={{ width: size, height: size, minWidth: size, background: bg, color }}
    >
      {text}
    </div>
  );
}

/* ─── comment item ──────────────────────────────── */
function CommentItem({ comment }) {
  return (
    <div className="tf-comment-item">
      <Avatar text={comment.initials} size={30} />
      <div>
        <div className="tf-comment-bubble">
          <div className="tf-comment-author">{comment.author}</div>
          <div>{comment.text}</div>
        </div>
        <div className="tf-comment-time">{comment.time}</div>
      </div>
    </div>
  );
}

/* ─── single post card ──────────────────────────── */
function PostCard({ post, onLike, onAddComment, onToggleComments }) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    if (!draft.trim()) return;
    onAddComment(post.id, draft.trim());
    setDraft("");
  };

  return (
    <div className="tf-post-card">
      {/* header */}
      <div className="tf-post-top">
        <Avatar text={post.initials} />
        <div className="tf-post-meta">
          <div className="tf-post-name">
            {post.author}
            <span className="tf-badge">Therapist</span>
          </div>
          <div className="tf-post-time">{post.time}</div>
        </div>
        <button className="tf-icon-btn"><FiMoreHorizontal /></button>
      </div>

      {/* text */}
      {post.text && <p className="tf-post-text">{post.text}</p>}

      {/* image */}
      {post.img && (
        <img className="tf-post-img" src={post.img} alt="post" />
      )}

      {/* stats */}
      <div className="tf-post-stats">
        <span>
          <FaHeart style={{ color: "#D4537E", fontSize: 12, verticalAlign: -1 }} />{" "}
          {post.likes} like{post.likes !== 1 ? "s" : ""}
        </span>
        <button className="tf-stat-link" onClick={() => onToggleComments(post.id)}>
          {post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}
        </button>
      </div>

      {/* reaction bar */}
      <div className="tf-reactions">
        <button
          className={`tf-react-btn${post.liked ? " liked" : ""}`}
          onClick={() => onLike(post.id)}
        >
          {post.liked ? <FaHeart style={{ color: "#D4537E" }} /> : <FiHeart />}
          {post.liked ? "Liked" : "Like"}
        </button>
        <button className="tf-react-btn" onClick={() => onToggleComments(post.id)}>
          <FiMessageCircle /> Comment
        </button>
        <button className="tf-react-btn">
          <FiShare2 /> Share
        </button>
      </div>

      {/* comments */}
      {post.showComments && (
        <div className="tf-comments">
          {post.comments.map((c, i) => (
            <CommentItem key={i} comment={c} />
          ))}

          <div className="tf-comment-input-row">
            <Avatar text="Dr" size={32} />
            <input
              className="tf-comment-input"
              placeholder="Write a comment..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
              }}
            />
            <button className="tf-send-btn" onClick={submit}>
              <FiSend />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── create-post modal ─────────────────────────── */
function CreateModal({ open, onClose, onSubmit, docName }) {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImg(URL.createObjectURL(file));
  };

  const submit = () => {
    if (!text.trim() && !img) return;
    onSubmit({ text: text.trim(), img });
    setText("");
    setImg(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="tf-modal-overlay" onClick={onClose}>
      <div className="tf-modal" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="tf-modal-header">
          <h3>Create post</h3>
          <button className="tf-icon-btn" onClick={onClose}><FiX /></button>
        </div>

        {/* author row */}
        <div className="tf-modal-author">
          <Avatar text="Dr" />
          <div>
            <div className="tf-modal-name">Dr. {docName || "Ahmed"}</div>
            <div className="tf-modal-sub">
              <FiGlobe style={{ verticalAlign: -2 }} /> Public · Therapist
            </div>
          </div>
        </div>

        {/* textarea */}
        <textarea
          className="tf-modal-textarea"
          placeholder="Share a tip, session highlight, or mental health insight..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          autoFocus
        />

        {/* image preview */}
        {img && (
          <div className="tf-preview-wrap">
            <img src={img} alt="preview" />
            <button className="tf-remove-img" onClick={() => setImg(null)}>
              <FiX />
            </button>
          </div>
        )}

        {/* footer */}
        <div className="tf-modal-footer">
          <div className="tf-modal-tools">
            <button
              className="tf-icon-btn"
              title="Add photo"
              onClick={() => fileRef.current.click()}
            >
              <FiImage />
            </button>
            <button className="tf-icon-btn" title="Add emoji"><FiSmile /></button>
            <button className="tf-icon-btn" title="Add link"><FiLink /></button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFile}
          />
          <button
            className="tf-post-btn"
            disabled={!text.trim() && !img}
            onClick={submit}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN FEED ─────────────────────────────────── */
const DEMO_POSTS = [
  {
    id: 1,
    author: "Dr. Ahmed",
    initials: "Dr",
    time: "2h ago",
    text: "Reminder: taking 10 minutes to breathe deeply and check in with yourself is not a luxury — it is a necessity. Your mental health matters just as much as your physical health. 💙",
    img: null,
    likes: 47,
    liked: false,
    comments: [
      { author: "Sara M.", initials: "SM", text: "Thank you for the reminder, doctor!", time: "1h ago" },
      { author: "Khaled R.", initials: "KR", text: "Really needed to hear this today.", time: "45m ago" },
    ],
    showComments: true,
  },
  {
    id: 2,
    author: "Dr. Ahmed",
    initials: "Dr",
    time: "Yesterday",
    text: "New session slots available this week! If you or someone you know needs support, don't hesitate to reach out. Early intervention makes a real difference. 🌿",
    img: null,
    likes: 31,
    liked: false,
    comments: [
      { author: "Nour A.", initials: "NA", text: "Booked! Looking forward to it.", time: "23h ago" },
    ],
    showComments: false,
  },
];

export default function TherapistFeed({ user }) {
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [triggerPhoto, setTriggerPhoto] = useState(false);

  const openModal = (withPhoto = false) => {
    setTriggerPhoto(withPhoto);
    setModalOpen(true);
  };

  const handleLike = (id) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleToggleComments = (id) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, showComments: !p.showComments } : p))
    );
  };

  const handleAddComment = (id, text) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              comments: [
                ...p.comments,
                { author: `Dr. ${user?.userName || "Ahmed"}`, initials: "Dr", text, time: "Just now" },
              ],
              showComments: true,
            }
          : p
      )
    );
  };

  const handleSubmitPost = ({ text, img }) => {
    setPosts((prev) => [
      {
        id: Date.now(),
        author: `Dr. ${user?.userName || "Ahmed"}`,
        initials: "Dr",
        time: "Just now",
        text,
        img,
        likes: 0,
        liked: false,
        comments: [],
        showComments: true,
      },
      ...prev,
    ]);
  };

  const docName = user?.userName || "Ahmed";

  return (
    <div className="tf-feed-wrap">
      {/* ── Create post bar ── */}
      <div className="tf-create-card">
        <div className="tf-create-top">
          <Avatar text="Dr" />
          <button className="tf-create-input" onClick={() => openModal()}>
            What would you like to share today?
          </button>
        </div>
        <div className="tf-create-actions">
          <button className="tf-action-btn photo" onClick={() => openModal(true)}>
            <FiImage /> Photo
          </button>
          <button className="tf-action-btn tip" onClick={() => openModal()}>
            <FiZap /> Mental health tip
          </button>
          <button className="tf-action-btn event" onClick={() => openModal()}>
            <FiCalendar /> Session announcement
          </button>
        </div>
      </div>

      {/* ── Posts ── */}
      {posts.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          onLike={handleLike}
          onAddComment={handleAddComment}
          onToggleComments={handleToggleComments}
        />
      ))}

      {/* ── Modal ── */}
      <CreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitPost}
        docName={docName}
        autoPhoto={triggerPhoto}
      />
    </div>
  );
}