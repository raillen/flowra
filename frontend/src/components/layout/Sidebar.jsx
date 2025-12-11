import React, { useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useApp } from '../../contexts/AppContext';
import { useChatContext } from '../../contexts/ChatContext';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAccentColor } from '../../contexts/AccentColorContext';
import {
  LayoutDashboard,
  Bell,
  Folder,
  ArrowRightLeft,
  StickyNote,
  Calendar as CalendarIcon,
  MessageSquare,
  FileText,
  Settings,
  X,
  Code2,
  LogOut,
  ChevronRight,
  Plus,
  Sparkles
} from 'lucide-react';

/**
 * Sidebar navigation component
 * Redesigned with modern glassmorphism and gradient accents
 * 
 * @module components/layout/Sidebar
 */
const Sidebar = ({ isOpen, onToggle }) => {
  const { activeModule, navigateTo, activeProjectId, exitProject } = useNavigation();
  const { projects, user } = useApp();
  const { unreadTotal } = useChatContext();
  const { unreadCount: notificationUnreadCount } = useNotificationContext();
  const { logout } = useAuthContext();
  const { accentColor } = useAccentColor();

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const menuGroups = [
    {
      id: 'principal',
      label: 'Principal',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'notifications', label: 'Notificações', icon: Bell, badge: notificationUnreadCount > 0 ? notificationUnreadCount : null },
        { id: 'chat', label: 'Mensagens', icon: MessageSquare, badge: unreadTotal > 0 ? unreadTotal : null },
      ]
    },
    {
      id: 'gestao',
      label: 'Gestão',
      items: [
        { id: 'projects', label: 'Projetos', icon: Folder },
        { id: 'calendar', label: 'Calendário', icon: CalendarIcon },
      ]
    },
    {
      id: 'ferramentas',
      label: 'Ferramentas',
      items: [
        { id: 'notes', label: 'Anotações', icon: StickyNote },
        { id: 'docs', label: 'Documentação', icon: FileText },
        { id: 'briefings', label: 'Briefings', icon: Sparkles },
        { id: 'transfer', label: 'Transferência', icon: ArrowRightLeft },
      ]
    },
    {
      id: 'sistema',
      label: 'Sistema',
      items: [
        { id: 'settings', label: 'Configurações', icon: Settings },
      ]
    }
  ];

  const handleNavigation = (itemId) => {
    navigateTo(itemId);
    if (window.innerWidth < 1024 && onToggle) {
      onToggle();
    }
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }
  };

  const handleExitProject = () => {
    exitProject();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-surface/80 backdrop-blur-xl border-r border-border
        transform transition-all duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-full shadow-xl lg:shadow-none
      `}>

        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Code2 className="text-white" size={20} />
            </div>
            <div>
              <span className="font-bold text-lg text-text-primary tracking-tight">KBSys</span>
              <span className="text-[10px] text-text-secondary block -mt-1">Project Manager</span>
            </div>
          </div>
          <button
            className="lg:hidden p-2 hover:bg-surface-hover rounded-lg text-text-secondary hover:text-text-primary transition-colors"
            onClick={onToggle}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
          {menuGroups.map((group) => (
            <div key={group.id}>
              {group.label && (
                <h3 className="px-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  {group.label}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeModule === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                        ${isActive
                          ? 'text-white shadow-md'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                        }
                      `}
                      style={isActive ? { backgroundColor: accentColor } : {}}
                    >
                      <div className="flex items-center gap-3 relative z-10">
                        <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white/20' : 'bg-surface-hover group-hover:bg-border'}`}>
                          <item.icon
                            size={16}
                            className={isActive ? 'text-white' : 'text-text-secondary group-hover:text-text-primary'}
                          />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>

                      {item.badge ? (
                        <span className={`
                          text-[10px] font-bold px-2 py-0.5 rounded-full relative z-10
                          ${isActive
                            ? 'bg-white/25 text-white'
                            : 'bg-red-100 text-red-600'
                          }
                        `}>
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight
                          size={14}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-white/70' : 'text-text-secondary'}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-border bg-gradient-to-t from-surface-hover to-transparent">

          {/* Active Project Card */}
          {activeProject && (
            <div className="mb-4 p-3 bg-gradient-to-br from-primary-50 to-indigo-50 rounded-xl border border-primary-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Folder size={14} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-primary-600 uppercase tracking-wide">Projeto Ativo</p>
                  <p className="text-sm font-bold text-text-primary truncate">{activeProject.name}</p>
                </div>
              </div>
              <button
                onClick={handleExitProject}
                className="w-full text-xs flex items-center justify-center gap-1.5 py-2 text-slate-500 hover:text-red-600 bg-white/80 hover:bg-white rounded-lg transition-all shadow-sm"
              >
                <ArrowRightLeft size={12} />
                <span>Trocar Projeto</span>
              </button>
            </div>
          )}

          {/* User Profile */}
          <div className="flex items-center gap-3 p-2 hover:bg-surface-hover rounded-xl transition-colors cursor-pointer group">
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-md">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-text-secondary truncate">
                {user?.email}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
