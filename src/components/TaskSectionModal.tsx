import React, { useState } from 'react';
import { HabitItem, ThemeMode } from '../types';
import {
  CheckSquare,
  Plus,
  Flame,
  CheckCircle2,
  Trash2,
  X,
  Sparkles,
  Heart,
  Droplets,
  Footprints,
  BookOpen,
  Sun,
  Smile,
  Shield,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: HabitItem[];
  onToggleHabit: (id: string) => void;
  onAddHabit: (habit: Omit<HabitItem, 'id' | 'isCompletedToday' | 'streak'>) => void;
  onDeleteHabit: (id: string) => void;
  themeMode?: ThemeMode;
}

export const TaskSectionModal: React.FC<TaskSectionModalProps> = ({
  isOpen,
  onClose,
  habits,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
  themeMode = 'dark',
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<HabitItem['category']>('health');
  const [newFrequency, setNewFrequency] = useState<HabitItem['frequency']>('daily');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    onToggleHabit(id);
    if (!currentlyCompleted) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#FBBF24'],
      });
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddHabit({
      title: newTitle.trim(),
      category: newCategory,
      frequency: newFrequency,
      auraReward: 10,
      icon: newCategory === 'health' ? '💪' : newCategory === 'mindfulness' ? '🧘' : newCategory === 'lifestyle' ? '☀️' : '⚡',
    });

    setNewTitle('');
    setIsAdding(false);
  };

  const completedCount = habits.filter((h) => h.isCompletedToday).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-xl max-h-[90vh] rounded-3xl p-5 sm:p-6 shadow-2xl border flex flex-col overflow-hidden ${
          themeMode === 'light'
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[#0B0F17] border-zinc-800 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                <span>Daily Life & Habit Stack</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {completedCount}/{habits.length} Done Today
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Habits & routine anchors outside exam prep • Earn +10 Aura each
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

        {/* Progress Tracker */}
        <div className="mt-3 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <div className="text-xs font-bold text-white">Daily Habit Completion</div>
            <div className="text-[10px] text-zinc-400">
              Small non-negotiable anchors build foundational self-discipline.
            </div>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-extrabold text-xs flex items-center gap-1 shadow transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Habit</span>
          </button>
        </div>

        {/* Add Habit Form */}
        {isAdding && (
          <form onSubmit={handleCreate} className="mt-3 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-700 flex flex-col gap-2 shrink-0 animate-fadeIn">
            <input
              type="text"
              placeholder="Habit title (e.g. Drink 2L Water, 15m Morning Walk, 10 Pages Reading)..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="health">💪 Health & Fitness</option>
                <option value="mindfulness">🧘 Mindfulness & Breath</option>
                <option value="lifestyle">☀️ Lifestyle & Routine</option>
                <option value="learning">📖 General Learning</option>
              </select>

              <select
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value as any)}
                className="bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="daily">Everyday Daily</option>
                <option value="weekdays">Weekdays Only</option>
                <option value="custom">Custom Schedule</option>
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
                className="px-3.5 py-1 bg-teal-500 hover:bg-teal-400 text-black text-xs font-bold rounded-xl shadow"
              >
                Create Habit (+10 Aura)
              </button>
            </div>
          </form>
        )}

        {/* Habit List */}
        <div className="flex-1 overflow-y-auto my-3 pr-1 flex flex-col gap-2">
          {habits.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No habits created yet. Tap "+ Add Custom Habit" to build your daily routine!
            </div>
          ) : (
            habits.map((habit) => (
              <div
                key={habit.id}
                onClick={() => handleToggle(habit.id, habit.isCompletedToday)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  habit.isCompletedToday
                    ? 'bg-teal-950/20 border-teal-500/40 text-white'
                    : 'bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                      habit.isCompletedToday
                        ? 'bg-teal-500 border-teal-400 text-black'
                        : 'border-zinc-700 bg-zinc-950 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>

                  <div>
                    <div
                      className={`text-xs font-bold ${
                        habit.isCompletedToday ? 'line-through text-zinc-400' : 'text-white'
                      }`}
                    >
                      <span className="mr-1.5">{habit.icon || '⚡'}</span>
                      <span>{habit.title}</span>
                    </div>

                    <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                      <span className="capitalize">{habit.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                        <Flame className="w-2.5 h-2.5" /> {habit.streak}d streak
                      </span>
                      <span>•</span>
                      <span className="text-teal-400 font-bold">+{habit.auraReward} Aura</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHabit(habit.id);
                  }}
                  className="p-1 rounded-lg text-zinc-600 hover:text-rose-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
