import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Zap,
  BookOpen,
  Library,
  Users,
  CheckSquare,
  Moon,
  TrendingUp,
} from 'lucide-react';
import { UserProfile, TaskItem, ThemeMode, PhoneAnalyticsState } from '../types';
import { PetVisual } from './PetVisual';
import { ScreenTimeAnalyticsCard } from './ScreenTimeAnalyticsCard';
import { fetchDailyQuoteAndTaskAPI } from '../services/api';

interface HomeTabProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenStreakCalendar: () => void;
  onOpenDeepLesson: () => void;
  onOpenBooks: () => void;
  onOpenHabits: () => void;
  onOpenGrowth: () => void;
  onOpenClubs: () => void;
  onOpenBedtime: () => void;
  onTriggerIntervention: (app: string, mins: number) => void;
  themeMode?: ThemeMode;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  user,
  onUpdateUser,
  onOpenStreakCalendar,
  onOpenDeepLesson,
  onOpenBooks,
  onOpenHabits,
  onOpenGrowth,
  onOpenClubs,
  onOpenBedtime,
  onTriggerIntervention,
  themeMode = 'dark',
}) => {
  const isLight = themeMode === 'light';

  const [quote, setQuote] = useState('Same screen. Different aura. Choose compound mastery today.');
  const [quoteAuthor, setQuoteAuthor] = useState('Flowra Philosophy');
  const [petRemark, setPetRemark] = useState('');
  const [taskTimer, setTaskTimer] = useState(2700); // 45 mins
  const [isTaskTimerRunning, setIsTaskTimerRunning] = useState(false);
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);

  const aura = user.companion?.aura || user.companion?.xp || 0;
  const totalDays = user.totalRoadmapDays !== undefined && user.totalRoadmapDays !== null ? user.totalRoadmapDays : 180;

  const todayTask: TaskItem = user.roadmap?.todayTask || {
    id: `task-d${user.currentDay}`,
    day: user.currentDay,
    title: `Day ${user.currentDay}: Core ${user.goal} Deep Sprint`,
    description: `Dedicate 45 minutes of laser-focused uninterrupted energy towards ${user.goal}. Keep all algorithmic feed notifications muted.`,
    estimatedMinutes: 45,
    category: 'Core Focus',
    isCompleted: false,
    auraReward: 25,
    learningPoints: [
      `Review key architectural patterns for ${user.goal}`,
      'Implement 1 core lab drill without switching tabs',
      'Log learnings into your nightly AI Reflection',
    ],
  };

  const [phoneAnalytics] = useState<PhoneAnalyticsState>(
    user.phoneAnalytics || {
      screenTimeMinutes: 245,
      productiveMinutes: 190,
      doomscrollMinutes: 55,
      meaningfulScore: user.meaningfulScore || 82,
      appUsages: [
        { appName: 'Instagram Reels', minutesSpent: 35, category: 'Social Feed', isProductive: false, color: '#EF4444' },
        { appName: 'YouTube Shorts', minutesSpent: 20, category: 'Doomscroll', isProductive: false, color: '#F97316' },
        { appName: 'Flowra Study', minutesSpent: 85, category: 'Education', isProductive: true, color: '#10B981' },
        { appName: 'VS Code & Labs', minutesSpent: 105, category: 'Deep Work', isProductive: true, color: '#38BDF8' },
      ],
      categoriesBreakdown: [
        { name: 'Education & Deep Work', minutes: 190, percentage: 77 },
        { name: 'Social & Feeds', minutes: 55, percentage: 23 },
      ],
      lastInterventionTimestamp: new Date().toISOString(),
    }
  );

  useEffect(() => {
    if (user.completedTasksHistory?.includes(todayTask.id) || todayTask.isCompleted) {
      setIsTaskCompleted(true);
    }
  }, [user, todayTask]);

  useEffect(() => {
    fetchDailyQuoteAndTaskAPI({
      goal: user.goal,
      currentDay: user.currentDay,
      streak: user.streak,
      petName: user.companion.name,
      mood: user.companion.mood,
    })
      .then((res) => {
        if (res.quote) setQuote(res.quote);
        if (res.author) setQuoteAuthor(res.author);
        if (res.petRemark) setPetRemark(res.petRemark);
      })
      .catch(() => {});
  }, [user.currentDay, user.goal]);

  useEffect(() => {
    let interval: any = null;
    if (isTaskTimerRunning && taskTimer > 0) {
      interval = setInterval(() => setTaskTimer((t) => t - 1), 1000);
    } else if (taskTimer === 0) {
      setIsTaskTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTaskTimerRunning, taskTimer]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Water Tree Action
  const handleWaterTree = () => {
    const updated = {
      ...user,
      companion: {
        ...user.companion,
        totalLeaves: (user.companion.totalLeaves || 0) + 3,
        timesWatered: (user.companion.timesWatered || 0) + 1,
        lastWateredDate: new Date().toISOString().split('T')[0],
        mood: 'radiant' as const,
      },
    };
    onUpdateUser(updated);
  };

  // Feed Pet Action
  const handleFeedPet = () => {
    if ((user.companion.foodBowlsAvailable || 0) <= 0) return;
    const updated = {
      ...user,
      companion: {
        ...user.companion,
        foodBowlsAvailable: Math.max(0, (user.companion.foodBowlsAvailable || 0) - 1),
        lastFedDate: new Date().toISOString().split('T')[0],
        mood: 'radiant' as const,
      },
    };
    onUpdateUser(updated);
  };

  // Complete Main Task (+25 Aura)
  const handleCompleteTodayTask = () => {
    if (isTaskCompleted) return;
    setIsTaskCompleted(true);

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#7C3AED', '#14B8A6', '#F59E0B', '#3B82F6'],
    });

    const newAura = aura + 25;
    const updated: UserProfile = {
      ...user,
      streak: user.streak + 1,
      meaningfulScore: Math.min(100, user.meaningfulScore + 5),
      totalProductiveHours: +(user.totalProductiveHours + 0.75).toFixed(1),
      completedTasksHistory: [...(user.completedTasksHistory || []), todayTask.id],
      companion: {
        ...user.companion,
        aura: newAura,
        xp: newAura,
        level: Math.floor(newAura / 100) + 1,
        foodBowlsAvailable: (user.companion.foodBowlsAvailable || 0) + 1,
        totalLeaves: (user.companion.totalLeaves || 0) + (user.companion.type === 'tree' ? 5 : 0),
        mood: 'radiant' as const,
      },
    };
    onUpdateUser(updated);
  };

  const progressPercentage = Math.round((user.currentDay / totalDays) * 100);

  return (
    <div className="space-y-4 pb-20 pt-1 animate-fadeIn">
      {/* 1. Daily Quote Banner with Flowra Tagline */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          isLight
            ? 'bg-gradient-to-br from-purple-50 via-white to-teal-50 border-purple-200/80 text-slate-900 shadow-sm'
            : 'bg-gradient-to-br from-purple-950/40 via-[#0D1219] to-[#0A0D14] border-purple-500/25 text-white shadow-xl'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div
            className={`flex items-center gap-1.5 text-xs font-extrabold ${
              isLight ? 'text-purple-700' : 'text-purple-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Today's Aura Shift</span>
          </div>
          <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Gemini 3.7 Adaptive
          </span>
        </div>
        <p
          className={`text-xs font-medium italic leading-relaxed ${
            isLight ? 'text-slate-800' : 'text-zinc-200'
          }`}
        >
          "{quote}"
        </p>
        <div
          className={`flex items-center justify-between mt-2 pt-2 border-t ${
            isLight ? 'border-slate-200/80' : 'border-zinc-800/80'
          }`}
        >
          <span
            className={`text-[10px] font-bold ${
              isLight ? 'text-purple-700' : 'text-teal-400'
            }`}
          >
            — {quoteAuthor}
          </span>
          {petRemark && (
            <span
              className={`text-[10px] truncate max-w-[200px] ${
                isLight ? 'text-slate-500' : 'text-zinc-400'
              }`}
            >
              🐾 {petRemark}
            </span>
          )}
        </div>
      </div>

      {/* 2. Top Progress & Streak Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Custom Plan Duration Progress & Streak */}
        <div
          onClick={() => {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#F59E0B', '#7C3AED', '#14B8A6'],
            });
            onOpenStreakCalendar();
          }}
          className={`p-4 rounded-3xl border shadow-sm cursor-pointer hover:scale-[1.01] transition-all relative overflow-hidden ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900 hover:border-purple-300'
              : 'bg-[#0E131C] border-purple-500/20 text-white'
          }`}
        >
          <div className={`flex items-center justify-between text-xs font-medium mb-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            <span>{totalDays}-Day Plan</span>
            <span className={`font-bold ${isLight ? 'text-purple-700' : 'text-teal-400'}`}>{progressPercentage}%</span>
          </div>

          <div className="flex items-center gap-2.5 mt-1">
            <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className={isLight ? 'text-slate-200' : 'text-zinc-800'}
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={isLight ? 'text-purple-600' : 'text-teal-400'}
                  strokeDasharray={`${progressPercentage || 2}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-[11px] font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {user.currentDay}
                </span>
              </div>
            </div>

            <div>
              <div className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Day {user.currentDay}/{totalDays}
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-300 font-bold flex items-center gap-1 mt-0.5">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{user.streak}d streak 🔥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Aura & Meaningful Focus Score */}
        <div
          onClick={onOpenStreakCalendar}
          className={`p-4 rounded-3xl border shadow-sm cursor-pointer hover:scale-[1.01] transition-all relative overflow-hidden ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900 hover:border-teal-300'
              : 'bg-[#0E131C] border-teal-500/20 text-white'
          }`}
        >
          <div className={`flex items-center justify-between text-xs font-medium mb-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            <span>Aura Capital</span>
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
          </div>

          <div className={`text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {aura}
            <span className={`text-xs font-semibold ${isLight ? 'text-teal-600' : 'text-teal-400'}`}> pts</span>
          </div>

          <div className={`flex items-center justify-between text-[10px] mt-2 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            <span className={`font-bold ${isLight ? 'text-purple-700' : 'text-teal-400'}`}>
              Level {Math.floor(aura / 100) + 1}
            </span>
            <span className="text-amber-600 dark:text-amber-300 font-bold flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5" /> Calendar
            </span>
          </div>
        </div>
      </div>

      {/* 3. 3D Realistic Pet / Tree Companion Stage */}
      <PetVisual
        companion={user.companion}
        streak={user.streak}
        currentDay={user.currentDay}
        totalRoadmapDays={user.totalRoadmapDays || user.planDurationDays || user.customPlanDurationDays || 180}
        themeMode={themeMode}
        onWaterTree={handleWaterTree}
        onFeedPet={handleFeedPet}
      />

      {/* 4. Today's ONE Recommended Deep Task */}
      <div
        id="today-main-task-card"
        className={`p-5 rounded-3xl border shadow-sm space-y-3 relative overflow-hidden transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-md'
            : 'bg-gradient-to-b from-[#111724] to-[#0A0E18] border-purple-500/30 text-white shadow-xl'
        }`}
      >
        <div className="flex items-center justify-between">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isLight
                ? 'bg-purple-100 text-purple-800 border-purple-200'
                : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Today's Main Task (Day {user.currentDay})</span>
          </div>
          <span className={`text-[11px] font-medium flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            <Clock className="w-3 h-3 text-teal-500" />
            {todayTask.estimatedMinutes} mins
          </span>
        </div>

        <div>
          <h4 className={`text-sm sm:text-base font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {todayTask.title}
          </h4>
          <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
            {todayTask.description}
          </p>
        </div>

        {/* Learning Points */}
        {todayTask.learningPoints && todayTask.learningPoints.length > 0 && (
          <div className="space-y-1 pt-1">
            {todayTask.learningPoints.map((pt, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isLight ? 'bg-teal-500' : 'bg-teal-400'}`} />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        )}

        {/* Focus Timer & Complete Task Action */}
        <div
          className={`pt-2 border-t flex items-center justify-between gap-3 ${
            isLight ? 'border-slate-200' : 'border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-800'
                  : 'bg-black/60 border-zinc-800 text-zinc-200'
              }`}
            >
              {formatTimer(taskTimer)}
            </div>
            <button
              onClick={() => setIsTaskTimerRunning(!isTaskTimerRunning)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              {isTaskTimerRunning ? 'Pause' : 'Focus Timer'}
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.94 }}
            disabled={isTaskCompleted}
            onClick={handleCompleteTodayTask}
            id="complete-task-button"
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              isTaskCompleted
                ? isLight
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 hover:opacity-95 text-white shadow-md'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isTaskCompleted ? 'Completed Today! (+25 Aura) ✨' : 'Complete (+25 Aura) 🍲'}</span>
          </motion.button>
        </div>
      </div>

      {/* 5. Device Screen Time Analytics & Negative Notification Card */}
      <ScreenTimeAnalyticsCard
        userId={user.uid}
        plannedDays={totalDays}
        onTriggerIntervention={onTriggerIntervention}
        themeMode={themeMode}
      />

      {/* 6. High-Leverage Feature Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Deep Learning 6000+ Words & YouTube */}
        <button
          onClick={onOpenDeepLesson}
          className={`p-3.5 rounded-2xl border flex flex-col justify-between text-left transition-all group cursor-pointer shadow-xs ${
            isLight
              ? 'bg-white hover:bg-purple-50/60 border-slate-200 hover:border-purple-300'
              : 'bg-zinc-900/80 hover:bg-zinc-800/90 border-zinc-800 hover:border-purple-500/40'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform ${
              isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-400'
            }`}
          >
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Deep Blueprint</div>
            <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              6000+ Words • YouTube • 10 MCQs
            </div>
          </div>
        </button>

        {/* Book Sanctuary (Open Library / Internet Archive) */}
        <button
          onClick={onOpenBooks}
          className={`p-3.5 rounded-2xl border flex flex-col justify-between text-left transition-all group cursor-pointer shadow-xs ${
            isLight
              ? 'bg-white hover:bg-amber-50/60 border-slate-200 hover:border-amber-300'
              : 'bg-zinc-900/80 hover:bg-zinc-800/90 border-zinc-800 hover:border-amber-500/40'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform ${
              isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            <Library className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Book Sanctuary</div>
            <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Fuzzy Search & Key Principles
            </div>
          </div>
        </button>

        {/* Life Habits & Stack (Outside Exam Prep) */}
        <button
          onClick={onOpenHabits}
          className={`p-3.5 rounded-2xl border flex flex-col justify-between text-left transition-all group cursor-pointer shadow-xs ${
            isLight
              ? 'bg-white hover:bg-teal-50/60 border-slate-200 hover:border-teal-300'
              : 'bg-zinc-900/80 hover:bg-zinc-800/90 border-zinc-800 hover:border-teal-500/40'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform ${
              isLight ? 'bg-teal-100 text-teal-700' : 'bg-teal-500/20 text-teal-400'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Habit Stack</div>
            <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Daily Life Routines (+10 Aura)
            </div>
          </div>
        </button>

        {/* Transformation Before & After */}
        <button
          onClick={onOpenGrowth}
          className={`p-3.5 rounded-2xl border flex flex-col justify-between text-left transition-all group cursor-pointer shadow-xs ${
            isLight
              ? 'bg-white hover:bg-cyan-50/60 border-slate-200 hover:border-cyan-300'
              : 'bg-zinc-900/80 hover:bg-zinc-800/90 border-zinc-800 hover:border-cyan-500/40'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform ${
              isLight ? 'bg-cyan-100 text-cyan-700' : 'bg-cyan-500/20 text-cyan-400'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Before & After</div>
            <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Transformation Analytics
            </div>
          </div>
        </button>

        {/* Clubs & Weekly Projects */}
        <button
          onClick={onOpenClubs}
          className={`p-3.5 rounded-2xl border flex flex-col justify-between text-left transition-all group cursor-pointer shadow-xs ${
            isLight
              ? 'bg-white hover:bg-indigo-50/60 border-slate-200 hover:border-indigo-300'
              : 'bg-zinc-900/80 hover:bg-zinc-800/90 border-zinc-800 hover:border-indigo-500/40'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform ${
              isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/20 text-indigo-400'
            }`}
          >
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Clubs</div>
            <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Peer Nudges & Weekly Projects
            </div>
          </div>
        </button>

        {/* Bedtime Wind-Down Soundscapes */}
        <button
          onClick={onOpenBedtime}
          className={`p-3.5 rounded-2xl border flex flex-col justify-between text-left transition-all group cursor-pointer shadow-xs ${
            isLight
              ? 'bg-white hover:bg-purple-50/60 border-slate-200 hover:border-purple-300'
              : 'bg-zinc-900/80 hover:bg-zinc-800/90 border-zinc-800 hover:border-purple-500/40'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform ${
              isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-400'
            }`}
          >
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Bedtime Mode</div>
            <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              432Hz Soundscapes & Timer
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
