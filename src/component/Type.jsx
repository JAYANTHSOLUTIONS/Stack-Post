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
  
  // Grab the safe base context layout object directly
  const { addPost } = useOutletContext() || {};

  const wrapRef = useRef(null);
  const cardRef = useRef(null);
  const publishRef = useRef(null);
  const previewRef = useRef(null);
  const spinnerRef = useRef(null);

  /* Entry animation */
  useLayoutEffect(() => {
    const gctx = gsap.context(() => {
      gsap.from(".tp-header", {
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

  /* Handle text compilation as a side effect with basic debouncing */
  useEffect(() => {
    if (!inputText.trim()) {
      setCompiledHtml('');
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsCompiling(true);
      try {
        const response = await axios.post('https://stack-be.onrender.com/api/v1/posts/compile', {
          raw_content: inputText,
        });
        setCompiledHtml(response.data.compiled_html);
      } catch (err) {
        console.error('Compilation failure:', err.message);
      } finally {
        setIsCompiling(false);
      }
    }, 400); // Wait 400ms after the user stops typing to call the API

    return () => clearTimeout(delayDebounce);
  }, [inputText]);

  const handlePublishPost = () => {
    if (!inputText.trim() || !compiledHtml) return;

    // FIXED: Stripped down to data contracts matching MongoDB PostSavePayload schema
    const newPostPayload = {
      raw: inputText,
      html: compiledHtml,
      postImage: imageUrl.trim()
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
    <div ref={wrapRef} className="tp-wrap">
      <header className="tp-header">
        <h1 className="tp-title">Create a New Post</h1>
        <p className="tp-subtitle">Draft markdown, preview live, then commit to the queue.</p>
      </header>

      <section ref={cardRef} className="tp-card">
        <label className="tp-label">Content</label>
        <textarea
          className="tp-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
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
  );
}