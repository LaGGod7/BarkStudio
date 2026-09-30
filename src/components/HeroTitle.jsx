import { useEffect, useRef, useState } from 'react';

const WORDS = ['BARK', 'STUDIO'];

export default function HeroTitle() {
  const lettersRef = useRef([]);
  const containerRef = useRef(null);
  const [animKey, setAnimKey] = useState(0);

  // Re-trigger initial reveal when scrolling back to top
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let hasExited = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasExited) {
            setAnimKey((k) => k + 1);
            hasExited = false;
          } else if (!entry.isIntersecting) {
            hasExited = true;
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    let mx = -999;
    let my = -999;
    let px = -999;
    let py = -999;

    const handlePointerMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    let animationFrameId;

    function frame() {
      px += (mx - px) * 0.14;
      py += (my - py) * 0.14;

      lettersRef.current.forEach((s) => {
        if (!s) return;
        const r = s.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = px - cx;
        const dy = py - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        const k = Math.max(0, 1 - d / 320);

        s.style.transform = `translateY(${(-k * 14).toFixed(1)}px) rotate(${(dx / -120 * k).toFixed(2)}deg)`;
        s.style.fontWeight = Math.round(500 + k * 260);
        const o = (dx / -28 * k).toFixed(1);
        s.style.textShadow =
          k > 0.02
            ? `${o}px 0 rgba(130,160,255,.38),${-o}px 0 rgba(255,150,120,.32),0 0 ${(k * 24).toFixed(0)}px rgba(230,235,255,${(k * 0.25).toFixed(2)})`
            : 'none';
      });

      animationFrameId = requestAnimationFrame(frame);
    }

    animationFrameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [animKey]);

  const handleMouseEnter = () => {
    // Wave ripple across letters on mouse enter
    lettersRef.current.forEach((s, i) => {
      if (!s) return;
      s.style.transition = 'transform 0.4s cubic-bezier(.2,.7,.1,1)';
      s.style.transform = 'translateY(-12px)';
      setTimeout(() => {
        if (s) {
          s.style.transform = '';
          s.style.transition = '';
        }
      }, 120 + i * 45);
    });
  };

  lettersRef.current = [];
  let globalCharIndex = 0;

  return (
    <h1
      key={animKey}
      className="t rev"
      id="title"
      ref={containerRef}
      aria-label="Bark Studio"
      onPointerEnter={handleMouseEnter}
      style={{ cursor: 'default' }}
    >
      {WORDS.map((word, wordIdx) => {
        const letters = word.split('').map((char) => {
          const idx = globalCharIndex++;
          return (
            <span
              key={idx}
              ref={(el) => {
                if (el) lettersRef.current.push(el);
              }}
              aria-hidden="true"
              style={{ '--i': idx }}
            >
              {char}
            </span>
          );
        });

        return (
          <span key={wordIdx} className="title-word">
            {letters}
          </span>
        );
      })}
    </h1>
  );
}
