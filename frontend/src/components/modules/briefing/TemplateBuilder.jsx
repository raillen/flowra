import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
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
    Plus, GripVertical, Trash2, Copy, Type as TypeIcon,
    Image, List, AlignLeft, AlignJustify, MoreVertical,
    ToggleLeft, X, Move
} from 'lucide-react';
import DestinationSettings from './DestinationSettings';

// --- Field Configuration ---
const FIELD_TYPES = {
    text: { label: 'Resposta Curta', icon: AlignLeft },
    textarea: { label: 'Parágrafo', icon: AlignJustify },
    select: { label: 'Múltipla Escolha', icon: List },
    moodboard: { label: 'Moodboard', icon: Image },
    section: { label: 'Nova Seção', icon: TypeIcon },
    // description: { label: 'Texto/Descrição', icon: FileText },
};

// --- Sortable Field Card Component ---
function SortableFieldCard({ id, field, isActive, onActivate, onDelete, onDuplicate, onChange }) {
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
        opacity: isDragging ? 0.5 : 1,
    };

    if (field.type === 'section') {
        return (
            <div
                ref={setNodeRef}
                style={style}
                onClick={() => onActivate(id)}
                className={`group relative mb-4 rounded-lg border-l-8 transition-all bg-white shadow-sm ${isActive ? 'border-primary ring-1 ring-primary/20' : 'border-transparent hover:border-gray-200'}`}
            >
                {/* Drag Handle - Center Top for Sections */}
                <div {...attributes} {...listeners} className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10">
                    <GripVertical size={14} className="text-gray-400" />
                </div>

                <div className="p-6 bg-indigo-50/30 rounded-r-lg">
                    {isActive ? (
                        <div className="space-y-3">
                            <input
                                autoFocus
                                type="text"
                                className="w-full text-2xl font-medium bg-transparent border-b border-indigo-200 focus:border-indigo-500 outline-none pb-2 text-indigo-900 placeholder-indigo-300"
                                value={field.label}
                                onChange={(e) => onChange(id, { ...field, label: e.target.value })}
                                placeholder="Título da Seção"
                            />
                            <input
                                type="text"
                                className="w-full text-sm bg-transparent border-b border-transparent focus:border-indigo-300 outline-none pb-1 text-indigo-700 placeholder-indigo-300"
                                value={field.description || ''}
                                onChange={(e) => onChange(id, { ...field, description: e.target.value })}
                                placeholder="Descrição (opcional)"
                            />
                        </div>
                    ) : (
                        <div>
                            <div className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded inline-block mb-2 uppercase tracking-wider">Seção</div>
                            <h3 className="text-xl font-medium text-indigo-900">{field.label}</h3>
                            {field.description && <p className="text-sm text-indigo-700 mt-1">{field.description}</p>}
                        </div>
                    )}
                </div>

                {isActive && (
                    <div className="flex justify-end gap-2 p-2 border-t border-gray-100 bg-gray-50 rounded-br-lg">
                        <button onClick={(e) => { e.stopPropagation(); onDelete(id); }} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 hover:text-red-500" title="Excluir"><Trash2 size={18} /></button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => onActivate(id)}
            className={`group relative bg-white border rounded-lg mb-4 transition-all ${isActive ? 'shadow-lg border-l-4 border-l-blue-500 border-y-gray-200 border-r-gray-200 py-6' : 'shadow-sm border-gray-200 hover:border-gray-300 py-4'}`}
        >
            {/* Centered Drag Handle */}
            <div {...attributes} {...listeners} className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-4 bg-gray-100 border border-t-0 border-gray-300 rounded-b flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200">
                <GripVertical size={12} className="text-gray-400" />
            </div>

            <div className="px-6">
                {isActive ? (
                    /* EDIT MODE */
                    <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="flex gap-4 items-start">
                            <div className="flex-1 space-y-4">
                                <input
                                    type="text"
                                    className="w-full p-4 bg-gray-50 border-b border-gray-300 focus:border-blue-500 outline-none text-base transition-colors"
                                    value={field.label}
                                    onChange={(e) => onChange(id, { ...field, label: e.target.value })}
                                    placeholder="Pergunta"
                                    autoFocus
                                />
                            </div>
                            <div className="w-1/3">
                                <div className="p-3 border border-gray-200 rounded bg-white flex items-center gap-2 text-gray-600">
                                    {React.createElement(FIELD_TYPES[field.type]?.icon || AlignLeft, { size: 18 })}
                                    <span className="text-sm font-medium">{FIELD_TYPES[field.type]?.label}</span>
                                </div>
                            </div>
                        </div>

                        {/* Type Specific Options */}
                        {field.type === 'select' && (
                            <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Opções</label>
                                {field.options?.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-2 group/opt">
                                        <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...field.options];
                                                newOpts[idx] = e.target.value;
                                                onChange(id, { ...field, options: newOpts });
                                            }}
                                            className="flex-1 bg-transparent hover:border-b border-gray-200 focus:border-blue-500 outline-none py-1 text-sm text-gray-700"
                                        />
                                        <button
                                            onClick={() => {
                                                const newOpts = field.options.filter((_, i) => i !== idx);
                                                onChange(id, { ...field, options: newOpts });
                                            }}
                                            className="opacity-0 group-hover/opt:opacity-100 text-gray-400 hover:text-red-500"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => onChange(id, { ...field, options: [...(field.options || []), `Opção ${(field.options?.length || 0) + 1}`] })}
                                    className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 mt-2"
                                >
                                    <Plus size={14} /> Adicionar opção
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 mt-4">
                            <button onClick={(e) => { e.stopPropagation(); onDuplicate(id); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-500" title="Duplicar"><Copy size={18} /></button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(id); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-500" title="Excluir"><Trash2 size={18} /></button>
                            <div className="h-6 w-px bg-gray-200 mx-2"></div>
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                                <span>Obrigatório</span>
                                <div
                                    className={`w-10 h-5 rounded-full relative transition-colors ${field.required ? 'bg-blue-500' : 'bg-gray-300'}`}
                                    onClick={(e) => { e.stopPropagation(); onChange(id, { ...field, required: !field.required }); }}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${field.required ? 'left-6' : 'left-1'}`}></div>
                                </div>
                            </label>
                        </div>
                    </div>
                ) : (
                    /* VIEW MODE */
                    <div className="flex gap-4 py-2">
                        <div className="flex-1">
                            <div className="text-base text-gray-800 mb-2 font-medium">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </div>
                            {field.type === 'text' && <div className="w-1/2 h-9 border-b border-dotted border-gray-300 bg-gray-50/50 rounded px-2 text-xs text-gray-400 flex items-center">Texto de resposta curta</div>}
                            {field.type === 'textarea' && <div className="w-full h-20 border-b border-dotted border-gray-300 bg-gray-50/50 rounded px-2 text-xs text-gray-400 pt-2">Texto de resposta longa</div>}
                            {field.type === 'select' && (
                                <div className="space-y-2">
                                    {field.options?.slice(0, 3).map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                                            <span className="text-sm text-gray-600">{opt}</span>
                                        </div>
                                    ))}
                                    {(field.options?.length || 0) > 3 && <div className="text-xs text-gray-400 pl-6">...mais {(field.options?.length || 0) - 3} opções</div>}
                                </div>
                            )}
                            {field.type === 'moodboard' && (
                                <div className="w-full h-24 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                    <Image size={24} className="mb-2 opacity-50" />
                                    <span className="text-xs">Área de upload de imagens</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Main Builder Component ---
export default function TemplateBuilder({
    fields = [], onChange, description, onDescriptionChange,
    isPublic = false, onIsPublicChange,
    projectId, defaultBoardId, defaultColumnId, onDestinationChange
}) {
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = fields.findIndex((f) => f.id === active.id);
            const newIndex = fields.findIndex((f) => f.id === over.id);
            onChange(arrayMove(fields, oldIndex, newIndex));
        }
    };

    const addField = (type) => {
        const newField = {
            id: crypto.randomUUID(),
            type,
            label: type === 'section' ? 'Nova Seção' : `Nova Pergunta`,
            required: false,
            options: type === 'select' ? ['Opção 1'] : undefined
        };
        const newFields = [...fields, newField];
        onChange(newFields);
        setActiveId(newField.id); // Auto-focus new field

        // Scroll to bottom
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    const updateField = (id, updates) => {
        onChange(fields.map(f => f.id === id ? updates : f));
    };

    const deleteField = (id) => {
        onChange(fields.filter(f => f.id !== id));
        if (activeId === id) setActiveId(null);
    };

    const duplicateField = (id) => {
        const fieldToClone = fields.find(f => f.id === id);
        if (!fieldToClone) return;
        const newField = { ...fieldToClone, id: crypto.randomUUID(), label: fieldToClone.label + ' (Cópia)' };
        const index = fields.findIndex(f => f.id === id);
        const newFields = [...fields];
        newFields.splice(index + 1, 0, newField);
        onChange(newFields);
        setActiveId(newField.id);
    };

    return (
        <div className="flex items-start justify-center gap-6 pb-20 pt-8 relative min-h-full">
            {/* Main Canvas */}
            <div className="w-full max-w-3xl space-y-4 px-4 pb-20">
                {/* Header Card (Title/Desc) */}
                <div className="bg-white border-t-8 border-t-indigo-600 rounded-lg shadow-sm border-x border-b border-gray-200 p-6 mb-6">
                    <div className="flex justify-between items-start mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">Editor de Formulário</h1>

                        {/* Public Toggle */}
                        {onIsPublicChange && (
                            <label className="flex items-center gap-3 cursor-pointer select-none bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">Acesso Público</div>
                                    <div className="text-xs text-gray-500">{isPublic ? 'Qualquer um com o link' : 'Apenas usuários internos'}</div>
                                </div>
                                <div
                                    className={`w-12 h-6 rounded-full relative transition-colors ${isPublic ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onIsPublicChange(!isPublic);
                                    }}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isPublic ? 'left-7' : 'left-1'}`}></div>
                                </div>
                            </label>
                        )}
                    </div>

                    <input
                        type="text"
                        value={description || ''}
                        onChange={(e) => onDescriptionChange && onDescriptionChange(e.target.value)}
                        className="w-full text-base text-gray-600 border-b border-gray-100 focus:border-indigo-500 outline-none py-1 transition-colors"
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

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
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
                                isActive={activeId === field.id}
                                onActivate={setActiveId}
                                onDelete={deleteField}
                                onDuplicate={duplicateField}
                                onChange={updateField}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {fields.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-gray-400">
                        <p>Adicione perguntas usando a barra de ferramentas lateral</p>
                    </div>
                )}
            </div>

            {/* Floating Toolbar */}
            <div className="sticky top-8 bg-white shadow-xl border border-gray-200 rounded-lg p-2 flex flex-col gap-2 transition-all">
                {Object.entries(FIELD_TYPES).map(([type, config]) => (
                    <button
                        key={type}
                        onClick={() => addField(type)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group relative"
                        title={config.label}
                    >
                        <config.icon size={20} />
                        {/* Tooltip */}
                        <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50">
                            {config.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
