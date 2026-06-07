import { useChatStore } from '../../store/useChatStore';

const CallModal = () => {
  const { incomingCall, acceptCall, rejectCall } = useChatStore();

  if (!incomingCall) return null;

  return (
    <div className="ads-overlay flex items-center justify-center">
      <div className="ads-surface-elevated p-8 max-w-sm w-full mx-4 ads-modal text-center">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 animate-pulse-gold">
          <span className="text-3xl">📞</span>
        </div>
        <h3 className="text-lg font-semibold text-text mb-2">Incoming Call</h3>
        <p className="text-text-muted text-sm mb-6">Someone is calling you...</p>
        <div className="flex gap-3">
          <button
            onClick={rejectCall}
            className="flex-1 py-3 rounded-ads-md text-sm font-medium bg-rose/10 hover:bg-rose/20 text-rose transition-colors"
          >
            Decline
          </button>
          <button
            onClick={acceptCall}
            className="flex-1 py-3 rounded-ads-md text-sm font-medium ads-btn-gold"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
