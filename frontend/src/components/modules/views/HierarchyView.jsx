import React, { useState, useMemo, useCallback } from 'react';
import {
    ChevronDown,
    ChevronRight,
    Plus,
    MoreHorizontal,
    CheckCircle,
    Clock,
    AlertTriangle,
} from 'lucide-react';
import MiniCard from './shared/MiniCard';

/**
 * HierarchyView Component
 * Displays cards in a tree structure based on parent-child relationships
 * 
 * @param {Object} props
 * @param {Array} props.cards - Cards to display
 * @param {Array} props.columns - Columns data
 * @param {function} props.onCardClick - Callback when card is clicked
 * @param {function} props.onAddSubtask - Callback to add subtask
 */
const HierarchyView = ({
    cards = [],
    columns = [],
    onCardClick,
    onAddSubtask,
}) => {
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [selectedCard, setSelectedCard] = useState(null);

    // Build tree structure
    const hierarchyTree = useMemo(() => {
        // Get all parent IDs that have children
        const parentIds = new Set(
            cards
                .filter(card => card.parentCardId)
                .map(card => card.parentCardId)
        );

        // Root cards are those without a parent
        const rootCards = cards.filter(card => !card.parentCardId);

        // Build tree recursively
        const buildTree = (parentId, depth = 0) => {
            const children = cards.filter(card => card.parentCardId === parentId);
            return children.map(child => ({
                ...child,
                depth: depth + 1,
                hasChildren: parentIds.has(child.id),
                children: buildTree(child.id, depth + 1),
            }));
        };

        return rootCards.map(card => ({
            ...card,
            depth: 0,
            hasChildren: parentIds.has(card.id),
            children: buildTree(card.id, 0),
        }));
    }, [cards]);

    // Calculate aggregated progress for a node
    const getAggregatedProgress = useCallback((node) => {
        if (!node.children || node.children.length === 0) {
            return node.progress || 0;
        }

        const allChildren = [];
        const collectChildren = (n) => {
            allChildren.push(n);
            n.children?.forEach(collectChildren);
        };
        node.children.forEach(collectChildren);

        if (allChildren.length === 0) {
            return node.progress || 0;
        }

        const totalProgress = allChildren.reduce((sum, child) => sum + (child.progress || 0), 0);
        return Math.round(totalProgress / allChildren.length);
    }, []);

    // Get stats for a node and its children
    const getNodeStats = useCallback((node) => {
        const allNodes = [node];
        const collectNodes = (n) => {
            allNodes.push(n);
            n.children?.forEach(collectNodes);
        };
        node.children?.forEach(collectNodes);

        return {
            total: allNodes.length,
            completed: allNodes.filter(n => n.status === 'completed' || n.completedAt).length,
            blocked: allNodes.filter(n => n.blockedBy?.length > 0).length,
        };
    }, []);

    // Toggle node expand/collapse
    const toggleNode = (nodeId) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });
    };

    // Expand all nodes
    const expandAll = () => {
        const allIds = new Set();
        const collect = (node) => {
            allIds.add(node.id);
            node.children?.forEach(collect);
        };
        hierarchyTree.forEach(collect);
        setExpandedNodes(allIds);
    };

    // Collapse all nodes
    const collapseAll = () => {
        setExpandedNodes(new Set());
    };

    // Handle card click
    const handleCardClick = (card) => {
        setSelectedCard(card.id);
        onCardClick?.(card);
    };

    // Render a tree node
    const renderNode = (node, isLast = false) => {
        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children && node.children.length > 0;
        const aggregatedProgress = getAggregatedProgress(node);
        const stats = hasChildren ? getNodeStats(node) : null;
        const isSelected = selectedCard === node.id;

        const priorityColors = {
            alta: 'border-l-red-500',
            media: 'border-l-amber-500',
            baixa: 'border-l-green-500',
        };

        return (
            <div key={node.id} className="select-none">
                {/* Node row */}
                <div
                    className={`
                        flex items-center gap-2 py-2 px-3 rounded-lg transition-colors
                        hover:bg-slate-50 cursor-pointer
                        ${isSelected ? 'bg-indigo-50 ring-1 ring-indigo-200' : ''}
                    `}
                    style={{ paddingLeft: `${node.depth * 24 + 12}px` }}
                >
                    {/* Expand/Collapse button */}
                    {hasChildren ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}
                            className="p-0.5 hover:bg-slate-200 rounded"
                        >
                            {isExpanded ? (
                                <ChevronDown size={16} className="text-slate-500" />
                            ) : (
                                <ChevronRight size={16} className="text-slate-500" />
                            )}
                        </button>
                    ) : (
                        <div className="w-5" /> // Spacer for alignment
                    )}

                    {/* Priority indicator */}
                    <div className={`w-1 h-6 rounded-full ${priorityColors[node.priority] || 'bg-slate-300'}`} />

                    {/* Card content */}
                    <div
                        onClick={() => handleCardClick(node)}
                        className="flex-1 flex items-center gap-3 min-w-0"
                    >
                        {/* Type icon */}
                        <span className="text-sm">
                            {node.type === 'bug' ? '🐛' :
                                node.type === 'feature' ? '✨' :
                                    node.type === 'epic' ? '🎯' : '📋'}
                        </span>

                        {/* Title */}
                        <span className={`font-medium truncate ${node.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-800'
                            }`}>
                            {node.title}
                        </span>

                        {/* Status indicators */}
                        <div className="flex items-center gap-1 shrink-0">
                            {node.blockedBy?.length > 0 && (
                                <AlertTriangle size={14} className="text-red-500" />
                            )}
                            {node.status === 'completed' && (
                                <CheckCircle size={14} className="text-green-500" />
                            )}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-24 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${aggregatedProgress >= 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${aggregatedProgress}%` }}
                                />
                            </div>
                            <span className="text-xs text-slate-500 w-8 text-right">
                                {aggregatedProgress}%
                            </span>
                        </div>
                    </div>

                    {/* Stats for parent nodes */}
                    {stats && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                                {stats.total} itens
                            </span>
                            {stats.completed > 0 && (
                                <span className="text-green-600">{stats.completed} ✓</span>
                            )}
                        </div>
                    )}

                    {/* Add subtask button */}
                    {onAddSubtask && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddSubtask(node); }}
                            className="p-1 hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100"
                            title="Adicionar subtarefa"
                        >
                            <Plus size={14} className="text-slate-500" />
                        </button>
                    )}
                </div>

                {/* Children */}
                {hasChildren && isExpanded && (
                    <div className="relative">
                        {/* Tree line */}
                        <div
                            className="absolute w-px bg-slate-200"
                            style={{
                                left: `${node.depth * 24 + 22}px`,
                                top: 0,
                                bottom: 0,
                            }}
                        />
                        {node.children.map((child, index) => renderNode(child, index === node.children.length - 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-700">Hierarquia</h3>
                    <span className="text-sm text-slate-500">
                        {hierarchyTree.length} raízes, {cards.length} total
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={expandAll}
                        className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
                    >
                        Expandir Tudo
                    </button>
                    <button
                        onClick={collapseAll}
                        className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
                    >
                        Colapsar Tudo
                    </button>
                </div>
            </div>

            {/* Tree content */}
            <div className="flex-1 overflow-y-auto p-2">
                {hierarchyTree.length > 0 ? (
                    hierarchyTree.map((node, index) => renderNode(node, index === hierarchyTree.length - 1))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <div className="text-4xl mb-2">🌳</div>
                        <p>Nenhum card encontrado</p>
                        <p className="text-xs mt-1">
                            Use o campo "Tarefa Pai" nos cards para criar hierarquias
                        </p>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="p-2 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <span className="w-1 h-3 bg-red-500 rounded" /> Alta
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-1 h-3 bg-amber-500 rounded" /> Média
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-1 h-3 bg-green-500 rounded" /> Baixa
                    </span>
                    <span className="ml-auto">
                        💡 Clique nos cards para ver detalhes
                    </span>
                </div>
            </div>
        </div>
    );
};

export default HierarchyView;
