import React, { useState } from 'react';
import { useGroups } from '../../../../hooks/useGroups';
import { useCollaborators } from '../../../../hooks/useCollaborators';
import { Layers, Plus, Trash2, Search, Users, Eye, Mail, Shield } from 'lucide-react';
import { Button, Modal, ConfirmationDialog, Toast, Badge, BaseInput } from '../../../ui';

const GroupsTab = ({ accentColor }) => {
    const { groups, addGroup, deleteGroup } = useGroups();
    const { collaborators } = useCollaborators();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, group: null });
    const [viewingGroup, setViewingGroup] = useState(null);
    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' });

    const handleAddGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        try {
            await addGroup({ name: newGroupName });
            setNewGroupName('');
            setIsModalOpen(false);
            setToast({ isOpen: true, message: 'Grupo criado com sucesso!', type: 'success' });
        } catch (error) {
            setToast({ isOpen: true, message: 'Erro ao criar grupo.', type: 'error' });
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm.group) return;
        try {
            await deleteGroup(deleteConfirm.group.id);
            setDeleteConfirm({ isOpen: false, group: null });
            setToast({ isOpen: true, message: 'Grupo removido.', type: 'success' });
        } catch (error) {
            setToast({ isOpen: true, message: 'Erro ao remover grupo.', type: 'error' });
        }
    };

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getGroupMembers = (groupId) => {
        return collaborators.filter(c => c.groupIds && c.groupIds.includes(groupId));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105"
                        style={{ backgroundColor: accentColor + '20', color: accentColor }}
                    >
                        <Layers size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Grupos</h2>
                        <p className="text-gray-500 dark:text-gray-400">Organize seus projetos e equipes</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-full md:w-64">
                        <BaseInput
                            leftIcon={Search}
                            placeholder="Buscar grupos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white dark:bg-gray-800"
                        />
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} icon={Plus} className="shadow-md">
                        Novo Grupo
                    </Button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredGroups.map(group => {
                    const memberCount = getGroupMembers(group.id).length;
                    return (
                        <div
                            key={group.id}
                            className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative flex flex-col justify-between h-40"
                        >
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                    <Layers size={20} />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setViewingGroup(group)}
                                        className="p-2 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Ver Detalhes"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm({ isOpen: true, group })}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Excluir Grupo"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1 truncate" title={group.name}>{group.name}</h3>
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Users size={12} />
                                    <span>{memberCount} Membro{memberCount !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredGroups.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                        <Layers size={48} className="mb-4 opacity-50" />
                        <p>Nenhum grupo encontrado</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Novo Grupo"
                maxWidth="max-w-md"
            >
                <form onSubmit={handleAddGroup} className="space-y-4">
                    <BaseInput
                        label="Nome do Grupo"
                        autoFocus
                        placeholder="Ex: Marketing, Desenvolvimento..."
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        fullWidth
                    />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit">Criar Grupo</Button>
                    </div>
                </form>
            </Modal>

            {/* View Details Modal */}
            <Modal
                isOpen={!!viewingGroup}
                onClose={() => setViewingGroup(null)}
                title="Detalhes do Grupo"
                maxWidth="max-w-xl"
            >
                {viewingGroup && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-5 bg-indigo-50 dark:bg-gray-800/50 rounded-2xl border border-indigo-100 dark:border-gray-700">
                            <div className="w-14 h-14 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                                <Layers size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{viewingGroup.name}</h3>
                                <p className="text-gray-500 text-sm">Grupo de acesso e permissões</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-700 dark:text-white flex items-center gap-2 mb-3">
                                <Users size={18} className="text-indigo-500" /> Membros do Grupo
                                <Badge color="bg-gray-100 text-gray-600 ml-auto">
                                    {getGroupMembers(viewingGroup.id).length}
                                </Badge>
                            </h4>

                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto custom-scrollbar">
                                {getGroupMembers(viewingGroup.id).length > 0 ? (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {getGroupMembers(viewingGroup.id).map(member => (
                                            <div key={member.id} className="p-3 flex items-center gap-3 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                                    {member.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{member.name}</p>
                                                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                                        <Mail size={10} /> {member.email}
                                                    </p>
                                                </div>
                                                <Badge color={member.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}>
                                                    {member.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-400">
                                        <Users size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Nenhum membro vinculado a este grupo.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button variant="secondary" onClick={() => setViewingGroup(null)}>Fechar</Button>
                        </div>
                    </div>
                )}
            </Modal>

            <ConfirmationDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, group: null })}
                onConfirm={handleDelete}
                title="Excluir Grupo"
                message={`Tem certeza que deseja excluir "${deleteConfirm.group?.name}"?`}
                type="danger"
            />

            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isOpen: false })}
            />
        </div>
    );
};

export default GroupsTab;
