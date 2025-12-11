
import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useApp } from '../../contexts/AppContext';
import ProjectDashboard from '../modules/ProjectDashboard';
import ProjectsListView from '../modules/ProjectsListView';
// KanbanHub removed as it was redundant
import SettingsModule from '../modules/SettingsModule';
import NotesModule from '../modules/NotesModule';
import DocumentationView from '../modules/DocumentationView';
import TransferManager from '../modules/TransferManager';
import ProjectCalendar from '../modules/ProjectCalendar';
import ProjectChat from '../modules/ProjectChat';
import ProfilePage from '../../pages/ProfilePage';
import PlaceholderView from '../common/PlaceholderView';
import KanbanBoardView from '../modules/KanbanBoardView';
import NotificationModule from '../modules/NotificationModule';
import GlobalDashboard from '../modules/GlobalDashboard';
import BriefingTemplatesView from '../modules/views/BriefingTemplatesView';
import ArchiveModule from '../modules/ArchiveModule';
import { LayoutDashboard, Bell } from 'lucide-react';
import Breadcrumbs from '../common/Breadcrumbs';

/**
 * Main content area component
 * Renders the appropriate module based on active navigation
 * 
 * @module components/layout/MainContent
 */
const MainContent = () => {
  const { activeModule, activeProjectId, activeBoardId } = useNavigation();
  const { projects } = useApp();

  /**
   * Renders the appropriate content based on active module
   */
  const renderContent = () => {
    if (activeModule === 'profile') return <ProfilePage />;

    // If there's an activeBoardId, always render KanbanBoardView
    // The component will fetch the board data itself
    if (activeBoardId && activeProjectId) {
      return <KanbanBoardView />;
    }

    switch (activeModule) {
      case 'dashboard':
        return <GlobalDashboard />;
      case 'notifications':
        return <NotificationModule />;
      case 'projects':
        return activeProjectId ? <ProjectDashboard /> : <ProjectsListView />;
      // 'kanban' module is now handled within projects or via direct board navigation (which sets activeBoardId)
      // but the main 'kanban' menu item is gone. If code navigates to 'kanban', it usually means a board is active.
      case 'kanban':
        // If we are here, it likely means activeBoardId is set, which is handled by the early return in MainContent.
        // If activeBoardId is NOT set but module is kanban, we should probably fallback to projects or empty.
        return <ProjectsListView />;
      case 'transfer':
        return <TransferManager />;
      case 'notes':
        return <NotesModule />;
      case 'calendar':
        return <ProjectCalendar />;
      case 'chat':
        return <ProjectChat />;
      case 'docs':
        return <DocumentationView />;
      case 'briefings':
        return <BriefingTemplatesView />;
      case 'archive':
        return <ArchiveModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <ProjectsListView />;
    }
  };

  return (
    <div className="flex-1 overflow-hidden relative flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {renderContent()}
      </div>
    </div>
  );
};

export default MainContent;
