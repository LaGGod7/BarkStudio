import { useState, useRef, useCallback } from 'react';
import barkLogo from '../assets/bark-logo-dark.png';

export default function InteractiveLogo() {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState({
    rotX: 0,
    rotY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  });
  const [copied, setCopied] = useState(false);
  const [ripple, setRipple] = useState(null);

  const handlePointerMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const rotX = (y - 0.5) * -16;
    const rotY = (x - 0.5) * 16;

    setTransform({
      rotX,
      rotY,
      glareX: x * 100,
      glareY: y * 100,
      isHovered: true,
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      rotX: 0,
      rotY: 0,
      isHovered: false,
    }));
  }, []);

  const handleClick = (e) => {
    const card = cardRef.current;
    if (card) {
      const rect = card.getBoundingClientRect();
      const rippleX = e.clientX - rect.left;
      const rippleY = e.clientY - rect.top;
      setRipple({ x: rippleX, y: rippleY, id: Date.now() });
      setTimeout(() => setRipple(null), 800);
    }

    // Copy email to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText('barkstudio7@gmail.com').then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      }).catch(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      });
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  return (
    <div className="interactive-logo-wrapper rv" style={{ '--d': 2 }}>
      <div
        ref={cardRef}
        className={`interactive-logo-card ${transform.isHovered ? 'hovered' : ''} ${copied ? 'copied' : ''}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Bark Studio interactive emblem. Click to copy barkstudio7@gmail.com"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e);
          }
        }}
        style={{
          transform: `perspective(800px) rotateX(${transform.rotX}deg) rotateY(${transform.rotY}deg) scale3d(${
            transform.isHovered ? '1.02' : '1'
          }, ${transform.isHovered ? '1.02' : '1'}, 1)`,
        }}
      >
        {/* Ambient background glow */}
        <div className="card-ambient-glow" />

        {/* Logo Image with Specular Sheen filling section */}
        <div className="logo-image-container">
          <img
            src={barkLogo}
            alt="Bark Studio"
            className="brand-logo-img"
            loading="lazy"
          />
          {/* Dynamic Light Spotlight following cursor */}
          <div
            className="card-glare"
            style={{
              opacity: transform.isHovered ? 1 : 0,
              background: `radial-gradient(circle at ${transform.glareX}% ${transform.glareY}%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.08) 35%, transparent 65%)`,
            }}
          />
        </div>

        {/* Ripple Click Effect */}
        {ripple && (
          <span
            key={ripple.id}
            className="click-ripple"
            style={{ left: ripple.x, top: ripple.y }}
          />
        )}

        {/* Footer Interaction Hint / Toast */}
        <div className="card-footer">
          <span className={`action-hint ${copied ? 'is-success' : ''}`}>
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied barkstudio7@gmail.com
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Click emblem to copy email
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
