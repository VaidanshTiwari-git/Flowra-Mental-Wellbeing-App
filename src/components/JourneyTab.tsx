import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Compass,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Sparkles,
  Youtube,
  BookOpen,
  HelpCircle,
  Award,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Zap,
  Flame,
  Send,
  Shield,
  Crown,
  Play,
  Check,
  ExternalLink,
  Layers,
  FileText,
} from 'lucide-react';
import {
  UserProfile,
  RoadmapData,
  WeeklyMilestone,
  TimetableBlock,
  QuizQuestion,
  LessonPackage,
} from '../types';
import { fetchLessonSummaryAndQuizAPI, submitAIReflectionAPI, getDefaultRoadmap } from '../services/api';
import { calculateAuraBadges } from '../lib/badges';

interface JourneyTabProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  themeMode?: 'dark' | 'light';
}

export const JourneyTab: React.FC<JourneyTabProps> = ({ user, onUpdateUser, themeMode = 'dark' }) => {
  const isLight = themeMode === 'light';
  const [activeSubView, setActiveSubView] = useState<'roadmap' | 'timetable' | 'youtube-lessons' | 'reflection'>('roadmap');
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  // Timetable State
  const [timetable, setTimetable] = useState<TimetableBlock[]>(
    user.roadmap?.dailyTimetable || [
      { timeSlot: '06:30 - 07:45', activity: `Morning Deep Sprint: ${user.goal} Core`, tag: 'Deep Work', isCoreGoal: true, isDone: false },
      { timeSlot: '08:30 - 09:00', activity: 'Mindful Walk & Hydration Reset', tag: 'Health', isCoreGoal: false, isDone: false },
      { timeSlot: '13:00 - 13:30', activity: '10-Minute Knowledge Drill & Active Recall', tag: 'Micro-Drill', isCoreGoal: true, isDone: false },
      { timeSlot: '18:00 - 19:30', activity: 'Active Project Lab & Hands-on Coding/Reading', tag: 'Core Lab', isCoreGoal: true, isDone: false },
      { timeSlot: '21:30 - 22:00', activity: 'Screen-Time Review & Nightly Reflection', tag: 'Reflection', isCoreGoal: false, isDone: false },
    ]
  );

  const [currentLesson, setCurrentLesson] = useState<LessonPackage | null>(null);
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({});

  // 10-Question Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Reflection State
  const [reflectionGain, setReflectionGain] = useState('');
  const [reflectionTrigger, setReflectionTrigger] = useState('');
  const [reflectionEnergy, setReflectionEnergy] = useState('High');
  const [reflectionTomorrow, setReflectionTomorrow] = useState('');
  const [aiReflectionResult, setAiReflectionResult] = useState<{
    insight: string;
    tomorrowNudge: string;
  } | null>(null);
  const [isSubmittingReflection, setIsSubmittingReflection] = useState(false);
  const [isChangingDuration, setIsChangingDuration] = useState(false);

  const totalPlanDays =
    user.totalRoadmapDays !== undefined && user.totalRoadmapDays !== null
      ? user.totalRoadmapDays
      : user.planDurationDays !== undefined && user.planDurationDays !== null
      ? user.planDurationDays
      : user.customPlanDurationDays !== undefined && user.customPlanDurationDays !== null
      ? user.customPlanDurationDays
      : 180;

  const [customDaysInput, setCustomDaysInput] = useState(String(totalPlanDays));

  const roadmap: RoadmapData =
    user.roadmap && user.roadmap.totalDays === totalPlanDays
      ? user.roadmap
      : getDefaultRoadmap(user.goal, user.companion?.name || 'AuraTree', totalPlanDays);

  const handleSwitchDuration = (days: number) => {
    const validDays = days > 0 ? days : 30;
    const newRoadmap = getDefaultRoadmap(user.goal, user.companion?.name || 'AuraTree', validDays);
    const updatedUser: UserProfile = {
      ...user,
      totalRoadmapDays: validDays,
      customPlanDurationDays: validDays,
      planDurationDays: validDays,
      roadmap: newRoadmap,
    };
    onUpdateUser(updatedUser);
    setIsChangingDuration(false);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
  };

  const toggleTimetableBlock = (index: number) => {
    const updated = [...timetable];
    updated[index].isDone = !updated[index].isDone;
    setTimetable(updated);

    if (updated[index].isDone) {
      confetti({ particleCount: 20, spread: 50, origin: { y: 0.7 } });
      const currentAura = user.companion?.aura ?? user.companion?.xp ?? 0;
      const nextAura = currentAura + 15;
      const updatedUser = {
        ...user,
        companion: {
          ...user.companion,
          aura: nextAura,
          xp: nextAura,
          level: Math.floor(nextAura / 100) + 1,
        },
      };
      onUpdateUser(updatedUser);
    }
  };

  const handleGenerateCustomLesson = async (overrideInput?: string) => {
    const rawInput = (overrideInput !== undefined ? overrideInput : customTopicInput).trim();
    if (!rawInput || isLoadingLesson) return;
    setIsLoadingLesson(true);
    try {
      const res = await fetchLessonSummaryAndQuizAPI({
        goal: user.goal,
        topic: rawInput,
        youtubeUrl: rawInput,
        currentDay: user.currentDay || 1,
      });

      setCurrentLesson(res);
      setSelectedAnswers({});
      setIsQuizSubmitted(false);
      setQuizScore(null);
      setActiveModuleIndex(0);
      setCustomTopicInput('');
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    } catch (e) {
      console.warn('Lesson generation failed:', e);
    } finally {
      setIsLoadingLesson(false);
    }
  };

  const handleMarkModuleComplete = (moduleId: string) => {
    setCompletedModules((prev) => {
      const isAlreadyDone = !!prev[moduleId];
      const next = { ...prev, [moduleId]: !isAlreadyDone };

      if (!isAlreadyDone) {
        confetti({ particleCount: 25, spread: 50, origin: { y: 0.7 } });
        const currentAura = user.companion?.aura ?? user.companion?.xp ?? 0;
        const nextAura = currentAura + 10;
        const updatedUser = {
          ...user,
          companion: {
            ...user.companion,
            aura: nextAura,
            xp: nextAura,
            level: Math.floor(nextAura / 100) + 1,
          },
        };
        onUpdateUser(updatedUser);
      }
      return next;
    });
  };

  const handleSelectQuizAnswer = (qIndex: number, optionIndex: number) => {
    if (isQuizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    if (!currentLesson || !currentLesson.quiz) return;
    let score = 0;
    currentLesson.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) {
        score++;
      }
    });

    setQuizScore(score);
    setIsQuizSubmitted(true);

    if (score >= 7) {
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    }

    const currentAura = user.companion?.aura ?? user.companion?.xp ?? 0;
    const nextAura = currentAura + score * 10;
    const updated = {
      ...user,
      companion: {
        ...user.companion,
        aura: nextAura,
        xp: nextAura,
        level: Math.floor(nextAura / 100) + 1,
        foodBowlsAvailable: (user.companion.foodBowlsAvailable || 0) + (score >= 7 ? 2 : 1),
        totalLeaves: (user.companion.totalLeaves || 0) + (user.companion.type === 'tree' ? 4 : 0),
        mood: 'radiant' as const,
      },
    };
    onUpdateUser(updated);
  };

  const handleSaveReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionGain && !reflectionTrigger) return;
    setIsSubmittingReflection(true);

    try {
      const res = await submitAIReflectionAPI({
        goal: user.goal,
        answers: {
          gain: reflectionGain,
          scrollTrigger: reflectionTrigger,
          energyRating: reflectionEnergy,
          tomorrowCommitment: reflectionTomorrow,
        },
        petName: user.companion.name,
      });

      setAiReflectionResult(res);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });

      const auraDelta = res.auraDelta || (res as any).growthScoreDelta || 10;
      const currentAura = user.companion?.aura || user.companion?.xp || 0;
      const updated = {
        ...user,
        meaningfulScore: Math.min(100, user.meaningfulScore + auraDelta),
        companion: {
          ...user.companion,
          aura: currentAura + 40,
          xp: currentAura + 40,
          level: Math.floor((currentAura + 40) / 100) + 1,
        },
      };
      onUpdateUser(updated);
    } catch (err) {
      console.warn('Reflection submit fallback:', err);
      setAiReflectionResult({
        insight: 'Great reflection! Self-awareness is the highest leverage anti-doomscrolling weapon.',
        tomorrowNudge: 'Lock in 9:00 AM for your core deep task before touching notification badges.',
      });
    } finally {
      setIsSubmittingReflection(false);
    }
  };

  const auraBadges = calculateAuraBadges(totalPlanDays, user.currentDay);

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* Sub-view Navigation Pills - Breathable & Equally Spaced */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-[#10141E] rounded-2xl border border-zinc-800/90 shadow-lg">
        {[
          { id: 'roadmap', label: `${totalPlanDays === 0 ? '0D' : totalPlanDays + 'D'} Roadmap`, icon: Compass },
          { id: 'timetable', label: 'Planned Time Table', icon: Calendar },
          { id: 'youtube-lessons', label: 'Curated YouTube & 100Q', icon: Youtube },
          { id: 'reflection', label: 'AI Reflection', icon: Sparkles },
        ].map((sub) => {
          const Icon = sub.icon;
          const isSel = activeSubView === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubView(sub.id as any)}
              className={`py-2.5 px-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                isSel
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBVIEW 1: ROADMAP (DIVIDED INTO 4 AURA BADGES) */}
      {activeSubView === 'roadmap' && (
        <div className="space-y-3">
          {/* 4 Aura Badges Tier Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-[#121726] to-[#0A0D14] border border-amber-500/30 shadow-xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">4-Tier Aura Badges</h4>
                  <p className="text-[10px] text-zinc-400">4 Milestones across your {totalPlanDays}-Day Journey</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/40">
                Day {user.currentDay} of {totalPlanDays}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              {auraBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-2.5 rounded-2xl border flex flex-col justify-between gap-1.5 transition-all ${
                    badge.unlocked
                      ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-amber-400 shadow-md ring-1 ring-amber-400'
                      : 'bg-zinc-950/60 border-zinc-800/80 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Q{badge.quarter} • Day {badge.targetDay}
                    </span>
                    {badge.unlocked ? (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                        Unlocked ✓
                      </span>
                    ) : (
                      <Lock className="w-3 h-3 text-zinc-600" />
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-extrabold text-white flex items-center gap-1">
                      <span>{badge.name}</span>
                    </div>
                    <div className="text-[9px] text-zinc-400 mt-0.5 line-clamp-2">{badge.description}</div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[10px]">
                    <span className="text-amber-400 font-mono font-bold">+{badge.auraReward} Aura</span>
                    <span className="text-zinc-500 text-[9px]">
                      {badge.unlocked ? 'Claimed' : `${Math.max(0, badge.targetDay - user.currentDay)}d left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overview Banner & Duration Switcher */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-purple-950/50 via-[#14141A] to-[#0D0D10] border border-purple-500/25 shadow-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-cyan-300">{totalPlanDays}-Day Transformation</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  Week {Math.min(roadmap.totalWeeks, Math.max(1, Math.ceil(user.currentDay / 7)))} of {roadmap.totalWeeks} ({roadmap.totalWeeks} Weeks)
                </span>
              </div>
              <button
                onClick={() => setIsChangingDuration(!isChangingDuration)}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{isChangingDuration ? 'Close Duration' : 'Change Plan Duration'}</span>
              </button>
            </div>

            {/* Expandable Duration Switcher Selector */}
            {isChangingDuration && (
              <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/30 space-y-2.5 animate-fadeIn">
                <div className="text-[11px] font-bold text-zinc-300">
                  Select or switch your roadmap timeline duration:
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[
                    { days: 30, label: '30 Days', weeks: '4 Wks' },
                    { days: 60, label: '60 Days', weeks: '9 Wks' },
                    { days: 90, label: '90 Days', weeks: '13 Wks' },
                    { days: 120, label: '120 Days', weeks: '18 Wks' },
                    { days: 180, label: '180 Days', weeks: '26 Wks' },
                    { days: 365, label: '365 Days', weeks: '52 Wks' },
                  ].map((preset) => {
                    const isSelected = totalPlanDays === preset.days;
                    return (
                      <button
                        key={preset.days}
                        onClick={() => handleSwitchDuration(preset.days)}
                        className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 border-emerald-400 text-white font-black shadow-md ring-1 ring-emerald-400'
                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                      >
                        <div className="text-[11px] font-bold">{preset.label}</div>
                        <div className="text-[9px] text-zinc-500">{preset.weeks}</div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/80">
                  <label className="text-[10px] text-zinc-400 shrink-0">Custom Days:</label>
                  <input
                    type="number"
                    min="1"
                    max="730"
                    placeholder="e.g. 45 or 90"
                    value={customDaysInput}
                    onChange={(e) => setCustomDaysInput(e.target.value)}
                    className="w-24 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                  <button
                    onClick={() => {
                      const parsed = Number(customDaysInput);
                      if (!isNaN(parsed) && parsed > 0) {
                        handleSwitchDuration(parsed);
                      }
                    }}
                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-lg transition-all cursor-pointer"
                  >
                    Apply Duration
                  </button>
                </div>
              </div>
            )}

            <h3 className="text-base font-extrabold text-white mt-1">{user.goal} Mastery Arc</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{roadmap.summary}</p>
          </div>

          {/* 26 Weekly Milestones Accordion */}
          <div className="space-y-2">
            {roadmap.weeklyMilestones.map((m) => {
              const currentWeek = Math.ceil(user.currentDay / 7);
              const isCurrent = m.weekNum === currentWeek;
              const isPast = m.weekNum < currentWeek;
              const isExpanded = expandedWeek === m.weekNum;

              return (
                <div
                  key={m.weekNum}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isCurrent
                      ? 'bg-purple-950/40 border-purple-400/80 shadow-lg shadow-purple-500/15'
                      : isPast
                      ? 'bg-[#121216] border-zinc-800 opacity-85'
                      : 'bg-[#0E0E12] border-zinc-800/80'
                  }`}
                >
                  <div
                    onClick={() => setExpandedWeek(isExpanded ? null : m.weekNum)}
                    className="p-3.5 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                          isCurrent
                            ? 'bg-gradient-to-r from-cyan-400 to-teal-300 text-zinc-950 shadow-md font-black'
                            : isPast
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {isPast ? '✓' : `W${m.weekNum}`}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          {m.title}
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-purple-500/30 text-purple-300 font-extrabold">
                              Current Week
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400">{m.focusArea}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {(m.unlockablePetBadge || m.unlockableBadge) && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-400" />
                          <span>Aura Badge</span>
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-3.5 pt-1 text-xs text-zinc-300 border-t border-zinc-800/80 bg-black/30 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-purple-300">Deliverable Project:</span>
                        <span className="text-zinc-300">{m.keyProject}</span>
                      </div>
                      {(m.unlockablePetBadge || m.unlockableBadge) && (
                        <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-[11px] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Unlocks: {m.unlockablePetBadge || m.unlockableBadge} for your companion!</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBVIEW 2: PLANNED TIME TABLE */}
      {activeSubView === 'timetable' && (
        <div className="space-y-3">
          <div className="p-4 rounded-3xl bg-[#141418] border border-emerald-500/20 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-white text-sm">Planned Time Table</h3>
              <p className="text-[11px] text-zinc-400">
                Your structured hour-by-hour roadmap for your {totalPlanDays}-day journey
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-emerald-400">
                {timetable.filter((t) => t.isDone).length} / {timetable.length}
              </span>
              <div className="text-[9px] text-zinc-500">Blocks Completed</div>
            </div>
          </div>

          <div className="space-y-2">
            {timetable.map((block, idx) => (
              <div
                key={idx}
                onClick={() => toggleTimetableBlock(idx)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  block.isDone
                    ? 'bg-emerald-950/25 border-emerald-800/40 text-zinc-400'
                    : 'bg-[#121216] border-zinc-800 hover:border-purple-500/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs transition-colors ${
                      block.isDone
                        ? 'bg-emerald-500 border-emerald-500 text-zinc-950 font-bold'
                        : 'border-zinc-700 bg-zinc-900/60'
                    }`}
                  >
                    {block.isDone ? '✓' : ''}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {block.timeSlot}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${
                          block.isCoreGoal
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {block.tag}
                      </span>
                    </div>
                    <div className={`text-xs font-semibold mt-0.5 ${block.isDone ? 'line-through text-zinc-500' : 'text-white'}`}>
                      {block.activity}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] text-amber-400 font-bold">
                  {block.isDone ? '+15 XP' : '+15 XP'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBVIEW 3: "LEARN INSTEAD OF SCROLL" YOUTUBE LESSONS & 10-QUESTION QUIZ */}
      {activeSubView === 'youtube-lessons' && (
        <div className="space-y-5">
          {/* Header & Custom Topic / URL Input */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-red-950/50 via-[#14141A] to-[#0D0D10] border border-red-500/30 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>Learn Instead of Scroll • Intelligent Video Lecture Engine</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-semibold border border-red-500/30">
                5,000-Word Deep Matrix + 10 MCQs
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Paste <strong className="text-white">any YouTube video link</strong> (or search a topic) to synthesize a deep 5,000-word modular lecture and generate a custom 10-question retention evaluation.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customTopicInput}
                  onChange={(e) => setCustomTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customTopicInput.trim() && !isLoadingLesson) {
                      handleGenerateCustomLesson();
                    }
                  }}
                  placeholder={`Paste YouTube URL (e.g. https://www.youtube.com/watch?v=...) or topic...`}
                  className="w-full bg-[#0A0A0E] border border-zinc-700/80 rounded-2xl pl-3.5 pr-20 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all"
                />
                {customTopicInput && (
                  <button
                    onClick={() => setCustomTopicInput('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 hover:text-white px-1.5 py-0.5 rounded bg-zinc-800 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <button
                onClick={() => handleGenerateCustomLesson()}
                disabled={isLoadingLesson || !customTopicInput.trim()}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:from-red-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-red-600/25 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLoadingLesson ? 'Synthesizing...' : 'Analyze & Generate'}</span>
              </button>
            </div>

            {/* Quick Starter Suggestions */}
            {!currentLesson && !isLoadingLesson && (
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-zinc-400 mb-2">Quick Starter Masterclasses:</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    `Complete 90-Day ${user.goal} Deep Mastery`,
                    'Data Structures & Algorithms in Practice',
                    'High-Yield System Architecture & Protocols',
                    'Active Recall & Cognitive Super-Learning',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleGenerateCustomLesson(preset)}
                      className="text-[11px] px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-red-500/40 text-zinc-300 hover:text-white cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-red-400" />
                      <span>{preset}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoadingLesson && (
            <div className="p-8 rounded-3xl bg-[#121218] border border-red-500/30 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500 flex items-center justify-center animate-pulse">
                  <Youtube className="w-6 h-6 text-red-400" />
                </div>
                <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 animate-spin" />
              </div>
              <div className="text-sm font-bold text-white">Synthesizing High-Yield Masterclass...</div>
              <p className="text-xs text-zinc-400 max-w-md">
                Constructing comprehensive 5,000-word modular curriculum breakdown and crafting 10 intelligent retention MCQs.
              </p>
            </div>
          )}

          {/* Dynamic Content: ONLY rendered when a lesson has been generated / pasted! */}
          {currentLesson && !isLoadingLesson && (
            <div className="space-y-5">
              {/* YouTube Video Player Embed & Header */}
              <div className="rounded-3xl bg-[#121216] border border-zinc-800 overflow-hidden shadow-2xl">
                {currentLesson.youtubeVideoId ? (
                  <div className="relative aspect-video w-full bg-black">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${currentLesson.youtubeVideoId}?rel=0&modestbranding=1`}
                      title={currentLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video w-full bg-zinc-950 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-600/90 text-white flex items-center justify-center shadow-lg shadow-red-600/40 mb-2">
                      <Youtube className="w-7 h-7" />
                    </div>
                    <div className="text-sm font-bold text-white">{currentLesson.title}</div>
                  </div>
                )}

                <div className="p-4 space-y-2 border-b border-zinc-800/80 bg-[#0E0E12]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-white">{currentLesson.title}</h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-xl border border-zinc-800">
                      <Clock className="w-3 h-3 text-red-400" />
                      <span>{currentLesson.durationStr || '25 mins'}</span>
                    </div>
                  </div>
                  <div className="text-xs text-cyan-300 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Topic: {currentLesson.topic}</span>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="p-4 space-y-3 bg-[#111116]">
                  <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Executive Framework Summary</span>
                  </div>
                  <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-[#0A0A0E] p-3.5 rounded-2xl border border-zinc-800/80">
                    {currentLesson.deepSummary}
                  </div>

                  {/* Key Takeaways */}
                  {currentLesson.keyTakeaways && currentLesson.keyTakeaways.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        Core Takeaways:
                      </span>
                      {currentLesson.keyTakeaways.map((tk, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                          <span className="text-red-400 font-bold">#{i + 1}</span>
                          <span>{tk}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 5,000-WORD MODULAR LECTURE COURSEWORK */}
              {currentLesson.modules && currentLesson.modules.length > 0 && (
                <div className="p-4 rounded-3xl bg-[#141418] border border-cyan-500/25 shadow-2xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-cyan-300">5,000-Word Modular Coursework</div>
                        <div className="text-[10px] text-zinc-400">
                          4 Deep Modules • Complete Comprehensive Knowledge Matrix
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
                      5,200+ Words in Curriculum
                    </span>
                  </div>

                  {/* Module Selector Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {currentLesson.modules.map((mod, idx) => {
                      const isActive = activeModuleIndex === idx;
                      const isDone = !!completedModules[mod.id];

                      return (
                        <button
                          key={mod.id}
                          onClick={() => setActiveModuleIndex(idx)}
                          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            isActive
                              ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                              : 'bg-[#0E0E12] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-cyan-400">Mod {idx + 1}</span>
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <span className="text-[9px] text-zinc-500">{mod.readingTimeMinutes || 12}m</span>
                            )}
                          </div>
                          <div className="text-xs font-semibold line-clamp-1">{mod.title}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Module Reading View */}
                  {currentLesson.modules[activeModuleIndex] && (
                    <div className="p-4 rounded-2xl bg-[#0B0B0F] border border-zinc-800 space-y-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                            Module {activeModuleIndex + 1} of {currentLesson.modules.length}
                          </div>
                          <h4 className="text-sm font-extrabold text-white">
                            {currentLesson.modules[activeModuleIndex].title}
                          </h4>
                        </div>

                        <button
                          onClick={() => handleMarkModuleComplete(currentLesson.modules[activeModuleIndex].id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                            completedModules[currentLesson.modules[activeModuleIndex].id]
                              ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
                              : 'bg-zinc-800 hover:bg-cyan-600 text-zinc-200 hover:text-white'
                          }`}
                        >
                          {completedModules[currentLesson.modules[activeModuleIndex].id] ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Completed (+10 Aura)</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark as Read (+10 Aura)</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Module Detailed Content */}
                      <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line font-normal space-y-2">
                        {currentLesson.modules[activeModuleIndex].content}
                      </div>

                      {/* Module Specific Takeaways */}
                      {currentLesson.modules[activeModuleIndex].takeaways &&
                        currentLesson.modules[activeModuleIndex].takeaways.length > 0 && (
                          <div className="p-3 rounded-xl bg-[#14141E] border border-cyan-500/20 space-y-1.5 mt-3">
                            <div className="text-[11px] font-bold text-cyan-300">Module Key Takeaways:</div>
                            {currentLesson.modules[activeModuleIndex].takeaways.map((t, tidx) => (
                              <div key={tidx} className="flex items-start gap-2 text-xs text-zinc-300">
                                <span className="text-cyan-400 font-bold">•</span>
                                <span>{t}</span>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}

              {/* 10-QUESTION KNOWLEDGE RETENTION EVALUATION */}
              <div className="p-4 rounded-3xl bg-[#141418] border border-purple-500/30 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <HelpCircle className="w-4 h-4" />
                      <span>10-Question Knowledge Retention Quiz</span>
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      Test your video lecture mastery to earn companion XP & Food Bowl!
                    </p>
                  </div>

                  {isQuizSubmitted && quizScore !== null && (
                    <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold">
                      Score: {quizScore} / 10 ({Math.round((quizScore / 10) * 100)}%)
                    </div>
                  )}
                </div>

                {/* 10 Questions Render */}
                <div className="space-y-4">
                  {currentLesson.quiz.map((q, qIndex) => {
                    const selected = selectedAnswers[qIndex];
                    const isCorrect = isQuizSubmitted && selected === q.correctOptionIndex;
                    const isWrong = isQuizSubmitted && selected !== undefined && selected !== q.correctOptionIndex;

                    return (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-2xl bg-[#0E0E12] border border-zinc-800 space-y-2.5"
                      >
                        <div className="flex items-start gap-2 text-xs font-bold text-white">
                          <span className="w-5 h-5 rounded-lg bg-purple-900/60 text-purple-300 flex items-center justify-center shrink-0 text-[10px]">
                            {q.questionNumber}
                          </span>
                          <span>{q.question}</span>
                        </div>

                        {/* Options */}
                        <div className="space-y-1.5 pl-7">
                          {q.options.map((opt, optIdx) => {
                            const isOptionSelected = selected === optIdx;
                            let optionStyle = 'bg-[#14141A] border-zinc-800 text-zinc-300 hover:border-purple-500/40';

                            if (isQuizSubmitted) {
                              if (optIdx === q.correctOptionIndex) {
                                optionStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-bold';
                              } else if (isOptionSelected && optIdx !== q.correctOptionIndex) {
                                optionStyle = 'bg-rose-950/50 border-rose-500 text-rose-200';
                              }
                            } else if (isOptionSelected) {
                              optionStyle = 'bg-purple-950/60 border-purple-400 text-white font-bold ring-1 ring-purple-400';
                            }

                            return (
                              <div
                                key={optIdx}
                                onClick={() => handleSelectQuizAnswer(qIndex, optIdx)}
                                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${optionStyle}`}
                              >
                                <span>{opt}</span>
                                {isQuizSubmitted && optIdx === q.correctOptionIndex && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation after submit */}
                        {isQuizSubmitted && (
                          <div className="mt-2 p-2.5 rounded-xl bg-[#161622] border border-purple-500/20 text-[11px] text-purple-200 leading-relaxed pl-7">
                            <span className="font-bold text-cyan-300">Explanation: </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Submit / Retake Button */}
                {!isQuizSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length < 5}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 hover:from-amber-300 hover:to-pink-400 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                  >
                    Submit 10-Question Knowledge Evaluation & Claim Companion Rewards
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedAnswers({});
                      setIsQuizSubmitted(false);
                      setQuizScore(null);
                    }}
                    className="w-full py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retake 10-Question Quiz</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBVIEW 4: AI REFLECTION CHECK-IN */}
      {activeSubView === 'reflection' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-950/50 via-[#14141A] to-[#0D0D10] border border-purple-500/25 shadow-xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Periodic AI Reflection Check-in</span>
            </div>
            <h3 className="text-base font-extrabold text-white">Daily Mindset Audit</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Answering these 2-3 quick questions trains the AI coach to customize future timetable recommendations and protect your focus.
            </p>
          </div>

          <form onSubmit={handleSaveReflection} className="p-4 rounded-3xl bg-[#141418] border border-zinc-800 space-y-3.5">
            <div>
              <label className="text-xs font-bold text-white block mb-1">
                1. What genuine value or breakthrough did you gain from your screen time today?
              </label>
              <textarea
                rows={2}
                value={reflectionGain}
                onChange={(e) => setReflectionGain(e.target.value)}
                placeholder="e.g. Mastered binary search invariant, finished 15 pages of Atomic Habits..."
                className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white block mb-1">
                2. What trigger or mood caused you to open social media / reels?
              </label>
              <input
                type="text"
                value={reflectionTrigger}
                onChange={(e) => setReflectionTrigger(e.target.value)}
                placeholder="e.g. Afternoon boredom, dinner procrastination, notification popup..."
                className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white block mb-1">
                3. One non-negotiable focus commitment for tomorrow:
              </label>
              <input
                type="text"
                value={reflectionTomorrow}
                onChange={(e) => setReflectionTomorrow(e.target.value)}
                placeholder="e.g. Complete morning 45-min sprint before opening any feeds..."
                className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReflection}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 cursor-pointer transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmittingReflection ? 'AI is Analyzing...' : 'Submit Reflection & Receive AI Feedback'}</span>
            </button>
          </form>

          {/* AI Feedback Card */}
          {aiReflectionResult && (
            <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-950/50 to-[#121216] border border-purple-500/30 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>AI Behavioral Feedback & Tomorrow's Nudge</span>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed bg-[#0A0A0A] p-3 rounded-xl border border-zinc-800">
                {aiReflectionResult.insight}
              </p>
              <div className="text-[11px] text-teal-300 font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{aiReflectionResult.tomorrowNudge}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
