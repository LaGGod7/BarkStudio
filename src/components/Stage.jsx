import { useEffect, useRef } from 'react';

const TINT = {
  pink: [0.93, 0.45, 0.72],
  green: [0.32, 0.78, 0.58],
};

const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 r,m;
uniform vec3 tn;
uniform float t,k,h0;

// Mobile-safe Hash without Sine (no float overflow, stable across all mobile GPUs)
float h(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float n(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x),
             mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p){
  float a = 0.5;
  float s = 0.0;
  for(int i = 0; i < 4; i++){
    s += a * n(p);
    p = p * 2.03 + vec2(7.1, 3.4);
    a *= 0.5;
  }
  return s;
}

void main(){
  vec2 uv = gl_FragCoord.xy / r;
  vec2 p = (gl_FragCoord.xy - 0.5 * r) / r.y;
  vec2 d = uv - m;
  d.x *= r.x / r.y;
  float md = exp(-dot(d, d) * 6.0);
  p *= 1.5;
  p += d * md * (0.04 + k * 0.04);
  float tt = t;
  vec2 q = vec2(fbm(p + tt), fbm(p + vec2(5.2, 1.3) - tt));
  vec2 w = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + tt * 1.5), fbm(p + 3.0 * q + vec2(8.3, 2.8) - tt));
  float v = fbm(p + 3.0 * w);
  vec3 pal = 0.5 + 0.5 * cos(6.28318 * (v * 1.3 + vec3(0.0, 0.33, 0.67) + w.x * 0.5 + h0));
  // Continuous smooth lighting that never drops to black on click or interaction
  float ridge = smoothstep(0.12, 0.68, v);
  vec3 silver = vec3(0.8, 0.82, 0.9);
  vec3 base = vec3(0.1, 0.13, 0.12) + tn * 0.14;
  vec3 c = base + mix(silver * 0.5, mix(pal, tn, 0.72), 0.72) * ridge * (0.85 + k * 0.3) + tn * 0.14 * w.y * (0.6 + k);
  c += tn * md * 0.15;
  c += silver * pow(clamp(ridge, 0.0, 1.0), 4.0) * 0.16;
  gl_FragColor = vec4(c, 1.0);
}`;

export default function Stage({ tint = 'pink', className = '', style, children }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const st = stageRef.current;
    const cv = canvasRef.current;
    if (!st || !cv) return;

    const tn = TINT[tint] || TINT.pink;
    const opts = { antialias: false, alpha: true, depth: false, stencil: false };
    const gl =
      cv.getContext('webgl2', opts) ||
      cv.getContext('webgl', opts) ||
      cv.getContext('experimental-webgl', opts);

    function fallback() {
      cv.style.display = 'none';
      const c = tint === 'green' ? '#2f6b58' : '#7a3f66';
      st.style.setProperty('background', `radial-gradient(ellipse at 50% 30%, ${c} 0%, #151820 70%, #090A0E 100%)`, 'important');
    }

    if (!gl) {
      fallback();
      return;
    }

    const handleContextLost = (e) => {
      e.preventDefault();
    };
    cv.addEventListener('webglcontextlost', handleContextLost, false);

    function createShader(type, src) {
      const o = gl.createShader(type);
      gl.shaderSource(o, src);
      gl.compileShader(o);
      return o;
    }

    const pr = gl.createProgram();
    gl.attachShader(pr, createShader(gl.VERTEX_SHADER, VS));
    gl.attachShader(pr, createShader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr);

    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
      fallback();
      return;
    }

    gl.useProgram(pr);
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const a = gl.getAttribLocation(pr, 'a');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

    const U = {};
    ['r', 'm', 't', 'k', 'h0', 'tn'].forEach((n) => {
      U[n] = gl.getUniformLocation(pr, n);
    });

    function size() {
      if (!st || !cv) return;
      const rect = st.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = Math.max(2, Math.round(rect.width * dpr));
      const nextH = Math.max(2, Math.round(rect.height * dpr));
      if (Math.abs(cv.width - nextW) > 1 || Math.abs(cv.height - nextH) > 1) {
        cv.width = nextW;
        cv.height = nextH;
        gl.viewport(0, 0, nextW, nextH);
      }
    }

    size();
    window.addEventListener('resize', size);

    // Fast sync when CSS transitions end
    const handleTransitionEnd = () => size();
    st.addEventListener('transitionend', handleTransitionEnd);

    let resizeObserver;
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        size();
      });
      resizeObserver.observe(st);
    }

    let mx = 0.5;
    let my = 0.5;
    let tx = 0.5;
    let ty = 0.5;
    let k = 0.2;
    let tk = 0.2;
    let hue = 0;
    let th = 0;
    let vis = true;
    let accumulatedTime = 0;
    let lastNow = performance.now();

    const intersectionObserver = new IntersectionObserver((entries) => {
      vis = entries[0].isIntersecting;
      if (vis) {
        lastNow = performance.now();
        size();
      }
    });
    intersectionObserver.observe(st);

    const handlePointerMove = (e) => {
      const r = st.getBoundingClientRect();
      if (!r.width || !r.height) return;
      tx = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      ty = Math.max(0, Math.min(1, 1 - (e.clientY - r.top) / r.height));
      tk = 0.5;
    };

    const handlePointerLeave = () => {
      tk = 0.2;
      tx = 0.5;
      ty = 0.5;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        handlePointerMove(e.touches[0]);
      }
    };

    st.addEventListener('pointermove', handlePointerMove, { passive: true });
    st.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    st.addEventListener('touchmove', handleTouchMove, { passive: true });
    st.addEventListener('touchstart', handleTouchMove, { passive: true });

    const items = Array.from(st.querySelectorAll('.pillar, .item'));
    const itemCleanups = [];

    items.forEach((it, i) => {
      const onEnter = () => {
        th = i * 0.05;
      };
      it.addEventListener('pointerenter', onEnter);
      itemCleanups.push(() => it.removeEventListener('pointerenter', onEnter));
    });

    let animId;
    function frame(now) {
      const dt = Math.min((now - lastNow) / 1000, 0.05);
      lastNow = now;

      if (vis) {
        // Continuous atomic size tracking to prevent buffer mismatch during transitions
        const rect = st.getBoundingClientRect();
        if (rect.width > 2 && rect.height > 2) {
          const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
          const w = Math.max(2, Math.round(rect.width * dpr));
          const h = Math.max(2, Math.round(rect.height * dpr));
          if (Math.abs(cv.width - w) > 1 || Math.abs(cv.height - h) > 1) {
            cv.width = w;
            cv.height = h;
            gl.viewport(0, 0, w, h);
          }

          const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

          mx += (tx - mx) * 0.1;
          my += (ty - my) * 0.1;
          k += (tk - k) * 0.12;
          hue += (th - hue) * 0.08;

          // Smooth time integration with modulo to prevent float overflow glitch
          accumulatedTime = (accumulatedTime + dt * 0.035 * (1 + k * 0.4)) % 1000;

          gl.uniform2f(U.r, cv.width, cv.height);
          gl.uniform2f(U.m, mx, my);
          gl.uniform3f(U.tn, tn[0], tn[1], tn[2]);
          gl.uniform1f(U.t, isReduced ? 3.0 : accumulatedTime);
          gl.uniform1f(U.k, isReduced ? 0.2 : k);
          gl.uniform1f(U.h0, hue);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
      }
      animId = requestAnimationFrame(frame);
    }

    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', size);
      if (resizeObserver) resizeObserver.disconnect();
      intersectionObserver.disconnect();
      cv.removeEventListener('webglcontextlost', handleContextLost);
      st.removeEventListener('transitionend', handleTransitionEnd);
      st.removeEventListener('pointermove', handlePointerMove);
      st.removeEventListener('pointerleave', handlePointerLeave);
      st.removeEventListener('touchmove', handleTouchMove);
      st.removeEventListener('touchstart', handleTouchMove);
      itemCleanups.forEach((fn) => fn());
    };
  }, [tint]);

  return (
    <div
      className={`stage ${className}`.trim()}
      data-tint={tint}
      ref={stageRef}
      style={style}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      {children}
    </div>
  );
}
