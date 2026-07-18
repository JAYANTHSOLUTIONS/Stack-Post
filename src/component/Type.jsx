import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { gsap } from 'gsap';

export default function Type() {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(''); // Stores local binary object blob string for instant UI render
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

  // Capture file buffer map from native local explorer prompt interaction
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Assign ephemeral runtime tracking reference
    }
  };

  const handlePublishPost = () => {
    if (!inputText.trim() || !compiledHtml) return;

    // Build data layout payload containing binary parameters
    const newPostPayload = {
      raw: inputText.trim(),
      html: compiledHtml,
      imageFile: selectedFile
    };

    // Celebratory flash before navigating
    gsap.to(cardRef.current, {
      scale: 0.98, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out',
      onComplete: () => {
        addPost?.(newPostPayload);
        setInputText('');
        setSelectedFile(null);
        setPreviewUrl('');
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
        <p className="tp-subtitle">Draft markdown, attach local pictures, and commit to the live cluster database.</p>
      </header>

      <section ref={cardRef} className="tp-card">
        <label className="tp-label">Content</label>
        <textarea
          className="tp-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Compose your markdown layout here..."
        />

        {/* ─── FILE SELECTION INTERFACE CONTROLS ─── */}
        <label className="tp-label">Upload Photo from Local PC</label>
        <div style={{ margin: '0.5rem 0 1.25rem 0' }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: '#f9fafb',
              border: '1px dashed #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          />
        </div>

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

      {/* ─── PREVIEW CONSOLE LAYOUT STRATEGY FOR ALL DEVICES ─── */}
      {compiledHtml && (
        <section ref={previewRef} className="tp-preview" style={{ display: 'block', width: '100%', marginTop: '1.5rem' }}>
          <div className="tp-preview-head">
            <span className="tp-dot" />
            <strong>Compiler Live Preview</strong>
          </div>
          <div className="tp-preview-body" dangerouslySetInnerHTML={{ __html: compiledHtml }} />
          {previewUrl && (
            <div style={{ width: '100%', marginTop: '1rem', overflow: 'hidden', borderRadius: '8px' }}>
              <img 
                src={previewUrl} 
                alt="Local Preview" 
                className="tp-preview-img" 
                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '350px', objectFit: 'cover' }}
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
