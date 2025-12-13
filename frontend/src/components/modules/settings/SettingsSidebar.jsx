import React from 'react';
import { Settings, Info, Palette, Building, Layers, Users, Database } from 'lucide-react';

const SettingsSidebar = ({ activeTab, setActiveTab, accentColor, user }) => {

    const menuItems = [
        { id: 'general', label: 'Geral', icon: Info, group: 'Configurações' },
        { id: 'appearance', label: 'Aparência', icon: Palette, group: 'Configurações' },
        { id: 'companies', label: 'Empresas', icon: Building, group: 'Cadastros' },
        { id: 'groups', label: 'Grupos', icon: Layers, group: 'Cadastros' },
        { id: 'collaborators', label: 'Colaboradores', icon: Users, group: 'Cadastros' },
    ];

    if (user?.role === 'admin') {
        menuItems.push({ id: 'database', label: 'Banco de Dados', icon: Database, group: 'Administração' });
    }

    // Groupping
    const groupedMenu = menuItems.reduce((acc, item) => {
        if (!acc[item.group]) acc[item.group] = [];
        acc[item.group].push(item);
        return acc;
    }, {});

    return (
        <aside className="w-64 bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-700 flex flex-col p-4 overflow-y-auto backdrop-blur-sm">

            <div className="flex items-center gap-2 px-2 py-4 mb-2">
                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                    <Settings size={20} style={{ color: accentColor }} />
                </div>
                <h1 className="font-bold text-lg text-slate-800 dark:text-white">Ajustes</h1>
            </div>

            <div className="space-y-6">
                {Object.entries(groupedMenu).map(([group, items]) => (
                    <div key={group}>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                            {group}
                        </h3>
                        <div className="space-y-1">
                            {items.map((item) => {
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive
                                                ? 'text-white shadow-md transform scale-[1.02]'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                            }
                    `}
                                        style={isActive ? { backgroundColor: accentColor } : {}}
                                    >
                                        <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-auto px-4 py-4 text-center">
                <p className="text-xs text-slate-400">KBSys v1.0.0</p>
            </div>

        </aside>
    );
};

export default SettingsSidebar;
