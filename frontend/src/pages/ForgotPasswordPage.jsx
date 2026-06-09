import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import AuthCard from '../components/organisms/AuthCard';
import Input from '../components/atoms/Input';
import Button from '../components/atoms/Button';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, isForgotPasswordLoading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isForgotPasswordLoading) return;
    const success = await forgotPassword(email);
    if (success) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 ads-ambient">
      <div className="relative w-full max-w-md mx-auto z-10 animate-scale-in">
        <AuthCard 
          title="Reset Protocol" 
          subtitle={isSubmitted ? "Transmission Sent" : "Initiate password reset protocol"}
        >
          {isSubmitted ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center mx-auto border border-emerald/20 shadow-glow-emerald">
                <ShieldCheck className="w-8 h-8 text-emerald" />
              </div>
              <div className="space-y-2">
                <p className="text-text text-sm leading-relaxed">
                  If <span className="font-mono text-accent">{email}</span> exists in our secure registry, a reset link has been dispatched to it.
                </p>
                <p className="text-text-muted text-xs">
                  The frequency will decay in exactly 60 minutes.
                </p>
              </div>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => navigate('/login')}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Return to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                Enter the email address associated with your sovereign node. We will transmit a secure reset link to verify your identity.
              </p>
              
              <Input
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                icon="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="space-y-4 pt-2">
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  loading={isForgotPasswordLoading}
                  fullWidth
                  iconRight={<ArrowRight className="w-4 h-4" />}
                >
                  {isForgotPasswordLoading ? 'Transmitting...' : 'Send Reset Link'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={() => navigate('/login')}
                  icon={<ArrowLeft className="w-4 h-4" />}
                  className="text-text-muted hover:text-text"
                >
                  Back to Login
                </Button>
              </div>
            </form>
          )}
        </AuthCard>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
