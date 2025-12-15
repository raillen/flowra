
import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock,
  MoreHorizontal, Plus, Filter, LayoutGrid, List
} from 'lucide-react';
import { Badge, Button } from '../ui';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth,
  isSameDay, isToday, addDays, getDay, parseISO, differenceInDays
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DndContext, useDraggable, useDroppable, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

/* --- Components --- */

/**
 * Event Pill - Represents a card in the calendar
 */
const CalendarEvent = ({ card, onClick, isDragging, style, spanIdx, spanTotal }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.id,
    data: { card }
  });

  const dndStyle = transform ? {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1, // Hide original when dragging, let overlay show
  } : undefined;

  const priorityColor = {
    alta: 'bg-red-100 text-red-700 border-l-4 border-red-500',
    media: 'bg-yellow-100 text-yellow-700 border-l-4 border-yellow-500',
    baixa: 'bg-green-100 text-green-700 border-l-4 border-green-500',
  }[card.priority || 'media'];

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...dndStyle }}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // Prevent click if dragging (handled by dnd-kit usually, but safety check)
        if (!transform) onClick && onClick(card);
      }}
      className={`
        text-xs p-1.5 mb-1 rounded shadow-sm cursor-grab active:cursor-grabbing truncate font-medium
        transition-all hover:brightness-95 hover:shadow-md
        ${priorityColor}
        ${isDragging ? 'opacity-50' : ''}
      `}
      title={`${card.title} (${card.status})`}
    >
      {card.title}
    </div>
  );
};

/**
 * Calendar Cell - A single day
 */
const CalendarDay = ({ date, cards, isCurrentMonth, isToday, onAddCard }) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const { setNodeRef, isOver } = useDroppable({
    id: dateStr,
    data: { date }
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[120px] p-1 border-b border-r border-slate-100 transition-colors relative group
        ${isOver ? 'bg-indigo-50/50' : 'bg-white'}
        ${!isCurrentMonth ? 'bg-slate-50/30' : ''}
      `}
    >
      <div className={`
        flex items-center justify-between px-2 py-1 mb-1 rounded
        ${isToday ? 'bg-indigo-600 text-white shadow-sm' : ''}
      `}>
        <span className={`text-sm font-semibold ${!isCurrentMonth && !isToday ? 'text-slate-400' : isToday ? 'text-white' : 'text-slate-700'}`}>
          {format(date, 'd')}
        </span>
        {isToday && <span className="text-[10px] uppercase font-bold tracking-wider">Hoje</span>}

        {/* Quick Add Button (Visible on Hover) */}
        <button
          onClick={() => onAddCard && onAddCard(date)}
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-black/10 rounded transition-opacity"
          title="Adicionar card"
        >
          <Plus size={12} className={isToday ? "text-white" : "text-slate-400"} />
        </button>
      </div>

      <div className="space-y-0.5 px-0.5 pb-2">
        {cards.map((card) => (
          <CalendarEvent
            key={`${card.id}-${dateStr}`} // Key needs to be unique per cell if spanning
            card={card}
          // onClick handler passed from parent
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Main View
 */

const CalendarView = ({ cards, onCardClick, onCardUpdate, onAddCard }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState('month'); // 'month', 'week'
  const [activeDragCard, setActiveDragCard] = useState(null);

  // -- Sensors with Activation Constraint --
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Wait for 5px movement before triggering drag
      },
    })
  );

  // -- Navigation --
  const next = () => {
    setCurrentDate(prev => viewType === 'month' ? addMonths(prev, 1) : addDays(prev, 7));
  };
  const prev = () => {
    setCurrentDate(prev => viewType === 'month' ? subMonths(prev, 1) : addDays(prev, -7));
  };
  const today = () => setCurrentDate(new Date());

  // -- Grid Generation --
  const gridDays = useMemo(() => {
    const start = viewType === 'month'
      ? startOfWeek(startOfMonth(currentDate))
      : startOfWeek(currentDate);

    const end = viewType === 'month'
      ? endOfWeek(endOfMonth(currentDate))
      : endOfWeek(currentDate);

    return eachDayOfInterval({ start, end });
  }, [currentDate, viewType]);

  // -- Card Mapping --
  const getCardsForDay = (day) => {
    return cards.filter(card => {
      if (!card.dueDate) return false;

      const due = new Date(card.dueDate);
      const start = card.startDate ? new Date(card.startDate) : due;

      const check = new Date(day); check.setHours(0, 0, 0, 0);
      const d = new Date(due); d.setHours(0, 0, 0, 0);
      const s = new Date(start); s.setHours(0, 0, 0, 0);

      return check >= s && check <= d;
    });
  };

  // -- DnD Handlers --
  const handleDragStart = (event) => {
    setActiveDragCard(event.active.data.current?.card);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragCard(null);

    if (over && active.id && over.id) {
      const targetDateStr = over.id; // YYYY-MM-DD
      const card = cards.find(c => c.id === active.id);

      if (card && onCardUpdate) {
        const oldDue = new Date(card.dueDate);
        const newDueTarget = parseISO(targetDateStr);
        newDueTarget.setHours(12, 0, 0, 0);

        const updates = { dueDate: newDueTarget };

        if (card.startDate) {
          const oldStart = new Date(card.startDate);
          const diffDays = differenceInDays(newDueTarget, oldDue);
          const newStart = addDays(oldStart, diffDays);
          updates.startDate = newStart;
        }

        onCardUpdate(card.id, updates);
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewType('month')}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${viewType === 'month' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Mês
              </button>
              <button
                onClick={() => setViewType('week')}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${viewType === 'week' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Semana
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={today}>Hoje</Button>
            <div className="flex items-center rounded-lg border border-slate-200">
              <button onClick={prev} className="p-2 hover:bg-slate-50 border-r border-slate-200 text-slate-600"><ChevronLeft size={16} /></button>
              <button onClick={next} className="p-2 hover:bg-slate-50 text-slate-600"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className={`flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto`}>
            {gridDays.map(day => (
              <CalendarDay
                key={day.toISOString()}
                date={day}
                cards={getCardsForDay(day)}
                isCurrentMonth={isSameMonth(day, currentDate)}
                isToday={isToday(day)}
                onAddCard={() => onAddCard && onAddCard(null)}
              />
            ))}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeDragCard ? (
            <div className={`
              px-3 py-2 rounded shadow-xl font-medium text-sm
              bg-indigo-600 text-white transform -rotate-2 cursor-grabbing pointer-events-none opacity-90
            `}>
              {activeDragCard.title}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};


export default CalendarView;

