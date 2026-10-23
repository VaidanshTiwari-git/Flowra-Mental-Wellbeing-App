import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Zap,
  X,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  Play,
  RotateCcw,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { InterventionChallenge, GoalType, CompanionType } from '../types';

interface InterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: GoalType;
  petName: string;
  companionType?: CompanionType;
  appName?: string;
  minutesSpent?: number;
  onCompleteChallenge: (xp: number) => void;
}

export const InterventionModal: React.FC<InterventionModalProps> = ({
  isOpen,
  onClose,
  goal,
  petName,
  companionType = 'tree',
  appName = 'Instagram Reels',
  minutesSpent = 42,
  onCompleteChallenge,
}) => {
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes (300s)
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const isTree = companionType === 'tree';

  // Goal-specific micro dopamine challenges
  const goalChallenges: Record<GoalType, InterventionChallenge> = {
    'Placement Prep': {
      title: '⚡ 5-Minute Two-Pointer Mini-Drill',
      durationMinutes: 5,
      type: 'mini-drill',
      prompt: 'Mentally trace: Given an array [2, 7, 11, 15] and target 9, how does a hash map find the complement in O(1) time? State the 2 invariant properties.',
      xpReward: 60,
      actionStep: 'Solve this mental model or write 3 lines of pseudo-code to lock in your daily placement edge!',
    },
    'Learn AI/ML': {
      title: '⚡ 5-Minute Transformer Attention Flash-Check',
      durationMinutes: 5,
      type: 'mini-drill',
      prompt: 'Explain what Query (Q), Key (K), and Value (V) represent in Scaled Dot-Product Attention in simple physical terms (Search Query, Index Key, Content Value).',
      xpReward: 60,
      actionStep: 'Synthesize the formula Softmax((Q*K^T)/sqrt(d_k))*V to unlock high focus!',
    },
    'Improve English': {
      title: '⚡ 5-Minute Vocal Monologue & Idiom Drill',
      durationMinutes: 5,
      type: 'mini-drill',
      prompt: 'Speak aloud for 90 seconds explaining your favourite hobby without using filler words ("um", "like", "actually"). Use the phrase "compound growth".',
      xpReward: 60,
      actionStep: 'Record or speak aloud now to train your vocal neural pathways!',
    },
    'Read More Books': {
      title: '⚡ 5-Minute Speed Snippet: "Atomic Habits"',
      durationMinutes: 5,
      type: 'reading',
      prompt: '"You do not rise to the level of your goals. You fall to the level of your systems." Write one tiny system you will use tomorrow morning.',
      xpReward: 60,
      actionStep: 'Reflect on this 1 paragraph and commit to one 2-minute starter habit.',
    },
    'Improve Fitness': {
      title: '⚡ 5-Minute Explosive Calisthenics Reset',
      durationMinutes: 5,
      type: 'workout',
      prompt: 'Break the dopamine stagnation: 15 Bodyweight Squats + 10 Pushups + 30-second Doorframe Chest Stretch to boost oxygenated blood to your brain!',
      xpReward: 60,
      actionStep: 'Stand up right now, perform the reps, and feel your physical vitality surge!',
    },
  };

  const challenge = goalChallenges[goal] || goalChallenges['Placement Prep'];

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerSeconds]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleFinish = () => {
    setIsCompleted(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      onCompleteChallenge(challenge.xpReward);
      onClose();
      setIsCompleted(false);
      setTimerSeconds(300);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#141418] border border-purple-500/30 rounded-3xl p-5 shadow-[0_0_35px_rgba(168,85,247,0.25)] relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                AI Intervention Moment
              </span>
              <h3 className="font-bold text-white text-sm">Dopamine Replacement</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Smart Comparative Stat */}
        <div className="mt-3 p-3 rounded-2xl bg-[#0A0A0A] border border-purple-500/20 relative z-10">
          <div className="flex items-center gap-1.5 text-xs text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              You logged <strong className="text-rose-400">{minutesSpent} min</strong> on{' '}
              <strong className="text-white">{appName}</strong> today.
            </span>
          </div>
          <p className="text-[11px] text-purple-300/90 mt-1 font-medium leading-relaxed">
            That's enough time to finish 2 high-yield drills in <strong className="text-white">{goal}</strong>.
            Swap just 5 minutes now to {isTree ? 'water' : 'feed'} <strong className="text-cyan-300">{petName}</strong>!
          </p>
        </div>

        {/* Challenge Box */}
        <div className="my-3 p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-zinc-900/80 border border-purple-400/30 relative z-10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {challenge.title}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
              +{challenge.xpReward} XP + {isTree ? '💧 1 Water' : '🍲 1 Bowl'}
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed bg-[#0A0A0A] p-3 rounded-xl border border-zinc-800/80">
            {challenge.prompt}
          </p>

          <p className="text-[11px] text-teal-300 font-medium">{challenge.actionStep}</p>

          {/* 5-minute Timer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="text-lg font-black text-white font-mono bg-black/40 px-3 py-1 rounded-xl border border-zinc-700">
                {formatTime(timerSeconds)}
              </div>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1 cursor-pointer"
              >
                {isRunning ? 'Pause' : 'Start Timer'}
              </button>
            </div>

            <button
              onClick={() => {
                setIsRunning(false);
                setTimerSeconds(300);
              }}
              className="text-zinc-500 hover:text-zinc-300 text-xs p-1"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Complete & Reward Button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          disabled={isCompleted}
          onClick={handleFinish}
          id="intervention-complete-button"
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 hover:from-purple-500 hover:to-cyan-300 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 cursor-pointer transition-all"
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Dopamine Reset Claimed! +{challenge.xpReward} XP {isTree ? '💧 Water' : '🍲 Food Bowl'}</span>
            </>
          ) : (
            <>
              <Award className="w-4 h-4 text-white" />
              <span>
                {isTree
                  ? `I Completed This 5-Min Drill (Claim +${challenge.xpReward} XP & water)`
                  : `I Completed This 5-Min Drill (Claim +${challenge.xpReward} XP & Food Bowl)`}
              </span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
