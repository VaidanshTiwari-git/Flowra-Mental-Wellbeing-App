import React, { useState, useEffect } from 'react';
import { CompanionState, CompanionType, ThemeMode } from '../types';
import {
  Sparkles,
  Droplets,
  Utensils,
  AlertTriangle,
  Lock,
  ShieldCheck,
  Heart,
  Award,
  Crown,
  CheckCircle2,
  RefreshCw,
  Gift,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PetVisualProps {
  companion: CompanionState;
  streak?: number;
  currentDay?: number;
  totalRoadmapDays?: number;
  themeMode?: ThemeMode;
  onWaterTree?: () => void;
  onFeedPet?: () => void;
}

export const PetVisual: React.FC<PetVisualProps> = ({
  companion,
  streak = 1,
  currentDay = 1,
  totalRoadmapDays = 180,
  themeMode = 'dark',
  onWaterTree,
  onFeedPet,
}) => {
  const [isWiggling, setIsWiggling] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);

  // Feeding 10-second animation state
  const [isFeedingAnimationActive, setIsFeedingAnimationActive] = useState(false);
  const [feedingCountdown, setFeedingCountdown] = useState(10);
  const [feedingChewFrame, setFeedingChewFrame] = useState(0);

  // Watering animation state
  const [isWateringAnimationActive, setIsWateringAnimationActive] = useState(false);
  const [wateringCountdown, setWateringCountdown] = useState(5);

  const isTree = companion.type === 'tree';
  const isJailed = companion.isJailed || (streak === 0 && (companion.daysMissed || 0) >= 2);
  const isWithered = companion.isWithered || (isTree && streak === 0 && (companion.daysMissed || 0) >= 2);

  const aura = companion.aura || companion.xp || 0;
  const level = Math.max(1, Math.floor(aura / 100) + 1);

  // Calculate Growth Stage based on user's journey progress (from day 1 to totalRoadmapDays)
  // Stage 1: Baby Puppy / Tiny Sprout (Days 1 - 25% of plan)
  // Stage 2: Young Puppy / Growing Sapling (25% - 50% of plan)
  // Stage 3: Adolescent / Leafy Lush Tree (50% - 75% of plan)
  // Stage 4: Majestic Adult / Ancient Sacred Tree with Aura (75% - 100% of plan)
  const planProgressRatio = Math.min(1, Math.max(0, currentDay / (totalRoadmapDays || 180)));
  const growthStage: 1 | 2 | 3 | 4 =
    planProgressRatio < 0.25
      ? 1
      : planProgressRatio < 0.5
      ? 2
      : planProgressRatio < 0.75
      ? 3
      : 4;

  const stageLabels = {
    1: isTree ? 'Baby Sprout Stage' : 'Cute Baby Puppy Stage',
    2: isTree ? 'Young Sapling Stage' : 'Playful Youth Stage',
    3: isTree ? 'Lush Canopy Stage' : 'Strong Adolescent Stage',
    4: isTree ? 'Majestic Ancient Tree' : 'Regal Adult Companion',
  };

  // 10-Second Feeding Animation Timer
  useEffect(() => {
    let interval: any;
    if (isFeedingAnimationActive) {
      interval = setInterval(() => {
        setFeedingChewFrame((f) => (f + 1) % 4);
        setFeedingCountdown((prev) => {
          if (prev <= 1) {
            setIsFeedingAnimationActive(false);
            confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFeedingAnimationActive]);

  // Watering Animation Timer
  useEffect(() => {
    let interval: any;
    if (isWateringAnimationActive) {
      interval = setInterval(() => {
        setWateringCountdown((prev) => {
          if (prev <= 1) {
            setIsWateringAnimationActive(false);
            confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWateringAnimationActive]);

  // Trigger Feed Animal Pet
  const handleTriggerFeed = () => {
    if (onFeedPet) onFeedPet();
    setIsFeedingAnimationActive(true);
    setFeedingCountdown(10);
    setSpeechBubble(
      `🐾 "YUMMY! *munch munch* Thank you for the delicious meal! You're working so hard today. Let's keep our streak alive together!" — ${companion.name}`
    );
    setTimeout(() => setSpeechBubble(null), 11000);
  };

  // Trigger Water Tree
  const handleTriggerWater = () => {
    if (onWaterTree) onWaterTree();
    setIsWateringAnimationActive(true);
    setWateringCountdown(5);
    setSpeechBubble(
      `🌱 "Thank you so much! Your deep focus nourishes my roots. Every task you complete makes our forest flourish!" — ${companion.name}`
    );
    setTimeout(() => setSpeechBubble(null), 6000);
  };

  const handleCompanionClick = () => {
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 600);

    if (isJailed) {
      setSpeechBubble("🥺 Please complete today's streak task to unlock me from jail!");
      setTimeout(() => setSpeechBubble(null), 4000);
      return;
    }

    if (isWithered) {
      setSpeechBubble("🥀 My leaves are dry... Water me with today's focus task to bloom!");
      setTimeout(() => setSpeechBubble(null), 4000);
      return;
    }

    const quotes = isTree
      ? [
          `🌿 "Deep focus expands my roots! You are ${Math.round(planProgressRatio * 100)}% through your journey."`,
          `✨ "Swaying gently in your aura. Let's conquer today's core task!"`,
          `💧 "Fresh raindrops nourish my soul. Thank you for your daily discipline!"`,
        ]
      : [
          `🐾 "Bark! I'm growing bigger every day with you! We're at Day ${currentDay} of ${totalRoadmapDays}."`,
          `✨ "Your aura is glowing bright today! No doomscrolling allowed!"`,
          `💖 "Thank you for taking care of me! Let's hit our daily focus sprint!"`,
        ];

    const rand = quotes[Math.floor(Math.random() * quotes.length)];
    setSpeechBubble(rand);
    setTimeout(() => setSpeechBubble(null), 4500);
  };

  return (
    <div
      className={`p-4 rounded-3xl border shadow-xl transition-all relative overflow-hidden flex flex-col items-center justify-center ${
        themeMode === 'light'
          ? 'bg-gradient-to-b from-emerald-50/60 to-white border-zinc-200 text-zinc-900'
          : 'bg-gradient-to-b from-[#111724] via-[#0A0D15] to-[#06080E] border-emerald-500/25 text-white'
      }`}
    >
      {/* Top Companion Header & Growth Status */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-zinc-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-lg">{isTree ? '🌳' : '🐕'}</span>
          <div>
            <div className="font-black text-white flex items-center gap-1.5">
              <span>{companion.name}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                {stageLabels[growthStage]}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              {isTree
                ? `${companion.totalLeaves || companion.leavesCount || 45} Sacred Leaves`
                : `${companion.foodBowlsAvailable || 1} Food Bowls Ready`}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-emerald-400 font-mono font-bold">
            Day {currentDay} / {totalRoadmapDays}D
          </span>
          <div className="text-[9px] text-zinc-400">Stage {growthStage} of 4</div>
        </div>
      </div>

      {/* Heartfelt Speech Bubble Note */}
      {speechBubble && (
        <div className="mt-2 z-30 max-w-xs px-3.5 py-2.5 rounded-2xl bg-zinc-900/95 text-white border border-emerald-500/40 shadow-2xl text-xs font-medium text-center animate-bounce">
          <p className="leading-relaxed">{speechBubble}</p>
        </div>
      )}

      {/* Main 3D Realistic Companion Stage */}
      <div
        onClick={handleCompanionClick}
        className={`relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center cursor-pointer transition-transform duration-300 my-1 ${
          isWiggling ? 'scale-105 rotate-2' : 'hover:scale-102'
        }`}
      >
        {/* Soft Radial Ambient Aura Shading */}
        <div
          className={`absolute inset-4 rounded-full blur-2xl opacity-40 transition-all duration-700 pointer-events-none ${
            isJailed || isWithered
              ? 'bg-rose-600/40'
              : growthStage === 4
              ? 'bg-amber-400/50'
              : growthStage === 3
              ? 'bg-emerald-400/40'
              : 'bg-teal-400/35'
          }`}
        />

        {/* 3D Realistic Companion Visual Rendering */}
        {isTree ? (
          <Realistic3DTreeSVG
            stage={growthStage}
            isWithered={isWithered}
            isWatering={isWateringAnimationActive}
          />
        ) : (
          <Realistic3DAnimalSVG
            type={companion.type}
            stage={growthStage}
            isJailed={isJailed}
            isFeeding={isFeedingAnimationActive}
            chewFrame={feedingChewFrame}
          />
        )}

        {/* 10-Second Feeding Active Overlay */}
        {isFeedingAnimationActive && (
          <div className="absolute top-2 right-2 bg-black/80 border border-amber-400/80 px-2.5 py-1 rounded-full text-[10px] font-extrabold text-amber-300 flex items-center gap-1 shadow-lg animate-pulse">
            <Utensils className="w-3 h-3 text-amber-400" />
            <span>Eating... {feedingCountdown}s</span>
          </div>
        )}

        {/* 5-Second Watering Active Overlay */}
        {isWateringAnimationActive && (
          <div className="absolute top-2 right-2 bg-black/80 border border-cyan-400/80 px-2.5 py-1 rounded-full text-[10px] font-extrabold text-cyan-300 flex items-center gap-1 shadow-lg animate-pulse">
            <Droplets className="w-3 h-3 text-cyan-400" />
            <span>Watering... {wateringCountdown}s</span>
          </div>
        )}
      </div>

      {/* Action Buttons: Water Tree 💧 vs Feed Pet 🥣 (Bowl of Food) */}
      <div className="w-full flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
        <div className="text-xs text-zinc-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Care for Companion</span>
        </div>

        {isTree ? (
          <button
            onClick={handleTriggerWater}
            disabled={isWateringAnimationActive}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-black font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Droplets className="w-4 h-4 fill-black" />
            <span>{isWateringAnimationActive ? 'Watering Roots...' : 'Water Tree 💧'}</span>
          </button>
        ) : (
          <button
            onClick={handleTriggerFeed}
            disabled={isFeedingAnimationActive}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Utensils className="w-4 h-4" />
            <span>{isFeedingAnimationActive ? `Eating (${feedingCountdown}s)...` : 'Feed Pet 🥣 (Food Bowl)'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

// 3D Realistic High-Shaded Tree with Stage Growth (Baby Sprout to Ancient Sacred Oak)
const Realistic3DTreeSVG: React.FC<{
  stage: 1 | 2 | 3 | 4;
  isWithered: boolean;
  isWatering: boolean;
}> = ({ stage, isWithered, isWatering }) => {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
      <defs>
        {/* 3D Realistic Bark Trunk Gradient */}
        <linearGradient id="trunk3D" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#451A03" />
          <stop offset="35%" stopColor="#78350F" />
          <stop offset="70%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#291102" />
        </linearGradient>

        {/* 3D Foliage Shading Layers */}
        <radialGradient id="foliage3DMain" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="30%" stopColor="#34D399" />
          <stop offset="70%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064E3B" />
        </radialGradient>

        <radialGradient id="foliage3DHighlight" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" />
          <stop offset="50%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#10B981" />
        </radialGradient>

        <radialGradient id="foliageWithered" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#D97706" />
          <stop offset="80%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#451A03" />
        </radialGradient>

        {/* Soil Base 3D Shading */}
        <radialGradient id="soil3D" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#44403C" />
          <stop offset="60%" stopColor="#292524" />
          <stop offset="100%" stopColor="#0C0A09" />
        </radialGradient>
      </defs>

      {/* 3D Earth Island Soil Mound */}
      <ellipse cx="100" cy="178" rx="56" ry="14" fill="#000000" opacity="0.4" filter="blur(4px)" />
      <ellipse cx="100" cy="174" rx="52" ry="12" fill="url(#soil3D)" />
      <ellipse cx="100" cy="172" rx="46" ry="9" fill="#1C1917" />

      {/* Small Sprout Grass on Soil */}
      {!isWithered && (
        <>
          <path d="M 80 170 Q 75 160 70 162" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 84 171 Q 82 158 78 160" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
          <path d="M 118 170 Q 124 160 128 163" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 114 171 Q 118 158 122 161" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {/* STAGE 1: BABY SPROUT (Tiny cute tender seedling) */}
      {stage === 1 && (
        <g className="animate-pulse" style={{ animationDuration: '3s' }}>
          {/* Baby Stem */}
          <path d="M 100 172 Q 100 145 96 130" stroke="url(#trunk3D)" strokeWidth="6" strokeLinecap="round" />
          {/* Two Cute Big Leaves */}
          <path
            d="M 96 130 C 75 110 65 130 96 130 Z"
            fill={isWithered ? 'url(#foliageWithered)' : 'url(#foliage3DMain)'}
          />
          <path
            d="M 96 130 C 117 110 127 130 96 130 Z"
            fill={isWithered ? 'url(#foliageWithered)' : 'url(#foliage3DHighlight)'}
          />
          {/* Center Dewdrop */}
          {!isWithered && <circle cx="96" cy="126" r="3" fill="#67E8F9" className="animate-ping" />}
        </g>
      )}

      {/* STAGE 2: YOUNG SAPLING (Branching out, leafy clusters) */}
      {stage === 2 && (
        <g>
          <path d="M 100 172 C 100 140 94 120 100 105" stroke="url(#trunk3D)" strokeWidth="9" strokeLinecap="round" />
          <path d="M 97 130 Q 80 115 72 120" stroke="url(#trunk3D)" strokeWidth="4" strokeLinecap="round" />
          <path d="M 101 125 Q 118 112 126 116" stroke="url(#trunk3D)" strokeWidth="4" strokeLinecap="round" />

          {/* Leaf Canopy Spheres */}
          <circle cx="70" cy="115" r="18" fill={isWithered ? 'url(#foliageWithered)' : 'url(#foliage3DMain)'} />
          <circle cx="128" cy="112" r="18" fill={isWithered ? 'url(#foliageWithered)' : 'url(#foliage3DMain)'} />
          <circle cx="100" cy="92" r="26" fill={isWithered ? 'url(#foliageWithered)' : 'url(#foliage3DHighlight)'} />
        </g>
      )}

      {/* STAGE 3: LUSH CANOPY (Strong trunk, dense layers) */}
      {stage === 3 && (
        <g>
          {/* Broad Realistic Trunk */}
          <path
            d="M 92 172 C 92 140 86 110 100 85 C 114 110 108 140 108 172 Z"
            fill="url(#trunk3D)"
          />
          <path d="M 94 120 Q 65 105 52 110" stroke="url(#trunk3D)" strokeWidth="6" strokeLinecap="round" />
          <path d="M 106 115 Q 135 100 148 105" stroke="url(#trunk3D)" strokeWidth="6" strokeLinecap="round" />

          {/* Lush Overlapping 3D Canopy Spheres */}
          <circle cx="60" cy="100" r="26" fill={isWithered ? 'url(#foliageWithered)' : 'url(#foliage3DMain)'} />
          <circle cx="140" cy="96" r="26" fill={isWithered ? 'url(#foliageWithered)' : 'url(#foliage3DMain)'} />
          <circle cx="100" cy="70" r="36" fill={isWithered ? 'url(#foliageWithered)' : 'url(#foliage3DHighlight)'} />
          <circle cx="85" cy="85" r="24" fill={isWithered ? 'url(#foliageWithered)' : 'url(#foliage3DMain)'} />
          <circle cx="115" cy="85" r="24" fill={isWithered ? 'url(#foliageWithered)' : 'url(#foliage3DHighlight)'} />

          {/* Blossom Fruits */}
          {!isWithered && (
            <>
              <circle cx="80" cy="65" r="3.5" fill="#F472B6" />
              <circle cx="120" cy="72" r="3.5" fill="#FBBF24" />
              <circle cx="100" cy="90" r="3.5" fill="#60A5FA" />
            </>
          )}
        </g>
      )}

      {/* STAGE 4: MAJESTIC ANCIENT SACRED OAK (Full mature master tree with glowing blossoms & Aura Crown) */}
      {stage === 4 && (
        <g>
          {/* Massive Sculpted 3D Ancient Trunk */}
          <path
            d="M 86 172 C 86 130 78 95 100 70 C 122 95 114 130 114 172 Z"
            fill="url(#trunk3D)"
          />
          {/* Ancient Roots */}
          <path d="M 88 165 Q 68 174 60 176" stroke="url(#trunk3D)" strokeWidth="6" strokeLinecap="round" />
          <path d="M 112 165 Q 132 174 140 176" stroke="url(#trunk3D)" strokeWidth="6" strokeLinecap="round" />

          {/* Broad Sweeping Branches */}
          <path d="M 90 110 Q 50 90 35 96" stroke="url(#trunk3D)" strokeWidth="7" strokeLinecap="round" />
          <path d="M 110 105 Q 150 85 165 92" stroke="url(#trunk3D)" strokeWidth="7" strokeLinecap="round" />

          {/* Immense 3D Layered Sacred Canopy */}
          <circle cx="48" cy="88" r="30" fill="url(#foliage3DMain)" />
          <circle cx="152" cy="84" r="30" fill="url(#foliage3DMain)" />
          <circle cx="75" cy="60" r="35" fill="url(#foliage3DHighlight)" />
          <circle cx="125" cy="58" r="35" fill="url(#foliage3DHighlight)" />
          <circle cx="100" cy="45" r="42" fill="url(#foliage3DMain)" />
          <circle cx="98" cy="65" r="30" fill="url(#foliage3DHighlight)" opacity="0.9" />

          {/* Glowing Aura Petals & Sacred Crown */}
          <g className="animate-pulse">
            <circle cx="70" cy="45" r="4.5" fill="#F472B6" />
            <circle cx="130" cy="42" r="4.5" fill="#FDE047" />
            <circle cx="100" cy="30" r="5" fill="#67E8F9" />
            <circle cx="55" cy="75" r="4" fill="#FBBF24" />
            <circle cx="145" cy="70" r="4" fill="#A78BFA" />
          </g>

          {/* Golden Aura Crown */}
          <text x="100" y="16" textAnchor="middle" fontSize="18" className="drop-shadow-lg">
            👑
          </text>
        </g>
      )}

      {/* Watering Animation Droplets & Watering Can */}
      {isWatering && (
        <g className="animate-bounce" style={{ animationDuration: '0.8s' }}>
          <circle cx="85" cy="60" r="3.5" fill="#38BDF8" />
          <circle cx="100" cy="75" r="4" fill="#60A5FA" />
          <circle cx="115" cy="65" r="3.5" fill="#38BDF8" />
          <circle cx="90" cy="110" r="4.5" fill="#0EA5E9" />
          <circle cx="110" cy="115" r="4.5" fill="#0EA5E9" />
          <circle cx="100" cy="140" r="5" fill="#38BDF8" />
        </g>
      )}
    </svg>
  );
};

// 3D Realistic High-Shaded Animal Companion with 10-Second Eating Animation
const Realistic3DAnimalSVG: React.FC<{
  type: CompanionType;
  stage: 1 | 2 | 3 | 4;
  isJailed: boolean;
  isFeeding: boolean;
  chewFrame: number;
}> = ({ type, stage, isJailed, isFeeding, chewFrame }) => {
  // Shaded Realistic Animal Configs
  const animalProfiles = {
    dog: { name: 'Shiba Puppy', emoji: '🐶', coat: '#E59866', snout: '#FADBD8', eyes: '#2C3E50' },
    cat: { name: 'Calico Cat', emoji: '🐱', coat: '#F39C12', snout: '#FDEDEC', eyes: '#27AE60' },
    dragon: { name: 'Aura Dragon', emoji: '🐲', coat: '#2ECC71', snout: '#A3E4D7', eyes: '#F1C40F' },
    owl: { name: 'Mystic Owl', emoji: '🦉', coat: '#5D6D7E', snout: '#F39C12', eyes: '#F4D03F' },
    fox: { name: 'Amber Fox', emoji: '🦊', coat: '#E67E22', snout: '#FFFFFF', eyes: '#2C3E50' },
    panda: { name: 'Red Panda', emoji: '🐼', coat: '#BDC3C7', snout: '#FFFFFF', eyes: '#17202A' },
  };

  const current = (animalProfiles as any)[type] || animalProfiles.dog;
  const isPuppy = stage <= 2;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none">
      {/* 3D Specular Shaded Animal Avatar Body */}
      <div
        className={`relative flex items-center justify-center transition-transform duration-300 ${
          isFeeding ? 'animate-bounce' : ''
        }`}
        style={{ animationDuration: isFeeding ? '0.5s' : '2.5s' }}
      >
        {/* Scale animal based on growth stage (Stage 1 is Cute Puppy, Stage 4 is Big Adult) */}
        <div
          className={`transition-all duration-700 flex items-center justify-center ${
            stage === 1
              ? 'text-6xl scale-90'
              : stage === 2
              ? 'text-7xl scale-100'
              : stage === 3
              ? 'text-8xl scale-110'
              : 'text-9xl scale-120 drop-shadow-2xl'
          }`}
        >
          {current.emoji}
        </div>

        {/* Crown on Stage 4 Adult */}
        {stage === 4 && !isJailed && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl drop-shadow-md animate-pulse">
            👑
          </div>
        )}

        {/* Chewing love hearts when feeding */}
        {isFeeding && (
          <div className="absolute -top-3 right-0 text-xl animate-ping" style={{ animationDuration: '1.2s' }}>
            💖
          </div>
        )}
      </div>

      {/* 3D Realistic Food Bowl (Always visible or highlighted during feeding) */}
      <div className="mt-1 flex items-center justify-center relative">
        <div
          className={`relative px-4 py-1.5 rounded-full border shadow-lg flex items-center gap-1.5 transition-all ${
            isFeeding
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 border-amber-300 ring-2 ring-amber-400 scale-110'
              : 'bg-zinc-900/90 border-zinc-700'
          }`}
        >
          <span className="text-base">{isFeeding ? '🥣✨' : '🥣'}</span>
          <span className="text-[10px] font-black text-amber-300 font-mono">
            {isFeeding ? 'Eating Fresh Kibble!' : 'Food Bowl'}
          </span>
        </div>
      </div>

      {/* Jail Bars if user streak is broken */}
      {isJailed && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-black/60 backdrop-blur-[2px] border-2 border-rose-500/60 p-2">
          <div className="absolute inset-0 flex justify-evenly pointer-events-none">
            <div className="w-1.5 h-full bg-gradient-to-b from-zinc-300 via-zinc-500 to-zinc-700 shadow-md" />
            <div className="w-1.5 h-full bg-gradient-to-b from-zinc-300 via-zinc-500 to-zinc-700 shadow-md" />
            <div className="w-1.5 h-full bg-gradient-to-b from-zinc-300 via-zinc-500 to-zinc-700 shadow-md" />
            <div className="w-1.5 h-full bg-gradient-to-b from-zinc-300 via-zinc-500 to-zinc-700 shadow-md" />
          </div>
          <div className="absolute bottom-2 px-2.5 py-1 rounded-full bg-rose-950/90 border border-rose-500 text-rose-300 text-[10px] font-bold flex items-center gap-1 shadow-lg z-30">
            <Lock className="w-3 h-3" /> Jailed! Complete streak task to free
          </div>
        </div>
      )}
    </div>
  );
};
