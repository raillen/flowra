/**
 * Template Builder Component (Refactored)
 * Main editor for briefing templates with new field system
 * 
 * @module briefing/TemplateBuilder
 */

import React, { useState, useCallback } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    GripVertical, Trash2, Copy, Settings, Eye, EyeOff,
    ChevronDown, ChevronRight, X, Layers, Minus
} from 'lucide-react';

import { FIELD_TYPES, createField as createNewField, getFieldType } from './FieldTypes';
import FieldToolbar from './FieldToolbar';
import FieldConfigurator from './FieldConfigurator';
import DestinationSettings from './DestinationSettings';

// ============================================
// SORTABLE FIELD CARD COMPONENT
// ============================================

function SortableFieldCard({
    id,
    field,
    isActive,
    onActivate,
    onDelete,
    onDuplicate,
    onOpenConfig
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.8 : 1,
    };

    const fieldType = getFieldType(field.type);
    const Icon = fieldType?.icon || Layers;

    // Layout fields (section, divider, description_block)
    if (field.type === 'section') {
        return (
            <div
                ref={setNodeRef}
                style={style}
                onClick={() => onActivate(id)}
                className={`group relative mb-4 rounded-xl transition-all bg-gradient-to-r from-indigo-50 to-purple-50 border-2 ${isActive ? 'border-indigo-400 shadow-lg' : 'border-transparent hover:border-indigo-200'
                    }`}
            >
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                >
                    <GripVertical size={14} className="text-gray-400" />
                </div>

                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Layers size={20} className="text-indigo-600" />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                                Seção
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                {field.label || 'Nova Seção'}
                            </h3>
                            {field.description && (
                                <p className="text-sm text-gray-600 mt-1">{field.description}</p>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); onOpenConfig(id); }}
                                className="p-2 hover:bg-white/70 rounded-lg text-gray-500 hover:text-indigo-600"
                                title="Configurar"
                            >
                                <Settings size={16} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                                className="p-2 hover:bg-white/70 rounded-lg text-gray-500 hover:text-red-500"
                                title="Excluir"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Divider
    if (field.type === 'divider') {
        return (
            <div
                ref={setNodeRef}
                style={style}
                onClick={() => onActivate(id)}
                className={`group relative my-4 py-4 ${isActive ? 'bg-gray-50 rounded-lg' : ''}`}
            >
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 bg-white border border-gray-200 rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <GripVertical size={12} className="text-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-300" />
                    <Minus size={14} className="text-gray-400" />
                    <div className="flex-1 h-px bg-gray-300" />
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X size={14} />
                </button>
            </div>
        );
    }

    // Regular field card
    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => onActivate(id)}
            className={`group relative bg-white border rounded-xl mb-3 transition-all ${isActive
                    ? 'shadow-lg border-indigo-400 ring-2 ring-indigo-100'
                    : 'shadow-sm border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-5 bg-gray-100 border border-gray-200 rounded-b-lg flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
            >
                <GripVertical size={12} className="text-gray-400" />
            </div>

            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Field Type Icon */}
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                        <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-gray-500'} />
                    </div>

                    {/* Field Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 truncate">
                                {field.label || fieldType?.label || 'Campo'}
                            </span>
                            {field.required && (
                                <span className="text-red-500 text-sm">*</span>
                            )}
                            {field.visibleIf && (
                                <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                                    Condicional
                                </span>
                            )}
                        </div>

                        {/* Field Preview */}
                        <div className="text-sm text-gray-500">
                            {renderFieldPreview(field, fieldType)}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onOpenConfig(id); }}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-indigo-600"
                            title="Configurar"
                        >
                            <Settings size={16} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDuplicate(id); }}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                            title="Duplicar"
                        >
                            <Copy size={16} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-500"
                            title="Excluir"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Render field preview based on type
function renderFieldPreview(field, fieldType) {
    switch (field.type) {
        case 'text':
        case 'email':
        case 'phone':
        case 'url':
            return (
                <div className="w-full max-w-sm h-8 border-b border-dashed border-gray-300 flex items-center text-gray-400 text-xs">
                    {field.placeholder || 'Resposta curta'}
                </div>
            );

        case 'textarea':
            return (
                <div className="w-full h-12 border border-dashed border-gray-200 rounded bg-gray-50 p-2 text-gray-400 text-xs">
                    {field.placeholder || 'Resposta longa...'}
                </div>
            );

        case 'select':
        case 'radio':
            return (
                <div className="space-y-1">
                    {(field.options || ['Opção 1', 'Opção 2']).slice(0, 2).map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                            <span className="text-xs text-gray-600">{typeof opt === 'object' ? opt.label : opt}</span>
                        </div>
                    ))}
                    {(field.options?.length || 0) > 2 && (
                        <span className="text-xs text-gray-400">+{field.options.length - 2} mais</span>
                    )}
                </div>
            );

        case 'checkbox':
            return (
                <div className="space-y-1">
                    {(field.options || ['Opção 1', 'Opção 2']).slice(0, 2).map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded border border-gray-300" />
                            <span className="text-xs text-gray-600">{typeof opt === 'object' ? opt.label : opt}</span>
                        </div>
                    ))}
                </div>
            );

        case 'toggle':
            return (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-4 bg-gray-300 rounded-full relative">
                        <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                    </div>
                    <span className="text-xs text-gray-500">{field.labelOff || 'Não'} / {field.labelOn || 'Sim'}</span>
                </div>
            );

        case 'date':
            return <span className="text-xs text-gray-400">📅 Selecionar data</span>;

        case 'time':
            return <span className="text-xs text-gray-400">🕐 Selecionar hora</span>;

        case 'datetime':
            return <span className="text-xs text-gray-400">📅 🕐 Data e hora</span>;

        case 'number':
        case 'currency':
            return (
                <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">
                        {field.type === 'currency' ? 'R$ ' : ''}
                        {field.min ?? 0} - {field.max ?? '∞'}
                    </span>
                </div>
            );

        case 'range':
            return (
                <div className="w-32 h-1.5 bg-gray-200 rounded-full relative">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-500 rounded-full" />
                </div>
            );

        case 'rating':
            return (
                <div className="flex gap-0.5">
                    {[...Array(field.maxStars || 5)].map((_, i) => (
                        <span key={i} className="text-gray-300">★</span>
                    ))}
                </div>
            );

        case 'moodboard':
            return (
                <div className="w-32 h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs bg-gray-50">
                    📷 Upload
                </div>
            );

        case 'file':
            return <span className="text-xs text-gray-400">📎 Anexar arquivo</span>;

        case 'priority':
            return (
                <div className="flex gap-1">
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">Baixa</span>
                    <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">Média</span>
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">Alta</span>
                </div>
            );

        case 'terms':
            return (
                <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded border border-gray-300" />
                    <span className="text-xs text-gray-500">{field.text || 'Aceito os termos'}</span>
                </div>
            );

        default:
            return <span className="text-xs text-gray-400">{fieldType?.description || 'Campo'}</span>;
    }
}

// ============================================
// MAIN TEMPLATE BUILDER COMPONENT
// ============================================

export default function TemplateBuilder({
    fields = [],
    onChange,
    description,
    onDescriptionChange,
    isPublic = false,
    onIsPublicChange,
    projectId,
    defaultBoardId,
    defaultColumnId,
    onDestinationChange
}) {
    const [activeFieldId, setActiveFieldId] = useState(null);
    const [configFieldId, setConfigFieldId] = useState(null);
    const [isToolbarExpanded, setIsToolbarExpanded] = useState(true);
    const [dragActiveId, setDragActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Handlers
    const handleDragStart = (event) => {
        setDragActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setDragActiveId(null);

        if (over && active.id !== over.id) {
            const oldIndex = fields.findIndex((f) => f.id === active.id);
            const newIndex = fields.findIndex((f) => f.id === over.id);
            onChange(arrayMove(fields, oldIndex, newIndex));
        }
    };

    const addField = useCallback((type) => {
        const newField = createNewField(type);
        if (!newField) return;

        onChange([...fields, newField]);
        setActiveFieldId(newField.id);

        // Scroll to new field
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
    }, [fields, onChange]);

    const updateField = useCallback((id, updates) => {
        onChange(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    }, [fields, onChange]);

    const deleteField = useCallback((id) => {
        onChange(fields.filter(f => f.id !== id));
        if (activeFieldId === id) setActiveFieldId(null);
        if (configFieldId === id) setConfigFieldId(null);
    }, [fields, onChange, activeFieldId, configFieldId]);

    const duplicateField = useCallback((id) => {
        const fieldToClone = fields.find(f => f.id === id);
        if (!fieldToClone) return;

        const newField = {
            ...fieldToClone,
            id: crypto.randomUUID(),
            label: fieldToClone.label + ' (Cópia)'
        };

        const index = fields.findIndex(f => f.id === id);
        const newFields = [...fields];
        newFields.splice(index + 1, 0, newField);
        onChange(newFields);
        setActiveFieldId(newField.id);
    }, [fields, onChange]);

    const configField = configFieldId ? fields.find(f => f.id === configFieldId) : null;

    return (
        <div className="flex items-start justify-center gap-6 pb-20 pt-8 relative min-h-full">
            {/* Main Canvas */}
            <div className="w-full max-w-3xl space-y-4 px-4 pb-20">
                {/* Header Card */}
                <div className="bg-white border-t-8 border-t-indigo-600 rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Editor de Formulário</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Arraste os campos para reorganizar
                            </p>
                        </div>

                        {/* Public Toggle */}
                        {onIsPublicChange && (
                            <label className="flex items-center gap-3 cursor-pointer select-none bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">
                                        Acesso Público
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {isPublic ? 'Link compartilhável' : 'Apenas internos'}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onIsPublicChange(!isPublic);
                                    }}
                                    className={`relative w-14 h-7 rounded-full transition-colors ${isPublic ? 'bg-indigo-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${isPublic ? 'left-8' : 'left-1'
                                            }`}
                                    />
                                </button>
                            </label>
                        )}
                    </div>

                    <input
                        type="text"
                        value={description || ''}
                        onChange={(e) => onDescriptionChange?.(e.target.value)}
                        className="w-full text-base text-gray-600 border-b-2 border-gray-100 focus:border-indigo-500 outline-none py-2 transition-colors bg-transparent"
                        placeholder="Descrição do formulário (opcional)"
                    />
                </div>

                {/* Destination Settings */}
                {onDestinationChange && (
                    <DestinationSettings
                        projectId={projectId}
                        boardId={defaultBoardId}
                        columnId={defaultColumnId}
                        onChange={onDestinationChange}
                    />
                )}

                {/* Fields List */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={fields.map(f => f.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {fields.map(field => (
                            <SortableFieldCard
                                key={field.id}
                                id={field.id}
                                field={field}
                                isActive={activeFieldId === field.id}
                                onActivate={setActiveFieldId}
                                onDelete={deleteField}
                                onDuplicate={duplicateField}
                                onOpenConfig={setConfigFieldId}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {/* Empty State */}
                {fields.length === 0 && (
                    <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gradient-to-b from-gray-50 to-white">
                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Layers size={32} className="text-indigo-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Comece a criar seu formulário
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Use a barra lateral para adicionar campos
                        </p>
                        <button
                            onClick={() => addField('section')}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Adicionar primeira seção
                        </button>
                    </div>
                )}

                {/* Field count */}
                {fields.length > 0 && (
                    <div className="text-center text-sm text-gray-400 pt-4">
                        {fields.length} campo{fields.length !== 1 ? 's' : ''} no formulário
                    </div>
                )}
            </div>

            {/* Field Toolbar */}
            <FieldToolbar
                onAddField={addField}
                isExpanded={isToolbarExpanded}
                onToggleExpand={() => setIsToolbarExpanded(!isToolbarExpanded)}
            />

            {/* Field Configurator Slide-over */}
            {configField && (
                <FieldConfigurator
                    field={configField}
                    allFields={fields}
                    onChange={(updates) => updateField(configFieldId, updates)}
                    onDelete={() => {
                        deleteField(configFieldId);
                        setConfigFieldId(null);
                    }}
                    onDuplicate={() => {
                        duplicateField(configFieldId);
                        setConfigFieldId(null);
                    }}
                    onClose={() => setConfigFieldId(null)}
                />
            )}
        </div>
    );
}
