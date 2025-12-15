
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText, Plus, Search, Trash2, Edit2, Save, X, Bold, Italic, List, ListOrdered, Link, AtSign, Clock, Folder, Layout, CreditCard, CheckSquare, Check, MoreVertical, Share2, Youtube, Image as ImageIcon
} from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';
import api from '../../config/api';

/**
 * Notes Module
 * Notepad with WYSIWYG editor and @mention references
 */
const NotesModule = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const { navigateTo, setActiveProjectId, setActiveBoardId } = useNavigation();

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await api.get('/notes');
        setNotes(response.data.data || []);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.rawContent?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNote = async () => {
    try {
      const response = await api.post('/notes', {
        title: 'Nova Anotação',
        content: '',
      });
      const newNote = response.data.data;
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
      setIsEditing(true);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta anotação?')) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter((n) => n.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleReferenceClick = (ref) => {
    if (ref.referenceType === 'project') {
      setActiveProjectId(ref.referenceId);
      navigateTo('projects');
    } else if (ref.referenceType === 'board') {
      navigateTo('kanban');
      setActiveBoardId(ref.referenceId);
    }
  };

  return (
    <div className="h-full flex bg-secondary-50/50 dark:bg-slate-900/50">
      {/* Notes list */}
      <div className="w-80 bg-white dark:bg-slate-900 border-r border-secondary-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-secondary-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg text-secondary-800 dark:text-gray-100 flex items-center gap-2">
              <FileText className="text-primary-500" size={20} />
              Anotações
            </h2>
            <button onClick={handleCreateNote} className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-lg transition-colors">
              <Plus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="Buscar anotações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-secondary-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-secondary-800 dark:text-gray-200"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Carregando...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-8 text-center text-secondary-500 dark:text-gray-400">
              <FileText size={40} className="mx-auto text-secondary-300 dark:text-slate-700 mb-3" />
              <p className="text-sm">Nenhuma anotação</p>
              <button onClick={handleCreateNote} className="mt-3 text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline">
                Criar primeira anotação
              </button>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => { setSelectedNote(note); setIsEditing(false); }}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${selectedNote?.id === note.id
                    ? 'bg-primary-50 dark:bg-indigo-900/20 border border-primary-200 dark:border-indigo-500/30'
                    : 'hover:bg-secondary-50 dark:hover:bg-slate-800 border border-transparent'
                    }`}
                >
                  <h3 className="font-medium text-secondary-800 dark:text-gray-200 truncate">{note.title || 'Sem título'}</h3>
                  <p className="text-xs text-secondary-500 dark:text-gray-400 mt-1 line-clamp-2">{note.rawContent || 'Nota vazia'}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-secondary-400 dark:text-gray-500">
                    <Clock size={12} />
                    <span>{new Date(note.updatedAt).toLocaleDateString('pt-BR')}</span>
                    {note.references?.length > 0 && (
                      <span className="flex items-center gap-1 text-primary-500">
                        <AtSign size={12} /> {note.references.length}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
        {selectedNote ? (
          <NoteEditor
            note={selectedNote}
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onCancel={() => setIsEditing(false)}
            onSave={(updatedNote) => {
              setNotes(notes.map((n) => (n.id === updatedNote.id ? updatedNote : n)));
              setSelectedNote(updatedNote);
              setIsEditing(false);
            }}
            onDelete={() => handleDeleteNote(selectedNote.id)}
            onReferenceClick={handleReferenceClick}
            onShare={() => setShareModalOpen(true)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-secondary-500 dark:text-gray-500">
            <div className="text-center">
              <FileText size={48} className="mx-auto text-secondary-300 dark:text-slate-700 mb-4" />
              <p>Selecione uma anotação ou crie uma nova</p>
            </div>
          </div>
        )}
      </div>

      {selectedNote && (
        <ShareModal
          note={selectedNote}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
};

// Utility to strip HTML tags for raw content search
const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

import TipTapEditor from './notes/TipTapEditor';

const NoteEditor = ({ note, isEditing, onEdit, onCancel, onSave, onDelete, onReferenceClick, onShare }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content || '');
  }, [note]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const rawContent = stripHtml(content);
      const response = await api.put(`/notes/${note.id}`, {
        title,
        content,
        rawContent,
        references: note.references || [], // Preserve references for now
      });
      onSave(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-secondary-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da nota"
            className="text-xl font-bold text-secondary-800 dark:text-gray-100 bg-transparent border-none outline-none flex-1"
          />
        ) : (
          <h1 className="text-xl font-bold text-secondary-800 dark:text-gray-100">{title}</h1>
        )}

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
                <Save size={16} /> {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button onClick={() => { setTitle(note.title); setContent(note.content || ''); onCancel(); }} className="p-2 text-secondary-500 hover:text-secondary-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-secondary-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onShare}
                className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 dark:text-gray-400 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg transition-colors mr-1"
                title="Compartilhar"
              >
                <Share2 size={18} />
              </button>
              <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 bg-secondary-100 dark:bg-slate-800 text-secondary-700 dark:text-gray-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-slate-700 transition-colors">
                <Edit2 size={16} /> Editar
              </button>
              <button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {isEditing ? (
          <TipTapEditor
            content={content}
            onChange={setContent}
            editable={true}
          />
        ) : (
          <TipTapEditor
            content={content}
            onChange={() => { }}
            editable={false}
          />
        )}
      </div>
    </div>
  );
};

// Multi-select Share Modal Component
const ShareModal = ({ note, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]); // Users selected to be added
  const [permission, setPermission] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [shares, setShares] = useState(note.shares || []);

  useEffect(() => {
    if (note.shares) setShares(note.shares);
  }, [note]);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm && searchTerm.length >= 2) {
        setSearching(true);
        try {
          const response = await api.get('/auth/users', {
            params: { q: searchTerm }
          });
          // Filter out users already shared or pending
          const currentIds = new Set([...shares.map(s => s.userId), ...pendingUsers.map(u => u.id)]);
          const filteredUsers = (response.data.data || []).filter(u => !currentIds.has(u.id));
          setUsers(filteredUsers);
        } catch (error) {
          console.error("Error searching users:", error);
        } finally {
          setSearching(false);
        }
      } else {
        setUsers([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, shares, pendingUsers]);

  const handleAddPendingUser = (user) => {
    setPendingUsers([...pendingUsers, user]);
    setSearchTerm('');
    setUsers([]);
  };

  const handleRemovePendingUser = (userId) => {
    setPendingUsers(pendingUsers.filter(u => u.id !== userId));
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (pendingUsers.length === 0) return;

    setLoading(true);
    try {
      // Process all pending shares
      const promises = pendingUsers.map(user =>
        api.post(`/notes/${note.id}/share`, {
          userId: user.id,
          permission
        }).then(() => ({
          userId: user.id,
          permission,
          user: user
        }))
      );

      const results = await Promise.all(promises);

      // Update local state
      setShares([...shares, ...results]);
      setPendingUsers([]);

    } catch (error) {
      console.error(error);
      alert('Erro ao compartilhar com alguns usuários.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (userId) => {
    if (!confirm("Remover acesso deste usuário?")) return;
    try {
      await api.delete(`/notes/${note.id}/share/${userId}`);
      setShares(shares.filter(s => s.userId !== userId));
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 border border-secondary-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-secondary-800 dark:text-white">Compartilhar Nota</h3>
          <button onClick={onClose}><X size={20} className="text-secondary-400" /></button>
        </div>

        <div className="mb-6 relative">
          <div className="flex gap-2 mb-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar usuário para adicionar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
              />

              {/* Search Results Dropdown */}
              {searchTerm && users.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-secondary-200 dark:border-slate-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {users.map(user => (
                    <div
                      key={user.id}
                      onClick={() => handleAddPendingUser(user)}
                      className="p-2 hover:bg-secondary-100 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-secondary-800 dark:text-gray-200">{user.name}</p>
                        <p className="text-xs text-secondary-500">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {searchTerm && !searching && users.length === 0 && searchTerm.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-secondary-200 dark:border-slate-700 rounded-lg shadow-lg z-10 p-2 text-center text-xs text-secondary-500">
                  Nenhum usuário encontrado.
                </div>
              )}
            </div>

            <select
              value={permission}
              onChange={e => setPermission(e.target.value)}
              className="px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
            >
              <option value="viewer">Ver</option>
              <option value="editor">Editar</option>
            </select>
          </div>

          {/* Pending Users Chips */}
          {pendingUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 bg-secondary-50 dark:bg-slate-800/50 p-2 rounded-lg">
              {pendingUsers.map(user => (
                <div key={user.id} className="flex items-center gap-1 bg-white dark:bg-slate-700 border border-secondary-200 dark:border-slate-600 px-2 py-1 rounded-full text-sm shadow-sm">
                  <span className="text-xs font-medium text-secondary-700 dark:text-gray-200">{user.name}</span>
                  <button onClick={() => handleRemovePendingUser(user.id)} className="text-secondary-400 hover:text-red-500"><X size={12} /></button>
                </div>
              ))}
              <div className="w-full mt-1">
                <button
                  onClick={handleShare}
                  disabled={loading}
                  className="w-full py-1.5 bg-primary-600 text-white rounded text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? 'Salvando...' : <><Share2 size={14} /> Confirmar Compartilhamento ({pendingUsers.length})</>}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-secondary-500">Pessoas com acesso</h4>
          {shares.length === 0 ? (
            <p className="text-xs text-secondary-400 italic">Apenas você.</p>
          ) : (
            shares.map(share => (
              <div key={share.userId} className="flex justify-between items-center p-2 bg-secondary-50 dark:bg-slate-800 rounded group">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-secondary-200 dark:bg-slate-700 text-secondary-600 dark:text-gray-300 flex items-center justify-center text-xs font-bold">
                    {(share.user?.name || share.userId || '?').charAt(0)}
                  </div>
                  <div>
                    <span className="text-sm font-medium block text-secondary-800 dark:text-gray-200">{share.user?.name || share.userId}</span>
                    <span className="text-xs bg-secondary-200 dark:bg-slate-700 px-2 py-0.5 rounded capitalize text-secondary-600 dark:text-gray-400">{share.permission}</span>
                  </div>
                </div>

                {/* Only show remove button if it's not the owner (assuming current user is owner for now, slightly simplified) */}
                <button
                  onClick={() => handleRemoveShare(share.userId)}
                  className="p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remover acesso"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesModule;
