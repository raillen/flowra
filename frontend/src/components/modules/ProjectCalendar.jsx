import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Layout,
  CreditCard,
  FileText,
  Bell,
  X,
  Clock,
  Folder,
} from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../config/api';
import { Modal, Button } from '../ui';

/**
 * ProjectCalendar Module
 * Integrated calendar showing cards, notes, and events
 * 
 * @module components/modules/ProjectCalendar
 */
const ProjectCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, agenda
  const [items, setItems] = useState({ cards: [], notes: [], events: [], all: [] });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, cards, notes, events
  const { navigateTo, setActiveBoardId, setActiveProjectId } = useNavigation();
  const { confirm } = useToast();

  // Calculate date range based on view
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (view === 'month') {
      start.setDate(1);
      start.setDate(start.getDate() - start.getDay());
      end.setMonth(end.getMonth() + 1, 0);
      end.setDate(end.getDate() + (6 - end.getDay()));
    } else if (view === 'week') {
      start.setDate(start.getDate() - start.getDay());
      end.setDate(start.getDate() + 6);
    } else {
      end.setMonth(end.getMonth() + 1);
    }

    return { start, end };
  }, [currentDate, view]);

  // Fetch calendar items
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await api.get('/calendar', {
          params: {
            startDate: dateRange.start.toISOString(),
            endDate: dateRange.end.toISOString(),
          },
        });
        setItems(response.data.data);
      } catch (error) {
        console.error('Error fetching calendar:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [dateRange]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (filter === 'all') return items.all;
    return items[filter] || [];
  }, [items, filter]);

  // Navigate months
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  // Handle item click
  const handleItemClick = (item) => {
    if (item.type === 'card') {
      setActiveProjectId(item.projectId);
      setActiveBoardId(item.boardId);
      navigateTo('kanban');
    } else if (item.type === 'note') {
      navigateTo('notes');
    } else {
      setSelectedItem(item);
    }
  };

  // Get items for a specific date
  const getItemsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredItems.filter((item) => {
      const itemDate = new Date(item.date).toISOString().split('T')[0];
      return itemDate === dateStr;
    });
  };

  // Format month header
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-secondary-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-secondary-800 flex items-center gap-2">
            <CalendarIcon className="text-primary-500" size={24} />
            Calendário
          </h1>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button onClick={goToPrevious} className="p-2 hover:bg-secondary-100 rounded-lg">
              <ChevronLeft size={18} />
            </button>
            <button onClick={goToToday} className="px-3 py-1.5 text-sm font-medium bg-secondary-100 hover:bg-secondary-200 rounded-lg">
              Hoje
            </button>
            <button onClick={goToNext} className="p-2 hover:bg-secondary-100 rounded-lg">
              <ChevronRight size={18} />
            </button>
            <span className="text-lg font-semibold text-secondary-800 ml-2">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-secondary-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="all">Todos</option>
            <option value="cards">Cards</option>
            <option value="notes">Notas</option>
            <option value="events">Eventos</option>
          </select>

          {/* View switcher */}
          <div className="flex bg-secondary-100 rounded-lg p-1">
            {['month', 'week', 'agenda'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === v ? 'bg-white shadow-sm text-secondary-800' : 'text-secondary-600 hover:text-secondary-800'
                  }`}
              >
                {v === 'month' ? 'Mês' : v === 'week' ? 'Semana' : 'Agenda'}
              </button>
            ))}
          </div>

          {/* Add event */}
          <Button icon={Plus} onClick={() => setShowEventModal(true)}>
            Evento
          </Button>
        </div>
      </div>

      {/* Calendar content */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : view === 'month' ? (
          <MonthView
            currentDate={currentDate}
            dayNames={dayNames}
            getItemsForDate={getItemsForDate}
            onItemClick={handleItemClick}
          />
        ) : view === 'week' ? (
          <WeekView
            currentDate={currentDate}
            dayNames={dayNames}
            getItemsForDate={getItemsForDate}
            onItemClick={handleItemClick}
          />
        ) : (
          <AgendaView items={filteredItems} onItemClick={handleItemClick} />
        )}
      </div>

      {/* Event modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSave={(event) => {
          setItems((prev) => ({
            ...prev,
            events: [...prev.events, event],
            all: [...prev.all, event].sort((a, b) => new Date(a.date) - new Date(b.date)),
          }));
          setShowEventModal(false);
        }}
      />

      {/* Event details modal */}
      <EventDetailsModal
        event={selectedItem}
        isOpen={!!selectedItem && selectedItem.type === 'event'}
        onClose={() => setSelectedItem(null)}
        onDelete={async (id) => {
          try {
            await api.delete(`/calendar/events/${id}`);
            setItems((prev) => ({
              ...prev,
              events: prev.events.filter((e) => e.id !== id),
              all: prev.all.filter((e) => e.id !== id),
            }));
            setSelectedItem(null);
          } catch (error) {
            console.error('Error deleting event:', error);
          }
        }}
        onUpdate={(updatedEvent) => {
          setItems((prev) => ({
            ...prev,
            events: prev.events.map((e) => e.id === updatedEvent.id ? updatedEvent : e),
            all: prev.all.map((e) => e.id === updatedEvent.id ? updatedEvent : e),
          }));
          setSelectedItem(updatedEvent);
        }}
        confirmFn={confirm}
      />
    </div>
  );
};

/**
 * Month View Component
 */
const MonthView = ({ currentDate, dayNames, getItemsForDate, onItemClick }) => {
  // Generate calendar grid
  const days = useMemo(() => {
    const result = [];
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      result.push(date);
    }
    return result;
  }, [currentDate]);

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = currentDate.getMonth();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="grid grid-cols-7 gap-px bg-secondary-200 rounded-t-xl overflow-hidden">
        {dayNames.map((day) => (
          <div key={day} className="bg-secondary-50 py-3 text-center text-sm font-semibold text-secondary-600">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-secondary-200 rounded-b-xl overflow-hidden">
        {days.map((date, idx) => {
          const dateStr = date.toISOString().split('T')[0];
          const isToday = dateStr === today;
          const isCurrentMonth = date.getMonth() === currentMonth;
          const dayItems = getItemsForDate(date);

          return (
            <div
              key={idx}
              className={`bg-white p-1.5 min-h-[100px] flex flex-col ${!isCurrentMonth ? 'bg-secondary-50/50' : ''
                }`}
            >
              <div className={`w-7 h-7 flex items-center justify-center text-sm font-medium mb-1 ${isToday
                ? 'bg-primary-600 text-white rounded-full'
                : isCurrentMonth
                  ? 'text-secondary-800'
                  : 'text-secondary-400'
                }`}>
                {date.getDate()}
              </div>

              <div className="flex-1 space-y-0.5 overflow-hidden">
                {dayItems.slice(0, 3).map((item, i) => (
                  <CalendarItem key={i} item={item} onClick={() => onItemClick(item)} compact />
                ))}
                {dayItems.length > 3 && (
                  <span className="text-xs text-secondary-500 pl-1">
                    +{dayItems.length - 3} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Week View Component
 */
const WeekView = ({ currentDate, dayNames, getItemsForDate, onItemClick }) => {
  const days = useMemo(() => {
    const result = [];
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      result.push(date);
    }
    return result;
  }, [currentDate]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="grid grid-cols-7 gap-4 h-full">
      {days.map((date, idx) => {
        const dateStr = date.toISOString().split('T')[0];
        const isToday = dateStr === today;
        const dayItems = getItemsForDate(date);

        return (
          <div
            key={idx}
            className={`flex flex-col bg-white rounded-xl border ${isToday ? 'border-primary-300 ring-2 ring-primary-100' : 'border-secondary-200'
              }`}
          >
            <div className={`p-3 border-b text-center ${isToday ? 'bg-primary-50' : 'bg-secondary-50'}`}>
              <div className="text-xs text-secondary-500 uppercase">{dayNames[idx]}</div>
              <div className={`text-lg font-bold ${isToday ? 'text-primary-600' : 'text-secondary-800'}`}>
                {date.getDate()}
              </div>
            </div>
            <div className="flex-1 p-2 space-y-1 overflow-y-auto">
              {dayItems.map((item, i) => (
                <CalendarItem key={i} item={item} onClick={() => onItemClick(item)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Agenda View Component
 */
const AgendaView = ({ items, onItemClick }) => {
  // Group by date
  const grouped = useMemo(() => {
    const groups = {};
    items.forEach((item) => {
      const dateStr = new Date(item.date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(item);
    });
    return groups;
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-secondary-500">
        <CalendarIcon size={48} className="text-secondary-300 mb-4" />
        <p>Nenhum item no período selecionado</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {Object.entries(grouped).map(([date, dateItems]) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-secondary-500 uppercase mb-2 capitalize">
            {date}
          </h3>
          <div className="space-y-2">
            {dateItems.map((item, i) => (
              <CalendarItem key={i} item={item} onClick={() => onItemClick(item)} expanded />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Calendar Item Component
 */
const CalendarItem = ({ item, onClick, compact, expanded }) => {
  const icons = { card: CreditCard, note: FileText, event: Bell };
  const Icon = icons[item.type] || CalendarIcon;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left px-1.5 py-0.5 text-xs rounded truncate transition-colors hover:opacity-80"
        style={{ backgroundColor: item.color + '20', color: item.color, borderLeft: `2px solid ${item.color}` }}
      >
        {item.title}
      </button>
    );
  }

  if (expanded) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left p-4 bg-white border border-secondary-200 rounded-xl hover:shadow-md transition-all flex items-start gap-4"
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: item.color + '20' }}
        >
          <Icon size={18} style={{ color: item.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-secondary-800">{item.title}</h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-secondary-500">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {new Date(item.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {item.projectName && (
              <span className="flex items-center gap-1">
                <Folder size={12} />
                {item.projectName}
              </span>
            )}
            {item.boardName && (
              <span className="flex items-center gap-1">
                <Layout size={12} />
                {item.boardName}
              </span>
            )}
          </div>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium capitalize"
          style={{ backgroundColor: item.color + '20', color: item.color }}
        >
          {item.type === 'card' ? 'Card' : item.type === 'note' ? 'Nota' : 'Evento'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-2 py-1.5 text-xs rounded-lg truncate transition-colors hover:opacity-80 flex items-center gap-1.5"
      style={{ backgroundColor: item.color + '15', borderLeft: `3px solid ${item.color}` }}
    >
      <Icon size={12} style={{ color: item.color }} />
      <span className="truncate">{item.title}</span>
    </button>
  );
};

/**
 * Event Modal Component
 */
const EventModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [color, setColor] = useState('#3b82f6');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.post('/calendar/events', {
        title,
        description,
        startAt: new Date(startAt).toISOString(),
        endAt: endAt ? new Date(endAt).toISOString() : null,
        allDay,
        color,
      });

      onSave({
        ...response.data.data,
        type: 'event',
        date: response.data.data.startAt,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setStartAt('');
      setEndAt('');
      setAllDay(false);
      setColor('#3b82f6');
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setSaving(false);
    }
  };

  const colors = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Evento" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="Nome do evento"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            rows={3}
            placeholder="Detalhes (opcional)"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allDay"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            className="rounded border-secondary-300"
          />
          <label htmlFor="allDay" className="text-sm text-secondary-700">Dia inteiro</label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Início</label>
            <input
              type={allDay ? 'date' : 'datetime-local'}
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Fim (opcional)</label>
            <input
              type={allDay ? 'date' : 'datetime-local'}
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">Cor</label>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-secondary-400 scale-110' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={saving}>Criar Evento</Button>
        </div>
      </form>
    </Modal>
  );
};

/**
 * Event Details Modal Component
 */
const EventDetailsModal = ({ event, isOpen, onClose, onDelete, onUpdate, confirmFn }) => {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [color, setColor] = useState('#3b82f6');

  const colors = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  // Initialize form when entering edit mode
  const handleStartEdit = () => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setAllDay(event.allDay || false);
      setColor(event.color || '#3b82f6');

      // Format dates for datetime-local input
      const eventDate = new Date(event.date || event.startAt);
      if (event.allDay) {
        setStartAt(eventDate.toISOString().split('T')[0]);
      } else {
        setStartAt(eventDate.toISOString().slice(0, 16));
      }

      if (event.endAt) {
        const endDate = new Date(event.endAt);
        if (event.allDay) {
          setEndAt(endDate.toISOString().split('T')[0]);
        } else {
          setEndAt(endDate.toISOString().slice(0, 16));
        }
      } else {
        setEndAt('');
      }
    }
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const response = await api.put(`/calendar/events/${event.id}`, {
        title,
        description,
        startAt: new Date(startAt).toISOString(),
        endAt: endAt ? new Date(endAt).toISOString() : null,
        allDay,
        color,
      });

      if (onUpdate) {
        onUpdate({
          ...response.data.data,
          type: 'event',
          date: response.data.data.startAt,
        });
      }
      setEditing(false);
    } catch (error) {
      console.error('Error updating event:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!event) return null;

  const handleDelete = async () => {
    if (confirmFn) {
      const confirmed = await confirmFn({
        title: 'Excluir Evento',
        message: 'Tem certeza que deseja excluir este evento?',
        confirmText: 'Excluir',
        variant: 'danger'
      });
      if (!confirmed) return;
    }
    setDeleting(true);
    await onDelete(event.id);
    setDeleting(false);
  };

  // Reset editing state when modal closes
  const handleClose = () => {
    setEditing(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={editing ? "Editar Evento" : "Detalhes do Evento"} maxWidth="max-w-lg">
      {editing ? (
        // Edit mode
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="Nome do evento"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              rows={3}
              placeholder="Detalhes (opcional)"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="editAllDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="rounded border-secondary-300"
            />
            <label htmlFor="editAllDay" className="text-sm text-secondary-700">Dia inteiro</label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Início</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Fim (opcional)</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Cor</label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-secondary-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-secondary-100">
            <Button variant="secondary" onClick={handleCancelEdit}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} loading={saving}>
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        // View mode
        <div className="space-y-4">
          {/* Color indicator and title */}
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: (event.color || '#3b82f6') + '20' }}
            >
              <Bell size={24} style={{ color: event.color || '#3b82f6' }} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-secondary-800">{event.title}</h3>
              {event.description && (
                <p className="text-secondary-600 mt-1">{event.description}</p>
              )}
            </div>
          </div>

          {/* Time info */}
          <div className="bg-secondary-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-3 text-secondary-700">
              <Clock size={18} className="text-secondary-400" />
              <span className="font-medium">
                {new Date(event.date || event.startAt).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            {!event.allDay && (
              <div className="flex items-center gap-3 text-secondary-600 ml-8">
                <span>
                  {new Date(event.date || event.startAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {event.endAt && (
                    <> — {new Date(event.endAt).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</>
                  )}
                </span>
              </div>
            )}
            {event.allDay && (
              <div className="text-secondary-500 ml-8 text-sm">
                Dia inteiro
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-secondary-100">
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
            >
              Excluir
            </Button>
            <Button variant="secondary" onClick={handleStartEdit}>
              Editar
            </Button>
            <Button onClick={handleClose}>
              Fechar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ProjectCalendar;
