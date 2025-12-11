import { useState, useEffect, useCallback } from 'react';
import {
    getBoardConfig,
    updateBoardConfig,
    defaultFieldConfig,
} from '../services/boardConfigService';

/**
 * Custom hook for managing board field configuration
 * 
 * @param {string} boardId - Board ID to manage config for
 * @returns {Object} Config state and operations
 */
export const useBoardConfig = (boardId) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    /**
     * Fetches the board configuration
     */
    const fetchConfig = useCallback(async () => {
        if (!boardId) {
            setConfig(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getBoardConfig(boardId);
            setConfig(data);
        } catch (err) {
            console.error('Error fetching board config:', err);
            setError(err.message || 'Failed to fetch board configuration');
            // Use default config as fallback
            setConfig({ fields: defaultFieldConfig });
        } finally {
            setLoading(false);
        }
    }, [boardId]);

    /**
     * Updates the board configuration
     * @param {Object} fields - New field configuration
     */
    const saveConfig = useCallback(async (fields) => {
        if (!boardId) return;

        try {
            setSaving(true);
            setError(null);
            const data = await updateBoardConfig(boardId, fields);
            setConfig(data);
            return data;
        } catch (err) {
            console.error('Error saving board config:', err);
            setError(err.message || 'Failed to save board configuration');
            throw err;
        } finally {
            setSaving(false);
        }
    }, [boardId]);

    /**
     * Toggles a field's enabled state
     * @param {string} fieldName - Name of the field to toggle
     */
    const toggleField = useCallback((fieldName) => {
        if (!config?.fields) return;

        const currentField = config.fields[fieldName] || { enabled: false, required: false };
        const updatedFields = {
            ...config.fields,
            [fieldName]: {
                ...currentField,
                enabled: !currentField.enabled,
            },
        };

        setConfig({ ...config, fields: updatedFields });
    }, [config]);

    /**
     * Updates a specific field's configuration
     * @param {string} fieldName - Name of the field
     * @param {Object} fieldConfig - New field configuration
     */
    const updateField = useCallback((fieldName, fieldConfig) => {
        if (!config?.fields) return;

        const updatedFields = {
            ...config.fields,
            [fieldName]: {
                ...config.fields[fieldName],
                ...fieldConfig,
            },
        };

        setConfig({ ...config, fields: updatedFields });
    }, [config]);

    /**
     * Checks if a field is enabled
     * @param {string} fieldName - Name of the field
     * @returns {boolean} Whether the field is enabled
     */
    const isFieldEnabled = useCallback((fieldName) => {
        return config?.fields?.[fieldName]?.enabled ?? false;
    }, [config]);

    /**
     * Gets enabled fields as an array
     * @returns {string[]} Array of enabled field names
     */
    const getEnabledFields = useCallback(() => {
        if (!config?.fields) return [];
        return Object.entries(config.fields)
            .filter(([, value]) => value?.enabled)
            .map(([key]) => key);
    }, [config]);

    // Fetch config when boardId changes
    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    return {
        config,
        fields: config?.fields || defaultFieldConfig,
        loading,
        error,
        saving,
        fetchConfig,
        saveConfig,
        toggleField,
        updateField,
        isFieldEnabled,
        getEnabledFields,
    };
};

export default useBoardConfig;
