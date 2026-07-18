import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

export default function CommentItem({ comment, postId, currentUser, onDeleteComment }) {
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!dropdownRef.current) return;
    if (isMenuOpen) {
      gsap.fromTo(dropdownRef.current, { opacity: 0, scale: 0.95, y: -5 }, { opacity: 1, scale: 1, y: 0, duration: 0.15, ease: 'power2.out' });
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        gsap.to(dropdownRef.current, {
          opacity: 0, scale: 0.95, y: -5, duration: 0.1, ease: 'power2.in',
          onComplete: () => setIsMenuOpen(false)
        });
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMenuOpen]);

  const canDeleteComment = currentUser && (
    currentUser.role === 'admin' ||
    currentUser.username === comment.author?.username
  );

  return (
    <li className="fc-comment-item">
      <div className="fc-comment-body">
        <span className="fc-comment-user">@{comment.author?.username || 'legacy_user'}</span>
        <span className="fc-comment-text">{comment.text}</span>
      </div>

      {canDeleteComment && (
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="fc-icon-round"
            style={{ width: 24, height: 24 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Comment options"
          >
            <MoreHorizIcon style={{ fontSize: '16px' }} />
          </button>

          {isMenuOpen && (
            <div ref={dropdownRef} className="fc-comment-menu">
              <button
                type="button"
                className="fc-menu-item is-danger"
                onClick={() => { setIsMenuOpen(false); onDeleteComment(postId, comment.id); }}
              >
                <DeleteOutlinedIcon style={{ fontSize: '14px' }} /> Delete
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}