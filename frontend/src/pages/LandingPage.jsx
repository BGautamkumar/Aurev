import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, Radio, Shield, ArrowRight, Zap,
  MessageCircle, Lock, TrendingUp, ChevronRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────
   WebGL Background — Invisible Human Influence
───────────────────────────────────────────────────────────────────────── */
const WebGLBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vsSource = `
      attribute vec4 aVertexPosition;
      void main() {
        gl_Position = aVertexPosition;
      }
    `;

    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ; m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        uv.x *= u_resolution.x / u_resolution.y;

        // "Invisible Influence" - complex fluid distortion mapping
        vec2 p = uv;
        for(float i = 1.0; i < 6.0; i++) {
            uv.x += 0.6 / i * cos(i * 2.5 * uv.y + u_time * 0.08);
            uv.y += 0.6 / i * cos(i * 1.5 * uv.x + u_time * 0.08);
        }
        
        float n = snoise(uv * 1.2 + u_time * 0.04);
        n = n * 0.5 + 0.5; // Normalize 0 to 1

        // Palette
        vec3 bg = vec3(0.972, 0.968, 0.956); // #f8f7f4 Cream base
        vec3 shadow = vec3(0.04, 0.04, 0.04); // Deep void black/ink
        vec3 accent = vec3(0.23, 0.51, 0.96); // #3B82F6 Aurev Blue

        // Mapping the fluid (Darkness creeping in unseen)
        float intensity = smoothstep(0.1, 0.85, n);
        
        vec3 col = bg;
        // The dark side bleeding through the civilization invisibly
        col = mix(col, shadow, intensity * 0.18);
        // The twist: where the darkness is most concentrated, a subtle glowing blue energy (the user's true influence) emerges
        col = mix(col, accent, pow(intensity, 4.0) * 0.4);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const initShaderProgram = (gl, vsSource, fsSource) => {
      const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
      const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
      const shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);
      return shaderProgram;
    };

    const loadShader = (gl, type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const programInfo = {
      program: shaderProgram,
      attribLocations: { vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition') },
      uniformLocations: {
        resolution: gl.getUniformLocation(shaderProgram, 'u_resolution'),
        time: gl.getUniformLocation(shaderProgram, 'u_time'),
      },
    };

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    let raf;
    let startTime = Date.now();

    const resize = () => {
      const scale = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      const time = (Date.now() - startTime) * 0.001;
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

      gl.useProgram(programInfo.program);
      gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);
      gl.uniform1f(programInfo.uniformLocations.time, time);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: '100vw', height: '100vh', opacity: 1 }}
    />
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Pill badge
───────────────────────────────────────────────────────────────────────── */
const Pill = ({ children, color = '#3B82F6' }) => (
  <span
    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
    style={{
      color,
      borderColor: `${color}25`,
      background: `${color}0c`,
      letterSpacing: '0.02em',
    }}
  >
    {children}
  </span>
);

