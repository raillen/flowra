import React, { useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useApp } from '../../contexts/AppContext';
import { useChatContext } from '../../contexts/ChatContext';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useAuthContext } from '../../contexts/AuthContext';
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
} from 'lucide-react';

/**
 * Sidebar navigation component
 * Responsive with collapsible mode and mobile drawer
 * 
 * @module components/layout/Sidebar
 */
const Sidebar = ({ isOpen, onToggle }) => {
  const { activeModule, navigateTo, activeProjectId, exitProject } = useNavigation();
  const { projects, user } = useApp();
  const { unreadTotal } = useChatContext();
  const { unreadCount: notificationUnreadCount } = useNotificationContext();
  const { logout } = useAuthContext();

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const menuGroups = [
    {
      id: 'principal',
      label: 'Principal',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'notifications', label: 'Notificações', icon: Bell, badge: notificationUnreadCount > 0 ? notificationUnreadCount : null },
        { id: 'chat', label: 'Chat', icon: MessageSquare, badge: unreadTotal > 0 ? unreadTotal : null },
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
        { id: 'briefings', label: 'Briefings', icon: LayoutDashboard }, // Using LayoutDashboard temporarily or maybe FileText? Briefing is like a form.
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Checkbox for mobile interactions (optional/legacy) */}
      <input type="checkbox" id="nav-toggle" className="hidden" checked={isOpen} readOnly />

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-surface border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-full shadow-lg
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-border bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <Code2 className="text-primary-fg" size={20} />
            </div>
            <span className="font-bold text-lg text-text-primary tracking-tight">KBSYS</span>
          </div>
          <button
            className="ml-auto lg:hidden text-text-secondary hover:text-text-primary transition-colors"
            onClick={onToggle}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          {menuGroups.map((group) => (
            <div key={group.id}>
              {group.label && (
                <h3 className="px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
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
                        w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group
                        ${isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          size={18}
                          className={`
                            transition-colors duration-200
                            ${isActive ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'}
                          `}
                        />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`
                          text-[10px] font-bold px-2 py-0.5 rounded-full
                          ${isActive
                            ? 'bg-primary/20 text-primary'
                            : 'bg-background text-text-secondary'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Contextual Project Navigation removed on user request (redundant) */}
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-border bg-surface/50">
          {/* Active Project Card */}
          {activeProject && (
            <div className="mb-4 p-3 bg-surface rounded-lg border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                  <Folder size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Projeto Ativo</p>
                  <p className="text-sm font-semibold text-text-primary truncate">{activeProject.name}</p>
                </div>
              </div>
              <button
                onClick={handleExitProject}
                className="w-full text-xs flex items-center justify-center gap-1.5 py-1.5 text-text-secondary hover:text-red-600 hover:bg-red-50/10 rounded transition-colors"
                title="Sair do projeto e voltar à lista"
              >
                <LogOut size={12} />
                <span>Trocar Projeto</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 px-2">
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {user?.name || 'Usuário'}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-text-secondary truncate max-w-[80px]">
                  {user?.email}
                </p>
                <button
                  onClick={handleLogout}
                  className="text-text-secondary hover:text-red-500 transition-colors"
                  title="Sair"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
