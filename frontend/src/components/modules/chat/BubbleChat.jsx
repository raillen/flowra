import React, { useState, useEffect, useRef } from 'react';
import {
    MessageCircle, X, Search, ChevronLeft, Send,
    MoreHorizontal, User, Paperclip, Smile
} from 'lucide-react';
import { useChatContext } from '../../../contexts/ChatContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Button } from '../../ui';

/**
 * Bubble Chat Component
 * A floating chat widget accessible from anywhere
 */
const BubbleChat = () => {
    const {
        connected,
        conversations,
        unreadTotal,
        activeConversation,
        messages,
        openConversation,
        closeConversation,
        sendMessage,
        startConversation,
        getAvailableUsers,
        sendTyping,
        typingUsers,
    } = useChatContext();

    const { user: currentUser } = useAuthContext();

    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('list'); // 'list', 'chat', 'new'
    const [searchTerm, setSearchTerm] = useState('');
    const [inputText, setInputText] = useState('');
    const [availableUsers, setAvailableUsers] = useState([]);

    const messagesEndRef = useRef(null);
    const widgetRef = useRef(null);
    const inputRef = useRef(null);

    // Close on escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Scroll to bottom
    useEffect(() => {
        if (view === 'chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }
    }, [messages, view, isOpen]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen && view === 'chat' && !activeConversation) {
            setView('list');
        }
    };

    const handleOpenChat = async (conversation) => {
        await openConversation(conversation);
        setView('chat');
    };

    const handleBack = () => {
        closeConversation();
        setView('list');
    };

    const handleNewChat = async () => {
        setView('new');
        const users = await getAvailableUsers();
        setAvailableUsers(users);
    };

    const handleStartNewChat = async (userId) => {
        try {
            const conv = await startConversation(userId);
            await openConversation(conv);
            setView('chat');
        } catch (e) {
            console.error(e);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        await sendMessage(inputText);
        setInputText('');
    };

    // Helper to format time
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Helper to get other user name
    const getOtherUser = (conv) => conv.otherUser || { name: 'Usuário Desconhecido' };

    if (!connected) return null; // Or show connecting state

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4" ref={widgetRef}>

            {/* WIDGET WINDOW */}
            <div className={`
                transition-all duration-300 ease-in-out origin-bottom-right
                bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden
                flex flex-col
                ${isOpen ? 'w-[360px] h-[520px] opacity-100 scale-100' : 'w-0 h-0 opacity-0 scale-90 p-0 overflow-hidden'}
            `}>

                {/* HEADER */}
                <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
                    {view === 'list' && (
                        <>
                            <h3 className="font-bold text-gray-800 text-lg">Mensagens</h3>
                            <div className="flex gap-2">
                                <button onClick={handleNewChat} className="p-2 hover:bg-gray-50 rounded-full text-primary-600 transition-colors" title="Nova Conversa">
                                    <MessageCircle size={18} />
                                    <span className="sr-only">Nova</span>
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                        </>
                    )}

                    {view === 'chat' && activeConversation && (
                        <>
                            <div className="flex items-center gap-2">
                                <button onClick={handleBack} className="p-1.5 -ml-2 hover:bg-gray-50 rounded-full text-gray-500 transition-colors">
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium text-xs">
                                            {getOtherUser(activeConversation).name?.charAt(0)}
                                        </div>
                                        {activeConversation.online && (
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                                        )}
                                    </div>
                                    <div className="leading-tight">
                                        <h3 className="font-bold text-gray-800 text-sm truncate max-w-[150px]">
                                            {getOtherUser(activeConversation).name}
                                        </h3>
                                        {typingUsers.size > 0 ? (
                                            <span className="text-xs text-primary-600 font-medium animate-pulse">digitando...</span>
                                        ) : (
                                            <span className="text-xs text-gray-400">
                                                {activeConversation.online ? 'Online' : 'Offline'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-gray-50 rounded-full text-gray-400">
                                <MoreHorizontal size={18} />
                            </button>
                        </>
                    )}

                    {view === 'new' && (
                        <>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setView('list')} className="p-1.5 -ml-2 hover:bg-gray-50 rounded-full text-gray-500">
                                    <ChevronLeft size={20} />
                                </button>
                                <h3 className="font-bold text-gray-800">Nova Conversa</h3>
                            </div>
                        </>
                    )}
                </div>

                {/* CONTENT BODY */}
                <div className="flex-1 overflow-hidden relative bg-gray-50/50">

                    {/* LIST VIEW */}
                    {view === 'list' && (
                        <div className="h-full flex flex-col">
                            <div className="p-3">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-2 space-y-1">
                                {conversations
                                    .filter(c => getOtherUser(c).name?.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map(conv => (
                                        <button
                                            key={conv.id}
                                            onClick={() => handleOpenChat(conv)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all group border border-transparent hover:border-gray-100 text-left"
                                        >
                                            <div className="relative shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                                    {getOtherUser(conv).name?.charAt(0)}
                                                </div>
                                                {conv.online && (
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <span className="font-semibold text-gray-800 text-sm truncate">{getOtherUser(conv).name}</span>
                                                    <span className="text-[10px] text-gray-400 shrink-0">{formatTime(conv.updatedAt)}</span>
                                                </div>
                                                <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-800' : 'text-gray-500 group-hover:text-gray-600'}`}>
                                                    {conv.lastMessage?.content || 'Inicie uma conversa'}
                                                </p>
                                            </div>
                                            {conv.unreadCount > 0 && (
                                                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold shadow-sm shrink-0">
                                                    {conv.unreadCount}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                {conversations.length === 0 && (
                                    <div className="h-40 flex flex-col items-center justify-center text-gray-400 text-center p-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                                            <MessageCircle size={20} />
                                        </div>
                                        <p className="text-sm">Nenhuma conversa.<br />Inicie um novo chat!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* NEW CHAT VIEW */}
                    {view === 'new' && (
                        <div className="h-full overflow-y-auto custom-scrollbar p-2">
                            {availableUsers.map(u => (
                                <button
                                    key={u.id}
                                    onClick={() => handleStartNewChat(u.id)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-gray-100 text-left mb-1"
                                >
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        {u.name?.charAt(0)}
                                    </div>
                                    <span className="font-medium text-gray-700 text-sm">{u.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* CHAT VIEW */}
                    {view === 'chat' && activeConversation && (
                        <div className="h-full flex flex-col bg-white">
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.userId === currentUser.id;
                                    const showAvatar = !isMe && (idx === 0 || messages[idx - 1].userId !== msg.userId);

                                    return (
                                        <div key={msg.id || idx} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                                            {!isMe && (
                                                <div className="w-8 h-8 shrink-0 flex items-end">
                                                    {showAvatar ? (
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                            {getOtherUser(activeConversation).name?.charAt(0)}
                                                        </div>
                                                    ) : <div className="w-8" />}
                                                </div>
                                            )}

                                            <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                                                ? 'bg-primary-600 text-white rounded-br-none'
                                                : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* INPUT AREA */}
                            <div className="p-3 border-t border-gray-100 bg-white">
                                <form onSubmit={handleSend} className="relative flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Digitar mensagem..."
                                        className="flex-1 py-2.5 pl-4 pr-10 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all"
                                        value={inputText}
                                        onChange={(e) => {
                                            setInputText(e.target.value);
                                            sendTyping(true);
                                        }}
                                        ref={inputRef}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputText.trim()}
                                        className="p-2.5 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
                                    >
                                        <Send size={16} className={inputText.trim() ? 'ml-0.5' : ''} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* FLOATING ACTION BUTTON */}
            <button
                onClick={handleToggle}
                className={`
                    w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white
                    transition-all duration-300 transform hover:scale-105 active:scale-95
                    ${isOpen ? 'bg-secondary-800 rotate-90' : 'bg-primary-600 hover:bg-primary-700'}
                `}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={26} />}

                {/* Unread Badge */}
                {!isOpen && unreadTotal > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[11px] font-bold border-2 border-white animate-bounce-short">
                        {unreadTotal > 9 ? '9+' : unreadTotal}
                    </span>
                )}
            </button>
        </div>
    );
};

export default BubbleChat;
