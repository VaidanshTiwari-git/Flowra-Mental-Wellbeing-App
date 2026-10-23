import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, X, Sparkles, User, Zap, RotateCcw, Target, Flame, Clock } from 'lucide-react';
import { UserProfile } from '../types';
import { sendAIChatMessageAPI } from '../services/api';

interface AIMentorChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  isError?: boolean;
  retryText?: string;
  suggestedActions?: string[];
}

export const AIMentorChatDrawer: React.FC<AIMentorChatDrawerProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const totalDays = user.totalRoadmapDays || user.planDurationDays || 180;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hey ${user.displayName}! I'm your Flowra 24/7 AI Mentor & Coach. You're on Day ${user.currentDay} of ${totalDays} for "${user.goal}" with ${user.companion.name}.\n\nAsk me anything — whether it's general knowledge, coding & technical questions, study advice, philosophy, or how to optimize today's focus block!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        `Explain a core concept in ${user.goal}`,
        `Give me a 5-min dopamine reset drill`,
        `How do I stop scrolling before sleep?`,
        `Optimize my daily hourly timetable`,
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInputText('');
    setIsLoading(true);

    try {
      const history = updated
        .filter((m) => !m.isError)
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          text: m.text,
        }));

      const res = await sendAIChatMessageAPI({
        message: text,
        goal: user.goal,
        currentDay: user.currentDay,
        totalDays,
        meaningfulScore: user.meaningfulScore || 82,
        streak: user.streak,
        petName: user.companion.name,
        petType: user.companion.type,
        aura: user.companion.aura || user.companion.xp || 0,
        mood: user.companion.mood || 'radiant',
        userName: user.displayName,
        chatHistory: history,
      });

      if (!res || !res.reply) {
        throw new Error('Empty response from AI service');
      }

      const aiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: res.suggestedActions,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('[Flowra AI Mentor Drawer Error]:', {
        error: err?.message || err,
        stack: err?.stack,
        sentMessage: text,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'ai',
          text: 'Something went wrong, please try again.',
          isError: true,
          retryText: text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md flex justify-end">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="w-full max-w-md bg-[#141418] border-l border-emerald-500/20 h-full flex flex-col shadow-2xl relative"
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#0E0E12]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-sm">Flowra 24/7 AI Mentor</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  Online
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">General Intelligence & Goal Strategist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close mentor chat"
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Context Strip */}
        <div className="px-3.5 py-1.5 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
          <span className="text-emerald-400 font-medium truncate max-w-[160px]">{user.goal}</span>
          <div className="flex items-center gap-2">
            <span>Day {user.currentDay}/{totalDays}</span>
            <span className="text-amber-400 font-bold">{user.streak}d 🔥</span>
            <span className="text-emerald-300">+{user.companion.aura || 0} Aura</span>
          </div>
        </div>

        {/* Message Thread */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[88%]">
                  {!isUser && (
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                        m.isError
                          ? 'bg-red-950/80 text-red-400 border border-red-500/40'
                          : 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                      }`}
                    >
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-emerald-500 text-black font-semibold rounded-br-none shadow-md'
                        : m.isError
                        ? 'bg-red-950/40 text-red-200 border border-red-500/30 rounded-bl-none'
                        : 'bg-[#181820] text-zinc-200 border border-zinc-800 rounded-bl-none shadow-inner'
                    }`}
                  >
                    <p>{m.text}</p>

                    {/* Retry button on error */}
                    {m.isError && m.retryText && (
                      <div className="mt-2.5 pt-2 border-t border-red-500/20 flex items-center justify-between">
                        <span className="text-[10px] text-red-400">Failed to connect</span>
                        <button
                          onClick={() => handleSend(m.retryText)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-200 text-[10px] font-bold cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[9px] text-zinc-500 mt-1 px-1">{m.time}</span>

                {/* Suggested Action Chips if available */}
                {m.suggestedActions && m.suggestedActions.length > 0 && !isLoading && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                    {m.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(act)}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 text-zinc-300 hover:text-white cursor-pointer transition-all flex items-center gap-1"
                      >
                        <Zap className="w-2.5 h-2.5 text-emerald-400" />
                        <span>{act}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Animated Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-zinc-300 bg-[#181820] p-3 rounded-2xl w-fit border border-zinc-800 animate-fadeIn">
              <span className="text-xs text-zinc-400">Flowra Mentor is thinking</span>
              <div className="flex items-center gap-1 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-zinc-800 bg-[#0E0E12]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder="Ask anything, request plan adjustments, get advice..."
              className="flex-1 bg-[#141418] border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              aria-label="Send message"
              className="w-10 h-10 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center cursor-pointer transition-all disabled:opacity-50 shadow-md font-bold"
            >
              {isLoading ? (
                <Sparkles className="w-4 h-4 animate-spin text-black" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

