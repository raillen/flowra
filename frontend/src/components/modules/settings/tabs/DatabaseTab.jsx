import React, { useState, useEffect } from 'react';
import api from '../../../../config/api';
import { Database, RefreshCw, HardDrive, BarChart3, Download, Server } from 'lucide-react';
import { Button, Badge, Toast } from '../../../ui';

const DatabaseTab = ({ accentColor }) => {
    const [dbStats, setDbStats] = useState(null);
    const [dbStatsLoading, setDbStatsLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(null);
    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' });

    const fetchDbStats = async () => {
        setDbStatsLoading(true);
        try {
            const response = await api.get('/stats/database');
            setDbStats(response.data.data);
        } catch (error) {
            console.error('Error fetching db stats:', error);
            setToast({ isOpen: true, message: 'Erro ao carregar estatísticas', type: 'error' });
        } finally {
            setDbStatsLoading(false);
        }
    };

    const handleExport = async (entity) => {
        setExportLoading(entity);
        try {
            const response = await api.get(`/stats/export/${entity}`);
            const dataStr = JSON.stringify(response.data.data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${entity}_export_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            setToast({ isOpen: true, message: `${entity} exportado com sucesso!`, type: 'success' });
        } catch (error) {
            setToast({ isOpen: true, message: 'Erro ao exportar dados', type: 'error' });
        } finally {
            setExportLoading(null);
        }
    };

    useEffect(() => {
        fetchDbStats();
    }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105"
                    style={{ backgroundColor: accentColor + '20', color: accentColor }}
                >
                    <Database size={28} />
                </div>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Banco de Dados</h2>
                    <p className="text-slate-500 dark:text-slate-400">Monitoramento e manutenção do sistema</p>
                </div>
                <Button variant="ghost" onClick={fetchDbStats} disabled={dbStatsLoading} title="Atualizar">
                    <RefreshCw size={20} className={dbStatsLoading ? "animate-spin" : ""} />
                </Button>
            </div>

            {dbStatsLoading && !dbStats ? (
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="animate-spin text-slate-300" size={48} />
                </div>
            ) : dbStats ? (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Storage Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <HardDrive size={100} />
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                                    <HardDrive size={20} />
                                </div>
                                <h3 className="font-bold text-slate-700 dark:text-white">Armazenamento</h3>
                            </div>
                            <p className="text-4xl font-bold text-slate-800 dark:text-white mb-1">
                                {dbStats.storage?.databaseMB || 0} MB
                            </p>
                            <p className="text-xs text-slate-400">Tamanho total do banco (estimado)</p>
                        </div>

                        {/* Total Records Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <BarChart3 size={100} />
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                    <BarChart3 size={20} />
                                </div>
                                <h3 className="font-bold text-slate-700 dark:text-white">Registros Totais</h3>
                            </div>
                            <p className="text-4xl font-bold text-slate-800 dark:text-white mb-1">
                                {dbStats.totals?.entities?.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-slate-400">Objetos cadastrados no sistema domain</p>
                        </div>

                        {/* Detailed Counts */}
                        <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold text-slate-700 dark:text-white mb-6">Detalhamento por Entidade</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {Object.entries(dbStats.entities || {}).map(([key, value]) => (
                                    <div key={key} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex flex-col items-center text-center hover:bg-slate-100 transition-colors">
                                        <span className="text-2xl font-bold text-slate-800 dark:text-white">{value}</span>
                                        <span className="text-xs font-semibold text-slate-500 uppercase mt-1">{key}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Export Actions */}
                        <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold text-slate-700 dark:text-white mb-2 flex items-center gap-2">
                                <Download size={20} />
                                Backup e Exportação
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">Exporte dados brutos em formato JSON das entidades do sistema.</p>

                            <div className="flex flex-wrap gap-3">
                                {['users', 'companies', 'projects', 'boards', 'cards', 'notes', 'collaborators', 'tags'].map((entity) => (
                                    <button
                                        key={entity}
                                        onClick={() => handleExport(entity)}
                                        disabled={exportLoading === entity}
                                        className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all
                                ${exportLoading === entity ? 'opacity-70 cursor-wait' : 'hover:scale-105 active:scale-95'}
                                bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200
                             `}
                                    >
                                        {exportLoading === entity ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                                        <span className="capitalize">{entity}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </>
            ) : (
                <div className="text-center py-12 text-red-400">
                    <p>Erro ao carregar dados. Tente novamente.</p>
                </div>
            )}

            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isOpen: false })}
            />

        </div>
    );
};

export default DatabaseTab;
