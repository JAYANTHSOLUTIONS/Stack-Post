import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { gsap } from 'gsap';

// Safely parse and format relative time strings
function formatRelativeTime(timestamp) {
  if (!timestamp) return 'just now';
  const postDate = new Date(timestamp);
  if (isNaN(postDate.getTime())) return 'just now';

  const now = new Date();
  const diffInSeconds = Math.floor((now - postDate) / 1000);
  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return postDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/* ---------- Post Card ---------- */
function PostCard({ post, index }) {
  const cardRef = useRef(null);
  const commentsRef = useRef(null);
  const heartRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState('');

  // Entry animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 40,
        opacity: 0,
        scale: 0.96,
        duration: 0.7,
        ease: 'power3.out',
        delay: index * 0.08,
      });
    }, cardRef);
    return () => ctx.revert();
  }, [index]);

  // Comment reveal animation
  useEffect(() => {
    if (!commentsRef.current) return;
    if (showComments) {
      gsap.fromTo(
        commentsRef.current,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.45, ease: 'power2.out' },
      );
    }
  }, [showComments]);

  const handleLike = () => {
    setLiked((v) => !v);
    setLikes((n) => (liked ? n - 1 : n + 1));
    gsap.fromTo(
      heartRef.current,
      { scale: 1 },
      { scale: 1.6, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' },
    );
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setComments((c) => [...c, { id: Date.now(), text: draft.trim() }]);
    setDraft('');
  };

  return (
    <article ref={cardRef} className="fc-card">
      {post.postImage && (
        <img src={post.postImage} className="fc-card-img" alt="Post media" />
      )}

      <div className="fc-card-body">
        <div className="fc-card-text" dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>

      <div className="fc-actions">
        <button
          type="button"
          className={`fc-icon-btn ${liked ? 'is-liked' : ''}`}
          onClick={handleLike}
          aria-label="Like"
        >
          <span ref={heartRef} className="fc-heart">{liked ? '♥' : '♡'}</span>
          <span className="fc-count">{likes}</span>
        </button>

        <button
          type="button"
          className="fc-icon-btn"
          onClick={() => setShowComments((v) => !v)}
          aria-label="Comment"
        >
          <span className="fc-bubble">💬</span>
          <span className="fc-count">{comments.length}</span>
        </button>

        <span className="fc-timestamp">{formatRelativeTime(post.timestamp)}</span>
      </div>

      {showComments && (
        <div ref={commentsRef} className="fc-comments">
          <ul className="fc-comment-list">
            {comments.length === 0 ? (
              <li className="fc-comment-empty">Be the first to comment.</li>
            ) : (
              comments.map((c) => (
                <li key={c.id} className="fc-comment-item">{c.text}</li>
              ))
            )}
          </ul>
          <form className="fc-comment-form" onSubmit={handleAddComment}>
            <input
              type="text"
              className="fc-comment-input"
              placeholder="Add a comment…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" className="fc-submit-btn">Post</button>
          </form>
        </div>
      )}
    </article>
  );
}

/* ---------- Main Composer ---------- */
export default function FeedComposer() {
  const ctx = useOutletContext?.() || {};
  const posts = ctx.posts;

  const headerRef = useRef(null);
  const btnRef = useRef(null);

  useLayoutEffect(() => {
    const gctx = gsap.context(() => {
      gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.6, ease: 'power3.out' });
      gsap.from(btnRef.current, { scale: 0.8, opacity: 0, duration: 0.5, ease: 'back.out(2)', delay: 0.15 });
    });
    return () => gctx.revert();
  }, []);

  const onBtnEnter = () => gsap.to(btnRef.current, { scale: 1.05, y: -2, duration: 0.25, ease: 'power2.out' });
  const onBtnLeave = () => gsap.to(btnRef.current, { scale: 1, y: 0, duration: 0.25, ease: 'power2.out' });
  const onBtnDown = () => gsap.to(btnRef.current, { scale: 0.95, duration: 0.1 });
  const onBtnUp = () => gsap.to(btnRef.current, { scale: 1.05, duration: 0.15 });

  return (
    <>
      <style>{css}</style>
      <div className="fc-wrap">
        <header ref={headerRef} className="fc-header">
          <h1 className="fc-title">Active Feed Queue</h1>
          <p className="fc-subtitle">Text entries committed to your local queue.</p>
        </header>

        <Link to="/Type" className="fc-btn-link">
          <button
            ref={btnRef}
            type="button"
            className="fc-primary-btn"
            onMouseEnter={onBtnEnter}
            onMouseLeave={onBtnLeave}
            onMouseDown={onBtnDown}
            onMouseUp={onBtnUp}
          >
            <span className="fc-plus">＋</span> Write New Entry
          </button>
        </Link>

        <section className="fc-feed">
          {!posts || posts.length === 0 ? (
            <div className="fc-empty">No text entries committed to the local queue yet.</div>
          ) : (
            posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
          )}
        </section>
      </div>
    </>
  );
}

