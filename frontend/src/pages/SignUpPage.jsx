import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Shield, Users, Sparkles,
  Camera, Check, X, Code, Gamepad2, Music, Palette,
  Coins, Atom, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import AuthCard from '../components/organisms/AuthCard';
import Input from '../components/atoms/Input';
import Button from '../components/atoms/Button';
import Checkbox from '../components/atoms/Checkbox';
import PasswordStrength from '../components/molecules/PasswordStrength';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup, uploadProfilePicture, isSigningUp } = useAuthStore();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    agreeToTerms: false,
  });

  // Step 2 state: Identity
  const [username, setUsername] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileInputRef = useRef(null);

  // Step 3 state: Interests
  const [selectedInterests, setSelectedInterests] = useState([]);

  // Check username availability simulation
  useEffect(() => {
    if (username.trim().length < 3) {
      setIsUsernameAvailable(null);
      return;
    }
    setIsCheckingUsername(true);
    const timeout = setTimeout(() => {
      setIsCheckingUsername(false);
      // Simulating availability
      setIsUsernameAvailable(username.toLowerCase() !== 'admin' && username.toLowerCase() !== 'aurev');
    }, 500);

    return () => clearTimeout(timeout);
  }, [username]);

  // Interest categories config
  const interestsList = [
    { id: 'tech', label: 'Technology', icon: Code, color: 'text-accent bg-accent-subtle border-accent/20' },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2, color: 'text-accent bg-accent/10 border-accent/20' },
    { id: 'music', label: 'Music', icon: Music, color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
    { id: 'art', label: 'Art & Design', icon: Palette, color: 'text-rose bg-rose/10 border-rose/20' },
    { id: 'crypto', label: 'Web3 & EVM', icon: Coins, color: 'text-emerald bg-emerald/10 border-emerald/20' },
    { id: 'science', label: 'Science & Cosmos', icon: Atom, color: 'text-amber bg-amber/10 border-amber/20' },
  ];

  const handleInterestToggle = (id) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // File picker handler
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Avatar size must be less than 2MB');
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Step transitions
  const goToStep2 = () => {
    if (!formData.fullName.trim()) return toast.error('Full name is required');
    if (!formData.email.trim()) return toast.error('Email is required');
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error('Invalid email format');
    if (!formData.password) return toast.error('Password is required');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (!formData.agreeToTerms) return toast.error('Please agree to the terms');
    setStep(2);
  };

  const goToStep3 = () => {
    if (username.trim().length < 3) return toast.error('Username must be at least 3 characters');
    if (isUsernameAvailable === false) return toast.error('Username is already taken');
    setStep(3);
  };

  // Final onboarding trigger
  const handleFinalSignup = async (e) => {
    e.preventDefault();
    if (selectedInterests.length < 3) {
      return toast.error('Please select at least 3 interest categories');
    }

    const signupPayload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password
    };

    const user = await signup(signupPayload);

    if (user) {
      if (avatarFile) {
        try {
          await uploadProfilePicture(avatarFile);
        } catch (err) {
          console.error("Failed to upload avatar, continuing...", err);
        }
      }
      toast.success("Welcome to AUREV! Your gravity field is active.");
      navigate('/');
    }
  };

  const benefits = [
    { icon: <Sparkles className="w-5 h-5 text-accent" />, title: 'Free Forever', description: 'No credit card required. Start building momentum instantly.' },
    { icon: <Users className="w-5 h-5 text-accent" />, title: 'Stream Rooms', description: 'Create living communities with activity heatmaps and trending topics.' },
    { icon: <Shield className="w-5 h-5 text-emerald" />, title: 'E2E Encryption', description: 'Bank-level encryption on every message, room, and file by default.' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#FAFAFA' }}>
      <div className="relative w-full max-w-6xl mx-auto z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Panel — Brand Benefits */}
          <div className="hidden lg:block text-left space-y-10 animate-fade-in-up">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
                  <span className="text-lg font-black tracking-tight text-white">AU</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight" style={{ color: '#09090B' }}>
                    AUREV
                  </h1>
                  <p className="text-xs font-medium tracking-wider uppercase mt-0.5" style={{ color: '#A1A1AA' }}>Join the Momentum</p>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold" style={{ color: '#09090B' }}>
                  Communication that builds you.
                </h2>
                <p className="text-base leading-relaxed max-w-md" style={{ color: '#71717A' }}>
                  Every message you send, every reaction you give, every community you build — it all becomes part of your Aurev.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl transition-all duration-300 group" style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.12)' }}>
                    {benefit.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-0.5" style={{ color: '#09090B' }}>{benefit.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: '#71717A' }}>{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel — Signup Form */}
          <div className="animate-scale-in">
            <AuthCard
              title="Create Account"
              subtitle={
                <div className="flex items-center gap-1.5 mt-1 select-none">
                  <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-accent shadow-glow-accent/20' : 'bg-surface-300'}`} />
                  <div className="w-6 h-[1.5px] bg-border" />
                  <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-accent shadow-glow-accent/20' : 'bg-surface-300'}`} />
                  <div className="w-6 h-[1.5px] bg-border" />
                  <div className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-accent shadow-glow-accent/20' : 'bg-surface-300'}`} />
                </div>
              }
            >
              {/* STEP 1: Credentials */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      type="text" label="Full Name" placeholder="John Doe" icon="user"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                    <Input
                      type="email" label="Email Address" placeholder="you@example.com" icon="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="password" label="Password" placeholder="Create a strong password" icon="password"
                      showPasswordToggle showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <PasswordStrength password={formData.password} />
                  </div>

                  <Checkbox
                    checked={formData.agreeToTerms}
                    onChange={(val) => setFormData({ ...formData, agreeToTerms: val })}
                    label={
                      <span className="text-text-secondary text-sm">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => toast.success('Terms of Service: Decentralized reputation protocols fully engaged.', { icon: '📄' })}
                          className="text-accent hover:text-accent transition-colors cursor-pointer"
                        >
                          Terms of Service
                        </button>
                        {' '}and{' '}
                        <button
                          type="button"
                          onClick={() => toast.success('Privacy Policy: All communications are end-to-end socket signed.', { icon: '🔒' })}
                          className="text-accent hover:text-accent transition-colors cursor-pointer"
                        >
                          Privacy Policy
                        </button>
                      </span>
                    }
                  />

                  <Button
                    type="button"
                    variant="accent"
                    size="lg"
                    fullWidth
                    onClick={goToStep2}
                    iconRight={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* STEP 2: Identity Setup */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="flex flex-col items-center py-2 space-y-3">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-20 h-20 rounded-full border border-default bg-surface flex items-center justify-center overflow-hidden ring-4 ring-accent/10 hover:ring-accent/20 group-hover:border-accent transition-all duration-300">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-6 h-6 text-text-muted group-hover:text-text-secondary transition-colors" />
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-accent text-surface border-2 border-surface shadow-elevation-1">
                        <Plus size={10} className="stroke-[3]" />
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <span className="text-[10px] text-text-muted">Drag or click to upload avatar photo</span>
                  </div>

                  <div className="space-y-1.5">
                    <Input
                      type="text"
                      label="Choose Username"
                      placeholder="e.g. gautam"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                      required
                      maxLength={15}
                    />

                    {/* Real-time indicator */}
                    {username.trim().length >= 3 && (
                      <div className="flex items-center gap-1.5 px-1">
                        {isCheckingUsername ? (
                          <div className="w-3 h-3 border border-accent/20 border-t-accent rounded-full animate-spin" />
                        ) : isUsernameAvailable ? (
                          <span className="text-[10px] text-emerald font-semibold flex items-center gap-1">
                            <Check size={11} /> @{username.toLowerCase()} is available
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose font-semibold flex items-center gap-1">
                            <X size={11} /> @{username.toLowerCase()} is unavailable
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="lg"
                      className="flex-1"
                      onClick={() => setStep(1)}
                      icon={<ArrowLeft className="w-4 h-4" />}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="accent"
                      size="lg"
                      className="flex-1"
                      onClick={goToStep3}
                      iconRight={<ArrowRight className="w-4 h-4" />}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Interest Grid & Recommended Rooms */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      What moves you? (Select 3+)
                    </label>
                    <p className="text-[10px] text-text-muted leading-tight">Pick the frequencies that trigger your gravity orbit</p>

                    {/* Interest grid */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      {interestsList.map((interest) => {
                        const Icon = interest.icon;
                        const isSelected = selectedInterests.includes(interest.id);
                        return (
                          <button
                            key={interest.id}
                            type="button"
                            onClick={() => handleInterestToggle(interest.id)}
                            className={`flex items-center gap-2.5 p-3 rounded-ads-md border text-xs font-semibold select-none text-left transition-all duration-200 ${isSelected
                              ? 'bg-accent/10 border-accent/30 text-accent shadow-glow-accent/5 scale-[1.02]'
                              : 'bg-surface border-default text-text-secondary hover:text-text hover:border-border-hover'
                              }`}
                          >
                            <Icon size={14} className={isSelected ? 'text-accent' : 'text-text-muted'} />
                            <span>{interest.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="lg"
                      className="flex-1"
                      onClick={() => setStep(2)}
                      icon={<ArrowLeft className="w-4 h-4" />}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="accent"
                      size="lg"
                      className="flex-1"
                      loading={isSigningUp}
                      disabled={selectedInterests.length < 3}
                      onClick={handleFinalSignup}
                      iconRight={<ArrowRight className="w-4 h-4" />}
                    >
                      {isSigningUp ? 'Entering AUREV...' : 'Enter AUREV'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Login option footer */}
              {step === 1 && (
                <div className="text-center pt-6 border-t border-default mt-6">
                  <p className="text-text-secondary text-sm">
                    Already have an account?{' '}
                    <button onClick={() => navigate('/login')} className="text-accent hover:text-accent font-semibold transition-colors">
                      Sign In
                    </button>
                  </p>
                </div>
              )}
            </AuthCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
