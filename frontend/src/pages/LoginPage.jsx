import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Radio, Crown, Key } from 'lucide-react';
import AuthCard from '../components/organisms/AuthCard';
import Input from '../components/atoms/Input';
import Button from '../components/atoms/Button';
import Checkbox from '../components/atoms/Checkbox';
import toast from 'react-hot-toast';

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
    { icon: <Crown className="w-5 h-5 text-accent" />, title: 'Aurev Rank', description: 'Your live reputation — built by every message, reaction, and contribution' },
    { icon: <Radio className="w-5 h-5 text-cyan" />, title: 'Stream Rooms', description: 'Living communities with a pulse — not dead group chats' },
    { icon: <Key className="w-5 h-5 text-emerald" />, title: 'Sovereign Identity', description: 'Cryptographic identity — you own your account, forever' },
  ];

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 ads-ambient">
      <div className="relative w-full max-w-6xl mx-auto z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Brand Showcase */}
          <div className="hidden lg:block text-left space-y-10 animate-fade-in-up">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-ads-xl bg-gradient-to-br from-accent to-accent flex items-center justify-center shadow-glow-accent-lg">
                  <span className="text-lg font-black text-surface tracking-tight">AU</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-text tracking-tight">
                    AUR<span className="text-accent">EV</span>
                  </h1>
                  <p className="text-xs text-text-muted font-medium tracking-wider uppercase mt-0.5">Momentum Communication</p>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold ads-text-gradient">
                  Where your voice builds its own gravity.
                </h2>
                <p className="text-text-secondary text-md leading-relaxed max-w-md">
                  The first platform where communication builds your identity, reputation, and presence in real time.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-ads-lg bg-surface-50/50 border border-default hover:border-border-hover hover:bg-surface-100 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-ads-md bg-surface-100 border border-default flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text text-sm mb-0.5">{feature.title}</h3>
                    <p className="text-text-muted text-xs leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Login Form */}
          <div className="animate-scale-in">
            <AuthCard title="Welcome Back" subtitle="Sign in to your AUREV account">
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="you@example.com"
                  icon="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <div className="space-y-3">
                  <Input
                    type="password"
                    label="Password"
                    placeholder="Enter your password"
                    icon="password"
                    showPasswordToggle
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />

                  <div className="flex items-center justify-between">
                    <Checkbox
                      checked={formData.rememberMe}
                      onChange={(val) => setFormData({ ...formData, rememberMe: val })}
                      label="Remember me"
                    />
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-xs text-accent hover:text-accent transition-colors font-medium cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  loading={isLoggingIn}
                  fullWidth
                  iconRight={<ArrowRight className="w-4 h-4" />}
                >
                  {isLoggingIn ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="text-center pt-6 border-t border-default mt-6">
                <p className="text-text-secondary text-sm">
                  Don&apos;t have an account?{' '}
                  <button onClick={() => navigate('/signup')} className="text-accent hover:text-accent font-semibold transition-colors">
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
