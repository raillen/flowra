import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Clock, User, Tag, AlertCircle } from 'lucide-react';
import { Badge } from '../ui';

/**
 * Presentation Mode component
 * Fullscreen view for daily standups and team reviews
 */
const PresentationMode = ({ isOpen, onClose, cards = [], currentIndex = 0, onIndexChange }) => {
    const [index, setIndex] = useState(currentIndex);

    const currentCard = cards[index];

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                goNext();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goPrev();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, index]);

    const goNext = useCallback(() => {
        setIndex(prev => {
            const next = prev < cards.length - 1 ? prev + 1 : 0;
            onIndexChange?.(next);
            return next;
        });
    }, [cards.length, onIndexChange]);

    const goPrev = useCallback(() => {
        setIndex(prev => {
            const next = prev > 0 ? prev - 1 : cards.length - 1;
            onIndexChange?.(next);
            return next;
        });
    }, [cards.length, onIndexChange]);

    if (!isOpen || !currentCard) return null;

    const priorityColors = {
        urgente: 'bg-red-500',
        alta: 'bg-orange-500',
        media: 'bg-yellow-500',
        baixa: 'bg-green-500'
    };

    const statusColors = {
        todo: 'bg-slate-500',
        in_progress: 'bg-blue-500',
        review: 'bg-purple-500',
        done: 'bg-emerald-500'
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-4 bg-black/50">
                <div className="flex items-center gap-4">
                    <Maximize2 className="text-white/50" size={20} />
                    <span className="text-white/70 font-medium">Modo Apresentação</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-white/50 text-sm">
                        {index + 1} de {cards.length}
                    </span>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="text-white" size={24} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-16">
                <div className="max-w-4xl w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 animate-fade-in">
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                {currentCard.title}
                            </h1>
                            {currentCard.column?.name && (
                                <Badge className="text-sm">{currentCard.column.name}</Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {currentCard.priority && (
                                <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${priorityColors[currentCard.priority] || 'bg-slate-500'}`}>
                                    {currentCard.priority}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        {/* Left: Description */}
                        <div>
                            {currentCard.description ? (
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                                        {currentCard.description}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-slate-400 italic">Sem descrição</p>
                            )}
                        </div>

                        {/* Right: Metadata */}
                        <div className="space-y-4">
                            {currentCard.assignedUser && (
                                <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-700 rounded-xl">
                                    <User className="text-slate-500" size={24} />
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase">Responsável</p>
                                        <p className="text-lg font-medium text-slate-900 dark:text-white">
                                            {currentCard.assignedUser.name}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {currentCard.dueDate && (
                                <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-700 rounded-xl">
                                    <Clock className="text-slate-500" size={24} />
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase">Prazo</p>
                                        <p className="text-lg font-medium text-slate-900 dark:text-white">
                                            {new Date(currentCard.dueDate).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {currentCard.tags?.length > 0 && (
                                <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-700 rounded-xl">
                                    <Tag className="text-slate-500" size={24} />
                                    <div className="flex flex-wrap gap-2">
                                        {currentCard.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 rounded-full text-sm"
                                                style={{ backgroundColor: tag.color || '#6366f1', color: 'white' }}
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Subtasks preview */}
                    {currentCard.checklistProgress && (
                        <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-700 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle size={18} className="text-slate-500" />
                                <span className="text-sm text-slate-500">Checklist</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3">
                                <div
                                    className="bg-emerald-500 h-3 rounded-full transition-all"
                                    style={{ width: `${currentCard.checklistProgress}%` }}
                                />
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {currentCard.checklistProgress}% concluído
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-8 py-6">
                <button
                    onClick={goPrev}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
                >
                    <ChevronLeft size={24} />
                    <span>Anterior</span>
                </button>

                {/* Progress dots */}
                <div className="flex items-center gap-2">
                    {cards.slice(Math.max(0, index - 3), Math.min(cards.length, index + 4)).map((_, i) => {
                        const dotIndex = Math.max(0, index - 3) + i;
                        return (
                            <button
                                key={dotIndex}
                                onClick={() => {
                                    setIndex(dotIndex);
                                    onIndexChange?.(dotIndex);
                                }}
                                className={`w-3 h-3 rounded-full transition-all ${dotIndex === index
                                        ? 'bg-white scale-125'
                                        : 'bg-white/30 hover:bg-white/50'
                                    }`}
                            />
                        );
                    })}
                </div>

                <button
                    onClick={goNext}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
                >
                    <span>Próximo</span>
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Keyboard hint */}
            <div className="text-center pb-4">
                <p className="text-white/30 text-sm">
                    Use ← → ou Espaço para navegar • ESC para sair
                </p>
            </div>
        </div>
    );
};

export default PresentationMode;
