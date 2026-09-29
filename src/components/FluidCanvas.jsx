import { useEffect, useRef } from 'react';

export default function FluidCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false });
    if (!gl) {
      canvas.style.display = 'none';
      return;
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const U = {};
    const mm = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let mx = -999;
    let my = -999;

    const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    const fs = `precision mediump float;
uniform vec2 r,m;
uniform float t;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n(p);p=p*2.03+7.1;a*=.5;}return s;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  vec2 p=(gl_FragCoord.xy-.5*r)/r.y;
  vec2 d=uv-m;
  float md=exp(-dot(d,d)*16.);
  p*=1.5;
  p+=d*md*.7;
  float tt=t*.05;
  vec2 q=vec2(fbm(p+tt),fbm(p+vec2(5.2,1.3)-tt));
  vec2 w=vec2(fbm(p+3.*q+vec2(1.7,9.2)+tt*1.5),fbm(p+3.*q+vec2(8.3,2.8)-tt));
  float v=fbm(p+3.*w);
  vec3 pal=.5+.5*cos(6.2832*(v*1.3+vec3(0.,.33,.67)+w.x*.5));
  float ridge=smoothstep(.35,.75,v)*(1.-smoothstep(.75,1.,v));
  vec3 silver=vec3(.75,.78,.85);
  vec3 c=vec3(.035,.04,.055)+mix(silver*.5,pal,.5)*ridge*.5+pal*.06*w.y;
  c+=silver*pow(ridge,6.)*.12;
  float vg=smoothstep(1.2,.2,length(uv-.5));
  gl_FragColor=vec4(c*mix(.5,1.,vg),1.);
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
      const s = 0.5;
      canvas.width = Math.max(2, Math.floor(canvas.clientWidth * s));
      canvas.height = Math.max(2, Math.floor(canvas.clientHeight * s));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    size();
    window.addEventListener('resize', size);

    const handlePointerMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    let animationFrameId;
    const t0 = performance.now();

    function frame(now) {
      const t = (now - t0) / 1000;
      if (window.scrollY < window.innerHeight * 1.1) {
        const r = canvas.getBoundingClientRect();
        mm.tx = mx > -900 ? (mx - r.left) / r.width : 0.5;
        mm.ty = mx > -900 ? 1 - (my - r.top) / r.height : 0.5;
        mm.x += (mm.tx - mm.x) * 0.06;
        mm.y += (mm.ty - mm.y) * 0.06;

        gl.uniform2f(U.r, canvas.width, canvas.height);
        gl.uniform2f(U.m, mm.x, mm.y);
        gl.uniform1f(U.t, reduce ? 2 : t);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      animationFrameId = requestAnimationFrame(frame);
    }

    animationFrameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', size);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return <canvas id="fx" ref={canvasRef} aria-hidden="true" />;
}
