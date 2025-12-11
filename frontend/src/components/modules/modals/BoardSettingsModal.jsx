import React, { useState, useEffect, useRef } from 'react';
import {
    Settings, Check, X, ChevronDown, ChevronRight, Plus, Trash,
    Hash, Type, List, Calendar, CheckSquare, Palette, Layout, Search, Flag, Shield, Users, Lock, Unlock
} from 'lucide-react';
import { Modal, Button } from '../../ui';
import { useBoardConfig } from '../../../hooks/useBoardConfig';
import { fieldLabels, fieldCategories } from '../../../services/boardConfigService';
import { getBoardById, updateBoard, addMember, removeMember } from '../../../services/boardService';
import { ICON_MAP, ICON_CATEGORIES } from '../../../utils/iconLibrary';
import MemberManagementModal from './MemberManagementModal';

// Color mapping for Status/Priority
const AVAILABLE_COLORS = [
    { name: 'Slate', bg: 'bg-slate-100', text: 'text-slate-700' },
    { name: 'Gray', bg: 'bg-gray-100', text: 'text-gray-700' },
    { name: 'Red', bg: 'bg-red-100', text: 'text-red-700' },
    { name: 'Orange', bg: 'bg-orange-100', text: 'text-orange-700' },
    { name: 'Amber', bg: 'bg-amber-100', text: 'text-amber-700' },
    { name: 'Yellow', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    { name: 'Lime', bg: 'bg-lime-100', text: 'text-lime-700' },
    { name: 'Green', bg: 'bg-green-100', text: 'text-green-700' },
    { name: 'Emerald', bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { name: 'Teal', bg: 'bg-teal-100', text: 'text-teal-700' },
    { name: 'Cyan', bg: 'bg-cyan-100', text: 'text-cyan-700' },
    { name: 'Sky', bg: 'bg-sky-100', text: 'text-sky-700' },
    { name: 'Blue', bg: 'bg-blue-100', text: 'text-blue-700' },
    { name: 'Indigo', bg: 'bg-indigo-100', text: 'text-indigo-700' },
    { name: 'Violet', bg: 'bg-violet-100', text: 'text-violet-700' },
    { name: 'Purple', bg: 'bg-purple-100', text: 'text-purple-700' },
    { name: 'Fuchsia', bg: 'bg-fuchsia-100', text: 'text-fuchsia-700' },
    { name: 'Pink', bg: 'bg-pink-100', text: 'text-pink-700' },
    { name: 'Rose', bg: 'bg-rose-100', text: 'text-rose-700' },
];

/**
 * Board Settings Modal
 * Allows users to configure fields, lists, custom fields, and access control
 */
const BoardSettingsModal = ({ isOpen, onClose, boardId, projectId, boardName, onUpdate }) => {
    const {
        fields,
        loading,
        saving,
        saveConfig,
        toggleField,
        updateField,
    } = useBoardConfig(boardId);

    const [activeTab, setActiveTab] = useState('general'); // general, lists, custom
    const [localFields, setLocalFields] = useState({});
    const [expandedCategories, setExpandedCategories] = useState({
        time: true,
        collaboration: true,
        organization: true,
        visual: false,
        business: false,
    });

    // Custom Fields State
    const [newField, setNewField] = useState({ name: '', type: 'text', options: '' });

    // Lists State
    const [newItem, setNewItem] = useState({ label: '', value: '', icon: 'layout', color: 'bg-slate-100 text-slate-700' });
    const [activeListType, setActiveListType] = useState('type'); // type, status, priority

    // Icon Picker State
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [iconSearch, setIconSearch] = useState('');
    const iconPickerRef = useRef(null);

    // Color Picker State
    const [showColorPicker, setShowColorPicker] = useState(false);
    const colorPickerRef = useRef(null);
    // Access Control State
    const [isPrivate, setIsPrivate] = useState(false);
    const [members, setMembers] = useState([]);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [loadingBoard, setLoadingBoard] = useState(false);

    useEffect(() => {
        if (isOpen && projectId && boardId) {
            loadBoardData();
        }
    }, [isOpen, projectId, boardId]);

    const loadBoardData = async () => {
        try {
            setLoadingBoard(true);
            const board = await getBoardById(projectId, boardId);
            setIsPrivate(board.isPrivate || false);
            setMembers(board.members || []);
        } catch (error) {
            console.error('Failed to load board data:', error);
        } finally {
            setLoadingBoard(false);
        }
    };

    const handleTogglePrivacy = async () => {
        try {
            const newPrivacy = !isPrivate;
            await updateBoard(projectId, boardId, { isPrivate: newPrivacy });
            setIsPrivate(newPrivacy);
        } catch (error) {
            console.error('Failed to update privacy:', error);
        }
    };

    const handleAddMember = async (userId) => {
        await addMember(projectId, boardId, userId);
        loadBoardData();
    };

    const handleRemoveMember = async (userId) => {
        await removeMember(projectId, boardId, userId);
        loadBoardData();
    };
    useEffect(() => {
        if (fields) {
            setLocalFields(JSON.parse(JSON.stringify(fields))); // Deep copy
        }
    }, [fields]);

    // Close pickers on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (iconPickerRef.current && !iconPickerRef.current.contains(event.target)) {
                setShowIconPicker(false);
            }
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
                setShowColorPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleField = (fieldName) => {
        const currentField = localFields[fieldName] || { enabled: false, required: false };
        setLocalFields({
            ...localFields,
            [fieldName]: { ...currentField, enabled: !currentField.enabled },
        });
    };

    const handleToggleRequired = (fieldName) => {
        const currentField = localFields[fieldName] || { enabled: false, required: false };
        setLocalFields({
            ...localFields,
            [fieldName]: { ...currentField, required: !currentField.required },
        });
    };

    const handleToggleCategory = (categoryKey) => {
        setExpandedCategories({
            ...expandedCategories,
            [categoryKey]: !expandedCategories[categoryKey],
        });
    };

    // Custom Field Handlers
    const handleAddCustomField = () => {
        if (!newField.name.trim()) return;

        const currentCustomFields = localFields.customFields || { enabled: false, definitions: [] };
        const newDefinition = {
            id: crypto.randomUUID(),
            name: newField.name,
            type: newField.type,
            options: newField.type === 'select' ? newField.options.split(',').map(o => o.trim()) : undefined
        };

        setLocalFields({
            ...localFields,
            customFields: {
                ...currentCustomFields,
                enabled: true,
                definitions: [...(currentCustomFields.definitions || []), newDefinition]
            }
        });
        setNewField({ name: '', type: 'text', options: '' });
    };

    const handleRemoveCustomField = (fieldId) => {
        const current = localFields.customFields || { definitions: [] };
        setLocalFields({
            ...localFields,
            customFields: {
                ...current,
                definitions: current.definitions.filter(f => f.id !== fieldId)
            }
        });
    };

    // List Management Handlers
    const handleAddListItem = () => {
        if (!newItem.label.trim()) return;

        const value = newItem.label.toLowerCase().replace(/\s+/g, '_');
        const listConfig = localFields[activeListType] || {};
        const currentOptions = listConfig.options || [];

        const newItemData = {
            value,
            label: newItem.label,
        };

        if (activeListType === 'type') {
            newItemData.icon = newItem.icon;
        } else {
            newItemData.color = newItem.color;
        }

        setLocalFields({
            ...localFields,
            [activeListType]: {
                ...listConfig,
                options: [...currentOptions, newItemData]
            }
        });
        setNewItem({ ...newItem, label: '' }); // Keep last icon/color
    };

    const handleRemoveListItem = (valToRemove) => {
        const listConfig = localFields[activeListType] || {};
        const currentOptions = listConfig.options || [];
        setLocalFields({
            ...localFields,
            [activeListType]: {
                ...listConfig,
                options: currentOptions.filter(o => o.value !== valToRemove)
            }
        });
    };

    const handleSave = async () => {
        try {
            await saveConfig(localFields);
            if (onUpdate) onUpdate();
            onClose();
        } catch (err) {
            console.error('Failed to save config:', err);
        }
    };

    const handleCancel = () => {
        setLocalFields(JSON.parse(JSON.stringify(fields)));
        setActiveTab('general');
        onClose();
    };

    const isFieldEnabled = (fieldName) => localFields[fieldName]?.enabled ?? false;

    // Helper to get current options
    const getCurrentListOptions = () => {
        const defaultOptions = {
            type: [
                { value: 'tarefa', label: 'Tarefa', icon: 'check-square' },
                { value: 'bug', label: 'Bug', icon: 'bug' },
                { value: 'feature', label: 'Feature', icon: 'star' },
            ],
            status: [
                { value: 'novo', label: 'Novo', color: 'bg-slate-100 text-slate-700' },
                { value: 'em_progresso', label: 'Em Progresso', color: 'bg-blue-100 text-blue-700' },
                { value: 'concluido', label: 'Concluído', color: 'bg-green-100 text-green-700' },
            ],
            priority: [
                { value: 'baixa', label: 'Baixa', color: 'bg-green-100 text-green-700' },
                { value: 'media', label: 'Média', color: 'bg-yellow-100 text-yellow-700' },
                { value: 'alta', label: 'Alta', color: 'bg-red-100 text-red-700' },
            ]
        };
        return localFields[activeListType]?.options || defaultOptions[activeListType];
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleCancel} title={`Configuração do Quadro: ${boardName || ''}`} size="lg">
            <div className="flex flex-col h-[650px]">
                {/* Tabs */}
                <div className="flex space-x-1 border-b border-secondary-200 mb-4 px-1">
                    {['general', 'lists', 'custom', 'access'].map(tab => (
                        <button
                            key={tab}
                            className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-secondary-500 hover:text-secondary-700'
                                }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'general' ? 'Campos Padrão' :
                                tab === 'lists' ? 'Listas & Opções' :
                                    tab === 'custom' ? 'Campos Personalizados' : 'Acesso & Membros'}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar p-1">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : (
                        <>
                            {/* GENERAL TAB */}
                            {activeTab === 'general' && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
                                        Selecione os campos visíveis. Campos obrigatórios impedem salvar cards incompletos.
                                    </div>
                                    {Object.entries(fieldCategories).map(([key, category]) => (
                                        <div key={key} className="border border-secondary-200 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => handleToggleCategory(key)}
                                                className="w-full flex items-center justify-between p-3 bg-secondary-50 hover:bg-secondary-100"
                                            >
                                                <span className="font-medium text-secondary-700 flex items-center gap-2">
                                                    {expandedCategories[key] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                    {category.label}
                                                </span>
                                            </button>
                                            {expandedCategories[key] && (
                                                <div className="p-2 space-y-1">
                                                    {category.fields.map(fieldName => (
                                                        <div key={fieldName} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isFieldEnabled(fieldName)}
                                                                    onChange={() => handleToggleField(fieldName)}
                                                                    className="h-4 w-4 text-primary-600 rounded"
                                                                />
                                                                <span className={isFieldEnabled(fieldName) ? 'text-gray-900' : 'text-gray-400'}>
                                                                    {fieldLabels[fieldName]}
                                                                </span>
                                                            </div>
                                                            {isFieldEnabled(fieldName) && (
                                                                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={localFields[fieldName]?.required}
                                                                        onChange={() => handleToggleRequired(fieldName)}
                                                                        className="h-3 w-3 text-red-600 rounded"
                                                                    />
                                                                    <span className="text-gray-500">Obrigatório</span>
                                                                </label>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* LISTS TAB */}
                            {activeTab === 'lists' && (
                                <div className="space-y-6">
                                    <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                                        {[
                                            { id: 'type', label: 'Tipos', icon: Layout },
                                            { id: 'status', label: 'Status', icon: CheckSquare },
                                            { id: 'priority', label: 'Prioridade', icon: Flag }
                                        ].map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setActiveListType(type.id)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeListType === type.id
                                                    ? 'bg-white text-primary-700 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                <type.icon size={14} />
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* List Editor */}
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">Adicionar Novo Item</h4>
                                            <div className="flex gap-3 items-end">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-xs text-gray-500">Nome</label>
                                                    <input
                                                        type="text"
                                                        value={newItem.label}
                                                        onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                                                        className="w-full p-2 border rounded-lg text-sm"
                                                        placeholder="Ex: Urgente, Design..."
                                                    />
                                                </div>

                                                {activeListType === 'type' ? (
                                                    <div className="w-1/3 space-y-1">
                                                        <label className="text-xs text-gray-500">Ícone</label>
                                                        <div className="relative" ref={iconPickerRef}>
                                                            <button
                                                                onClick={() => setShowIconPicker(!showIconPicker)}
                                                                className="w-full p-2 border rounded-lg text-sm bg-white flex items-center justify-between hover:bg-gray-50 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    {React.createElement(ICON_MAP[newItem.icon] || Layout, { size: 16, className: 'text-gray-600' })}
                                                                    <span className="text-xs text-gray-600 truncate max-w-[80px]">{newItem.icon}</span>
                                                                </div>
                                                                <ChevronDown size={14} className="text-gray-400" />
                                                            </button>

                                                            {/* ICON PICKER POPOVER */}
                                                            {showIconPicker && (
                                                                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                                                                    <div className="p-2 border-b border-gray-100 bg-gray-50">
                                                                        <div className="relative">
                                                                            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Buscar ícone..."
                                                                                value={iconSearch}
                                                                                onChange={(e) => setIconSearch(e.target.value)}
                                                                                className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                                                                        {Object.entries(ICON_CATEGORIES).map(([category, icons]) => {
                                                                            const filteredIcons = icons.filter(icon => icon.includes(iconSearch.toLowerCase()));
                                                                            if (filteredIcons.length === 0) return null;

                                                                            return (
                                                                                <div key={category} className="mb-3 last:mb-0">
                                                                                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{category}</h5>
                                                                                    <div className="grid grid-cols-6 gap-1">
                                                                                        {filteredIcons.map(iconKey => (
                                                                                            <button
                                                                                                key={iconKey}
                                                                                                onClick={() => {
                                                                                                    setNewItem({ ...newItem, icon: iconKey });
                                                                                                    setShowIconPicker(false);
                                                                                                }}
                                                                                                className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${newItem.icon === iconKey
                                                                                                    ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-500 ring-offset-1'
                                                                                                    : 'hover:bg-gray-100 text-gray-600'
                                                                                                    }`}
                                                                                                title={iconKey}
                                                                                            >
                                                                                                {React.createElement(ICON_MAP[iconKey], { size: 18 })}
                                                                                            </button>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-1/3 space-y-1">
                                                        <label className="text-xs text-gray-500">Cor</label>
                                                        <div className="relative" ref={colorPickerRef}>
                                                            <button
                                                                onClick={() => setShowColorPicker(!showColorPicker)}
                                                                className="w-full p-2 border rounded-lg text-sm bg-white flex items-center justify-between hover:bg-gray-50 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-4 h-4 rounded-full border ${newItem.color.split(' ')[0]}`} />
                                                                    <span className="text-xs text-gray-600 truncate">
                                                                        {AVAILABLE_COLORS.find(c => `${c.bg} ${c.text}` === newItem.color)?.name || 'Select'}
                                                                    </span>
                                                                </div>
                                                                <ChevronDown size={14} className="text-gray-400" />
                                                            </button>

                                                            {/* VISUAL COLOR PICKER POPOVER */}
                                                            {showColorPicker && (
                                                                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden p-3">
                                                                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Selecione uma Cor</h5>
                                                                    <div className="grid grid-cols-5 gap-2">
                                                                        {AVAILABLE_COLORS.map((c, i) => (
                                                                            <button
                                                                                key={i}
                                                                                onClick={() => {
                                                                                    setNewItem({ ...newItem, color: `${c.bg} ${c.text}` });
                                                                                    setShowColorPicker(false);
                                                                                }}
                                                                                className="group relative flex items-center justify-center"
                                                                                title={c.name}
                                                                            >
                                                                                <div className={`w-8 h-8 rounded-full border border-gray-200 transition-transform hover:scale-110 ${c.bg} ${newItem.color === `${c.bg} ${c.text}` ? 'ring-2 ring-primary-500 ring-offset-2' : ''
                                                                                    }`} />
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <Button onClick={handleAddListItem} disabled={!newItem.label}>
                                                    <Plus size={16} />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {getCurrentListOptions()?.map((opt, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-gray-300 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        {activeListType === 'type' ? (
                                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                                                                {ICON_MAP[opt.icon]
                                                                    ? React.createElement(ICON_MAP[opt.icon], { size: 16 })
                                                                    : <span className="text-lg">{opt.icon || '📋'}</span>
                                                                }
                                                            </div>
                                                        ) : (
                                                            <div className={`w-3 h-3 rounded-full ${(opt.color || '').split(' ')[0] || 'bg-gray-300'}`} />
                                                        )}
                                                        <span className="font-medium text-slate-700">{opt.label}</span>
                                                        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded ml-2">
                                                            ID: {opt.value}
                                                        </span>
                                                    </div>

                                                    <button
                                                        onClick={() => handleRemoveListItem(opt.value)}
                                                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            {(!getCurrentListOptions() || getCurrentListOptions().length === 0) && (
                                                <div className="text-center py-8 text-gray-500 text-sm">
                                                    Nenhum item definido. Adicione o primeiro acima.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CUSTOM FIELDS TAB */}
                            {activeTab === 'custom' && (
                                <div className="space-y-6">
                                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                                        <h4 className="font-medium text-purple-900 mb-1">Adicionar Campo Personalizado</h4>
                                        <div className="grid grid-cols-12 gap-3 mt-3">
                                            <div className="col-span-5">
                                                <input
                                                    type="text"
                                                    value={newField.name}
                                                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                                                    className="w-full p-2 border border-purple-200 rounded-md text-sm focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Nome"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <select
                                                    value={newField.type}
                                                    onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                                                    className="w-full p-2 border border-purple-200 rounded-md text-sm cursor-pointer"
                                                >
                                                    <option value="text">Texto</option>
                                                    <option value="number">Número</option>
                                                    <option value="date">Data</option>
                                                    <option value="boolean">Sim/Não</option>
                                                    <option value="select">Seleção</option>
                                                </select>
                                            </div>
                                            <div className="col-span-4 flex gap-2">
                                                <Button onClick={handleAddCustomField} disabled={!newField.name} size="sm">
                                                    <Plus size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {localFields.customFields?.definitions?.map((field) => (
                                            <div key={field.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg group hover:border-purple-300 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                                                        {field.type === 'text' ? <Type size={16} /> : <Hash size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{field.name}</p>
                                                        <p className="text-xs text-gray-500 capitalize">{field.type}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveCustomField(field.id)}
                                                    className="text-gray-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* ACCESS TAB */}
                            {activeTab === 'access' && (
                                <div className="space-y-6">
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-2 rounded-lg ${isPrivate ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                                    {isPrivate ? <Lock size={20} /> : <Unlock size={20} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Visibilidade do Quadro</h4>
                                                    <p className="text-sm text-gray-500">
                                                        {isPrivate ? 'Privado: Apenas membros convidados.' : 'Público: Todos os membros do projeto.'}
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isPrivate}
                                                    onChange={handleTogglePrivacy}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                                <Users size={16} className="text-gray-500" />
                                                Membros com Acesso ({members.length})
                                            </h4>
                                            <Button
                                                size="sm"
                                                onClick={() => setShowMemberModal(true)}
                                                variant="outline"
                                            >
                                                Gerenciar Membros
                                            </Button>
                                        </div>

                                        <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                                            {members.length === 0 ? (
                                                <div className="p-4 text-center text-sm text-gray-500">
                                                    Nenhum membro específico adicionado.
                                                </div>
                                            ) : (
                                                members.map(member => (
                                                    <div key={member.user.id} className="flex items-center justify-between p-3 bg-white">
                                                        <div className="flex items-center gap-3">
                                                            {member.user.avatar ? (
                                                                <img src={member.user.avatar} alt={member.user.name} className="h-8 w-8 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-medium">
                                                                    {member.user.name.slice(0, 2).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                                                                <p className="text-xs text-gray-500">{member.user.email}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
                    <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={loading || saving}>
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>
            </div>

            <MemberManagementModal
                isOpen={showMemberModal}
                onClose={() => setShowMemberModal(false)}
                entityType="board"
                entityId={boardId}
                projectId={projectId}
                title={`Membros do Quadro: ${boardName || ''}`}
                currentMembers={members}
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMember}
            />
        </Modal>
    );
};

export default BoardSettingsModal;
