import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Sparkles,
  Award,
  Clock,
  Flame,
  ShieldCheck,
  Smartphone,
  LogOut,
  Settings,
  Heart,
  Droplets,
  Utensils,
  CheckCircle2,
  Palette,
  Calendar,
  Cloud,
  Lock,
  Zap,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { UserProfile, ThemeMode } from '../types';
import { logoutUser, saveUserProfile } from '../lib/firebase';
import { calculateAuraBadges } from '../lib/badges';
import confetti from 'canvas-confetti';

interface ProfileTabProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onSignOut: () => void;
  onOpenAppTracker: () => void;
  onGoogleSignIn?: () => Promise<void>;
  onOpenCreatorProfile?: () => void;
  themeMode?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  onUpdateUser,
  onSignOut,
  onOpenAppTracker,
  onGoogleSignIn,
  onOpenCreatorProfile,
  themeMode = 'dark',
  onThemeChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user.displayName);
  const [companionNameInput, setCompanionNameInput] = useState(user.companion.name);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  const isUnauthorizedDomain =
    syncError &&
    (syncError.toLowerCase().includes('unauthorized') ||
      syncError.toLowerCase().includes('domain') ||
      syncError.includes('auth/unauthorized-domain'));

  const handleCopyDomain = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentDomain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const totalPlanDays =
    user.totalRoadmapDays !== undefined && user.totalRoadmapDays !== null
      ? user.totalRoadmapDays
      : user.planDurationDays !== undefined && user.planDurationDays !== null
      ? user.planDurationDays
      : user.customPlanDurationDays !== undefined && user.customPlanDurationDays !== null
      ? user.customPlanDurationDays
      : 180;

  const [planDaysInput, setPlanDaysInput] = useState(String(totalPlanDays));
  const auraBadges = calculateAuraBadges(totalPlanDays, user.currentDay);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) return;

      // Resize via HTML5 Canvas for optimal storage and rendering
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);

          const updated: UserProfile = {
            ...user,
            photoURL: compressedDataUrl,
            avatar: compressedDataUrl,
          };
          onUpdateUser(updated);
          saveUserProfile(updated);
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    // Reset file input so user can re-select same file if desired
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    const updated: UserProfile = {
      ...user,
      photoURL: undefined,
      avatar: undefined,
    };
    onUpdateUser(updated);
    saveUserProfile(updated);
  };

  const handleSaveProfile = () => {
    const trimmed = planDaysInput.trim();
    const parsedDays = trimmed === '0' ? 0 : Number(trimmed) || totalPlanDays;
    const updated = {
      ...user,
      displayName: nameInput.trim() || user.displayName,
      totalRoadmapDays: parsedDays,
      planDurationDays: parsedDays,
      customPlanDurationDays: parsedDays,
      companion: {
        ...user.companion,
        name: companionNameInput.trim() || user.companion.name,
      },
    };
    onUpdateUser(updated);
    saveUserProfile(updated);
    setIsEditing(false);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  const handleThemeSelect = (mode: ThemeMode) => {
    onThemeChange?.(mode);
    const updated: UserProfile = {
      ...user,
      themeMode: mode,
    };
    onUpdateUser(updated);
    saveUserProfile(updated);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn('Signout warning:', e);
    }
    onSignOut();
  };

  const handleGoogleSync = async () => {
    if (!onGoogleSignIn) return;
    setSyncError(null);
    setIsSyncing(true);
    try {
      await onGoogleSignIn();
      confetti({ particleCount: 60, spread: 70 });
    } catch (e: any) {
      console.error('[ProfileTab Google Sync Error]:', e);
      setSyncError(e?.message || 'Google sync failed. Please check browser popups and try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const initials = user.displayName
    ? user.displayName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || user.displayName.slice(0, 2).toUpperCase()
    : 'FP';

  return (
    <div className="space-y-4 pb-20 pt-1 animate-fadeIn">
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Unified Master Profile Card */}
      <div
        className={`p-5 rounded-3xl border shadow-xl relative overflow-hidden transition-all space-y-4 ${
          themeMode === 'light'
            ? 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
            : 'bg-gradient-to-br from-[#120D22] via-[#0E131F] to-[#0A0D15] border-purple-500/30 text-white shadow-[0_0_30px_rgba(139,92,246,0.12)]'
        }`}
      >
        {/* Single Cohesive Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Clickable Profile Avatar with Upload Functionality */}
            <div className="relative group shrink-0">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-teal-400 p-[2px] shadow-lg cursor-pointer hover:scale-105 transition-all relative overflow-hidden"
                title="Tap to upload or change your profile picture"
              >
                <div className="w-full h-full bg-[#0D121F] rounded-[14px] flex items-center justify-center font-black text-white text-base overflow-hidden relative">
                  {user.photoURL || user.avatar ? (
                    <img
                      src={user.photoURL || user.avatar}
                      alt={user.displayName}
                      className="w-full h-full object-cover rounded-[14px]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-white font-extrabold text-lg tracking-wider font-mono">
                      {initials}
                    </span>
                  )}

                  {/* Camera upload overlay on hover */}
                  <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-0.5">
                    <Camera className="w-4 h-4 text-emerald-300" />
                    <span className="text-[8px] font-bold text-emerald-200 uppercase tracking-tighter">
                      {user.photoURL || user.avatar ? 'Change' : 'Upload'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Camera Action Badge */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-400 border-2 border-[#0D121F] flex items-center justify-center text-black shadow-md cursor-pointer transition-transform hover:scale-110"
                title="Upload custom photo"
              >
                <Camera className="w-2.5 h-2.5 text-black" />
              </button>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5 truncate">
                  <span className="truncate">{user.displayName}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 fill-emerald-400/20 shrink-0" />
                </h3>

                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30 shrink-0">
                  {totalPlanDays}-Day Plan
                </span>

                <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 shrink-0">
                  {user.personalization?.targetRole || user.personalization?.preparingFor || 'Pioneer'}
                </span>

                {user.isGuest && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shrink-0">
                    Guest
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-2 text-xs text-zinc-400">
                <span className="text-emerald-400 font-medium truncate max-w-[220px]">
                  {user.personalization?.goal || user.goal || 'General Mastery Track'}
                </span>
                {user.email && !user.isGuest && user.email !== 'guest@flowra.app' && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400 font-mono text-[11px] truncate max-w-[200px]">
                      {user.email}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {onOpenCreatorProfile && (
              <button
                onClick={onOpenCreatorProfile}
                className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-purple-500/20"
                title="View Full Profile Details & Stats"
              >
                <span>View Profile</span>
                <span>→</span>
              </button>
            )}

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer transition-all border border-zinc-700/60"
              title="Edit Profile Settings & Photo"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Guest Cloud Sync Prompt */}
        {user.isGuest && onGoogleSignIn && (
          <div className="flex flex-col gap-2">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-xs text-zinc-200">
                <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Connect Google Account to back up your {totalPlanDays}-day roadmap to cloud</span>
              </div>
              <button
                onClick={handleGoogleSync}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-black font-extrabold text-xs shadow-md transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSyncing ? 'Connecting...' : 'Sync with Google'}
              </button>
            </div>

            {syncError && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs flex flex-col gap-2 text-left">
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight">{syncError}</span>
                </div>

                {isUnauthorizedDomain && (
                  <div className="p-2 rounded-lg bg-black/60 border border-zinc-700/60 flex items-center justify-between gap-2">
                    <code className="text-[10px] font-mono text-emerald-400 select-all truncate">
                      {currentDomain}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyDomain}
                      className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {copiedDomain ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Domain</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Inline Edit Mode */}
        {isEditing && (
          <div className="pt-3 border-t border-zinc-800/80 space-y-3 bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800">
            {/* Photo Management Row in Edit Mode */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center font-bold text-white text-xs">
                  {user.photoURL || user.avatar ? (
                    <img src={user.photoURL || user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Profile Photo</div>
                  <div className="text-[10px] text-zinc-400">Upload your own avatar picture</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{user.photoURL || user.avatar ? 'Change' : 'Upload'}</span>
                </button>
                {(user.photoURL || user.avatar) && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 cursor-pointer transition-all"
                    title="Remove custom photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Your Name:</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Companion Name:</label>
              <input
                type="text"
                value={companionNameInput}
                onChange={(e) => setCompanionNameInput(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Plan Duration (Days):</label>
              <input
                type="number"
                min="7"
                max="730"
                value={planDaysInput}
                onChange={(e) => setPlanDaysInput(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold text-xs cursor-pointer shadow-md"
            >
              Save Profile Updates
            </button>
          </div>
        )}
      </div>

      {/* Theme Selection Toggle */}
      <div
        className={`p-4 rounded-3xl border space-y-2.5 transition-all ${
          themeMode === 'light'
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[#0E131C] border-zinc-800 text-white'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Display Theme</h4>
          </div>
          <span className="text-[10px] text-zinc-400 font-bold capitalize">{themeMode} Mode Active</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'dark' as ThemeMode, label: '🌙 Dark', desc: 'Obsidian' },
            { id: 'light' as ThemeMode, label: '☀️ Light', desc: 'Crisp White' },
          ].map((thm) => (
            <button
              key={thm.id}
              onClick={() => handleThemeSelect(thm.id)}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                themeMode === thm.id
                  ? 'bg-emerald-500/20 border-emerald-400 font-extrabold shadow-md ring-1 ring-emerald-400'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="text-xs font-bold text-white">{thm.label}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">{thm.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 4 Aura Badges (Divided across 4 Quarters of Plan) */}
      <div
        className={`p-4 rounded-3xl border space-y-3 transition-all ${
          themeMode === 'light'
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[#0E131C] border-zinc-800 text-white'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider">4-Tier Aura Badges</h4>
          </div>
          <span className="text-[10px] text-zinc-400">{totalPlanDays}-Day Journey Arc</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {auraBadges.map((b) => (
            <div
              key={b.id}
              className={`p-3 rounded-2xl border flex flex-col justify-between gap-1.5 transition-all ${
                b.unlocked
                  ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-amber-400 text-white shadow-md'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-500 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-400">Q{b.quarter} (Day {b.targetDay})</span>
                {b.unlocked ? <span>✨</span> : <Lock className="w-3 h-3 text-zinc-600" />}
              </div>
              <div className="text-xs font-extrabold text-white leading-tight break-words">{b.name}</div>
              <div className="text-[10px] text-amber-400 font-mono font-bold">+{b.auraReward} Aura</div>
            </div>
          ))}
        </div>
      </div>

      {/* Companion Evolution Status */}
      <div
        className={`p-4 rounded-3xl border space-y-3 transition-all ${
          themeMode === 'light'
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[#0E131C] border-zinc-800 text-white'
        }`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {user.companion.type === 'cat'
                ? '🐱'
                : user.companion.type === 'dog'
                ? '🐶'
                : user.companion.type === 'dragon'
                ? '🐲'
                : user.companion.type === 'owl'
                ? '🦉'
                : '🌳'}
            </span>
            <div>
              <h4 className="text-xs font-bold text-white">
                {user.companion.name} ({user.companion.type.toUpperCase()})
              </h4>
              <p className="text-[10px] text-zinc-400">Level {user.companion.level} Evolution Stage</p>
            </div>
          </div>

          <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
            {user.companion.xp || user.companion.aura || 0} XP
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-zinc-950/70 border border-zinc-800">
            <div className="text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{user.streak} Days</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Consecutive Streak</div>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-950/70 border border-zinc-800">
            <div className="text-cyan-400 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{user.totalProductiveHours}h</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Deep Focus Logged</div>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          id="profile-signout-button"
          className="w-full py-3 rounded-2xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out / Reset Flowra Session</span>
        </button>
      </div>
    </div>
  );
};
