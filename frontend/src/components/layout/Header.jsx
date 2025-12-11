import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Search, LogOut, User, Menu } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useApp } from '../../contexts/AppContext';
import { useAuthContext } from '../../contexts/AuthContext';
import NotificationCenter from '../common/NotificationCenter';
import Breadcrumbs from '../common/Breadcrumbs';
import ThemeToggle from '../common/ThemeToggle';

const Header = ({ onMenuClick }) => {
  const { activeModule, activeProjectId, navigateTo } = useNavigation();
  const { projects } = useApp();
  const { user, logout } = useAuthContext();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const userMenuRef = useRef(null);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // ... (menuItems remain)

  // ... (useEffect remains)

  return (
    <header className="h-16 bg-surface/80 backdrop-blur-sm border-b border-border flex items-center px-4 lg:px-6 sticky top-0 z-30 justify-between gap-4 transition-colors duration-300">
      {/* Left section: Menu button + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb moved to Header */}
        <div className="hidden md:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right section: Search + Actions */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Search */}
        <div className={`relative hidden md:block transition-all duration-200 ${searchFocused ? 'w-80' : 'w-64'}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
          <input
            placeholder="Buscar..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`w-full pl-10 pr-12 py-2.5 bg-surface-hover/50 border-2 border-transparent rounded-xl text-sm transition-all outline-none text-text-primary ${searchFocused
              ? 'bg-surface border-primary ring-4 ring-primary/10'
              : 'hover:bg-surface-hover'
              }`}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-secondary bg-background/50 px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Mobile search button */}
        <button className="md:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-colors">
          <Search size={18} />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationCenter />

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-2 px-2 lg:px-3 py-2 text-sm rounded-xl transition-all ${showUserMenu
              ? 'bg-primary/10 text-primary'
              : 'text-text-secondary hover:bg-surface-hover'
              }`}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-600 text-primary-fg flex items-center justify-center text-sm font-bold shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden lg:block font-medium max-w-[100px] truncate">
              {user?.name || 'Usuário'}
            </span>
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-xl border border-border py-2 z-50 animate-fade-in-down">
              <div className="px-4 py-2 border-b border-border">
                <p className="font-medium text-text-primary">{user?.name}</p>
                <p className="text-xs text-text-secondary">{user?.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    navigateTo('profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-hover flex items-center gap-3 transition-colors"
                >
                  <User size={16} className="text-text-secondary" />
                  Meu Perfil
                </button>
              </div>
              <div className="border-t border-border pt-1">
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/10 flex items-center gap-3 transition-colors"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
