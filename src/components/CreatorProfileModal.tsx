import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Clock,
  ExternalLink,
  Flame,
  Search,
  Share2,
  X,
  CheckCircle2,
  Camera,
  Trash2,
  Play,
  Youtube,
  Tv,
  Eye,
  Layers,
  Target,
  RefreshCw,
  User,
  Sliders,
} from 'lucide-react';
import { ThemeMode, UserProfile } from '../types';
import { saveUserProfile } from '../lib/firebase';
import { calculateAuraBadges } from '../lib/badges';
import { searchYouTubeVideosAPI } from '../services/api';
import confetti from 'canvas-confetti';

interface CreatorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode?: ThemeMode;
  currentUser?: UserProfile | null;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const CreatorProfileModal: React.FC<CreatorProfileModalProps> = ({
  isOpen,
  onClose,
  themeMode = 'dark',
  currentUser,
  onUpdateUser,
}) => {
  const isLight = themeMode === 'light';
  const [activeTab, setActiveTab] = useState<'profile' | 'youtube-search'>('profile');

  // Profile edit states
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(
    currentUser?.personalization?.customGoalText ||
      `Mastering ${currentUser?.goal || 'General Focus Track'} through deep work sprints and Flowra living companion habit accountability.`
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // YouTube Search States
  const [searchQuery, setSearchQuery] = useState(currentUser?.goal || 'Focus & Deep Work');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (isOpen && searchResults.length === 0) {
      handlePerformSearch(searchQuery || 'High Performance Learning');
    }
  }, [isOpen]);

  if (!isOpen || !currentUser) return null;

  const totalPlanDays =
    currentUser.totalRoadmapDays !== undefined && currentUser.totalRoadmapDays !== null
      ? currentUser.totalRoadmapDays
      : currentUser.planDurationDays !== undefined && currentUser.planDurationDays !== null
      ? currentUser.planDurationDays
      : 180;

  const aura = currentUser.companion?.aura || currentUser.companion?.xp || 0;
  const badges = calculateAuraBadges(totalPlanDays, currentUser.currentDay);

  const initials = currentUser.displayName
    ? currentUser.displayName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || currentUser.displayName.slice(0, 2).toUpperCase()
    : 'FP';

  const handlePerformSearch = async (overrideQuery?: string) => {
    const q = (overrideQuery !== undefined ? overrideQuery : searchQuery).trim();
    if (!q) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await searchYouTubeVideosAPI({ query: q, maxResults: 8 });
      setSearchResults(response.results || []);
    } catch (err) {
      console.error('[YouTube Search Error]:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) return;

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
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

        const updated: UserProfile = {
          ...currentUser,
          photoURL: compressedDataUrl,
          avatar: compressedDataUrl,
        };

        onUpdateUser?.(updated);
        saveUserProfile(updated);
        confetti({ particleCount: 40, spread: 60 });
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    const updated: UserProfile = {
      ...currentUser,
      photoURL: '',
      avatar: '',
    };
    onUpdateUser?.(updated);
    saveUserProfile(updated);
  };

  const handleSaveBio = () => {
    const updated: UserProfile = {
      ...currentUser,
      personalization: {
        ...(currentUser.personalization || {
          experienceLevel: 'intermediate',
          learningPace: 'balanced',
          weeklyCommitmentHours: 14,
          dailyGoalDescription: 'Daily deep focus sprint',
          focusDomain: 'Computer Science',
          skillAssessmentScore: 80,
          difficultyTier: 'standard',
        }),
        customGoalText: bioText,
      },
    };
    onUpdateUser?.(updated);
    saveUserProfile(updated);
    setIsEditingBio(false);
    confetti({ particleCount: 30, spread: 50 });
  };

  const handleCopyShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
        {/* Hidden File Input for Avatar Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/gif"
          onChange={handleImageUpload}
          className="hidden"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden relative my-auto transition-colors ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-900 shadow-xl'
              : 'bg-[#0A0E17] border-purple-500/30 text-white shadow-[0_0_50px_rgba(147,51,234,0.15)]'
          }`}
        >
          {/* Header Banner Graphic */}
          <div className="h-32 w-full relative overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-teal-900 p-4 flex items-start justify-between">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-extrabold text-teal-300 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                Verified Flowra Pioneer
              </span>
            </div>

            <button
              onClick={onClose}
              className="relative z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
              title="Close Profile"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Tabs */}
          <div
            className={`px-5 pt-3 pb-2 border-b flex items-center gap-2 ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0E121E] border-zinc-800'
            }`}
          >
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? isLight
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gradient-to-r from-purple-600 to-teal-500 text-white'
                  : isLight
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Pioneer Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('youtube-search')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'youtube-search'
                  ? isLight
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gradient-to-r from-purple-600 to-teal-500 text-white'
                  : isLight
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Youtube className="w-3.5 h-3.5 text-red-500" />
              <span>Creator & Video Search</span>
            </button>
          </div>

          {/* Tab 1: Profile Body */}
          {activeTab === 'profile' && (
            <div className="px-5 pb-6 pt-3 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Avatar & Action Row */}
              <div className="flex items-end justify-between gap-3 -mt-10">
                <div className="relative group">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-teal-400 p-[3px] shadow-2xl cursor-pointer hover:scale-105 transition-all relative overflow-hidden"
                    title="Click to upload/change your profile photo"
                  >
                    <div
                      className={`w-full h-full rounded-[13px] flex items-center justify-center text-2xl font-black relative overflow-hidden ${
                        isLight ? 'bg-white text-purple-700' : 'bg-[#0D121F] text-white'
                      }`}
                    >
                      {currentUser.photoURL || currentUser.avatar ? (
                        <img
                          src={currentUser.photoURL || currentUser.avatar}
                          alt={currentUser.displayName}
                          className="w-full h-full object-cover rounded-[13px]"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="font-mono">{initials}</span>
                      )}

                      {/* Camera overlay on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                        <Camera className="w-5 h-5 text-teal-300" />
                        <span className="text-[8px] font-bold text-teal-200 uppercase tracking-tight">
                          {currentUser.photoURL || currentUser.avatar ? 'Change' : 'Upload'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Camera badge */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teal-500 hover:bg-teal-400 border-2 border-white flex items-center justify-center text-white shadow-md cursor-pointer transition-transform hover:scale-110"
                    title="Upload profile picture"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>

                {/* Share & Streak */}
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={handleCopyShare}
                    className={`p-2.5 rounded-2xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isLight
                        ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                        : 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-300 hover:text-white'
                    }`}
                    title="Share Profile"
                  >
                    {copiedLink ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600 font-bold text-[11px]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span className="text-[11px] font-bold">Share</span>
                      </>
                    )}
                  </button>

                  <div
                    className={`px-3 py-2 rounded-2xl text-xs font-black border flex items-center gap-1.5 shadow-sm ${
                      isLight
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{currentUser.streak}d Streak</span>
                  </div>
                </div>
              </div>

              {/* Profile Identity Details */}
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                  <span>{currentUser.displayName}</span>
                  <CheckCircle2 className="w-4 h-4 text-teal-500 fill-teal-500/20" />
                </h3>
                <div className="flex flex-wrap items-center gap-x-2 text-xs mt-0.5">
                  <span className={`font-bold ${isLight ? 'text-purple-700' : 'text-teal-400'}`}>
                    {currentUser.personalization?.targetRole || currentUser.personalization?.preparingFor || 'Pioneer'}
                  </span>
                  <span className="text-zinc-400">•</span>
                  <span className={isLight ? 'text-slate-600' : 'text-zinc-400'}>
                    {currentUser.personalization?.goal || currentUser.goal || 'General Track'}
                  </span>
                  {currentUser.email && (
                    <>
                      <span className="text-zinc-400">•</span>
                      <span className={`font-mono text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        {currentUser.email}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Focus Mission Statement & Custom Bio */}
              <div
                className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-700 shadow-sm'
                    : 'bg-zinc-950/70 border-zinc-800/90 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className={`flex items-center gap-1 ${isLight ? 'text-purple-700' : 'text-teal-400'}`}>
                    <Target className="w-3.5 h-3.5" />
                    <span>Personal Focus Mission</span>
                  </span>
                  <button
                    onClick={() => setIsEditingBio(!isEditingBio)}
                    className="text-purple-600 hover:text-purple-700 cursor-pointer font-bold"
                  >
                    {isEditingBio ? 'Cancel' : 'Edit Mission'}
                  </button>
                </div>

                {isEditingBio ? (
                  <div className="space-y-2">
                    <textarea
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      rows={3}
                      className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-600'
                          : 'bg-zinc-900 border-zinc-700 text-white focus:border-purple-500'
                      }`}
                      placeholder="Write your custom focus mission or goal summary..."
                    />
                    <button
                      onClick={handleSaveBio}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-teal-500 text-white font-extrabold text-xs cursor-pointer shadow hover:opacity-95"
                    >
                      Save Mission
                    </button>
                  </div>
                ) : (
                  <p className="italic font-medium leading-relaxed">
                    "{bioText}"
                  </p>
                )}

                <div
                  className={`pt-2 border-t flex items-center justify-between text-[10px] ${
                    isLight ? 'border-slate-100 text-slate-500' : 'border-zinc-800/60 text-zinc-400'
                  }`}
                >
                  <span>Flowra Plan: {totalPlanDays} Days Total</span>
                  <span className={`font-mono font-bold ${isLight ? 'text-purple-700' : 'text-teal-400'}`}>
                    {aura} Aura Points
                  </span>
                </div>
              </div>

              {/* Core Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div
                  className={`p-3 rounded-2xl border ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-zinc-900/60 border-zinc-800/80'
                  }`}
                >
                  <div className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-500" />
                    <span>Active Streak</span>
                  </div>
                  <div className="text-base font-extrabold mt-0.5">{currentUser.streak} Days</div>
                </div>

                <div
                  className={`p-3 rounded-2xl border ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-zinc-900/60 border-zinc-800/80'
                  }`}
                >
                  <div className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-500" />
                    <span>Aura XP</span>
                  </div>
                  <div className={`text-base font-extrabold mt-0.5 ${isLight ? 'text-purple-700' : 'text-teal-400'}`}>
                    {aura} XP
                  </div>
                </div>

                <div
                  className={`p-3 rounded-2xl border ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-zinc-900/60 border-zinc-800/80'
                  }`}
                >
                  <div className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-500" />
                    <span>Focus Hours</span>
                  </div>
                  <div className="text-base font-extrabold mt-0.5">
                    {currentUser.totalProductiveHours || 0}h
                  </div>
                </div>

                <div
                  className={`p-3 rounded-2xl border ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-zinc-900/60 border-zinc-800/80'
                  }`}
                >
                  <div className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                    <span>🌱</span>
                    <span>Companion</span>
                  </div>
                  <div className="text-xs font-extrabold mt-0.5 truncate">
                    {currentUser.companion?.name || 'Sprout'} (Lv.{currentUser.companion?.level || 1})
                  </div>
                </div>
              </div>

              {/* Photo Management Actions */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all hover:opacity-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>{currentUser.photoURL || currentUser.avatar ? 'Change Profile Image' : 'Upload Profile Image'}</span>
                </button>

                {(currentUser.photoURL || currentUser.avatar) && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className={`px-3 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      isLight
                        ? 'bg-white hover:bg-rose-50 text-rose-600 border-slate-200'
                        : 'bg-zinc-800 hover:bg-rose-950/60 text-zinc-300 hover:text-rose-300 border-zinc-700'
                    }`}
                    title="Remove Profile Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Creator & Video Search Section */}
          {activeTab === 'youtube-search' && (
            <div className="px-5 pb-6 pt-3 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Search Bar Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold flex items-center gap-1.5">
                    <Youtube className="w-4 h-4 text-red-500" />
                    <span>Search Creators, Topics & Lecture Series</span>
                  </label>
                  <span className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    YouTube Data API v3
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handlePerformSearch();
                      }}
                      placeholder="Type creator name (e.g. Huberman, Ali Abdaal, Fireship) or topic..."
                      className={`w-full pl-9 pr-3 py-2.5 rounded-2xl border text-xs focus:outline-none transition-all ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 shadow-xs'
                          : 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-500'
                      }`}
                    />
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  </div>

                  <button
                    onClick={() => handlePerformSearch()}
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 hover:opacity-95 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  >
                    {isSearching ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>{isSearching ? 'Searching...' : 'Search'}</span>
                  </button>
                </div>

                {/* Quick Creator Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
                  {[
                    'Andrew Huberman',
                    'Ali Abdaal',
                    'Fireship',
                    'freeCodeCamp',
                    'NeetCode DSA',
                    'Lex Fridman',
                    'Deep Focus Lofi',
                  ].map((creator, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSearchQuery(creator);
                        handlePerformSearch(creator);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                        isLight
                          ? 'bg-white hover:bg-purple-50 border-slate-200 text-slate-700 hover:text-purple-700 shadow-xs'
                          : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-white'
                      }`}
                    >
                      ⚡ {creator}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Embedded Player */}
              {activeVideoId && (
                <div
                  className={`rounded-2xl border overflow-hidden p-2 space-y-2 shadow-lg animate-fadeIn ${
                    isLight ? 'bg-white border-slate-200' : 'bg-zinc-950 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold truncate max-w-[280px]">
                      Now Playing: {activeVideoTitle}
                    </span>
                    <button
                      onClick={() => setActiveVideoId(null)}
                      className="text-xs text-zinc-400 hover:text-red-500 font-bold cursor-pointer"
                    >
                      Close Player
                    </button>
                  </div>
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1`}
                      title={activeVideoTitle}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isSearching && (
                <div
                  className={`p-8 rounded-3xl border flex flex-col items-center justify-center text-center space-y-2 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <RefreshCw className="w-7 h-7 text-purple-600 animate-spin" />
                  <div className="text-xs font-bold">Querying YouTube Data API v3...</div>
                  <p className="text-[11px] text-zinc-400">Fetching matching creator lectures and view statistics.</p>
                </div>
              )}

              {/* Empty State */}
              {!isSearching && hasSearched && searchResults.length === 0 && (
                <div
                  className={`p-6 rounded-2xl border text-center space-y-2 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <p className="text-xs font-bold">No videos found for "{searchQuery}".</p>
                  <p className="text-[11px] text-zinc-400">Try searching for a creator name or broader topic.</p>
                </div>
              )}

              {/* Video Cards Grid */}
              {!isSearching && searchResults.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 px-1">
                    <span>Matching Results ({searchResults.length})</span>
                    <span>Tap card to play embed</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {searchResults.map((video) => (
                      <div
                        key={video.id}
                        onClick={() => {
                          setActiveVideoId(video.id);
                          setActiveVideoTitle(video.title);
                        }}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 group ${
                          isLight
                            ? 'bg-white hover:bg-purple-50/50 border-slate-200 hover:border-purple-300 shadow-sm'
                            : 'bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800 hover:border-purple-500/40'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                              <Play className="w-4 h-4 fill-white ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-white">
                            {video.durationStr}
                          </span>
                        </div>

                        {/* Title & Creator */}
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold line-clamp-2 leading-snug group-hover:text-purple-600 transition-colors">
                            {video.title}
                          </h4>
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5">
                            <span className="font-semibold truncate max-w-[120px]">{video.channelTitle}</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Eye className="w-3 h-3" />
                              {video.viewCount}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[10px]">
                          <span className="text-teal-600 font-bold flex items-center gap-1">
                            <Play className="w-3 h-3 fill-teal-600" />
                            <span>Play In App</span>
                          </span>

                          <a
                            href={video.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-zinc-400 hover:text-red-500 flex items-center gap-0.5"
                          >
                            <span>Open on YouTube</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
