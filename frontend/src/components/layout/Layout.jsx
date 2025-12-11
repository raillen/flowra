import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';

import BubbleChat from '../modules/chat/BubbleChat';

/**
 * Main layout component
 * Provides the overall structure of the application with responsive sidebar
 * 
 * @module components/layout/Layout
 */
const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-background font-sans text-text-primary overflow-hidden transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <main className="flex-1 flex flex-col min-w-0 bg-background/50 relative">
        <Header onMenuClick={toggleSidebar} />
        <MainContent />
        <BubbleChat />
      </main>
    </div>
  );
};

export default Layout;
