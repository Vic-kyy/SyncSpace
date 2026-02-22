import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAuthStore } from './store/useAuthStore';

function ProtectedLayout() {
  const { user } = useAuthStore();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ss-bg)' }}>
      <div style={{ height: 3, background: 'var(--ss-gradient-accent)', flexShrink: 0 }} />
      <div style={{
        display: 'flex', flex: 1,
        maxWidth: 1600, width: '100%', margin: '0 auto', overflow: 'hidden',
      }}>
        <div style={{
          width: '30%', minWidth: 340, maxWidth: 440,
          display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--ss-border)',
          background: 'var(--ss-sidebar)', backdropFilter: 'blur(12px)',
        }}>
          <Sidebar user={user} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--ss-chat-bg)' }}>
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, checkAuth, loading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  // While checking auth, show nothing
  if (loading) return null;

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // If authenticated and on auth page, redirect to home
  if (isAuthenticated && isAuthPage) {
    return <Navigate to="/" replace />;
  }

  // If not authenticated and not on auth page, redirect to login
  if (!isAuthenticated && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;
