import React, { useState, useEffect } from 'react';
import Moodboard from './Moodboard';

export default function BriefingRenderer({ template, initialData = {}, onSubmit, readOnly = false }) {
    const [formData, setFormData] = useState(initialData || {});
    const [fields, setFields] = useState([]);

    useEffect(() => {
        if (template && template.fields) {
            try {
                const parsed = typeof template.fields === 'string' ? JSON.parse(template.fields) : template.fields;
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
    };

    const isVisible = (field) => {
        if (!field.visibleIf) return true;
        const { field: depField, value: depValue } = field.visibleIf;
        return formData[depField] === depValue;
    };

    const renderField = (field) => {
        if (!isVisible(field)) return null;

        // Special rendering for Sections
        if (field.type === 'section') {
            return (
                <div className="mt-8 mb-4 border-t-8 border-indigo-500 rounded-lg bg-white shadow-sm p-6">
                    <h2 className="text-2xl font-medium text-gray-900 mb-2">{field.label}</h2>
                    {field.description && <p className="text-gray-600 text-sm">{field.description}</p>}
                </div>
            );
        }

        const commonProps = {
            disabled: readOnly,
            className: "w-full border-b border-gray-200 focus:border-indigo-500 bg-transparent py-2 outline-none transition-colors placeholder-gray-400"
        };

        // Render standard fields inside a "Card"
        return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-4 transition-all hover:shadow-md">
                <label className="block text-base font-medium text-gray-800 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.description && <p className="text-xs text-gray-500 mb-4">{field.description}</p>}

                <div className="mt-2">
                    {(() => {
                        switch (field.type) {
                            case 'text':
                                return (
                                    <input
                                        type="text"
                                        value={formData[field.id] || ''}
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                        placeholder="Sua resposta"
                                        {...commonProps}
                                    />
                                );
                            case 'textarea':
                                return (
                                    <textarea
                                        rows={2}
                                        value={formData[field.id] || ''}
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                        placeholder="Sua resposta"
                                        className="w-full border-b border-gray-200 focus:border-indigo-500 bg-transparent py-2 outline-none transition-colors placeholder-gray-400 resize-none"
                                    />
                                );
                            case 'select':
                                return (
                                    <div className="space-y-3 pt-2">
                                        {field.options?.map((opt) => (
                                            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${formData[field.id] === opt ? 'border-indigo-600' : 'border-gray-300 group-hover:border-gray-400'}`}>
                                                    {formData[field.id] === opt && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name={field.id}
                                                    value={opt}
                                                    checked={formData[field.id] === opt}
                                                    onChange={() => handleChange(field.id, opt)}
                                                    className="hidden"
                                                    disabled={readOnly}
                                                />
                                                <span className={`text-sm ${formData[field.id] === opt ? 'text-gray-900' : 'text-gray-700'}`}>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                );
                            case 'moodboard':
                                return (
                                    <Moodboard
                                        images={formData[field.id] || []}
                                        onChange={(imgs) => handleChange(field.id, imgs)}
                                        readOnly={readOnly}
                                    />
                                );
                            default:
                                return <p className="text-red-500 text-xs">Tipo de campo desconhecido: {field.type}</p>;
                        }
                    })()}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4 max-w-3xl mx-auto pb-12">

            {/* Form Header (Only if not Section 0, handled by wrapper usually, but adding here as fallback) */}
            {/* If we wanted a top header card, we could put it here, but public view usually handles it. */}

            {fields.map(field => (
                <div key={field.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {renderField(field)}
                </div>
            ))}

            {!readOnly && (
                <div className="pt-6 flex justify-between items-center">
                    {/* Clear form button could go here */}
                    <div></div>
                    <button
                        onClick={() => onSubmit(formData)}
                        className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                        Enviar
                    </button>
                </div>
            )}
        </div>
    );
}
