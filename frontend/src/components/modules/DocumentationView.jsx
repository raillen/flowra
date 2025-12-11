import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import api from '../../config/api';
import {
    Book,
    Code,
    Search,
    ChevronRight,
    ChevronDown,
    FileText,
    Layers,
    Cloud,
    Puzzle,
    Wrench,
    Rocket,
    Folder,
    CheckSquare,
    Calendar,
    Lock,
    Edit3,
    Save,
    X,
    ExternalLink
} from 'lucide-react';

/**
 * DocumentationView - Documentation module with technical and usage sections
 * Technical docs are admin-only
 */
const DocumentationView = () => {
    const { user } = useApp();
    const isAdmin = user?.role === 'admin';

    const [activeSection, setActiveSection] = useState('usage');
    const [sidebar, setSidebar] = useState(null);
    const [content, setContent] = useState('');
    const [currentPath, setCurrentPath] = useState('getting-started/introduction');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [expandedSections, setExpandedSections] = useState({});

    // Load sidebar when section changes
    useEffect(() => {
        loadSidebar();
    }, [activeSection]);

    // Load content when path changes
    useEffect(() => {
        loadContent();
    }, [activeSection, currentPath]);

    const loadSidebar = async () => {
        try {
            const response = await api.get(`/docs/${activeSection}/sidebar`);
            if (response.data.success) {
                setSidebar(response.data.data);
                // Expand first section by default
                if (response.data.data.sections?.[0]) {
                    setExpandedSections({ [response.data.data.sections[0].title]: true });
                }
            }
        } catch (error) {
            console.error('Failed to load sidebar:', error);
            if (error.response?.status === 403) {
                // Switch to usage if not admin
                setActiveSection('usage');
            }
        }
    };

    const loadContent = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/docs/${activeSection}/${currentPath}`);
            if (response.data.success) {
                setContent(response.data.data.content);
                setEditContent(response.data.data.content);
            }
        } catch (error) {
            console.error('Failed to load content:', error);
            setContent('# Documento não encontrado\n\nO documento solicitado não existe.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await api.get(`/docs/search?q=${encodeURIComponent(query)}`);
            if (response.data.success) {
                setSearchResults(response.data.data);
            }
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const handleSave = async () => {
        try {
            await api.put(`/docs/${activeSection}/${currentPath}`, { content: editContent });
            setContent(editContent);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };

    const toggleSection = (title) => {
        setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const getIcon = (iconName) => {
        const icons = {
            layers: Layers,
            cloud: Cloud,
            puzzle: Puzzle,
            wrench: Wrench,
            rocket: Rocket,
            folder: Folder,
            'check-square': CheckSquare,
            calendar: Calendar,
            'file-text': FileText,
        };
        return icons[iconName] || FileText;
    };

    return (
        <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-50 flex">
            {/* Sidebar */}
            <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
                {/* Header */}
                <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-gradient-to-br from-primary-500 to-indigo-500 rounded-xl text-white">
                            <Book size={20} />
                        </div>
                        <h1 className="text-lg font-bold text-slate-800">Documentação</h1>
                    </div>

                    {/* Section Tabs */}
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveSection('usage')}
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${activeSection === 'usage'
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            📘 Uso
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => setActiveSection('technical')}
                                className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${activeSection === 'technical'
                                        ? 'bg-white text-primary-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <Lock size={12} /> Técnica
                            </button>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-slate-100">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {searchResults.map((result, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setActiveSection(result.section);
                                        setCurrentPath(result.path);
                                        setSearchQuery('');
                                        setSearchResults([]);
                                    }}
                                    className="w-full p-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0"
                                >
                                    <p className="text-sm font-medium text-slate-700 truncate">{result.title}</p>
                                    <p className="text-xs text-slate-400 truncate">{result.snippet}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto p-4">
                    {sidebar?.sections?.map((section) => {
                        const Icon = getIcon(section.icon);
                        const isExpanded = expandedSections[section.title];

                        return (
                            <div key={section.title} className="mb-3">
                                <button
                                    onClick={() => toggleSection(section.title)}
                                    className="w-full flex items-center justify-between p-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon size={16} className="text-slate-400" />
                                        {section.title}
                                    </div>
                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>

                                {isExpanded && (
                                    <div className="ml-6 mt-1 space-y-1">
                                        {section.items.map((item) => (
                                            <button
                                                key={item.path}
                                                onClick={() => setCurrentPath(item.path)}
                                                className={`w-full text-left p-2 text-sm rounded-lg transition-colors ${currentPath === item.path
                                                        ? 'bg-primary-50 text-primary-600 font-medium'
                                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                                    }`}
                                            >
                                                {item.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 max-w-4xl">
                {/* Edit Button (Admin Only) */}
                {isAdmin && !isEditing && (
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <Edit3 size={16} /> Editar
                        </button>
                    </div>
                )}

                {/* Editor Mode */}
                {isEditing ? (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                            <h2 className="font-medium text-slate-700">Editando documento</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    <X size={16} /> Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-1 px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    <Save size={16} /> Salvar
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full h-[600px] p-6 font-mono text-sm text-slate-700 focus:outline-none resize-none"
                            placeholder="Escreva em Markdown..."
                        />
                    </div>
                ) : (
                    /* Render Markdown */
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-primary-600 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100">
                                <MarkdownRenderer content={content} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Simple Markdown Renderer
 * Supports: headings, bold, italic, code, lists, links, tables, blockquotes
 */
const MarkdownRenderer = ({ content }) => {
    const html = useMemo(() => {
        let result = content
            // Escape HTML
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            // Code blocks
            .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Headers
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            // Bold and Italic
            .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            // Horizontal Rules
            .replace(/^---$/gm, '<hr />')
            // Blockquotes
            .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
            // Unordered Lists
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
            // Tables (simple)
            .replace(/\|(.+)\|/g, (match) => {
                const cells = match.split('|').filter(Boolean).map(c => `<td>${c.trim()}</td>`).join('');
                return `<tr>${cells}</tr>`;
            })
            // Wrap tables
            .replace(/(<tr>.*<\/tr>\n?)+/g, '<table>$&</table>')
            // Paragraphs
            .split('\n\n')
            .map(p => {
                if (p.startsWith('<') || p.trim() === '') return p;
                return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
            })
            .join('\n');

        return result;
    }, [content]);

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default DocumentationView;
