import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ArrowRight,
  Target,
  Heart,
  Bot,
  Compass,
  CheckCircle2,
  Lock,
  Mail,
  Zap,
  TrendingUp,
  Clock,
  Flame,
} from 'lucide-react';
import { GoalType, CompanionType, UserProfile } from '../types';
import {
  loginWithEmail,
  registerWithEmail,
  signInWithGoogle,
  saveUserProfile,
} from '../lib/firebase';
import { generateRoadmapAPI } from '../services/api';

interface OnboardingModalProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Authenticated user state
  const [userUid, setUserUid] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('Alex');

  // Step 3: Goal
  const [selectedGoal, setSelectedGoal] = useState<GoalType>('Placement Prep');

  // Step 4: Companion
  const [companionType, setCompanionType] = useState<CompanionType>('tree');
  const [companionName, setCompanionName] = useState('Zenith Tree');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [dailyHours, setDailyHours] = useState(2);

  // Step 5: Generating
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [generationLog, setGenerationLog] = useState('Initializing Gemini 2.5 Engine...');

  const goals: { type: GoalType; icon: string; desc: string; color: string }[] = [
    {
      type: 'Placement Prep',
      icon: '💼',
      desc: 'DSA patterns, System Design, Aptitude & Mock Interviews',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      type: 'Learn AI/ML',
      icon: '🤖',
      desc: 'Python, PyTorch, Transformers, LLMs & Autonomous Agents',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      type: 'Improve English',
      icon: '🗣️',
      desc: 'Spoken Fluency, Executive Vocabulary, Accent & Confidence',
      color: 'from-amber-500 to-orange-500',
    },
    {
      type: 'Read More Books',
      icon: '📚',
      desc: 'Read 24 deep non-fiction books with active recall & notes',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      type: 'Improve Fitness',
      icon: '⚡',
      desc: 'Calisthenics, Hypertrophy, Clean Nutrition & Peak Energy',
      color: 'from-pink-500 to-rose-500',
    },
  ];

  const handleDemoSignIn = () => {
    const demoUid = `demo-${Date.now()}`;
    setUserUid(demoUid);
    setUserEmail('demo.user@flowra.app');
    setUserName('Gen-Z Explorer');
    setStep(3);
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const u = await signInWithGoogle();
      setUserUid(u.uid);
      setUserEmail(u.email || '');
      setUserName(u.displayName || 'Pioneer');
      setStep(3);
    } catch (err: any) {
      console.warn('Google sign-in error, using guest mode:', err);
      handleDemoSignIn();
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please fill in email and password');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (authMode === 'signup') {
        const u = await registerWithEmail(email, password);
        setUserUid(u.uid);
        setUserEmail(u.email || email);
        setUserName(email.split('@')[0]);
      } else {
        const u = await loginWithEmail(email, password);
        setUserUid(u.uid);
        setUserEmail(u.email || email);
        setUserName(email.split('@')[0]);
      }
      setStep(3);
    } catch (err: any) {
      console.warn('Email Auth error, allowing demo bypass:', err);
      // Fallback for seamless preview
      setUserUid(`user-${Date.now()}`);
      setUserEmail(email);
      setUserName(email.split('@')[0]);
      setStep(3);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFinishOnboarding = async () => {
    setStep(5);
    setIsGeneratingRoadmap(true);

    try {
      setGenerationLog('Crafting your 180-Day Personalized Roadmap...');
      await new Promise((r) => setTimeout(r, 600));

      setGenerationLog('Building daily 24-hour timetable slots...');
      const roadmapData = await generateRoadmapAPI({
        goal: selectedGoal,
        companionName: companionName.trim() || (companionType === 'cat' ? 'Luna' : companionType === 'dog' ? 'Leo' : 'Zenith Tree'),
        companionType,
        dailyHoursAvailable: dailyHours,
        currentSkillLevel: skillLevel,
      });

      setGenerationLog('Planting your companion seed & syncing Firestore...');

      const newProfile: UserProfile = {
        uid: userUid || `fl-${Date.now()}`,
        email: userEmail || 'user@flowra.app',
        displayName: userName || 'Growth Pioneer',
        goal: selectedGoal,
        companion: {
          type: companionType,
          name: companionName.trim() || (companionType === 'cat' ? 'Luna' : companionType === 'dog' ? 'Leo' : 'Zenith Tree'),
          xp: 20,
          level: 1,
          foodBowlsAvailable: companionType === 'tree' ? 0 : 2,
          lastWateredDate: new Date().toISOString().split('T')[0],
          lastFedDate: new Date().toISOString().split('T')[0],
          mood: 'radiant',
          timesWatered: companionType === 'tree' ? 1 : 0,
          totalLeaves: companionType === 'tree' ? 4 : 0,
          tapCountToday: 0,
        },
        currentDay: 1,
        streak: 1,
        meaningfulScore: 88,
        totalProductiveHours: 1.5,
        totalSavedScrollHours: 2.0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        isSetupComplete: true,
        roadmap: roadmapData,
        completedTasksHistory: [],
      };

      await saveUserProfile(newProfile);

      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
      });

      setTimeout(() => {
        onComplete(newProfile);
      }, 900);
    } catch (err) {
      console.error('Onboarding build error:', err);
      // Fallback profile
      const fallbackProfile: UserProfile = {
        uid: userUid || `fl-${Date.now()}`,
        email: userEmail || 'user@flowra.app',
        displayName: userName || 'Growth Pioneer',
        goal: selectedGoal,
        companion: {
          type: companionType,
          name: companionName.trim() || 'Companion',
          xp: 25,
          level: 1,
          foodBowlsAvailable: 2,
          lastWateredDate: new Date().toISOString().split('T')[0],
          mood: 'radiant',
          timesWatered: 1,
          totalLeaves: 4,
          tapCountToday: 0,
        },
        currentDay: 1,
        streak: 1,
        meaningfulScore: 85,
        totalProductiveHours: 1.5,
        totalSavedScrollHours: 2.0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        isSetupComplete: true,
      };
      onComplete(fallbackProfile);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#141418] border border-purple-500/25 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {/* STEP 1: WELCOME & GLOBAL IMPACT RECORD */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Transform Your Digital Life</span>
              </div>

              <div>
                <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                  Stop Scrolling. <br />
                  <span className="text-gradient">Start Compounding.</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  "The hours you spend passively consuming could build your dream career, fluent speaking, or peak physical form in 180 days."
                </p>
              </div>

              {/* Animated Global Impact Record */}
              <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-zinc-800 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    Global Impact Record
                  </span>
                  <span className="text-[10px] text-zinc-500 italic">*Illustrative metrics</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40">
                    <div className="text-rose-400 font-extrabold text-lg tracking-tight">1.8 Billion</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">Hours lost to passive doomscrolling daily</div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                    <div className="text-emerald-400 font-extrabold text-lg tracking-tight">180 Days</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">Needed to transform into top 1% mastery</div>
                  </div>
                </div>

                <div className="text-[11px] text-purple-300/90 font-medium bg-purple-950/30 p-2.5 rounded-xl border border-purple-800/30 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Just 45 min/day redirected = 135 hours of focused deep skill!</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setStep(2)}
                id="onboarding-get-started-button"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 hover:from-purple-500 hover:to-cyan-300 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer transition-all"
              >
                <span>Begin Your 180-Day Journey</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* STEP 2: AUTHENTICATION */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {authMode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Sync your 180-day roadmap and evolving companion in Firebase.
                </p>
              </div>

              {authError && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-700/50 text-rose-300 text-xs">
                  {authError}
                </div>
              )}

              {/* Instant 1-Click Demo Testing Button for zero friction */}
              <button
                onClick={handleDemoSignIn}
                id="onboarding-demo-login-button"
                className="w-full py-3 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700/90 border border-purple-500/30 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Instant Demo Sign-In (1-Click Test)</span>
              </button>

              <div className="flex items-center gap-2 text-zinc-600 text-xs">
                <div className="flex-1 h-[1px] bg-zinc-800" />
                <span>or continue with</span>
                <div className="flex-1 h-[1px] bg-zinc-800" />
              </div>

              {/* Google Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                id="onboarding-google-signin-button"
                className="w-full py-2.5 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 font-semibold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.4 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.41l4.04-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.6 1.24 6.59l4.04 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-2.5 pt-1">
                <div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-bold text-xs shadow-lg shadow-purple-600/20 cursor-pointer transition-all"
                >
                  {authLoading
                    ? 'Processing...'
                    : authMode === 'signup'
                    ? 'Create Account & Continue'
                    : 'Sign In & Continue'}
                </button>
              </form>

              <div className="text-center pt-1">
                <button
                  onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                  className="text-[11px] text-zinc-400 hover:text-purple-300 underline"
                >
                  {authMode === 'signup'
                    ? 'Already have an account? Sign In'
                    : "Don't have an account? Sign Up"}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PICK ONE PRIMARY GOAL */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 mb-1">
                  <Target className="w-3.5 h-3.5" />
                  <span>STEP 1 OF 2: CORE FOCUS</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Choose ONE Primary Goal
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Over the next 180 days, you will direct your reclaimed screen time toward this single priority.
                </p>
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {goals.map((g) => {
                  const isSelected = selectedGoal === g.type;
                  return (
                    <div
                      key={g.type}
                      onClick={() => setSelectedGoal(g.type)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-400 shadow-lg shadow-purple-500/20 ring-1 ring-purple-400'
                          : 'bg-[#0A0A0A] border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{g.icon}</div>
                        <div>
                          <div className="font-bold text-white text-xs">{g.type}</div>
                          <div className="text-[11px] text-zinc-400 line-clamp-1">{g.desc}</div>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setStep(4)}
                  id="onboarding-confirm-goal-button"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 hover:from-purple-500 hover:to-cyan-300 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 cursor-pointer transition-all"
                >
                  <span>Lock In {selectedGoal}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: PICK COMPANION & NAME */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-400 mb-1">
                  <Heart className="w-3.5 h-3.5" />
                  <span>STEP 2 OF 2: COMPANION SEED</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Select Your Evolving Companion
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Pick a real pet (Cat or Dog) or a Sacred Tree. It will grow with your daily logins and task completions!
                </p>
              </div>

              {/* Mascot Selector */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: 'tree' as CompanionType, icon: '🌳', title: 'Sacred Tree', sub: 'Waters daily, sprouts leaves' },
                  { type: 'cat' as CompanionType, icon: '🐱', title: 'Calm Cat', sub: 'Eats food bowls, purrs' },
                  { type: 'dog' as CompanionType, icon: '🐶', title: 'Loyal Dog', sub: 'Eats kibble, wags tail' },
                ].map((item) => {
                  const isSel = companionType === item.type;
                  return (
                    <div
                      key={item.type}
                      onClick={() => {
                        setCompanionType(item.type);
                        if (item.type === 'cat' && companionName === 'Zenith Tree') setCompanionName('Luna');
                        if (item.type === 'dog' && companionName === 'Zenith Tree') setCompanionName('Leo');
                        if (item.type === 'tree' && (companionName === 'Luna' || companionName === 'Leo')) setCompanionName('Zenith Tree');
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSel
                          ? 'bg-purple-950/50 border-purple-400 ring-1 ring-purple-400 shadow-md'
                          : 'bg-[#0A0A0A] border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-3xl mb-1">{item.icon}</span>
                      <span className="font-bold text-white text-xs">{item.title}</span>
                      <span className="text-[9px] text-zinc-400 mt-0.5">{item.sub}</span>
                    </div>
                  );
                })}
              </div>

              {/* Name Input */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-zinc-300">
                  Name Your {companionType === 'tree' ? 'Sacred Tree' : companionType === 'cat' ? 'Cat' : 'Dog'}:
                </label>
                <input
                  type="text"
                  value={companionName}
                  onChange={(e) => setCompanionName(e.target.value)}
                  placeholder="e.g., Luna, Simba, Aura Tree"
                  className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Daily Target Hours */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300 font-semibold">Target Screen Time to Redirect Daily:</span>
                  <span className="text-cyan-400 font-bold">{dailyHours} Hours/Day</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={0.5}
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-3 rounded-2xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleFinishOnboarding}
                  id="onboarding-generate-roadmap-button"
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 hover:from-purple-500 hover:to-cyan-300 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 cursor-pointer transition-all"
                >
                  <Bot className="w-4 h-4 text-cyan-300 animate-pulse" />
                  <span>Generate 180-Day Plan with AI</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: AI GENERATING ROADMAP LOADING */}
          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-4"
            >
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-cyan-400 animate-spin" />
                <Bot className="w-8 h-8 text-purple-300 animate-pulse" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Synthesizing Your 180-Day Journey</h3>
                <p className="text-xs text-purple-300/80 mt-1 font-medium">{generationLog}</p>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/30 max-w-xs mx-auto text-[11px] text-zinc-400">
                ✨ Generating 26 weekly milestones, 24-hour daily timetable, and today's main task for{' '}
                <span className="text-white font-bold">{selectedGoal}</span>...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
