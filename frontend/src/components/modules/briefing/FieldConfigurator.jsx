/**
 * Field Configurator Component
 * Advanced settings panel for each field type
 * 
 * @module briefing/FieldConfigurator
 */

import React, { useState } from 'react';
import {
    X, Trash2, Copy, Settings, Eye, EyeOff,
    Plus, GripVertical, ChevronDown, ChevronRight
} from 'lucide-react';
import { FIELD_TYPES } from './FieldTypes';

// Tab configuration
const TABS = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'validation', label: 'Validação', icon: Eye },
    { id: 'logic', label: 'Lógica', icon: ChevronRight },
];

export default function FieldConfigurator({
    field,
    allFields = [],
    onChange,
    onDelete,
    onDuplicate,
    onClose
}) {
    const [activeTab, setActiveTab] = useState('general');
    const fieldType = FIELD_TYPES[field.type];

    const updateField = (updates) => {
        onChange({ ...field, ...updates });
    };

    // Render option editor for select/checkbox/radio fields
    const renderOptionsEditor = () => {
        if (!fieldType?.hasOptions) return null;

        const options = field.options || [];

        return (
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    Opções
                </label>
                <div className="space-y-2">
                    {options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2 group">
                            <GripVertical size={14} className="text-gray-300 cursor-move" />
                            <input
                                type="text"
                                value={typeof opt === 'object' ? opt.label : opt}
                                onChange={(e) => {
                                    const newOpts = [...options];
                                    newOpts[idx] = typeof opt === 'object'
                                        ? { ...opt, label: e.target.value }
                                        : e.target.value;
                                    updateField({ options: newOpts });
                                }}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder={`Opção ${idx + 1}`}
                            />
                            <button
                                onClick={() => {
                                    const newOpts = options.filter((_, i) => i !== idx);
                                    updateField({ options: newOpts });
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => updateField({ options: [...options, `Opção ${options.length + 1}`] })}
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    <Plus size={14} />
                    Adicionar opção
                </button>
            </div>
        );
    };

    // Render general settings
    const renderGeneralTab = () => (
        <div className="space-y-4">
            {/* Label */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título do Campo
                </label>
                <input
                    type="text"
                    value={field.label || ''}
                    onChange={(e) => updateField({ label: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: Nome completo"
                />
            </div>

            {/* Description/Help text */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texto de Ajuda
                </label>
                <input
                    type="text"
                    value={field.helpText || field.description || ''}
                    onChange={(e) => updateField({ helpText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Instruções para o usuário"
                />
            </div>

            {/* Placeholder (for text fields) */}
            {['text', 'textarea', 'email', 'phone', 'url', 'number', 'currency'].includes(field.type) && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Placeholder
                    </label>
                    <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => updateField({ placeholder: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        placeholder="Texto de exemplo"
                    />
                </div>
            )}

            {/* Options editor */}
            {renderOptionsEditor()}

            {/* Required toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                    <span className="text-sm font-medium text-gray-700">Obrigatório</span>
                    <p className="text-xs text-gray-500">Campo deve ser preenchido</p>
                </div>
                <button
                    onClick={() => updateField({ required: !field.required })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${field.required ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                >
                    <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${field.required ? 'left-7' : 'left-1'
                            }`}
                    />
                </button>
            </div>

            {/* Type-specific settings */}
            {renderTypeSpecificSettings()}
        </div>
    );

    // Type-specific settings
    const renderTypeSpecificSettings = () => {
        switch (field.type) {
            case 'textarea':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Linhas visíveis
                        </label>
                        <input
                            type="number"
                            value={field.rows || 4}
                            onChange={(e) => updateField({ rows: parseInt(e.target.value) || 4 })}
                            min={2}
                            max={20}
                            className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                );

            case 'range':
                return (
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Mínimo</label>
                            <input
                                type="number"
                                value={field.min ?? 0}
                                onChange={(e) => updateField({ min: parseInt(e.target.value) })}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Máximo</label>
                            <input
                                type="number"
                                value={field.max ?? 100}
                                onChange={(e) => updateField({ max: parseInt(e.target.value) })}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Passo</label>
                            <input
                                type="number"
                                value={field.step ?? 1}
                                onChange={(e) => updateField({ step: parseInt(e.target.value) || 1 })}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                );

            case 'rating':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Número de estrelas
                        </label>
                        <select
                            value={field.maxStars || 5}
                            onChange={(e) => updateField({ maxStars: parseInt(e.target.value) })}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value={3}>3 estrelas</option>
                            <option value={5}>5 estrelas</option>
                            <option value={10}>10 estrelas</option>
                        </select>
                    </div>
                );

            case 'moodboard':
            case 'file':
                return (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tamanho máximo (MB)
                            </label>
                            <input
                                type="number"
                                value={field.maxSizeMB || 5}
                                onChange={(e) => updateField({ maxSizeMB: parseInt(e.target.value) })}
                                min={1}
                                max={50}
                                className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        {field.type === 'moodboard' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Máximo de arquivos
                                </label>
                                <input
                                    type="number"
                                    value={field.maxFiles || 10}
                                    onChange={(e) => updateField({ maxFiles: parseInt(e.target.value) })}
                                    min={1}
                                    max={50}
                                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        )}
                    </div>
                );

            case 'radio':
            case 'checkbox':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Layout
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => updateField({ layout: 'vertical' })}
                                className={`px-3 py-1.5 text-sm rounded border transition-colors ${(field.layout || 'vertical') === 'vertical'
                                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Vertical
                            </button>
                            <button
                                onClick={() => updateField({ layout: 'horizontal' })}
                                className={`px-3 py-1.5 text-sm rounded border transition-colors ${field.layout === 'horizontal'
                                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Horizontal
                            </button>
                        </div>
                    </div>
                );

            case 'toggle':
                return (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Texto "Sim"</label>
                            <input
                                type="text"
                                value={field.labelOn || 'Sim'}
                                onChange={(e) => updateField({ labelOn: e.target.value })}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Texto "Não"</label>
                            <input
                                type="text"
                                value={field.labelOff || 'Não'}
                                onChange={(e) => updateField({ labelOff: e.target.value })}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Render validation settings
    const renderValidationTab = () => (
        <div className="space-y-4">
            {/* Text length validation */}
            {['text', 'textarea'].includes(field.type) && (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mín. caracteres
                            </label>
                            <input
                                type="number"
                                value={field.minLength || ''}
                                onChange={(e) => updateField({ minLength: e.target.value ? parseInt(e.target.value) : null })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Máx. caracteres
                            </label>
                            <input
                                type="number"
                                value={field.maxLength || ''}
                                onChange={(e) => updateField({ maxLength: e.target.value ? parseInt(e.target.value) : null })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Sem limite"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Padrão (Regex)
                        </label>
                        <input
                            type="text"
                            value={field.pattern || ''}
                            onChange={(e) => updateField({ pattern: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                            placeholder="Ex: ^[A-Za-z]+$"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Expressão regular para validação customizada
                        </p>
                    </div>
                </>
            )}

            {/* Number validation */}
            {['number', 'currency'].includes(field.type) && (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valor mínimo
                        </label>
                        <input
                            type="number"
                            value={field.min ?? ''}
                            onChange={(e) => updateField({ min: e.target.value ? parseFloat(e.target.value) : null })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valor máximo
                        </label>
                        <input
                            type="number"
                            value={field.max ?? ''}
                            onChange={(e) => updateField({ max: e.target.value ? parseFloat(e.target.value) : null })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            )}

            {/* Multi-select validation */}
            {['checkbox', 'multiselect', 'tags'].includes(field.type) && (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mín. seleções
                        </label>
                        <input
                            type="number"
                            value={field.minSelect || ''}
                            onChange={(e) => updateField({ minSelect: e.target.value ? parseInt(e.target.value) : null })}
                            min={0}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Máx. seleções
                        </label>
                        <input
                            type="number"
                            value={field.maxSelect || ''}
                            onChange={(e) => updateField({ maxSelect: e.target.value ? parseInt(e.target.value) : null })}
                            min={1}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            )}

            {/* Date validation */}
            {['date', 'datetime'].includes(field.type) && (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data mínima
                        </label>
                        <input
                            type="date"
                            value={field.minDate || ''}
                            onChange={(e) => updateField({ minDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data máxima
                        </label>
                        <input
                            type="date"
                            value={field.maxDate || ''}
                            onChange={(e) => updateField({ maxDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            )}

            {/* No validation for this field type */}
            {!['text', 'textarea', 'number', 'currency', 'checkbox', 'multiselect', 'tags', 'date', 'datetime'].includes(field.type) && (
                <div className="text-center py-8 text-gray-400">
                    <Eye size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Este tipo de campo não tem validações configuráveis</p>
                </div>
            )}
        </div>
    );

    // Render conditional logic settings
    const renderLogicTab = () => {
        const otherFields = allFields.filter(f => f.id !== field.id && !['section', 'divider', 'description_block'].includes(f.type));

        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mostrar este campo quando
                    </label>

                    {field.visibleIf ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                            <div className="flex items-center gap-2">
                                <select
                                    value={field.visibleIf.field || ''}
                                    onChange={(e) => updateField({
                                        visibleIf: { ...field.visibleIf, field: e.target.value }
                                    })}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Selecione um campo</option>
                                    {otherFields.map(f => (
                                        <option key={f.id} value={f.id}>{f.label}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => updateField({ visibleIf: null })}
                                    className="p-2 text-gray-400 hover:text-red-500"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <select
                                value={field.visibleIf.operator || 'equals'}
                                onChange={(e) => updateField({
                                    visibleIf: { ...field.visibleIf, operator: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="equals">é igual a</option>
                                <option value="not_equals">é diferente de</option>
                                <option value="contains">contém</option>
                                <option value="not_empty">não está vazio</option>
                                <option value="is_empty">está vazio</option>
                            </select>

                            {!['not_empty', 'is_empty'].includes(field.visibleIf.operator) && (
                                <input
                                    type="text"
                                    value={field.visibleIf.value || ''}
                                    onChange={(e) => updateField({
                                        visibleIf: { ...field.visibleIf, value: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Valor esperado"
                                />
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => updateField({
                                visibleIf: { field: '', operator: 'equals', value: '' }
                            })}
                            className="w-full p-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                        >
                            <Plus size={20} className="mx-auto mb-1" />
                            <span className="text-sm">Adicionar condição</span>
                        </button>
                    )}
                </div>

                <p className="text-xs text-gray-500">
                    Campos condicionais só aparecem quando a condição é verdadeira.
                </p>
            </div>
        );
    };

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                    {fieldType && <fieldType.icon size={20} className="text-indigo-600" />}
                    <div>
                        <h3 className="font-semibold text-gray-900">Configurar Campo</h3>
                        <p className="text-xs text-gray-500">{fieldType?.label}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-200 rounded-lg text-gray-500"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'general' && renderGeneralTab()}
                {activeTab === 'validation' && renderValidationTab()}
                {activeTab === 'logic' && renderLogicTab()}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex gap-2">
                    <button
                        onClick={onDuplicate}
                        className="p-2 hover:bg-gray-200 rounded-lg text-gray-500"
                        title="Duplicar"
                    >
                        <Copy size={18} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500"
                        title="Excluir"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                    Concluído
                </button>
            </div>
        </div>
    );
}
