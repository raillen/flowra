import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Search, LogOut, User, Menu } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useApp } from '../../contexts/AppContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCommandPalette } from '../../contexts/CommandPaletteContext';
import NotificationCenter from '../common/NotificationCenter';
import Breadcrumbs from '../common/Breadcrumbs';

const Header = ({ onMenuClick }) => {
  const { activeModule, activeProjectId, navigateTo } = useNavigation();
  const { projects } = useApp();
  const { user, logout } = useAuthContext();
  const { openCommandPalette } = useCommandPalette();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 sticky top-0 z-30 justify-between gap-4">
      {/* Left section: Menu button + Breadcrumb */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb moved to Header */}
        <div className="hidden md:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right section: Search + Actions */}
      <div className="flex items-center gap-3">
        {/* Search Button - triggers command palette */}
        <button
          onClick={openCommandPalette}
          className="hidden md:flex items-center gap-3 w-64 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm transition-all text-gray-500 hover:text-gray-900 group"
        >
          <Search size={15} className="text-gray-400 group-hover:text-gray-600" />
          <span className="flex-1 text-left">Buscar...</span>
          <div className="flex items-center gap-1">
            <kbd className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded font-mono text-gray-400">⌘K</kbd>
          </div>
        </button>

        {/* Mobile search button */}
        <button
          onClick={openCommandPalette}
          className="md:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Search size={18} />
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* Notifications */}
        <NotificationCenter />

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-lg transition-all ${showUserMenu
              ? 'bg-gray-100'
              : 'hover:bg-gray-50'
              }`}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-medium shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl ring-1 ring-black/5 py-1 z-50 animate-fade-in-down">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    navigateTo('profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <User size={16} className="text-gray-400" />
                  Meu Perfil
                </button>
              </div>
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
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
