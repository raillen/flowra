import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, ConfirmationDialog, Badge } from '../../ui';
import {
    Check, X, Calendar, Clock, Target, Flag, User, Link as LinkIcon,
    DollarSign, Hash, MessageSquare, Trash, Archive, ChevronDown,
    AlignLeft, CheckSquare, MoreHorizontal, Paperclip, Activity, Upload,
    Edit2, Trash2, Plus, Smile, Reply, CornerDownRight
} from 'lucide-react';
import { fieldLabels } from '../../../services/boardConfigService';
import { ICON_MAP } from '../../../utils/iconLibrary';
import * as cardService from '../../../services/cardService';
import * as commentService from '../../../services/commentService';
import * as tagService from '../../../services/tagService';
import * as attachmentService from '../../../services/attachmentService';
import * as collaboratorService from '../../../services/collaboratorService';
import api from '../../../config/api';
import { useAuthContext } from '../../../contexts/AuthContext';
import BriefingRenderer from '../briefing/BriefingRenderer';
import { getTemplateById, submitBriefing } from '../../../services/briefingService'; // Create this frontend service next if not exists
import { FileText, Layout } from 'lucide-react';
import UserMultiSelect from '../../ui/UserMultiSelect';

/**
 * CardModal - Professional Unified Card View
 * Enhanced with Mentions, Replies, and Reactions
 */
