import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import api from '../config/api';
import { useChatContext } from './ChatContext';
import { playNotificationSound, getSoundForPriority, initAudio } from '../utils/notificationSound';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [permission, setPermission] = useState('default');
    const { socket } = useChatContext();
    const audioInitialized = useRef(false);

    // Initialize audio on first user interaction
    useEffect(() => {
        const initOnInteraction = () => {
            if (!audioInitialized.current) {
                initAudio();
                audioInitialized.current = true;
            }
            window.removeEventListener('click', initOnInteraction);
        };
        window.addEventListener('click', initOnInteraction);
        return () => window.removeEventListener('click', initOnInteraction);
    }, []);

    // Check current permission
    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    // Request browser notification permission
    const requestPermission = useCallback(async () => {
        if ('Notification' in window) {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result;
        }
        return 'denied';
    }, []);

    // Show browser notification
    const showBrowserNotification = useCallback((notification) => {
        if (permission === 'granted' && document.hidden) {
            const n = new Notification(notification.title, {
                body: notification.message || notification.content,
                icon: '/favicon.ico',
                tag: notification.id,
            });

            n.onclick = () => {
                window.focus();
                n.close();
            };

            // Auto close after 5 seconds
            setTimeout(() => n.close(), 5000);
        }
    }, [permission]);

    // Fetch initial notifications
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications?limit=20');
            if (response.data && response.data.data) {
                setNotifications(response.data.data.notifications || []);
                setUnreadCount(response.data.data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Socket Event Listeners
    useEffect(() => {
        if (!socket) return;

        // New notification
        socket.on('notification:new', (notification) => {
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Play sound
            playNotificationSound(getSoundForPriority(notification.priority));

            // Show toast
            toast(notification.title, {
                description: notification.message || notification.content,
                action: notification.link ? {
                    label: 'Ver',
                    onClick: () => window.location.href = notification.link
                } : undefined,
            });

            // Show browser notification
            showBrowserNotification(notification);
        });

        // Notification update (read status)
        socket.on('notification:update', (data) => {
            if (data.id) {
                setNotifications((prev) => prev.map(n =>
                    n.id === data.id ? { ...n, ...data } : n
                ));
            }
            if (typeof data.unreadCount === 'number') {
                setUnreadCount(data.unreadCount);
            }
        });

        // Read all
        socket.on('notification:read_all', (data) => {
            setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
            if (typeof data.unreadCount === 'number') {
                setUnreadCount(data.unreadCount);
            }
        });

        // Initial fetch on socket connect (to sync)
        fetchNotifications();

        return () => {
            socket.off('notification:new');
            socket.off('notification:update');
            socket.off('notification:read_all');
        };
    }, [socket, fetchNotifications, showBrowserNotification]);

    // Actions
    const markAsRead = async (id) => {
        try {
            // Optimistic update
            setNotifications((prev) => prev.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
            setUnreadCount((prev) => Math.max(0, prev - 1));

            await api.put(`/notifications/${id}/read`);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            await api.put('/notifications/read-all');
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            setNotifications((prev) => prev.filter(n => n.id !== id));
            await api.delete(`/notifications/${id}`);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const value = {
        notifications,
        unreadCount,
        loading,
        permission,
        requestPermission,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext must be used within NotificationProvider');
    }
    return context;
};

export default NotificationContext;
