import React, { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

export default function MobileBottomNav({ toggleDropdown }) {
  const navRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, { y: 64, opacity: 0, duration: 0.5, ease: 'power2.out' });
    }, navRef);
    return () => ctx.revert();
  }, []);

  return (
    <nav ref={navRef} className="fc-mobile-nav">
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