/* ─────────────────────────────────────────────────────────────────────────
   Feature Card — light, airy, ink-on-cream
───────────────────────────────────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, desc, accent, index }) => (
  <div
    className="group relative flex flex-col gap-5 p-7 rounded-3xl transition-all duration-500 cursor-default"
    style={{
      background: 'rgba(255,255,255,0.72)',
      border: '1px solid rgba(0,0,0,0.06)',
      backdropFilter: 'blur(0px)',
    }}
  >
    {/* Animated top border on hover */}
    <div
      className="absolute top-0 left-8 right-8 h-[1.5px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700"
      style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
    />

    {/* Number tag */}
    <span
      className="absolute top-5 right-6 text-xs font-black tabular-nums"
      style={{ color: 'rgba(0,0,0,0.1)', fontSize: '11px', letterSpacing: '0.05em' }}
    >
      {String(index + 1).padStart(2, '0')}
    </span>

    <div
      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
      style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}
    >
      <Icon size={19} style={{ color: accent }} strokeWidth={1.7} />
    </div>

    <div className="space-y-2">
      <h3 className="font-bold text-[15px] tracking-tight" style={{ color: '#0f0f0f' }}>{title}</h3>
      <p className="text-sm leading-[1.7]" style={{ color: '#6b7280' }}>{desc}</p>
    </div>

    {/* Hover underline bar */}
    <div
      className="h-0.5 w-0 group-hover:w-12 rounded-full transition-all duration-500"
      style={{ background: accent }}
    />
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   Stat item
───────────────────────────────────────────────────────────────────────── */
const Stat = ({ value, label }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-3xl font-black tracking-tight tabular-nums" style={{ color: '#0f0f0f' }}>{value}</span>
    <span className="text-xs font-medium" style={{ color: '#9ca3af' }}>{label}</span>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   App Mockup — light theme, refined
───────────────────────────────────────────────────────────────────────── */
const AppMockup = () => {
  const messages = [
    { self: false, width: '58%' },
    { self: true, width: '42%' },
    { self: false, width: '70%' },
    { self: true, width: '35%' },
    { self: false, width: '62%' },
  ];

  const contacts = [
    { active: true },
    { active: false },
    { active: false },
    { active: false },
  ];

  return (
    <div
      className="w-full rounded-3xl overflow-hidden"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04), 0 40px 80px -20px rgba(0,0,0,0.12)',
      }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-2 px-5 py-3.5 border-b"
        style={{ borderColor: 'rgba(0,0,0,0.06)', background: '#fafafa' }}
      >
        <div className="flex gap-1.5">
          {['#ff5f57', '#ffbd2e', '#28c840'].map(c => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <div
          className="flex-1 mx-3 h-5 rounded-md flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.04)' }}
        >
          <span style={{ color: '#9ca3af', fontSize: '10px', fontFamily: 'monospace' }}>
            aurev.app
          </span>
        </div>
      </div>

      <div className="flex" style={{ height: '320px' }}>
        {/* Sidebar */}
        <div
          className="hidden sm:flex w-52 flex-col border-r"
          style={{ borderColor: 'rgba(0,0,0,0.05)', background: '#f9fafb' }}
        >
          <div className="p-3">
            <div
              className="h-7 rounded-xl px-3 flex items-center"
              style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <div className="h-1.5 w-1/2 rounded" style={{ background: 'rgba(0,0,0,0.08)' }} />
            </div>
          </div>
          <div className="flex flex-col gap-0.5 px-2">
            {contacts.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-2 py-2.5 rounded-xl"
                style={{
                  background: c.active ? 'rgba(59,130,246,0.08)' : 'transparent',
                  border: c.active ? '1px solid rgba(59,130,246,0.12)' : '1px solid transparent',
                }}
              >
                <div
                  className="w-8 h-8 rounded-full shrink-0 relative"
                  style={{ background: c.active ? 'rgba(59,130,246,0.15)' : 'rgba(0,0,0,0.07)' }}
                >
                  {c.active && (
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                      style={{ background: '#22c55e', borderColor: '#f9fafb' }}
                    />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <div
                    className="h-2 rounded"
                    style={{ width: c.active ? '70%' : '60%', background: c.active ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.10)' }}
                  />
                  <div className="h-1.5 w-5/6 rounded" style={{ background: 'rgba(0,0,0,0.06)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat pane */}
        <div className="flex-1 flex flex-col">
          <div
            className="flex items-center gap-3 px-5 py-3 border-b"
            style={{ borderColor: 'rgba(0,0,0,0.05)' }}
          >
            <div className="w-8 h-8 rounded-full" style={{ background: 'rgba(59,130,246,0.15)' }} />
            <div className="space-y-1.5">
              <div className="h-2.5 w-24 rounded" style={{ background: 'rgba(0,0,0,0.12)' }} />
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
                <div className="h-1.5 w-12 rounded" style={{ background: 'rgba(0,0,0,0.06)' }} />
              </div>
            </div>
            <div className="ml-auto">
              <div
                className="h-5 px-2 rounded-md text-[9px] font-mono font-bold flex items-center"
                style={{ background: 'rgba(245,158,11,0.10)', color: '#D97706', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                LEGEND
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-end gap-2 p-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.self ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="h-8 rounded-2xl flex items-center px-3"
                  style={{
                    width: m.width,
                    background: m.self ? 'rgba(59,130,246,0.10)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${m.self ? 'rgba(59,130,246,0.15)' : 'rgba(0,0,0,0.06)'}`,
                  }}
                >
                  <div
                    className="h-1.5 w-full rounded"
                    style={{ background: m.self ? 'rgba(59,130,246,0.35)' : 'rgba(0,0,0,0.10)' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            className="flex items-center gap-3 m-4 px-4 h-10 rounded-xl border"
            style={{ background: 'rgba(0,0,0,0.025)', borderColor: 'rgba(0,0,0,0.07)' }}
          >
            <div className="h-1.5 flex-1 rounded" style={{ background: 'rgba(0,0,0,0.07)' }} />
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: '#3B82F6' }}
            >
              <ArrowRight size={11} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Rank Badge — decorative element showing tier system
───────────────────────────────────────────────────────────────────────── */
const RankBadge = ({ tier, color, bg, score, delay }) => (
  <div
    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
    style={{
      background: bg,
      border: `1px solid ${color}20`,
      animation: `floatUp 0.6s cubic-bezier(.16,1,.3,1) ${delay}s both`,
    }}
  >
    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
    <span className="text-xs font-bold tracking-wider" style={{ color: color }}>{tier}</span>
    <span className="text-xs font-mono ml-auto" style={{ color: 'rgba(0,0,0,0.4)' }}>{score}</span>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   Activity Heatmap — decorative visual for Stream Rooms
───────────────────────────────────────────────────────────────────────── */
const ActivityHeatmap = () => {
  const cells = Array.from({ length: 7 * 12 }, (_, i) => ({
    intensity: Math.random(),
  }));

  return (
    <div className="flex gap-1 flex-wrap" style={{ width: '200px' }}>
      {cells.map((c, i) => (
        <div
          key={i}
          className="rounded-sm"
          style={{
            width: '12px',
            height: '12px',
            background: c.intensity > 0.7
              ? 'rgba(59,130,246,0.8)'
              : c.intensity > 0.4
                ? 'rgba(59,130,246,0.35)'
                : c.intensity > 0.2
                  ? 'rgba(59,130,246,0.12)'
                  : 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Floating decorative card — gravitational score
───────────────────────────────────────────────────────────────────────── */
const FloatingScoreCard = () => (
  <div
    className="hidden lg:block absolute"
    style={{
      right: '-40px', top: '60px',
      background: 'white',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: '20px',
      padding: '16px 20px',
      boxShadow: '0 20px 60px -10px rgba(0,0,0,0.10)',
      animation: 'floatSlow 6s ease-in-out infinite',
      zIndex: 20,
    }}
  >
    <div className="flex items-center gap-3 mb-3">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(245,158,11,0.12)' }}
      >
        <Trophy size={15} style={{ color: '#D97706' }} strokeWidth={2} />
      </div>
      <div>
        <p className="text-xs font-semibold" style={{ color: '#0f0f0f' }}>Aurev Score</p>
        <p className="text-[10px]" style={{ color: '#9ca3af' }}>Your gravity</p>
      </div>
    </div>
    <div className="flex items-end gap-1">
      <span className="text-2xl font-black" style={{ color: '#D97706' }}>4,820</span>
      <span className="text-xs mb-1" style={{ color: '#10B981' }}>↑ 12%</span>
    </div>
    <div className="mt-2 h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }}>
      <div className="h-full rounded-full" style={{ width: '72%', background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }} />
    </div>
    <p className="text-[10px] mt-1.5" style={{ color: '#9ca3af' }}>72% to Legend tier</p>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   Floating Live Ping card
───────────────────────────────────────────────────────────────────────── */
const FloatingPingCard = () => (
  <div
    className="hidden lg:block absolute"
    style={{
      left: '-50px', bottom: '80px',
      background: 'white',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: '16px',
      padding: '12px 16px',
      boxShadow: '0 20px 60px -10px rgba(0,0,0,0.10)',
      animation: 'floatSlow 8s ease-in-out 2s infinite',
      zIndex: 20,
    }}
  >
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e' }} />
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: 'rgba(34,197,94,0.4)' }}
        />
      </div>
      <span className="text-xs font-semibold" style={{ color: '#0f0f0f' }}>Live — 38ms</span>
    </div>
    <p className="text-[10px] mt-1" style={{ color: '#9ca3af' }}>Socket latency</p>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   Main landing page
───────────────────────────────────────────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    {
      icon: Trophy,
      title: 'Aurev Rank',
      desc: 'Your reputation, earned in real time. Every message and reaction builds a portable score that persists across conversations and rooms.',
      accent: '#F59E0B',
    },
    {
      icon: Radio,
      title: 'Stream Rooms',
      desc: 'Group spaces with a live pulse. Activity heatmaps and engagement scores surface the conversations worth joining.',
      accent: '#3B82F6',
    },
    {
      icon: Shield,
      title: 'Sovereign Identity',
      desc: 'No phone number required. Your identity is cryptographic — self-owned, private by default, and impossible to confiscate.',
      accent: '#10B981',
    },
    {
      icon: Zap,
      title: 'Instant Delivery',
      desc: 'Messages land in under 100ms, globally. Voice, images, and reactions — all delivered over a persistent Socket.io layer.',
      accent: '#6366F1',
    },
    {
      icon: MessageCircle,
      title: 'Rich Messaging',
      desc: 'Text, voice notes, images, and reactions in one thread. Edit and soft-delete with full read-receipt control.',
      accent: '#EC4899',
    },
    {
      icon: TrendingUp,
      title: 'Momentum Engine',
      desc: 'Engagement accumulates into a gravity score that shapes your reach. The more you contribute, the more your voice resonates.',
      accent: '#3B82F6',
    },
  ];

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: '#f8f7f4',
        fontFamily: "'Satoshi', 'DM Sans', 'Inter', system-ui, sans-serif",
        color: '#0f0f0f',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(0.5deg); }
          66% { transform: translateY(-4px) rotate(-0.5deg); }
        }
        @keyframes gradientPan {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes drawLine {
          from { stroke-dashoffset: 600; }
          to   { stroke-dashoffset: 0; }
        }

        .anim-1 { animation: fadeUp 0.8s cubic-bezier(.16,1,.3,1) 0.05s both; }
        .anim-2 { animation: fadeUp 0.8s cubic-bezier(.16,1,.3,1) 0.18s both; }
        .anim-3 { animation: fadeUp 0.8s cubic-bezier(.16,1,.3,1) 0.30s both; }
        .anim-4 { animation: fadeUp 0.8s cubic-bezier(.16,1,.3,1) 0.44s both; }
        .anim-5 { animation: fadeUp 0.8s cubic-bezier(.16,1,.3,1) 0.58s both; }
        .anim-6 { animation: fadeIn  1.0s cubic-bezier(.16,1,.3,1) 0.70s both; }

        .gradient-heading {
          background: linear-gradient(135deg, #0f0f0f 0%, #374151 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .gradient-accent {
          background: linear-gradient(135deg, #3B82F6, #6366F1, #8B5CF6);
          background-size: 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientPan 6s ease infinite;
        }

        .gradient-amber {
          background: linear-gradient(135deg, #F59E0B, #EF4444);
          background-size: 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientPan 5s ease infinite;
        }

        .btn-primary {
          background: #0f0f0f;
          color: white;
          transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }
        .btn-primary:hover {
          background: #1a1a1a;
          box-shadow: 0 6px 20px rgba(0,0,0,0.22);
          transform: translateY(-1px);
        }
        .btn-primary:active { transform: scale(0.98) translateY(0); }

        .btn-blue {
          background: #3B82F6;
          color: white;
          transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
          box-shadow: 0 4px 14px rgba(59,130,246,0.35);
        }
        .btn-blue:hover {
          background: #2563EB;
          box-shadow: 0 6px 24px rgba(59,130,246,0.45);
          transform: translateY(-1px);
        }

        .btn-ghost {
          transition: background 0.2s, color 0.2s, border-color 0.2s;
          color: #374151;
          border: 1px solid rgba(0,0,0,0.10);
        }
        .btn-ghost:hover {
          background: white;
          border-color: rgba(0,0,0,0.15);
          color: #0f0f0f;
        }

        .feature-card-hover {
          transition: transform 0.3s cubic-bezier(.16,1,.3,1), box-shadow 0.3s, border-color 0.3s;
        }
        .feature-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.10);
          border-color: rgba(0,0,0,0.10) !important;
        }

        .section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #9ca3af;
        }

        .divider {
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent);
        }

        .nav-blur {
          background: rgba(248,247,244,0.88);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
        }



        /* Step line drawing animation */
        .step-line {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: drawLine 2s ease forwards;
        }

        /* Testimonial / social proof shimmer */
        .shimmer-bar {
          background: linear-gradient(90deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.10) 50%, rgba(0,0,0,0.05) 75%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>

      <WebGLBackground />

      {/* ──────────────────────────────── NAV */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={scrolled ? {
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        } : {}}
      >
        <div className={scrolled ? 'nav-blur' : ''}>
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: '#0f0f0f' }}
              >
                <Zap size={14} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-black text-base tracking-tight" style={{ color: '#0f0f0f' }}>AUREV</span>
            </div>

            <nav className="hidden md:flex items-center gap-7">
              {['Features', 'Rooms', 'Aurev Rank'].map(link => (
                <button
                  key={link}
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm font-medium transition-colors duration-200 hover:text-black"
                  style={{ color: '#6b7280' }}
                >
                  {link}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate('/login')}
                className="btn-ghost hidden sm:block text-sm font-medium px-4 py-2 rounded-xl"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="btn-primary text-sm font-bold px-5 py-2 rounded-xl"
              >
                Get started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────── HERO */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center pt-28 pb-20">

        {/* Decorative top lines */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)' }} />

        {/* Badge */}
        <div className="anim-1 mb-8">
          <Pill color="#3B82F6">
            <span
              className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
              style={{ background: '#3B82F6' }}
            />
            Open Access Beta — Free to join
          </Pill>
        </div>

        {/* Headline */}
        <h1
          className="anim-2 font-black tracking-tight leading-[1.06] max-w-3xl"
          style={{ fontSize: 'clamp(42px, 6.5vw, 76px)', color: '#0f0f0f' }}
        >
          Where your voice<br />
          builds its own{' '}
          <span className="gradient-accent">gravity</span>
        </h1>

        {/* Sub */}
        <p
          className="anim-3 mt-6 text-base sm:text-lg max-w-xl leading-relaxed"
          style={{ color: '#6b7280' }}
        >
          AUREV is a momentum communication platform. Every message and reaction
          accumulates into a portable reputation that follows you forever.
        </p>

        {/* CTA */}
        <div className="anim-4 flex flex-col sm:flex-row items-center gap-3 mt-9">
          <button
            onClick={() => navigate('/signup')}
            className="btn-blue flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold"
          >
            Start for free
            <ArrowRight size={15} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-ghost text-sm font-medium px-7 py-3 rounded-xl"
          >
            See how it works
          </button>
        </div>

        {/* Stats strip */}
        <div
          className="anim-5 flex items-center gap-10 sm:gap-16 mt-14 pt-8 border-t w-full max-w-lg justify-center flex-wrap"
          style={{ borderColor: 'rgba(0,0,0,0.07)' }}
        >
          <Stat value="99.9%" label="Uptime SLA" />
          <div className="h-8 w-px hidden sm:block" style={{ background: 'rgba(0,0,0,0.08)' }} />
          <Stat value="< 100ms" label="Message delivery" />
          <div className="h-8 w-px hidden sm:block" style={{ background: 'rgba(0,0,0,0.08)' }} />
          <Stat value="E2E" label="Encrypted by default" />
        </div>

        {/* Mockup with floating cards */}
        <div className="anim-6 w-full max-w-4xl mt-20 relative">
          <FloatingScoreCard />
          <FloatingPingCard />
          <AppMockup />
        </div>

        {/* Floating rank badges row */}
        <div className="anim-6 flex flex-wrap items-center justify-center gap-3 mt-10">
          {[
            { tier: 'BRONZE', color: '#CD7F32', bg: 'rgba(205,127,50,0.07)', score: '0–999', delay: 0.8 },
            { tier: 'SILVER', color: '#9ca3af', bg: 'rgba(156,163,175,0.07)', score: '1K–4.9K', delay: 0.9 },
            { tier: 'GOLD', color: '#D97706', bg: 'rgba(217,119,6,0.07)', score: '5K–19.9K', delay: 1.0 },
            { tier: 'LEGEND', color: '#6366F1', bg: 'rgba(99,102,241,0.07)', score: '20K+', delay: 1.1 },
          ].map(r => <RankBadge key={r.tier} {...r} />)}
        </div>
      </section>

      <hr className="divider mx-6 max-w-6xl xl:mx-auto" />

      {/* ──────────────────────────────── FEATURES */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-28">

        {/* Section intro — split layout */}
        <div className="flex flex-col lg:flex-row gap-12 mb-16 items-start">
          <div className="flex-1">
            <p className="section-label mb-4">Platform</p>
            <h2
              className="font-black tracking-tight max-w-lg leading-tight"
              style={{ fontSize: 'clamp(30px, 4vw, 52px)', color: '#0f0f0f' }}
            >
              Built around your{' '}
              <span className="gradient-accent">reputation</span>
            </h2>
          </div>
          <div className="lg:max-w-xs pt-2">
            <p className="text-base leading-relaxed" style={{ color: '#6b7280' }}>
              Every feature compounds over time. The longer you use AUREV, the more valuable your presence becomes.
            </p>
            {/* Activity heatmap visual */}
            <div className="mt-6">
              <p className="text-xs font-semibold mb-3" style={{ color: '#9ca3af', letterSpacing: '0.08em' }}>ACTIVITY HEATMAP</p>
              <ActivityHeatmap />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={f.title} className="feature-card-hover">
              <FeatureCard {...f} index={i} />
            </div>
          ))}
        </div>
      </section>

      <hr className="divider mx-6 max-w-6xl xl:mx-auto" />

      {/* ──────────────────────────────── HOW IT WORKS */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-28">
        <div className="mb-16">
          <p className="section-label mb-4">How it works</p>
          <h2
            className="font-black tracking-tight leading-tight"
            style={{ fontSize: 'clamp(30px, 4vw, 52px)', color: '#0f0f0f' }}
          >
            Three steps to momentum
          </h2>
        </div>

        {/* Step layout — editorial, horizontal rule connecting steps */}
        <div className="relative">
          {/* Connecting rule (desktop only) */}
          <div
            className="hidden md:block absolute top-4 left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.10) 15%, rgba(0,0,0,0.10) 85%, transparent)',
              zIndex: 0,
            }}
          />

          <div className="grid md:grid-cols-3 gap-12 relative z-10">
            {[
              {
                step: '01',
                title: 'Create your account',
                desc: 'No phone number. No personal data required. Pick a handle and your sovereign identity is live in seconds.',
                accent: '#3B82F6',
                icon: Shield,
              },
              {
                step: '02',
                title: 'Start messaging',
                desc: 'Find friends, join rooms, and send messages. Every interaction earns Aurev Points that build your live reputation score.',
                accent: '#6366F1',
                icon: MessageCircle,
              },
              {
                step: '03',
                title: 'Build gravity',
                desc: 'Your rank ascends from Bronze to Legend. Your score travels with you — visible, portable, and cryptographically verified.',
                accent: '#8B5CF6',
                icon: TrendingUp,
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-5">
                {/* Step number with dot */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'white', border: `1.5px solid ${item.accent}`, boxShadow: '0 0 0 4px white' }}
                  >
                    <item.icon size={14} style={{ color: item.accent }} strokeWidth={2} />
                  </div>
                  <span
                    className="text-xs font-black tabular-nums"
                    style={{ color: item.accent, letterSpacing: '0.08em' }}
                  >
                    {item.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#0f0f0f' }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{item.desc}</p>
                </div>
                {/* Micro progress bar */}
                <div
                  className="h-0.5 w-8 rounded-full"
                  style={{ background: item.accent, opacity: 0.5 }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider mx-6 max-w-6xl xl:mx-auto" />

      {/* ──────────────────────────────── CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-28">
        <div
          className="rounded-3xl px-10 py-16 relative overflow-hidden"
          style={{
            background: '#0f0f0f',
          }}
        >
          {/* Decorative rings inside the dark CTA card */}
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 70% 30%, rgba(59,130,246,0.18) 0%, transparent 60%)',
              transform: 'translate(30%, -30%)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)',
              transform: 'translate(-30%, 30%)',
            }}
          />

          {/* Grid overlay inside dark card */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="max-w-lg">
              <p className="section-label mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Ready to start?</p>
              <h2
                className="font-black tracking-tight leading-tight text-white"
                style={{ fontSize: 'clamp(28px, 3.5vw, 44px)' }}
              >
                Your aurev starts here
              </h2>
              <p className="mt-3 text-sm leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Join thousands of users already building their momentum. Free forever — no card required.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => navigate('/signup')}
                className="btn-blue flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold whitespace-nowrap"
              >
                Create free account
                <ChevronRight size={15} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-medium transition-colors whitespace-nowrap"
                style={{ color: 'rgba(255,255,255,0.45)' }}
                onMouseEnter={e => e.target.style.color = 'white'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
              >
                Sign in instead →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────── FOOTER */}
      <footer
        className="relative z-10 border-t"
        style={{ borderColor: 'rgba(0,0,0,0.06)', background: 'rgba(248,247,244,0.8)' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: '#0f0f0f' }}
            >
              <Zap size={12} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-black" style={{ color: '#0f0f0f' }}>AUREV</span>
          </div>

          <p className="text-xs font-mono" style={{ color: '#9ca3af' }}>
            © {new Date().getFullYear()} AUREV Platform
          </p>

          <div className="flex items-center gap-6 text-xs" style={{ color: '#9ca3af' }}>
            <button className="hover:text-black transition-colors">Privacy</button>
            <button className="hover:text-black transition-colors">Terms</button>
            <button
              onClick={() => navigate('/signup')}
              className="hover:text-black transition-colors font-semibold"
              style={{ color: '#374151' }}
            >
              Get started
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;