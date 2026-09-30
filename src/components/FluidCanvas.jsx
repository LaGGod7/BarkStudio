import { useEffect, useRef } from 'react';

export default function FluidCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const opts = { antialias: false, depth: false, stencil: false, alpha: true };
    const gl =
      canvas.getContext('webgl2', opts) ||
      canvas.getContext('webgl', opts) ||
      canvas.getContext('experimental-webgl', opts);

    if (!gl) {
      canvas.style.display = 'none';
      return;
    }

    const handleContextLost = (e) => {
      e.preventDefault();
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const U = {};
    const mm = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let mx = -999;
    let my = -999;

    const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    const fs = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 r,m;
uniform float t;

// Mobile-safe Hash without Sine (no float overflow, stable on all mobile GPUs)
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
  float md = exp(-dot(d, d) * 16.0);
  p *= 1.5;
  p += d * md * 0.7;
  float tt = t * 0.05;
  vec2 q = vec2(fbm(p + tt), fbm(p + vec2(5.2, 1.3) - tt));
  vec2 w = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + tt * 1.5), fbm(p + 3.0 * q + vec2(8.3, 2.8) - tt));
  float v = fbm(p + 3.0 * w);
  vec3 pal = 0.5 + 0.5 * cos(6.28318 * (v * 1.3 + vec3(0.0, 0.33, 0.67) + w.x * 0.5));
  float ridge = smoothstep(0.35, 0.75, v) * (1.0 - smoothstep(0.75, 1.0, v));
  vec3 silver = vec3(0.75, 0.78, 0.85);
  vec3 c = vec3(0.035, 0.04, 0.055) + mix(silver * 0.5, pal, 0.5) * ridge * 0.5 + pal * 0.06 * w.y;
  c += silver * pow(clamp(ridge, 0.0, 1.0), 6.0) * 0.12;
  float vg = smoothstep(1.2, 0.2, length(uv - 0.5));
  gl_FragColor = vec4(c * mix(0.5, 1.0, vg), 1.0);
}`;

    function compileShader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const pr = gl.createProgram();
    gl.attachShader(pr, compileShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(pr, compileShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr);

    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
      canvas.style.display = 'none';
      return;
    }

    gl.useProgram(pr);
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const a = gl.getAttribLocation(pr, 'a');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

    ['r', 'm', 't'].forEach((k) => {
      U[k] = gl.getUniformLocation(pr, k);
    });

    function size() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width || canvas.clientWidth || window.innerWidth || 360;
      const h = rect.height || canvas.clientHeight || window.innerHeight || 640;
      if (w <= 0 || h <= 0) return;

      const scale = 0.5;
      const targetW = Math.max(2, Math.floor(w * scale));
      const targetH = Math.max(2, Math.floor(h * scale));

      if (Math.abs(canvas.width - targetW) > 1 || Math.abs(canvas.height - targetH) > 1) {
        canvas.width = targetW;
        canvas.height = targetH;
        gl.viewport(0, 0, targetW, targetH);
      }
    }

    size();
    window.addEventListener('resize', size);

    let resizeObserver;
    if (window.ResizeObserver && canvas.parentElement) {
      resizeObserver = new ResizeObserver(() => size());
      resizeObserver.observe(canvas.parentElement);
    }

    const handlePointerMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        mx = e.touches[0].clientX;
        my = e.touches[0].clientY;
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchMove, { passive: true });

    let animationFrameId;
    const t0 = performance.now();

    function frame(now) {
      const t = (now - t0) / 1000;
      if (window.scrollY < window.innerHeight * 1.2) {
        size();
        const r = canvas.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          mm.tx = mx > -900 ? (mx - r.left) / r.width : 0.5;
          mm.ty = mx > -900 ? 1 - (my - r.top) / r.height : 0.5;
          mm.x += (mm.tx - mm.x) * 0.06;
          mm.y += (mm.ty - mm.y) * 0.06;

          gl.uniform2f(U.r, canvas.width, canvas.height);
          gl.uniform2f(U.m, mm.x, mm.y);
          gl.uniform1f(U.t, reduce ? 2 : t);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
      }
      animationFrameId = requestAnimationFrame(frame);
    }

    animationFrameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', size);
      if (resizeObserver) resizeObserver.disconnect();
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
    };
  }, []);

  return <canvas id="fx" ref={canvasRef} aria-hidden="true" />;
}
