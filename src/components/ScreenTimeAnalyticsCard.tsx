import React, { useState, useEffect } from 'react';
import { ThemeMode, AppUsageItem } from '../types';
import {
  Smartphone,
  BarChart2,
  AlertTriangle,
  Zap,
  TrendingDown,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import {
  fetchUserTodayAppLogs,
  logUserAppUsage,
  deleteUserAppLog,
  DailyAppLogEntry,
  getTodayDateString,
  detectIsProductive,
  getAppBrandColor,
} from '../lib/firebase';
import confetti from 'canvas-confetti';

interface ScreenTimeAnalyticsCardProps {
  userId?: string;
  plannedDays?: number;
  onTriggerIntervention?: (app: string, minutes: number) => void;
  themeMode?: ThemeMode;
  onAppLogged?: () => void;
}

const QUICK_APP_PRESETS = [
  { name: 'Instagram Reels', category: 'Social Media', defaultMins: 35, isProductive: false, color: '#EC4899' },
  { name: 'YouTube Shorts', category: 'Video Stream', defaultMins: 25, isProductive: false, color: '#EF4444' },
  { name: 'Flowra Study Lab', category: 'Education', defaultMins: 60, isProductive: true, color: '#10B981' },
  { name: 'VS Code & Compiler', category: 'Deep Work', defaultMins: 90, isProductive: true, color: '#38BDF8' },
  { name: 'LeetCode Practice', category: 'Coding', defaultMins: 45, isProductive: true, color: '#FFA116' },
  { name: 'Notion Workspace', category: 'Organization', defaultMins: 30, isProductive: true, color: '#E2E8F0' },
  { name: 'Reddit Doomscroll', category: 'Social Feeds', defaultMins: 25, isProductive: false, color: '#F97316' },
  { name: 'Kindle Reader', category: 'Books', defaultMins: 40, isProductive: true, color: '#A855F7' },
  { name: 'WhatsApp Chats', category: 'Messaging', defaultMins: 20, isProductive: false, color: '#22C55E' },
  { name: 'TikTok Videos', category: 'Social Media', defaultMins: 30, isProductive: false, color: '#00F2FE' },
  { name: 'ChatGPT & Research', category: 'Education', defaultMins: 35, isProductive: true, color: '#10A37F' },
  { name: 'Duolingo Practice', category: 'Language', defaultMins: 15, isProductive: true, color: '#58CC02' },
];

export const ScreenTimeAnalyticsCard: React.FC<ScreenTimeAnalyticsCardProps> = ({
  userId = 'local_user',
  plannedDays = 180,
  onTriggerIntervention,
  themeMode = 'dark',
  onAppLogged,
}) => {
  const [logs, setLogs] = useState<DailyAppLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Form state for logging a new app
  const [appNameInput, setAppNameInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Education');
  const [minutesInput, setMinutesInput] = useState(30);
  const [customProductiveOverride, setCustomProductiveOverride] = useState<boolean | null>(null);

  const loadTodayLogs = async () => {
    setLoading(true);
    try {
      const todayLogs = await fetchUserTodayAppLogs(userId, getTodayDateString());
      setLogs(todayLogs);
    } catch (e) {
      console.warn('Error fetching daily logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayLogs();
  }, [userId]);

  // Aggregate by app name to sum multiple logs of the same app today
  const aggregatedMap: Record<string, AppUsageItem & { latestLogId?: string }> = {};

  logs.forEach((log) => {
    const key = log.appName.toLowerCase().trim();
    if (!aggregatedMap[key]) {
      aggregatedMap[key] = {
        appName: log.appName,
        minutesSpent: log.minutesSpent,
        category: log.category,
        isProductive: log.isProductive,
        color: log.color || getAppBrandColor(log.appName, log.category, log.isProductive),
        latestLogId: log.id,
      };
    } else {
      aggregatedMap[key].minutesSpent += log.minutesSpent;
    }
  });

  const sortedApps = Object.values(aggregatedMap).sort((a, b) => b.minutesSpent - a.minutesSpent);
  const top3Apps = sortedApps.slice(0, 3);
  const totalScreenTime = sortedApps.reduce((acc, a) => acc + a.minutesSpent, 0);
  const totalProductiveMins = sortedApps.filter((a) => a.isProductive).reduce((acc, a) => acc + a.minutesSpent, 0);
  const totalNonProductiveMins = sortedApps.filter((a) => !a.isProductive).reduce((acc, a) => acc + a.minutesSpent, 0);
  const maxMins = Math.max(...sortedApps.map((a) => a.minutesSpent), 60);

  // Find the top non-productive app for intervention drill
  const worstApp = sortedApps.find((a) => !a.isProductive);

  const handleSaveAppLog = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!appNameInput.trim() || minutesInput <= 0) return;

    const isProductive =
      customProductiveOverride !== null
        ? customProductiveOverride
        : detectIsProductive(appNameInput, categoryInput);

    const newEntry = await logUserAppUsage(userId, {
      appName: appNameInput.trim(),
      category: categoryInput.trim(),
      minutesSpent: minutesInput,
      isProductive,
      color: getAppBrandColor(appNameInput, categoryInput, isProductive),
    });

    setLogs((prev) => [newEntry, ...prev]);
    setIsLogModalOpen(false);
    setAppNameInput('');
    setMinutesInput(30);
    setCustomProductiveOverride(null);
    onAppLogged?.();

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  const handleQuickPresetSelect = (preset: (typeof QUICK_APP_PRESETS)[0]) => {
    setAppNameInput(preset.name);
    setCategoryInput(preset.category);
    setMinutesInput(preset.defaultMins);
    setCustomProductiveOverride(preset.isProductive);
  };

  const handleDeleteLog = async (logId?: string) => {
    if (!logId) return;
    await deleteUserAppLog(userId, logId);
    setLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  return (
    <div
      className={`rounded-3xl p-4 sm:p-5 border transition-all ${
        themeMode === 'light'
          ? 'bg-white border-zinc-200 shadow-sm text-zinc-900'
          : 'bg-[#0E131C] border-zinc-800 text-white'
      }`}
    >
      {/* Header with App Name, Planned Days Badge, and Live Telemetry */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b ${themeMode === 'light' ? 'border-zinc-200' : 'border-zinc-800/60'}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-extrabold ${themeMode === 'light' ? 'text-zinc-900' : 'text-white'}`}>Flowra Screen-Time Radar</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/40">
                {plannedDays}-Day Plan
              </span>
            </div>
            <p className={`text-[10px] ${themeMode === 'light' ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {totalScreenTime > 0
                ? `Logged today: ${totalScreenTime}m total screen time across ${sortedApps.length} apps`
                : 'No apps logged today • Real-time per-user sync'}
            </p>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {totalScreenTime > 0 && (
            <>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-rose-400" />
                <span>{totalNonProductiveMins}m wasted</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>{totalProductiveMins}m focus</span>
              </span>
            </>
          )}

          <button
            onClick={() => setIsLogModalOpen(true)}
            id="open-log-app-button"
            className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-400 text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log App</span>
          </button>
        </div>
      </div>

      {/* Negative Notification Warning Banner (When non-productive time >= 25 mins) */}
      {totalNonProductiveMins >= 25 && worstApp && (
        <div className="mt-3 p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                <span>Negative Notification Alert</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-rose-500/20 rounded-md border border-rose-500/30 text-rose-200">
                  {totalNonProductiveMins}m Non-Productive
                </span>
              </div>
              <p className={`text-[11px] ${themeMode === 'light' ? 'text-zinc-700' : 'text-zinc-300'} mt-0.5`}>
                ⚠️ You spent <span className="font-bold text-rose-400">{totalNonProductiveMins} mins</span> on passive apps today ({worstApp.appName}). Switch to a 5-min dopamine drill now!
              </p>
            </div>
          </div>

          <button
            onClick={() => onTriggerIntervention?.(worstApp.appName, totalNonProductiveMins)}
            id="dopamine-switch-trigger"
            className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shrink-0 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Dopamine Switch</span>
          </button>
        </div>
      )}

      {/* SECTION 1: MOST USED APPS */}
      {sortedApps.length === 0 ? (
        /* Empty State Prompt (No placeholder data) */
        <div className={`mt-3.5 p-6 rounded-2xl ${themeMode === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/70 border-zinc-800/80'} border text-center flex flex-col items-center justify-center gap-2.5`}>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className={`text-xs font-extrabold ${themeMode === 'light' ? 'text-zinc-900' : 'text-white'}`}>No App Usage Logged Today</h4>
            <p className={`text-[11px] ${themeMode === 'light' ? 'text-zinc-500' : 'text-zinc-400'} max-w-xs mt-0.5 leading-relaxed`}>
              Track your real screen-time habits. Log an app usage session to calculate your dopamine ratio and unlock custom intervention drills.
            </p>
          </div>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="mt-1 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Your First App Usage</span>
          </button>
        </div>
      ) : (
        /* DYNAMIC MOST USED APPS */
        <div className={`mt-3.5 p-3.5 rounded-2xl ${themeMode === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/70 border-zinc-800/80'} border`}>
          <div className="flex items-center justify-between mb-2.5">
            <div className={`flex items-center gap-1.5 text-xs font-extrabold ${themeMode === 'light' ? 'text-zinc-900' : 'text-white'}`}>
              <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Most Used Apps</span>
            </div>
            <span className={`text-[10px] ${themeMode === 'light' ? 'text-zinc-500' : 'text-zinc-400'}`}>Top {top3Apps.length} Highlighted (Today's Logs)</span>
          </div>

          {/* Top 3 App Bar Visualizers */}
          <div className="flex flex-col gap-2.5">
            {top3Apps.map((app, idx) => (
              <div key={app.appName} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-black flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className={`font-bold ${themeMode === 'light' ? 'text-zinc-900' : 'text-white'}`}>{app.appName}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                        app.isProductive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {app.category}
                    </span>
                  </div>
                  <span className={`font-mono font-bold text-xs ${themeMode === 'light' ? 'text-zinc-700' : 'text-zinc-200'}`}>{app.minutesSpent} mins</span>
                </div>

                {/* Progress Bar */}
                <div className={`w-full h-2.5 rounded-full ${themeMode === 'light' ? 'bg-zinc-200 border-zinc-300' : 'bg-zinc-900 border-zinc-800'} overflow-hidden border`}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(app.minutesSpent > 0 ? 5 : 0, (app.minutesSpent / maxMins) * 100))}%`,
                      backgroundColor: app.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pull-down Arrow Button for All Apps in Descending Order */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            id="toggle-app-breakdown-button"
            className="mt-3 w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-700/60 text-xs font-extrabold text-cyan-300 flex items-center justify-between transition-all cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {isExpanded
                  ? 'Collapse App Breakdown'
                  : `View All ${sortedApps.length} Logged Apps (Ranked #1 to #${sortedApps.length})`}
              </span>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-cyan-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          {/* Expandable Descending List of All Apps */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold px-1">
                <span>All Logged Apps (Ranked #1 to #{sortedApps.length})</span>
                <span>Category & Time</span>
              </div>

              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                {sortedApps.map((app, idx) => (
                  <div
                    key={app.appName}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition-all ${
                      idx < 3
                        ? 'bg-cyan-950/20 border-cyan-500/30'
                        : 'bg-zinc-900/70 border-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                            idx < 3 ? 'bg-cyan-500 text-black font-black' : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: app.color }} />
                        <span className="font-bold text-white">{app.appName}</span>
                        <span className="text-[10px] text-zinc-400 hidden sm:inline">({app.category})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${
                            app.isProductive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {app.isProductive ? 'Productive' : 'Non-Productive'}
                        </span>
                        <span className="font-mono font-bold text-xs text-zinc-200">
                          {app.minutesSpent}m
                        </span>
                        {app.latestLogId && (
                          <button
                            onClick={() => handleDeleteLog(app.latestLogId)}
                            className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete this log"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800/70">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.max(4, (app.minutesSpent / maxMins) * 100))}%`,
                          backgroundColor: app.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Add Log Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0A0E17] border border-cyan-500/30 rounded-3xl p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Log App Screen Time</h3>
                  <p className="text-[10px] text-zinc-400">Track today's digital usage in Firestore</p>
                </div>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Popular App Presets */}
            <div>
              <label className="text-[11px] font-bold text-zinc-400 block mb-1.5">
                Quick App Presets:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {QUICK_APP_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleQuickPresetSelect(p)}
                    className={`text-[10px] px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                      appNameInput === p.name
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {p.name} ({p.defaultMins}m)
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSaveAppLog} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">App Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Instagram Reels, VS Code, LeetCode"
                  value={appNameInput}
                  onChange={(e) => setAppNameInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Category:</label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Education">Education</option>
                    <option value="Deep Work">Deep Work</option>
                    <option value="Coding">Coding</option>
                    <option value="Books">Books</option>
                    <option value="Organization">Organization</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Video Stream">Video Stream</option>
                    <option value="Social Feeds">Social Feeds</option>
                    <option value="Messaging">Messaging</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                    Minutes Spent: ({minutesInput}m)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="720"
                    required
                    value={minutesInput}
                    onChange={(e) => setMinutesInput(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Quick minute pills */}
              <div className="flex gap-1.5">
                {[15, 30, 45, 60, 90, 120].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMinutesInput(m)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-mono border ${
                      minutesInput === m
                        ? 'bg-cyan-500 text-black font-black border-cyan-400'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="submit-app-log-button"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save App Usage Log</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
