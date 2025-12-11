import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthContext } from './AuthContext';
import api from '../config/api';

/**
 * Chat Context
 * Manages WebSocket connection and chat state
 * 
 * @module contexts/ChatContext
 */

const ChatContext = createContext(null);

// Socket.io server URL
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

/**
 * ChatProvider component
 */
export const ChatProvider = ({ children }) => {
    const { token, user, isAuthenticated } = useAuthContext();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState({});
    const [typingUsers, setTypingUsers] = useState({});
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [unreadTotal, setUnreadTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const typingTimeoutRef = useRef({});

    // Initialize Socket.io connection
    useEffect(() => {
        if (!isAuthenticated || !token) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        const newSocket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });

        // Handle new message
        newSocket.on('chat:message', (message) => {
            setMessages((prev) => ({
                ...prev,
                [message.conversationId]: [...(prev[message.conversationId] || []), message],
            }));

            // Update conversation preview
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === message.conversationId
                        ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
                        : conv
                ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            );
        });

        // Handle new message notification (when not in conversation room)
        newSocket.on('chat:newMessage', ({ conversationId, message }) => {
            // Increment unread if not active conversation
            if (activeConversation?.id !== conversationId) {
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv.id === conversationId
                            ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1, lastMessage: message }
                            : conv
                    )
                );
            }
        });

        // Handle typing indicator
        newSocket.on('chat:typing', ({ conversationId, userId, isTyping }) => {
            if (userId === user?.id) return;

            setTypingUsers((prev) => {
                const convTyping = new Set(prev[conversationId] || []);
                if (isTyping) {
                    convTyping.add(userId);
                } else {
                    convTyping.delete(userId);
                }
                return { ...prev, [conversationId]: convTyping };
            });
        });

        // Handle reaction updates
        newSocket.on('chat:reaction', ({ messageId, reaction, action, emoji, userId }) => {
            setMessages((prev) => {
                const updated = {};
                Object.keys(prev).forEach((convId) => {
                    updated[convId] = prev[convId].map((msg) => {
                        if (msg.id !== messageId) return msg;

                        if (action === 'add') {
                            return {
                                ...msg,
                                reactions: [...(msg.reactions || []), reaction],
                            };
                        } else {
                            return {
                                ...msg,
                                reactions: (msg.reactions || []).filter(
                                    (r) => !(r.emoji === emoji && r.userId === userId)
                                ),
                            };
                        }
                    });
                });
                return updated;
            });
        });

        // Handle online status
        newSocket.on('chat:online', ({ userId, online }) => {
            setOnlineUsers((prev) => {
                const updated = new Set(prev);
                if (online) {
                    updated.add(userId);
                } else {
                    updated.delete(userId);
                }
                return updated;
            });

            // Update conversation online status
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.otherUser?.id === userId ? { ...conv, online } : conv
                )
            );
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [isAuthenticated, token, user?.id]);

    // Fetch conversations on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchConversations();
        }
    }, [isAuthenticated]);

    // Update unread total
    useEffect(() => {
        const total = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        setUnreadTotal(total);
    }, [conversations]);

    // Fetch all conversations
    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/chat/conversations');
            setConversations(response.data.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    // Start or get conversation with user
    const startConversation = async (otherUserId, options = {}) => {
        try {
            const response = await api.post('/chat/conversations', {
                userId: otherUserId,
                ...options,
            });
            const conversation = response.data.data;

            // Add to list if not exists
            setConversations((prev) => {
                if (prev.find((c) => c.id === conversation.id)) {
                    return prev;
                }
                return [conversation, ...prev];
            });

            return conversation;
        } catch (error) {
            console.error('Error starting conversation:', error);
            throw error;
        }
    };

    // Open conversation (load messages, join room)
    const openConversation = async (conversation) => {
        setActiveConversation(conversation);

        // Join socket room
        if (socket && connected) {
            socket.emit('chat:join', conversation.id);
        }

        // Fetch messages if not loaded
        if (!messages[conversation.id]) {
            try {
                const response = await api.get(`/chat/conversations/${conversation.id}/messages`);
                setMessages((prev) => ({
                    ...prev,
                    [conversation.id]: response.data.data,
                }));
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        }

        // Mark as read
        try {
            await api.post(`/chat/conversations/${conversation.id}/read`);
            setConversations((prev) =>
                prev.map((c) => (c.id === conversation.id ? { ...c, unreadCount: 0 } : c))
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    // Close conversation (leave room)
    const closeConversation = () => {
        if (socket && connected && activeConversation) {
            socket.emit('chat:leave', activeConversation.id);
        }
        setActiveConversation(null);
    };

    // Send message
    const sendMessage = async (content) => {
        if (!activeConversation) return;

        try {
            const response = await api.post(
                `/chat/conversations/${activeConversation.id}/messages`,
                { content }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    };

    // Send typing indicator
    const sendTyping = useCallback(
        (isTyping) => {
            if (!socket || !connected || !activeConversation) return;

            socket.emit('chat:typing', {
                conversationId: activeConversation.id,
                isTyping,
            });

            // Clear previous timeout
            if (typingTimeoutRef.current[activeConversation.id]) {
                clearTimeout(typingTimeoutRef.current[activeConversation.id]);
            }

            // Auto-stop typing after 3 seconds
            if (isTyping) {
                typingTimeoutRef.current[activeConversation.id] = setTimeout(() => {
                    socket.emit('chat:typing', {
                        conversationId: activeConversation.id,
                        isTyping: false,
                    });
                }, 3000);
            }
        },
        [socket, connected, activeConversation]
    );

    // Add reaction
    const addReaction = async (messageId, emoji) => {
        try {
            await api.post(`/chat/messages/${messageId}/reactions`, { emoji });
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    };

    // Remove reaction
    const removeReaction = async (messageId, emoji) => {
        try {
            await api.delete(`/chat/messages/${messageId}/reactions/${emoji}`);
        } catch (error) {
            console.error('Error removing reaction:', error);
        }
    };

    // Get available users
    const getAvailableUsers = async () => {
        try {
            const response = await api.get('/chat/users');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    };

    // Get user's projects
    const getUserProjects = async () => {
        try {
            const response = await api.get('/chat/projects');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching projects:', error);
            return [];
        }
    };

    // Open project chat
    const openProjectChat = async (projectId) => {
        try {
            const response = await api.get(`/chat/projects/${projectId}/chat`);
            const chat = response.data.data;

            // Add to list if not exists
            setConversations((prev) => {
                if (prev.find((c) => c.id === chat.id)) {
                    return prev;
                }
                return [chat, ...prev];
            });

            await openConversation(chat);
            return chat;
        } catch (error) {
            console.error('Error opening project chat:', error);
            throw error;
        }
    };

    const value = {
        socket,
        connected,
        conversations,
        activeConversation,
        messages: messages[activeConversation?.id] || [],
        typingUsers: typingUsers[activeConversation?.id] || new Set(),
        onlineUsers,
        unreadTotal,
        loading,
        fetchConversations,
        startConversation,
        openConversation,
        closeConversation,
        sendMessage,
        sendTyping,
        addReaction,
        removeReaction,
        getAvailableUsers,
        getUserProjects,
        openProjectChat,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

/**
 * Hook to access ChatContext
 */
export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within ChatProvider');
    }
    return context;
};

export default ChatContext;
