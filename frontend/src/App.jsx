import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ErrorBoundary from "./components/organisms/ErrorBoundary";
import Spinner from "./components/atoms/Spinner";
import { WifiOff } from 'lucide-react';
import { Suspense, lazy, useEffect } from "react";

const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AurevRankPage = lazy(() => import("./pages/AurevRankPage"));
const StreamRoomsPage = lazy(() => import("./pages/StreamRoomsPage"));
const ActiveRoomPage = lazy(() => import("./pages/ActiveRoomPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useUIStore } from "./store/useUIStore";
import { useOfflineStore } from "./store/useOfflineStore";
import AppLayout from "./components/layouts/AppLayout";
import CommandPalette from "./components/organisms/CommandPalette";

const useKeyboardShortcuts = (handlers) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (handlers.onCommandPalette) handlers.onCommandPalette();
      }
      if (e.key === 'Escape') {
        if (handlers.onEscape) handlers.onEscape();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};

const OfflineIndicator = () => {
  const { isOnline } = useOfflineStore?.() || { isOnline: true };
  if (isOnline) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] animate-slide-up">
      <div className="flex items-center gap-2.5 px-5 py-3 rounded-ads-lg bg-surface-100 border border-rose/20 shadow-elevation-3">
        <WifiOff className="w-4 h-4 text-rose" />
        <span className="text-sm text-text font-medium">You&apos;re offline</span>
        <span className="text-xs text-text-muted">Messages will send when you reconnect</span>
      </div>
    </div>
  );
};
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { initTheme } = useThemeStore();
  const { toggleCommandPalette, closeCommandPalette } = useUIStore();

  useEffect(() => {
    checkAuth();
    initTheme();
    
    // Initialize offline state listener
    const cleanupOffline = useOfflineStore.getState().init();
    
    return () => {
      cleanupOffline();
    };
  }, [checkAuth, initTheme]);

  useKeyboardShortcuts({
    onCommandPalette: toggleCommandPalette,
    onEscape: closeCommandPalette
  });

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-text-muted text-sm">Loading AUREV...</p>
        </div>
      </div>
    );
  }

  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-64">
      <Spinner size="md" />
    </div>
  );

  const ProtectedRoute = ({ children }) => authUser ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" />;
  const GuestRoute = ({ children }) => authUser ? <Navigate to="/" /> : children;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-surface text-text overflow-x-hidden font-sans relative">
        <CommandPalette />
        <Routes>
          <Route path="/" element={authUser ? <Navigate to="/messages" /> : <Suspense fallback={<LoadingFallback />}><LandingPage /></Suspense>} />
          <Route path="/messages" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/messages/:id" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><SignUpPage /></GuestRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><SettingsPage /></Suspense></ProtectedRoute>} />
          <Route path="/settings/privacy" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><SettingsPage /></Suspense></ProtectedRoute>} />
          <Route path="/settings/notifications" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><SettingsPage /></Suspense></ProtectedRoute>} />
          <Route path="/settings/account" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><SettingsPage /></Suspense></ProtectedRoute>} />
          <Route path="/profile" element={<Navigate to="/me" />} />
          <Route path="/me" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><ProfilePage /></Suspense></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><PublicProfilePage /></Suspense></ProtectedRoute>} />
          <Route path="/aurev-rank" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><AurevRankPage /></Suspense></ProtectedRoute>} />
          <Route path="/rooms" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><StreamRoomsPage /></Suspense></ProtectedRoute>} />
          <Route path="/rooms/:id" element={<ProtectedRoute><Suspense fallback={<LoadingFallback />}><ActiveRoomPage /></Suspense></ProtectedRoute>} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A1F',
              color: '#FAFAFA',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#F5C518', secondary: '#09090B' } },
            error: { iconTheme: { primary: '#F43F5E', secondary: '#09090B' } },
          }}
        />
        <OfflineIndicator />
      </div>
    </ErrorBoundary>
  );
};

export default App;