import React, { useState } from 'react';
import { ThemeMode } from '../types';
import {
  Settings,
  X,
  Sun,
  Moon,
  Shield,
  Bell,
  LogOut,
  LogIn,
  User,
  Sparkles,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Code2,
  Copy,
  Check,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  selectedPaletteId?: string;
  onPaletteChange?: (paletteId: string) => void;
  negativeNotificationsEnabled: boolean;
  onToggleNegativeNotifications: (enabled: boolean) => void;
  isGuest: boolean;
  userEmail?: string;
  userDisplayName?: string;
  onGoogleSignIn: () => Promise<void>;
  onSignOut: () => void;
  onOpenBedtime: () => void;
  onOpenCreatorProfile?: () => void;
  onDeleteAccount?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  themeMode,
  onThemeModeChange,
  negativeNotificationsEnabled,
  onToggleNegativeNotifications,
  isGuest,
  userEmail,
  userDisplayName,
  onGoogleSignIn,
  onSignOut,
  onOpenBedtime,
  onOpenCreatorProfile,
  onDeleteAccount,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

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

  if (!isOpen) return null;

  const handleDeleteAccountConfirm = () => {
    setShowDeleteConfirm(false);
    if (onDeleteAccount) {
      onDeleteAccount();
    } else {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleGoogleSync = async () => {
    setSyncError(null);
    setIsSyncing(true);
    try {
      await onGoogleSignIn();
    } catch (e: any) {
      console.error('[SettingsModal Google Sync Error]:', e);
      setSyncError(e?.message || 'Google Sign-In failed. Please check browser popups and try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-xl max-h-[90vh] rounded-3xl p-5 sm:p-6 shadow-2xl border flex flex-col overflow-hidden ${
          themeMode === 'light'
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[#0B0F17] border-zinc-800 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                <span>Flowra Settings</span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Display theme mode • Alerts • Account & Cloud sync
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto my-3 pr-1 flex flex-col gap-4">
          {/* 1. Theme Display Mode (Dark, Light) */}
          <div
            className={`p-4 rounded-2xl border flex flex-col gap-2.5 ${
              themeMode === 'light' ? 'bg-zinc-100/80 border-zinc-200' : 'bg-zinc-900/80 border-zinc-800'
            }`}
          >
            <div className={`text-xs font-bold flex items-center gap-1.5 ${themeMode === 'light' ? 'text-zinc-900' : 'text-white'}`}>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Display Theme Mode</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'dark' as ThemeMode, label: '🌙 Dark Mode', desc: 'OLED Obsidian' },
                { id: 'light' as ThemeMode, label: '☀️ Light Mode', desc: 'Crisp White' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onThemeModeChange(opt.id)}
                  className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    themeMode === opt.id
                      ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-md'
                      : themeMode === 'light'
                      ? 'bg-white border-zinc-300 text-zinc-600 hover:text-zinc-900'
                      : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Negative Notifications & Screen-Time Interception */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              themeMode === 'light' ? 'bg-zinc-100/80 border-zinc-200' : 'bg-zinc-900/80 border-zinc-800'
            }`}
          >
            <div>
              <div className={`text-xs font-bold flex items-center gap-1.5 ${themeMode === 'light' ? 'text-zinc-900' : 'text-white'}`}>
                <Bell className="w-3.5 h-3.5 text-rose-400" />
                <span>Negative Notifications Alert</span>
              </div>
              <div className={`text-[10px] mt-0.5 ${themeMode === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Alerts you when screen-time is wasted on non-productive feeds.
              </div>
            </div>

            <input
              type="checkbox"
              checked={negativeNotificationsEnabled}
              onChange={(e) => onToggleNegativeNotifications(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* 3. Account & Cloud Sync */}
          <div
            className={`p-4 rounded-2xl border flex flex-col gap-2 ${
              themeMode === 'light' ? 'bg-zinc-100/80 border-zinc-200' : 'bg-zinc-900/80 border-zinc-800'
            }`}
          >
            <div className={`text-xs font-bold flex items-center justify-between ${themeMode === 'light' ? 'text-zinc-900' : 'text-white'}`}>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Account & Cloud Sync</span>
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isGuest
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isGuest ? 'Guest (Local Cache)' : 'Cloud Synced'}
              </span>
            </div>

            {isGuest ? (
              <div className="flex flex-col gap-2 mt-1">
                <p className="text-[11px] text-zinc-400">
                  You are currently using Flowra in Guest mode. Sign in with Google to sync all your local Aura, roadmap, and companion data to Cloud Firestore immediately!
                </p>
                <button
                  onClick={handleGoogleSync}
                  disabled={isSyncing}
                  className="w-full p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isSyncing ? 'Connecting to Google...' : 'Sign In with Google (Sync All Data)'}</span>
                </button>
                {syncError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs flex flex-col gap-2 mt-1 text-left">
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
            ) : (
              <div className="flex items-center justify-between mt-1">
                <div>
                  <div className="text-xs font-bold text-white">{userDisplayName || 'Active User'}</div>
                  <div className="text-[10px] text-zinc-400">{userEmail}</div>
                </div>
                <button
                  onClick={onSignOut}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-950/60 hover:text-rose-300 text-zinc-300 text-xs font-bold border border-zinc-700 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* 5. Account Delete & Wipe Data Option */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Account & Reset All Data</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">
                Irreversible
              </span>
            </div>

            <p className="text-[11px] text-zinc-400">
              Permanently wipe all locally cached progress, active roadmaps, streak history, companion growth, and start completely fresh.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="mt-1 py-2 px-3 rounded-xl bg-rose-900/40 hover:bg-rose-900/70 border border-rose-700/50 text-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account & Clear Memory</span>
              </button>
            ) : (
              <div className="mt-2 p-3 rounded-xl bg-rose-950/80 border border-rose-600/80 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Are you sure? All streak, aura and companion data will be deleted!</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccountConfirm}
                    className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold cursor-pointer"
                  >
                    Yes, Delete Everything
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
