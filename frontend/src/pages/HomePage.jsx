import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore';
import { useFriendStore } from '../store/useFriendStore';
import Sidebar from '../components/organisms/Sidebar';
import { MessageSquare, UserPlus, Shield } from 'lucide-react';
import ChatContainer from '../components/organisms/ChatContainer';
import CallModal from '../components/organisms/CallModal';

const NoChatSelected = () => {
  return (
    <div className="flex-1 flex items-center justify-center relative">
      <div className="text-center space-y-10 max-w-md px-6 relative z-10">
        {/* Animated Minimal Logo */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-surface border border-default flex items-center justify-center shadow-spatial-sm">
              <span className="text-2xl font-semibold text-primary tracking-tight">AU</span>
            </div>
            <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-xl animate-ambient-shift -z-10" />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-3">
          <h1 className="text-2xl font-medium text-text tracking-tight">
            AUREV
          </h1>
          <p className="text-text-muted text-sm max-w-xs mx-auto">
            A spatial communication environment. Select a conversation to begin.
          </p>
        </div>

        {/* Quick Start */}
        <div className="flex flex-col gap-2 max-w-xs mx-auto">
          {[
            { icon: UserPlus, label: 'Search and connect' },
            { icon: MessageSquare, label: 'Encrypted messaging' },
            { icon: Shield, label: 'Friendship-gated access' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-default shadow-inner-light">
              <step.icon className="w-4 h-4 text-text-secondary flex-shrink-0" strokeWidth={2} />
              <span className="text-xs text-text-muted">{step.label}</span>
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
    <div className="h-full w-full overflow-hidden bg-transparent">
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