const CardModal = ({
    isOpen,
    onClose,
    onSave,
    card,
    projectId,
    boardId,
    columns,
    selectedColumnId,
    enabledFields = {},
    customFieldDefinitions = [],
    availableTags = [],
}) => {
    const { user: currentUser } = useAuthContext();
    const [loadingData, setLoadingData] = useState(false);

    // -- Core State --
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [columnId, setColumnId] = useState('');

    // -- Properties State --
    const [priority, setPriority] = useState('media');
    const [type, setType] = useState('tarefa');
    const [status, setStatus] = useState('novo');
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [completedAt, setCompletedAt] = useState('');
    const [estimatedHours, setEstimatedHours] = useState('');
    const [actualHours, setActualHours] = useState('');
    const [progress, setProgress] = useState(0);
    const [storyPoints, setStoryPoints] = useState('');
    const [budget, setBudget] = useState('');
    const [billable, setBillable] = useState(false);
    const [externalUrl, setExternalUrl] = useState('');
    const [projectPhase, setProjectPhase] = useState('');
    const [tags, setTags] = useState([]);

    // -- Briefing State --
    const [activeTab, setActiveTab] = useState('details'); // 'details' | 'briefing'
    const [briefingData, setBriefingData] = useState({});
    const [briefingTemplate, setBriefingTemplate] = useState(null);
    const [templateId, setTemplateId] = useState('');
    const [isBriefingEditing, setIsBriefingEditing] = useState(false);

    // -- Checklist State --
    const [checklist, setChecklist] = useState([]);
    const [newChecklistItem, setNewChecklistItem] = useState('');

    // -- Custom Fields State --
    const [customFieldsData, setCustomFieldsData] = useState({});

    // -- Sub-Entities State --
    const [comments, setComments] = useState([]); // Threaded/Nested
    const [attachments, setAttachments] = useState([]);
    const [projectUsers, setProjectUsers] = useState([]);
    const [selectedAssigneeIds, setSelectedAssigneeIds] = useState([]); // Array of user IDs

    // -- Interactions State (Comments) --
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null); // commentId
    const [mentionSearch, setMentionSearch] = useState('');
    const [showMentionList, setShowMentionList] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const commentInputRef = useRef(null);
    const [showTagSelector, setShowTagSelector] = useState(false);

    // -- Dialogs --
    const [deleteCommentConfirm, setDeleteCommentConfirm] = useState({ isOpen: false, id: null });

    // -- Initialization --
    useEffect(() => {
        if (!isOpen) return;

        if (card) {
            // Edit Mode mapping
            setTitle(card.title || '');
            setDescription(card.description || '');
            setColumnId(card.columnId || '');
            setPriority(card.priority || 'media');
            setType(card.type || 'tarefa');
            setStatus(card.status || 'novo');
            setStartDate(formatDateForInput(card.startDate));
            setDueDate(formatDateForInput(card.dueDate));
            setCompletedAt(formatDateForInput(card.completedAt));
            setEstimatedHours(card.estimatedHours || '');
            setActualHours(card.actualHours || '');
            setProgress(card.progress || 0);
            setStoryPoints(card.storyPoints || '');
            setBudget(card.budget || '');
            setBillable(card.billable || false);
            setExternalUrl(card.externalUrl || '');
            setProjectPhase(card.projectPhase || '');
            setCustomFieldsData(card.customFields || {});

            try { setChecklist(card.checklist ? JSON.parse(card.checklist) : []); } catch { setChecklist([]); }

            if (projectId && boardId) {
                loadSubData();
            }

            // Load Briefing Data
            if (card.briefingData) {
                try {
                    setBriefingData(typeof card.briefingData === 'string' ? JSON.parse(card.briefingData) : card.briefingData);
                } catch (e) { console.error("Error parsing briefing data", e); }
            }
            if (card.briefingTemplateId) {
                setTemplateId(card.briefingTemplateId);
                // Fetch template details
                getTemplateById(card.briefingTemplateId).then(setBriefingTemplate).catch(console.error);
            }
        } else {
            // Create Mode Defaults
            setTitle('');
            setDescription('');
            setColumnId(selectedColumnId || (columns[0]?.id) || '');
            setPriority('media');
            setType('tarefa');
            setStatus('novo');
            setStartDate(new Date().toISOString().split('T')[0]);
            setDueDate('');
            setCompletedAt('');
            setEstimatedHours('');
            setActualHours('');
            setProgress(0);
            setStoryPoints('');
            setBudget('');
            setBillable(false);
            setExternalUrl('');
            setProjectPhase('');
            setChecklist([]);
            setCustomFieldsData({});
            setComments([]);
            setAttachments([]);
            setTags([]);
            setProjectUsers([]);
            // Briefing Reset
            setBriefingData({});
            setBriefingTemplate(null);
            setTemplateId('');
            setActiveTab('details');
        }
    }, [card, selectedColumnId, isOpen, projectId, boardId]);

    const loadSubData = async () => {
        setLoadingData(true);
        try {
            const [commentsData, attachmentsData, collaboratorsData] = await Promise.all([
                commentService.getComments(projectId, boardId, card.id),
                attachmentService.getAttachments(projectId, boardId, card.id),
                collaboratorService.getCollaborators({ projectId }) // Needed for mentions
            ]);

            // Organize comments into threads
            // Backend returns flat list or nested? Previously I updated repo to include `replies`.
            // If API returns nested, great. If flat, we must nest.
            // Assuming API now returns nested due to my Repo change.
            // But wait, the repo query `findByCardId` returns TOP level comments? 
            // My query logic: `prisma.comment.findMany({ where: { cardId } ... })` returns ALL comments for card.
            // So I will get both parents and children in the same list if I'm not careful.
            // Actually, if I filter `where: { cardId, parentId: null }` in backend it would be tree.
            // Currently backend returns ALL.
            // I should filter client side for root comments.
            const rootComments = commentsData.filter(c => !c.parentId);
            // Map children are already included via `include: { replies: ... }` from my backend change?
            // Yes, `replies` relation was included.
            // So `rootComments` will already have `replies` populated if the backend query was correct.
            // However, `findMany({ where: { cardId } })` returns duplicates (children are also returned as top level items because they also match cardId).
            // To fix this cleanly without backend filtering change:
            // I'll just filter `c => !c.parentId` to get roots.
            setComments(rootComments);

            setAttachments(attachmentsData);
            setProjectUsers(collaboratorsData.map(c => c.user || c)); // Handle pop/obj structure

            // Load assignees from card - just extract IDs
            if (card.assignees && Array.isArray(card.assignees)) {
                setSelectedAssigneeIds(card.assignees.map(a => a.id || a.userId));
            }

            if (card.tags && Array.isArray(card.tags)) {
                setTags(card.tags.map(t => t.tag || t));
            }
        } catch (e) {
            console.error("Error loading sub-data", e);
        } finally {
            setLoadingData(false);
        }
    };

    // -- Helpers --
    const isEnabled = (field) => {
        // If enabledFields is not provided or empty, default to true or false?
        // Typically default to true if checks are missing, but let's see usage.
        if (!enabledFields) return true;
        // Check specific field config
        return enabledFields[field]?.enabled ?? false;
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try { return new Date(dateString).toISOString().split('T')[0]; } catch { return ''; }
    };

    // -- Handlers: Checklist & Save (Standard) --
    // ... (Keep existing checklist/save logic concise)
    const addChecklistItem = () => {
        if (!newChecklistItem.trim()) return;
        const newItem = { id: crypto.randomUUID(), text: newChecklistItem, done: false };
        const newList = [...checklist, newItem];
        setChecklist(newList);
        updateProgressFromChecklist(newList);
        setNewChecklistItem('');
    };
    const toggleChecklistItem = (id) => {
        const newList = checklist.map(i => i.id === id ? { ...i, done: !i.done } : i);
        setChecklist(newList);
        updateProgressFromChecklist(newList);
    };
    const removeChecklistItem = (id) => {
        const newList = checklist.filter(i => i.id !== id);
        setChecklist(newList);
        updateProgressFromChecklist(newList);
    };
    const updateProgressFromChecklist = (list) => {
        if (list.length === 0) { setProgress(0); return; }
        const done = list.filter(i => i.done).length;
        setProgress(Math.round((done / list.length) * 100));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        const payload = {
            title: title.trim(), description: description.trim(), priority, type, status,
            startDate: startDate || null, dueDate: dueDate || null, completedAt: completedAt || null,
            estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
            actualHours: actualHours ? parseFloat(actualHours) : null,
            progress, storyPoints: storyPoints ? parseInt(storyPoints) : null,
            budget: budget ? parseFloat(budget) : null, billable,
            externalUrl: externalUrl || null, projectPhase: projectPhase || null,
            checklist: JSON.stringify(checklist), customFields: customFieldsData,
            assigneeIds: selectedAssigneeIds, // Multiple assignees
        };
        if (!card) payload.columnId = columnId;
        await onSave(payload);
    };

    // -- Handlers: Comments (Enhanced) --

    // 1. Text Input & Mentions
    const handleCommentChange = (e) => {
        const val = e.target.value;
        setNewComment(val);
        setCursorPosition(e.target.selectionStart);

        // Simple mention detection: last word starts with @
        const beforeCursor = val.slice(0, e.target.selectionStart);
        const lastWord = beforeCursor.split(/\s+/).pop();
        if (lastWord.startsWith('@') && lastWord.length > 1) {
            setMentionSearch(lastWord.slice(1));
            setShowMentionList(true);
        } else {
            setShowMentionList(false);
        }
    };

    const insertMention = (userName) => {
        const before = newComment.slice(0, cursorPosition);
        const after = newComment.slice(cursorPosition);
        const lastWordStart = before.lastIndexOf('@');

        const newValue = before.slice(0, lastWordStart) + `@${userName} ` + after;
        setNewComment(newValue);
        setShowMentionList(false);
        commentInputRef.current?.focus();
    };

    // 2. Add Comment / Reply
    const handleAddComment = async () => {
        if (!newComment.trim() || !card) return;
        try {
            const payload = { content: newComment };
            if (replyingTo) payload.parentId = replyingTo.id;

            const added = await commentService.createComment(projectId, boardId, card.id, payload);

            // Re-fetch to get correct structure or optimistically update
            await loadSubData(); // Simplest to ensure ID/Threading structure matches

            setNewComment('');
            setReplyingTo(null);
        } catch (e) { console.error(e); }
    };

    const handleDelete = async () => {
        console.log('CardModal: handleDelete clicked');
        if (!card) return;
        if (window.confirm('Tem certeza que deseja excluir este card permanentemente?')) {
            try {
                console.log('CardModal: Deleting card...', card.id);
                try {
                    await cardService.deleteCard(projectId, boardId, card.id);
                } catch (e) {
                    await api.delete(`/cards/${card.id}`);
                }

                console.log('CardModal: Delete API success, calling onSave');
                if (onSave) onSave({ id: card.id, _deleted: true });

                alert('Card excluído com sucesso!');
            } catch (e) {
                console.error('Erro ao excluir:', e);
                alert('Erro ao excluir card: ' + (e.response?.data?.message || e.message));
            }
        }
    };

    // -- Handlers: Attachments (File & Link) --
    // New state for attachment modal
    const [isAttachmentModalOpen, setAttachmentModalOpen] = useState(false);
    const [attachmentTab, setAttachmentTab] = useState('file'); // 'file' | 'link'
    const [linkUrl, setLinkUrl] = useState('');
    const [linkName, setLinkName] = useState('');
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !card) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await attachmentService.createAttachment(projectId, boardId, card.id, formData);
            setAttachmentModalOpen(false);
            loadSubData();
        } catch (e) { console.error(e); }
    };

    const handleLinkAdd = async () => {
        if (!linkUrl.trim() || !card) return;
        const name = linkName.trim() || linkUrl;

        try {
            await attachmentService.createAttachment(projectId, boardId, card.id, {
                filename: `link_${Date.now()}`,
                url: linkUrl,
                originalName: name,
                mimeType: 'link/url',
                size: 0
            });
            setAttachmentModalOpen(false);
            setLinkUrl('');
            setLinkName('');
            loadSubData();
        } catch (e) { console.error(e); }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (!card || !attachmentId) return;
        if (!window.confirm("Excluir anexo?")) return;
        try {
            await attachmentService.deleteAttachment(projectId, boardId, card.id, attachmentId);
            setAttachments(prev => prev.filter(a => a.id !== attachmentId));
        } catch (e) {
            console.error("Error deleting attachment", e);
        }
    };

    // 3. Reactions
    const handleReaction = async (commentId, emoji) => {
        try {
            // Optimistic update could go here
            await commentService.addReaction(projectId, boardId, card.id, commentId, emoji);
            await loadSubData(); // Refresh to show count
        } catch (e) { console.error(e); }
    };

    const handleRemoveReaction = async (commentId, emoji) => {
        try {
            await commentService.removeReaction(projectId, boardId, card.id, commentId, emoji);
            await loadSubData();
        } catch (e) { console.error(e); }
    };

    // -- Handlers: Tags --
    const handleAddTag = async (tagId) => {
        if (!card) return;
        try {
            await tagService.addTagToCard(projectId, boardId, card.id, tagId);
            const tag = availableTags.find(t => t.id === tagId); if (tag) setTags([...tags, tag]); setShowTagSelector(false);
        } catch (e) { }
    };
    const handleRemoveTag = async (tagId) => {
        if (!card) return; try { await tagService.removeTagFromCard(projectId, boardId, card.id, tagId); setTags(tags.filter(t => t.id !== tagId)); } catch (e) { }
    };

    // -- Render Elements --
    const renderComment = (comment, isReply = false) => {
        // Find if current user has reacted
        const myReactions = comment.reactions?.filter(r => r.userId === currentUser?.id) || [];
        // Group reactions by emoji
        const reactionCounts = comment.reactions?.reduce((acc, curr) => {
            acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
            return acc;
        }, {}) || {};

        return (
            <div key={comment.id} className={`flex gap-3 group ${isReply ? 'ml-12 mt-3 border-l-2 border-gray-100 pl-3' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-white border border-gray-200 flex items-center justify-center font-bold text-xs text-indigo-600 shrink-0 shadow-sm">
                    {comment.user?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-800">{comment.user?.name}</span>
                            <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => { setReplyingTo(comment); commentInputRef.current?.focus(); }} className="text-gray-400 hover:text-indigo-600" title="Responder">
                                <Reply size={14} />
                            </button>
                            {/* Emoji Trigger */}
                            <div className="relative group/emoji">
                                <button type="button" className="text-gray-400 hover:text-yellow-500"><Smile size={14} /></button>
                                <div className="absolute top-6 right-0 bg-white shadow-xl border border-gray-100 rounded-lg p-2 flex gap-1 z-50 hidden group-hover/emoji:flex">
                                    {['👍', '❤️', '😂', '🎉', '😢', '🚀'].map(emoji => (
                                        <button key={emoji} type="button" onClick={() => handleReaction(comment.id, emoji)} className="hover:scale-125 transition-transform text-lg">
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {comment.user?.id === currentUser?.id && (
                                <button type="button" onClick={() => setDeleteCommentConfirm({ isOpen: true, id: comment.id })} className="text-gray-400 hover:text-red-500">
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-1 text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-3 rounded-lg rounded-tl-none border border-gray-100">
                        {/* Highlight mentions */}
                        {comment.content.split(' ').map((word, i) =>
                            word.startsWith('@') ? <span key={i} className="text-indigo-600 font-medium bg-indigo-50 px-1 rounded">{word} </span> : word + ' '
                        )}
                    </div>

                    {/* Reactions Display */}
                    {Object.keys(reactionCounts).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(reactionCounts).map(([emoji, count]) => (
                                <button key={emoji} type="button" onClick={() => myReactions.find(r => r.emoji === emoji) ? handleRemoveReaction(comment.id, emoji) : handleReaction(comment.id, emoji)}
                                    className={`text-xs px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${myReactions.find(r => r.emoji === emoji) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`}
                                >
                                    <span>{emoji}</span>
                                    <span>{count}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Render Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-2 space-y-3">
                            {comment.replies.map(reply => renderComment(reply, true))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={null} maxWidth="max-w-6xl" showCloseButton={false}>
            <form onSubmit={handleSubmit} className="flex flex-col h-[90vh] -m-6">

                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white shrink-0">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="font-medium text-gray-700">{card ? 'Editar Card' : 'Novo Card'}</span>
                        {card && <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">#{card.id?.slice(0, 6)}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={onClose}><X size={18} /></Button>
                    </div>
                </div>

                {/* TABS */}
                {card && (
                    <div className="px-6 border-b border-gray-100 bg-white flex gap-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab('details')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <div className="flex items-center gap-2"><Layout size={16} /> Detalhes</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('briefing')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'briefing' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <div className="flex items-center gap-2"><FileText size={16} /> Briefing</div>
                        </button>
                    </div>
                )}

                {/* CONTENT */}
                <div className="flex flex-1 overflow-hidden">

                    {activeTab === 'details' ? (
                        <>

                            {/* LEFT (MAIN) */}
                            <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
                                <div className="max-w-3xl space-y-8">

                                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 p-0 bg-transparent" placeholder="Título do card" autoFocus />

                                    {/* Tags */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {tags.map(tag => (
                                            <Badge key={tag.id} style={{ backgroundColor: tag.color }} className="flex items-center gap-1 text-white shadow-sm">
                                                {tag.name} <button type="button" onClick={() => handleRemoveTag(tag.id)} className="hover:text-red-200"><X size={12} /></button>
                                            </Badge>
                                        ))}
                                        {card && (
                                            <div className="relative">
                                                <button type="button" onClick={() => setShowTagSelector(!showTagSelector)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400"><Plus size={16} /></button>
                                                {showTagSelector && (
                                                    <div className="absolute top-8 left-0 z-50 w-48 bg-white border border-gray-200 shadow-xl rounded-lg p-2 grid gap-1">
                                                        {availableTags.filter(t => !tags.find(my => my.id === t.id)).map(t => (
                                                            <button key={t.id} type="button" onClick={() => handleAddTag(t.id)} className="text-left px-2 py-1 text-sm rounded hover:bg-gray-50 flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} /> {t.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider"><AlignLeft size={14} /> Descrição</label>
                                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full min-h-[120px] p-4 text-gray-700 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-primary-300 focus:ring-4 focus:ring-primary-50 transition-all resize-y" placeholder="Adicione uma descrição detalhada..." />
                                    </div>

                                    {/* Checklist Block */}
                                    {isEnabled('checklist') && (
                                        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex items-center justify-between mb-2"><label className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider"><CheckSquare size={14} /> Lista de Tarefas</label>{checklist.length > 0 && <span className="text-xs font-bold text-gray-500">{Math.round(progress)}%</span>}</div>
                                            {checklist.length > 0 && (<div className="h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} /></div>)}
                                            <div className="space-y-1">
                                                {checklist.map(item => (
                                                    <div key={item.id} className="flex items-center gap-3 p-2 bg-white rounded border border-transparent hover:border-gray-200 group transition-all">
                                                        <input type="checkbox" checked={item.done} onChange={() => toggleChecklistItem(item.id)} className="rounded text-green-500 focus:ring-green-200" />
                                                        <span className={`flex-1 text-sm ${item.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item.text}</span>
                                                        <button type="button" onClick={() => removeChecklistItem(item.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><X size={14} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2"><input value={newChecklistItem} onChange={(e) => setNewChecklistItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())} className="flex-1 bg-white border-gray-200 rounded text-sm p-2" placeholder="Adicionar item..." /><Button type="button" size="sm" variant="secondary" onClick={addChecklistItem} disabled={!newChecklistItem.trim()}>Adicionar</Button></div>
                                        </div>
                                    )}

                                    {/* Attachments Block */}
                                    <div className="pt-8 border-t border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
                                                <Paperclip size={14} /> Anexos ({attachments.length})
                                            </label>
                                            <div className="relative">
                                                <Button type="button" size="sm" variant="ghost" disabled={!card} onClick={() => setAttachmentModalOpen(!isAttachmentModalOpen)}>
                                                    <Plus size={14} /> Add
                                                </Button>
                                                {/* Attachment Popover */}
                                                {isAttachmentModalOpen && (
                                                    <div className="absolute right-0 top-10 w-72 bg-white border border-gray-200 shadow-xl rounded-xl p-4 z-50">
                                                        <div className="flex bg-gray-100 p-1 rounded-lg mb-3">
                                                            <button type="button" onClick={() => setAttachmentTab('file')} className={`flex-1 py-1 text-xs font-medium rounded ${attachmentTab === 'file' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>Arquivo</button>
                                                            <button type="button" onClick={() => setAttachmentTab('link')} className={`flex-1 py-1 text-xs font-medium rounded ${attachmentTab === 'link' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>Link</button>
                                                        </div>
                                                        {attachmentTab === 'file' ? (
                                                            <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                                                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                                                                <p className="text-xs text-gray-500">Clique para upload</p>
                                                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." className="w-full text-sm border border-gray-200 rounded p-2" autoFocus />
                                                                <input value={linkName} onChange={e => setLinkName(e.target.value)} placeholder="Nome do link (opcional)" className="w-full text-sm border border-gray-200 rounded p-2" />
                                                                <Button type="button" size="sm" className="w-full" onClick={handleLinkAdd} disabled={!linkUrl.trim()}>Adicionar Link</Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {attachments.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                {attachments.map(att => (
                                                    <div key={att.id} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between hover:shadow-sm bg-white group">
                                                        <div className="flex items-center gap-3 truncate">
                                                            <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${att.mimeType === 'link/url' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                                                {att.mimeType === 'link/url' ? <LinkIcon size={16} /> : (att.mimeType?.split('/')[1] || 'FILE').slice(0, 4).toUpperCase()}
                                                            </div>
                                                            <div className="truncate">
                                                                <p className="text-sm font-medium text-gray-700 truncate">{att.originalName}</p>
                                                                <p className="text-xs text-gray-400">{att.mimeType === 'link/url' ? 'Link Externo' : `${(att.size / 1024).toFixed(0)}KB`}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <a href={att.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-600"><LinkIcon size={14} /></a>
                                                            <button type="button" onClick={() => handleDeleteAttachment(att.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p className="text-sm text-gray-300 italic">Sem anexos.</p>}
                                    </div>

                                    {/* ENHANCED COMMENTS SECTION */}
                                    <div className="pt-8 border-t border-gray-100">
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">
                                            <MessageSquare size={14} /> Comentários
                                        </label>

                                        {card ? (
                                            <>
                                                {/* Input Area */}
                                                <div className="flex gap-4 mb-8 relative">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                                                        {currentUser?.name?.charAt(0) || 'E'}
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        {replyingTo && (
                                                            <div className="flex items-center justify-between bg-indigo-50 px-3 py-1.5 rounded-lg text-xs text-indigo-700 mb-1 border border-indigo-100">
                                                                <span>Respondendo a <b>{replyingTo.user?.name}</b></span>
                                                                <button type="button" onClick={() => setReplyingTo(null)} className="hover:text-red-500"><X size={12} /></button>
                                                            </div>
                                                        )}
                                                        <div className="relative">
                                                            <textarea
                                                                ref={commentInputRef}
                                                                value={newComment}
                                                                onChange={handleCommentChange}
                                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm resize-none shadow-sm"
                                                                rows="3"
                                                                placeholder="Escreva um comentário... Use @ para mencionar"
                                                            />
                                                            {showMentionList && (
                                                                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                                                                    {projectUsers
                                                                        .filter(u => u.name.toLowerCase().includes(mentionSearch.toLowerCase()))
                                                                        .map(user => (
                                                                            <button key={user.id} type="button" onClick={() => insertMention(user.name)} className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-sm flex items-center gap-2">
                                                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">{user.name.charAt(0)}</div>
                                                                                {user.name}
                                                                            </button>
                                                                        ))
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-end gap-2">
                                                            <Button type="button" size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                                                                {replyingTo ? 'Responder' : 'Comentar'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Comment List */}
                                                <div className="space-y-6">
                                                    {comments.length > 0 ? comments.map(c => renderComment(c)) : <p className="text-center text-gray-400 text-sm py-4">Nenhum comentário.</p>}
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-gray-400 italic text-sm">Salve o card para adicionar comentários.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT (SIDEBAR) */}
                            <div className="w-80 bg-gray-50/50 border-l border-gray-100 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                {/* Status */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</h4>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500">Coluna</label>
                                            <select value={columnId} onChange={(e) => setColumnId(e.target.value)} className="w-full bg-white border-gray-200 rounded-lg text-sm p-2 shadow-sm">
                                                {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500">Prioridade</label>
                                            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-white border-gray-200 rounded-lg text-sm p-2 shadow-sm">
                                                {(enabledFields?.priority?.options || [{ value: 'baixa', label: 'Baixa' }, { value: 'media', label: 'Média' }, { value: 'alta', label: 'Alta' }])
                                                    .map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                        </div>

                                        {isEnabled('type') && (
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-500">Tipo</label>
                                                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-white border-gray-200 rounded-lg text-sm p-2 shadow-sm">
                                                    {(enabledFields?.type?.options || [{ value: 'tarefa', label: 'Tarefa' }, { value: 'bug', label: 'Bug' }, { value: 'feature', label: 'Feature' }])
                                                        .map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Assignees Section - Multi Select */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Responsáveis</h4>
                                    <UserMultiSelect
                                        users={projectUsers}
                                        selectedIds={selectedAssigneeIds}
                                        onChange={setSelectedAssigneeIds}
                                        placeholder="Selecionar responsáveis..."
                                    />
                                </div>

                                <div className="pt-8 mt-auto">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Ações</label>
                                    <button type="button" onClick={handleDelete} className="w-full flex items-center gap-2 p-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors text-left mt-1 border border-transparent hover:border-red-100">
                                        <Trash size={14} /> Excluir Card
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : activeTab === 'briefing' ? (
                        <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
                            {briefingTemplate ? (
                                <div className="max-w-3xl mx-auto space-y-6">
                                    <div className="pb-4 border-b border-gray-100 mb-6 flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                                <FileText className="text-primary" /> {briefingTemplate.name}
                                            </h3>
                                            {briefingTemplate.description && <p className="text-gray-500 mt-1">{briefingTemplate.description}</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant={isBriefingEditing ? 'secondary' : 'outline'}
                                                size="sm"
                                                onClick={() => setIsBriefingEditing(!isBriefingEditing)}
                                            >
                                                {isBriefingEditing ? 'Cancelar Edição' : 'Editar Respostas'}
                                            </Button>
                                        </div>
                                    </div>
                                    <BriefingRenderer
                                        template={briefingTemplate}
                                        initialData={briefingData}
                                        readOnly={!isBriefingEditing}
                                        onSubmit={(data) => {
                                            setBriefingData(data);
                                            submitBriefing(card.id, data).then(() => {
                                                setIsBriefingEditing(false);
                                                // Ideally show toast
                                            }).catch(console.error);
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                                    <Layout size={48} className="opacity-20" />
                                    <p>Este card não possui um briefing vinculado.</p>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white shrink-0">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Salvar Alterações</Button>
                </div>

            </form>
            <ConfirmationDialog isOpen={deleteCommentConfirm.isOpen} onClose={() => setDeleteCommentConfirm({ isOpen: false, id: null })} onConfirm={() => {
                if (!deleteCommentConfirm.id) return;
                commentService.deleteComment(projectId, boardId, card.id, deleteCommentConfirm.id).then(() => setComments(comments.filter(c => c.id !== deleteCommentConfirm.id)));
                setDeleteCommentConfirm({ isOpen: false, id: null });
            }} title="Excluir" message="Confirmar?" confirmText="Excluir" variant="danger" />
        </Modal>
    );
};
export default CardModal;
