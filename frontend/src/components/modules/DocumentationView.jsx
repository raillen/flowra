import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { useApp } from '../../contexts/AppContext';
import api from '../../config/api';
import {
    Book,
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
    Copy,
    Check,
    GraduationCap
} from 'lucide-react';

/**
 * DocumentationView - Documentation module with technical and usage sections
 * Uses react-markdown for proper Markdown rendering with syntax highlighting
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
        setSidebar(null);
        setCurrentPath(null); // Clear path to prevent 404s with old path
        loadSidebar();
    }, [activeSection]);

    // Load content when path changes
    useEffect(() => {
        loadContent();
    }, [currentPath]);

    const loadSidebar = async () => {
        try {
            const response = await api.get(`/docs/${activeSection}/sidebar`);
            if (response.data.success) {
                setSidebar(response.data.data);
                // Expand first section by default
                if (response.data.data.sections?.[0]) {
                    setExpandedSections({ [response.data.data.sections[0].title]: true });
                    // Auto-select first item of the new section to avoid 404s
                    if (response.data.data.sections[0].items?.[0]) {
                        setCurrentPath(response.data.data.sections[0].items[0].path);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load sidebar:', error);
            if (error.response?.status === 403) {
                setActiveSection('usage');
            }
        }
    };

    const loadContent = async () => {
        if (!currentPath) return; // Don't fetch if no path selected
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
                            <>
                                <button
                                    onClick={() => setActiveSection('technical')}
                                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${activeSection === 'technical'
                                        ? 'bg-white text-primary-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <Lock size={12} /> Técnica
                                </button>
                                <button
                                    onClick={() => setActiveSection('learn')}
                                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${activeSection === 'learn'
                                        ? 'bg-amber-50 text-amber-600 shadow-sm border border-amber-100'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <GraduationCap size={14} /> Aprenda
                                </button>
                            </>
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
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 docs-content">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                                components={{
                                    // Custom code block with copy button
                                    pre: ({ children, ...props }) => (
                                        <div className="relative group">
                                            <CopyButton content={children?.props?.children || ''} />
                                            <pre className="!bg-slate-100 !rounded-xl !p-4 !my-4 overflow-x-auto border border-slate-200" {...props}>
                                                {children}
                                            </pre>
                                        </div>
                                    ),
                                    code: ({ inline, className, children, ...props }) => {
                                        if (inline) {
                                            return (
                                                <code className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded text-sm font-mono" {...props}>
                                                    {children}
                                                </code>
                                            );
                                        }
                                        return <code className={className} {...props}>{children}</code>;
                                    },
                                    // Tables
                                    table: ({ children }) => (
                                        <div className="overflow-x-auto my-4">
                                            <table className="w-full border-collapse border border-slate-200 rounded-lg overflow-hidden">
                                                {children}
                                            </table>
                                        </div>
                                    ),
                                    thead: ({ children }) => (
                                        <thead className="bg-slate-50">{children}</thead>
                                    ),
                                    th: ({ children }) => (
                                        <th className="border border-slate-200 px-4 py-2 text-left text-sm font-semibold text-slate-700">
                                            {children}
                                        </th>
                                    ),
                                    td: ({ children }) => (
                                        <td className="border border-slate-200 px-4 py-2 text-sm text-slate-600">{children}</td>
                                    ),
                                    // Headings
                                    h1: ({ children }) => (
                                        <h1 className="text-3xl font-bold text-slate-800 mb-6 pb-3 border-b border-slate-200">{children}</h1>
                                    ),
                                    h2: ({ children }) => (
                                        <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">{children}</h2>
                                    ),
                                    h3: ({ children }) => (
                                        <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">{children}</h3>
                                    ),
                                    // Paragraphs
                                    p: ({ children }) => (
                                        <p className="text-slate-600 leading-relaxed mb-4">{children}</p>
                                    ),
                                    // Lists
                                    ul: ({ children }) => (
                                        <ul className="list-disc list-inside space-y-2 mb-4 text-slate-600 ml-4">{children}</ul>
                                    ),
                                    ol: ({ children }) => (
                                        <ol className="list-decimal list-inside space-y-2 mb-4 text-slate-600 ml-4">{children}</ol>
                                    ),
                                    li: ({ children }) => (
                                        <li className="text-slate-600">{children}</li>
                                    ),
                                    // Blockquotes
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-4 border-primary-500 pl-4 py-2 my-4 bg-primary-50 rounded-r-lg">
                                            {children}
                                        </blockquote>
                                    ),
                                    // Links
                                    a: ({ children, href }) => (
                                        <a
                                            href={href}
                                            className="text-primary-600 hover:text-primary-700 underline underline-offset-2"
                                            target={href?.startsWith('http') ? '_blank' : undefined}
                                            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                                        >
                                            {children}
                                        </a>
                                    ),
                                    // Horizontal Rule
                                    hr: () => <hr className="my-8 border-slate-200" />,
                                    // Images
                                    img: ({ src, alt }) => (
                                        <img
                                            src={src}
                                            alt={alt}
                                            className="rounded-xl shadow-md border border-slate-200 my-4 max-w-full"
                                        />
                                    ),
                                    // Strong
                                    strong: ({ children }) => (
                                        <strong className="font-semibold text-slate-800">{children}</strong>
                                    ),
                                    // Emphasis
                                    em: ({ children }) => (
                                        <em className="italic text-slate-600">{children}</em>
                                    ),
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Copy button component for code blocks
 */
const CopyButton = ({ content }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copiar código"
        >
            {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
    );
};

export default DocumentationView;
