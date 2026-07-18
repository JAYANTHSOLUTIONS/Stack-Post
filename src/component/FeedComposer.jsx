import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { gsap } from 'gsap';
import axios from 'axios';

// Focused Material-UI Icons Only
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

// LOCALHOST BINDING
const BASE_LOCAL_URL = "http://localhost:8000/api/v1";

// Global Timestamp Formatting Helper
function formatRelativeTime(timestamp) {
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

/* ---------- Injected Dynamic Global Themes (Light & Deep Dark Red) ---------- */
const GlobalStyles = () => (
  <style>{`
    :root {
      --fc-bg: linear-gradient(180deg, #F3F1FA 0%, #FAFAFF 50%, #FFFFFF 100%);
      --fc-text-main: #0F172A;
      --fc-text-muted: #64748B;
      --fc-border-subtle: #E2E8F0;
      --fc-card-bg: #FFFFFF;
      --fc-brand-primary: #4F46E5;
      --fc-brand-hover: #4338CA;
      --fc-danger: #EF4444;
      --fc-radius-lg: 16px;
      --fc-radius-md: 12px;
      --fc-radius-sm: 8px;
      --fc-card-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }

    .dark-theme {
      --fc-bg: #000000;
      --fc-text-main: #F4F4F5;
      --fc-text-muted: #A1A1AA;
      --fc-border-subtle: #27272A;
      --fc-card-bg: #09090B;
      --fc-brand-primary: #EF4444; 
      --fc-brand-hover: #DC2626;
      --fc-card-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }

    * { box-sizing: border-box; }
    
    .fc-shell {
      min-height: 100vh;
      background: var(--fc-bg);
      background-attachment: fixed;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: var(--fc-text-main);
      -webkit-font-smoothing: antialiased;
      transition: background 0.3s ease, color 0.3s ease;
    }
    
    .fc-layout {
      max-width: 935px; 
      margin: 0 auto; 
      padding: 30px 20px;
      display: grid; 
      grid-template-columns: minmax(0, 600px) 300px;
      gap: 35px; 
      align-items: start;
    }
    
    @media (max-width: 900px) { 
      .fc-layout { grid-template-columns: 1fr; padding: 15px 15px 90px; } 
      .fc-rightcol { display: none; } 
    }

    .fc-avatar-initials {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      color: #FFFFFF;
      background: var(--fc-brand-primary);
      text-transform: uppercase;
      user-select: none;
      transition: background 0.3s ease;
    }

    .fc-rightcol { 
      position: sticky; 
      top: 30px; 
      display: flex; 
      flex-direction: column; 
      gap: 20px; 
    }
    
    .fc-flat-card {
      background: var(--fc-card-bg); 
      border: 1px solid var(--fc-border-subtle); 
      border-radius: var(--fc-radius-lg); 
      padding: 20px;
    }
    
    .fc-panel-title { 
      font-size: 12px; 
      font-weight: 700; 
      text-transform: uppercase; 
      letter-spacing: .05em; 
      color: var(--fc-text-muted); 
      margin: 0 0 14px; 
    }
    
    .fc-trend { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 10px 0; 
      border-bottom: 1px solid var(--fc-border-subtle); 
    }
    .fc-trend:last-child { border-bottom: none; }
    .fc-trend-tag { font-weight: 600; color: var(--fc-text-main); font-size: 14px; }
    .fc-trend-meta { font-size: 12px; color: var(--fc-text-muted); }

    .fc-header {
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      padding: 20px; 
      margin-bottom: 20px;
      background: var(--fc-card-bg); 
      border: 1px solid var(--fc-border-subtle); 
      border-radius: var(--fc-radius-lg);
      position: relative;
      z-index: 10;
    }
    
    .fc-title {
      font-size: 24px; 
      font-weight: 700; 
      letter-spacing: -0.03em; 
      margin: 0;
    }
    .fc-subtitle { margin: 4px 0 0; color: var(--fc-text-muted); font-size: 13px; }

    .fc-avatar-btn {
      width: 40px; 
      height: 40px; 
      border-radius: 50%; 
      padding: 0; 
      border: 1px solid var(--fc-border-subtle); 
      cursor: pointer;
      background: transparent; 
      display: grid; 
      place-items: center;
      transition: border-color .2s ease;
    }
    .fc-avatar-btn:hover { border-color: var(--fc-text-muted); }
    
    .fc-user-dropdown {
      position: absolute; 
      right: 20px; 
      top: calc(100% + 8px); 
      width: 260px; 
      z-index: 99;
      background: var(--fc-card-bg); 
      border: 1px solid var(--fc-border-subtle); 
      border-radius: var(--fc-radius-md); 
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      padding: 8px; 
      transform-origin: top right;
    }
    
    .fc-user-header {
      display: flex; 
      align-items: center; 
      gap: 12px; 
      padding: 10px; 
      border-bottom: 1px solid var(--fc-border-subtle);
      margin-bottom: 6px;
    }
    .fc-user-header-avatar { width: 36px; height: 36px; border-radius: 50%; }
    .fc-user-name { font-weight: 600; color: var(--fc-text-main); font-size: 14px; }
    .fc-user-handle { color: var(--fc-text-muted); font-size: 12px; }
    
    .fc-role-badge {
      display: inline-block; 
      font-size: 9px; 
      font-weight: 700; 
      letter-spacing: .05em;
      padding: 2px 6px; 
      border-radius: 4px; 
      background: var(--fc-border-subtle); 
      color: var(--fc-text-muted);
      margin-top: 4px;
    }
    
    .fc-menu-item {
      display: flex; 
      align-items: center; 
      gap: 10px; 
      width: 100%; 
      padding: 8px 10px;
      border-radius: var(--fc-radius-sm); 
      border: none; 
      background: transparent; 
      cursor: pointer;
      color: var(--fc-text-main); 
      font-weight: 500; 
      font-size: 13.5px; 
      text-align: left; 
      text-decoration: none;
      transition: background .15s ease;
    }
    .fc-menu-item:hover { background: var(--fc-border-subtle); }
    .fc-menu-item.is-danger { color: var(--fc-danger); }
    .fc-menu-item.is-danger:hover { background: rgba(239,68,68,0.05); }

    .fc-auth-wrap { display: grid; place-items: center; min-height: 50vh; }
    .fc-auth-card {
      width: 100%; 
      max-width: 400px; 
      border-radius: var(--fc-radius-lg);
      background: var(--fc-card-bg); 
      border: 1px solid var(--fc-border-subtle);
    }
    .fc-auth-hero { padding: 24px 24px 16px; border-bottom: 1px solid var(--fc-border-subtle); }
    .fc-auth-hero h2 { margin: 0 0 4px; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .fc-auth-hero p { margin: 0; color: var(--fc-text-muted); font-size: 13px; }
    
    .fc-auth-tabs { display: flex; gap: 4px; padding: 8px 12px 0; }
    .fc-auth-tab {
      flex: 1; padding: 8px; border-radius: var(--fc-radius-sm); border: none; cursor: pointer;
      font-weight: 600; font-size: 13px; color: var(--fc-text-muted); background: transparent;
    }
    .fc-auth-tab.is-active { background: var(--fc-border-subtle); color: var(--fc-text-main); }
    .fc-auth-form { padding: 8px 24px 24px; display: flex; flex-direction: column; gap: 8px; }
    .fc-field-label { font-size: 12px; font-weight: 600; color: var(--fc-text-muted); margin-top: 4px; }
    
    .fc-input {
      width: 100%; 
      padding: 10px 12px; 
      border-radius: var(--fc-radius-sm); 
      border: 1px solid var(--fc-border-subtle);
      background: var(--fc-bg); 
      font-size: 14px; 
      color: var(--fc-text-main); 
      outline: none;
      font-family: inherit;
    }
    .fc-input:focus { border-color: var(--fc-brand-primary); background: var(--fc-card-bg); }
    
    .fc-primary-btn {
      margin-top: 12px; 
      padding: 11px 16px; 
      border-radius: var(--fc-radius-sm); 
      border: none; 
      cursor: pointer;
      background: var(--fc-brand-primary); 
      color: #fff; 
      font-weight: 600; 
      font-size: 14px;
      transition: background-color .15s ease;
    }
    .fc-primary-btn:hover { opacity: 0.9; }
    
    .fc-alert { padding: 10px; border-radius: var(--fc-radius-sm); font-size: 12.5px; font-weight: 500; }
    .fc-alert.error { background: rgba(239,68,68,0.06); color: #C53030; border: 1px solid rgba(239,68,68,0.15); }
    .fc-alert.success { background: rgba(34,197,94,0.06); color: #22543D; border: 1px solid rgba(34,197,94,0.15); }

    .fc-feed { display: flex; flex-direction: column; gap: 16px; }
    .fc-card {
      background: var(--fc-card-bg); 
      border: 1px solid var(--fc-border-subtle); 
      border-radius: var(--fc-radius-lg); 
      padding: 20px; 
      position: relative;
      z-index: 1;
      box-shadow: var(--fc-card-shadow);
      will-change: transform, box-shadow, border-color;
    }
    .fc-card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; position: relative; }
    .fc-card-author { display: flex; align-items: center; gap: 10px; }
    .fc-author-avatar { width: 36px; height: 36px; border-radius: 50%; }
    
    .fc-icon-round {
      width: 32px; 
      height: 32px; 
      border-radius: 50%; 
      display: grid; 
      place-items: center; 
      border: none;
      background: transparent; 
      cursor: pointer; 
      color: var(--fc-text-muted);
      transition: background-color .15s ease, color .15s ease;
    }
    .fc-icon-round:hover { background-color: var(--fc-border-subtle); color: var(--fc-text-main); }
    
    .fc-post-menu {
      position: absolute; 
      right: 0; 
      top: calc(100% + 4px); 
      z-index: 20;
      min-width: 140px; 
      padding: 4px; 
      border-radius: var(--fc-radius-sm);
      background: var(--fc-card-bg); 
      border: 1px solid var(--fc-border-subtle);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
      transform-origin: top right;
    }
    
    .fc-card-img {
      display: block; width: 100%; max-height: 500px; object-fit: cover; border-radius: var(--fc-radius-md); margin: 8px 0 14px;
    }
    .fc-card-body { padding: 2px 0 8px; }
    .fc-card-text { font-size: 15px; line-height: 1.6; color: var(--fc-text-main); word-wrap: break-word; }
    .fc-card-text p { margin: 0 0 6px; }
    
    .fc-actions { display: flex; align-items: center; gap: 4px; padding-top: 12px; border-top: 1px solid var(--fc-border-subtle); }
    .fc-icon-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: var(--fc-radius-sm);
      border: none; background: transparent; cursor: pointer; color: var(--fc-text-muted);
      font-weight: 500; font-size: 13px; transition: background-color .15s ease, color .15s ease;
    }
    .fc-icon-btn:hover { background-color: var(--fc-border-subtle); color: var(--fc-text-main); }
    .fc-icon-btn.is-liked { color: var(--fc-brand-primary); }
    .fc-icon-btn.is-liked:hover { background-color: rgba(239,68,68,0.05); }
    .fc-count { font-variant-numeric: tabular-nums; }
    .fc-timestamp { margin-left: auto; font-size: 12px; color: var(--fc-text-muted); }

    .fc-comments { margin-top: 12px; border-top: 1px solid var(--fc-border-subtle); padding-top: 12px; }
    .fc-comment-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    .fc-comment-empty { color: var(--fc-text-muted); font-size: 12.5px; padding: 4px; }
    .fc-comment-item {
      display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;
      background: var(--fc-bg); padding: 8px 12px; border-radius: var(--fc-radius-sm); position: relative;
    }
    .fc-comment-body { flex: 1; min-width: 0; }
    .fc-comment-user { font-weight: 600; font-size: 13px; color: var(--fc-text-main); display: block; margin-bottom: 2px; }
    .fc-comment-text { font-size: 13.5px; word-wrap: break-word; }
    
    .fc-comment-menu {
      position: absolute; right: 8px; top: calc(100% - 2px); z-index: 15; min-width: 120px;
      padding: 4px; border-radius: var(--fc-radius-sm); background: var(--fc-card-bg);
      border: 1px solid var(--fc-border-subtle); box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    
    .fc-comment-form { display: flex; gap: 8px; margin-top: 12px; }
    .fc-comment-input {
      flex: 1; padding: 9px 12px; border-radius: var(--fc-radius-sm); border: 1px solid var(--fc-border-subtle);
      background: var(--fc-bg); font-size: 13.5px; outline: none; font-family: inherit;
      color: var(--fc-text-main);
    }
    .fc-comment-input:focus { border-color: var(--fc-brand-primary); background: var(--fc-card-bg); }
    
    .fc-submit-btn {
      padding: 8px 14px; border-radius: var(--fc-radius-sm); border: none; cursor: pointer;
      background: var(--fc-brand-primary); color: #fff; font-weight: 600; font-size: 13px;
      display: inline-flex; align-items: center; gap: 6px;
    }
    .fc-submit-btn:hover { opacity: 0.9; }
    .fc-submit-btn.is-secondary { background: #E2E8F0; color: #0F172A; }
    .fc-submit-btn.is-secondary:hover { background: #CBD5E1; }

    .fc-mobile-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: var(--fc-card-bg);
      border-top: 1px solid var(--fc-border-subtle);
      z-index: 100;
      justify-content: space-around;
      align-items: center;
      padding: 0 10px;
      box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.03);
    }
    .fc-mobile-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--fc-text-muted);
      cursor: pointer;
      width: 50px;
      height: 100%;
      text-decoration: none;
    }
    .fc-mobile-nav-item.is-active {
      color: var(--fc-brand-primary);
    }
    .fc-mobile-nav-text {
      font-size: 10px;
      font-weight: 500;
      margin-top: 2px;
    }

    @media (max-width: 900px) {
      .fc-mobile-nav { display: flex; }
    }

    .fc-empty {
      padding: 50px 20px; text-align: center; border-radius: var(--fc-radius-lg);
      border: 1px dashed var(--fc-border-subtle); color: var(--fc-text-muted); font-size: 14px;
    }

    .fc-site-loader {
      position: fixed;
      inset: 0;
      background: #09090B;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .fc-loader-spinner {
      width: 40px;
      height: 40px;
      border: 2px solid rgba(255,255,255,0.05);
      border-top-color: #EF4444;
      border-radius: 50%;
      animation: fcSpin 0.8s linear infinite;
      margin-bottom: 16px;
    }
    .fc-loader-text {
      color: #A1A1AA;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }
    @keyframes fcSpin {
      to { transform: rotate(360deg); }
    }
  `}</style>
);

function UserInitialAvatar({ targetName, targetHandle }) {
  const resolvedString = targetName || targetHandle || "A";
  const displayChar = resolvedString.charAt(0).toUpperCase();

  return (
    <div className="fc-avatar-initials">
      {displayChar}
    </div>
  );
}

function AuthPanel({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  const cardRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' });
    }, cardRef);
    return () => ctx.revert();
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isRegister) {
        const response = await axios.post(`${BASE_LOCAL_URL}/auth/register`, {
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          linkedin_url: linkedinUrl.trim(),
          password: password
        });
        if (response.data.status === 'success') {
          setSuccessMsg('Registration successful! Please sign in below.');
          setIsRegister(false);
          setPassword('');
        }
      } else {
        const response = await axios.post(`${BASE_LOCAL_URL}/auth/login`, {
          username: username.trim(),
          password: password
        });
        if (response.data.status === 'success') {
          onLoginSuccess(response.data.token, response.data.user);
        }
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        const formattedError = detail.map(e => `${e.loc[1] || 'Field'}: ${e.msg}`).join(', ');
        setErrorMsg(formattedError);
      } else if (typeof detail === 'object' && detail !== null) {
        setErrorMsg(detail.message || JSON.stringify(detail));
      } else {
        setErrorMsg(detail || 'Authentication pipeline breakdown.');
      }
    }
  };

  return (
    <div className="fc-auth-wrap">
      <div ref={cardRef} className="fc-auth-card">
        <div className="fc-auth-hero">
          <h2>{isRegister ? 'Create Account' : 'Welcome'}</h2>
          <p>{isRegister ? 'Register your profile handle.' : 'Sign in to access your dashboard queue.'}</p>
        </div>

        <div className="fc-auth-tabs">
          <button
            type="button"
            className={`fc-auth-tab ${!isRegister ? 'is-active' : ''}`}
            onClick={() => { setIsRegister(false); setErrorMsg(''); }}
          >Sign In</button>
          <button
            type="button"
            className={`fc-auth-tab ${isRegister ? 'is-active' : ''}`}
            onClick={() => { setIsRegister(true); setErrorMsg(''); }}
          >Register</button>
        </div>

        <form className="fc-auth-form" onSubmit={handleAuthSubmit}>
          {errorMsg && <div className="fc-alert error">⚠️ {errorMsg}</div>}
          {successMsg && <div className="fc-alert success">✨ {successMsg}</div>}

          {isRegister && (
            <>
              <label className="fc-field-label">Full Name</label>
              <input className="fc-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />

              <label className="fc-field-label">Email Address</label>
              <input className="fc-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />

              <label className="fc-field-label">LinkedIn URL (optional)</label>
              <input className="fc-input" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" />
            </>
          )}

          <label className="fc-field-label">Username</label>
          <input className="fc-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />

          <label className="fc-field-label">Password</label>
          <input className="fc-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

          <button type="submit" className="fc-primary-btn">
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

function CommentItem({ comment, postId, currentUser, onDeleteComment }) {
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

function PostCard({ post, index, currentUser, onDelete, onEdit, onAddComment, onDeleteComment, isDarkMode }) {
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

/* ---------- Right Column Sidebar (Fixed Key Architecture) ---------- */
function RightColumn({ currentUser, posts }) {
  const ref = useRef(null);

  const getDynamicTrends = () => {
    if (!posts || posts.length === 0) {
      return [
        { id: 'trend-static-compilation', label: '#compilation', score: '0.0k', meta: 'No active data nodes' },
        { id: 'trend-static-fastapi', label: '#fastapi', score: '0.0k', meta: 'Waiting for entries' }
      ];
    }

    const rankedPosts = posts.map((p, idx) => {
      const commentCount = p.comments?.length || 0;
      const likesCount = p.likes?.length || 0;
      const computedScore = 5.2 + (commentCount * 1.5) + (likesCount * 0.8); 
      const uniqueLabel = p.author?.username ? `#${p.author.username.toLowerCase()}` : `#entry_${idx + 1}`;
      
      return {
        id: p.id ? `trend-post-${p.id}` : `trend-idx-${idx}`, 
        label: uniqueLabel,
        score: `${computedScore.toFixed(1)}k`,
        meta: `Ranked #${idx + 1} • Active Feed`,
        activitySum: commentCount + likesCount
      };
    });

    return rankedPosts.sort((a, b) => b.activitySum - a.activitySum).slice(0, 5);
  };

  return (
    <aside ref={ref} className="fc-rightcol">
      {/* Fix 1: Added explicit unique standard keys to layout flat cards blocks inside layout container */}
      {currentUser && (
        <div key="sidebar-profile-card" className="fc-flat-card" style={{ opacity: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="fc-author-avatar" style={{ width: 44, height: 44 }}>
              <UserInitialAvatar targetName={currentUser.name} targetHandle={currentUser.username} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14.5px' }}>{currentUser.name}</div>
              <div style={{ color: 'var(--fc-text-muted)', fontSize: 12.5 }}>@{currentUser.username}</div>
            </div>
          </div>
        </div>
      )}

      <div key="sidebar-trends-card" className="fc-flat-card" style={{ opacity: 0 }}>
        <h3 className="fc-panel-title">Trending tags</h3>
        {getDynamicTrends().map((t) => (
          <div key={t.id} className="fc-trend">
            <div>
              <div className="fc-trend-meta">{t.meta}</div>
              <div className="fc-trend-tag">{t.label}</div>
            </div>
            <div className="fc-trend-meta">{t.score}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function MobileBottomNav({ toggleDropdown }) {
  return (
    <nav className="fc-mobile-nav">
      <button type="button" className="fc-mobile-nav-item is-active">
        <svg width="20" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        <span className="fc-mobile-nav-text">Home</span>
      </button>
      <Link to="/Type" className="fc-mobile-nav-item">
        <svg width="20" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        <span className="fc-mobile-nav-text">Create</span>
      </Link>
      <button type="button" className="fc-mobile-nav-item" onClick={toggleDropdown}>
        <svg width="20" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5-4-8-4z"/></svg>
        <span className="fc-mobile-nav-text">Menu</span>
      </button>
    </nav>
  );
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

  // Fix 2: Used safe selector queries via context mapping to protect timeline targeting logic
  useLayoutEffect(() => {
    const tl = gsap.timeline();

    tl.to({}, { duration: 1.2 });

    tl.to(loaderRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => setIsSiteLoading(false)
    });

    tl.fromTo(headerRef.current, 
      { y: -25, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    );

    // Scoped execution query loops prevent selector drop-out errors
    if (document.querySelector('.fc-flat-card')) {
      tl.fromTo(".fc-flat-card", 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: 0.12, duration: 0.5, ease: 'power2.out' },
        "-=0.3"
      );
    }

    if (currentUser && posts.length > 0 && document.querySelector('.fc-card')) {
      tl.fromTo(".fc-card", 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power3.out' },
        "-=0.4"
      );
    } else if (document.querySelector('.fc-empty')) {
      tl.fromTo(".fc-empty",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 },
        "-=0.4"
      );
    }

    return () => tl.kill();
  }, [isSiteLoading, currentUser, posts.length]); // Track layout states to rerun cleanly when elements render

  useEffect(() => {
    if (!userDropdownRef.current) return;
    if (isAvatarDropdownOpen) {
      gsap.fromTo(userDropdownRef.current,
        { display: 'none', opacity: 0, scale: 0.98, y: -5 },
        { display: 'block', opacity: 1, scale: 1, y: 0, duration: 0.18, ease: 'power2.out' }
      );
    } else {
      gsap.to(userDropdownRef.current, {
        opacity: 0, scale: 0.98, y: -5, duration: 0.12, ease: 'power2.in',
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
      <GlobalStyles />

      {isSiteLoading && (
        <div ref={loaderRef} className="fc-site-loader">
          <div className="fc-loader-spinner" />
          <div className="fc-loader-text">Compiling Workspace</div>
        </div>
      )}

      <div className="fc-layout">
        <main className="fc-main">
          <header ref={headerRef} className="fc-header" style={{ opacity: 0 }}>
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
                <div className="fc-empty" style={{ opacity: 0 }}>No text entries committed to the database storage layer yet.</div>
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