import React, { useState, useEffect } from 'react';
import {
    Clock,
    Calendar,
    Target,
    User,
    Users,
    Eye,
    Flag,
    Link,
    DollarSign,
    Palette,
    Hash,
    CheckSquare,
    AlertTriangle,
    GitFork,
    Type,
    List,
    Check,
    Layout,
    Bug,
    Zap,
    Bookmark,
    Star,
    GitBranch,
    Briefcase,
    Plus,
    Trash,
    X,
    MoreHorizontal
} from 'lucide-react';
import { fieldLabels } from '../../../services/boardConfigService';
import { ICON_MAP } from '../../../utils/iconLibrary';

/**
 * Extended Card Fields Component
 * Displays and edits dynamic card fields based on board configuration
 */
const ExtendedCardFields = ({
    card = {},
    enabledFields = {},
    customFieldDefinitions = [],
    customFieldsData = {},
    onChange,
    onCustomFieldChange,
    isEditing = false,
    availableUsers = [],
    availableCards = [],
    placement = 'all' // 'main', 'sidebar', 'all'
}) => {
    // Helper to check if field is enabled
    const isEnabled = (fieldName) => enabledFields[fieldName]?.enabled ?? false;

    // Helper to check if field should be rendered in current placement
    const shouldRender = (fieldName, type = 'standard') => {
        if (!isEnabled(fieldName)) return false;

        // Categorize fields
        const sidebarFields = [
            'type', 'status', 'priority', 'startDate', 'dueDate',
            'completedAt', 'estimatedHours', 'actualHours', 'progress',
            'budget', 'billable', 'storyPoints', 'color', 'projectPhase'
        ];

        const mainFields = ['externalUrl', 'checklist'];

        if (placement === 'all') return true;
        if (placement === 'sidebar') return sidebarFields.includes(fieldName);
        if (placement === 'main') return mainFields.includes(fieldName) || type === 'custom'; // Custom fields usually in main

        return true;
    };

    const handleChange = (field, value) => {
        if (onChange) {
            onChange({ [field]: value });
        }
    };

    const handleCustomChange = (id, value) => {
        if (onCustomFieldChange) {
            onCustomFieldChange(id, value);
        }
    };

    // --- Checklist Logic ---
    const [checklistItems, setChecklistItems] = useState([]);
    const [newItemText, setNewItemText] = useState('');

    useEffect(() => {
        if (card.checklist) {
            try {
                setChecklistItems(JSON.parse(card.checklist));
            } catch (e) {
                setChecklistItems([]);
            }
        } else {
            setChecklistItems([]);
        }
    }, [card.checklist]);

    const updateChecklist = (newItems) => {
        setChecklistItems(newItems);

        // Calculate Progress
        const total = newItems.length;
        const done = newItems.filter(i => i.done).length;
        const newProgress = total === 0 ? 0 : Math.round((done / total) * 100);

        if (onChange) {
            onChange({
                checklist: JSON.stringify(newItems),
                progress: newProgress
            });
        }
    };

    const addChecklistItem = () => {
        if (!newItemText.trim()) return;
        const newItem = { id: crypto.randomUUID(), text: newItemText, done: false };
        updateChecklist([...checklistItems, newItem]);
        setNewItemText('');
    };

    const toggleChecklistItem = (id) => {
        const newItems = checklistItems.map(item =>
            item.id === id ? { ...item, done: !item.done } : item
        );
        updateChecklist(newItems);
    };

    const removeChecklistItem = (id) => {
        const newItems = checklistItems.filter(item => item.id !== id);
        updateChecklist(newItems);
    };


    // Format date for input
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Use configured options or falls back to defaults
    const typeOptions = enabledFields.type?.options || [
        { value: 'tarefa', label: 'Tarefa', icon: 'layout' },
        { value: 'bug', label: 'Bug', icon: 'bug' },
        { value: 'feature', label: 'Feature', icon: 'star' },
        { value: 'melhoria', label: 'Melhoria', icon: 'zap' },
        { value: 'reuniao', label: 'Reunião', icon: 'calendar' },
    ];

    const statusOptions = enabledFields.status?.options || [
        { value: 'novo', label: 'Novo', color: 'bg-slate-100 text-slate-700' },
        { value: 'em_progresso', label: 'Em Progresso', color: 'bg-blue-100 text-blue-700' },
        { value: 'bloqueado', label: 'Bloqueado', color: 'bg-red-100 text-red-700' },
        { value: 'concluido', label: 'Concluído', color: 'bg-green-100 text-green-700' },
    ];

    const priorityOptions = enabledFields.priority?.options || [
        { value: 'baixa', label: 'Baixa' },
        { value: 'media', label: 'Média' },
        { value: 'alta', label: 'Alta' },
    ];

    // Helper to render icon (either Lucide component or emoji string)
    const renderIcon = (iconNameOrChar, size = 12) => {
        if (!iconNameOrChar) return <Layout size={size} />;

        const IconComponent = ICON_MAP[iconNameOrChar];
        if (IconComponent) {
            return <IconComponent size={size} />;
        }
        // Fallback for emojis or unknown icons
        return <span>{iconNameOrChar}</span>;
    };

    const renderCustomField = (def) => {
        if (!shouldRender('customFields', 'custom')) return null;

        const value = customFieldsData?.[def.id] !== undefined ? customFieldsData[def.id] : '';

        switch (def.type) {
            case 'text':
                return (
                    <div key={def.id} className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Type size={12} /> {def.name}
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => handleCustomChange(def.id, e.target.value)}
                                className="w-full p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white"
                                placeholder={def.name}
                            />
                        ) : (
                            <p className="text-sm text-slate-700">{value || '-'}</p>
                        )}
                    </div>
                );
            case 'number':
                return (
                    <div key={def.id} className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Hash size={12} /> {def.name}
                        </label>
                        {isEditing ? (
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => handleCustomChange(def.id, e.target.value)}
                                className="w-full p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white"
                                placeholder="0"
                            />
                        ) : (
                            <p className="text-sm text-slate-700">{value || '-'}</p>
                        )}
                    </div>
                );
            case 'date':
                return (
                    <div key={def.id} className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Calendar size={12} /> {def.name}
                        </label>
                        {isEditing ? (
                            <input
                                type="date"
                                value={formatDateForInput(value)}
                                onChange={(e) => handleCustomChange(def.id, e.target.value)}
                                className="w-full p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white"
                            />
                        ) : (
                            <p className="text-sm text-slate-700">
                                {value ? new Date(value).toLocaleDateString('pt-BR') : '-'}
                            </p>
                        )}
                    </div>
                );
            case 'boolean':
            case 'checkbox':
                return (
                    <div key={def.id} className="flex items-center gap-2 pt-6">
                        {isEditing ? (
                            <input
                                type="checkbox"
                                checked={!!value}
                                onChange={(e) => handleCustomChange(def.id, e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                        ) : (
                            <div className={`h-4 w-4 rounded border flex items-center justify-center ${value ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`}>
                                {value && <Check size={10} className="text-white" />}
                            </div>
                        )}
                        <label className="text-sm font-medium text-slate-700">
                            {def.name}
                        </label>
                    </div>
                );
            case 'select':
                return (
                    <div key={def.id} className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <List size={12} /> {def.name}
                        </label>
                        {isEditing ? (
                            <select
                                value={value}
                                onChange={(e) => handleCustomChange(def.id, e.target.value)}
                                className="w-full p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white"
                            >
                                <option value="">Selecione...</option>
                                {def.options?.map((opt, idx) => (
                                    <option key={idx} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700">
                                {value || '-'}
                            </span>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    const renderField = (fieldName, fieldConfig) => {
        if (!shouldRender(fieldName)) return null;

        switch (fieldName) {
            // CHECKLIST (Main)
            case 'checklist':
                return (
                    <div key={fieldName} className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <CheckSquare size={16} className="text-primary-600" />
                                {fieldLabels[fieldName]}
                            </label>
                            {checklistItems.length > 0 && (
                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {Math.round((checklistItems.filter(i => i.done).length / checklistItems.length) * 100)}%
                                </span>
                            )}
                        </div>

                        {/* Progress Bar (Visual only for list) */}
                        {checklistItems.length > 0 && (
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all duration-500 ease-out"
                                    style={{ width: `${Math.round((checklistItems.filter(i => i.done).length / checklistItems.length) * 100)}%` }}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            {checklistItems.map(item => (
                                <div key={item.id} className="group flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={item.done}
                                        onChange={() => toggleChecklistItem(item.id)}
                                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                                    />
                                    <span className={`flex-1 text-sm ${item.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                        {item.text}
                                    </span>
                                    <button
                                        onClick={() => removeChecklistItem(item.id)}
                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {isEditing && (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newItemText}
                                    onChange={(e) => setNewItemText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                                    className="flex-1 p-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400"
                                    placeholder="Adicionar item à lista..."
                                />
                                <button
                                    type="button"
                                    onClick={addChecklistItem}
                                    className="p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                );

            case 'type':
                return (
                    <div key={fieldName} className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <GitFork size={12} /> {fieldLabels[fieldName]}
                        </label>
                        {isEditing ? (
                            <select
                                value={card.type || ''}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className="w-full p-2 border rounded-lg text-sm bg-white"
                            >
                                <option value="">Selecione...</option>
                                {typeOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                {(() => {
                                    const opt = typeOptions.find(o => o.value === card.type);
                                    return (
                                        <>
                                            {renderIcon(opt?.icon)}
                                            {opt?.label || card.type || '-'}
                                        </>
                                    );
                                })()}
                            </span>
                        )}
                    </div>
                );

            case 'status':
                return (
                    <div key={fieldName} className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Target size={12} /> {fieldLabels[fieldName]}
                        </label>
                        {isEditing ? (
                            <select
                                value={card.status || 'novo'}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="w-full p-2 border rounded-lg text-sm bg-white"
                            >
                                {statusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusOptions.find(s => s.value === card.status)?.color || 'bg-slate-100 text-slate-700'
                                }`}>
                                {statusOptions.find(s => s.value === card.status)?.label || card.status}
                            </span>
                        )}
                    </div>
                );

            case 'priority':
                return (
                    <div key={fieldName} className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Flag size={12} /> {fieldLabels[fieldName]}
                        </label>
                        {isEditing ? (
                            <select
                                value={card.priority || 'media'}
                                onChange={(e) => handleChange('priority', e.target.value)}
                                className="w-full p-2 border rounded-lg text-sm bg-white"
                            >
                                {priorityOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priorityOptions.find(s => s.value === card.priority)?.color || 'bg-slate-100 text-slate-700'
                                }`}>
                                {priorityOptions.find(s => s.value === card.priority)?.label || card.priority}
                            </span>
                        )}
                    </div>
                );

            case 'startDate':
            case 'completedAt':
            case 'dueDate':
                return (
                    <div key={fieldName} className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Calendar size={12} /> {fieldLabels[fieldName] || fieldName}
                        </label>
                        {isEditing ? (
                            <input
                                type="date"
                                value={formatDateForInput(card[fieldName])}
                                onChange={(e) => handleChange(fieldName, e.target.value)}
                                className="w-full p-2 border rounded-lg text-sm bg-white"
                            />
                        ) : (
                            <p className="text-sm text-slate-700">
                                {card[fieldName] ? new Date(card[fieldName]).toLocaleDateString('pt-BR') : '-'}
                            </p>
                        )}
                    </div>
                );

            case 'estimatedHours':
            case 'actualHours':
                return (
                    <div key={fieldName} className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Clock size={12} /> {fieldLabels[fieldName]}
                        </label>
                        {isEditing ? (
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={card[fieldName] || ''}
                                onChange={(e) => handleChange(fieldName, e.target.value ? parseFloat(e.target.value) : null)}
                                className="w-full p-2 border rounded-lg text-sm bg-white"
                            />
                        ) : (
                            <p className="text-sm text-slate-700">{card[fieldName] || '-'}h</p>
                        )}
                    </div>
                );

            case 'progress':
                // Depends on Checklist existence
                if (isEnabled('checklist') && checklistItems.length > 0) {
                    return (
                        <div key={fieldName} className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                <Target size={12} /> {fieldLabels[fieldName]} (Auto)
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                        style={{ width: `${card.progress || 0}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-500">{card.progress || 0}%</span>
                            </div>
                        </div>
                    );
                } else if (isEnabled('checklist') && checklistItems.length === 0) {
                    return null; // Hide progress if checklist enabled but empty
                }

                // Fallback Simple Progress Slider
                return (
                    <div key={fieldName} className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Target size={12} /> {fieldLabels[fieldName]}
                        </label>
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={card.progress || 0}
                                    onChange={(e) => handleChange('progress', parseInt(e.target.value))}
                                    className="flex-1"
                                />
                                <span className="text-sm w-12 text-right">{card.progress || 0}%</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${card.progress || 0}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-500">{card.progress || 0}%</span>
                            </div>
                        )}
                    </div>
                );

            case 'projectPhase':
                return (
                    <div key={fieldName} className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Flag size={12} /> {fieldLabels[fieldName]}
                        </label>
                        {isEditing ? (
                            <select
                                value={card.projectPhase || ''}
                                onChange={(e) => handleChange('projectPhase', e.target.value)}
                                className="w-full p-2 border rounded-lg text-sm bg-white"
                            >
                                <option value="">Selecione...</option>
                                <option value="discovery">Discovery</option>
                                <option value="design">Design</option>
                                <option value="development">Development</option>
                                <option value="testing">Testing</option>
                                <option value="deployment">Deployment</option>
                            </select>
                        ) : (
                            <p className="text-sm text-slate-700">{card.projectPhase || '-'}</p>
                        )}
                    </div>
                );
            case 'budget':
                return (
                    <div key={fieldName} className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <DollarSign size={12} /> {fieldLabels[fieldName]}
                        </label>
                        {isEditing ? (
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={card.budget || ''}
                                    onChange={(e) => handleChange('budget', e.target.value ? parseFloat(e.target.value) : null)}
                                    className="w-full p-2 pl-8 border rounded-lg text-sm bg-white"
                                />
                            </div>
                        ) : (
                            <p className="text-sm text-slate-700">
                                {card.budget ? `R$ ${card.budget.toFixed(2)}` : '-'}
                            </p>
                        )}
                    </div>
                );
            case 'billable':
                return (
                    <div key={fieldName} className="flex items-center gap-2 pt-6">
                        {isEditing ? (
                            <input
                                type="checkbox"
                                checked={!!card.billable}
                                onChange={(e) => handleChange('billable', e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                        ) : (
                            <div className={`h-4 w-4 rounded border flex items-center justify-center ${card.billable ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`}>
                                {card.billable && <CheckSquare size={10} className="text-white" />}
                            </div>
                        )}
                        <label className="text-sm font-medium text-slate-700">
                            {fieldLabels[fieldName]}
                        </label>
                    </div>
                );
            case 'storyPoints':
                return (
                    <div key={fieldName} className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Hash size={12} /> {fieldLabels[fieldName]}
                        </label>
                        {isEditing ? (
                            <input
                                type="number"
                                min="0"
                                value={card.storyPoints || ''}
                                onChange={(e) => handleChange('storyPoints', e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full p-2 border rounded-lg text-sm bg-white"
                            />
                        ) : (
                            <p className="text-sm text-slate-700">{card.storyPoints || '-'}</p>
                        )}
                    </div>
                );
            case 'externalUrl':
                return (
                    <div key={fieldName} className="space-y-1 col-span-2">
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Link size={12} /> {fieldLabels[fieldName]}
                        </label>
                        {isEditing ? (
                            <input
                                type="url"
                                value={card.externalUrl || ''}
                                onChange={(e) => handleChange('externalUrl', e.target.value)}
                                className="w-full p-2 border rounded-lg text-sm bg-white"
                                placeholder="https://"
                            />
                        ) : (
                            card.externalUrl ? (
                                <a href={card.externalUrl} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                                    {card.externalUrl} <Link size={10} />
                                </a>
                            ) : <p className="text-sm text-slate-400">-</p>
                        )}
                    </div>
                );
            case 'color':
                return (
                    <div key={fieldName} className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Palette size={12} /> {fieldLabels[fieldName]}
                        </label>
                        {isEditing ? (
                            <input
                                type="color"
                                value={card.color || '#ffffff'}
                                onChange={(e) => handleChange('color', e.target.value)}
                                className="h-9 w-full rounded cursor-pointer"
                            />
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded border shadow-sm" style={{ backgroundColor: card.color || '#fff' }} />
                                <span className="text-xs text-slate-500">{card.color}</span>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            <div className={`grid gap-4 ${placement === 'sidebar' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                {/* Render Filtered Fields */}
                {Object.keys(enabledFields).map(key => renderField(key, enabledFields[key]))}

                {/* Custom Fields - Only in Main Placement */}
                {(placement === 'main' || placement === 'all') && isEnabled('customFields') && customFieldDefinitions.map(def => renderCustomField(def))}
            </div>
        </div>
    );
};

export default ExtendedCardFields;
