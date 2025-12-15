import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useApp } from '../../contexts/AppContext';
import { useChatContext } from '../../contexts/ChatContext';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAccentColor } from '../../contexts/AccentColorContext';
import { useCommandPalette } from '../../contexts/CommandPaletteContext';
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
  ChevronDown,
  Sparkles,
  Archive,
  Command,
  Layout,
  Plus
} from 'lucide-react';

/**
 * Sidebar navigation component
 * Redesigned with modern flat style (BoardSettingsModal look), 280px fixed width
 * 
 * @module components/layout/Sidebar
 */
const Sidebar = ({ isOpen, onToggle }) => {
  const { activeModule, activeProjectId, activeBoardId, navigateTo, goToBoard, exitProject } = useNavigation();
  const { projects, user } = useApp();
  const { unreadTotal } = useChatContext();
  const { unreadCount: notificationUnreadCount } = useNotificationContext();
  const { logout } = useAuthContext();
  const { accentColor } = useAccentColor();
  const { openCommandPalette } = useCommandPalette();

  // State for expanded projects in the tree
  const [expandedProjects, setExpandedProjects] = useState({});
  // State for visibility of the entire projects section
  const [isProjectsSectionExpanded, setIsProjectsSectionExpanded] = useState(true);

  // Toggle project expansion
  const toggleProject = (e, projectId) => {
    e.stopPropagation(); // Prevent navigation when clicking chevron
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Helper to determine if a project is active (or one of its boards is active)
  const isProjectActive = (projectId) => {
    return activeProjectId === projectId;
  };

  const handleNavigation = (itemId) => {
    navigateTo(itemId);
    if (window.innerWidth < 1024 && onToggle) {
      onToggle();
    }
  };

  const handleBoardNavigation = (projectId, boardId) => {
    goToBoard(projectId, boardId);
    if (window.innerWidth < 1024 && onToggle) {
      onToggle();
    }
  };

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
    // Projects Section is handled dynamically
    {
      id: 'gestao',
      label: 'Gestão',
      items: [
        { id: 'briefings', label: 'Briefings', icon: Sparkles },
        { id: 'archive', label: 'Arquivo', icon: Archive },
        { id: 'transfer', label: 'Transferência', icon: ArrowRightLeft },
      ]
    },
    {
      id: 'ferramentas',
      label: 'Ferramentas',
      items: [
        { id: 'calendar', label: 'Calendário', icon: CalendarIcon },
        { id: 'notes', label: 'Anotações', icon: StickyNote },
      ]
    },
    {
      id: 'sistema',
      label: 'Sistema',
      items: [
        { id: 'docs', label: 'Documentação', icon: FileText },
        { id: 'settings', label: 'Configurações', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[280px] bg-gray-50/50 dark:bg-slate-900/95 border-r border-gray-200 dark:border-slate-700
        transform transition-all duration-300 ease-out flex-shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-full shadow-2xl lg:shadow-none
      `}>

        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <img src="/flowra-logo.png" alt="Flowra" className="w-8 h-8 rounded-lg" />
            <div>
              <span className="font-bold text-gray-900 leading-tight">Flowra</span>
            </div>
          </div>
          <button
            className="lg:hidden p-2 hover:bg-gray-200/50 rounded-lg text-gray-500 transition-colors"
            onClick={onToggle}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">

          {/* Principal Group */}
          <div className="space-y-1">
            {menuGroups[0].items.map((item) => (
              <NavItem key={item.id} item={item} activeModule={activeModule} handleNavigation={handleNavigation} accentColor={accentColor} />
            ))}
          </div>

          {/* Projects Tree Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-3 group">
              <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                Projetos
              </span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleNavigation('projects')}
                  className="p-1 hover:bg-gray-200/50 dark:hover:bg-slate-700/50 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 rounded transition-colors"
                  title="Novo Projeto"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => setIsProjectsSectionExpanded(!isProjectsSectionExpanded)}
                  className="p-1 hover:bg-gray-200/50 dark:hover:bg-slate-700/50 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 rounded transition-colors"
                >
                  {isProjectsSectionExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              </div>
            </div>

            {isProjectsSectionExpanded && (
              <div className="space-y-1 animate-slide-down">
                {projects.length === 0 ? (
                  <p className="px-2 text-sm text-gray-400 dark:text-slate-500 italic">Nenhum projeto</p>
                ) : (
                  projects.map((project) => {
                    const isActive = isProjectActive(project.id);
                    const isExpanded = expandedProjects[project.id];
                    const hasBoards = project.boards && project.boards.length > 0;

                    return (
                      <div key={project.id}>
                        {/* Project Item */}
                        <div
                          className={`
                          w-full flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 cursor-pointer group select-none
                          ${isActive && !activeBoardId
                              ? 'bg-white dark:bg-slate-800 shadow-sm ring-1 ring-gray-100 dark:ring-slate-700 text-gray-900 dark:text-white'
                              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white'}
                        `}
                          onClick={() => {
                            if (hasBoards && !isExpanded) {
                              toggleProject({ stopPropagation: () => { } }, project.id);
                            } else {
                              navigateTo('projects');
                            }
                          }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
                            {hasBoards ? (
                              <div
                                onClick={(e) => toggleProject(e, project.id)}
                                className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                              >
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </div>
                            ) : <div className="w-3.5" />}

                            <Folder size={16} className={`shrink-0 ${isActive && !activeBoardId ? 'fill-current' : ''}`} style={isActive && !activeBoardId ? { color: accentColor } : {}} />
                            <span className="text-sm font-medium truncate">
                              {project.name}
                            </span>
                          </div>
                        </div>

                        {/* Boards List (Nested) */}
                        {isExpanded && hasBoards && (
                          <div className="ml-5 pl-3 border-l border-gray-200 dark:border-slate-700 space-y-1 mt-1 mb-2 animate-slide-down">
                            {project.boards.map(board => {
                              const isBoardActive = activeBoardId === board.id;
                              return (
                                <button
                                  key={board.id}
                                  onClick={() => handleBoardNavigation(project.id, board.id)}
                                  className={`
                                  w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all text-left
                                  ${isBoardActive
                                      ? 'bg-white dark:bg-slate-800 shadow-sm ring-1 ring-gray-100 dark:ring-slate-700 text-gray-900 dark:text-white font-medium'
                                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-slate-800/50'
                                    }
                                `}
                                >
                                  {/* <Layout size={14} className={isBoardActive ? 'text-primary-500' : 'opacity-70'} /> */}
                                  <span className={`w-1.5 h-1.5 rounded-full ${isBoardActive ? '' : 'bg-gray-300 dark:bg-slate-600'}`} style={isBoardActive ? { backgroundColor: accentColor } : {}}></span>
                                  <span className="truncate">{board.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Other Tools */}
          {menuGroups.slice(1).map((group) => (
            <div key={group.id} className="space-y-1">
              {group.label && (
                <div className="px-2 mb-2 mt-6">
                  <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    {group.label}
                  </h3>
                </div>
              )}
              {group.items.map((item) => (
                <NavItem key={item.id} item={item} activeModule={activeModule} handleNavigation={handleNavigation} accentColor={accentColor} />
              ))}
            </div>
          ))}

        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:ring-1 hover:ring-gray-200 dark:hover:ring-slate-700 rounded-lg transition-all cursor-pointer group">
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-lg object-cover bg-gray-200 dark:bg-slate-700"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400 flex items-center justify-center text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                {user?.email}
              </p>
            </div>

            <button
              onClick={() => logout && logout()}
              className="text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
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

// Helper component for regular menu items
const NavItem = ({ item, activeModule, handleNavigation, accentColor }) => {
  const isActive = activeModule === item.id;
  const Icon = item.icon;

  return (
    <button
      onClick={() => handleNavigation(item.id)}
      className={`
        w-full flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 group relative
        ${isActive
          ? 'bg-white dark:bg-slate-800 shadow-sm ring-1 ring-gray-100 dark:ring-slate-700 text-gray-900 dark:text-white font-medium'
          : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={`${isActive ? '' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300'}`} style={isActive ? { color: accentColor || '#4F46E5' } : {}} />
        <span className="text-sm">{item.label}</span>
      </div>

      {item.badge ? (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
          {item.badge}
        </span>
      ) : null}
    </button>
  );
};

export default Sidebar;

