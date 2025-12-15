import React, { useState, useEffect, useRef } from 'react';
import {
    Settings, Check, X, ChevronDown, ChevronRight, Plus, Trash,
    Hash, Type, List, Calendar, CheckSquare, Palette, Layout, Search, Flag, Shield, Users, Lock, Unlock, Archive, Zap, Clock, GripVertical
} from 'lucide-react';
import { Modal, Button } from '../../ui';
import { useBoardConfig } from '../../../hooks/useBoardConfig';
import { getBoardById, updateBoard, addMember, removeMember } from '../../../services/boardService';
import { getRules, createRule, deleteRule } from '../../../services/automationService';
import { ICON_MAP, ICON_CATEGORIES } from '../../../utils/iconLibrary';

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
        saveConfig,
    } = useBoardConfig(boardId);

    const [activeTab, setActiveTab] = useState('general'); // general, lists, custom, automation, access
    const [localFields, setLocalFields] = useState({});

    // Automation State (mocked if not passed as prop, assuming it's managed internally or ready for integration)
    const [rules, setRules] = useState([]);
    const [loadingRules, setLoadingRules] = useState(false);
    const [newRule, setNewRule] = useState({ triggerType: '', triggerValue: '', actionType: '', actionValue: '' });

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
    const [columns, setColumns] = useState([]);


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
            setColumns(board.columns || []);
        } catch (error) {
            console.error('Failed to load board data:', error);
        } finally {
            setLoadingBoard(false);
        }
    };

    const fetchRules = async () => {
        if (!boardId) return;
        try {
            setLoadingRules(true);
            const data = await getRules(boardId);
            setRules(data);
        } catch (error) {
            console.error('Failed to load rules:', error);
        } finally {
            setLoadingRules(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'automation') {
            fetchRules();
        }
    }, [activeTab, boardId]);

    const handleTogglePrivacy = async () => {
        try {
            const newPrivacy = !isPrivate;
            await updateBoard(projectId, boardId, { isPrivate: newPrivacy });
            setIsPrivate(newPrivacy);
        } catch (error) {
            console.error('Failed to update privacy:', error);
        }
    };

    // Default Options
    const DEFAULT_LIST_OPTIONS = {
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

    useEffect(() => {
        if (fields) {
            const initial = JSON.parse(JSON.stringify(fields));
            // Ensure options exist for lists
            ['type', 'status', 'priority'].forEach(key => {
                if (!initial[key]) initial[key] = { enabled: true };
                if (!initial[key].options) initial[key].options = DEFAULT_LIST_OPTIONS[key];
            });
            setLocalFields(initial);
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

    // Helper to get current options
    const getCurrentListOptions = () => {
        return localFields[activeListType]?.options || [];
    };

    // --- LOGIC HANDLERS (Same as before, minimized for brevity in this initial rewrite step) ---
    // List Management Handlers
    const handleAddListItem = () => {
        if (!newItem.label.trim()) return;
        const value = newItem.label.toLowerCase().replace(/\s+/g, '_');
        const listConfig = localFields[activeListType] || {};
        const currentOptions = listConfig.options || [];
        const newItemData = { value, label: newItem.label };
        if (activeListType === 'type') { newItemData.icon = newItem.icon; } else { newItemData.color = newItem.color; }
        setLocalFields({ ...localFields, [activeListType]: { ...listConfig, options: [...currentOptions, newItemData] } });
        setNewItem({ ...newItem, label: '' });
    };

    const handleRemoveListItem = (valToRemove) => {
        const listConfig = localFields[activeListType] || {};
        setLocalFields({ ...localFields, [activeListType]: { ...listConfig, options: (listConfig.options || []).filter(o => o.value !== valToRemove) } });
    };

    // Custom Field Handlers
    const handleAddCustomField = () => {
        if (!newField.name.trim()) return;
        const currentCustomFields = localFields.customFields || { enabled: false, definitions: [] };
        const newDefinition = {
            id: crypto.randomUUID(),
            name: newField.name, type: newField.type,
            options: newField.type === 'select' ? newField.options.split(',').map(o => o.trim()) : undefined
        };
        setLocalFields({ ...localFields, customFields: { ...currentCustomFields, enabled: true, definitions: [...(currentCustomFields.definitions || []), newDefinition] } });
        setNewField({ name: '', type: 'text', options: '' });
    };

    const handleRemoveCustomField = (fieldId) => {
        const current = localFields.customFields || { definitions: [] };
        setLocalFields({ ...localFields, customFields: { ...current, definitions: current.definitions.filter(f => f.id !== fieldId) } });
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
        if (fields) setLocalFields(JSON.parse(JSON.stringify(fields)));
        setActiveTab('general');
        onClose();
    };

    if (!isOpen) return null;

    const NAV_ITEMS = [
        { id: 'general', label: 'Funcionalidades', icon: Settings, desc: 'Campos e recursos do card' },
        { id: 'lists', label: 'Listas & Opções', icon: List, desc: 'Status, prioridades e tipos' },
        { id: 'custom', label: 'Campos Personalizados', icon: DatabaseIcon, desc: 'Crie campos sob medida' }, // database icon placeholder
        { id: 'automation', label: 'Automação', icon: Zap, desc: 'Regras automáticas' },
        { id: 'access', label: 'Acesso & Membros', icon: Users, desc: 'Quem pode ver e editar' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={handleCancel} title={`Configuração do Quadro`} maxWidth="max-w-6xl">
            {/* Modal Body Override - Using flex row for sidebar layout */}
            <div className="flex bg-white h-[650px] w-full isolate -mx-6 -my-6 sm:-mx-6 sm:-my-6">
                {/* SIDEBAR */}
                <div className="w-[280px] flex-shrink-0 border-r border-gray-200 bg-gray-50/50 flex flex-col h-full">
                    <div className="p-5 border-b border-gray-100 flex-shrink-0">
                        <h3 className="font-semibold text-gray-900 truncate text-base" title={boardName}>{boardName}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Configurações gerais</p>
                    </div>

                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon === DatabaseIcon ? Server : item.icon; // Quick fix for icon
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left group ${activeTab === item.id
                                        ? 'bg-white shadow-sm ring-1 ring-gray-200'
                                        : 'hover:bg-gray-100/80 hover:text-gray-900'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg transition-colors ${activeTab === item.id
                                        ? 'bg-primary-50 text-primary-600'
                                        : 'bg-white border border-gray-200 text-gray-500 group-hover:border-gray-300'
                                        }`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex-1 pt-0.5">
                                        <span className={`block text-sm font-medium ${activeTab === item.id ? 'text-gray-900' : 'text-gray-700'
                                            }`}>
                                            {item.label}
                                        </span>
                                        <span className="block text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                                            {item.desc}
                                        </span>
                                    </div>
                                    {activeTab === item.id && (
                                        <div className="self-center w-1.5 h-1.5 rounded-full bg-primary-500" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-gray-200 bg-white">
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleCancel} className="flex-1">
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} className="flex-1">
                                Salvar
                            </Button>
                        </div>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 bg-white flex flex-col min-w-0">
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="max-w-3xl mx-auto">

                            {/* Header for content */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {NAV_ITEMS.find(i => i.id === activeTab)?.label}
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    Gerencie as configurações de {NAV_ITEMS.find(i => i.id === activeTab)?.label.toLowerCase()} para este quadro.
                                </p>
                            </div>

                            {/* RENDER TAB CONTENT */}
                            {activeTab === 'general' && (
                                <FeaturesTab
                                    localFields={localFields}
                                    handleToggleField={handleToggleField}
                                    isFieldEnabled={(f) => localFields[f]?.enabled}
                                />
                            )}

                            {activeTab === 'lists' && (
                                <ListsTab
                                    activeListType={activeListType}
                                    setActiveListType={setActiveListType}
                                    localFields={localFields}
                                    newItem={newItem}
                                    setNewItem={setNewItem}
                                    handleAddListItem={handleAddListItem}
                                    handleRemoveListItem={handleRemoveListItem}
                                    showIconPicker={showIconPicker}
                                    setShowIconPicker={setShowIconPicker}
                                    iconPickerRef={iconPickerRef}
                                    iconSearch={iconSearch}
                                    setIconSearch={setIconSearch}
                                    showColorPicker={showColorPicker}
                                    setShowColorPicker={setShowColorPicker}
                                    colorPickerRef={colorPickerRef}
                                    AVAILABLE_COLORS={AVAILABLE_COLORS}
                                    getCurrentListOptions={getCurrentListOptions}
                                />
                            )}

                            {activeTab === 'custom' && (
                                <CustomFieldsTab
                                    localFields={localFields}
                                    newField={newField}
                                    setNewField={setNewField}
                                    handleAddCustomField={handleAddCustomField}
                                    handleRemoveCustomField={handleRemoveCustomField}
                                />
                            )}

                            {activeTab === 'automation' && (
                                <AutomationTab
                                    rules={rules}
                                    setRules={setRules}
                                    newRule={newRule}
                                    setNewRule={setNewRule}
                                    columns={columns}
                                    members={members}
                                    loading={loadingRules}
                                    onRefresh={fetchRules}
                                    boardId={boardId}
                                />
                            )}

                            {activeTab === 'access' && (
                                <AccessTab
                                    isPrivate={isPrivate}
                                    handleTogglePrivacy={handleTogglePrivacy}
                                    members={members}
                                    setShowMemberModal={setShowMemberModal}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

// --- SUB-COMPONENTS (To keep file clean in one go, usually would be separate files) ---

const FeaturesTab = ({ localFields, handleToggleField, isFieldEnabled }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
            { id: 'checklist', label: 'Lista de Tarefas', icon: CheckSquare, desc: 'Checklists avançadas com progresso', color: 'indigo' },
            { id: 'startDate', label: 'Data de Início', icon: Calendar, desc: 'Planejamento temporal de tarefas', color: 'blue' },
            { id: 'estimatedHours', label: 'Estimativa de Tempo', icon: Clock, desc: 'Controle de horas e esforço', color: 'emerald' },
            { id: 'type', label: 'Tipos de Card', icon: Layout, desc: 'Categorize por Bug, Feature, etc.', color: 'purple' },
            { id: 'externalUrl', label: 'Links Externos', icon: Zap, desc: 'Conecte com ferramentas externas', color: 'amber' },
        ].map(feat => (
            <button
                key={feat.id}
                onClick={() => handleToggleField(feat.id)}
                className={`flex text-left p-4 rounded-xl border-2 transition-all hover:scale-[1.01] ${isFieldEnabled(feat.id)
                    ? `border-${feat.color}-100 bg-${feat.color}-50/50`
                    : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
            >
                <div className={`p-3 rounded-xl mr-4 ${isFieldEnabled(feat.id) ? `bg-${feat.color}-100 text-${feat.color}-600` : 'bg-gray-100 text-gray-500'
                    }`}>
                    <feat.icon size={24} strokeWidth={1.5} />
                </div>
                <div>
                    <h4 className={`font-semibold ${isFieldEnabled(feat.id) ? 'text-gray-900' : 'text-gray-600'}`}>
                        {feat.label}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-[200px] leading-relaxed">
                        {feat.desc}
                    </p>
                    <div className={`mt-3 text-xs font-medium flex items-center gap-1.5 ${isFieldEnabled(feat.id) ? `text-${feat.color}-600` : 'text-gray-400'
                        }`}>
                        {isFieldEnabled(feat.id) ? (
                            <><Check size={14} /> Ativado</>
                        ) : (
                            <><div className="w-3.5 h-3.5 rounded-full border border-gray-300" /> Desativado</>
                        )}
                    </div>
                </div>
            </button>
        ))}
    </div>
);

const ListsTab = ({
    activeListType, setActiveListType, localFields,
    newItem, setNewItem, handleAddListItem, handleRemoveListItem,
    showIconPicker, setShowIconPicker, iconPickerRef, iconSearch, setIconSearch,
    showColorPicker, setShowColorPicker, colorPickerRef, availableColors = [],
    getCurrentListOptions
}) => (
    <div className="space-y-6">
        {/* List Type Toggle */}
        <div className="flex p-1 bg-gray-100 rounded-lg">
            {[
                { id: 'type', label: 'Tipos', icon: Layout },
                { id: 'status', label: 'Status', icon: CheckSquare },
                { id: 'priority', label: 'Prioridade', icon: Flag }
            ].map(type => (
                <button
                    key={type.id}
                    onClick={() => setActiveListType(type.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeListType === type.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <type.icon size={16} className={activeListType === type.id ? 'text-primary-600' : ''} />
                    {type.label}
                </button>
            ))}
        </div>

        {/* Add Item Form */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Adicionar Novo {activeListType === 'type' ? 'Tipo' : activeListType === 'status' ? 'Status' : 'Prioridade'}</h4>
            <div className="flex gap-3 items-start">
                <div className="flex-1 space-y-1">
                    <input
                        type="text"
                        value={newItem.label}
                        onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 outline-none transition-all placeholder:text-gray-400"
                        placeholder="Nome do item..."
                    />
                </div>

                {activeListType === 'type' ? (
                    <div className="w-1/3 relative" ref={iconPickerRef}>
                        <button
                            onClick={() => setShowIconPicker(!showIconPicker)}
                            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white flex items-center justify-between hover:border-gray-300 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                {React.createElement(ICON_MAP[newItem.icon] || Layout, { size: 18, className: 'text-gray-600' })}
                                <span className="text-gray-600 truncate">{newItem.icon}</span>
                            </div>
                            <ChevronDown size={14} className="text-gray-400" />
                        </button>

                        {showIconPicker && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                                <div className="p-3 border-b border-gray-100 bg-gray-50">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar ícone..."
                                            value={iconSearch}
                                            onChange={(e) => setIconSearch(e.target.value)}
                                            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                                            autoFocus
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
                                                            onClick={() => { setNewItem({ ...newItem, icon: iconKey }); setShowIconPicker(false); }}
                                                            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${newItem.icon === iconKey ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100 text-gray-600'}`}
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
                ) : (
                    <div className="w-1/3 relative" ref={colorPickerRef}>
                        <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white flex items-center justify-between hover:border-gray-300 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full ${newItem.color.split(' ')[0]}`} />
                                <span className="text-gray-600 truncate text-xs">
                                    {(newItem.color.split(' ')[0] || '').replace('bg-', '').replace('-100', '')}
                                </span>
                            </div>
                            <ChevronDown size={14} className="text-gray-400" />
                        </button>

                        {showColorPicker && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-3">
                                <div className="grid grid-cols-5 gap-2">
                                    {/* Using global constant accessible via closure or props? Passing props is safer */}
                                    {(availableColors || []).map((c, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setNewItem({ ...newItem, color: `${c.bg} ${c.text}` }); setShowColorPicker(false); }}
                                            className="group relative flex items-center justify-center"
                                            title={c.name}
                                        >
                                            <div className={`w-8 h-8 rounded-full border border-gray-200 transition-transform hover:scale-110 ${c.bg} ${newItem.color === `${c.bg} ${c.text}` ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <Button onClick={handleAddListItem} disabled={!newItem.label} className="h-[42px] px-4">
                    <Plus size={20} />
                </Button>
            </div>
        </div>

        {/* Existing Items List */}
        <div className="space-y-2">
            {getCurrentListOptions()?.map((opt, idx) => (
                <div key={idx} className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                        {activeListType === 'type' ? (
                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                                {React.createElement(ICON_MAP[opt.icon] || Layout, { size: 20 })}
                            </div>
                        ) : (
                            <div className={`w-3 h-3 rounded-full ${(opt.color || '').split(' ')[0] || 'bg-gray-300'} ring-4 ring-gray-50`} />
                        )}
                        <div>
                            <p className="font-medium text-gray-900">{opt.label}</p>
                            <p className="text-[10px] text-gray-400 font-mono">ID: {opt.value}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleRemoveListItem(opt.value)}
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Trash size={16} />
                    </button>
                </div>
            ))}
            {(!getCurrentListOptions() || getCurrentListOptions().length === 0) && (
                <div className="text-center py-10 rounded-xl border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 text-sm">Nenhum item definido.</p>
                </div>
            )}
        </div>
    </div>
);

const CustomFieldsTab = ({ localFields, newField, setNewField, handleAddCustomField, handleRemoveCustomField }) => (
    <div className="space-y-6">
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
            <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <Plus size={16} /> Novo Campo Personalizado
            </h4>
            <div className="grid grid-cols-12 gap-3">
                <div className="col-span-5">
                    <label className="block text-xs font-semibold text-purple-700/70 mb-1">Nome</label>
                    <input
                        type="text"
                        value={newField.name}
                        onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                        className="w-full p-2.5 bg-white border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="Ex: Custo, Departamento..."
                    />
                </div>
                <div className="col-span-3">
                    <label className="block text-xs font-semibold text-purple-700/70 mb-1">Tipo</label>
                    <select
                        value={newField.type}
                        onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                        className="w-full p-2.5 bg-white border border-purple-200 rounded-lg text-sm outline-none cursor-pointer"
                    >
                        <option value="text">Texto</option>
                        <option value="number">Número</option>
                        <option value="date">Data</option>
                        <option value="boolean">Sim/Não</option>
                        <option value="select">Seleção</option>
                    </select>
                </div>
                <div className="col-span-4 flex items-end">
                    <Button onClick={handleAddCustomField} disabled={!newField.name} className="w-full justify-center bg-purple-600 hover:bg-purple-700 text-white">
                        Adicionar Campo
                    </Button>
                </div>
            </div>
            {newField.type === 'select' && (
                <div className="mt-3">
                    <label className="block text-xs font-semibold text-purple-700/70 mb-1">Opções (separadas por vírgula)</label>
                    <input
                        type="text"
                        value={newField.options}
                        onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                        className="w-full p-2.5 bg-white border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="Opção A, Opção B, Opção C"
                    />
                </div>
            )}
        </div>

        <div className="space-y-2">
            {localFields.customFields?.definitions?.map((field) => (
                <div key={field.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-purple-200 hover:shadow-sm transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                            {field.type === 'text' && <Type size={20} />}
                            {field.type === 'number' && <Hash size={20} />}
                            {field.type === 'date' && <Calendar size={20} />}
                            {field.type === 'boolean' && <CheckSquare size={20} />}
                            {field.type === 'select' && <List size={20} />}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{field.name}</p>
                            <p className="text-xs text-gray-400 capitalize bg-gray-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                {field.type}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleRemoveCustomField(field.id)}
                        className="text-gray-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Trash size={18} />
                    </button>
                </div>
            ))}
            {(!localFields.customFields?.definitions || localFields.customFields.definitions.length === 0) && (
                <div className="text-center py-10 rounded-xl border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 text-sm">Nenhum campo personalizado criado.</p>
                </div>
            )}
        </div>
    </div>
);

const AutomationTab = ({ rules, setRules, newRule, setNewRule, columns, members, loading, onRefresh, boardId }) => {
    const handleCreateRule = async () => {
        if (!newRule.triggerType || !newRule.actionType) return;

        try {
            // Prepare payload
            // Simplification: logic to construct complex conditions/actions JSON based on UI
            const actions = [{
                type: newRule.actionType,
                value: newRule.actionValue
            }];

            const conditions = {};
            if (newRule.triggerType === 'CARD_MOVE' && newRule.triggerValue) {
                conditions.columnId = newRule.triggerValue;
            }

            await createRule(boardId, {
                name: `${newRule.triggerType} -> ${newRule.actionType}`,
                triggerType: newRule.triggerType,
                conditions: JSON.stringify(conditions),
                actions: JSON.stringify(actions),
                isActive: true
            });

            // Refresh rules
            if (onRefresh) onRefresh();

            setNewRule({ triggerType: '', triggerValue: '', actionType: '', actionValue: '', cronExpression: '' });
        } catch (err) {
            console.error("Failed to create rule", err);
        }
    };

    const handleDeleteRule = async (id) => {
        try {
            await deleteRule(id);
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error("Failed to delete rule", err);
        }
    };



    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Regras de Automação</h4>
                <div className="text-xs text-gray-400">Total: {rules.length}</div>
            </div>

            {/* List Rules */}
            <div className="space-y-3">
                {rules.length === 0 && (
                    <div className="text-center py-6 rounded-xl border-2 border-dashed border-gray-100 bg-gray-50/50">
                        <Zap size={24} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-400">Nenhuma regra configurada.</p>
                    </div>
                )}
                {rules.map(rule => (
                    <div key={rule.id} className="p-4 bg-white border border-gray-200 rounded-xl flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <Zap size={18} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                                    <span>Se</span>
                                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs border border-gray-200">
                                        {rule.triggerType === 'CARD_MOVE' ? 'Mover Card' : 'Agendamento'}
                                    </span>
                                    <span>Então</span>
                                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-xs border border-purple-100">
                                        {rule.actionType === 'MOVE_CARD' ? 'Mover para' : 'Atribuir'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => handleDeleteRule(rule.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                            <Trash size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Create Form */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <h5 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Plus size={14} /> Nova Regra
                </h5>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500">Gatilho (Se...)</label>
                            <select
                                className="w-full text-sm border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-100 outline-none"
                                value={newRule.triggerType}
                                onChange={e => setNewRule({ ...newRule, triggerType: e.target.value, triggerValue: '' })}
                            >
                                <option value="">Selecione...</option>
                                <option value="CARD_MOVE">Card for movido</option>
                                <option value="CARD_ROUTINE">Agendamento (Tempo)</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500">Ação (Então...)</label>
                            <select
                                className="w-full text-sm border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-100 outline-none"
                                value={newRule.actionType}
                                onChange={e => setNewRule({ ...newRule, actionType: e.target.value })}
                            >
                                <option value="">Selecione...</option>
                                <option value="ARCHIVE_CARD">Arquivar Card</option>
                                <option value="MOVE_CARD">Mover Card</option>
                                <option value="ASSIGN_USER">Atribuir Membro</option>
                            </select>
                        </div>
                    </div>

                    {/* Dynamic Inputs based on Trigger */}
                    {newRule.triggerType === 'CARD_MOVE' && (
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Para a Coluna</label>
                            <select
                                className="w-full text-sm border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-primary-100 outline-none"
                                value={newRule.triggerValue}
                                onChange={e => setNewRule({ ...newRule, triggerValue: e.target.value })}
                            >
                                <option value="">Qualquer coluna</option>
                                {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="pt-2">
                        <Button
                            type="button"
                            onClick={handleCreateRule}
                            disabled={!newRule.triggerType || !newRule.actionType}
                            className="w-full justify-center"
                        >
                            Criar Automação
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AccessTab = ({ isPrivate, handleTogglePrivacy, members, setShowMemberModal }) => (
    <div className="space-y-8">
        {/* Privacy Card */}
        <div className={`p-6 rounded-xl border-2 transition-all ${isPrivate ? 'border-amber-100 bg-amber-50/50' : 'border-green-100 bg-green-50/50'
            }`}>
            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <div className={`p-3 rounded-xl ${isPrivate ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                        {isPrivate ? <Lock size={24} /> : <Unlock size={24} />}
                    </div>
                    <div>
                        <h4 className={`text-lg font-semibold ${isPrivate ? 'text-amber-900' : 'text-green-900'}`}>
                            {isPrivate ? 'Quadro Privado' : 'Quadro Público'}
                        </h4>
                        <p className={`text-sm mt-1 max-w-md ${isPrivate ? 'text-amber-700' : 'text-green-700'}`}>
                            {isPrivate
                                ? 'Apenas membros adicionados manualmente podem acessar este quadro.'
                                : 'Todos os membros deste projeto podem visualizar e editar este quadro.'}
                        </p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                    <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={handleTogglePrivacy}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
            </div>
        </div>

        {/* Member List */}
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Users size={18} className="text-gray-500" />
                        Membros com Acesso
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{members.length}</span>
                    </h4>
                </div>
                <Button onClick={() => setShowMemberModal(true)} variant="outline" size="sm" className="gap-2">
                    <Plus size={16} /> Gerenciar Membros
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {members.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        Nenhum membro específico adicionado.
                        {isPrivate && <span className="block mt-1 text-amber-600">Adicione membros para que eles possam ver este quadro privado.</span>}
                    </div>
                ) : (
                    members.map(member => (
                        <div key={member.user?.id || Math.random()} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all">
                            <div className="flex items-center gap-3">
                                {member.user?.avatar ? (
                                    <img src={member.user.avatar} alt={member.user.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium ring-2 ring-white shadow-sm">
                                        {(member.user?.name || 'U').slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-gray-900">{member.user?.name || 'Usuário Desconhecido'}</p>
                                    <p className="text-xs text-gray-500">{member.user?.email || ''}</p>
                                </div>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                Membro
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
);

// Placeholder for missing icons
const DatabaseIcon = ({ size, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
);
const Server = DatabaseIcon;

export default BoardSettingsModal;
