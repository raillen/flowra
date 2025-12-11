import React from 'react';
import { ChevronRight, Home, Folder, Layout } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useApp } from '../../contexts/AppContext';

const Breadcrumbs = () => {
    const { activeModule, activeProjectId, activeBoardId, navigateTo, selectProject, setActiveBoardId } = useNavigation();
    const { projects } = useApp();

    const activeProject = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;
    const activeBoard = activeProject?.boards?.find(b => b.id === activeBoardId);

    const items = [
        { label: 'Home', icon: Home, action: () => navigateTo('dashboard') }
    ];

    if (activeModule === 'projects') {
        items.push({
            label: 'Projetos',
            icon: Folder,
            action: () => {
                navigateTo('projects');
                selectProject(null); // Clear project selection to go to list
            }
        });

        if (activeProject) {
            items.push({
                label: activeProject.name,
                icon: null,
                action: () => {
                    // Go to project dashboard
                    selectProject(activeProject.id);
                    setActiveBoardId(null);
                }
            });
        }

        if (activeBoard) {
            items.push({ label: activeBoard.name, icon: Layout, action: null });
        }
    } else {
        // Handle other modules if needed
        const moduleName = activeModule.charAt(0).toUpperCase() + activeModule.slice(1);
        items.push({ label: moduleName, icon: null, action: null });
    }

    return (
        <nav className="flex items-center text-sm text-slate-500 mb-4 px-1" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const Icon = item.icon;

                    return (
                        <li key={index} className="flex items-center">
                            {index > 0 && <ChevronRight size={14} className="mx-2 text-slate-400" />}
                            <button
                                onClick={item.action}
                                disabled={isLast || !item.action}
                                className={`flex items-center gap-1 transition-colors ${isLast
                                        ? 'font-semibold text-slate-800 cursor-default'
                                        : 'hover:text-indigo-600 text-slate-500'
                                    }`}
                            >
                                {Icon && <Icon size={14} />}
                                <span>{item.label}</span>
                            </button>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
