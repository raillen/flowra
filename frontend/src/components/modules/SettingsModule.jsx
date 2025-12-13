import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAccentColor } from '../../contexts/AccentColorContext';
import { Info, Palette, Building, Layers, Users, Database, Settings, History } from 'lucide-react';

// Components
import GeneralTab from './settings/tabs/GeneralTab';
import AppearanceTab from './settings/tabs/AppearanceTab';
import CompaniesTab from './settings/tabs/CompaniesTab';
import GroupsTab from './settings/tabs/GroupsTab';
import CollaboratorsTab from './settings/tabs/CollaboratorsTab';
import DatabaseTab from './settings/tabs/DatabaseTab';
import AuditLogsTab from './settings/tabs/AuditLogsTab';

/**
 * Settings module shell
 * Orchestrates the sub-modules for settings
 * 
 * @module components/modules/SettingsModule
 */
const SettingsModule = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { user } = useAuthContext();
  const { accentColor } = useAccentColor();

  const tabs = [
    { id: 'general', label: 'Geral', icon: Info },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'companies', label: 'Empresas', icon: Building },
    { id: 'groups', label: 'Grupos', icon: Layers },
    { id: 'collaborators', label: 'Colaboradores', icon: Users },
  ];

  if (user?.role === 'admin') {
    tabs.push({ id: 'database', label: 'Banco de Dados', icon: Database });
    tabs.push({ id: 'audit', label: 'Auditoria', icon: History });
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return <GeneralTab accentColor={accentColor} />;
      case 'appearance': return <AppearanceTab accentColor={accentColor} />;
      case 'companies': return <CompaniesTab accentColor={accentColor} />;
      case 'groups': return <GroupsTab accentColor={accentColor} />;
      case 'collaborators': return <CollaboratorsTab accentColor={accentColor} />;
      case 'database': return <DatabaseTab accentColor={accentColor} />;
      case 'audit': return <AuditLogsTab accentColor={accentColor} />;
      default: return <GeneralTab accentColor={accentColor} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 rounded-xl overflow-hidden animate-in fade-in">

      {/* Top Header & Navigation */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 pt-8 pb-0 shrink-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-xl">
            <Settings className="text-slate-600 dark:text-slate-300" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Configurações</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie sua conta e preferências do sistema</p>
          </div>
        </div>

        {/* Horizontal Scrollable Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar -mb-px">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-medium transition-all whitespace-nowrap
                  ${isActive
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300'
                  }
                `}
                style={isActive ? { borderColor: accentColor, color: accentColor } : {}}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: `radial-gradient(${accentColor} 1px, transparent 1px)`, backgroundSize: '24px 24px' }}
        />

        <div className="relative z-10 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default SettingsModule;
