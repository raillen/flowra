/**
 * Field Toolbar Component
 * Expandable sidebar with categorized field types
 * 
 * @module briefing/FieldToolbar
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Search, X } from 'lucide-react';
import { FIELD_CATEGORIES, FIELD_TYPES, getFieldsByCategory } from './FieldTypes';

// Category color mapping
const CATEGORY_COLORS = {
    layout: 'indigo',
    text: 'blue',
    number: 'green',
    selection: 'purple',
    multiselect: 'pink',
    datetime: 'orange',
    media: 'cyan',
    workflow: 'yellow',
    advanced: 'slate'
};

const getColorClasses = (color, variant = 'bg') => {
    const colors = {
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', hover: 'hover:bg-indigo-100', border: 'border-indigo-200' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:bg-blue-100', border: 'border-blue-200' },
        green: { bg: 'bg-green-50', text: 'text-green-600', hover: 'hover:bg-green-100', border: 'border-green-200' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', hover: 'hover:bg-purple-100', border: 'border-purple-200' },
        pink: { bg: 'bg-pink-50', text: 'text-pink-600', hover: 'hover:bg-pink-100', border: 'border-pink-200' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', hover: 'hover:bg-orange-100', border: 'border-orange-200' },
        cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', hover: 'hover:bg-cyan-100', border: 'border-cyan-200' },
        yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', hover: 'hover:bg-yellow-100', border: 'border-yellow-200' },
        slate: { bg: 'bg-slate-50', text: 'text-slate-600', hover: 'hover:bg-slate-100', border: 'border-slate-200' }
    };
    return colors[color] || colors.slate;
};

export default function FieldToolbar({ onAddField, isExpanded = true, onToggleExpand }) {
    const [expandedCategories, setExpandedCategories] = useState(['layout', 'text', 'selection']);
    const [searchQuery, setSearchQuery] = useState('');

    const groupedFields = getFieldsByCategory();

    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    // Filter fields by search
    const filterFields = (fields) => {
        if (!searchQuery.trim()) return fields;
        const query = searchQuery.toLowerCase();
        return fields.filter(field =>
            field.label.toLowerCase().includes(query) ||
            field.description.toLowerCase().includes(query)
        );
    };

    // Check if category has matching fields
    const categoryHasMatches = (category) => {
        if (!searchQuery.trim()) return true;
        return filterFields(category.fields).length > 0;
    };

    if (!isExpanded) {
        // Collapsed mode - just icons
        return (
            <div className="sticky top-8 bg-white shadow-lg border border-gray-200 rounded-lg p-2 flex flex-col gap-1 transition-all w-12">
                <button
                    onClick={onToggleExpand}
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Expandir"
                >
                    <Plus size={20} />
                </button>
                <div className="h-px bg-gray-200 my-1" />
                {Object.values(FIELD_CATEGORIES).slice(0, 5).map(category => {
                    const colors = getColorClasses(CATEGORY_COLORS[category.id]);
                    return (
                        <button
                            key={category.id}
                            onClick={() => {
                                onToggleExpand?.();
                                setExpandedCategories([category.id]);
                            }}
                            className={`p-2 rounded-lg transition-colors ${colors.text} ${colors.hover} group relative`}
                            title={category.label}
                        >
                            <category.icon size={18} />
                            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50">
                                {category.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="sticky top-8 bg-white shadow-xl border border-gray-200 rounded-xl overflow-hidden transition-all w-72 max-h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-500 to-purple-600">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <Plus size={18} />
                        Adicionar Campo
                    </h3>
                    {onToggleExpand && (
                        <button
                            onClick={onToggleExpand}
                            className="p-1 rounded hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar campos..."
                        className="w-full pl-9 pr-3 py-2 bg-white/90 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                        >
                            <X size={14} className="text-gray-400" />
                        </button>
                    )}
                </div>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto p-2">
                {Object.values(groupedFields).map(category => {
                    if (!categoryHasMatches(category)) return null;

                    const isOpen = expandedCategories.includes(category.id) || searchQuery.trim();
                    const colors = getColorClasses(CATEGORY_COLORS[category.id]);
                    const filteredFields = filterFields(category.fields);

                    return (
                        <div key={category.id} className="mb-2">
                            {/* Category Header */}
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${colors.hover} ${isOpen ? colors.bg : ''}`}
                            >
                                <category.icon size={16} className={colors.text} />
                                <span className={`flex-1 text-left text-sm font-medium ${isOpen ? colors.text : 'text-gray-700'}`}>
                                    {category.label}
                                </span>
                                <span className="text-xs text-gray-400 mr-1">
                                    {filteredFields.length}
                                </span>
                                {isOpen ? (
                                    <ChevronDown size={16} className="text-gray-400" />
                                ) : (
                                    <ChevronRight size={16} className="text-gray-400" />
                                )}
                            </button>

                            {/* Fields */}
                            {isOpen && (
                                <div className="mt-1 ml-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                    {filteredFields.map(field => (
                                        <button
                                            key={field.type}
                                            onClick={() => onAddField(field.type)}
                                            className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all group
                                                ${colors.border} ${colors.hover} bg-white hover:shadow-sm hover:scale-[1.02]`}
                                        >
                                            <div className={`p-1.5 rounded ${colors.bg}`}>
                                                <field.icon size={16} className={colors.text} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                                                    {field.label}
                                                </div>
                                                <div className="text-xs text-gray-500 line-clamp-1">
                                                    {field.description}
                                                </div>
                                            </div>
                                            <Plus size={14} className="text-gray-300 group-hover:text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* No results */}
                {searchQuery && Object.values(groupedFields).every(cat => !categoryHasMatches(cat)) && (
                    <div className="text-center py-8 text-gray-400">
                        <Search size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum campo encontrado</p>
                    </div>
                )}
            </div>

            {/* Footer hint */}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                    Clique para adicionar ao formulário
                </p>
            </div>
        </div>
    );
}
