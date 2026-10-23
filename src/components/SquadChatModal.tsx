import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Pin,
  Users,
  Paperclip,
  Smile,
  Zap,
  MoreVertical,
  CheckCheck,
  ShieldCheck,
  Award,
  Video,
  Phone,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ThemeMode } from '../types';

export interface SquadChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  isLeader?: boolean;
  isMe?: boolean;
  content: string;
  timestamp: string;
  attachmentType?: 'focus_log' | 'code' | 'reading_note';
  attachmentData?: any;
  reactions?: { emoji: string; count: number }[];
}

export interface SquadChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  squad: {
    id: string;
    title: string;
    authorName: string;
    authorAvatar?: string;
    authorGoal: string;
    authorStreak: number;
    membersCount: number;
    tags?: string[];
  } | null;
  onOpenOwnerProfile?: () => void;
  themeMode?: ThemeMode;
}

export const SquadChatModal: React.FC<SquadChatModalProps> = ({
  isOpen,
  onClose,
  squad,
  onOpenOwnerProfile,
  themeMode = 'dark',
}) => {
  const [messages, setMessages] = useState<SquadChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [activeMembersCount, setActiveMembersCount] = useState(4);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize WhatsApp-style squad chat data
  useEffect(() => {
    if (squad) {
      const leaderName = squad.authorName || 'Sarah K.';
      const leaderAvatar = squad.authorAvatar || '👩‍💻';

      setMessages([
        {
          id: 'msg-1',
          senderName: leaderName,
          senderAvatar: leaderAvatar,
          isLeader: true,
          isMe: false,
          content: `🌟 Welcome to the ${squad.title}! Here, we enforce zero doomscrolling and hold each other accountable to daily disciplined deep work.`,
          timestamp: '06:15 AM',
        },
        {
          id: 'msg-2',
          senderName: leaderName,
          senderAvatar: leaderAvatar,
          isLeader: true,
          isMe: false,
          content: `📌 TODAY'S FOCUS CHALLENGE (06:30 AM Silent Sprint):\n1. LeetCode Medium #198 (House Robber) + #322 (Coin Change)\n2. 45-min distraction-free timer on Flowra.\n3. Post your completed runtime or complexity summary below!`,
          timestamp: '06:20 AM',
          attachmentType: 'focus_log',
          attachmentData: {
            title: '45-min LeetCode & System Design Sprint',
            xp: '+40 Aura Points',
            status: 'Active Sprint',
          },
        },
        {
          id: 'msg-3',
          senderName: 'Dev P.',
          senderAvatar: '👨‍💻',
          isLeader: false,
          isMe: false,
          content: 'Timer started! Running 45 mins in Flowra Companion mode. Phone in grayscale.',
          timestamp: '06:30 AM',
        },
        {
          id: 'msg-4',
          senderName: 'Kavya N.',
          senderAvatar: '⚡',
          isLeader: false,
          isMe: false,
          content: 'Solved Coin Change with Bottom-Up DP O(amount * coins) in 28 mins! Pushing clean solution to GitHub.',
          timestamp: '07:15 AM',
        },
        {
          id: 'msg-5',
          senderName: leaderName,
          senderAvatar: leaderAvatar,
          isLeader: true,
          isMe: false,
          content: 'Great work Kavya! Keep the momentum high. Everyone log your streak for today before 10:00 PM wind-down.',
          timestamp: '07:18 AM',
        },
      ]);
    }
  }, [squad]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !squad) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMsg: SquadChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: 'You',
      senderAvatar: '🌳',
      isMe: true,
      content: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');

    // Trigger celebratory sound/haptics
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.8 },
    });

    // Simulated squad response from leader
    setTimeout(() => {
      const leaderName = squad.authorName || 'Sarah K.';
      const leaderAvatar = squad.authorAvatar || '👩‍💻';
      const replyMsg: SquadChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderName: leaderName,
        senderAvatar: leaderAvatar,
        isLeader: true,
        isMe: false,
        content: `⚡ Great commitment! Logged to our squad focus board. Keep your daily streak blazing! 🔥`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1200);
  };

  const handleSendQuickSprintLog = () => {
    const newMsg: SquadChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: 'You',
      senderAvatar: '🌳',
      isMe: true,
      content: '⚡ Completed 45-min Deep Focus Sprint on Flowra! Zero phone distractions logged.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachmentType: 'focus_log',
      attachmentData: {
        title: 'Deep Focus Sprint Verified',
        xp: '+35 Aura XP',
        status: 'Completed',
      },
    };

    setMessages((prev) => [...prev, newMsg]);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });

    setTimeout(() => {
      const replyMsg: SquadChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderName: squad.authorName || 'Sarah K.',
        senderAvatar: squad.authorAvatar || '👩‍💻',
        isLeader: true,
        isMe: false,
        content: '🔥 Awesome discipline! You earned +35 Aura XP for the squad.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1000);
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
              : 'bg-[#0B0F17] border-emerald-500/40 text-white shadow-[0_0_60px_rgba(16,185,129,0.2)]'
          }`}
        >
          {/* WhatsApp-Style Top Header Bar */}
          <div className="p-3.5 bg-[#111A24] border-b border-emerald-500/25 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Clickable Creator / Squad Avatar */}
              <button
                onClick={onOpenOwnerProfile}
                className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-emerald-500 flex items-center justify-center text-lg font-bold shadow-md cursor-pointer hover:scale-105 transition-transform border border-emerald-400/40 shrink-0"
                title="View Owner Profile"
              >
                {squad.authorAvatar || '👩‍💻'}
              </button>

              <div className="min-w-0 cursor-pointer" onClick={onOpenOwnerProfile}>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-xs sm:text-sm text-white truncate max-w-[200px] sm:max-w-[260px]">
                    {squad.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="font-bold underline underline-offset-2 hover:text-emerald-300">
                    {squad.authorName} (Leader)
                  </span>
                  <span>•</span>
                  <span className="text-zinc-400">{squad.membersCount || 4} members online</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Close */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onOpenOwnerProfile}
                className="px-2 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[10px] font-bold transition-all cursor-pointer hidden sm:flex items-center gap-1"
              >
                <span>Profile</span>
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pinned Leader Notice / Agenda */}
          <div className="px-3.5 py-2 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center justify-between gap-2 shrink-0 text-xs">
            <div className="flex items-center gap-2 text-[11px] text-emerald-300 truncate">
              <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0 rotate-45" />
              <span className="font-semibold truncate">
                Pinned by {squad.authorName}: 06:30 AM Silent Sprint Active • Goal: {squad.authorGoal}
              </span>
            </div>
            <button
              onClick={handleSendQuickSprintLog}
              className="px-2.5 py-0.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black shrink-0 cursor-pointer shadow transition-all"
            >
              + Log Sprint
            </button>
          </div>

          {/* WhatsApp Chat Messages Stream (Wallpaper style) */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[radial-gradient(#14241d_1px,transparent_1px)] [background-size:16px_16px]">
            {/* Squad Security / Rule Banner */}
            <div className="flex justify-center">
              <span className="px-3 py-1 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Zero-Doomscroll Verified Squad • End-to-End Accountable</span>
              </span>
            </div>

            {messages.map((msg) => {
              const isMe = msg.isMe;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 items-end ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <button
                      onClick={onOpenOwnerProfile}
                      className="w-7 h-7 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    >
                      {msg.senderAvatar}
                    </button>
                  )}

                  <div
                    className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-3 shadow-md space-y-1 relative ${
                      isMe
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-br-none'
                        : msg.isLeader
                        ? 'bg-[#151D2A] border border-cyan-500/30 text-zinc-100 rounded-bl-none'
                        : 'bg-[#181E29] border border-zinc-800 text-zinc-200 rounded-bl-none'
                    }`}
                  >
                    {/* Sender Header */}
                    {!isMe && (
                      <div className="flex items-center justify-between gap-2 pb-0.5">
                        <button
                          onClick={onOpenOwnerProfile}
                          className="font-extrabold text-[11px] text-cyan-300 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span>{msg.senderName}</span>
                          {msg.isLeader && (
                            <span className="text-[8px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                              Leader
                            </span>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Content Text */}
                    <p className="text-xs whitespace-pre-line leading-relaxed">{msg.content}</p>

                    {/* Embedded Focus Card / Attachment */}
                    {msg.attachmentType === 'focus_log' && (
                      <div className="mt-1.5 p-2 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <div>
                            <div className="font-bold text-[11px] text-white">
                              {msg.attachmentData?.title}
                            </div>
                            <div className="text-[9px] text-emerald-400 font-bold">
                              {msg.attachmentData?.xp}
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
                          {msg.attachmentData?.status}
                        </span>
                      </div>
                    )}

                    {/* Timestamp & WhatsApp Blue Ticks */}
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
          <div className="px-3 py-1.5 bg-[#0E141E] border-t border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto shrink-0">
            <span className="text-[10px] text-zinc-500 font-bold shrink-0">Quick React:</span>
            {[
              { label: '🔥 Sprint Done', text: '🔥 Completed today\'s focus sprint!' },
              { label: '⚡ LeetCode Solved', text: '⚡ Solved 2 LeetCode Medium problems in 45m!' },
              { label: '📚 20 Pages Read', text: '📚 Finished 20 pages in Flowra Book Sanctuary!' },
              { label: '💯 High Five', text: '💯 Let\'s keep this squad streak alive!' },
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setInputValue(chip.text)}
                className="px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-bold whitespace-nowrap border border-zinc-800 hover:border-emerald-500/40 transition-all cursor-pointer shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* WhatsApp Style Chat Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-[#111A24] border-t border-emerald-500/25 flex items-center gap-2 shrink-0"
          >
            <button
              type="button"
              onClick={handleSendQuickSprintLog}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 cursor-pointer transition-all"
              title="Log Focus Sprint to Squad"
            >
              <Zap className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder={`Message squad peers (${squad.authorName}, Dev, Kavya)...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-[#090C12] border border-zinc-700 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 shadow-inner"
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
