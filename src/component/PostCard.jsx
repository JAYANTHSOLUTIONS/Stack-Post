import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import axios from 'axios';

// Cross-Module Imports
import { formatRelativeTime } from './FeedComposer'; 
import UserInitialAvatar from './UserInitialAvatar';
import CommentItem from './CommentItem';

// Focused Material-UI Icons Only
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

const BASE_LOCAL_URL = "http://localhost:8000/api/v1";

export default function PostCard({ post, index, currentUser, onDelete, onEdit, onAddComment, onDeleteComment, isDarkMode }) {
  const cardRef = useRef(null);
  const commentsRef = useRef(null);
  const heartRef = useRef(null);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);

  const likesList = post.likes || [];
  const isLikedByMe = currentUser && likesList.includes(currentUser.username);

  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editRaw, setEditRaw] = useState(post.raw || '');

  const currentComments = post.comments || [];

  const isPostOwner = currentUser && currentUser.username === post.author?.username;
  const isSystemAdmin = currentUser && currentUser.role === 'admin';
  const displayDropdownMenuButton = isPostOwner || isSystemAdmin;

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const onMouseEnter = () => {
      gsap.to(el, {
        y: -4,
        scale: 1.01,
        borderColor: isDarkMode ? '#EF4444' : '#4F46E5',
        boxShadow: isDarkMode 
          ? '0 20px 30px rgba(239, 68, 68, 0.15)' 
          : '0 20px 40px rgba(79, 70, 229, 0.08)',
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const onMouseLeave = () => {
      gsap.to(el, {
        y: 0,
        scale: 1,
        borderColor: isDarkMode ? '#27272A' : '#E2E8F0',
        boxShadow: isDarkMode 
          ? '0 4px 20px rgba(0,0,0,0.4)' 
          : '0 4px 12px rgba(0,0,0,0.02)',
        duration: 0.25,
        ease: 'power2.inOut'
      });
    };

    el.addEventListener('mouseenter', onMouseEnter);
    el.addEventListener('mouseleave', onMouseLeave);
    return () => {
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isDarkMode]);

  useEffect(() => {
    if (!commentsRef.current) return;
    if (showComments) {
      gsap.fromTo(commentsRef.current, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' });
    }
  }, [showComments]);

  useEffect(() => {
    if (!dropdownRef.current) return;
    if (isMenuOpen) {
      gsap.fromTo(dropdownRef.current, { opacity: 0, scale: 0.95, y: -10 }, { opacity: 1, scale: 1, y: 0, duration: 0.18, ease: 'power2.out' });
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        gsap.to(dropdownRef.current, {
          opacity: 0, scale: 0.95, y: -10, duration: 0.12, ease: 'power2.in',
          onComplete: () => setIsMenuOpen(false)
        });
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMenuOpen]);

  const handleLikeToggleClick = async () => {
    if (!currentUser) return;
    try {
      gsap.fromTo(heartRef.current, { scale: 1 }, { scale: 1.4, duration: 0.12, yoyo: true, repeat: 1, ease: 'back.out(2)' });
      const response = await axios.post(`${BASE_LOCAL_URL}/posts/${post.id}/like`);
      if (response.data.status === 'success') {
        if (typeof post.onLikesUpdate === 'function') {
          post.onLikesUpdate(post.id, response.data.likes);
        } else if (window.__refreshFeedLayoutNode) {
          window.__refreshFeedLayoutNode();
        }
      }
    } catch (err) {
      console.error("Interaction channel error on like toggle route execution:", err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !currentUser) return;
    await onAddComment(post.id, draft.trim());
    setDraft('');
  };

  const handleSaveUpdate = async () => {
    try {
      const compileRes = await axios.post(`${BASE_LOCAL_URL}/posts/compile`, {
        raw_content: editRaw
      });

      await onEdit(post.id, {
        raw: editRaw,
        html: compileRes.data.compiled_html
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to recompile modified variant layout:", err.message);
    }
  };

  return (
    <article ref={cardRef} className="fc-card" style={{ opacity: 0 }}>
      <div className="fc-card-head">
        <div className="fc-card-author">
          <div className="fc-author-avatar">
            <UserInitialAvatar targetName={post.author?.name} targetHandle={post.author?.username} />
          </div>
          <div>
            <div className="fc-author-handle">@{post.author?.username || 'anonymous'}</div>
            <div className="fc-author-name">{post.author?.name || 'Legacy Feed Post'}</div>
          </div>
        </div>

        {displayDropdownMenuButton && !isEditing && (
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="fc-icon-round"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Post options"
            >
              <MoreHorizIcon />
            </button>

            {isMenuOpen && (
              <div ref={dropdownRef} className="fc-post-menu">
                {isPostOwner && (
                  <button
                    type="button"
                    className="fc-menu-item"
                    onClick={() => { setIsMenuOpen(false); setIsEditing(true); }}
                  >
                    <EditOutlinedIcon style={{ fontSize: '16px' }} /> Edit
                  </button>
                )}
                <button
                  type="button"
                  className="fc-menu-item is-danger"
                  onClick={() => { setIsMenuOpen(false); onDelete(post.id); }}
                >
                  <DeleteOutlinedIcon style={{ fontSize: '16px' }} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="fc-edit-wrap">
          <div className="fc-edit-label">Editing Space Entry</div>
          <textarea
            className="fc-edit-textarea"
            value={editRaw}
            onChange={(e) => setEditRaw(e.target.value)}
          />
          <div className="fc-edit-actions">
            <button className="fc-submit-btn is-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="fc-submit-btn" onClick={handleSaveUpdate}>Save Changes</button>
          </div>
        </div>
      ) : (
        <>
          {post.postImage && <img src={post.postImage} className="fc-card-img" alt="Post media content" />}

          <div className="fc-card-body">
            <div className="fc-card-text" dangerouslySetInnerHTML={{ __html: post.html }} />
          </div>

          <div className="fc-actions">
            <button
              type="button"
              className={`fc-icon-btn ${isLikedByMe ? 'is-liked' : ''}`}
              onClick={handleLikeToggleClick}
              aria-label="Like"
            >
              <span ref={heartRef} style={{ display: 'inline-flex', alignItems: 'center' }}>
                {isLikedByMe
                  ? <FavoriteIcon style={{ fontSize: '18px' }} />
                  : <FavoriteBorderOutlinedIcon style={{ fontSize: '18px' }} />}
              </span>
              <span className="fc-count">{likesList.length}</span>
            </button>

            <button
              type="button"
              className="fc-icon-btn"
              onClick={() => setShowComments((v) => !v)}
              aria-label="Comment"
            >
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ForumOutlinedIcon style={{ fontSize: '18px' }} />
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
                  currentUser={currentUser}
                  onDeleteComment={onDeleteComment}
                />
              ))
            )}
          </ul>
          {currentUser ? (
            <form className="fc-comment-form" onSubmit={handleAddComment}>
              <input
                type="text"
                className="fc-comment-input"
                placeholder="Add a comment…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button type="submit" className="fc-submit-btn">
                <SendRoundedIcon style={{ fontSize: '14px' }} /> Post
              </button>
            </form>
          ) : (
            <p style={{ fontSize: '12.5px', color: 'var(--fc-text-muted)', padding: '6px', textAlign: 'center' }}>
              Please log in to add comments.
            </p>
          )}
        </div>
      )}
    </article>
  );
}