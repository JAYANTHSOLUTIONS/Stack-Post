import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { gsap } from 'gsap';

// Safely parse and format relative time strings
function formatRelativeTime(timestamp) {
  if (!timestamp) return 'just now';
  const postDate = new Date(timestamp);
  if (isNaN(postDate.getTime())) return 'just now';

  const now = new Date();
  // FIXED: Explicit conversion to avoid strict bundler compilation errors
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
  
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
  const { posts = [] } = useOutletContext();

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
  );
}