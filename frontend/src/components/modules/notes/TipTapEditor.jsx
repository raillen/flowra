
import React, { useEffect } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Mention from '@tiptap/extension-mention';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling

import {
    Bold, Italic, List, ListOrdered, CheckSquare, Image as ImageIcon,
    Youtube as YoutubeIcon, Type, Quote, Undo, Redo, Code
} from 'lucide-react';
import ResizableImage from './ResizableImage';
import ResizableVideo from './ResizableVideo';
import MentionList from './MentionList';
import api from '../../../config/api'; // Corrected path

// Extend Image to support resizing
const CustomImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
            },
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(ResizableImage);
    },
});

// Extend Youtube to support resizing
const CustomYoutube = Youtube.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: 480,
            },
            height: {
                default: 320,
            },
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(ResizableVideo);
    },
});

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = window.prompt('URL da imagem:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addYoutube = () => {
        const url = window.prompt('URL do vídeo do YouTube:');
        if (url) {
            editor.commands.setYoutubeVideo({ src: url });
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-slate-700 text-indigo-600' : 'text-gray-600 dark:text-gray-400'}`}
                title="Negrito"
            >
                <Bold size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-slate-700 text-indigo-600' : 'text-gray-600 dark:text-gray-400'}`}
                title="Itálico"
            >
                <Italic size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${editor.isActive('strike') ? 'bg-gray-200 dark:bg-slate-700 text-indigo-600' : 'text-gray-600 dark:text-gray-400'}`}
                title="Tachado"
            >
                <span className="line-through font-bold text-xs px-0.5">S</span>
            </button>

            <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-1" />

            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-slate-700 text-indigo-600' : 'text-gray-600 dark:text-gray-400'}`}
                title="Título 1"
            >
                <Type size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-slate-700 text-indigo-600' : 'text-gray-600 dark:text-gray-400'}`}
                title="Lista com marcadores"
            >
                <List size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-slate-700 text-indigo-600' : 'text-gray-600 dark:text-gray-400'}`}
                title="Lista numerada"
            >
                <ListOrdered size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${editor.isActive('taskList') ? 'bg-gray-200 dark:bg-slate-700 text-indigo-600' : 'text-gray-600 dark:text-gray-400'}`}
                title="Lista de tarefas"
            >
                <CheckSquare size={16} />
            </button>

            <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-1" />

            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-slate-700 text-indigo-600' : 'text-gray-600 dark:text-gray-400'}`}
                title="Citação"
            >
                <Quote size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${editor.isActive('codeBlock') ? 'bg-gray-200 dark:bg-slate-700 text-indigo-600' : 'text-gray-600 dark:text-gray-400'}`}
                title="Bloco de código"
            >
                <Code size={16} />
            </button>

            <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-1" />

            <button
                onClick={addImage}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-600 dark:text-gray-400"
                title="Imagem"
            >
                <ImageIcon size={16} />
            </button>
            <button
                onClick={addYoutube}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-600 dark:text-gray-400"
                title="Vídeo do YouTube"
            >
                <YoutubeIcon size={16} />
            </button>

            <div className="flex-1" />

            <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-400 disabled:opacity-30"
                title="Desfazer"
            >
                <Undo size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-400 disabled:opacity-30"
                title="Refazer"
            >
                <Redo size={16} />
            </button>
        </div>
    );
};

export default function TipTapEditor({ content, onChange, editable = true, placeholder = 'Comece a escrever...' }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder: placeholder,
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:pointer-events-none before:h-0',
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            CustomImage.configure({
                inline: true,
                allowBase64: true,
            }),
            CustomYoutube.configure({
                width: 480,
                height: 320,
            }),
            Mention.configure({
                HTMLAttributes: {
                    class: 'mention text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 px-1 rounded mx-0.5 font-medium',
                },
                suggestion: {
                    items: async ({ query }) => {
                        if (query.length === 0) return [];

                        try {
                            // Parallel fetch for all entity types
                            const [usersRes, projectsRes, boardsRes, cardsRes] = await Promise.all([
                                api.get('/auth/users', { params: { q: query } }).catch(() => ({ data: { data: [] } })),
                                api.get('/projects', { params: { search: query } }).catch(() => ({ data: { data: [] } })),
                                api.get('/boards', { params: { search: query } }).catch(() => ({ data: { data: [] } })),
                                api.get('/cards', { params: { search: query } }).catch(() => ({ data: { data: [] } }))
                            ]);

                            const users = (usersRes.data.data || []).map(u => ({ id: u.id, label: u.name, type: 'user' }));
                            const projects = (projectsRes.data.data || []).map(p => ({ id: p.id, label: p.name, type: 'project' }));
                            const boards = (boardsRes.data.data || []).map(b => ({ id: b.id, label: b.title || b.name, type: 'board' }));
                            const cards = (cardsRes.data.data || []).map(c => ({ id: c.id, label: c.title, type: 'card' }));

                            // Interleave or just concat? Concat is easier for now.
                            return [...users, ...projects, ...boards, ...cards].slice(0, 10);
                        } catch (e) {
                            console.error("Mention search error", e);
                            return [];
                        }
                    },
                    render: () => {
                        let component;
                        let popup;

                        return {
                            onStart: props => {
                                component = new ReactRenderer(MentionList, {
                                    props,
                                    editor: props.editor,
                                });

                                popup = tippy('body', {
                                    getReferenceClientRect: props.clientRect,
                                    appendTo: () => document.body,
                                    content: component.element,
                                    showOnCreate: true,
                                    interactive: true,
                                    trigger: 'manual',
                                    placement: 'bottom-start',
                                });
                            },
                            onUpdate(props) {
                                component.updateProps(props);

                                if (!props.clientRect) {
                                    return;
                                }

                                popup.setProps({
                                    getReferenceClientRect: props.clientRect,
                                });
                            },
                            onKeyDown(props) {
                                if (props.event.key === 'Escape') {
                                    popup.hide();
                                    return true;
                                }

                                return component.ref?.onKeyDown(props);
                            },
                            onExit() {
                                popup.destroy();
                                component.destroy();
                            },
                        };
                    },
                },
            }),
        ],
        content: content,
        editable: editable,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[300px] p-6',
            },
        },
    });

    // Sync content if it changes externally (only when not focused to avoid cursor jumps, ideally)
    // For this simple version, we'll assume content prop updates only on load/selection change
    // Sync content when prop changes
    useEffect(() => {
        if (editor && content !== undefined) {
            // Check if content is different to avoid cursor jumps/re-renders loops
            // For HTML content, it's tricky, but getting current HTML and comparing is standard.
            const currentContent = editor.getHTML();
            if (currentContent !== content) {
                // Save cursor position if possible? No, hard to map.
                // Just set content. If user is typing and background update happens, this might be bad.
                // But this is primarily for switching notes.
                // To avoid overwriting user typing, we could check if editor is focused?
                // But for "loading existing note", we definitely want to set it.
                // If we assume parent handles "loading state", we can set it.
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    // Sync editable state
    useEffect(() => {
        if (editor) {
            editor.setEditable(editable);
        }
    }, [editable, editor]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            {editable && <MenuBar editor={editor} />}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <EditorContent editor={editor} className="h-full" />
            </div>
        </div>
    );
}
