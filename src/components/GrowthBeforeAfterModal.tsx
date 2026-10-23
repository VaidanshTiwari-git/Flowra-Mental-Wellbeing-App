import React from 'react';
import { ThemeMode, CompanionState } from '../types';
import {
  TrendingUp,
  X,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  Zap,
  Shield,
  Smartphone,
  Clock,
} from 'lucide-react';

interface GrowthBeforeAfterModalProps {
  isOpen: boolean;
  onClose: () => void;
  companion: CompanionState;
  currentDay: number;
  totalDays: number;
  streak: number;
  userGoal: string;
  themeMode?: ThemeMode;
}

export const GrowthBeforeAfterModal: React.FC<GrowthBeforeAfterModalProps> = ({
  isOpen,
  onClose,
  companion,
  currentDay,
  totalDays,
  streak,
  userGoal,
  themeMode = 'dark',
}) => {
  if (!isOpen) return null;

  const aura = companion.aura || 0;
  const hoursReclaimed = Math.round((currentDay * 1.5 * 10)) / 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] rounded-3xl p-5 sm:p-6 shadow-2xl border flex flex-col overflow-y-auto ${
          themeMode === 'light'
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[#0B0F17] border-zinc-800 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                <span>Before & After Transformation</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Day {currentDay} of {totalDays}
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Visualizing your compounding mental capital and reclaimed screen time
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

        {/* Big Before vs After Comparison Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* BEFORE CARD */}
          <div className="p-4 rounded-3xl bg-zinc-950/70 border border-rose-500/30 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                <span>🔴 BEFORE FLOWRA</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-semibold">Day 0 Baseline</span>
            </div>

            <div className="flex flex-col gap-2.5 text-xs text-zinc-300">
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Passive Phone Screen-Time</span>
                <span className="text-rose-400 font-bold font-mono">5h 20m / day</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Dopamine Triggers</span>
                <span className="text-rose-300 font-bold">Unfiltered Reels & Feeds</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Aura Points</span>
                <span className="text-zinc-500 font-mono">0 Aura</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Companion Mascot</span>
                <span className="text-zinc-400">Dormant Seed / Unhatched</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Goal Momentum</span>
                <span className="text-rose-400 font-bold">Fragmented & Inconsistent</span>
              </div>
            </div>
          </div>

          {/* AFTER CARD */}
          <div className="p-4 rounded-3xl bg-emerald-950/20 border border-emerald-500/40 flex flex-col gap-3 shadow-[0_0_20px_rgba(52,211,153,0.15)]">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40">
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <span>🟢 CURRENT FLOWRA STATE</span>
              </span>
              <span className="text-[10px] text-emerald-300 font-bold">Day {currentDay} Growth</span>
            </div>

            <div className="flex flex-col gap-2.5 text-xs text-zinc-200">
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-zinc-300">Reclaimed Deep Focus Time</span>
                <span className="text-emerald-400 font-bold font-mono">+{hoursReclaimed} Hours Deep Work</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-zinc-300">Active Daily Streak</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3" /> {streak} Days Unbroken
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-zinc-300">Total Aura Generated</span>
                <span className="text-emerald-300 font-extrabold font-mono text-sm">
                  {aura} Aura Points
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-zinc-300">Companion Evolution</span>
                <span className="text-emerald-400 font-bold">
                  {companion.name} (Level {Math.floor(aura / 100) + 1})
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-zinc-300">Core Mastery Retention</span>
                <span className="text-cyan-400 font-bold">10-MCQ Active Recall</span>
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Infinity Lore */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-emerald-950/30 to-indigo-950/40 border border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xl font-bold">
              ∞
            </div>
            <div>
              <div className="text-xs font-black text-cyan-300">
                Final Goal: "Your Aura Becomes ∞"
              </div>
              <div className="text-[11px] text-zinc-300 mt-0.5">
                Upon completing your full {totalDays}-day plan, unlock the legendary Infinity Aura ascension screen & certificate!
              </div>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
        </div>
      </div>
    </div>
  );
};
