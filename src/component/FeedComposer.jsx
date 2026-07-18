import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { gsap } from 'gsap';
import axios from 'axios';

// Import Material-UI Icons
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

function formatRelativeTime(timestamp) {
  if (!timestamp) return 'just now';
  const postDate = new Date(timestamp);
  if (isNaN(postDate.getTime())) return 'just now';

  const now = new Date();
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

/* ---------- Comment Item Component with Dropdown Menu ---------- */
function CommentItem({ comment, postId, onDeleteComment }) {
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Dropdown Menu GSAP Entry Animation
  useEffect(() => {
    if (!dropdownRef.current) return;
    if (isMenuOpen) {
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, scale: 0.9, y: -5 },
        { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'power2.out' }
      );
    }
  }, [isMenuOpen]);

  // Click Outside Event Handler to close comment dropdown
  useEffect(() => {
    if (!isMenuOpen) return;
    
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        gsap.to(dropdownRef.current, {
          opacity: 0,
          scale: 0.9,
          y: -5,
          duration: 0.15,
          ease: 'power2.in',
          onComplete: () => setIsMenuOpen(false)
        });
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMenuOpen]);

  const handleMenuToggle = () => {
    if (isMenuOpen) {
      gsap.to(dropdownRef.current, {
        opacity: 0,
        scale: 0.9,
        y: -5,
        duration: 0.15,
        ease: 'power2.in',
        onComplete: () => setIsMenuOpen(false)
      });
    } else {
      setIsMenuOpen(true);
    }
  };

  return (
    <li className="fc-comment-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
      <span>{comment.text}</span>
      
      {/* Mini Comment 3-Dot Menu Wrapper Layout */}
      <div className="fc-comment-menu" ref={menuRef} style={{ position: 'relative' }}>
        <button 
          type="button" 
          onClick={handleMenuToggle}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center', opacity: 0.6 }}
          aria-label="Comment options"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: '#4b5563' }}>
            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
          </svg>
        </button>

        {isMenuOpen && (
          <div 
            ref={dropdownRef}
            style={{ position: 'absolute', right: 0, top: '100%', zIndex: 20, minWidth: '100px', background: '#ffffff', border: '1px solid #eef0f4', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '0.25rem' }}
          >
            <button
              type="button"
              className="inline-flex items-center w-full p-2 hover:bg-red-50 hover:text-red-600 rounded text-left"
              style={{ border: 'none', background: 'transparent', fontSize: '0.8rem', fontWeight: '500', color: '#ef4444', cursor: 'pointer', gap: '0.35rem' }}
              onClick={() => {
                setIsMenuOpen(false);
                onDeleteComment(postId, comment.id);
              }}
            >
              <DeleteOutlinedIcon style={{ fontSize: '1rem' }} /> Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

/* ---------- Post Card ---------- */
function PostCard({ post, index, onDelete, onEdit, onAddComment, onDeleteComment }) {
  const cardRef = useRef(null);
  const commentsRef = useRef(null);
  const heartRef = useRef(null);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState('');

  // Dropdown menu toggle state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Editing state controls
  const [isEditing, setIsEditing] = useState(false);
  const [editRaw, setEditRaw] = useState(post.raw || '');
  const [editImg, setEditImg] = useState(post.postImage || '');

  const currentComments = post.comments || [];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 40, opacity: 0, scale: 0.96, duration: 0.7, ease: 'power3.out', delay: index * 0.08,
      });
    }, cardRef);
    return () => ctx.revert();
  }, [index]);

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

  // Dropdown Menu GSAP Entry Animation Trigger
  useEffect(() => {
    if (!dropdownRef.current) return;
    if (isMenuOpen) {
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, scale: 0.9, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      );
    }
  }, [isMenuOpen]);

  // Click Outside Event Handler to dismiss dropdown menu natively
  useEffect(() => {
    if (!isMenuOpen) return;
    
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        gsap.to(dropdownRef.current, {
          opacity: 0,
          scale: 0.9,
          y: -10,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => setIsMenuOpen(false)
        });
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMenuOpen]);

  const handleLike = () => {
    setLiked((v) => !v);
    setLikes((n) => (liked ? n - 1 : n + 1));
    gsap.fromTo(heartRef.current, { scale: 1 }, { scale: 1.6, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' });
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    await onAddComment(post.id, draft.trim());
    setDraft('');
  };

  const handleMenuToggle = () => {
    if (isMenuOpen) {
      gsap.to(dropdownRef.current, {
        opacity: 0,
        scale: 0.9,
        y: -10,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => setIsMenuOpen(false)
      });
    } else {
      setIsMenuOpen(true);
    }
  };

  const handleSaveUpdate = async () => {
    try {
      const compileRes = await axios.post('http://localhost:8000/api/v1/posts/compile', {
        raw_content: editRaw
      });
      
      await onEdit(post.id, {
        raw: editRaw,
        html: compileRes.data.compiled_html,
        postImage: editImg.trim()
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to recompile modified variant layout:", err.message);
    }
  };

  return (
    <article ref={cardRef} className="fc-card" style={{ position: 'relative' }}>
      {/* Modern Three-Dot Dropdown Menu (Absolute Top-Right Overlay Layout) */}
      {!isEditing && (
        <div className="fc-menu" ref={menuRef}>
          <button
            id={`dropdownMenuIconButton-${post.id}`}
            type="button"
            className={`fc-menu-btn text-heading bg-neutral-primary box-border border border-transparent hover:bg-neutral-secondary-medium focus:ring-4 focus:ring-neutral-tertiary font-medium leading-5 rounded-base text-sm p-2 focus:outline-none ${post.postImage ? 'has-image-overlay' : ''}`}
            onClick={handleMenuToggle}
            aria-label="Post menu"
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
          >
            <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeWidth="3" d="M12 6h.01M12 12h.01M12 18h.01"/>
            </svg>
          </button>
          
          {isMenuOpen && (
            <div 
              id={`dropdownDots-${post.id}`} 
              className="fc-dropdown z-10 bg-neutral-primary-medium border border-default-medium rounded-base shadow-lg w-44" 
              ref={dropdownRef} 
              role="menu"
            >
              <ul className="p-2 text-sm text-body font-medium" aria-labelledby={`dropdownMenuIconButton-${post.id}`}>
                <li>
                  <button
                    type="button"
                    className="fc-dropdown-item inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded text-left"
                    role="menuitem"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsEditing(true);
                    }}
                  >
                    <EditOutlinedIcon className="fc-dropdown-icon" fontSize="small" /> Edit
                  </button>
                </li>
              </ul>
              <div className="fc-dropdown-divider p-2 text-sm text-body font-medium border-t border-default-medium">
                <button
                  type="button"
                  className="fc-dropdown-item text-danger inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-red-600 rounded text-left"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(post.id);
                  }}
                >
                  <DeleteOutlinedIcon className="fc-dropdown-icon" fontSize="small" /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isEditing ? (
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <strong style={{ fontSize: '0.9rem', color: '#6366f1' }}>Editing Space Entry</strong>
          <textarea
            className="fc-comment-input"
            style={{ borderRadius: '12px', minHeight: '100px', width: '100%' }}
            value={editRaw}
            onChange={(e) => setEditRaw(e.target.value)}
          />
          <input
            type="text"
            className="fc-comment-input"
            placeholder="Modify Image URL"
            value={editImg}
            onChange={(e) => setEditImg(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="fc-submit-btn" style={{ background: '#e5e7eb', color: '#1f2937' }} onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="fc-submit-btn" onClick={handleSaveUpdate}>Save Changes</button>
          </div>
        </div>
      ) : (
        <>
          {post.postImage && <img src={post.postImage} className="fc-card-img" alt="Post media" />}
          
          <div className="fc-card-body">
            <div className="fc-card-text" dangerouslySetInnerHTML={{ __html: post.html }} />
          </div>

          <div className="fc-actions">
            <button type="button" className={`fc-icon-btn ${liked ? 'is-liked' : ''}`} onClick={handleLike} aria-label="Like">
              <span ref={heartRef} className="fc-heart" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <FavoriteBorderOutlinedIcon fontSize="small" style={{ color: liked ? '#ef4444' : 'inherit' }} />
              </span>
              <span className="fc-count">{likes}</span>
            </button>

            <button type="button" className="fc-icon-btn" onClick={() => setShowComments((v) => !v)} aria-label="Comment">
              <span className="fc-bubble" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ForumOutlinedIcon fontSize="small" />
              </span>
              <span className="fc-count">{currentComments.length}</span>
            </button>

            <span className="fc-timestamp">{formatRelativeTime(post.timestamp)}</span>
          </div>
        </>
      )}

      {showComments && !isEditing && (
        <div ref={commentsRef} className="fc-comments">
          <ul className="fc-comment-list">
            {currentComments.length === 0 ? (
              <li className="fc-comment-empty">Be the first to comment.</li>
            ) : (
              currentComments.map((c) => (
                <CommentItem 
                  key={c.id} 
                  comment={c} 
                  postId={post.id} 
                  onDeleteComment={onDeleteComment} 
                />
              ))
            )}
          </ul>
          <form className="fc-comment-form" onSubmit={handleAddComment}>
            <input type="text" className="fc-comment-input" placeholder="Add a comment…" value={draft} onChange={(e) => setDraft(e.target.value)} />
            <button type="submit" className="fc-submit-btn">Post</button>
          </form>
        </div>
      )}
    </article>
  );
}

/* ---------- Main Composer ---------- */
export default function FeedComposer() {
  const { posts = [], deletePost, editPost, addComment, deleteComment } = useOutletContext();
  const headerRef = useRef(null);
  const btnRef = useRef(null);

  useLayoutEffect(() => {
    const gctx = gsap.context(() => {
      gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.6, ease: 'power3.out' });
      gsap.from(btnRef.current, { scale: 0.8, opacity: 0, duration: 0.5, ease: 'back.out(2)', delay: 0.15 });
    });
    return () => gctx.revert();
  }, []);

  return (
    <div className="fc-wrap">
      <header ref={headerRef} className="fc-header">
        <h1 className="fc-title">Active Feed Queue</h1>
        <p className="fc-subtitle">Text entries committed to your live cluster database.</p>
      </header>

      <Link to="/Type" className="fc-btn-link">
        <button ref={btnRef} type="button" className="fc-primary-btn">
          <span className="fc-plus">＋</span> Write New Entry
        </button>
      </Link>

      <section className="fc-feed">
        {!posts || posts.length === 0 ? (
          <div className="fc-empty">No text entries committed to the local queue yet.</div>
        ) : (
          posts.map((post, i) => (
            <PostCard 
              key={post.id} 
              post={post} 
              index={i} 
              onDelete={deletePost} 
              onEdit={editPost} 
              onAddComment={addComment}
              onDeleteComment={deleteComment}
            />
          ))
        )}
      </section>
    </div>
  );
}