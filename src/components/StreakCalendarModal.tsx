import React, { useState } from 'react';
import { CalendarEvent, ThemeMode } from '../types';
import {
  Flame,
  Calendar as CalendarIcon,
  Plus,
  X,
  Clock,
  Bell,
  CheckCircle2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StreakCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
  currentDay: number;
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  themeMode?: ThemeMode;
}

export const StreakCalendarModal: React.FC<StreakCalendarModalProps> = ({
  isOpen,
  onClose,
  streak,
  currentDay,
  events,
  onAddEvent,
  onDeleteEvent,
  themeMode = 'dark',
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('09:00');
  const [newEventType, setNewEventType] = useState<'reminder' | 'event' | 'lesson'>('lesson');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  // Trigger streak confetti celebration
  const triggerStreakConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#F59E0B', '#EF4444', '#EC4899'],
    });
  };

  // Generate calendar days for current month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    onAddEvent({
      date: selectedDate,
      time: newEventTime,
      title: newEventTitle.trim(),
      type: newEventType,
      isCompleted: false,
    });

    setNewEventTitle('');
    setIsAdding(false);
    triggerStreakConfetti();
  };

  const selectedDateEvents = events.filter((ev) => ev.date === selectedDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border flex flex-col max-h-[90vh] overflow-y-auto ${
          themeMode === 'light'
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[#0F141C] border-zinc-800 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-700/40">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <Flame className="w-7 h-7 text-amber-500 animate-bounce" />
              <div className="absolute inset-0 bg-amber-500/30 blur-md rounded-full" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                <span>Streak Calendar</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                  {streak} Days Active 🔥
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                {monthNames[month]} {year} • Add custom lesson & study reminders
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Flame Celebration Banner */}
        <div
          onClick={triggerStreakConfetti}
          className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-between cursor-pointer hover:border-amber-500/60 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/30 border border-amber-500/50 flex items-center justify-center text-lg animate-pulse">
              🔥
            </div>
            <div>
              <div className="text-xs font-black text-amber-300">
                {streak}-Day Fire Active! Tap for Confetti 🎉
              </div>
              <div className="text-[10px] text-zinc-400">
                Keep the flame alive daily to protect your companion from jail.
              </div>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        {/* Calendar Grid */}
        <div className="mt-4">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-500 mb-1">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Empty offset padding */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9 sm:h-10" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dayNum === today.getDate();
              const isPastStreak = dayNum <= today.getDate() && dayNum > Math.max(0, today.getDate() - streak);
              const isSelected = selectedDate === dateStr;
              const hasEvents = events.some((ev) => ev.date === dateStr);

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-9 sm:h-10 rounded-xl relative flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-black font-black ring-2 ring-emerald-400 shadow-md'
                      : isToday
                      ? 'bg-zinc-800 border border-emerald-500/50 text-white font-bold'
                      : 'hover:bg-zinc-800/60 text-zinc-300'
                  }`}
                >
                  <span className="text-xs">{dayNum}</span>

                  {/* Flame Badge on active streak days */}
                  {isPastStreak && (
                    <span className="absolute -top-1 -right-1 text-[10px] animate-pulse">🔥</span>
                  )}

                  {/* Dot if custom event is scheduled */}
                  {hasEvents && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Events & Reminders */}
        <div className="mt-4 pt-3 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Events on {selectedDate}</span>
            </h3>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
            >
              <Plus className="w-3 h-3" />
              <span>Add Reminder</span>
            </button>
          </div>

          {/* Add Event Form */}
          {isAdding && (
            <form onSubmit={handleCreateEvent} className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-700 mb-3 flex flex-col gap-2">
              <input
                type="text"
                placeholder="Reminder title (e.g. 6000-Word DSA Module 2, LeetCode Blind-75)"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="bg-transparent text-xs text-white focus:outline-none w-full"
                  />
                </div>

                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as any)}
                  className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="lesson">📖 Lesson Reminder</option>
                  <option value="reminder">⏰ Focus Reminder</option>
                  <option value="event">🏆 Exam / Mock Event</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg shadow"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          )}

          {/* Event List */}
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
            {selectedDateEvents.length === 0 ? (
              <p className="text-xs text-zinc-500 py-3 text-center">
                No reminders for this day. Tap "+ Add Reminder" to set one!
              </p>
            ) : (
              selectedDateEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {ev.type === 'lesson' ? '📖' : ev.type === 'event' ? '🏆' : '⏰'}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">{ev.title}</div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{ev.time || 'All Day'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteEvent(ev.id)}
                    className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
