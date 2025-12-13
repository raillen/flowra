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
 * Redesigned with modern glassmorphism, gradient accents, and Collapsible Project Tree
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

          {/* Principal Group */}
          {menuGroups[0].items.map((item) => (
            <NavItem key={item.id} item={item} activeModule={activeModule} handleNavigation={handleNavigation} accentColor={accentColor} />
          ))}

          {/* Projects Tree Section */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2 group">
              <button
                onClick={() => handleNavigation('projects')}
                className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider hover:text-primary-600 transition-colors flex-1 text-left"
              >
                Projetos
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleNavigation('projects')}
                  className="p-1 hover:bg-primary-50 text-text-secondary hover:text-primary-600 rounded-md transition-colors"
                  title="Ver Todos / Novo Projeto"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => setIsProjectsSectionExpanded(!isProjectsSectionExpanded)}
                  className="p-1 hover:bg-surface-hover text-text-secondary hover:text-text-primary rounded-md transition-colors"
                  title={isProjectsSectionExpanded ? "Recolher" : "Expandir"}
                >
                  {isProjectsSectionExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              </div>
            </div>

            {isProjectsSectionExpanded && (
              <div className="space-y-0.5 animate-slide-down">
                {projects.length === 0 ? (
                  <p className="px-3 text-sm text-text-secondary italic">Nenhum projeto</p>
                ) : (
                  projects.map((project) => {
                    const isActive = isProjectActive(project.id);
                    const isExpanded = expandedProjects[project.id];
                    const hasBoards = project.boards && project.boards.length > 0;

                    return (
                      <div key={project.id} className="mb-0.5">
                        {/* Project Item */}
                        <div
                          className={`
                          w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer group select-none
                          ${isActive && !activeBoardId ? 'bg-surface-hover' : 'hover:bg-surface-hover'}
                        `}
                          onClick={() => {
                            if (hasBoards && !isExpanded) {
                              toggleProject({ stopPropagation: () => { } }, project.id);
                            } else {
                              // Just navigate to project
                              navigateTo('projects');
                              // Actually, we might want to set active project context?
                              // Since we don't have a specific "Project View" other than the list,
                              // we just toggle unless user wants to go to board.
                            }
                          }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
                            {hasBoards ? (
                              <div
                                onClick={(e) => toggleProject(e, project.id)}
                                className="p-0.5 rounded-md hover:bg-black/5 text-text-secondary transition-colors"
                              >
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </div>
                            ) : (
                              <div className="w-4.5" /> /* Spacer */
                            )}
                            <Folder size={15} className={`${isActive ? 'text-primary-600' : 'text-text-secondary'} shrink-0`} />
                            <span className={`text-sm font-medium truncate ${isActive ? 'text-primary-700' : 'text-text-secondary'}`}>
                              {project.name}
                            </span>
                          </div>
                        </div>

                        {/* Boards List (Nested) */}
                        {isExpanded && hasBoards && (
                          <div className="ml-4 pl-3 border-l-2 border-border/50 space-y-0.5 mt-0.5 mb-1.5 animate-slide-down">
                            {project.boards.map(board => {
                              const isBoardActive = activeBoardId === board.id;
                              return (
                                <button
                                  key={board.id}
                                  onClick={() => handleBoardNavigation(project.id, board.id)}
                                  className={`
                                  w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors text-left
                                  ${isBoardActive
                                      ? 'bg-primary-50 text-primary-700 font-medium'
                                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                                    }
                                `}
                                >
                                  <Layout size={13} className={isBoardActive ? 'text-primary-500' : 'opacity-70'} />
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
            <div key={group.id}>
              {group.label && (
                <h3 className="px-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  {group.label}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavItem key={item.id} item={item} activeModule={activeModule} handleNavigation={handleNavigation} accentColor={accentColor} />
                ))}
              </div>
            </div>
          ))}

        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-border bg-gradient-to-t from-surface-hover to-transparent">
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
              onClick={() => logout && logout()}
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

// Helper component for regular menu items
const NavItem = ({ item, activeModule, handleNavigation, accentColor }) => {
  const isActive = activeModule === item.id;
  const Icon = item.icon;

  return (
    <button
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
          <Icon size={16} className={isActive ? 'text-white' : 'text-text-secondary group-hover:text-text-primary'} />
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
};

export default Sidebar;
