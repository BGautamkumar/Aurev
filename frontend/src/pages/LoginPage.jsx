import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Radio, Crown, Key } from 'lucide-react';
import AuthCard from '../components/organisms/AuthCard';
import Input from '../components/atoms/Input';
import Button from '../components/atoms/Button';
import Checkbox from '../components/atoms/Checkbox';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoggingIn) return;
    await login({ email: formData.email, password: formData.password });
  };

  const features = [
    { icon: <Crown className="w-5 h-5" style={{ color: '#2563EB' }} />, title: 'Aurev Rank', description: 'Your live reputation — built by every message, reaction, and contribution' },
    { icon: <Radio className="w-5 h-5" style={{ color: '#2563EB' }} />, title: 'Stream Rooms', description: 'Living communities with a pulse — not dead group chats' },
    { icon: <Key className="w-5 h-5" style={{ color: '#16A34A' }} />, title: 'Sovereign Identity', description: 'Cryptographic identity — you own your account, forever' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#FAFAFA' }}>
      {/* Ambient mesh — subtle blue behind form area */}
      <div
        className="absolute top-[10%] right-[20%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative w-full max-w-6xl mx-auto z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Brand Showcase */}
          <div className="hidden lg:block text-left space-y-10 animate-fade-in">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
                >
                  <span className="text-lg font-black tracking-tight text-white">AU</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight" style={{ color: '#09090B' }}>
                    AUREV
                  </h1>
                  <p className="text-xs font-medium tracking-wider uppercase mt-0.5" style={{ color: '#A1A1AA' }}>Momentum Communication</p>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold" style={{ color: '#09090B' }}>
                  Where your voice builds its own gravity.
                </h2>
                <p className="text-base leading-relaxed max-w-md" style={{ color: '#71717A' }}>
                  The first platform where communication builds your identity, reputation, and presence in real time.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl transition-all duration-fast group cursor-default"
                  style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.12)' }}
                  >
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-0.5" style={{ color: '#09090B' }}>{feature.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: '#71717A' }}>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Login Form */}
          <div className="animate-scale-in">
            <AuthCard title="Welcome Back" subtitle="Sign in to your AUREV account">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#71717A' }}>
                    Email Address <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 text-base rounded-xl transition-all duration-fast outline-none"
                    style={{
                      background: '#F4F4F5',
                      border: '1px solid rgba(0,0,0,0.08)',
                      color: '#18181B',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; e.target.style.background = '#FFFFFF'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.08)'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F4F4F5'; }}
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#71717A' }}>
                      Password <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="w-full px-4 py-3 pr-12 text-base rounded-xl transition-all duration-fast outline-none"
                        style={{
                          background: '#F4F4F5',
                          border: '1px solid rgba(0,0,0,0.08)',
                          color: '#18181B',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; e.target.style.background = '#FFFFFF'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.08)'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F4F4F5'; }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-sm"
                        style={{ color: '#A1A1AA' }}
                        tabIndex={-1}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Checkbox
                      checked={formData.rememberMe}
                      onChange={(val) => setFormData({ ...formData, rememberMe: val })}
                      label="Remember me"
                    />
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-xs font-medium cursor-pointer transition-colors"
                      style={{ color: '#2563EB' }}
                      onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-fast cursor-pointer active:scale-[0.98]"
                  style={{
                    background: '#2563EB',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
                    opacity: isLoggingIn ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => { if (!isLoggingIn) { e.currentTarget.style.background = '#1D4ED8'; e.currentTarget.style.transform = 'scale(1.01)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {isLoggingIn ? 'Signing in...' : 'Sign In'}
                  {!isLoggingIn && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <div className="text-center pt-6 mt-6" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <p className="text-sm" style={{ color: '#71717A' }}>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => navigate('/signup')}
                    className="font-semibold transition-colors"
                    style={{ color: '#2563EB' }}
                    onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </AuthCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
