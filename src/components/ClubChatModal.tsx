import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Users,
  Flame,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCheck,
  MessageSquare,
  Award,
  BookOpen,
  Pin,
  Smile,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ThemeMode } from '../types';

export interface ClubChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  isCreator?: boolean;
  isMe?: boolean;
  content: string;
  timestamp: string;
  streak?: number;
  aura?: number;
}

export interface ClubChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: {
    id: string;
    name: string;
    description: string;
    creatorName: string;
    creatorAvatar?: string;
    planGoal: string;
    dailyAverageStreak: number;
    members: any[];
  } | null;
  onOpenOwnerProfile?: (creatorName: string) => void;
  themeMode?: ThemeMode;
}

export const ClubChatModal: React.FC<ClubChatModalProps> = ({
  isOpen,
  onClose,
  club,
  onOpenOwnerProfile,
  themeMode = 'dark',
}) => {
  const [messages, setMessages] = useState<ClubChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (club) {
      const creator = club.creatorName || 'Aarya Sharma';
      setMessages([
        {
          id: 'club-msg-1',
          senderName: creator,
          senderAvatar: '🏆',
          isCreator: true,
          isMe: false,
          content: `👋 Welcome everyone to ${club.name}! Our mission is strict daily consistency for ${club.planGoal}. Let's keep average club streak above ${club.dailyAverageStreak} days!`,
          timestamp: '08:00 AM',
          streak: club.dailyAverageStreak + 4,
          aura: 1250,
        },
        {
          id: 'club-msg-2',
          senderName: 'Kavya Nair',
          senderAvatar: '🌟',
          isCreator: false,
          isMe: false,
          content: 'Just wrapped up my 60-min morning focus sprint. Reached a 19-day streak today! 🔥',
          timestamp: '08:30 AM',
          streak: 19,
          aura: 820,
        },
        {
          id: 'club-msg-3',
          senderName: 'Rohit Gupta',
          senderAvatar: '🚀',
          isCreator: false,
          isMe: false,
          content: 'Working on Operating Systems semaphore questions today. Who is up for an afternoon sync?',
          timestamp: '09:15 AM',
          streak: 8,
          aura: 450,
        },
      ]);
    }
  }, [club]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !club) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMsg: ClubChatMessage = {
      id: `cmsg-${Date.now()}`,
      senderName: 'You',
      senderAvatar: '🌳',
      isMe: true,
      content: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      streak: 5,
      aura: 950,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');

    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.8 },
    });

    // Simulated club peer response
    setTimeout(() => {
      const responder = club.creatorName || 'Aarya Sharma';
      const replyMsg: ClubChatMessage = {
        id: `cmsg-${Date.now() + 1}`,
        senderName: responder,
        senderAvatar: '🏆',
        isCreator: true,
        isMe: false,
        content: `⚡ Great update! Glad to have you actively contributing to ${club.name}. +10 Club Synergy XP!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        streak: club.dailyAverageStreak + 4,
        aura: 1250,
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1300);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`w-full max-w-lg h-[88vh] max-h-[720px] rounded-3xl border flex flex-col overflow-hidden shadow-2xl relative ${
            themeMode === 'light'
              ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
              : 'bg-[#0A0E17] border-emerald-500/40 text-white shadow-[0_0_60px_rgba(16,185,129,0.2)]'
          }`}
        >
          {/* Top Bar */}
          <div className="p-3.5 bg-[#101724] border-b border-emerald-500/25 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => onOpenOwnerProfile && onOpenOwnerProfile(club.creatorName)}
                className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-lg font-bold shadow-md cursor-pointer hover:scale-105 transition-transform border border-emerald-400/40 shrink-0"
                title={`View ${club.creatorName}'s Profile`}
              >
                {club.creatorAvatar || '🏆'}
              </button>

              <div className="min-w-0">
                <h3 className="font-black text-xs sm:text-sm text-white truncate max-w-[200px] sm:max-w-[280px]">
                  {club.name}
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                  <button
                    onClick={() => onOpenOwnerProfile && onOpenOwnerProfile(club.creatorName)}
                    className="text-emerald-400 font-bold hover:underline cursor-pointer truncate"
                  >
                    Owner: {club.creatorName}
                  </button>
                  <span>•</span>
                  <span>{club.members?.length || 3} Active Members</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onOpenOwnerProfile && onOpenOwnerProfile(club.creatorName)}
                className="px-2 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[10px] font-bold transition-all cursor-pointer hidden sm:block"
              >
                Owner Profile
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader Banner */}
          <div className="px-3.5 py-2 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-300">
            <span className="truncate">
              🎯 Goal: <span className="font-bold text-white">{club.planGoal}</span> • Avg Streak:{' '}
              <span className="font-bold text-amber-400">{club.dailyAverageStreak}d 🔥</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold shrink-0 border border-emerald-500/30">
              Club Lounge
            </span>
          </div>

          {/* Group Chat Messages List */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[radial-gradient(#11221a_1px,transparent_1px)] [background-size:16px_16px]">
            {messages.map((msg) => {
              const isMe = msg.isMe;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 items-end ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <button
                      onClick={() => onOpenOwnerProfile && onOpenOwnerProfile(msg.senderName)}
                      className="w-7 h-7 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    >
                      {msg.senderAvatar}
                    </button>
                  )}

                  <div
                    className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-3 shadow-md space-y-1 relative ${
                      isMe
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-br-none'
                        : msg.isCreator
                        ? 'bg-[#151D2A] border border-cyan-500/30 text-zinc-100 rounded-bl-none'
                        : 'bg-[#181E29] border border-zinc-800 text-zinc-200 rounded-bl-none'
                    }`}
                  >
                    {!isMe && (
                      <div className="flex items-center justify-between gap-2 pb-0.5">
                        <button
                          onClick={() => onOpenOwnerProfile && onOpenOwnerProfile(msg.senderName)}
                          className="font-extrabold text-[11px] text-cyan-300 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span>{msg.senderName}</span>
                          {msg.isCreator && (
                            <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                              Club Owner
                            </span>
                          )}
                        </button>
                        {msg.streak && (
                          <span className="text-[9px] text-amber-400 font-bold font-mono">
                            🔥 {msg.streak}d
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-xs whitespace-pre-line leading-relaxed">{msg.content}</p>

                    <div className="flex items-center justify-end gap-1 text-[9px] opacity-70 pt-0.5">
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-cyan-200 inline" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reaction Chips */}
          <div className="px-3 py-1.5 bg-[#0D121B] border-t border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto shrink-0">
            <span className="text-[10px] text-zinc-500 font-bold shrink-0">Quick Chat:</span>
            {[
              '🔥 Streak verified!',
              '⚡ Daily Goal Done',
              '📚 Logging 20 Pages',
              '🎯 Let\'s hit 30 days',
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setInputValue(chip)}
                className="px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-bold whitespace-nowrap border border-zinc-800 hover:border-emerald-500/40 transition-all cursor-pointer shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-[#101724] border-t border-emerald-500/25 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder={`Message all members of ${club.name}...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-[#070A0F] border border-zinc-700 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-black font-bold cursor-pointer transition-all shadow-md shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
