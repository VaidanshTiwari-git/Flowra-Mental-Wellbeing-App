import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, fetchUserProfile, saveUserProfile, syncGuestDataToCloud, signInWithGoogle, logoutUser } from './lib/firebase';
import {
  UserProfile,
  ThemeMode,
  CalendarEvent,
  HabitItem,
  LessonPackage,
  PersonalizationAnswers,
} from './types';
import { COLOR_PALETTES } from './lib/palettes';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { JourneyTab } from './components/JourneyTab';
import { CommunityTab } from './components/CommunityTab';
import { ProfileTab } from './components/ProfileTab';
import { OpeningSequenceModal } from './components/OpeningSequenceModal';
import { OnboardingFlow } from './components/OnboardingFlow';
import { StreakCalendarModal } from './components/StreakCalendarModal';
import { BedtimeModeModal } from './components/BedtimeModeModal';
import { DeepLessonModal } from './components/DeepLessonModal';
import { BookSectionModal } from './components/BookSectionModal';
import { TaskSectionModal } from './components/TaskSectionModal';
import { GrowthBeforeAfterModal } from './components/GrowthBeforeAfterModal';
import { ClubsCommunityModal } from './components/ClubsCommunityModal';
import { AICoachChatModal } from './components/AICoachChatModal';
import { SettingsModal } from './components/SettingsModal';
import { InterventionModal } from './components/InterventionModal';
import { CreatorProfileModal } from './components/CreatorProfileModal';
import { FlowraLogo } from './components/FlowraLogo';
import { generateRoadmapAPI } from './services/api';
import confetti from 'canvas-confetti';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [hasCompletedOpeningSequence, setHasCompletedOpeningSequence] = useState(false);
  const [initialAuthData, setInitialAuthData] = useState<{ isGuest: boolean; email?: string; name?: string } | undefined>(undefined);

  // Themes & Palettes State
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>('emerald-bloom');
  const [negativeNotificationsEnabled, setNegativeNotificationsEnabled] = useState(true);

  // Modals state
  const [isStreakCalendarOpen, setIsStreakCalendarOpen] = useState(false);
  const [isBedtimeOpen, setIsBedtimeOpen] = useState(false);
  const [isDeepLessonOpen, setIsDeepLessonOpen] = useState(false);
  const [isBookSectionOpen, setIsBookSectionOpen] = useState(false);
  const [isTaskSectionOpen, setIsTaskSectionOpen] = useState(false);
  const [isGrowthModalOpen, setIsGrowthModalOpen] = useState(false);
  const [isClubsModalOpen, setIsClubsModalOpen] = useState(false);
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInterventionOpen, setIsInterventionOpen] = useState(false);
  const [isCreatorProfileOpen, setIsCreatorProfileOpen] = useState(false);

  const [interventionTriggerApp, setInterventionTriggerApp] = useState('Instagram Reels');
  const [interventionTriggerMins, setInterventionTriggerMins] = useState(45);

  // Calendar Events State
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    {
      id: 'ev-1',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      title: '📖 Read 6000-Word Deep Blueprint Module 1',
      type: 'lesson',
      isCompleted: false,
    },
    {
      id: 'ev-2',
      date: new Date().toISOString().split('T')[0],
      time: '18:00',
      title: '⏰ Focus Sprint & Habit Check-in',
      type: 'reminder',
      isCompleted: false,
    },
  ]);

  // Habit Stack State
  const [habits, setHabits] = useState<HabitItem[]>([
    {
      id: 'h-1',
      title: 'Hydrate 2 Liters of Water',
      category: 'health',
      frequency: 'daily',
      isCompletedToday: false,
      streak: 5,
      auraReward: 10,
      icon: '💧',
    },
    {
      id: 'h-2',
      title: '10 Pages Daily Reading',
      category: 'learning',
      frequency: 'daily',
      isCompletedToday: true,
      streak: 8,
      auraReward: 10,
      icon: '📖',
    },
    {
      id: 'h-3',
      title: '15-Minute Morning Walk / Sun',
      category: 'lifestyle',
      frequency: 'daily',
      isCompletedToday: false,
      streak: 3,
      auraReward: 10,
      icon: '☀️',
    },
    {
      id: 'h-4',
      title: 'Zero Scroll Morning Routine',
      category: 'mindfulness',
      frequency: 'daily',
      isCompletedToday: true,
      streak: 12,
      auraReward: 15,
      icon: '🧘',
    },
  ]);

  // Default deep lesson
  const [currentLesson, setCurrentLesson] = useState<LessonPackage>({
    id: 'lesson-main',
    goal: 'Excellence & Mastery',
    topic: 'Foundational Systems & Cognitive Compounding',
    title: 'High-Yield Blueprint: 6000-Word Architectural Mastery',
    youtubeVideoId: 'f2O6mQkFiiw', // High quality video lecture
    youtubeUrl: 'https://www.youtube.com/watch?v=f2O6mQkFiiw',
    durationStr: '22 mins',
    modules: [
      {
        id: 'mod-1',
        moduleNumber: 1,
        title: 'Module 1: Cognitive Invariants & Dopamine Baseline',
        subtitle: 'Why passive feeds degrade neural neuroplasticity and how to rewire your dopamine loop',
        contentMarkdown: `### 1. The Dopamine Trap in the Digital Age\n\nWhen you endlessly scroll short-form algorithmic reels, your brain experiences rapid micro-spikes of dopamine without physical or mental exertion. Over time, this down-regulates D2 dopamine receptors, leading to chronic restlessness, low attention span, and procrastination.\n\n### 2. The Flowra Protocol: Same Screen. Different Aura.\n\nThe Flowra protocol does not ask you to throw away your device. Instead, it reclaims your existing screen time by channeling your device into structured high-intensity deep learning modules and gamified companion evolution. Every 45 minutes of deliberate practice produces tangible neural encoding.`,
        wordCount: 1850,
        readingTimeMinutes: 7,
        keyTakeaways: [
          'Dopamine down-regulation causes chronic procrastination and brain fog.',
          'Active recall and problem solving rewire receptor sensitivity in 14 days.',
          'Micro-drills substitute mindless doomscrolling with high-leverage skill building.',
        ],
        isCompleted: false,
      },
      {
        id: 'mod-2',
        moduleNumber: 2,
        title: 'Module 2: The Spaced Retrieval Engine',
        subtitle: 'How active recall beats passive 10-hour textbook reading by over 300%',
        contentMarkdown: `### 1. The Illusion of Competence\n\nWhen you re-read highlighted notes or watch tutorials passively, your brain experiences familiarity, mistaking recognition for true mastery. In exams or technical interviews, you cannot retrieve the information because no retrieval pathway was strengthened.\n\n### 2. Forcing Synaptic Reconsolidation\n\nBy taking the 10-question assessment at the end of each Flowra module without looking at the text, your brain is forced to search its neural pathways, permanently consolidating the memory into long-term storage.`,
        wordCount: 2100,
        readingTimeMinutes: 8,
        keyTakeaways: [
          'Familiarity is not mastery: always test yourself with active recall.',
          'Retrieval practice directly stimulates synaptic reconsolidation.',
          'Mistakes made during quizzes produce the strongest learning signals.',
        ],
        isCompleted: false,
      },
      {
        id: 'mod-3',
        moduleNumber: 3,
        title: 'Module 3: Daily Implementation Intentions & Habit Loops',
        subtitle: 'Structuring your 24-hour timetable to eliminate willpower fatigue',
        contentMarkdown: `### 1. Removing Daily Friction\n\nWillpower is a depletable biological resource. If you have to decide what to study every afternoon, decision fatigue will almost always default to effortless social feeds. By setting exact time blocks on your Flowra calendar, execution becomes automatic.\n\n### 2. Protecting the Morning Window\n\nNever check notification badges or passive feeds during the first 60 minutes of waking. Use that prime cognitive window for your core sprint to protect your streak and feed your companion!`,
        wordCount: 2200,
        readingTimeMinutes: 9,
        keyTakeaways: [
          'Implementation intentions (time & place triggers) remove willpower friction.',
          'Morning cognitive energy is your rarest asset—guard it fiercely.',
          'Streak momentum creates psychological accountability that protects consistency.',
        ],
        isCompleted: false,
      },
    ],
    quiz: [
      {
        id: 'q1',
        questionNumber: 1,
        question: 'What is the physiological cause of brain fog resulting from continuous reel scrolling?',
        options: [
          'Down-regulation of D2 dopamine receptors from non-stop effortless micro-rewards',
          'Excessive intake of dietary carbohydrates',
          'Physical muscle fatigue in the index finger',
          'Permanent loss of brain cells',
        ],
        correctOptionIndex: 0,
        explanation: 'Rapid effortless stimulation floods synapses, causing dopamine receptors to down-regulate and reducing baseline focus.',
      },
      {
        id: 'q2',
        questionNumber: 2,
        question: 'What is the "Illusion of Competence"?',
        options: [
          'Mistaking visual familiarity during passive reading for actual recall ability',
          'Believing you are too smart to study',
          'Thinking everyone else is studying harder than you',
          'Forgetting what day of the week it is',
        ],
        correctOptionIndex: 0,
        explanation: 'When content feels familiar while looking at it, people falsely assume they can reproduce it on demand without cues.',
      },
      {
        id: 'q3',
        questionNumber: 3,
        question: 'Why does active recall generate over 300% greater retention than re-reading?',
        options: [
          'The effort of mental retrieval stimulates synaptic reconsolidation',
          'It takes less time to do',
          'It changes your eye movements',
          'It generates more body heat',
        ],
        correctOptionIndex: 0,
        explanation: 'Retrieving an answer from memory strengthens the neural pathway far more than passively re-reading the text.',
      },
      {
        id: 'q4',
        questionNumber: 4,
        question: 'What is the Flowra core motto?',
        options: [
          '"Same screen. Different aura."',
          '"Scroll until you drop"',
          '"Study 24 hours a day without sleep"',
          '"Only hard work counts"',
        ],
        correctOptionIndex: 0,
        explanation: 'Flowra transforms your existing screen into a vehicle for compounding mastery and elevated aura.',
      },
      {
        id: 'q5',
        questionNumber: 5,
        question: 'How do Implementation Intentions help maintain study consistency?',
        options: [
          'By pre-specifying the exact time and place for an action, eliminating decision fatigue',
          'By forcing you to study with other people',
          'By turning off your device completely',
          'By giving you immediate cash rewards',
        ],
        correctOptionIndex: 0,
        explanation: 'Pre-deciding when and where you will execute a task removes the need for willpower in the moment.',
      },
      {
        id: 'q6',
        questionNumber: 6,
        question: 'How are Aura points earned in Flowra?',
        options: [
          'By completing learning modules, daily tasks, habits, and MCQs',
          'By repeatedly tapping the screen mascot',
          'By spending money on in-app purchases',
          'By sharing links on social media',
        ],
        correctOptionIndex: 0,
        explanation: 'Aura points are earned purely through genuine task completion, reading deep modules, and testing knowledge.',
      },
      {
        id: 'q7',
        questionNumber: 7,
        question: 'What happens to your mascot if your daily streak breaks?',
        options: [
          'The pet goes to jail or the tree withers and loses leaves',
          'Your account is permanently deleted',
          'Nothing happens',
          'You are banned from the app',
        ],
        correctOptionIndex: 0,
        explanation: 'Missing days triggers the jail or withering mechanic, motivating you to revive your streak with daily consistency.',
      },
      {
        id: 'q8',
        questionNumber: 8,
        question: 'What is the benefit of the Bedtime Mode 432Hz soundscapes?',
        options: [
          'It promotes delta/theta brainwave synchrony to ease wind-down and restorative sleep',
          'It plays loud alarms through the night',
          'It downloads new games in the background',
          'It increases device brightness',
        ],
        correctOptionIndex: 0,
        explanation: 'Harmonic 432Hz ambient soundscapes relax the nervous system and aid transition into deep restorative sleep.',
      },
      {
        id: 'q9',
        questionNumber: 9,
        question: 'What is the purpose of the Negative Notification alert in Flowra?',
        options: [
          'To alert you when time is wasted on non-productive feeds and offer a Dopamine Switch drill',
          'To insult the user',
          'To advertise external products',
          'To turn off your Wi-Fi',
        ],
        correctOptionIndex: 0,
        explanation: 'It intercepts wasteful scrolling moments and offers an instant high-yield micro-challenge alternative.',
      },
      {
        id: 'q10',
        questionNumber: 10,
        question: 'What happens when you complete your full customized plan duration?',
        options: [
          'You unlock the legendary "Your aura becomes ∞" ascension screen and certificate',
          'The app shuts down forever',
          'All your progress is reset to 0',
          'You have to pay a subscription fee',
        ],
        correctOptionIndex: 0,
        explanation: 'Completing your roadmap achieves ultimate mastery, elevating your Aura to Infinity (∞)!',
      },
    ],
  });

  useEffect(() => {
    // Check Firebase auth or Local Cache
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const profile = await fetchUserProfile(firebaseUser.uid);
          if (profile && profile.isSetupComplete) {
            const authenticatedProfile: UserProfile = {
              ...profile,
              uid: firebaseUser.uid,
              email: firebaseUser.email || profile.email || '',
              displayName: profile.displayName || firebaseUser.displayName || 'Pioneer',
              isGuest: false,
            };
            setUser(authenticatedProfile);
            if (authenticatedProfile.selectedPalette) {
              setSelectedPaletteId(authenticatedProfile.selectedPalette);
            }
            if (authenticatedProfile.themeMode) {
              setThemeMode(authenticatedProfile.themeMode);
            }
            setHasCompletedOpeningSequence(true);
            localStorage.setItem('flowra_active_profile', JSON.stringify(authenticatedProfile));
          } else {
            // Signed into Firebase but needs roadmap setup
            setInitialAuthData({
              isGuest: false,
              email: firebaseUser.email || undefined,
              name: firebaseUser.displayName || undefined,
            });
            setHasCompletedOpeningSequence(true);
          }
        } else {
          // No user signed in to Firebase
          const cached = localStorage.getItem('flowra_active_profile');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed && parsed.isSetupComplete) {
                setUser(parsed);
                if (parsed.selectedPalette) setSelectedPaletteId(parsed.selectedPalette);
                if (parsed.themeMode) setThemeMode(parsed.themeMode);
                setHasCompletedOpeningSequence(true);
              }
            } catch {
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error('[Flowra Auth Error]:', err);
      } finally {
        setLoadingAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateUser = (updated: UserProfile) => {
    setUser(updated);
    saveUserProfile(updated);
    localStorage.setItem('flowra_active_profile', JSON.stringify(updated));
  };

  const handleOnboardingComplete = async (answers: PersonalizationAnswers, isGuest = false) => {
    setLoadingAuth(true);
    try {
      const chosenDays =
        typeof answers.customPlanDurationDays === 'number'
          ? answers.customPlanDurationDays
          : typeof answers.customDurationDays === 'number'
          ? answers.customDurationDays
          : typeof answers.planDurationDays === 'number'
          ? answers.planDurationDays
          : 180;

      const currentUser = auth.currentUser;
      const isActuallyGuest = isGuest && !currentUser && !initialAuthData?.email;
      const uid = currentUser ? currentUser.uid : (initialAuthData?.email ? 'user-' + Date.now() : 'guest-' + Date.now());
      const email = currentUser?.email || initialAuthData?.email || '';
      const displayName = currentUser?.displayName || initialAuthData?.name || answers.name || (isActuallyGuest ? 'Guest Pioneer' : 'Pioneer');

      const roadmapRes = await generateRoadmapAPI({
        goal: answers.goal || answers.primaryGoal || 'General Mastery',
        companionName: answers.companionName || 'AuraTree',
        companionType: answers.companionType || 'tree',
        planDurationDays: chosenDays,
        dailyHoursAvailable: answers.dailyHoursAvailable || 3,
        difficulty: answers.difficulty || 'medium',
      });

      const newProfile: UserProfile = {
        uid,
        email,
        displayName,
        isGuest: isActuallyGuest,
        goal: answers.goal || answers.primaryGoal || 'General Mastery',
        customPlanDurationDays: chosenDays,
        totalRoadmapDays: chosenDays,
        currentDay: 1,
        streak: 1,
        meaningfulScore: 82,
        totalProductiveHours: 1.5,
        totalSavedScrollHours: 1.0,
        isSetupComplete: true,
        selectedPalette: answers.chosenColorPalette || answers.colorPaletteId || answers.selectedPaletteId || 'emerald-bloom',
        bedtimeHour: String(answers.bedtimeHour || '23:00'),
        personalization: answers,
        companion: {
          type: answers.companionType || 'tree',
          name: answers.companionName || 'AuraTree',
          level: 1,
          aura: 50,
          xp: 50,
          mood: 'radiant',
          stage: 1,
          isJailed: false,
          isWithering: false,
          isWithered: false,
          daysMissed: 0,
          foodBowlsAvailable: 1,
          totalLeaves: 6,
          leavesCount: 6,
          growthPercent: 10,
          feedCount: 1,
          timesWatered: 1,
        },
        roadmap: roadmapRes,
      };

      setUser(newProfile);
      setSelectedPaletteId(newProfile.selectedPalette || 'emerald-bloom');
      if (answers.themeMode) setThemeMode(answers.themeMode);
      await saveUserProfile(newProfile);
      localStorage.setItem('flowra_active_profile', JSON.stringify(newProfile));

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch (e) {
      console.error('Roadmap error on onboarding:', e);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const firebaseUser = await signInWithGoogle();
      if (!firebaseUser) {
        throw new Error('Google Sign-In was not completed. Please try again.');
      }
      if (user && user.isGuest) {
        const synced = await syncGuestDataToCloud(firebaseUser, user);
        setUser(synced);
        localStorage.setItem('flowra_active_profile', JSON.stringify(synced));
        setHasCompletedOpeningSequence(true);
        confetti({ particleCount: 70, spread: 60 });
      } else {
        const existingProfile = await fetchUserProfile(firebaseUser.uid);
        if (existingProfile && existingProfile.isSetupComplete) {
          const authProfile: UserProfile = {
            ...existingProfile,
            uid: firebaseUser.uid,
            email: firebaseUser.email || existingProfile.email || '',
            displayName: existingProfile.displayName || firebaseUser.displayName || 'Pioneer',
            isGuest: false,
          };
          setUser(authProfile);
          if (authProfile.selectedPalette) setSelectedPaletteId(authProfile.selectedPalette);
          if (authProfile.themeMode) setThemeMode(authProfile.themeMode);
          localStorage.setItem('flowra_active_profile', JSON.stringify(authProfile));
          setHasCompletedOpeningSequence(true);
          confetti({ particleCount: 70, spread: 60 });
        } else {
          setInitialAuthData({
            isGuest: false,
            email: firebaseUser.email || undefined,
            name: firebaseUser.displayName || undefined,
          });
          setHasCompletedOpeningSequence(true);
        }
      }
    } catch (e: any) {
      console.error('[Flowra App Google Sign-In Error]:', e);
      throw e;
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    setUser(null);
    localStorage.removeItem('flowra_active_profile');
    localStorage.removeItem('flowra_guest_user');
    setHasCompletedOpeningSequence(false);
    setInitialAuthData(undefined);
  };

  const handleTriggerIntervention = (appName: string, mins: number) => {
    setInterventionTriggerApp(appName);
    setInterventionTriggerMins(mins);
    setIsInterventionOpen(true);
  };

  const handleCompleteIntervention = (auraReward: number) => {
    if (!user) return;
    const currentAura = user.companion?.aura || user.companion?.xp || 0;
    const newAura = currentAura + auraReward;

    const updated: UserProfile = {
      ...user,
      meaningfulScore: Math.min(100, user.meaningfulScore + 6),
      totalSavedScrollHours: +(user.totalSavedScrollHours + 0.5).toFixed(1),
      companion: {
        ...user.companion,
        aura: newAura,
        xp: newAura,
        level: Math.floor(newAura / 100) + 1,
        foodBowlsAvailable: (user.companion.foodBowlsAvailable || 0) + 1,
        mood: 'radiant',
      },
    };
    handleUpdateUser(updated);
  };

  // Calendar Event Handlers
  const handleAddCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEv: CalendarEvent = {
      ...event,
      id: `ev-${Date.now()}`,
    };
    setCalendarEvents((prev) => [...prev, newEv]);
  };

  const handleDeleteCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  // Habit Stack Handlers
  const handleToggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const nextState = !h.isCompletedToday;
          if (nextState && user) {
            const currentAura = user.companion?.aura || user.companion?.xp || 0;
            const updatedUser = {
              ...user,
              companion: {
                ...user.companion,
                aura: currentAura + h.auraReward,
                xp: currentAura + h.auraReward,
              },
            };
            handleUpdateUser(updatedUser);
          }
          return {
            ...h,
            isCompletedToday: nextState,
            streak: nextState ? h.streak + 1 : Math.max(0, h.streak - 1),
          };
        }
        return h;
      })
    );
  };

  const handleAddHabit = (habitData: Omit<HabitItem, 'id' | 'isCompletedToday' | 'streak'>) => {
    const newHabit: HabitItem = {
      ...habitData,
      id: `h-${Date.now()}`,
      isCompletedToday: false,
      streak: 0,
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  // Deep Module & Quiz Rewards (+10 Aura for reading module, +15 Aura for quiz)
  const handleCompleteModule = (moduleId: string) => {
    if (!user) return;
    const currentAura = user.companion?.aura || user.companion?.xp || 0;
    const updated = {
      ...user,
      companion: {
        ...user.companion,
        aura: currentAura + 10,
        xp: currentAura + 10,
        level: Math.floor((currentAura + 10) / 100) + 1,
      },
    };
    handleUpdateUser(updated);
  };

  const handleCompleteQuiz = (score: number, total: number) => {
    if (!user) return;
    const currentAura = user.companion?.aura || user.companion?.xp || 0;
    const reward = score >= 7 ? 20 : 10;
    const updated = {
      ...user,
      companion: {
        ...user.companion,
        aura: currentAura + reward,
        xp: currentAura + reward,
        level: Math.floor((currentAura + reward) / 100) + 1,
        foodBowlsAvailable: (user.companion.foodBowlsAvailable || 0) + 1,
      },
    };
    handleUpdateUser(updated);
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#070A0F] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          <FlowraLogo size="hero" showTagline={true} isAnimated={true} />
          <div className="flex items-center gap-2.5 mt-2">
            <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-zinc-400 font-extrabold tracking-wider uppercase font-mono">
              Loading Flowra Cloud Profile...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // If no user or onboarding incomplete:
  // Step 1: 5-sec opening splash -> 10-sec popping intro -> Sign in / log in (Google, Email, or Cache Guest)
  // Step 2: 11-question personalized blueprint setup
  if (!user || !user.isSetupComplete) {
    if (!hasCompletedOpeningSequence) {
      return (
        <OpeningSequenceModal
          onContinueToPersonalization={(authData) => {
            if (authData) setInitialAuthData(authData);
            setHasCompletedOpeningSequence(true);
          }}
          onExistingProfileLoaded={(existingProfile) => {
            setUser(existingProfile);
            if (existingProfile.selectedPalette) setSelectedPaletteId(existingProfile.selectedPalette);
            localStorage.setItem('flowra_active_profile', JSON.stringify(existingProfile));
            setHasCompletedOpeningSequence(true);
          }}
          onGoogleSignIn={handleGoogleSignIn}
        />
      );
    }
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        onGoogleSignIn={handleGoogleSignIn}
        initialAuthData={initialAuthData}
      />
    );
  }

  const currentPalette = COLOR_PALETTES.find((p) => p.id === selectedPaletteId) || COLOR_PALETTES[0];

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        themeMode === 'light'
          ? 'bg-zinc-50 text-zinc-900'
          : 'bg-[#070A0F] text-[#F3F4F6]'
      }`}
    >
      {/* Top Fixed App Bar with Badges & Action Triggers */}
      <Navbar
        user={user}
        themeMode={themeMode}
        onOpenStreakCalendar={() => setIsStreakCalendarOpen(true)}
        onOpenBedtime={() => setIsBedtimeOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenIntervention={() => setIsInterventionOpen(true)}
        onOpenCreatorProfile={() => setIsCreatorProfileOpen(true)}
      />

      {/* Main Container - Mobile Responsive Frame */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-3 pb-8">
        {activeTab === 'home' && (
          <HomeTab
            user={user}
            themeMode={themeMode}
            onUpdateUser={handleUpdateUser}
            onOpenStreakCalendar={() => setIsStreakCalendarOpen(true)}
            onOpenDeepLesson={() => setIsDeepLessonOpen(true)}
            onOpenBooks={() => setIsBookSectionOpen(true)}
            onOpenHabits={() => setIsTaskSectionOpen(true)}
            onOpenGrowth={() => setIsGrowthModalOpen(true)}
            onOpenClubs={() => setIsClubsModalOpen(true)}
            onOpenBedtime={() => setIsBedtimeOpen(true)}
            onTriggerIntervention={handleTriggerIntervention}
          />
        )}

        {activeTab === 'journey' && (
          <JourneyTab user={user} onUpdateUser={handleUpdateUser} themeMode={themeMode} />
        )}

        {activeTab === 'community' && (
          <CommunityTab
            user={user}
            onOpenClubsModal={() => setIsClubsModalOpen(true)}
            themeMode={themeMode}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            user={user}
            themeMode={themeMode}
            onThemeChange={setThemeMode}
            onGoogleSignIn={handleGoogleSignIn}
            onUpdateUser={handleUpdateUser}
            onSignOut={handleSignOut}
            onOpenAppTracker={() => setIsStreakCalendarOpen(true)}
            onOpenCreatorProfile={() => setIsCreatorProfileOpen(true)}
          />
        )}
      </main>

      {/* Bottom 4-Tab Navigation with Floating AI Mentor Center Button */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenChat={() => setIsAICoachOpen(true)}
        themeMode={themeMode}
      />

      {/* 1. Streak Calendar with Fire Animation, Confetti & Reminders */}
      <StreakCalendarModal
        isOpen={isStreakCalendarOpen}
        onClose={() => setIsStreakCalendarOpen(false)}
        streak={user.streak}
        currentDay={user.currentDay}
        events={calendarEvents}
        onAddEvent={handleAddCalendarEvent}
        onDeleteEvent={handleDeleteCalendarEvent}
        themeMode={themeMode}
      />

      {/* 2. Bedtime Mode with 432Hz Soundscapes & Sleep Timer */}
      <BedtimeModeModal
        isOpen={isBedtimeOpen}
        onClose={() => setIsBedtimeOpen(false)}
        petName={user.companion.name}
        themeMode={themeMode}
      />

      {/* 3. Deep Learning 6000+ Word Modules, YouTube Lecture & 10 MCQs */}
      <DeepLessonModal
        isOpen={isDeepLessonOpen}
        onClose={() => setIsDeepLessonOpen(false)}
        lesson={currentLesson}
        onCompleteModule={handleCompleteModule}
        onCompleteQuiz={handleCompleteQuiz}
        themeMode={themeMode}
      />

      {/* 4. Book Sanctuary with Fuzzy Search & Open Library / Internet Archive */}
      <BookSectionModal
        isOpen={isBookSectionOpen}
        onClose={() => setIsBookSectionOpen(false)}
        userGoal={user.goal}
        themeMode={themeMode}
      />

      {/* 5. Life Habits & Routine Stack (Outside Exam Prep) */}
      <TaskSectionModal
        isOpen={isTaskSectionOpen}
        onClose={() => setIsTaskSectionOpen(false)}
        habits={habits}
        onToggleHabit={handleToggleHabit}
        onAddHabit={handleAddHabit}
        onDeleteHabit={handleDeleteHabit}
        themeMode={themeMode}
      />

      {/* 6. Growth Before & After Transformation Analytics */}
      <GrowthBeforeAfterModal
        isOpen={isGrowthModalOpen}
        onClose={() => setIsGrowthModalOpen(false)}
        companion={user.companion}
        currentDay={user.currentDay}
        totalDays={user.totalRoadmapDays || 180}
        streak={user.streak}
        userGoal={user.goal}
        themeMode={themeMode}
      />

      {/* 7. Clubs & Community (Peer Nudges & Weekly Projects) */}
      <ClubsCommunityModal
        isOpen={isClubsModalOpen}
        onClose={() => setIsClubsModalOpen(false)}
        userDisplayName={user.displayName}
        userStreak={user.streak}
        userGoal={user.goal}
        themeMode={themeMode}
      />

      {/* 8. 24/7 Universal Gemini 3.7 AI Coach */}
      <AICoachChatModal
        isOpen={isAICoachOpen}
        onClose={() => setIsAICoachOpen(false)}
        userGoal={user.goal}
        currentDay={user.currentDay}
        totalDays={user.totalRoadmapDays || user.planDurationDays || 180}
        meaningfulScore={user.meaningfulScore || 82}
        streak={user.streak}
        petName={user.companion.name}
        petType={user.companion.type}
        aura={user.companion.aura || user.companion.xp || 0}
        mood={user.companion.mood || 'radiant'}
        userName={user.displayName}
        todayTask={user.todayTask || user.roadmap?.todayTask}
        timetable={user.timetable || user.roadmap?.dailyTimetable}
        weeklyMilestones={user.weeklyMilestones || user.roadmap?.weeklyMilestones}
        themeMode={themeMode}
      />

      {/* 9. Settings, Themes (Dark/Light/Grey) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        themeMode={themeMode}
        onThemeModeChange={setThemeMode}
        selectedPaletteId={selectedPaletteId}
        onPaletteChange={(palId) => {
          setSelectedPaletteId(palId);
          if (user) {
            handleUpdateUser({ ...user, selectedPalette: palId });
          }
        }}
        negativeNotificationsEnabled={negativeNotificationsEnabled}
        onToggleNegativeNotifications={setNegativeNotificationsEnabled}
        isGuest={!auth.currentUser}
        userEmail={user.email}
        userDisplayName={user.displayName}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onOpenBedtime={() => {
          setIsSettingsOpen(false);
          setIsBedtimeOpen(true);
        }}
        onOpenCreatorProfile={() => {
          setIsSettingsOpen(false);
          setIsCreatorProfileOpen(true);
        }}
      />

      {/* 10. Dopamine Intervention Switch Modal */}
      <InterventionModal
        isOpen={isInterventionOpen}
        onClose={() => setIsInterventionOpen(false)}
        goal={user.goal}
        petName={user.companion.name}
        companionType={user.companion.type}
        appName={interventionTriggerApp}
        minutesSpent={interventionTriggerMins}
        onCompleteChallenge={handleCompleteIntervention}
      />

      {/* 11. Pioneer Profile Modal */}
      <CreatorProfileModal
        isOpen={isCreatorProfileOpen}
        onClose={() => setIsCreatorProfileOpen(false)}
        themeMode={themeMode}
        currentUser={user}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  );
}
