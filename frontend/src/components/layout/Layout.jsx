import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';
import { useNavigation } from '../../contexts/NavigationContext';
import { useApp } from '../../contexts/AppContext';
import { useAccentColor } from '../../contexts/AccentColorContext';

import BubbleChat from '../modules/chat/BubbleChat';

/**
 * Main layout component
 * Provides the overall structure of the application with responsive sidebar
 * 
 * @module components/layout/Layout
 */
const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { activeProjectId } = useNavigation();
  const { projects, companies } = useApp();
  const { setAccentColor } = useAccentColor();

  // Sync accent color when active project changes
  useEffect(() => {
    if (activeProjectId) {
      const project = projects.find(p => p.id === activeProjectId);
      if (project?.companyId) {
        const company = companies.find(c => c.id === project.companyId);
        if (company?.accentColor) {
          setAccentColor(company.accentColor);
        }
      }
    }
  }, [activeProjectId, projects, companies, setAccentColor]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        <Header onMenuClick={toggleSidebar} />
        <MainContent />
        <BubbleChat />
      </main>
    </div>
  );
};

export default Layout;
