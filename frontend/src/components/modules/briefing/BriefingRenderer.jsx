/**
 * Briefing Renderer Component (Enhanced)
 * Renders a briefing form for users to fill out
 * Supports all field types from FieldTypes.js
 * 
 * @module briefing/BriefingRenderer
 */

import React, { useState, useEffect } from 'react';
import {
    Star, Check, ChevronDown, X, Plus, Calendar, Clock,
    Upload, Image as ImageIcon, Flag, User, Minus
} from 'lucide-react';
import Moodboard from './Moodboard';
import { validateField, FIELD_TYPES } from './FieldTypes';

export default function BriefingRenderer({
    template,
    initialData = {},
    onSubmit,
    readOnly = false
}) {
    const [formData, setFormData] = useState(initialData || {});
    const [fields, setFields] = useState([]);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (template && template.fields) {
            try {
                const parsed = typeof template.fields === 'string'
                    ? JSON.parse(template.fields)
                    : template.fields;
                setFields(parsed);
            } catch (e) {
                console.error("Invalid fields JSON", e);
                setFields([]);
            }
        }
    }, [template]);

    const handleChange = (fieldId, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }));
        setTouched(prev => ({ ...prev, [fieldId]: true }));

        // Validate on change
        const field = fields.find(f => f.id === fieldId);
        if (field) {
            const fieldErrors = validateField(field, value);
            setErrors(prev => ({
                ...prev,
                [fieldId]: fieldErrors
            }));
        }
    };

    const handleBlur = (fieldId) => {
        setTouched(prev => ({ ...prev, [fieldId]: true }));
    };

    // Check conditional visibility
    const isVisible = (field) => {
        if (!field.visibleIf) return true;

        const { field: depField, operator, value: depValue } = field.visibleIf;
        const actualValue = formData[depField];

        switch (operator) {
            case 'equals':
                return actualValue === depValue;
            case 'not_equals':
                return actualValue !== depValue;
            case 'contains':
                return String(actualValue || '').includes(depValue);
            case 'not_empty':
                return actualValue !== null && actualValue !== undefined && actualValue !== '';
            case 'is_empty':
                return actualValue === null || actualValue === undefined || actualValue === '';
            default:
                return actualValue === depValue;
        }
    };

    const handleSubmit = () => {
        // Validate all fields
        const newErrors = {};
        let hasErrors = false;

        fields.forEach(field => {
            if (isVisible(field) && field.type !== 'section' && field.type !== 'divider') {
                const fieldErrors = validateField(field, formData[field.id]);
                if (fieldErrors.length > 0) {
                    newErrors[field.id] = fieldErrors;
                    hasErrors = true;
                }
            }
        });

        setErrors(newErrors);
        setTouched(fields.reduce((acc, f) => ({ ...acc, [f.id]: true }), {}));

        if (!hasErrors) {
            onSubmit?.(formData);
        }
    };

    // Common input styles
    const inputBaseClass = "w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
    const errorClass = "border-red-300 focus:ring-red-500";

    // Render individual field based on type
    const renderFieldInput = (field) => {
        const value = formData[field.id];
        const fieldErrors = errors[field.id] || [];
        const hasError = touched[field.id] && fieldErrors.length > 0;
        const inputClass = `${inputBaseClass} ${hasError ? errorClass : ''}`;

        switch (field.type) {
            // TEXT FIELDS
            case 'text':
                return (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        onBlur={() => handleBlur(field.id)}
                        placeholder={field.placeholder || 'Sua resposta'}
                        disabled={readOnly}
                        className={inputClass}
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        rows={field.rows || 4}
                        value={value || ''}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        onBlur={() => handleBlur(field.id)}
                        placeholder={field.placeholder || 'Sua resposta'}
                        disabled={readOnly}
                        className={`${inputClass} resize-none`}
                    />
                );

            case 'email':
                return (
                    <input
                        type="email"
                        value={value || ''}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        onBlur={() => handleBlur(field.id)}
                        placeholder={field.placeholder || 'exemplo@email.com'}
                        disabled={readOnly}
                        className={inputClass}
                    />
                );

            case 'phone':
                return (
                    <input
                        type="tel"
                        value={value || ''}
                        onChange={(e) => {
                            // Basic phone mask
                            let v = e.target.value.replace(/\D/g, '');
                            if (v.length > 11) v = v.slice(0, 11);
                            if (v.length > 6) {
                                v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
                            } else if (v.length > 2) {
                                v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
                            } else if (v.length > 0) {
                                v = `(${v}`;
                            }
                            handleChange(field.id, v);
                        }}
                        onBlur={() => handleBlur(field.id)}
                        placeholder={field.placeholder || '(00) 00000-0000'}
                        disabled={readOnly}
                        className={inputClass}
                    />
                );

            case 'url':
                return (
                    <input
                        type="url"
                        value={value || ''}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        onBlur={() => handleBlur(field.id)}
                        placeholder={field.placeholder || 'https://'}
                        disabled={readOnly}
                        className={inputClass}
                    />
                );

            // NUMBER FIELDS
            case 'number':
                return (
                    <input
                        type="number"
                        value={value ?? ''}
                        onChange={(e) => handleChange(field.id, e.target.value ? parseFloat(e.target.value) : null)}
                        onBlur={() => handleBlur(field.id)}
                        min={field.min}
                        max={field.max}
                        step={field.step || 1}
                        placeholder={field.placeholder || '0'}
                        disabled={readOnly}
                        className={inputClass}
                    />
                );

            case 'currency':
                return (
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                        <input
                            type="number"
                            value={value ?? ''}
                            onChange={(e) => handleChange(field.id, e.target.value ? parseFloat(e.target.value) : null)}
                            onBlur={() => handleBlur(field.id)}
                            min={field.min || 0}
                            step={0.01}
                            placeholder="0,00"
                            disabled={readOnly}
                            className={`${inputClass} pl-12`}
                        />
                    </div>
                );

            case 'range':
                return (
                    <div className="space-y-2">
                        <input
                            type="range"
                            value={value ?? field.min ?? 0}
                            onChange={(e) => handleChange(field.id, parseInt(e.target.value))}
                            min={field.min ?? 0}
                            max={field.max ?? 100}
                            step={field.step || 1}
                            disabled={readOnly}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>{field.min ?? 0}</span>
                            <span className="text-indigo-600 font-medium">{value ?? field.min ?? 0}</span>
                            <span>{field.max ?? 100}</span>
                        </div>
                    </div>
                );

            case 'rating':
                const maxStars = field.maxStars || 5;
                return (
                    <div className="flex gap-2">
                        {[...Array(maxStars)].map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => !readOnly && handleChange(field.id, i + 1)}
                                className={`p-1 transition-transform hover:scale-110 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                <Star
                                    size={28}
                                    className={`transition-colors ${(value || 0) > i
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                );

            // SELECTION FIELDS
            case 'select':
                return (
                    <div className="relative">
                        <select
                            value={value || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            onBlur={() => handleBlur(field.id)}
                            disabled={readOnly}
                            className={`${inputClass} appearance-none pr-10`}
                        >
                            <option value="">{field.placeholder || 'Selecione...'}</option>
                            {(field.options || []).map((opt, i) => (
                                <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
                                    {typeof opt === 'object' ? opt.label : opt}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                );

            case 'radio':
                return (
                    <div className={`space-y-3 ${field.layout === 'horizontal' ? 'flex flex-wrap gap-4' : ''}`}>
                        {(field.options || []).map((opt, i) => {
                            const optValue = typeof opt === 'object' ? opt.value : opt;
                            const optLabel = typeof opt === 'object' ? opt.label : opt;
                            return (
                                <label
                                    key={i}
                                    className={`flex items-center gap-3 cursor-pointer group ${field.layout === 'horizontal' ? '' : 'p-3 border rounded-lg hover:bg-gray-50'
                                        } ${value === optValue ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${value === optValue ? 'border-indigo-600' : 'border-gray-300'
                                        }`}>
                                        {value === optValue && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name={field.id}
                                        value={optValue}
                                        checked={value === optValue}
                                        onChange={() => handleChange(field.id, optValue)}
                                        className="hidden"
                                        disabled={readOnly}
                                    />
                                    <span className="text-gray-700">{optLabel}</span>
                                </label>
                            );
                        })}
                    </div>
                );

            case 'toggle':
                return (
                    <div className="flex items-center gap-4">
                        <span className={`text-sm ${!value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                            {field.labelOff || 'Não'}
                        </span>
                        <button
                            type="button"
                            onClick={() => !readOnly && handleChange(field.id, !value)}
                            className={`relative w-14 h-7 rounded-full transition-colors ${value ? 'bg-indigo-600' : 'bg-gray-300'
                                } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? 'left-8' : 'left-1'
                                }`} />
                        </button>
                        <span className={`text-sm ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                            {field.labelOn || 'Sim'}
                        </span>
                    </div>
                );

            case 'checkbox':
                return (
                    <div className={`space-y-2 ${field.layout === 'horizontal' ? 'flex flex-wrap gap-4' : ''}`}>
                        {(field.options || []).map((opt, i) => {
                            const optValue = typeof opt === 'object' ? opt.value : opt;
                            const optLabel = typeof opt === 'object' ? opt.label : opt;
                            const checked = Array.isArray(value) && value.includes(optValue);
                            return (
                                <label
                                    key={i}
                                    className={`flex items-center gap-3 cursor-pointer p-3 border rounded-lg transition-colors hover:bg-gray-50 ${checked ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${checked ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                                        }`}>
                                        {checked && <Check size={12} className="text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => {
                                            const current = Array.isArray(value) ? value : [];
                                            const newValue = checked
                                                ? current.filter(v => v !== optValue)
                                                : [...current, optValue];
                                            handleChange(field.id, newValue);
                                        }}
                                        className="hidden"
                                        disabled={readOnly}
                                    />
                                    <span className="text-gray-700">{optLabel}</span>
                                </label>
                            );
                        })}
                    </div>
                );

            case 'tags':
                const tags = Array.isArray(value) ? value : [];
                return (
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-200 rounded-lg bg-white">
                            {tags.map((tag, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                    {tag}
                                    {!readOnly && (
                                        <button
                                            type="button"
                                            onClick={() => handleChange(field.id, tags.filter((_, j) => j !== i))}
                                            className="hover:text-indigo-900"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </span>
                            ))}
                            {!readOnly && (
                                <input
                                    type="text"
                                    placeholder="Digite e pressione Enter"
                                    className="flex-1 min-w-[120px] outline-none text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                            e.preventDefault();
                                            handleChange(field.id, [...tags, e.target.value.trim()]);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </div>
                );

            // DATE/TIME FIELDS
            case 'date':
                return (
                    <div className="relative">
                        <input
                            type="date"
                            value={value || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            onBlur={() => handleBlur(field.id)}
                            min={field.minDate}
                            max={field.maxDate}
                            disabled={readOnly}
                            className={inputClass}
                        />
                    </div>
                );

            case 'time':
                return (
                    <div className="relative">
                        <input
                            type="time"
                            value={value || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            onBlur={() => handleBlur(field.id)}
                            disabled={readOnly}
                            className={inputClass}
                        />
                    </div>
                );

            case 'datetime':
                return (
                    <div className="relative">
                        <input
                            type="datetime-local"
                            value={value || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            onBlur={() => handleBlur(field.id)}
                            disabled={readOnly}
                            className={inputClass}
                        />
                    </div>
                );

            // MEDIA FIELDS
            case 'moodboard':
                return (
                    <Moodboard
                        images={value || []}
                        onChange={(imgs) => handleChange(field.id, imgs)}
                        readOnly={readOnly}
                        maxFiles={field.maxFiles}
                    />
                );

            case 'file':
                return (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-indigo-300 transition-colors">
                        {value ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-sm text-gray-700">{value.name || 'Arquivo selecionado'}</span>
                                {!readOnly && (
                                    <button
                                        type="button"
                                        onClick={() => handleChange(field.id, null)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <label className="cursor-pointer">
                                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">Clique para fazer upload</p>
                                <p className="text-xs text-gray-400">Máx. {field.maxSizeMB || 10}MB</p>
                                <input
                                    type="file"
                                    onChange={(e) => handleChange(field.id, e.target.files[0])}
                                    className="hidden"
                                    disabled={readOnly}
                                />
                            </label>
                        )}
                    </div>
                );

            case 'color':
                return (
                    <div className="flex items-center gap-4">
                        <input
                            type="color"
                            value={value || '#6366f1'}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            disabled={readOnly}
                            className="w-12 h-12 rounded-lg cursor-pointer border border-gray-200"
                        />
                        <div className="flex gap-2">
                            {(field.presets || ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']).map((color, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => !readOnly && handleChange(field.id, color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${value === color ? 'border-gray-900 scale-110' : 'border-transparent'
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                );

            // WORKFLOW FIELDS
            case 'priority':
                const priorities = field.options || [
                    { value: 'baixa', label: 'Baixa', color: '#22c55e' },
                    { value: 'media', label: 'Média', color: '#eab308' },
                    { value: 'alta', label: 'Alta', color: '#ef4444' },
                    { value: 'urgente', label: 'Urgente', color: '#dc2626' }
                ];
                return (
                    <div className="flex flex-wrap gap-2">
                        {priorities.map((p, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => !readOnly && handleChange(field.id, p.value)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${value === p.value
                                        ? 'border-current shadow-md'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                style={{
                                    color: value === p.value ? p.color : undefined,
                                    backgroundColor: value === p.value ? `${p.color}15` : undefined
                                }}
                            >
                                <Flag size={16} style={{ color: p.color }} />
                                <span className="font-medium">{p.label}</span>
                            </button>
                        ))}
                    </div>
                );

            case 'terms':
                return (
                    <label className="flex items-start gap-3 cursor-pointer">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${value ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                            }`}>
                            {value && <Check size={12} className="text-white" />}
                        </div>
                        <div>
                            <span className="text-gray-700">{field.text || 'Aceito os termos e condições'}</span>
                            {field.linkUrl && (
                                <a
                                    href={field.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-1 text-indigo-600 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {field.linkText || 'Ler termos'}
                                </a>
                            )}
                        </div>
                        <input
                            type="checkbox"
                            checked={value || false}
                            onChange={() => handleChange(field.id, !value)}
                            className="hidden"
                            disabled={readOnly}
                        />
                    </label>
                );

            case 'progress':
                return (
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 transition-all"
                                style={{ width: `${value || 0}%` }}
                            />
                        </div>
                        {field.showPercentage !== false && (
                            <div className="text-center text-sm text-gray-600 font-medium">
                                {value || 0}%
                            </div>
                        )}
                    </div>
                );

            // LAYOUT ELEMENTS (non-input)
            case 'divider':
                return <div className="h-px bg-gray-300 my-4" />;

            case 'description_block':
                return (
                    <div className="prose prose-sm max-w-none text-gray-600">
                        {field.content}
                    </div>
                );

            default:
                return (
                    <div className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg">
                        Campo não suportado: {field.type}
                    </div>
                );
        }
    };

    // Render a field with its wrapper
    const renderField = (field) => {
        if (!isVisible(field)) return null;

        // Section header
        if (field.type === 'section') {
            return (
                <div className="mt-8 mb-4 border-t-8 border-indigo-500 rounded-lg bg-white shadow-sm p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">{field.label}</h2>
                    {(field.description || field.helpText) && (
                        <p className="text-gray-600 text-sm">{field.description || field.helpText}</p>
                    )}
                </div>
            );
        }

        // Divider
        if (field.type === 'divider') {
            return <div className="flex items-center gap-2 my-6">
                <div className="flex-1 h-px bg-gray-300" />
                <Minus size={14} className="text-gray-400" />
                <div className="flex-1 h-px bg-gray-300" />
            </div>;
        }

        // Description block (no input)
        if (field.type === 'description_block') {
            return (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 my-4">
                    <div className="prose prose-sm max-w-none text-blue-800">
                        {field.content || field.label}
                    </div>
                </div>
            );
        }

        const fieldErrors = errors[field.id] || [];
        const hasError = touched[field.id] && fieldErrors.length > 0;

        // Regular field card
        return (
            <div className={`bg-white rounded-xl border shadow-sm p-6 mb-4 transition-all hover:shadow-md ${hasError ? 'border-red-200' : 'border-gray-200'
                }`}>
                <label className="block text-base font-medium text-gray-800 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {(field.helpText || field.description) && (
                    <p className="text-xs text-gray-500 mb-4">{field.helpText || field.description}</p>
                )}

                <div className="mt-2">
                    {renderFieldInput(field)}
                </div>

                {/* Error messages */}
                {hasError && (
                    <div className="mt-2 space-y-1">
                        {fieldErrors.map((err, i) => (
                            <p key={i} className="text-sm text-red-500 flex items-center gap-1">
                                <X size={14} />
                                {err}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4 max-w-3xl mx-auto pb-12">
            {fields.map(field => (
                <div key={field.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {renderField(field)}
                </div>
            ))}

            {!readOnly && fields.length > 0 && (
                <div className="pt-6 flex justify-between items-center">
                    <div />
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                    >
                        <Check size={18} />
                        Enviar
                    </button>
                </div>
            )}
        </div>
    );
}
