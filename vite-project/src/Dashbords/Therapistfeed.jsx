import { useState, useRef, useEffect } from "react";
import {
  FiImage,
  FiSmile,
  FiLink,
  FiSend,
  FiMoreHorizontal,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiX,
  FiCalendar,
  FiZap,
  FiGlobe,
} from "react-icons/fi";

import { FaHeart } from "react-icons/fa";

import { useDashUser } from "../Dashbords/DoctorDashbord";

import "./Therapistfeed.css";

import axios from "axios";

/* ─── Avatar ───────────────────────────── */
function Avatar({
  text = "?",
  size = 42,
  bg = "#CECBF6",
  color = "#3C3489",
}) {
  return (
    <div
      className="tf-avatar"
      style={{
        width: size,
        height: size,
        minWidth: size,
        background: bg,
        color,
      }}
    >
      {text}
    </div>
  );
}

/* ─── User Avatar ─────────────────────── */
function UserAvatar({ size = 42 }) {
  const { user } = useDashUser();

  if (user?.pfp?.secure_url) {
    return (
      <img
        src={user.pfp.secure_url}
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

  const initial =
    user?.userName?.charAt(0)?.toUpperCase() || "D";

  return <Avatar text={initial} size={size} />;
}

/* ─── Comment Item ────────────────────── */
function CommentItem({ comment }) {
  return (
    <div className="tf-comment-item">
      <Avatar text={comment.initials} size={30} />

      <div>
        <div className="tf-comment-bubble">
          <div className="tf-comment-author">
            {comment.author}
          </div>

          <div>{comment.text}</div>
        </div>

        <div className="tf-comment-time">
          {comment.time}
        </div>
      </div>
    </div>
  );
}

/* ─── Post Card ───────────────────────── */
function PostCard({
  post,
  onLike,
  onAddComment,
  onToggleComments,
}) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    if (!draft.trim()) return;

    onAddComment(post.id, draft.trim());

    setDraft("");
  };

  return (
    <div className="tf-post-card">
      {/* Header */}
      <div className="tf-post-top">
        <Avatar text={post.initials} />

        <div className="tf-post-meta">
          <div className="tf-post-name">
            {post.author}

            <span className="tf-badge">
              Therapist
            </span>
          </div>

          <div className="tf-post-time">
            {post.time}
          </div>
        </div>

        <button className="tf-icon-btn">
          <FiMoreHorizontal />
        </button>
      </div>

      {/* Text */}
      {post.text && (
        <p className="tf-post-text">
          {post.text}
        </p>
      )}

      {/* Image */}
      {post.img && (
        <img
          className="tf-post-img"
          src={post.img}
          alt="post"
        />
      )}

      {/* Stats */}
      <div className="tf-post-stats">
        <span>
          <FaHeart
            style={{
              color: "#D4537E",
              fontSize: 12,
              verticalAlign: -1,
            }}
          />{" "}
          {post.likes} like
          {post.likes !== 1 ? "s" : ""}
        </span>

        <button
          className="tf-stat-link"
          onClick={() =>
            onToggleComments(post.id)
          }
        >
          {post.comments.length} comment
          {post.comments.length !== 1
            ? "s"
            : ""}
        </button>
      </div>

      {/* Reactions */}
      <div className="tf-reactions">
        <button
          className={`tf-react-btn${
            post.liked ? " liked" : ""
          }`}
          onClick={() => onLike(post.id)}
        >
          {post.liked ? (
            <FaHeart
              style={{ color: "#D4537E" }}
            />
          ) : (
            <FiHeart />
          )}

          {post.liked ? "Liked" : "Like"}
        </button>

        <button
          className="tf-react-btn"
          onClick={() =>
            onToggleComments(post.id)
          }
        >
          <FiMessageCircle /> Comment
        </button>

        <button className="tf-react-btn">
          <FiShare2 /> Share
        </button>
      </div>

      {/* Comments */}
      {post.showComments && (
        <div className="tf-comments">
          {post.comments.map((c, i) => (
            <CommentItem
              key={i}
              comment={c}
            />
          ))}

          <div className="tf-comment-input-row">
            <UserAvatar size={32} />

            <input
              className="tf-comment-input"
              placeholder="Write a comment..."
              value={draft}
              onChange={(e) =>
                setDraft(e.target.value)
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();

                  submit();
                }
              }}
            />

            <button
              className="tf-send-btn"
              onClick={submit}
            >
              <FiSend />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Create Modal ────────────────────── */
function CreateModal({
  open,
  onClose,
  onSubmit,
  docName,
}) {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [preview, setPreview] =
    useState(null);

  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImg(file);

    setPreview(
      URL.createObjectURL(file)
    );
  };

  const submit = () => {
    if (!text.trim() && !img) return;

    onSubmit({
      text: text.trim(),
      img,
    });

    setText("");
    setImg(null);
    setPreview(null);

    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="tf-modal-overlay"
      onClick={onClose}
    >
      <div
        className="tf-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {/* Header */}
        <div className="tf-modal-header">
          <h3>Create post</h3>

          <button
            className="tf-icon-btn"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        {/* Author */}
        <div className="tf-modal-author">
          <UserAvatar size={42} />

          <div>
            <div className="tf-modal-name">
              Dr. {docName || "Ahmed"}
            </div>

            <div className="tf-modal-sub">
              <FiGlobe
                style={{
                  verticalAlign: -2,
                }}
              />{" "}
              Public · Therapist
            </div>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          className="tf-modal-textarea"
          placeholder="Share a tip, session highlight, or mental health insight..."
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          rows={5}
          autoFocus
        />

        {/* Preview */}
        {preview && (
          <div className="tf-preview-wrap">
            <img
              src={preview}
              alt="preview"
            />

            <button
              className="tf-remove-img"
              onClick={() => {
                setImg(null);
                setPreview(null);
              }}
            >
              <FiX />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="tf-modal-footer">
          <div className="tf-modal-tools">
            <button
              className="tf-icon-btn"
              title="Add photo"
              onClick={() =>
                fileRef.current.click()
              }
            >
              <FiImage />
            </button>

            <button
              className="tf-icon-btn"
              title="Add emoji"
            >
              <FiSmile />
            </button>

            <button
              className="tf-icon-btn"
              title="Add link"
            >
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
            className="tf-post-btn"
            disabled={
              !text.trim() && !img
            }
            onClick={submit}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN FEED ───────────────────────── */
export default function TherapistFeed() {
  const { user } = useDashUser();

  const [posts, setPosts] = useState(
    []
  );

  const [modalOpen, setModalOpen] =
    useState(false);

  /* ─── Fetch Posts ───────────────── */
  const fetchPosts = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const res = await axios.get(
        "https://mind-space-ov3r.onrender.com/article",
        {
          headers: {
            Authorization: `dash ${token}`,
          },
        }
      );

      console.log(res.data);

      const formattedPosts =
        res.data.data.map((article) => ({
          ...article,

          id: article._id,

          author: `Dr. ${
            article.publisher
              ?.userName || "Ahmed"
          }`,

          initials:
            article.publisher?.userName
              ?.charAt(0)
              ?.toUpperCase() || "D",

          text: article.content,

          img:
            article.attachments?.[0]
              ?.secure_url || null,

          likes:
            article.likes?.length || 0,

          liked: false,

          comments: [],

          showComments: false,

          time: "Recently",
        }));

      setPosts(formattedPosts);
    } catch (err) {
      console.log(
        err.response?.data || err
      );
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  /* ─── Like ─────────────────────── */
  const handleLike = (id) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked
                ? p.likes - 1
                : p.likes + 1,
            }
          : p
      )
    );
  };

  /* ─── Toggle Comments ─────────── */
  const handleToggleComments = (
    id
  ) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              showComments:
                !p.showComments,
            }
          : p
      )
    );
  };

  /* ─── Add Comment ─────────────── */
  const handleAddComment = (
    id,
    text
  ) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,

              comments: [
                ...p.comments,

                {
                  author: `Dr. ${
                    user?.userName ||
                    "Ahmed"
                  }`,

                  initials:
                    user?.userName
                      ?.charAt(0)
                      ?.toUpperCase() ||
                    "D",

                  text,

                  time: "Just now",
                },
              ],

              showComments: true,
            }
          : p
      )
    );
  };

  /* ─── Create Post ─────────────── */
  const handleSubmitPost = async ({
    text,
    img,
  }) => {
    try {
      const token =
        localStorage.getItem("token");

      const formData = new FormData();

      formData.append(
        "content",
        text
      );

      if (img) {
        formData.append(
          "attachments",
          img
        );
      }

      const res = await axios.post(
        "https://mind-space-ov3r.onrender.com/article",
        formData,
        {
          headers: {
            Authorization: `dash ${token}`,
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      console.log(res.data);

      if (res.data?.data) {
        const article =
          res.data.data;

        const newPost = {
          ...article,

          id: article._id,

          author: `Dr. ${
            user?.userName || "Ahmed"
          }`,

          initials:
            user?.userName
              ?.charAt(0)
              ?.toUpperCase() || "D",

          text: article.content,

          img:
            article.attachments?.[0]
              ?.secure_url || null,

          likes:
            article.likes?.length || 0,

          liked: false,

          comments: [],

          showComments: false,

          time: "Just now",
        };

        setPosts((prev) => [
          newPost,
          ...prev,
        ]);
      }
    } catch (err) {
      console.log(
        err.response?.data || err
      );
    }
  };

  return (
    <div className="tf-feed-wrap">
      {/* Create Card */}
      <div className="tf-create-card">
        <div className="tf-create-top">
          <UserAvatar size={42} />

          <button
            className="tf-create-input"
            onClick={() =>
              setModalOpen(true)
            }
          >
            What would you like to share today?
          </button>
        </div>

        <div className="tf-create-actions">
          <button
            className="tf-action-btn photo"
            onClick={() =>
              setModalOpen(true)
            }
          >
            <FiImage /> Photo
          </button>

          <button
            className="tf-action-btn tip"
            onClick={() =>
              setModalOpen(true)
            }
          >
            <FiZap /> Mental health tip
          </button>

          <button
            className="tf-action-btn event"
            onClick={() =>
              setModalOpen(true)
            }
          >
            <FiCalendar /> Session
            announcement
          </button>
        </div>
      </div>

      {/* Posts */}
      {posts.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          onLike={handleLike}
          onAddComment={
            handleAddComment
          }
          onToggleComments={
            handleToggleComments
          }
        />
      ))}

      {/* Modal */}
      <CreateModal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        onSubmit={
          handleSubmitPost
        }
        docName={user?.userName}
      />
    </div>
  );
}