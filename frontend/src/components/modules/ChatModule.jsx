import React, { useState, useEffect, useRef } from 'react';
import {
    MessageCircle,
    Send,
    Search,
    X,
    User,
    Users,
    Plus,
    Smile,
    MoreHorizontal,
    Check,
    CheckCheck,
    Folder,
    Trash,
} from 'lucide-react';
import { useChatContext } from '../../contexts/ChatContext';
import { useAuthContext } from '../../contexts/AuthContext';

/**
 * ChatModule Component
 * Main chat interface with sidebar and chat window
 * 
 * @module components/modules/ChatModule
 */
const ChatModule = () => {
    const {
        connected,
        conversations,
        activeConversation,
        messages,
        typingUsers,
        unreadTotal,
        loading,
        openConversation,
        closeConversation,
        deleteConversation,
        sendMessage,
        sendTyping,
        addReaction,
        removeReaction,
        startConversation,
        getAvailableUsers,
        getUserProjects,
        openProjectChat,
    } = useChatContext();

    const { user } = useAuthContext();
    const [showNewChat, setShowNewChat] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [userProjects, setUserProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [newChatTab, setNewChatTab] = useState('users'); // 'users' | 'projects'
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load available users and projects for new chat
    const handleShowNewChat = async () => {
        setShowNewChat(true);
        const [users, projects] = await Promise.all([
            getAvailableUsers(),
            getUserProjects(),
        ]);
        setAvailableUsers(users);
        setUserProjects(projects);
    };

    // Start new 1:1 conversation
    const handleStartChat = async (otherUser) => {
        try {
            const conversation = await startConversation(otherUser.id);
            await openConversation(conversation);
            setShowNewChat(false);
            setSearchTerm('');
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    };

    // Open project group chat
    const handleOpenProjectChat = async (project) => {
        try {
            await openProjectChat(project.id);
            setShowNewChat(false);
            setSearchTerm('');
        } catch (error) {
            console.error('Error opening project chat:', error);
        }
    };

    // Send message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        try {
            await sendMessage(messageInput.trim());
            setMessageInput('');
            sendTyping(false);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Handle typing
    const handleInputChange = (e) => {
        setMessageInput(e.target.value);
        sendTyping(true);
    };

    // Filter and separate conversations
    const filteredConversations = conversations.filter((conv) => {
        const name = conv.isGroup ? conv.name : conv.otherUser?.name;
        return name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Separate direct messages and project chats
    const directMessages = filteredConversations
        .filter((conv) => !conv.isGroup)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const projectChats = filteredConversations
        .filter((conv) => conv.isGroup)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Filter available users
    const filteredUsers = availableUsers.filter(
        (u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter projects
    const filteredProjects = userProjects.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex bg-white">
            {/* Sidebar */}
            <div className="w-80 border-r border-secondary-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-secondary-200">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-secondary-800 flex items-center gap-2">
                            <MessageCircle className="text-primary-500" size={20} />
                            Chat
                            {unreadTotal > 0 && (
                                <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {unreadTotal}
                                </span>
                            )}
                        </h2>
                        <button
                            onClick={handleShowNewChat}
                            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                            title="Nova conversa"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Connection status */}
                    <div className="flex items-center gap-2 text-xs text-secondary-500 mb-3">
                        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                        {connected ? 'Conectado' : 'Desconectado'}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar conversas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                    </div>
                </div>

                {/* New chat panel */}
                {showNewChat && (
                    <div className="p-4 border-b border-secondary-200 bg-secondary-50">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-secondary-700">Nova Conversa</h3>
                            <button
                                onClick={() => {
                                    setShowNewChat(false);
                                    setSearchTerm('');
                                }}
                                className="p-1 hover:bg-secondary-200 rounded"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 mb-3">
                            <button
                                onClick={() => setNewChatTab('users')}
                                className={`flex-1 py-1.5 text-sm rounded-lg transition-colors ${newChatTab === 'users'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                                    }`}
                            >
                                <User size={14} className="inline mr-1" />
                                Usuários
                            </button>
                            <button
                                onClick={() => setNewChatTab('projects')}
                                className={`flex-1 py-1.5 text-sm rounded-lg transition-colors ${newChatTab === 'projects'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                                    }`}
                            >
                                <Folder size={14} className="inline mr-1" />
                                Projetos
                            </button>
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-1">
                            {newChatTab === 'users' ? (
                                <>
                                    {filteredUsers.map((u) => (
                                        <button
                                            key={u.id}
                                            onClick={() => handleStartChat(u)}
                                            className="w-full flex items-center gap-3 p-2 hover:bg-secondary-100 rounded-lg text-left"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                                <User size={16} className="text-primary-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-secondary-800 truncate">{u.name}</p>
                                                <p className="text-xs text-secondary-500 truncate">{u.email}</p>
                                            </div>
                                            {u.online && (
                                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                            )}
                                        </button>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <p className="text-sm text-secondary-500 text-center py-4">
                                            Nenhum usuário encontrado
                                        </p>
                                    )}
                                </>
                            ) : (
                                <>
                                    {filteredProjects.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleOpenProjectChat(p)}
                                            className="w-full flex items-center gap-3 p-2 hover:bg-secondary-100 rounded-lg text-left"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Users size={16} className="text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-secondary-800 truncate">{p.name}</p>
                                                <p className="text-xs text-secondary-500">Chat do projeto</p>
                                            </div>
                                        </button>
                                    ))}
                                    {filteredProjects.length === 0 && (
                                        <p className="text-sm text-secondary-500 text-center py-4">
                                            Nenhum projeto encontrado
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Conversations list */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (directMessages.length === 0 && projectChats.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-12 text-secondary-400">
                            <Users size={40} className="mb-2" />
                            <p className="text-sm">Nenhuma conversa</p>
                            <button
                                onClick={handleShowNewChat}
                                className="mt-2 text-primary-600 text-sm hover:underline"
                            >
                                Iniciar conversa
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Direct Messages Section */}
                            {directMessages.length > 0 && (
                                <>
                                    <div className="px-4 py-2 bg-secondary-50 border-b border-secondary-100">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                                            <User size={14} />
                                            Mensagens Diretas
                                            <span className="bg-secondary-200 text-secondary-600 px-1.5 py-0.5 rounded-full text-[10px]">
                                                {directMessages.length}
                                            </span>
                                        </div>
                                    </div>
                                    {directMessages.map((conv) => (
                                        <button
                                            key={conv.id}
                                            onClick={() => openConversation(conv)}
                                            className={`w-full flex items-center gap-3 p-4 hover:bg-secondary-50 border-b border-secondary-100 text-left transition-colors ${activeConversation?.id === conv.id ? 'bg-primary-50' : ''
                                                }`}
                                        >
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                    <User size={18} className="text-primary-600" />
                                                </div>
                                                {conv.online && (
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-secondary-800 truncate">
                                                        {conv.otherUser?.name || 'Usuário'}
                                                    </p>
                                                    {conv.lastMessage && (
                                                        <span className="text-xs text-secondary-400">
                                                            {formatTime(conv.lastMessage.createdAt)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-secondary-500 truncate">
                                                        {conv.lastMessage?.content || 'Nenhuma mensagem'}
                                                    </p>
                                                    {conv.unreadCount > 0 && (
                                                        <span className="bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </>
                            )}

                            {/* Project Chats Section */}
                            {projectChats.length > 0 && (
                                <>
                                    <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
                                            <Users size={14} />
                                            Chats de Projetos
                                            <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-[10px]">
                                                {projectChats.length}
                                            </span>
                                        </div>
                                    </div>
                                    {projectChats.map((conv) => (
                                        <button
                                            key={conv.id}
                                            onClick={() => openConversation(conv)}
                                            className={`w-full flex items-center gap-3 p-4 hover:bg-blue-50 border-b border-secondary-100 text-left transition-colors ${activeConversation?.id === conv.id ? 'bg-blue-50' : ''
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Users size={18} className="text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <p className="font-medium text-secondary-800 truncate">
                                                            {conv.name}
                                                        </p>
                                                        <span className="shrink-0 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                                                            GRUPO
                                                        </span>
                                                    </div>
                                                    {conv.lastMessage && (
                                                        <span className="text-xs text-secondary-400 shrink-0">
                                                            {formatTime(conv.lastMessage.createdAt)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-secondary-500 truncate">
                                                        {conv.lastMessage?.content || 'Nenhuma mensagem'}
                                                    </p>
                                                    {conv.unreadCount > 0 && (
                                                        <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Chat window */}
            <div className="flex-1 flex flex-col">
                {activeConversation ? (
                    <>
                        {/* Chat header */}
                        <div className="p-4 border-b border-secondary-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeConversation.isGroup ? 'bg-blue-100' : 'bg-primary-100'}`}>
                                        {activeConversation.isGroup ? (
                                            <Users size={18} className="text-blue-600" />
                                        ) : (
                                            <User size={18} className="text-primary-600" />
                                        )}
                                    </div>
                                    {!activeConversation.isGroup && activeConversation.online && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-secondary-800">
                                        {activeConversation.isGroup ? activeConversation.name : activeConversation.otherUser?.name}
                                    </h3>
                                    <p className="text-xs text-secondary-500">
                                        {activeConversation.isGroup
                                            ? `${activeConversation.participants?.length || 0} participantes`
                                            : (activeConversation.online ? 'Online' : 'Offline')
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => {
                                        if (window.confirm('Tem certeza que deseja apagar esta conversa?')) {
                                            deleteConversation(activeConversation.id);
                                        }
                                    }}
                                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                    title="Excluir conversa"
                                >
                                    <Trash size={18} />
                                </button>
                                <button
                                    onClick={closeConversation}
                                    className="p-2 hover:bg-secondary-100 rounded-lg"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary-50">
                            {messages.map((message, index) => (
                                <ChatMessage
                                    key={message.id}
                                    message={message}
                                    isOwn={message.senderId === user?.id}
                                    showAvatar={
                                        index === 0 ||
                                        messages[index - 1]?.senderId !== message.senderId
                                    }
                                    onAddReaction={(emoji) => addReaction(message.id, emoji)}
                                    onRemoveReaction={(emoji) => removeReaction(message.id, emoji)}
                                    userId={user?.id}
                                />
                            ))}

                            {/* Typing indicator */}
                            {typingUsers.size > 0 && (
                                <div className="flex items-center gap-2 text-secondary-500 text-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span>digitando...</span>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-secondary-200 bg-white">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={messageInput}
                                    onChange={handleInputChange}
                                    placeholder="Digite uma mensagem..."
                                    className="flex-1 px-4 py-2 border border-secondary-200 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!messageInput.trim()}
                                    className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-secondary-400 bg-secondary-50">
                        <MessageCircle size={64} className="mb-4" />
                        <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
                        <p className="text-sm">ou inicie uma nova conversa</p>
                    </div>
                )}
            </div>
        </div >
    );
};

/**
 * ChatMessage Component
 */
const ChatMessage = ({ message, isOwn, showAvatar, onAddReaction, onRemoveReaction, userId }) => {
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

    // Group reactions by emoji
    const groupedReactions = (message.reactions || []).reduce((acc, r) => {
        if (!acc[r.emoji]) {
            acc[r.emoji] = { count: 0, users: [], hasOwn: false };
        }
        acc[r.emoji].count++;
        acc[r.emoji].users.push(r.user?.name || 'Usuário');
        if (r.userId === userId) {
            acc[r.emoji].hasOwn = true;
        }
        return acc;
    }, {});

    const handleReactionClick = (emoji) => {
        if (groupedReactions[emoji]?.hasOwn) {
            onRemoveReaction(emoji);
        } else {
            onAddReaction(emoji);
        }
        setShowReactionPicker(false);
    };

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
            <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
                <div
                    className={`px-4 py-2 rounded-2xl relative ${isOwn
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-white text-secondary-800 rounded-bl-md shadow-sm'
                        }`}
                >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <span className={`text-xs ${isOwn ? 'text-primary-200' : 'text-secondary-400'} mt-1 block`}>
                        {formatTime(message.createdAt)}
                    </span>

                    {/* Reaction picker trigger */}
                    <button
                        onClick={() => setShowReactionPicker(!showReactionPicker)}
                        className={`absolute -bottom-2 ${isOwn ? 'left-0' : 'right-0'} p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                        <Smile size={14} className="text-secondary-400" />
                    </button>

                    {/* Reaction picker */}
                    {showReactionPicker && (
                        <div className={`absolute bottom-8 ${isOwn ? 'left-0' : 'right-0'} bg-white rounded-full shadow-lg p-2 flex gap-1 z-10`}>
                            {commonEmojis.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleReactionClick(emoji)}
                                    className="w-8 h-8 hover:bg-secondary-100 rounded-full flex items-center justify-center text-lg"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Reactions display */}
                {Object.keys(groupedReactions).length > 0 && (
                    <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {Object.entries(groupedReactions).map(([emoji, data]) => (
                            <button
                                key={emoji}
                                onClick={() => handleReactionClick(emoji)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${data.hasOwn
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'bg-secondary-100 text-secondary-600'
                                    } hover:bg-secondary-200 transition-colors`}
                                title={data.users.join(', ')}
                            >
                                <span>{emoji}</span>
                                <span>{data.count}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Format time for display
 */
function formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;

    // Today
    if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    // Yesterday
    if (diff < 48 * 60 * 60 * 1000) {
        return 'Ontem';
    }

    // This week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    }

    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default ChatModule;
