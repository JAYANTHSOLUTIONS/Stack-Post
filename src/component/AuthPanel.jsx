import React, { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import axios from 'axios';

const BASE_LOCAL_URL = "http://localhost:8000/api/v1";

export default function AuthPanel({ onLoginSuccess }) {
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
      const tl = gsap.timeline();
      tl.from(cardRef.current, { 
        y: 30, 
        opacity: 0, 
        duration: 0.6, 
        ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      })
      .from('.fc-auth-hero', {
        opacity: 0,
        duration: 0.3
      }, 0)
      .from('.fc-auth-form > *', {
        opacity: 0,
        y: 15,
        stagger: 0.08,
        duration: 0.4,
        ease: 'power2.out'
      }, 0.2);
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
          <button type="button" className={`fc-auth-tab ${!isRegister ? 'is-active' : ''}`} onClick={() => { setIsRegister(false); setErrorMsg(''); }}>Sign In</button>
          <button type="button" className={`fc-auth-tab ${isRegister ? 'is-active' : ''}`} onClick={() => { setIsRegister(true); setErrorMsg(''); }}>Register</button>
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

          <button type="submit" className="fc-primary-btn">{isRegister ? 'Create Account' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  );
}
