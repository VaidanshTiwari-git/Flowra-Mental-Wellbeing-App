import React from 'react';
import { Flame, Sparkles, Bell, ShieldCheck, Zap, Moon, Settings, Calendar as CalendarIcon, Award } from 'lucide-react';
import { UserProfile, ThemeMode } from '../types';
import { FlowraLogo } from './FlowraLogo';

interface NavbarProps {
  user: UserProfile;
  themeMode?: ThemeMode;
  onOpenStreakCalendar: () => void;
  onOpenBedtime: () => void;
  onOpenSettings: () => void;
  onOpenIntervention: () => void;
  onOpenCreatorProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  themeMode = 'dark',
  onOpenStreakCalendar,
  onOpenBedtime,
  onOpenSettings,
  onOpenIntervention,
  onOpenCreatorProfile,
}) => {
  const aura = user.companion?.aura || user.companion?.xp || 0;

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors px-4 py-2.5 ${
        themeMode === 'light'
          ? 'bg-white/90 border-zinc-200 text-zinc-900 shadow-sm'
          : 'bg-[#0A0A0A]/90 border-emerald-500/20 text-white'
      }`}
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-2">
          <FlowraLogo size="sm" showTagline={false} />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-sm tracking-tight flex items-center">
                <span>Flow</span>
                <span className="text-emerald-400">ra</span>
              </h1>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {user.totalRoadmapDays !== undefined && user.totalRoadmapDays !== null ? `${user.totalRoadmapDays}D` : '180D'}
              </span>
            </div>
            <p className="text-[9px] text-zinc-400 truncate max-w-[120px]">
              Same screen. Different aura.
            </p>
          </div>
        </div>

        {/* Action Controls & Stats */}
        <div className="flex items-center gap-1.5">
          {/* Animated Streak Flame Trigger */}
          <button
            onClick={onOpenStreakCalendar}
            id="navbar-streak-button"
            className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-xl text-xs font-black shadow-inner hover:bg-amber-500/25 transition-all cursor-pointer group"
            title="Open Streak Calendar & Daily Reminders"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 group-hover:scale-110 group-hover:animate-bounce transition-transform" />
            <span>{user.streak}d</span>
          </button>

          {/* Aura Points Badge */}
          <div
            id="navbar-aura-badge"
            className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-xl text-xs font-black shadow-inner"
            title="Your Current Aura Points"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>{aura}</span>
          </div>

          {/* Bedtime Wind-Down Trigger */}
          <button
            onClick={onOpenBedtime}
            id="navbar-bedtime-button"
            className="w-8 h-8 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 transition-all cursor-pointer"
            title="Bedtime Wind-Down & Alpha Sleep Music"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>

          {/* Settings / Themes Modal Trigger */}
          <button
            onClick={onOpenSettings}
            id="navbar-settings-button"
            className="w-8 h-8 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-300 transition-all cursor-pointer"
            title="Settings, Themes & Cloud Sync"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
