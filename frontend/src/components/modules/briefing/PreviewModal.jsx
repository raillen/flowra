/**
 * Preview Modal Component
 * Shows the form as users will see it when filling out
 * 
 * @module briefing/PreviewModal
 */

import React, { useState } from 'react';
import { X, Monitor, Smartphone, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import BriefingRenderer from './BriefingRenderer';

export default function PreviewModal({
    isOpen,
    onClose,
    template,
    fields = []
}) {
    const [viewMode, setViewMode] = useState('desktop'); // desktop | mobile
    const [currentSection, setCurrentSection] = useState(0);

    if (!isOpen) return null;

    // Group fields by section
    const sections = [];
    let currentFields = [];

    fields.forEach(field => {
        if (field.type === 'section') {
            if (currentFields.length > 0) {
                sections.push({ type: 'fields', fields: currentFields });
            }
            sections.push({ type: 'section', ...field });
            currentFields = [];
        } else {
            currentFields.push(field);
        }
    });

    if (currentFields.length > 0) {
        sections.push({ type: 'fields', fields: currentFields });
    }

    // If no sections defined, treat all as one section
    if (sections.length === 0 && fields.length > 0) {
        sections.push({ type: 'fields', fields: fields });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Eye size={20} className="text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">Preview do Formulário</h2>
                            <p className="text-xs text-gray-500">
                                Assim que os usuários verão
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('desktop')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${viewMode === 'desktop'
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Monitor size={16} />
                                Desktop
                            </button>
                            <button
                                onClick={() => setViewMode('mobile')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${viewMode === 'mobile'
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Smartphone size={16} />
                                Mobile
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Preview Content */}
                <div className="flex-1 overflow-auto bg-gradient-to-b from-gray-100 to-gray-200 p-8">
                    <div
                        className={`mx-auto transition-all duration-300 ${viewMode === 'mobile'
                                ? 'max-w-sm'
                                : 'max-w-2xl'
                            }`}
                    >
                        {/* Device Frame for Mobile */}
                        {viewMode === 'mobile' && (
                            <div className="relative">
                                {/* Phone Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-10" />
                            </div>
                        )}

                        {/* Form Container */}
                        <div
                            className={`bg-white shadow-xl overflow-hidden ${viewMode === 'mobile'
                                    ? 'rounded-[2.5rem] border-8 border-gray-800 pt-8'
                                    : 'rounded-xl border border-gray-200'
                                }`}
                        >
                            {/* Form Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                                <h1 className={`font-bold ${viewMode === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                                    {template?.name || 'Formulário'}
                                </h1>
                                {template?.description && (
                                    <p className="text-white/80 text-sm mt-2">
                                        {template.description}
                                    </p>
                                )}
                            </div>

                            {/* Form Fields */}
                            <div className={`p-6 ${viewMode === 'mobile' ? 'px-4' : ''}`}>
                                {fields.length > 0 ? (
                                    <BriefingRenderer
                                        template={{ fields: JSON.stringify(fields) }}
                                        readOnly={false}
                                        onSubmit={(data) => {
                                            console.log('Preview submit:', data);
                                            alert('Preview: Dados seriam enviados:\n' + JSON.stringify(data, null, 2));
                                        }}
                                    />
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <p>Adicione campos ao formulário para ver o preview</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Home Indicator for Mobile */}
                        {viewMode === 'mobile' && (
                            <div className="flex justify-center mt-2">
                                <div className="w-32 h-1 bg-gray-400 rounded-full" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
                    <p className="text-sm text-gray-500">
                        {fields.length} campo{fields.length !== 1 ? 's' : ''} no formulário
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Fechar Preview
                    </button>
                </div>
            </div>
        </div>
    );
}
