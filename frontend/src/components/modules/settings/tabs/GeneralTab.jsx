import React from 'react';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useCompanies } from '../../../../hooks/useCompanies';
import { useGroups } from '../../../../hooks/useGroups';
import { useCollaborators } from '../../../../hooks/useCollaborators';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Info, Shield, Server, Box } from 'lucide-react';
import { Badge } from '../../../ui';

const GeneralTab = ({ accentColor }) => {
    const { user } = useAuthContext();
    const { companies } = useCompanies();
    const { groups } = useGroups();
    const { collaborators } = useCollaborators();
    const { theme } = useTheme();

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Section */}
            <div className="flex items-center gap-4 mb-8">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105"
                    style={{ backgroundColor: accentColor + '20', color: accentColor }}
                >
                    <Info size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Visão Geral</h2>
                    <p className="text-slate-500 dark:text-slate-400">Status do sistema e resumo da sua conta</p>
                </div>
            </div>

            {/* System Health / Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Profile Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                style={{ backgroundColor: accentColor }}
                            >
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{user?.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                            </div>
                        </div>
                        <Badge color={user?.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}>
                            {user?.role === 'admin' ? 'Admin' : 'Usuário'}
                        </Badge>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">ID do Usuário</p>
                            <p className="font-mono text-xs text-slate-600 dark:text-slate-300 truncate" title={user?.id}>{user?.id}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Entrou em</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* System Info Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Server size={20} className="text-slate-400" /> Sistema
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
                            <span className="text-slate-500 dark:text-slate-400">Versão</span>
                            <span className="font-mono font-medium text-slate-700 dark:text-slate-200">v1.0.0</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
                            <span className="text-slate-500 dark:text-slate-400">Ambiente</span>
                            <Badge color="bg-emerald-100 text-emerald-700">Produção</Badge>
                        </div>
                        <div className="flex justify-between items-center py-2 last:border-0">
                            <span className="text-slate-500 dark:text-slate-400">Tema Atual</span>
                            <span className="capitalize font-medium text-slate-700 dark:text-slate-200">{theme}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Empresas', value: companies.length, icon: Box },
                    { label: 'Grupos', value: groups.length, icon: Shield },
                    { label: 'Colaboradores', value: collaborators.length, icon: Info },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                            <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{stat.value}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-300">
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default GeneralTab;
