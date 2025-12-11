import React, { useState, useEffect } from 'react';
import { FolderOpen, Layout, ArrowRight, Plus } from 'lucide-react';
import { listProjects, listBoards, listColumns } from '../../../services/briefingService';

export default function DestinationSettings({ projectId, boardId, columnId, onChange }) {
    const [projects, setProjects] = useState([]);
    const [boards, setBoards] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingBoards, setLoadingBoards] = useState(false);
    const [loadingColumns, setLoadingColumns] = useState(false);

    // Load projects on mount
    useEffect(() => {
        loadProjectsList();
    }, []);

    // Load boards when project changes
    useEffect(() => {
        if (projectId) {
            loadBoardsList(projectId);
        } else {
            setBoards([]);
            setColumns([]);
        }
    }, [projectId]);

    // Load columns when board changes
    useEffect(() => {
        if (boardId) {
            loadColumnsList(boardId);
        } else {
            setColumns([]);
        }
    }, [boardId]);

    const loadProjectsList = async () => {
        setLoadingProjects(true);
        try {
            const data = await listProjects();
            setProjects(data);
        } catch (e) {
            console.error("Failed to load projects", e);
        } finally {
            setLoadingProjects(false);
        }
    };

    const loadBoardsList = async (pid) => {
        setLoadingBoards(true);
        try {
            const data = await listBoards(pid);
            setBoards(data);
        } catch (e) {
            console.error("Failed to load boards", e);
        } finally {
            setLoadingBoards(false);
        }
    };

    const loadColumnsList = async (bid) => {
        setLoadingColumns(true);
        try {
            const data = await listColumns(bid);
            setColumns(data);
        } catch (e) {
            console.error("Failed to load columns", e);
        } finally {
            setLoadingColumns(false);
        }
    };

    const handleProjectChange = (e) => {
        const newProjectId = e.target.value || null;
        onChange({ projectId: newProjectId, defaultBoardId: null, defaultColumnId: null });
    };

    const handleBoardChange = (e) => {
        const newBoardId = e.target.value || null;
        onChange({ projectId, defaultBoardId: newBoardId, defaultColumnId: null });
    };

    const handleColumnChange = (e) => {
        const newColumnId = e.target.value || null;
        onChange({ projectId, defaultBoardId: boardId, defaultColumnId: newColumnId });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FolderOpen size={16} className="text-indigo-500" />
                Destino das Respostas
            </h3>
            <p className="text-xs text-gray-500 mb-4">
                Configure onde os cards serão criados quando alguém preencher este formulário.
            </p>

            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                {/* Project Selector */}
                <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Projeto</label>
                    <select
                        value={projectId || ''}
                        onChange={handleProjectChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        disabled={loadingProjects}
                    >
                        <option value="">Automático (Primeiro disponível)</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <ArrowRight size={16} className="text-gray-300 hidden md:block mt-5" />

                {/* Board Selector */}
                <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Board</label>
                    <select
                        value={boardId || ''}
                        onChange={handleBoardChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        disabled={!projectId || loadingBoards}
                    >
                        <option value="">Automático (Primeiro disponível)</option>
                        {boards.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                <ArrowRight size={16} className="text-gray-300 hidden md:block mt-5" />

                {/* Column Selector */}
                <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Coluna</label>
                    <select
                        value={columnId || ''}
                        onChange={handleColumnChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        disabled={!boardId || loadingColumns}
                    >
                        <option value="">Automático (Primeira coluna)</option>
                        {columns.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
