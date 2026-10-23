import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FlowraLogo } from './FlowraLogo';
import {
  Sparkles,
  Smartphone,
  Calendar,
  Award,
  Users,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  Shield,
  Zap,
  Flame,
  Info,
  AlertTriangle,
  Copy,
  Check,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { loginWithEmail, registerWithEmail, fetchUserProfile, firebaseConfig } from '../lib/firebase';
import { UserProfile } from '../types';

interface OpeningSequenceModalProps {
  onContinueToPersonalization: (authData?: { isGuest: boolean; email?: string; name?: string }) => void;
  onExistingProfileLoaded?: (profile: UserProfile) => void;
  onGoogleSignIn: () => Promise<void>;
}

export const OpeningSequenceModal: React.FC<OpeningSequenceModalProps> = ({
  onContinueToPersonalization,
  onExistingProfileLoaded,
  onGoogleSignIn,
}) => {
  // Phase state: 'splash-5s' -> 'intro-10s' (App Overview) -> 'auth-screen' (Login & Sign Up Page)
  const [phase, setPhase] = useState<'splash-5s' | 'intro-10s' | 'auth-screen'>('splash-5s');
  const [splashTimer, setSplashTimer] = useState(5);
  const [introTimer, setIntroTimer] = useState(10);
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [fullNameInput, setFullNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [showDomainHelp, setShowDomainHelp] = useState(false);

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  const isUnauthorizedDomainError =
    authError.toLowerCase().includes('unauthorized') ||
    authError.toLowerCase().includes('domain') ||
    authError.includes('auth/unauthorized-domain');

  const handleCopyDomain = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentDomain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  // 5-second Splash Timer
  useEffect(() => {
    if (phase !== 'splash-5s') return;
    const interval = setInterval(() => {
      setSplashTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('intro-10s');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // 10-second Intro Timer for App Overview
  useEffect(() => {
    if (phase !== 'intro-10s') return;
    const interval = setInterval(() => {
      setIntroTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('auth-screen');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Handle Guest Offline Entry
  const handleGuestEntry = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#38BDF8'],
    });
    onContinueToPersonalization({ isGuest: true, name: 'Guest Pioneer' });
  };

  // Handle Google One-Click Auth
  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setAuthError('');
    try {
      await onGoogleSignIn();
      // If user profile is newly created or needs personalization:
      onContinueToPersonalization({ isGuest: false });
    } catch (e: any) {
      console.error('[OpeningSequenceModal Google Sign-In Error]:', e);
      const msg = e?.message || 'Google Sign-In failed. Please check your browser popups and try again.';
      setAuthError(msg);
      // NOTE: Absolutely NO silent fallback to guest mode on error!
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle Form Submission (Log In or Sign Up)
  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError('Please enter both your email address and password.');
      return;
    }

    if (authMode === 'signup') {
      if (!fullNameInput.trim()) {
        setAuthError('Please enter your full name.');
        return;
      }
      if (passwordInput.length < 6) {
        setAuthError('Password must be at least 6 characters long.');
        return;
      }
      if (passwordInput !== confirmPasswordInput) {
        setAuthError('Passwords do not match. Please verify.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        // Log in existing user with Firebase
        const userCred = await loginWithEmail(emailInput.trim(), passwordInput.trim());
        if (userCred && userCred.uid) {
          const existingProfile = await fetchUserProfile(userCred.uid);
          if (existingProfile && existingProfile.isSetupComplete && onExistingProfileLoaded) {
            confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
            onExistingProfileLoaded({
              ...existingProfile,
              uid: userCred.uid,
              email: userCred.email || emailInput.trim(),
              displayName:
                existingProfile.displayName ||
                userCred.displayName ||
                fullNameInput.trim() ||
                emailInput.split('@')[0],
              isGuest: false,
            });
            return;
          }
          const name = userCred.displayName || fullNameInput.trim() || emailInput.split('@')[0] || 'Flowra Pioneer';
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          onContinueToPersonalization({ isGuest: false, email: userCred.email || emailInput.trim(), name });
        }
      } else {
        // Sign up new user with Firebase
        const userCred = await registerWithEmail(emailInput.trim(), passwordInput.trim());
        if (userCred && userCred.uid) {
          const name = fullNameInput.trim() || emailInput.split('@')[0] || 'Flowra Pioneer';
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          onContinueToPersonalization({ isGuest: false, email: userCred.email || emailInput.trim(), name });
        }
      }
    } catch (err: any) {
      console.error('[OpeningSequenceModal Auth Error]:', err);
      const errCode = err?.code || '';
      if (
        errCode === 'auth/user-not-found' ||
        errCode === 'auth/wrong-password' ||
        errCode === 'auth/invalid-credential'
      ) {
        setAuthError('Incorrect email or password. If you do not have an account yet, click "Sign Up" above.');
      } else if (errCode === 'auth/email-already-in-use') {
        setAuthError('This email is already registered. Please switch to "Log In" above.');
      } else if (errCode === 'auth/weak-password') {
        setAuthError('Password is too weak. Please use at least 6 characters.');
      } else if (errCode === 'auth/invalid-email') {
        setAuthError('Please enter a valid email address.');
      } else if (errCode === 'auth/network-request-failed') {
        setAuthError('Network error. Please check your internet connection.');
      } else {
        setAuthError(err?.message || 'Authentication failed. Please verify your credentials and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070A0F] text-white p-4 overflow-y-auto select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/20 blur-[130px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-cyan-500/15 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {/* ================================================================= */}
        {/* PHASE 1: 5-SECOND OPENING ANIMATION */}
        {/* ================================================================= */}
        {phase === 'splash-5s' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative flex flex-col items-center justify-center max-w-sm w-full text-center px-4"
          >
            {/* Glowing ring */}
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-400/20 to-cyan-500/20 rounded-full blur-xl animate-pulse" />
              <FlowraLogo size="hero" showTagline={true} isAnimated={true} />
            </div>

            {/* App Name */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#7EF8C0] via-[#48DF9A] to-[#25A86B]"
            >
              FLOWRA
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg font-extrabold text-zinc-200 mt-2 tracking-wide font-sans"
            >
              “Same screen. Different aura.”
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-xs text-zinc-400 mt-1 max-w-xs"
            >
              Reclaiming high-yield focus, cognitive mastery & companion evolution.
            </motion.p>

            {/* 5-second Ring Progress Indicator */}
            <div className="mt-8 flex items-center justify-between w-full max-w-xs bg-zinc-900/80 border border-zinc-800/80 px-4 py-2.5 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold text-zinc-300">
                  Launching in {splashTimer}s...
                </span>
              </div>
              <button
                onClick={() => setPhase('intro-10s')}
                className="text-xs font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Skip to Overview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================================================================= */}
        {/* PHASE 2: APP OVERVIEW (10-Second Animated System Overview) */}
        {/* ================================================================= */}
        {phase === 'intro-10s' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative flex flex-col items-center max-w-lg w-full px-4 my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between w-full pb-3 border-b border-zinc-800/80 mb-4">
              <div className="flex items-center gap-2">
                <FlowraLogo size="sm" showTagline={false} />
                <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                  Flowra System Overview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400">{introTimer}s</span>
                <button
                  onClick={() => setPhase('auth-screen')}
                  className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl text-xs font-extrabold border border-emerald-500/40 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Skip to Log In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 10s Timer progress line */}
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-4 border border-zinc-800">
              <motion.div
                className="h-full bg-gradient-to-r from-[#7EF8C0] to-[#25A86B]"
                initial={{ width: '100%' }}
                animate={{ width: `${(introTimer / 10) * 100}%` }}
                transition={{ ease: 'linear', duration: 1 }}
              />
            </div>

            {/* 4 Animated Popping Detail Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {[
                {
                  icon: Smartphone,
                  title: '1. Dopamine Reclaim',
                  desc: 'Intercepts non-productive doomscrolling and converts phone unlocks into focused micro-drills.',
                  accent: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400',
                  delay: 0.1,
                },
                {
                  icon: Calendar,
                  title: '2. 14-Hour Day Architecture',
                  desc: 'Precision timetable generated for 0D–360D customized plans with active spaced retrieval.',
                  accent: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
                  delay: 0.2,
                },
                {
                  icon: Award,
                  title: '3. 4-Tier Aura Badges',
                  desc: 'Earn Silver (Q1), Gold (Q2), Platinum (Q3) & Diamond (Q4) Badges alongside companion growth.',
                  accent: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400',
                  delay: 0.3,
                },
                {
                  icon: Users,
                  title: '4. Accountability Clubs',
                  desc: 'Collaborate in peer study squads, exchange AI nudges, and wind down with 432Hz sleep soundscapes.',
                  accent: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
                  delay: 0.4,
                },
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: card.delay, duration: 0.4 }}
                    className={`p-3.5 rounded-2xl bg-gradient-to-br ${card.accent} border backdrop-blur-md flex flex-col gap-2`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-black/40 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-extrabold text-xs text-white">{card.title}</h3>
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">{card.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Proceed CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-5 w-full flex justify-center"
            >
              <button
                onClick={() => setPhase('auth-screen')}
                id="opening-continue-to-auth-button"
                className="w-full max-w-sm py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm shadow-[0_0_20px_rgba(72,223,154,0.4)] flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <span>Continue to Log In / Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* ================================================================= */}
        {/* PHASE 3: DEDICATED LOG IN & SIGN UP PAGE (Before Personalization) */}
        {/* ================================================================= */}
        {phase === 'auth-screen' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative flex flex-col items-center max-w-md w-full p-5 sm:p-6 rounded-3xl bg-[#0D111A] border-2 border-emerald-500/35 shadow-2xl my-auto"
          >
            {/* Header: Logo, Mode description & Back button */}
            <div className="w-full flex items-center justify-between pb-2">
              <button
                onClick={() => setPhase('intro-10s')}
                className="text-xs text-zinc-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>App Overview</span>
              </button>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-extrabold text-emerald-300">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>+50 Starting Aura</span>
              </div>
            </div>

            {/* Branding */}
            <div className="flex flex-col items-center text-center mt-1 mb-4">
              <FlowraLogo size="sm" showTagline={false} />
              <h2 className="text-xl font-black text-white mt-2 tracking-tight">
                {authMode === 'login' ? 'Log In to Flowra' : 'Create Your Flowra Account'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {authMode === 'login'
                  ? 'Access your cloud roadmap, companion evolution & daily streaks.'
                  : 'Join Flowra to generate your personalized AI study roadmap.'}
              </p>
            </div>

            {/* Segmented Tab Switcher: [ Log In ] | [ Sign Up ] */}
            <div className="grid grid-cols-2 p-1 bg-[#070A0F] border border-zinc-800 rounded-2xl w-full mb-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError('');
                }}
                className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>

            {/* Google One-Click Sign In (Fast & Direct) */}
            <button
              type="button"
              disabled={isGoogleLoading || isSubmitting}
              onClick={handleGoogleAuth}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 disabled:opacity-60 text-zinc-900 font-extrabold text-xs flex items-center justify-center gap-2.5 shadow-md transition-all mb-2 cursor-pointer"
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{isGoogleLoading ? 'Connecting Google Account...' : 'Continue with Google'}</span>
            </button>

            {/* Prominent Error Banner */}
            {authError && (
              <div className="w-full mb-3 p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs leading-snug flex flex-col gap-2.5 text-left animate-fadeIn">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold text-rose-300">
                      {isUnauthorizedDomainError ? 'Firebase Domain Setup Required' : 'Authentication Notice'}:{' '}
                    </span>
                    <span className="text-zinc-200">{authError}</span>
                  </div>
                </div>

                {/* If domain needs authorization in Firebase Console */}
                {isUnauthorizedDomainError && (
                  <div className="mt-1 p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 flex flex-col gap-2">
                    <div className="text-[11px] text-zinc-300">
                      To enable Google Sign-In on this preview URL, add this domain to your Firebase Console:
                    </div>

                    <div className="flex items-center justify-between gap-2 p-1.5 px-2 bg-black/60 border border-zinc-800 rounded-lg">
                      <code className="text-[11px] font-mono text-emerald-400 select-all truncate">
                        {currentDomain || 'ais-dev-...run.app'}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyDomain}
                        className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                      >
                        {copiedDomain ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Domain</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quick Steps Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowDomainHelp(!showDomainHelp)}
                      className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer self-start transition-colors"
                    >
                      <HelpCircle className="w-3 h-3 text-zinc-400" />
                      <span>{showDomainHelp ? 'Hide instructions' : 'Where to paste in Firebase Console?'}</span>
                    </button>

                    {showDomainHelp && (
                      <div className="text-[10px] text-zinc-300 bg-zinc-950/95 p-3 rounded-xl border border-zinc-700/80 space-y-1.5 leading-relaxed">
                        <p className="font-semibold text-emerald-400">Why does this still show after adding?</p>
                        <ul className="list-disc pl-4 space-y-1 text-zinc-400">
                          <li>
                            <strong>Verify Target Project:</strong> Make sure you are in your active Firebase project <code className="text-emerald-300 font-mono">{firebaseConfig.projectId}</code>.
                          </li>
                          <li>
                            <strong>Format check:</strong> Ensure the domain has NO <code className="text-rose-400">https://</code> and NO trailing slash <code className="text-rose-400">/</code> (just <code className="text-emerald-300 font-mono">{currentDomain}</code>).
                          </li>
                          <li>
                            <strong>Edge Propagation:</strong> Google OAuth servers take <strong>3 to 5 minutes</strong> to distribute newly whitelisted domains worldwide. Try a hard refresh (<kbd className="px-1 py-0.5 rounded bg-zinc-800 text-[9px]">Ctrl+Shift+R</kbd> or <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-[9px]">Cmd+Shift+R</kbd>).
                          </li>
                          <li>
                            <strong>Google Cloud Credentials:</strong> If needed, open <a href={`https://console.cloud.google.com/apis/credentials?project=${firebaseConfig.projectId}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Google Cloud Console &gt; Credentials</a> and add <code className="text-emerald-300 font-mono">https://{currentDomain}</code> to <em>Authorized JavaScript origins</em> on the OAuth 2.0 Web Client.
                          </li>
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/80">
                      <span className="text-[10px] text-zinc-400">Or proceed instantly with:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signup');
                          setAuthError('');
                        }}
                        className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer"
                      >
                        Email Sign Up
                      </button>
                      <span className="text-zinc-600">|</span>
                      <button
                        type="button"
                        onClick={handleGuestEntry}
                        className="text-[10px] font-bold text-cyan-400 hover:underline cursor-pointer"
                      >
                        Guest Offline Mode
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 w-full mb-3">
              <div className="h-[1px] bg-zinc-800 flex-1" />
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                Or with Email
              </span>
              <div className="h-[1px] bg-zinc-800 flex-1" />
            </div>

            {/* Email & Password Authentication Form */}
            <form onSubmit={handleEmailAuthSubmit} className="w-full flex flex-col gap-2.5">
              {/* Full Name field (Only in Sign Up Mode) */}
              {authMode === 'signup' && (
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name (e.g. Alex Rivera)"
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#070A0F] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              )}

              {/* Email Address */}
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#070A0F] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={authMode === 'signup' ? 'Create a strong password (6+ chars)' : 'Enter password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#070A0F] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Confirm Password (Only in Sign Up Mode) */}
              {authMode === 'signup' && (
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Confirm password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#070A0F] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              )}

              {/* Error Display */}
              {authError && (
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] leading-tight text-center font-medium">
                  {authError}
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                id="auth-submit-button"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : authMode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Log In to Flowra</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account & Personalize Plan</span>
                  </>
                )}
              </button>
            </form>

            {/* Mode Switcher Footer */}
            <div className="mt-3 text-center">
              {authMode === 'login' ? (
                <p className="text-xs text-zinc-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthError('');
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer ml-1"
                  >
                    Sign Up Free
                  </button>
                </p>
              ) : (
                <p className="text-xs text-zinc-400">
                  Already have a Flowra account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError('');
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer ml-1"
                  >
                    Log In
                  </button>
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 w-full my-3">
              <div className="h-[1px] bg-zinc-800 flex-1" />
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                Explore Without Account
              </span>
              <div className="h-[1px] bg-zinc-800 flex-1" />
            </div>

            {/* Continue as Guest (Offline Cache Mode) */}
            <button
              type="button"
              onClick={handleGuestEntry}
              id="auth-continue-guest-button"
              className="w-full py-2.5 px-4 rounded-xl bg-[#141822] hover:bg-[#182030] border border-zinc-700 text-zinc-200 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Continue as Guest (Use Offline Cache)</span>
            </button>

            <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-2 text-center">
              <Info className="w-3 h-3 text-zinc-400 shrink-0" />
              <span>Guest data saves to local memory and can sync to cloud anytime in Profile.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
