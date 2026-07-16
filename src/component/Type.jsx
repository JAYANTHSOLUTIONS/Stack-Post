import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { gsap } from 'gsap';

export default function Type() {
  const [inputText, setInputText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [compiledHtml, setCompiledHtml] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);

  const navigate = useNavigate();
  const ctx = useOutletContext?.() || {};
  const addPost = ctx.addPost;

  const wrapRef = useRef(null);
  const headerRef = useRef(null);
  const cardRef = useRef(null);
  const publishRef = useRef(null);
  const previewRef = useRef(null);
  const spinnerRef = useRef(null);

  /* Entry animation */
  useLayoutEffect(() => {
    const gctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: -24, opacity: 0, duration: 0.6, ease: 'power3.out',
      });
      gsap.from(cardRef.current, {
        y: 30, opacity: 0, scale: 0.98, duration: 0.7, ease: 'power3.out', delay: 0.1,
      });
    }, wrapRef);
    return () => gctx.revert();
  }, []);

  /* Preview reveal */
  useEffect(() => {
    if (compiledHtml && previewRef.current) {
      gsap.fromTo(
        previewRef.current,
        { y: 20, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
      );
    }
  }, [compiledHtml]);

  /* Spinner rotation */
  useEffect(() => {
    if (!spinnerRef.current) return;
    if (isCompiling) {
      gsap.to(spinnerRef.current, {
        rotate: 360, duration: 0.9, ease: 'none', repeat: -1,
      });
    } else {
      gsap.killTweensOf(spinnerRef.current);
      gsap.set(spinnerRef.current, { rotate: 0 });
    }
  }, [isCompiling]);

  const handleCompileText = async (textToCompile) => {
    if (!textToCompile.trim()) {
      setCompiledHtml('');
      return;
    }
    setIsCompiling(true);
    try {
      const response = await axios.post('http://localhost:8000/api/v1/posts/compile', {
        raw_content: textToCompile,
      });
      setCompiledHtml(response.data.compiled_html);
    } catch (err) {
      console.error('Compilation failure:', err.message);
    } finally {
      setIsCompiling(false);
    }
  };

  const handlePublishPost = () => {
    if (!inputText.trim() || !compiledHtml) return;

    const newPostPayload = {
      id: crypto.randomUUID(),
      raw: inputText,
      html: compiledHtml,
      postImage: imageUrl.trim(),
      timestamp: new Date().toISOString(),
    };

    // Celebratory flash before navigating
    gsap.to(cardRef.current, {
      scale: 0.98, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out',
      onComplete: () => {
        addPost?.(newPostPayload);
        setInputText('');
        setImageUrl('');
        setCompiledHtml('');
        navigate('/');
      },
    });
  };

  const onBtnEnter = () => {
    if (publishRef.current?.disabled) return;
    gsap.to(publishRef.current, { scale: 1.05, y: -2, duration: 0.25, ease: 'power2.out' });
  };
  const onBtnLeave = () =>
    gsap.to(publishRef.current, { scale: 1, y: 0, duration: 0.25, ease: 'power2.out' });
  const onBtnDown = () => gsap.to(publishRef.current, { scale: 0.95, duration: 0.1 });
  const onBtnUp = () => gsap.to(publishRef.current, { scale: 1.05, duration: 0.15 });

  const canPublish = !!inputText.trim() && !!compiledHtml;

  return (
    <>
      <style>{css}</style>
      <div ref={wrapRef} className="tp-wrap">
        <header ref={headerRef} className="tp-header">
          <h1 className="tp-title">Create a New Post</h1>
          <p className="tp-subtitle">Draft markdown, preview live, then commit to the queue.</p>
        </header>

        <section ref={cardRef} className="tp-card">
          <label className="tp-label">Content</label>
          <textarea
            className="tp-textarea"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              handleCompileText(e.target.value);
            }}
            placeholder="Compose your markdown layout here..."
          />

          <label className="tp-label">Image URL <span className="tp-optional">(optional)</span></label>
          <input
            type="text"
            className="tp-input"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />

          <div className="tp-actions">
            <div className="tp-status">
              <span ref={spinnerRef} className={`tp-spinner ${isCompiling ? 'is-active' : ''}`} />
              <span className="tp-status-text">
                {isCompiling ? 'Compiling engine active…' : compiledHtml ? 'Ready to publish' : 'Awaiting input'}
              </span>
            </div>

            <button
              ref={publishRef}
              type="button"
              className="tp-publish-btn"
              onClick={handlePublishPost}
              disabled={!canPublish}
              onMouseEnter={onBtnEnter}
              onMouseLeave={onBtnLeave}
              onMouseDown={onBtnDown}
              onMouseUp={onBtnUp}
            >
              Publish Post →
            </button>
          </div>
        </section>

        {compiledHtml && (
          <section ref={previewRef} className="tp-preview">
            <div className="tp-preview-head">
              <span className="tp-dot" />
              <strong>Compiler Live Preview</strong>
            </div>
            <div className="tp-preview-body" dangerouslySetInnerHTML={{ __html: compiledHtml }} />
            {imageUrl && (
              <img src={imageUrl} alt="Preview" className="tp-preview-img" />
            )}
          </section>
        )}
      </div>
    </>
  );
}

const css = `
.tp-wrap {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1a1a2e;
}
.tp-header { margin-bottom: 1.5rem; }
.tp-title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 0.35rem;
  background: linear-gradient(135deg,#6366f1,#ec4899);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.tp-subtitle { color: #6b7280; margin: 0; font-size: 0.95rem; }

.tp-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #eef0f4;
  box-shadow: 0 8px 28px rgba(15,23,42,0.06);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.tp-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.6rem;
}
.tp-optional { color: #9ca3af; font-weight: 500; text-transform: none; letter-spacing: 0; }

.tp-textarea, .tp-input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  font-size: 0.95rem;
  font-family: inherit;
  color: #111827;
  background: #fafbfc;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  box-sizing: border-box;
}
.tp-textarea { min-height: 140px; resize: vertical; line-height: 1.55; }
.tp-textarea:focus, .tp-input:focus {
  border-color: #6366f1;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(99,102,241,0.15);
}

.tp-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}
.tp-status { display: inline-flex; align-items: center; gap: 0.55rem; color: #6b7280; font-size: 0.85rem; }
.tp-spinner {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid #e5e7eb;
  border-top-color: transparent;
}
.tp-spinner.is-active {
  border-color: #6366f1;
  border-top-color: transparent;
}

.tp-publish-btn {
  border: none;
  padding: 0.75rem 1.4rem;
  border-radius: 999px;
  background: linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899);
  background-size: 200% 200%;
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(99,102,241,0.35);
  transition: background-position 0.6s ease, opacity 0.2s ease, box-shadow 0.2s ease;
}
.tp-publish-btn:hover:not(:disabled) { background-position: 100% 0; }
.tp-publish-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  box-shadow: none;
}

.tp-preview {
  margin-top: 1.5rem;
  background: #fff;
  border-radius: 20px;
  border: 1px solid #eef0f4;
  box-shadow: 0 8px 28px rgba(15,23,42,0.05);
  overflow: hidden;
}
.tp-preview-head {
  display: flex; align-items: center; gap: 0.55rem;
  padding: 0.8rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(90deg,#fafbfc,#fff);
  font-size: 0.85rem;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.tp-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 4px rgba(16,185,129,0.15);
}
.tp-preview-body {
  padding: 1.25rem;
  font-size: 0.98rem;
  line-height: 1.6;
  color: #1f2937;
}
.tp-preview-img {
  display: block;
  width: 100%;
  max-height: 360px;
  object-fit: cover;
}
`;
