import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Flame,
  Sparkles,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Heart,
  MessageSquare,
  ShieldCheck,
  Send,
  Zap,
  Target,
  Clock,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ThemeMode } from '../types';

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    name: string;
    avatar?: string;
    role?: string;
    goal: string;
    companionName?: string;
    companionType?: string;
    companionEmoji?: string;
    streak: number;
    aura: number;
    planDays?: number;
    bio?: string;
    tags?: string[];
    topApps?: string[];
    badges?: string[];
    isSquadLeader?: boolean;
    joinedDate?: string;
  } | null;
  onOpenSquadChat?: () => void;
  themeMode?: ThemeMode;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onOpenSquadChat,
  themeMode = 'dark',
}) => {
  const [hasSentEncouragement, setHasSentEncouragement] = useState(false);
  const [customCheer, setCustomCheer] = useState('');
  const [cheerList, setCheerList] = useState<string[]>([
    '🔥 Crushing that 24-day streak! Keep going!',
    '⚡ Inspired by your 06:30 AM morning focus sessions.',
  ]);

  if (!isOpen || !profile) return null;

  const handleSendCheer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCheer.trim()) return;
    setCheerList((prev) => [customCheer.trim(), ...prev]);
    setCustomCheer('');
    setHasSentEncouragement(true);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const getCompanionEmoji = (type?: string, fallback?: string) => {
    if (fallback) return fallback;
    if (type === 'cat') return '🐱';
    if (type === 'dog') return '🐶';
    if (type === 'owl') return '🦉';
    if (type === 'dragon') return '🐲';
    return '🌳';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`w-full max-w-md rounded-3xl border p-5 shadow-2xl relative space-y-4 ${
            themeMode === 'light'
              ? 'bg-white border-zinc-200 text-zinc-900'
              : 'bg-[#0E121B] border-emerald-500/30 text-white shadow-[0_0_50px_rgba(16,185,129,0.15)]'
          }`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Flowra Member Profile</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Hero Avatar & Identity Card */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-emerald-600 to-teal-500 flex items-center justify-center text-2xl shadow-lg border border-white/20 shrink-0">
              {profile.avatar || getCompanionEmoji(profile.companionType, profile.companionEmoji)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-base text-white truncate">{profile.name}</h3>
                {profile.isSquadLeader && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-black tracking-wider uppercase">
                    Squad Leader
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                Goal: <span className="text-emerald-400 font-semibold">{profile.goal}</span>
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-400">
                <span className="flex items-center gap-1 text-amber-400 font-black">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" /> {profile.streak}d Streak
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400 font-black">
                  <Sparkles className="w-3 h-3" /> {profile.aura} Aura
                </span>
              </div>
            </div>
          </div>

          {/* Bio / Mission Statement */}
          <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
            <span className="font-bold text-white block mb-1">Focus Mission:</span>
            {profile.bio ||
              `Dedicated to mastering ${profile.goal}. Focusing on disciplined daily sprints and eliminating social media doomscrolling with Flowra companion ${
                profile.companionName || 'AuraSprout'
              }.`}
          </div>

          {/* Companion & Plan Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <span>{getCompanionEmoji(profile.companionType, profile.companionEmoji)}</span>
                <span>Living Companion</span>
              </div>
              <div className="text-sm font-extrabold text-white mt-1">
                {profile.companionName || 'AuraSprout'}
              </div>
              <div className="text-[10px] text-emerald-400 font-bold mt-0.5">Level {Math.max(1, Math.floor(profile.aura / 250))} • Thriving</div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3 h-3 text-cyan-400" />
                <span>Roadmap Blueprint</span>
              </div>
              <div className="text-sm font-extrabold text-cyan-300 mt-1">
                {profile.planDays || 180}-Day Plan
              </div>
              <div className="text-[10px] text-zinc-400 font-semibold mt-0.5">Active Sprint Mode</div>
            </div>
          </div>

          {/* Tags / Focus Topics */}
          {profile.tags && profile.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {profile.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Row: Send High-Five or Open Squad Chat */}
          <div className="flex items-center gap-2 pt-1">
            {onOpenSquadChat && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSquadChat();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Squad Chat</span>
              </button>
            )}

            <button
              onClick={() => {
                confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                setHasSentEncouragement(true);
              }}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{hasSentEncouragement ? 'High-Five Sent! 🔥' : 'High-Five 🔥'}</span>
            </button>
          </div>

          {/* Peer Cheer Board */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <div className="text-[11px] font-extrabold text-zinc-400 flex items-center justify-between">
              <span>Peer Encouragement Feed</span>
              <span className="text-[10px] text-emerald-400 font-bold">{cheerList.length} Cheers</span>
            </div>

            <form onSubmit={handleSendCheer} className="flex gap-1.5">
              <input
                type="text"
                placeholder={`Leave encouragement for ${profile.name.split(' ')[0]}...`}
                value={customCheer}
                onChange={(e) => setCustomCheer(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl cursor-pointer transition-all shrink-0"
              >
                Send
              </button>
            </form>

            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {cheerList.map((cheer, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-zinc-900/70 border border-zinc-800 text-[11px] text-zinc-300 flex items-start gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                  <span>{cheer}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