/* ---------- Scoped styles ---------- */
const css = `
.fc-wrap {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1a1a2e;
}
.fc-header { margin-bottom: 1.25rem; }
.fc-title {
  font-size: 1.9rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 0.25rem;
  background: linear-gradient(135deg,#6366f1,#ec4899);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.fc-subtitle { color: #6b7280; margin: 0 0 1.25rem; font-size: 0.95rem; }

.fc-btn-link { text-decoration: none; }
.fc-primary-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.75rem 1.4rem;
  border: none; border-radius: 999px;
  background: linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899);
  background-size: 200% 200%;
  color: white; font-weight: 600; font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(99,102,241,0.35);
  transition: background-position 0.6s ease;
  margin-bottom: 1.75rem;
}
.fc-primary-btn:hover { background-position: 100% 0; }
.fc-plus { font-size: 1.1rem; line-height: 1; }

.fc-feed { display: flex; flex-direction: column; gap: 1.25rem; }

.fc-card {
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid #eef0f4;
  box-shadow: 0 4px 16px rgba(15,23,42,0.05);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.fc-card:hover {
  box-shadow: 0 12px 32px rgba(15,23,42,0.09);
  transform: translateY(-2px);
}
.fc-card-img { width: 100%; max-height: 400px; object-fit: cover; display: block; }
.fc-card-body { padding: 1rem 1.25rem 0.5rem; }
.fc-card-text { font-size: 0.98rem; line-height: 1.55; color: #1f2937; }

.fc-actions {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.6rem 1.25rem 0.9rem;
  border-top: 1px solid #f3f4f6;
  margin-top: 0.5rem;
}
.fc-icon-btn {
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: transparent; border: none; cursor: pointer;
  padding: 0.35rem 0.5rem; border-radius: 8px;
  color: #4b5563; font-size: 0.95rem;
  transition: background 0.2s ease, color 0.2s ease;
}
.fc-icon-btn:hover { background: #f3f4f6; color: #111827; }
.fc-icon-btn.is-liked .fc-heart { color: #ec4899; }
.fc-heart { font-size: 1.2rem; display: inline-block; transform-origin: center; }
.fc-bubble { font-size: 1rem; }
.fc-count { font-size: 0.85rem; font-weight: 500; }
.fc-timestamp {
  margin-left: auto;
  font-size: 0.78rem;
  color: #9ca3af;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.fc-comments {
  overflow: hidden;
  border-top: 1px solid #f3f4f6;
  padding: 0.75rem 1.25rem 1rem;
  background: #fafbfc;
}
.fc-comment-list { list-style: none; padding: 0; margin: 0 0 0.6rem; }
.fc-comment-item {
  padding: 0.4rem 0.6rem;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 0.35rem;
  font-size: 0.9rem;
  color: #1f2937;
  border: 1px solid #eef0f4;
}
.fc-comment-empty { font-size: 0.85rem; color: #9ca3af; padding: 0.25rem 0; }
.fc-comment-form { display: flex; gap: 0.5rem; }
.fc-comment-input {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 0.5rem 0.9rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.fc-comment-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
}
.fc-submit-btn {
  border: none;
  background: #111827;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
}
.fc-submit-btn:hover { background: #6366f1; transform: translateY(-1px); }

.fc-empty {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
  border: 2px dashed #e5e7eb;
  border-radius: 14px;
  font-size: 0.95rem;
}
`;
