import React, { useState, useRef, useEffect } from 'react';
import { sendAIChatMessageAPI } from '../services/api';
import { CompanionType, TaskItem, ThemeMode, TimetableBlock, WeeklyMilestone } from '../types';
import {
  Send,
  Sparkles,
  X,
  Bot,
  User,
  RotateCcw,
  Flame,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AICoachChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGoal: string;
  currentDay: number;
  totalDays?: number;
  meaningfulScore?: number;
  streak: number;
  petName: string;
  petType: CompanionType;
  aura: number;
  mood?: string;
  userName?: string;
  todayTask?: TaskItem;
  timetable?: TimetableBlock[];
  weeklyMilestones?: WeeklyMilestone[];
  themeMode?: ThemeMode;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
  isError?: boolean;
  retryText?: string;
}

export const AICoachChatModal: React.FC<AICoachChatModalProps> = ({
  isOpen,
  onClose,
  userGoal,
  currentDay,
  totalDays = 180,
  meaningfulScore = 82,
  streak,
  petName,
  petType,
  aura,
  mood = 'radiant',
  userName = 'Pioneer',
  todayTask,
  timetable,
  weeklyMilestones,
  themeMode = 'dark',
}) => {
  const isLight = themeMode === 'light';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      text: `Hey ${userName}! I'm your Flowra 24/7 AI Coach. Flowra's motto is **"Same screen. Different aura."**\n\nYou're on **Day ${currentDay} of ${totalDays}** on your **${userGoal}** journey with **${petName}**, holding **${aura} Aura points** and an active **${streak}-day streak**! 🔥\n\nAsk me anything! Whether you have questions about your streak, today's task, algorithms, deep work strategies, science, philosophy, or general knowledge — I'm right here with you.`,
      time: 'Just now',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([
    `What is my current streak & progress?`,
    `What's today's focus task for ${userGoal}?`,
    'Give me a 5-minute dopamine reset drill',
    'Explain the most important concept in my goal',
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom whenever messages or typing state change
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToBottom('auto');
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await sendAIChatMessageAPI({
        message: text,
        goal: userGoal,
        currentDay,
        totalDays,
        meaningfulScore,
        streak,
        petName,
        petType,
        aura,
        mood,
        userName,
        todayTask,
        timetable,
        weeklyMilestones,
        chatHistory: updatedHistory
          .filter((m) => !m.isError)
          .map((m) => ({ role: m.role, text: m.text })),
      });

      if (!res || !res.reply) {
        throw new Error('Empty response received from AI service');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: res.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      if (res.suggestedActions && res.suggestedActions.length > 0) {
        setSuggestedActions(res.suggestedActions);
      }
    } catch (e: any) {
      console.error('[Flowra AI Chat Error]: Failed to send message to Gemini API:', {
        error: e?.message || e,
        stack: e?.stack,
        sentMessage: text,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: 'I ran into a temporary connection hiccup while contacting Gemini. Please tap Retry below or check your network.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
          retryText: text,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-2xl h-[88vh] max-h-[720px] rounded-3xl p-4 sm:p-6 shadow-2xl border flex flex-col overflow-hidden transition-colors ${
          isLight
            ? 'bg-slate-50 border-slate-200 text-slate-900 shadow-xl'
            : 'bg-[#0B0F17] border-zinc-800/80 text-white shadow-2xl'
        }`}
      >
        {/* Header with Live User Context Badges */}
        <div
          className={`flex items-center justify-between pb-3 border-b shrink-0 ${
            isLight ? 'border-slate-200' : 'border-zinc-800/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${
                isLight
                  ? 'bg-gradient-to-tr from-purple-600 to-teal-500 text-white'
                  : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              }`}
            >
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black flex items-center gap-1.5">
                  <span>Flowra AI Coach & Mentor</span>
                </h2>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    isLight
                      ? 'bg-purple-100 text-purple-700 border-purple-200'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  Gemini 3.7 Flash
                </span>
              </div>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                General Knowledge • Goal Strategy • 24/7 Live Context
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Chat"
            className={`p-2 rounded-full transition-all cursor-pointer ${
              isLight
                ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Personalized Context Banner */}
        <div
          className={`mt-2.5 px-3.5 py-2 rounded-2xl border flex items-center justify-between text-[11px] shrink-0 overflow-x-auto gap-2 ${
            isLight
              ? 'bg-white border-slate-200/90 text-slate-700 shadow-sm'
              : 'bg-zinc-900/60 border-zinc-800/60 text-zinc-300'
          }`}
        >
          <div
            className={`flex items-center gap-1.5 font-bold whitespace-nowrap ${
              isLight ? 'text-purple-700' : 'text-emerald-400'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>{userGoal}</span>
          </div>
          <div className="flex items-center gap-3 whitespace-nowrap">
            <span
              className={`flex items-center gap-1 font-medium ${
                isLight ? 'text-teal-700' : 'text-cyan-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Day {currentDay}/{totalDays}
            </span>
            <span
              className={`flex items-center gap-1 font-extrabold ${
                isLight ? 'text-amber-600' : 'text-amber-400'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              {streak}d Streak
            </span>
            <span
              className={`font-bold ${
                isLight ? 'text-purple-700' : 'text-emerald-300'
              }`}
            >
              +{aura} Aura
            </span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto my-3 pr-1.5 flex flex-col gap-3.5 scroll-smooth">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                    isUser
                      ? isLight
                        ? 'bg-gradient-to-tr from-purple-600 to-teal-500 text-white shadow-sm font-bold'
                        : 'bg-emerald-500 text-black font-bold shadow-sm'
                      : m.isError
                      ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40'
                      : isLight
                      ? 'bg-white border border-slate-200 text-purple-600 shadow-sm'
                      : 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-sm ${
                    isUser
                      ? isLight
                        ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-600 text-white font-medium rounded-tr-none shadow-md'
                        : 'bg-emerald-500 text-black font-semibold rounded-tr-none'
                      : m.isError
                      ? isLight
                        ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-none'
                        : 'bg-red-950/40 border border-red-500/30 text-red-200 rounded-tl-none'
                      : isLight
                      ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                      : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-tl-none'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* Retry button on error */}
                  {m.isError && m.retryText && (
                    <div
                      className={`mt-2.5 pt-2 border-t flex items-center justify-between ${
                        isLight ? 'border-rose-200' : 'border-red-500/20'
                      }`}
                    >
                      <span className="text-[10px] text-rose-500 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3 h-3" />
                        <span>Request failed</span>
                      </span>
                      <button
                        onClick={() => handleSend(m.retryText)}
                        disabled={isSending}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500 text-white hover:bg-rose-600 text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry Now</span>
                      </button>
                    </div>
                  )}

                  <div
                    className={`text-[9px] mt-1.5 text-right ${
                      isUser
                        ? isLight
                          ? 'text-white/80'
                          : 'text-black/70'
                        : m.isError
                        ? 'text-rose-400'
                        : isLight
                        ? 'text-slate-400'
                        : 'text-zinc-500'
                    }`}
                  >
                    {m.time}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Animated Typing / Loading Indicator */}
          {isSending && (
            <div className="flex gap-2.5 max-w-[85%] mr-auto animate-fadeIn">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  isLight
                    ? 'bg-white border border-slate-200 text-purple-600 shadow-sm'
                    : 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div
                className={`p-3 rounded-2xl rounded-tl-none flex items-center gap-2 ${
                  isLight
                    ? 'bg-white border border-slate-200 text-slate-700 shadow-sm'
                    : 'bg-zinc-900/90 border border-zinc-800 text-zinc-300'
                }`}
              >
                <span className="text-xs font-semibold">Flowra Coach is thinking</span>
                <div className="flex items-center gap-1 py-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                      isLight ? 'bg-purple-600' : 'bg-emerald-400'
                    }`}
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                      isLight ? 'bg-teal-500' : 'bg-emerald-400'
                    }`}
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                      isLight ? 'bg-purple-600' : 'bg-emerald-400'
                    }`}
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts */}
        {suggestedActions.length > 0 && !isSending && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 shrink-0 no-scrollbar">
            {suggestedActions.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-purple-50/80 border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-900 shadow-xs'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-emerald-500/50 text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
              >
                ⚡ {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Message Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center shrink-0 pt-1"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask anything (e.g. 'what's my streak?', coding, goal advice)..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isSending}
            className={`w-full pl-4 pr-12 py-3 border rounded-2xl text-xs sm:text-sm focus:outline-none transition-all shadow-inner disabled:opacity-60 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30'
                : 'bg-zinc-900/90 border-zinc-700/80 text-white placeholder:text-zinc-500 focus:border-emerald-500'
            }`}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            aria-label="Send message"
            className={`absolute right-2 p-2 rounded-xl transition-all ${
              inputMessage.trim() && !isSending
                ? isLight
                  ? 'bg-gradient-to-r from-purple-600 to-teal-500 hover:opacity-95 text-white shadow-md cursor-pointer'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md cursor-pointer'
                : isLight
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isSending ? (
              <Sparkles className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
