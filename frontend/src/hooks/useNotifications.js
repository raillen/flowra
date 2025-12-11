import { useNotificationContext } from '../contexts/NotificationContext';

/**
 * useNotifications Hook
 * Wrapper around NotificationContext for backward compatibility
 * 
 * @module hooks/useNotifications
 */

export const useNotifications = () => {
    return useNotificationContext();
};

export default useNotifications;
