import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, Radio, Shield, ArrowRight, Zap,
  MessageCircle, Lock, TrendingUp, ChevronRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────
   Canvas — subtle noise grid (no shooting stars, no particles)
   Looks like Vercel / Linear background grid
───────────────────────────────────────────────────────────────────────── */
const GridBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 1.4;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      const size = 60;
      ctx.strokeStyle = 'rgba(99, 182, 217, 0.06)';
      ctx.lineWidth = 1;

      for (let x = 0; x <= canvas.width; x += size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Dot at intersections
      ctx.fillStyle = 'rgba(56,189,248,0.15)'; // Light blue dots
      for (let x = 0; x <= canvas.width; x += size) {
        for (let y = 0; y <= canvas.height; y += size) {
          ctx.beginPath();
          ctx.arc(x, y, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Pill badge (reusable)
───────────────────────────────────────────────────────────────────────── */
const Pill = ({ children, color = '#3B82F6' }) => (
  <span
    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
    style={{
      color,
      borderColor: `${color}30`,
      background: `${color}0d`,
      letterSpacing: '0.02em',
    }}
  >
    {children}
  </span>
);

/* ─────────────────────────────────────────────────────────────────────────
   Feature card
───────────────────────────────────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, desc, accent }) => (
  <div
    className="group relative flex flex-col gap-4 p-6 rounded-2xl border transition-all duration-300 hover:border-opacity-60 cursor-default"
    style={{
      background: 'rgba(255,255,255,0.025)',
      borderColor: 'rgba(255,255,255,0.07)',
      backdropFilter: 'blur(12px)',
    }}
  >
    {/* Top accent line on hover */}
    <div
      className="absolute top-0 left-6 right-6 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ background: `linear-gradient(90deg, transparent, ${accent}80, transparent)` }}
    />

    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: `${accent}12`, border: `1px solid ${accent}20` }}
    >
      <Icon size={18} style={{ color: accent }} strokeWidth={1.8} />
    </div>

    <div className="space-y-1.5">
      <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>
      <p className="text-sm text-slate-400 leading-[1.65]">{desc}</p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   Stat item — clean, no counter animation
───────────────────────────────────────────────────────────────────────── */
const Stat = ({ value, label }) => (
  <div className="flex flex-col gap-1">
    <span className="text-3xl font-black text-white tracking-tight tabular-nums">{value}</span>
    <span className="text-xs text-slate-500 leading-snug">{label}</span>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   App Mockup — refined, realistic
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
      className="w-full rounded-2xl overflow-hidden border"
      style={{
        background: '#080f1c',
        borderColor: 'rgba(255,255,255,0.08)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px -20px rgba(0,0,0,0.8)',
      }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: '#060c18' }}
      >
        <div className="flex gap-1.5">
          {['#ff5f57', '#ffbd2e', '#28c840'].map(c => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <div
          className="flex-1 mx-3 h-5 rounded-md flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <span style={{ color: '#334155', fontSize: '10px', fontFamily: 'monospace' }}>
            aurev.app
          </span>
        </div>
      </div>

      <div className="flex" style={{ height: '320px' }}>
        {/* Sidebar */}
        <div
          className="hidden sm:flex w-52 flex-col border-r"
          style={{ borderColor: 'rgba(255,255,255,0.05)', background: '#060c18' }}
        >
          {/* Search bar */}
          <div className="p-3">
            <div
              className="h-7 rounded-lg px-3 flex items-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="h-1.5 w-1/2 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>
          </div>
          {/* Contact list */}
          <div className="flex flex-col gap-0.5 px-2">
            {contacts.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-2 py-2.5 rounded-xl"
                style={{
                  background: c.active ? 'rgba(59,130,246,0.1)' : 'transparent',
                  border: c.active ? '1px solid rgba(59,130,246,0.12)' : '1px solid transparent',
                }}
              >
                <div
                  className="w-8 h-8 rounded-full shrink-0 relative"
                  style={{ background: c.active ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)' }}
                >
                  {c.active && (
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                      style={{ background: '#22c55e', borderColor: '#060c18' }}
                    />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <div
                    className="h-2 rounded"
                    style={{ width: c.active ? '70%' : '60%', background: c.active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)' }}
                  />
                  <div className="h-1.5 w-5/6 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat pane */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div
            className="flex items-center gap-3 px-5 py-3 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <div className="w-8 h-8 rounded-full" style={{ background: 'rgba(59,130,246,0.25)' }} />
            <div className="space-y-1.5">
              <div className="h-2.5 w-24 rounded" style={{ background: 'rgba(255,255,255,0.15)' }} />
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
                <div className="h-1.5 w-12 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
            </div>
            <div className="ml-auto">
              <div
                className="h-5 px-2 rounded-md text-[9px] font-mono font-semibold flex items-center"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.15)' }}
              >
                LEGEND
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 flex flex-col justify-end gap-2 p-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.self ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="h-8 rounded-xl flex items-center px-3"
                  style={{
                    width: m.width,
                    background: m.self ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${m.self ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  <div
                    className="h-1.5 w-full rounded"
                    style={{ background: m.self ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)' }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Input bar */}
          <div
            className="flex items-center gap-3 m-4 px-4 h-10 rounded-xl border"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div className="h-1.5 flex-1 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
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
   Main page
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
      title: 'Echo Rank',
      desc: 'Your reputation, earned in real time. Every message and reaction builds a portable score that persists across conversations and rooms.',
      accent: '#F59E0B',
    },
    {
      icon: Radio,
      title: 'Stream Rooms',
      desc: 'Group spaces with a live pulse. Activity heatmaps and engagement scores surface the conversations worth joining.',
      accent: '#06B6D4',
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
      className="min-h-screen relative overflow-x-hidden text-white"
      style={{ background: '#000000', fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes gradientPan {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        .anim-1 { animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) 0.05s both; }
        .anim-2 { animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) 0.15s both; }
        .anim-3 { animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) 0.25s both; }
        .anim-4 { animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) 0.38s both; }
        .anim-5 { animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) 0.5s both; }
        .anim-6 { animation: fadeIn  0.9s cubic-bezier(.16,1,.3,1) 0.6s both; }
        .gradient-heading {
          background: linear-gradient(135deg, #e2e8f0 0%, #94a3b8 60%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gradient-accent {
          background: linear-gradient(135deg, #60a5fa, #818cf8, #a78bfa);
          background-size: 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientPan 5s ease infinite;
        }
        .card-hover {
          transition: border-color 0.25s, background 0.25s, transform 0.25s;
        }
        .card-hover:hover {
          border-color: rgba(255,255,255,0.12) !important;
          background: rgba(255,255,255,0.04) !important;
          transform: translateY(-2px);
        }
        .btn-primary {
          background: #3B82F6;
          transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
          box-shadow: 0 4px 14px rgba(59,130,246,0.35);
        }
        .btn-primary:hover {
          background: #2563EB;
          box-shadow: 0 6px 20px rgba(59,130,246,0.45);
        }
        .btn-primary:active { transform: scale(0.98); }
        .btn-ghost {
          transition: background 0.2s, color 0.2s;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.06);
          color: white;
        }
        .divider {
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
        }
        .section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #475569;
        }
        .orb-1 {
          position: fixed;
          pointer-events: none;
          z-index: 0;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          top: -150px;
          left: -100px;
          background: radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(125,211,252,0.05) 50%, transparent 70%);
          filter: blur(40px);
        }
        .orb-2 {
          position: fixed;
          pointer-events: none;
          z-index: 0;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          top: 50px;
          right: -120px;
          background: radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 65%);
          filter: blur(60px);
        }
      `}</style>

      <GridBackground />
      <div className="orb-1" />
      <div className="orb-2" />

      {/* ──────────────────────────────── NAV */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
        style={{
          background: scrolled ? 'rgba(0,0,0,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: '#3B82F6' }}
            >
              <Zap size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-base text-white tracking-tight">AUREV</span>
          </div>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-7">
            {['Features', 'Rooms', 'Echo Rank'].map(link => (
              <button
                key={link}
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
              >
                {link}
              </button>
            ))}
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/login')}
              className="btn-ghost hidden sm:block text-sm text-slate-400 px-4 py-2 rounded-xl"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="btn-primary text-sm font-semibold text-white px-5 py-2 rounded-xl"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────── HERO */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center pt-24 pb-20">

        {/* Badge */}
        <div className="anim-1 mb-7">
          <Pill color="#3B82F6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
            Open Access Beta — Free to join
          </Pill>
        </div>

        {/* Headline */}
        <h1
          className="anim-2 font-black tracking-tight leading-[1.08] max-w-3xl"
          style={{ fontSize: 'clamp(38px, 6vw, 72px)' }}
        >
          Where your voice<br />
          builds its own{' '}
          <span className="gradient-accent">gravity</span>
        </h1>

        {/* Sub */}
        <p className="anim-3 mt-6 text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
          AUREV is a momentum communication platform. Every message and reaction
          accumulates into a portable reputation that follows you forever.
        </p>

        {/* CTA */}
        <div className="anim-4 flex flex-col sm:flex-row items-center gap-3 mt-9">
          <button
            onClick={() => navigate('/signup')}
            className="btn-primary flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white"
          >
            Start for free
            <ArrowRight size={15} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-ghost text-sm font-medium text-slate-400 px-7 py-3 rounded-xl border"
            style={{ borderColor: 'rgba(255,255,255,0.09)' }}
          >
            See how it works
          </button>
        </div>

        {/* Stats strip — clean, no fake live counter */}
        <div
          className="anim-5 flex items-center gap-10 sm:gap-16 mt-14 pt-8 border-t w-full max-w-lg justify-center flex-wrap"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <Stat value="99.9%" label="Uptime SLA" />
          <div className="h-8 w-px hidden sm:block" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <Stat value="< 100ms" label="Message delivery" />
          <div className="h-8 w-px hidden sm:block" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <Stat value="E2E" label="Encrypted by default" />
        </div>

        {/* Mockup */}
        <div className="anim-6 w-full max-w-4xl mt-20">
          <AppMockup />
        </div>
      </section>

      <hr className="divider mx-6 max-w-6xl xl:mx-auto" />

      {/* ──────────────────────────────── FEATURES */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-28">
        <div className="mb-14">
          <p className="section-label mb-3">Platform</p>
          <h2
            className="font-black tracking-tight max-w-lg leading-tight"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
          >
            Built around your{' '}
            <span className="gradient-accent">reputation</span>
          </h2>
          <p className="mt-4 text-slate-400 text-base max-w-sm leading-relaxed">
            Every feature compounds over time. The longer you use AUREV, the more valuable your presence becomes.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(f => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      <hr className="divider mx-6 max-w-6xl xl:mx-auto" />

      {/* ──────────────────────────────── HOW IT WORKS */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-28">
        <div className="mb-14">
          <p className="section-label mb-3">How it works</p>
          <h2
            className="font-black tracking-tight leading-tight"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
          >
            Three steps to momentum
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Create your account',
              desc: 'No phone number. No personal data required. Pick a handle and your sovereign identity is live in seconds.',
              accent: '#3B82F6',
            },
            {
              step: '02',
              title: 'Start messaging',
              desc: 'Find friends, join rooms, and send messages. Every interaction earns Echo Points that build your live reputation score.',
              accent: '#6366F1',
            },
            {
              step: '03',
              title: 'Build gravity',
              desc: 'Your rank ascends from Bronze to Legend. Your score travels with you — visible, portable, and cryptographically verified.',
              accent: '#8B5CF6',
            },
          ].map(item => (
            <div key={item.step} className="flex flex-col gap-5">
              <div
                className="text-xs font-mono font-bold"
                style={{ color: item.accent, letterSpacing: '0.1em' }}
              >
                {item.step}
              </div>
              <div
                className="w-10 h-px rounded-full"
                style={{ background: item.accent, opacity: 0.4 }}
              />
              <div>
                <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider mx-6 max-w-6xl xl:mx-auto" />

      {/* ──────────────────────────────── CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-28">
        <div
          className="rounded-2xl border px-10 py-16 relative overflow-hidden"
          style={{
            background: 'rgba(59,130,246,0.05)',
            borderColor: 'rgba(59,130,246,0.12)',
          }}
        >
          {/* Subtle inner glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-24 blur-3xl pointer-events-none"
            style={{ background: 'rgba(59,130,246,0.2)', opacity: 0.6 }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="max-w-lg">
              <p className="section-label mb-3">Ready to start?</p>
              <h2
                className="font-black tracking-tight leading-tight text-white"
                style={{ fontSize: 'clamp(26px, 3.5vw, 40px)' }}
              >
                Your echo starts here
              </h2>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed max-w-sm">
                Join thousands of users already building their momentum. Free forever — no card required.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => navigate('/signup')}
                className="btn-primary flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white whitespace-nowrap"
              >
                Create free account
                <ChevronRight size={15} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-slate-400 hover:text-white transition-colors underline underline-offset-4 whitespace-nowrap"
              >
                Sign in instead
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────── FOOTER */}
      <footer
        className="relative z-10 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.7)' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: '#3B82F6' }}
            >
              <Zap size={12} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-white">AUREV</span>
          </div>

          <p className="text-xs text-slate-600 font-mono">
            © {new Date().getFullYear()} AUREV Platform
          </p>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <button className="hover:text-slate-300 transition-colors">Privacy</button>
            <button className="hover:text-slate-300 transition-colors">Terms</button>
            <button
              onClick={() => navigate('/signup')}
              className="hover:text-white transition-colors text-slate-400 font-medium"
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
