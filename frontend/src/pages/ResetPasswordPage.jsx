import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import AuthCard from '../components/organisms/AuthCard';
import Input from '../components/atoms/Input';
import Button from '../components/atoms/Button';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { resetPassword, isResetPasswordLoading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isResetPasswordLoading) return;
    
    if (password !== confirmPassword) {
      // Use standard alert/toast approach for mismatch
      // In a real app we'd use toast from react-hot-toast, assuming it's available via store or we can just import it
      // Actually useAuthStore uses toast.error which we can rely on if we want, or just import toast
      import('react-hot-toast').then(({ default: toast }) => {
        toast.error('Passwords do not match');
      });
      return;
    }

    const success = await resetPassword(token, password);
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 ads-ambient">
      <div className="relative w-full max-w-md mx-auto z-10 animate-scale-in">
        <AuthCard 
          title="Establish New Keys" 
          subtitle="Cryptographically secure your node"
        >
          <div className="flex justify-center mb-6">
             <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 shadow-glow-accent">
                <Lock className="w-8 h-8 text-accent" />
              </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="password"
              label="New Password"
              placeholder="Enter new password (min. 6 chars)"
              icon="password"
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            <Input
              type="password"
              label="Confirm New Password"
              placeholder="Re-enter new password"
              icon="password"
              showPasswordToggle
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />

            <div className="pt-4">
              <Button
                type="submit"
                variant="accent"
                size="lg"
                loading={isResetPasswordLoading}
                fullWidth
                iconRight={<ArrowRight className="w-4 h-4" />}
              >
                {isResetPasswordLoading ? 'Securing...' : 'Set Password & Login'}
              </Button>
            </div>
          </form>
        </AuthCard>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
