import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore';
import { useFriendStore } from '../store/useFriendStore';
import Sidebar from '../components/organisms/Sidebar';
import { UserPlus, Shield, Lock } from 'lucide-react';
import ChatContainer from '../components/organisms/ChatContainer';
import CallModal from '../components/organisms/CallModal';

/* ── AUREV Logo Mark (large, for empty state) ── */
const AurevMarkLarge = () => (
  <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-breathe-glow">
    <path
      d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
      stroke="var(--border-lit)"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M16 6L26 14V22L16 28L6 22V14L16 6Z"
      stroke="var(--accent-subtle)"
      strokeWidth="0.5"
      fill="none"
    />
    <path
      d="M16 8L24 20H8L16 8Z"
      fill="var(--accent-base)"
      opacity="0.85"
    />
    <circle cx="16" cy="17" r="2.5" fill="var(--void)" />
  </svg>
);

const NoChatSelected = () => {
  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      {/* Subtle accent radial gradient at center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(37,99,235,0.03) 0%, transparent 50%)',
        }}
      />

      {/* Noise */}
      <div className="absolute inset-0 charged-noise" />

      <div className="text-center space-y-8 max-w-md px-6 relative z-10">
        {/* Animated Logo Mark */}
        <div className="flex justify-center">
          <div className="relative">
            <AurevMarkLarge />
            {/* Glow behind */}
            <div
              className="absolute inset-0 rounded-full animate-breathe-glow -z-10"
              style={{ background: 'var(--accent-subtle)', filter: 'blur(24px)' }}
            />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            A spatial communication environment
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Select a conversation to begin
          </p>
        </div>

        {/* Feature cards */}
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          {[
            { icon: UserPlus, label: 'Search & Connect', desc: 'Find people in the AUREV network' },
            { icon: Lock, label: 'Encrypted', desc: 'End-to-end secure messaging' },
            { icon: Shield, label: 'Friendship-gated', desc: 'Access requires mutual connection' },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-fast"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-inner-light)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-subtle)' }}
              >
                <feature.icon className="w-4 h-4" style={{ color: 'var(--accent-base)' }} strokeWidth={2} />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{feature.label}</div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{feature.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const { id } = useParams();
  const { selectedUser, setSelectedUser, conversations } = useChatStore();
  const { friends } = useFriendStore();

  useEffect(() => {
    if (id) {
      const conv = conversations.find((c) => c.otherUser?._id === id);
      if (conv) {
        setSelectedUser(conv.otherUser);
      } else {
        const friend = friends.find((f) => f._id === id);
        if (friend) {
          setSelectedUser(friend);
        }
      }
    } else {
      setSelectedUser(null);
    }
  }, [id, conversations, friends, setSelectedUser]);

  return (
    <div className="h-full w-full overflow-hidden" style={{ background: 'var(--base)' }}>
      <CallModal />
      <div className="flex h-full">
        {/* Sidebar — hidden on mobile when chat is selected */}
        <div className={`${selectedUser ? 'hidden lg:flex' : 'flex'} flex-shrink-0 h-full`}>
          <Sidebar />
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col h-full ${selectedUser ? 'flex' : 'hidden lg:flex'}`}>
          {selectedUser ? <ChatContainer /> : <NoChatSelected />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
