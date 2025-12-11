
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { Badge } from '../ui';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

/**
 * Draggable Card Component for Calendar
 */
const DraggableCalendarCard = ({ card, onClick, priorityColor }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { card }
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  } : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (!isDragging) onClick && onClick(card);
      }}
      className={`w-full text-left p-1.5 rounded text-xs border ${priorityColor
        } hover:opacity-80 transition-opacity truncate touch-none select-none`}
      title={card.title}
    >
      <div className="flex items-center gap-1">
        <div
          className={`h-1.5 w-1.5 rounded-full ${card.priority === 'alta'
            ? 'bg-red-500'
            : card.priority === 'media'
              ? 'bg-yellow-500'
              : 'bg-green-500'
            }`}
        ></div>
        <span className="truncate">{card.title}</span>
      </div>
      {card.assignedUser && (
        <div className="flex items-center gap-1 mt-0.5">
          <User size={10} />
          <span className="text-[10px] truncate">{card.assignedUser.name}</span>
        </div>
      )}
    </button>
  );
};

/**
 * Droppable Day Component
 */
const DroppableDay = ({ date, children, isToday, isPast, dayNumber }) => {
  const dateStr = date.toISOString().split('T')[0];
  const { setNodeRef, isOver } = useDroppable({
    id: dateStr,
    data: { date }
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] p-2 rounded-lg border-2 transition-colors ${isOver
        ? 'bg-indigo-100 border-indigo-400'
        : isToday
          ? 'bg-indigo-50 border-indigo-400'
          : isPast
            ? 'bg-slate-50 border-slate-200'
            : 'bg-white border-slate-200'
        }`}
    >
      <div
        className={`text-sm font-semibold mb-2 ${isToday ? 'text-indigo-700' : isPast ? 'text-slate-400' : 'text-slate-700'
          }`}
      >
        {dayNumber}
      </div>
      {children}
    </div>
  );
};

/**
 * Calendar View Component
 * Displays cards organized by due date in a calendar format
 */
const CalendarView = ({ cards, onCardClick, onCardUpdate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get first day of month and number of days
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const startingDayOfWeek = monthStart.getDay();

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Group cards by date
  const cardsByDate = useMemo(() => {
    const grouped = {};
    cards.forEach((card) => {
      if (card.dueDate) {
        const date = new Date(card.dueDate);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(card);
      }
    });
    return grouped;
  }, [cards]);

  // Get cards for a specific date
  const getCardsForDate = (dateObj) => {
    const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    return cardsByDate[dateKey] || [];
  };

  // Check if date is today
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is in the past
  const isPast = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta':
        return 'bg-red-100 border-red-300 text-red-700';
      case 'media':
        return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      case 'baixa':
        return 'bg-green-100 border-green-300 text-green-700';
      default:
        return 'bg-slate-100 border-slate-300 text-slate-700';
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id && over.id) {
      const dateStr = over.id; // ISO string 2023-12-10
      // Call parent update
      if (onCardUpdate) {
        // Create date object at noon to avoid timezone overlaps on minimal adjustments
        const newDate = new Date(dateStr + 'T12:00:00');
        onCardUpdate(active.id, { dueDate: newDate });
      }
    }
  };

  // Month names
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Generate calendar days
  const calendarDays = [];

  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Get overdue cards (no due date but should be done)
  const overdueCards = cards.filter((card) => {
    if (!card.dueDate) return false;
    const dueDate = new Date(card.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });

  // Get upcoming cards (next 7 days)
  const upcomingCards = cards.filter((card) => {
    if (!card.dueDate) return false;
    const dueDate = new Date(card.dueDate);
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate >= today && dueDate <= nextWeek;
  });

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col animate-in fade-in p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon size={24} className="text-indigo-600" />
              Calendário
            </h2>
            <Badge color="bg-indigo-100 text-indigo-700">
              {cards.filter((c) => c.dueDate).length} cards com data
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200"
            >
              Hoje
            </button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border border-slate-200">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <h3 className="text-xl font-bold text-slate-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Overdue and Upcoming Cards */}
        {(overdueCards.length > 0 || upcomingCards.length > 0) && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {overdueCards.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  Atrasados ({overdueCards.length})
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {overdueCards.slice(0, 3).map((card) => (
                    <div
                      key={card.id}
                      onClick={() => onCardClick && onCardClick(card)}
                      className="w-full text-left p-2 bg-white rounded border border-red-200 hover:border-red-300 transition-colors cursor-pointer"
                    >
                      <p className="text-sm font-medium text-slate-800 truncate">{card.title}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(card.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                  {overdueCards.length > 3 && (
                    <p className="text-xs text-red-600">+{overdueCards.length - 3} mais</p>
                  )}
                </div>
              </div>
            )}

            {upcomingCards.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  Próximos 7 dias ({upcomingCards.length})
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {upcomingCards.slice(0, 3).map((card) => (
                    <div
                      key={card.id}
                      onClick={() => onCardClick && onCardClick(card)}
                      className="w-full text-left p-2 bg-white rounded border border-blue-200 hover:border-blue-300 transition-colors cursor-pointer"
                    >
                      <p className="text-sm font-medium text-slate-800 truncate">{card.title}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(card.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                  {upcomingCards.length > 3 && (
                    <p className="text-xs text-blue-600">+{upcomingCards.length - 3} mais</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto bg-white rounded-lg border border-slate-200 p-4">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-slate-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="min-h-[100px]"></div>;
              }

              const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dayCards = getCardsForDate(dateObj);
              const isTodayDate = isToday(day);
              const isPastDate = isPast(day);

              return (
                <DroppableDay
                  key={day}
                  date={dateObj}
                  isToday={isTodayDate}
                  isPast={isPastDate}
                  dayNumber={day}
                >
                  <div className="space-y-1">
                    {dayCards.map((card) => (
                      <DraggableCalendarCard
                        key={card.id}
                        card={card}
                        onClick={onCardClick}
                        priorityColor={getPriorityColor(card.priority || 'media')}
                      />
                    ))}
                  </div>
                </DroppableDay>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span>Alta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <span>Média</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span>Baixa</span>
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default CalendarView;

