import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { gsap } from 'gsap';

// Modular Architecture Component Node Imports
import AuthPanel from './AuthPanel';
import PostCard from './PostCard';
import RightColumn from './RightColumn';
import MobileBottomNav from './MobileBottomNav';
import UserInitialAvatar from './UserInitialAvatar';

// Global Timestamp Formatting Helper (Exported to prevent ReferenceErrors)
export function formatRelativeTime(timestamp) {
  if (!timestamp) return 'just now';
  const postDate = new Date(timestamp);
  if (isNaN(postDate.getTime())) return 'just now';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return postDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function FeedComposer() {
  const { posts = [], currentUser, handleAuthLogin, handleAuthLogout, deletePost, editPost, addComment, deleteComment } = useOutletContext();
  const headerRef = useRef(null);

  const avatarButtonRef = useRef(null);
  const userDropdownRef = useRef(null);
  const loaderRef = useRef(null);
  
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSiteLoading, setIsSiteLoading] = useState(true);

  const [, forceUpdate] = useState({});
  useEffect(() => {
    window.__refreshFeedLayoutNode = () => forceUpdate({});
    return () => { delete window.__refreshFeedLayoutNode; };
  }, []);

  // Safe Orchestration for Loader and Workspace Entrance Timelines
  useEffect(() => {
    if (isSiteLoading) {
      const loadTl = gsap.timeline();
      
      if (loaderRef.current) {
        loadTl.to(loaderRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.6,
          ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
          delay: 1.4,
          onComplete: () => setIsSiteLoading(false)
        });
      } else {
        loadTl.to({}, { duration: 0.5, onComplete: () => setIsSiteLoading(false) });
      }
      return () => loadTl.kill();
    }

    // Trigger UI presentation staggered fade-in only when variables are built inside DOM trees
    const ctx = gsap.context(() => {
      const introTl = gsap.timeline();

      if (headerRef.current) {
        introTl.fromTo(headerRef.current, 
          { y: -30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.7, ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
        );
      }

      if (document.querySelector(".fc-flat-card")) {
        introTl.fromTo(".fc-flat-card", 
          { y: 25, opacity: 0 }, 
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
          "-=0.4"
        );
      }

      if (document.querySelector(".fc-card")) {
        introTl.fromTo(".fc-card", 
          { y: 35, opacity: 0 }, 
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.65, ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
          "-=0.5"
        );
      }
    });

    return () => ctx.revert();
  }, [isSiteLoading]);

  useEffect(() => {
    if (!userDropdownRef.current) return;
    if (isAvatarDropdownOpen) {
      gsap.fromTo(userDropdownRef.current, 
        { display: 'none', opacity: 0, scale: 0.92, y: -15 }, 
        { display: 'block', opacity: 1, scale: 1, y: 0, duration: 0.25, ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
      );
    } else {
      gsap.to(userDropdownRef.current, { 
        opacity: 0, 
        scale: 0.92, 
        y: -15, 
        duration: 0.18, 
        ease: 'power2.in', 
        onComplete: () => { if (userDropdownRef.current) userDropdownRef.current.style.display = 'none'; } 
      });
    }
  }, [isAvatarDropdownOpen]);

  useEffect(() => {
    if (!isAvatarDropdownOpen) return;
    const handleOutsideClick = (event) => {
      if (
        userDropdownRef.current && !userDropdownRef.current.contains(event.target) &&
        avatarButtonRef.current && !avatarButtonRef.current.contains(event.target)
      ) {
        setIsAvatarDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isAvatarDropdownOpen]);

  const processedPosts = posts.map(p => ({
    ...p,
    onLikesUpdate: (id, newLikesArray) => {
      p.likes = newLikesArray;
      if (window.__refreshFeedLayoutNode) window.__refreshFeedLayoutNode();
    }
  }));

  const toggleThemeMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`fc-shell ${isDarkMode ? 'dark-theme' : ''}`}>
      {isSiteLoading && (
        <div ref={loaderRef} className="fc-site-loader">
          <div className="fc-loader-spinner" />
          <div className="fc-loader-text">Compiling Workspace</div>
        </div>
      )}

      <div className="fc-layout">
        <main className="fc-main">
          <header ref={headerRef} className="fc-header" style={{ opacity: isSiteLoading ? 0 : 1 }}>
            <div>
              <h1 className="fc-title" style={{ color: isDarkMode ? 'var(--fc-brand-primary)' : 'Blue' }}>STACK-POST</h1>
              <p className="fc-subtitle">Text entries committed to your live database cluster.</p>
            </div>

            {currentUser && (
              <div style={{ position: 'relative' }}>
                <button
                  ref={avatarButtonRef}
                  type="button"
                  className="fc-avatar-btn"
                  onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
                  aria-label="Open user menu"
                >
                  <UserInitialAvatar targetName={currentUser.name} targetHandle={currentUser.username} />
                </button>

                <div ref={userDropdownRef} className="fc-user-dropdown" style={{ display: 'none' }}>
                  <div className="fc-user-header">
                    <div className="fc-user-header-avatar">
                      <UserInitialAvatar targetName={currentUser.name} targetHandle={currentUser.username} />
                    </div>
                    <div>
                      <div className="fc-user-name">{currentUser.name}</div>
                      <div className="fc-user-handle">@{currentUser.username}</div>
                      <div className="fc-role-badge">{currentUser.role?.toUpperCase() || 'USER'}</div>
                    </div>
                  </div>

                  <Link
                    to="/Type"
                    onClick={() => setIsAvatarDropdownOpen(false)}
                    className="fc-menu-item"
                  >
                    Write New Entry
                  </Link>

                  <button type="button" onClick={toggleThemeMode} className="fc-menu-item">
                    Appearance: {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </button>

                  <button
                    type="button"
                    className="fc-menu-item is-danger"
                    onClick={() => {
                      setIsAvatarDropdownOpen(false);
                      handleAuthLogout();
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </header>

          {!currentUser ? (
            <AuthPanel onLoginSuccess={handleAuthLogin} />
          ) : (
            <div className="fc-feed">
              {processedPosts.length === 0 ? (
                <div className="fc-empty">No text entries committed to the database storage layer yet.</div>
              ) : (
                processedPosts.map((post, i) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    index={i}
                    currentUser={currentUser}
                    onDelete={deletePost}
                    onEdit={editPost}
                    onAddComment={addComment}
                    onDeleteComment={deleteComment}
                    isDarkMode={isDarkMode}
                  />
                ))
              )}
            </div>
          )}
        </main>

        <RightColumn currentUser={currentUser} posts={processedPosts} />
      </div>

      {currentUser && (
        <MobileBottomNav 
          toggleDropdown={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)} 
        />
      )}
    </div>
  );
}
