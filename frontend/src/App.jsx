
import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { ChatProvider } from './contexts/ChatContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ToastProvider } from './contexts/ToastContext';
import { CommandPaletteProvider, useCommandPalette } from './contexts/CommandPaletteContext';
import { useAuthContext } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import CommandPalette from './components/common/CommandPalette';

import PublicBriefingView from './components/modules/views/PublicBriefingView';

/**
 * Protected App component
 * Shows login/register if not authenticated, otherwise shows main app
 */
const ProtectedApp = () => {
  const { isAuthenticated, loading, setUser, setToken } = useAuthContext();
  const [showRegister, setShowRegister] = useState(false);
  const { isOpen: isCommandPaletteOpen, toggleCommandPalette, closeCommandPalette } = useCommandPalette();

  // Global keyboard shortcut for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Public Routes Check
  if (window.location.pathname.startsWith('/public/briefing/')) {
    return <PublicBriefingView />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-700 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/90 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register
          onBackToLogin={() => setShowRegister(false)}
          onRegisterSuccess={(result) => {
            if (result && result.user && result.token) {
              localStorage.setItem('authToken', result.token);
              localStorage.setItem('user', JSON.stringify(result.user));
              setToken(result.token);
              setUser(result.user);
            }
          }}
        />
      );
    }
    return <Login onCreateAccount={() => setShowRegister(true)} />;
  }

  return (
    <ToastProvider>
      <AppProvider>
        <NavigationProvider>
          <ChatProvider>
            <NotificationProvider>
              <Layout />
              <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={closeCommandPalette}
              />
            </NotificationProvider>
          </ChatProvider>
        </NavigationProvider>
      </AppProvider>
    </ToastProvider>
  );
};

/**
 * Main App component
 * Wraps the application with providers
 * 
 * @module App
 */
import { ThemeProvider } from './contexts/ThemeContext';
import { AccentColorProvider } from './contexts/AccentColorContext';

function App() {
  return (
    <AccentColorProvider>
      <ThemeProvider>
        <AuthProvider>
          <CommandPaletteProvider>
            <ProtectedApp />
          </CommandPaletteProvider>
        </AuthProvider>
      </ThemeProvider>
    </AccentColorProvider>
  );
}

export default App;
