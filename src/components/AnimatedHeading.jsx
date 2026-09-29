import React, { useRef } from 'react';

export default function AnimatedHeading({ text, className = 'h2', as: Tag = 'h2', id, style }) {
  const words = text.trim().split(/\s+/);
  const containerRef = useRef(null);
  const wordSpansRef = useRef([]);

  wordSpansRef.current = [];

  const handlePointerMove = (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    wordSpansRef.current.forEach((span) => {
      if (!span) return;
      const rect = span.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const radius = 220;

      if (d < radius) {
        const factor = 1 - d / radius;
        const lift = -factor * 12;
        const tilt = (dx / radius) * -6 * factor;
        span.style.transform = `translateY(${lift.toFixed(1)}px) rotate(${tilt.toFixed(1)}deg)`;
        span.style.color = factor > 0.4 ? '#FFFFFF' : '';
        span.style.textShadow =
          factor > 0.2
            ? `0 0 ${(factor * 20).toFixed(0)}px rgba(255, 255, 255, ${(factor * 0.4).toFixed(2)})`
            : 'none';
      } else {
        span.style.transform = '';
        span.style.color = '';
        span.style.textShadow = 'none';
      }
    });
  };

  const handlePointerLeave = () => {
    wordSpansRef.current.forEach((span) => {
      if (span) {
        span.style.transform = '';
        span.style.color = '';
        span.style.textShadow = 'none';
      }
    });
  };

  const handlePointerEnter = () => {
    // Cascading wave across the words when mouse moves in
    wordSpansRef.current.forEach((span, i) => {
      if (!span) return;
      span.style.transition = 'transform 0.4s cubic-bezier(.2,.7,.1,1)';
      span.style.transform = 'translateY(-8px)';
      setTimeout(() => {
        if (span) {
          span.style.transform = '';
          span.style.transition = '';
        }
      }, 130 + i * 50);
    });
  };

  return (
    <Tag
      className={className}
      id={id}
      ref={containerRef}
      style={{ ...style, cursor: 'default' }}
      aria-label={text}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
    >
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <span className="w" aria-hidden="true">
            <span
              ref={(el) => {
                if (el) wordSpansRef.current.push(el);
              }}
              style={{ '--i': i, display: 'inline-block', willChange: 'transform' }}
            >
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </Tag>
  );
}
