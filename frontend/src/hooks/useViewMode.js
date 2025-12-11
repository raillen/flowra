import { useState, useCallback, useMemo } from 'react';

/**
 * useViewMode Hook
 * Manages view mode state and provides utilities for view-specific operations
 * 
 * @param {Object} options
 * @param {string} options.defaultMode - Default view mode
 * @param {Array} options.cards - Cards data for filtering/grouping
 * @param {Function} options.onModeChange - Callback when mode changes
 * @returns {Object} View mode state and utilities
 */
const useViewMode = ({
    defaultMode = 'kanban',
    cards = [],
    onModeChange,
} = {}) => {
    const [viewMode, setViewMode] = useState(defaultMode);
    const [zoom, setZoom] = useState('week'); // day | week | month
    const [groupBy, setGroupBy] = useState('assignee'); // for swimlanes

    /**
     * Change the view mode
     */
    const changeMode = useCallback((mode) => {
        setViewMode(mode);
        onModeChange?.(mode);
    }, [onModeChange]);

    /**
     * Check if current mode requires date fields
     */
    const requiresDates = useMemo(() => {
        return ['timeline', 'gantt', 'calendar'].includes(viewMode);
    }, [viewMode]);

    /**
     * Check if mode supports drag and drop
     */
    const supportsDragDrop = useMemo(() => {
        return ['kanban', 'list', 'swimlanes'].includes(viewMode);
    }, [viewMode]);

    /**
     * Get cards with dates (for timeline/gantt)
     */
    const cardsWithDates = useMemo(() => {
        return cards.filter(card => card.startDate || card.dueDate);
    }, [cards]);

    /**
     * Get cards without dates (for timeline/gantt warning)
     */
    const cardsWithoutDates = useMemo(() => {
        return cards.filter(card => !card.startDate && !card.dueDate);
    }, [cards]);

    /**
     * Group cards by a criteria (for swimlanes)
     */
    const groupCards = useCallback((criteria) => {
        const groups = {};

        cards.forEach(card => {
            let key;
            switch (criteria) {
                case 'assignee':
                    key = card.assignedUser?.name || 'Não atribuído';
                    break;
                case 'priority':
                    key = card.priority || 'sem prioridade';
                    break;
                case 'status':
                    key = card.status || 'novo';
                    break;
                case 'type':
                    key = card.type || 'tarefa';
                    break;
                case 'column':
                    key = card.column?.name || 'Sem coluna';
                    break;
                default:
                    key = 'Todos';
            }

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(card);
        });

        return groups;
    }, [cards]);

    /**
     * Get grouped cards based on current groupBy setting
     */
    const groupedCards = useMemo(() => {
        return groupCards(groupBy);
    }, [groupCards, groupBy]);

    /**
     * Build hierarchy tree from cards (for hierarchy view)
     */
    const hierarchyTree = useMemo(() => {
        const rootCards = cards.filter(card => !card.parentCardId);

        const buildTree = (parentId) => {
            const children = cards.filter(card => card.parentCardId === parentId);
            return children.map(child => ({
                ...child,
                children: buildTree(child.id),
            }));
        };

        return rootCards.map(card => ({
            ...card,
            children: buildTree(card.id),
        }));
    }, [cards]);

    /**
     * Get blocking relationships map
     */
    const blockingMap = useMemo(() => {
        const map = new Map();

        cards.forEach(card => {
            if (card.blockedBy?.length > 0) {
                card.blockedBy.forEach(blocker => {
                    if (!map.has(blocker.blockingCardId)) {
                        map.set(blocker.blockingCardId, []);
                    }
                    map.get(blocker.blockingCardId).push(card.id);
                });
            }
        });

        return map;
    }, [cards]);

    /**
     * Check if a card blocks another
     */
    const getBlockedCards = useCallback((cardId) => {
        return blockingMap.get(cardId) || [];
    }, [blockingMap]);

    /**
     * Zoom controls for timeline/gantt
     */
    const zoomIn = useCallback(() => {
        if (zoom === 'month') setZoom('week');
        else if (zoom === 'week') setZoom('day');
    }, [zoom]);

    const zoomOut = useCallback(() => {
        if (zoom === 'day') setZoom('week');
        else if (zoom === 'week') setZoom('month');
    }, [zoom]);

    return {
        // State
        viewMode,
        zoom,
        groupBy,

        // Setters
        setViewMode: changeMode,
        setZoom,
        setGroupBy,

        // Computed
        requiresDates,
        supportsDragDrop,
        cardsWithDates,
        cardsWithoutDates,
        groupedCards,
        hierarchyTree,
        blockingMap,

        // Methods
        groupCards,
        getBlockedCards,
        zoomIn,
        zoomOut,
    };
};

export default useViewMode;
