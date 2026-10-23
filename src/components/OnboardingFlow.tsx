import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  PersonalizationAnswers,
  CompanionType,
  ThemeMode,
} from '../types';
import { COLOR_PALETTES } from '../lib/palettes';
import { FlowraLogo } from './FlowraLogo';
import { auth } from '../lib/firebase';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Smartphone,
  BookOpen,
  Users,
  Palette,
  Bell,
  LogIn,
  UserCheck,
  Flame,
  CheckSquare,
  Square,
  Wand2,
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (answers: PersonalizationAnswers, isGuest: boolean) => void;
  onGoogleSignIn: () => Promise<void>;
  initialAuthData?: { isGuest: boolean; email?: string; name?: string };
}

// Smart AI Duration Personalizer based on user needs, skills, goal complexity & hours
export function calculatePersonalizedPlanDuration(
  currentAnswers: Partial<PersonalizationAnswers>,
  customGoal?: string,
  customSkill?: string,
  customHours?: string
): number {
  const goal = (customGoal?.trim() || currentAnswers.primaryGoal || currentAnswers.goal || '').toLowerCase();
  const skill = (customSkill?.trim() || currentAnswers.currentSkillLevel || '').toLowerCase();
  const hours = Number(customHours?.trim()) || currentAnswers.dailyHoursAvailable || 2;

  // 1. Base duration by goal domain
  let baseDays = 90;
  if (goal.includes('placement') || goal.includes('dsa') || goal.includes('ai') || goal.includes('ml') || goal.includes('backend') || goal.includes('upsc') || goal.includes('cfa') || goal.includes('gate')) {
    baseDays = 150;
  } else if (goal.includes('english') || goal.includes('fluency') || goal.includes('communication')) {
    baseDays = 75;
  } else if (goal.includes('fitness') || goal.includes('habit') || goal.includes('discipline')) {
    baseDays = 60;
  } else if (goal.includes('book') || goal.includes('reading')) {
    baseDays = 45;
  }

  // 2. Adjust for skill level
  if (skill.includes('beginner') || skill.includes('zero') || skill.includes('starter')) {
    baseDays += 30; // Extra runway for fundamentals
  } else if (skill.includes('advanced') || skill.includes('pro') || skill.includes('expert')) {
    baseDays = Math.max(30, baseDays - 30); // Fast-paced sprint
  }

  // 3. Adjust for daily available hours
  if (hours <= 1) {
    baseDays += 30; // Paced marathon
  } else if (hours >= 4) {
    baseDays = Math.max(30, Math.round(baseDays * 0.7)); // Intensive deep dive
  }

  // Round to clean multiples of 5 or standard sprint lengths
  return Math.min(365, Math.max(14, Math.round(baseDays / 5) * 5));
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onGoogleSignIn,
  initialAuthData,
}) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 10;

  const [answers, setAnswers] = useState<PersonalizationAnswers>({
    primaryGoal: 'Placement & DSA Prep',
    goal: 'Placement & DSA Prep',
    planDurationDays: 180,
    customPlanDurationDays: 180,
    currentSkillLevel: 'Intermediate',
    dailyHoursAvailable: 3,
    distractionTrigger: 'Instagram Reels',
    primaryDistractionApp: 'Instagram Reels',
    distractionApps: ['Instagram Reels', 'YouTube Shorts'],
    preferredLearningStyle: 'Deep Modules & 10 MCQs',
    clubPreference: 'Competitive Leaderboard Squad',
    companionType: 'tree',
    companionName: 'AuraSprout',
    selectedPaletteId: 'emerald-bloom',
    chosenColorPalette: 'emerald-bloom',
    themeMode: 'dark', // Premium default dark mode with neon emerald glow
    negativeNotificationsEnabled: true,
    negativeNotificationThresholdMins: 30,
    bedtimeHour: 23,
    customGoalText: '',
    otherCustomAnswers: {},
  });

  // Custom text input states for "Other Option"
  const [customGoalInput, setCustomGoalInput] = useState('');
  const [customDurationInput, setCustomDurationInput] = useState('180');
  const [isAutoPlanSelected, setIsAutoPlanSelected] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customHoursInput, setCustomHoursInput] = useState('');
  const [customDistractionInput, setCustomDistractionInput] = useState('');
  const [customLearningInput, setCustomLearningInput] = useState('');
  const [companionNameInput, setCompanionNameInput] = useState('AuraSprout');
  const [customClubInput, setCustomClubInput] = useState('');

  // State for App Logo reveal animation after answering 10 questions
  const [isRevealingLogo, setIsRevealingLogo] = useState(false);

  const nextSlide = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const toggleDistractionApp = (app: string) => {
    const current = answers.distractionApps || [];
    if (current.includes(app)) {
      const filtered = current.filter((a) => a !== app);
      setAnswers({
        ...answers,
        distractionApps: filtered.length > 0 ? filtered : [app],
        primaryDistractionApp: filtered[0] || app,
      });
    } else {
      const updated = [...current, app];
      setAnswers({
        ...answers,
        distractionApps: updated,
        primaryDistractionApp: updated[0],
      });
    }
  };

  const finishOnboarding = (isGuest: boolean) => {
    // Show official Flowra App Logo reveal screen
    setIsRevealingLogo(true);
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.5 },
    });

    setTimeout(() => {
      let chosenDays = 180;
      if (isAutoPlanSelected) {
        chosenDays = calculatePersonalizedPlanDuration(answers, customGoalInput, customSkillInput, customHoursInput);
      } else if (customDurationInput === '0' || customDurationInput.trim() === '0' || answers.planDurationDays === 0) {
        chosenDays = 0;
      } else {
        const parsed = Number(customDurationInput);
        chosenDays = !isNaN(parsed) && customDurationInput.trim() !== '' ? parsed : (answers.planDurationDays ?? 180);
      }

      const finalGoal = customGoalInput.trim() ? customGoalInput.trim() : answers.primaryGoal || 'General Mastery';

      const finalAnswers: PersonalizationAnswers = {
        ...answers,
        name: initialAuthData?.name || 'Pioneer',
        goal: finalGoal,
        primaryGoal: finalGoal,
        planDurationDays: chosenDays,
        customPlanDurationDays: chosenDays,
        customDurationDays: chosenDays,
        companionName: companionNameInput.trim() || 'AuraSprout',
        themeMode: answers.themeMode === 'light' ? 'light' : 'dark',
        chosenColorPalette: answers.selectedPaletteId || 'emerald-bloom',
        colorPaletteId: answers.selectedPaletteId || 'emerald-bloom',
        primaryDistractionApp: answers.distractionApps?.[0] || 'Instagram Reels',
        otherCustomAnswers: {
          skill: customSkillInput,
          hours: customHoursInput,
          distraction: customDistractionInput,
          learning: customLearningInput,
          club: customClubInput,
        },
      };

      onComplete(finalAnswers, isGuest);
    }, 2400);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto transition-colors duration-200 ${
        answers.themeMode === 'light'
          ? 'bg-zinc-50 text-zinc-900'
          : 'bg-[#070A0F] text-white'
      }`}
    >
      {/* Top Header with Brand & Dynamic Progress Bar */}
      <header className="w-full max-w-xl flex flex-col items-center gap-3 pt-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <FlowraLogo size="sm" showTagline={false} />
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-wider text-emerald-400">FLOWRA</span>
              <span className="text-[10px] text-zinc-400">Step {currentSlide} of {totalSlides} • Personalized Blueprint</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => finishOnboarding(true)}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 px-2 py-1"
            >
              Skip to Blueprint
            </button>
          </div>
        </div>

        {/* Progress Line */}
        <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#7EF8C0] via-[#48DF9A] to-[#25A86B] transition-all duration-300 rounded-full"
            style={{ width: `${(currentSlide / totalSlides) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Slide Content */}
      <main className="w-full max-w-xl my-auto py-3">
        {/* SLIDE 1: Primary Goal + Other Option */}
        {currentSlide === 1 && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="text-center">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-extrabold border border-emerald-500/20 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Question 1 of 10
              </span>
              <h2 className="text-xl sm:text-2xl font-black">What is your primary transformation goal?</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Your 14-hour timetable and daily modules will be structured around this target.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {[
                { id: 'Placement & DSA Prep', label: '🚀 Placement & DSA Prep', desc: 'LeetCode patterns, OS, DBMS & Tech interviews' },
                { id: 'Learn AI/ML & LLMs', label: '🤖 Learn AI/ML & Agents', desc: 'PyTorch, Neural Nets, LangChain & LLM apps' },
                { id: 'Improve English & Fluency', label: '🗣️ English & Communication', desc: 'Speaking drills, corporate vocabulary & pitch' },
                { id: 'Read More Non-Fiction Books', label: '📚 Non-Fiction Mastery', desc: 'Deep reading, notes & Feynman retention' },
                { id: 'Peak Fitness & Discipline', label: '💪 Fitness & Energy', desc: 'Clean habit loops, morning workouts & endurance' },
                { id: 'Python & Backend Engineering', label: '🐍 Python & Backend', desc: 'FastAPI, System Design, SQL & Clean Architecture' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setAnswers({ ...answers, primaryGoal: opt.id, goal: opt.id });
                    setCustomGoalInput('');
                  }}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    answers.primaryGoal === opt.id && !customGoalInput
                      ? 'bg-emerald-500/20 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                      : 'bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-extrabold text-xs sm:text-sm text-white">{opt.label}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>

            {/* Other Option (Custom Text Input) */}
            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span>✏️ Other Option (Type Custom Goal):</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Master CFA Level 1, UPSC Prep, Full Stack React, Learn Japanese..."
                value={customGoalInput}
                onChange={(e) => {
                  setCustomGoalInput(e.target.value);
                  setAnswers({ ...answers, primaryGoal: e.target.value, goal: e.target.value });
                }}
                className="w-full mt-1.5 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* SLIDE 2: Plan Duration + "Let the app choose best plan for you" */}
        {currentSlide === 2 && (() => {
          const dynamicAutoDays = calculatePersonalizedPlanDuration(answers, customGoalInput, customSkillInput, customHoursInput);

          return (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="text-center">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-extrabold border border-cyan-500/20 mb-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Question 2 of 10 (Plan Maker)
                </span>
                <h2 className="text-xl sm:text-2xl font-black">Choose your roadmap duration</h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Your 4 Aura Badges (Silver, Gold, Platinum, Diamond) will be spaced evenly across this duration.
                </p>
              </div>

              {/* Smart Option: Let the app choose best plan for you */}
              <button
                onClick={() => {
                  setIsAutoPlanSelected(true);
                  setAnswers({
                    ...answers,
                    planDurationDays: dynamicAutoDays,
                    customPlanDurationDays: dynamicAutoDays,
                    customDurationDays: dynamicAutoDays,
                  });
                  setCustomDurationInput(String(dynamicAutoDays));
                }}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  isAutoPlanSelected
                    ? 'bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30 border-emerald-400 shadow-lg ring-2 ring-emerald-400'
                    : 'bg-zinc-900/80 border-emerald-500/30 hover:border-emerald-500/60'
                }`}
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-white flex items-center gap-2 flex-wrap">
                      <span>Let the app choose best plan for you</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500 text-black font-extrabold">
                        AI Recommended
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-300 mt-0.5">
                      Dynamically personalizes duration based on your target goal ({answers.primaryGoal || 'Selected Goal'}), skill level & daily hours
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <div className="text-xs font-mono font-bold text-emerald-400">{dynamicAutoDays} Days</div>
                  <div className="text-[9px] text-emerald-300/80 font-semibold">AI Calculated</div>
                </div>
              </button>

              {/* Explicit Presets (including 0D) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { days: 0, label: '0 Days (0D)', desc: 'Instant Sprint / Day 0' },
                  { days: 30, label: '30 Days', desc: '1 Month Sprint' },
                  { days: 60, label: '60 Days', desc: '2 Months Focus' },
                  { days: 90, label: '90 Days', desc: 'Quarterly Shift' },
                  { days: 100, label: '100 Days', desc: '100-Day Code' },
                  { days: 150, label: '150 Days', desc: '5 Months Core' },
                  { days: 180, label: '180 Days', desc: '6 Months Mastery' },
                  { days: 200, label: '200 Days', desc: 'Deep Evolution' },
                  { days: 365, label: '365 Days', desc: '1-Year Elite' },
                ].map((opt) => {
                  const isSelected =
                    !isAutoPlanSelected &&
                    (customDurationInput === String(opt.days) ||
                      (answers.planDurationDays === opt.days && customDurationInput === String(opt.days)));

                  return (
                    <button
                      key={opt.days}
                      onClick={() => {
                        setIsAutoPlanSelected(false);
                        setAnswers({
                          ...answers,
                          planDurationDays: opt.days,
                          customPlanDurationDays: opt.days,
                          customDurationDays: opt.days,
                        });
                        setCustomDurationInput(String(opt.days));
                      }}
                      className={`p-3 rounded-2xl text-center border transition-all ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400 shadow-md ring-1 ring-emerald-400 font-extrabold'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-black text-white">{opt.label}</div>
                      <div className="text-[9px] text-zinc-400">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Days Input */}
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3">
                <label className="text-xs font-bold text-zinc-300">Or type exact custom days (e.g. 0 for Day Zero):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="730"
                    placeholder="0-730"
                    value={customDurationInput}
                    onChange={(e) => {
                      setIsAutoPlanSelected(false);
                      setCustomDurationInput(e.target.value);
                      const val = e.target.value.trim();
                      if (val === '0') {
                        setAnswers({
                          ...answers,
                          planDurationDays: 0,
                          customPlanDurationDays: 0,
                          customDurationDays: 0,
                        });
                      } else {
                        const parsed = Number(val);
                        if (!isNaN(parsed) && parsed >= 0) {
                          setAnswers({
                            ...answers,
                            planDurationDays: parsed,
                            customPlanDurationDays: parsed,
                            customDurationDays: parsed,
                          });
                        }
                      }
                    }}
                    className="w-24 px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl text-center font-mono font-bold text-sm text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs text-zinc-400 font-bold">Days</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* SLIDE 3: Current Skill Level + Other Option */}
        {currentSlide === 3 && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="text-center">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-extrabold border border-purple-500/20 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Question 3 of 10
              </span>
              <h2 className="text-xl sm:text-2xl font-black">What is your current familiarity level?</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Flowra calibrates question difficulty and reading depth accordingly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
              {[
                { id: 'Beginner', label: '🌱 Beginner', desc: 'Starting fresh from core first principles' },
                { id: 'Intermediate', label: '⚡ Intermediate', desc: 'Have basic knowledge, need rigorous consistency' },
                { id: 'Advanced', label: '🏆 Advanced', desc: 'Preparing for elite competitive benchmarks' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setAnswers({ ...answers, currentSkillLevel: opt.id });
                    setCustomSkillInput('');
                  }}
                  className={`p-3.5 rounded-2xl text-left border transition-all ${
                    answers.currentSkillLevel === opt.id && !customSkillInput
                      ? 'bg-purple-500/20 border-purple-400 shadow-md ring-1 ring-purple-400'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-extrabold text-xs sm:text-sm text-white">{opt.label}</div>
                  <div className="text-[10px] text-zinc-400 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <label className="text-xs font-bold text-purple-400">✏️ Other Option (Type Custom Level):</label>
              <input
                type="text"
                placeholder="e.g. Working professional returning after 2 years..."
                value={customSkillInput}
                onChange={(e) => {
                  setCustomSkillInput(e.target.value);
                  setAnswers({ ...answers, currentSkillLevel: e.target.value });
                }}
                className="w-full mt-1.5 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        )}

        {/* SLIDE 4: Daily Hours Available + Other Option */}
        {currentSlide === 4 && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="text-center">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-extrabold border border-amber-500/20 mb-1.5">
                <Flame className="w-3.5 h-3.5" /> Question 4 of 10
              </span>
              <h2 className="text-xl sm:text-2xl font-black">How many hours can you dedicate daily?</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                We will schedule your morning high-energy sprint and evening project lab.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
              {[
                { hours: 1, label: '1 Hour', desc: 'Micro Sprint' },
                { hours: 2, label: '2 Hours', desc: 'Consistent Flow' },
                { hours: 3, label: '3 Hours', desc: 'Deep Focus' },
                { hours: 5, label: '5+ Hours', desc: 'Monastic Mode' },
              ].map((opt) => (
                <button
                  key={opt.hours}
                  onClick={() => {
                    setAnswers({ ...answers, dailyHoursAvailable: opt.hours });
                    setCustomHoursInput('');
                  }}
                  className={`p-3 rounded-2xl text-center border transition-all ${
                    answers.dailyHoursAvailable === opt.hours && !customHoursInput
                      ? 'bg-amber-500/20 border-amber-400 shadow-md ring-1 ring-amber-400'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-sm font-black text-white">{opt.label}</div>
                  <div className="text-[10px] text-zinc-400">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <label className="text-xs font-bold text-amber-400">✏️ Other Option (Type Custom Hours/Schedule):</label>
              <input
                type="text"
                placeholder="e.g. 45 mins in morning + 1.5 hrs at night..."
                value={customHoursInput}
                onChange={(e) => {
                  setCustomHoursInput(e.target.value);
                  const parsed = parseFloat(e.target.value);
                  if (parsed > 0) setAnswers({ ...answers, dailyHoursAvailable: parsed });
                }}
                className="w-full mt-1.5 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* SLIDE 5: Distraction Apps (MULTI-SELECT) + Other Option */}
        {currentSlide === 5 && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="text-center">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-extrabold border border-rose-500/20 mb-1.5">
                <Smartphone className="w-3.5 h-3.5" /> Question 5 of 10 (Multiple Selection)
              </span>
              <h2 className="text-xl sm:text-2xl font-black">Which apps waste most of your focus?</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Select all that apply. Flowra will intercept these with negative notification alerts & Dopamine Switch drills.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
              {[
                { id: 'Instagram Reels', emoji: '📸', label: 'Instagram Reels' },
                { id: 'YouTube Shorts', emoji: '▶️', label: 'YouTube Shorts' },
                { id: 'TikTok', emoji: '🎵', label: 'TikTok Feeds' },
                { id: 'Snapchat', emoji: '👻', label: 'Snapchat Stories' },
                { id: 'Reddit Doomscrolling', emoji: '🤖', label: 'Reddit Feeds' },
                { id: 'Twitter / X', emoji: '🐦', label: 'Twitter / X' },
                { id: 'Mobile Gaming', emoji: '🎮', label: 'Mobile Games' },
                { id: 'Netflix & Streaming', emoji: '🍿', label: 'Netflix & OTT' },
                { id: 'WhatsApp / Chat Groups', emoji: '💬', label: 'Chat Groups' },
              ].map((opt) => {
                const isSelected = (answers.distractionApps || []).includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleDistractionApp(opt.id)}
                    className={`p-3 rounded-2xl flex items-center justify-between border transition-all text-left ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-400 text-white shadow-md ring-1 ring-rose-400'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-lg">{opt.emoji}</span>
                      <span className="text-xs font-bold truncate text-white">{opt.label}</span>
                    </div>
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Other Option (Custom Text Input) */}
            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <label className="text-xs font-bold text-rose-400">✏️ Other Option (Type Custom Distraction App):</label>
              <input
                type="text"
                placeholder="e.g. Discord, Telegram, Stock trading apps..."
                value={customDistractionInput}
                onChange={(e) => {
                  setCustomDistractionInput(e.target.value);
                  if (e.target.value.trim()) {
                    setAnswers({
                      ...answers,
                      distractionApps: Array.from(new Set([...(answers.distractionApps || []), e.target.value.trim()])),
                    });
                  }
                }}
                className="w-full mt-1.5 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        )}

        {/* SLIDE 6: Preferred Learning Style + Other Option */}
        {currentSlide === 6 && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="text-center">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-extrabold border border-blue-500/20 mb-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Question 6 of 10
              </span>
              <h2 className="text-xl sm:text-2xl font-black">Preferred learning style?</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Active recall testing vs practical code labs vs executive summaries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
              {[
                { id: 'Deep Modules & 10 MCQs', label: '📖 Deep Modules & 10 MCQs', desc: '6000-word deep articles + instant MCQ retrieval test' },
                { id: 'YouTube Lecture & Summary', label: '▶️ Curated YouTube & AI Summary', desc: 'High-yield masterclass videos with key takeaways' },
                { id: 'Daily Book Sanctuary', label: '📚 Book Principles & Feynman', desc: 'Non-fiction insights applied to daily routine' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setAnswers({ ...answers, preferredLearningStyle: opt.id });
                    setCustomLearningInput('');
                  }}
                  className={`p-3.5 rounded-2xl text-left border transition-all ${
                    answers.preferredLearningStyle === opt.id && !customLearningInput
                      ? 'bg-blue-500/20 border-blue-400 shadow-md ring-1 ring-blue-400'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-extrabold text-xs sm:text-sm text-white">{opt.label}</div>
                  <div className="text-[10px] text-zinc-400 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <label className="text-xs font-bold text-blue-400">✏️ Other Option (Type Custom Learning Style):</label>
              <input
                type="text"
                placeholder="e.g. Flashcards, spaced repetition drills, audiobooks..."
                value={customLearningInput}
                onChange={(e) => {
                  setCustomLearningInput(e.target.value);
                  setAnswers({ ...answers, preferredLearningStyle: e.target.value });
                }}
                className="w-full mt-1.5 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* SLIDE 7: Companion Mascot (Tree, Cat, Dog, Owl, Dragon, etc.) + Custom Name */}
        {currentSlide === 7 && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="text-center">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-extrabold border border-emerald-500/20 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Question 7 of 10
              </span>
              <h2 className="text-xl sm:text-2xl font-black">Choose & name your living Companion</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Evolves with your streak! (Missed days trigger jail/withering mechanic; XP is earned only by completing tasks).
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {[
                { type: 'tree' as CompanionType, emoji: '🌳', label: 'Aura Tree', defaultName: 'AuraSprout' },
                { type: 'cat' as CompanionType, emoji: '🐱', label: 'Focus Cat', defaultName: 'Mochi' },
                { type: 'dog' as CompanionType, emoji: '🐶', label: 'Loyal Pup', defaultName: 'Buster' },
                { type: 'owl' as CompanionType, emoji: '🦉', label: 'Wisdom Owl', defaultName: 'Athena' },
                { type: 'dragon' as CompanionType, emoji: '🐲', label: 'Aura Dragon', defaultName: 'Draco' },
                { type: 'fox' as CompanionType, emoji: '🦊', label: 'Mindful Fox', defaultName: 'Rusty' },
                { type: 'penguin' as CompanionType, emoji: '🐧', label: 'Glacier Penguin', defaultName: 'Pippin' },
                { type: 'bunny' as CompanionType, emoji: '🐰', label: 'Fluffy Bunny', defaultName: 'Cotton' },
              ].map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => {
                    setAnswers({ ...answers, companionType: opt.type });
                    setCompanionNameInput(opt.defaultName);
                  }}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                    answers.companionType === opt.type
                      ? 'bg-emerald-500/20 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">{opt.emoji}</span>
                  <span className="text-xs font-bold text-white mt-1">{opt.label}</span>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <label className="text-xs font-bold text-zinc-300">Name your Companion:</label>
              <input
                type="text"
                value={companionNameInput}
                onChange={(e) => setCompanionNameInput(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* SLIDE 8: DISPLAY THEME MODE (Dark / Light) WITH LIVE PREVIEW */}
        {currentSlide === 8 && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="text-center">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-extrabold border border-emerald-500/20 mb-1.5">
                <Palette className="w-3.5 h-3.5" /> Question 8 of 10 (Display Environment)
              </span>
              <h2 className="text-xl sm:text-2xl font-black">Choose your Display Theme Mode</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Flowra auto-adjusts contrast, typography, and backgrounds for eye comfort.
              </p>
            </div>

            {/* Theme Selector Options (Dark & Light) */}
            <div className="grid grid-cols-2 gap-3 mt-1">
              {[
                {
                  id: 'dark' as ThemeMode,
                  label: '🌙 Dark Mode',
                  badge: 'Recommended',
                  desc: 'OLED Obsidian with Neon Glow',
                },
                {
                  id: 'light' as ThemeMode,
                  label: '☀️ Light Mode',
                  badge: 'Crisp Studio',
                  desc: 'High-Contrast White Canvas',
                },
              ].map((opt) => {
                const isSelected = answers.themeMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setAnswers({ ...answers, themeMode: opt.id })}
                    className={`p-3.5 rounded-2xl flex flex-col items-center text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-800 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-2 ring-emerald-400'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-sm text-white">{opt.label}</span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold mt-1.5">
                      {opt.badge}
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-1">{opt.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Live Theme Preview Card */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-zinc-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live App Interface Preview</span>
                </span>
                <span className="capitalize font-mono text-emerald-400">{answers.themeMode} Theme Active</span>
              </div>

              {/* The Live Rendered Mockup Container */}
              <div
                className={`p-4 rounded-2xl border transition-all duration-300 shadow-md ${
                  answers.themeMode === 'light'
                    ? 'bg-white text-zinc-900 border-zinc-200'
                    : 'bg-[#0A0E17] text-white border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.1)]'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/40">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌳</span>
                    <div>
                      <div className="text-xs font-black">AuraSprout (Level 1)</div>
                      <div className="text-[10px] opacity-70">Day 1 of 180 • Compound Mastery</div>
                    </div>
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    +50 Aura XP
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="text-[11px] font-bold">
                    <span>Task: </span>
                    <span className="opacity-80">45-min Deep Focus Sprint</span>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-emerald-500 text-black text-[10px] font-black shadow-sm">
                    Start Timer (45m)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 9: Negative Notifications & Bedtime Wind-Down */}
        {currentSlide === 9 && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="text-center">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-extrabold border border-rose-500/20 mb-1.5">
                <Bell className="w-3.5 h-3.5" /> Question 9 of 10
              </span>
              <h2 className="text-xl sm:text-2xl font-black">Negative Notifications & Bedtime</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Receive instant alerts when you waste time on non-productive apps and protect your sleep.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mt-1">
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-rose-400" />
                    <span>Non-Productive Screen-Time Alerts</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    "⚠️ You wasted 35m on non-productive apps! Switch to a Dopamine Drill now!"
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={answers.negativeNotificationsEnabled}
                  onChange={(e) => setAnswers({ ...answers, negativeNotificationsEnabled: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-xs font-bold text-white mb-1">Nightly Bedtime Mode (432Hz Soundscapes)</div>
                <div className="text-[10px] text-zinc-400 mb-2">
                  Plays harmonic sleep soundscapes to transition smoothly into deep restorative sleep.
                </div>
                <select
                  value={answers.bedtimeHour}
                  onChange={(e) => setAnswers({ ...answers, bedtimeHour: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={21}>9:00 PM Bedtime</option>
                  <option value={22}>10:00 PM Bedtime</option>
                  <option value={23}>11:00 PM Bedtime (Recommended)</option>
                  <option value={24}>12:00 AM Midnight</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 10: Confirmation & Launch */}
        {currentSlide === 10 && (
          <div className="flex flex-col gap-4 animate-fadeIn text-center">
            <div className="flex justify-center">
              <FlowraLogo size="md" showTagline={true} />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Your Blueprint is Assembled!</h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                Goal: <span className="text-emerald-400 font-bold">{customGoalInput || answers.primaryGoal}</span> • Duration:{' '}
                <span className="text-cyan-400 font-bold">{isAutoPlanSelected ? (answers.planDurationDays ?? 90) : customDurationInput} Days</span> • Companion:{' '}
                <span className="text-amber-400 font-bold">{companionNameInput}</span> • Theme:{' '}
                <span className="text-purple-400 font-bold capitalize">{answers.themeMode}</span>
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left text-xs text-zinc-300 space-y-1.5 max-w-md mx-auto w-full">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>✓ +50 Initial Aura Points Granted</span>
                <span>Level 1</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                <span>✓ 4 Aura Badges (Silver, Gold, Platinum, Diamond)</span>
                <span>Divided over {isAutoPlanSelected ? (answers.planDurationDays ?? 90) : customDurationInput} Days</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                <span>✓ 14-Hour Detailed Daily Timetable</span>
                <span>Minute-by-minute</span>
              </div>
            </div>

            {(() => {
              const isAuthenticated =
                !initialAuthData?.isGuest &&
                (!!initialAuthData?.email || !!initialAuthData?.name || !!auth.currentUser);
              const userEmail = initialAuthData?.email || auth.currentUser?.email || '';
              const userName = initialAuthData?.name || auth.currentUser?.displayName || '';

              if (isAuthenticated) {
                return (
                  <div className="flex flex-col gap-2.5 max-w-md mx-auto w-full mt-1">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 py-2.5 px-3.5 rounded-2xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">
                        Signed in as <strong className="text-white font-mono">{userEmail || userName || 'Authenticated Pioneer'}</strong>
                      </span>
                    </div>

                    <button
                      id="launch-flowra-journey-button"
                      onClick={() => finishOnboarding(false)}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm shadow-[0_0_20px_rgba(72,223,154,0.4)] flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer"
                    >
                      <Sparkles className="w-5 h-5 text-black" />
                      <span>Launch Flowra Journey</span>
                    </button>
                    <p className="text-[10px] text-zinc-400">
                      Cloud sync active. Your blueprint, companion, and daily progress are backed up to Firestore.
                    </p>
                  </div>
                );
              }

              return (
                <div className="flex flex-col gap-2.5 max-w-md mx-auto w-full mt-1">
                  <button
                    id="launch-flowra-guest-button"
                    onClick={() => finishOnboarding(true)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm shadow-[0_0_20px_rgba(72,223,154,0.4)] flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer"
                  >
                    <UserCheck className="w-5 h-5" />
                    <span>Launch Flowra Journey (Guest Mode)</span>
                  </button>
                  <p className="text-[10px] text-zinc-500">
                    Data saved in local cache memory. Sign in with Google or Email anytime to sync to Cloud.
                  </p>
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* Footer Navigation (Back / Next) */}
      <footer className="w-full max-w-xl flex items-center justify-between pt-2 border-t border-zinc-800/80">
        {currentSlide > 1 ? (
          <button
            onClick={prevSlide}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <div />
        )}

        {currentSlide < totalSlides && (
          <button
            onClick={nextSlide}
            className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-lg transition-all"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </footer>

      {/* Official Flowra App Logo Reveal Animation Screen After Answering 10 Questions */}
      {isRevealingLogo && (
        <div className="fixed inset-0 z-[100] bg-[#070A0F] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          {/* Glowing Radial Halo Backdrop */}
          <div className="absolute inset-0 bg-radial from-emerald-500/20 via-transparent to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center max-w-sm mx-auto space-y-6">
            {/* Pulsing Flowra Official Logo (Hero Size) */}
            <div className="transform scale-125 transition-transform duration-700 animate-pulse">
              <FlowraLogo size="hero" showTagline={true} isAnimated={true} />
            </div>

            <div className="space-y-2 pt-4">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Welcome to <span className="text-emerald-400">Flowra</span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Assembling your personalized 14-hour daily timetable, activating companion{' '}
                <span className="text-emerald-300 font-bold">{companionNameInput || 'AuraSprout'}</span>, and locking in your zero-doomscroll blueprint.
              </p>
            </div>

            {/* Glowing progress loading indicator */}
            <div className="w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden relative shadow-inner">
              <div className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 rounded-full animate-[pulse_1.2s_ease-in-out_infinite] w-full" />
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Same Screen. Different Aura.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
