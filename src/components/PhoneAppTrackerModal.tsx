import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Smartphone,
  X,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  RefreshCw,
  Plus,
  Play,
} from 'lucide-react';
import { AppUsageItem, UserProfile } from '../types';

interface PhoneAppTrackerModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLogs: (newLogs: AppUsageItem[], newScore: number) => void;
  onTriggerIntervention: (appName: string, mins: number) => void;
}

export const initialAppUsage: AppUsageItem[] = [
  { id: 'app-1', appName: 'Instagram Reels', category: 'social', minutes: 42, iconName: '📸', color: '#E1306C' },
  { id: 'app-2', appName: 'TikTok', category: 'social', minutes: 28, iconName: '🎵', color: '#00F2FE' },
  { id: 'app-3', appName: 'YouTube Deep Study', category: 'learning', minutes: 45, iconName: '▶️', color: '#FF0000' },
  { id: 'app-4', appName: 'LeetCode / Practice Lab', category: 'learning', minutes: 35, iconName: '💻', color: '#FFA116' },
  { id: 'app-5', appName: 'Notion & Docs', category: 'productivity', minutes: 25, iconName: '📝', color: '#6366F1' },
  { id: 'app-6', appName: 'X (Twitter)', category: 'social', minutes: 18, iconName: '🐦', color: '#38BDF8' },
];

export const PhoneAppTrackerModal: React.FC<PhoneAppTrackerModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateLogs,
  onTriggerIntervention,
}) => {
  const [logs, setLogs] = useState<AppUsageItem[]>(initialAppUsage);
  const [isSimulatingSync, setIsSimulatingSync] = useState(false);

  if (!isOpen) return null;

  // Calculate stats
  const totalMins = logs.reduce((acc, curr) => acc + curr.minutes, 0);
  const socialMins = logs.filter((l) => l.category === 'social').reduce((acc, curr) => acc + curr.minutes, 0);
  const learningMins = logs.filter((l) => l.category === 'learning').reduce((acc, curr) => acc + curr.minutes, 0);
  const productivityMins = logs.filter((l) => l.category === 'productivity').reduce((acc, curr) => acc + curr.minutes, 0);

  const productiveTotal = learningMins + productivityMins;
  const meaningfulScoreCalculated = Math.min(
    100,
    Math.max(10, Math.round(((learningMins * 1.4 + productivityMins * 1.0) / (totalMins || 1)) * 100))
  );

  const handleMinuteChange = (id: string, delta: number) => {
    const updated = logs.map((item) => {
      if (item.id === id) {
        return { ...item, minutes: Math.max(0, item.minutes + delta) };
      }
      return item;
    });
    setLogs(updated);
    const newTotal = updated.reduce((a, b) => a + b.minutes, 0);
    const newLearn = updated.filter((l) => l.category === 'learning').reduce((a, b) => a + b.minutes, 0);
    const newProd = updated.filter((l) => l.category === 'productivity').reduce((a, b) => a + b.minutes, 0);
    const newScore = Math.min(100, Math.max(10, Math.round(((newLearn * 1.4 + newProd * 1.0) / (newTotal || 1)) * 100)));
    onUpdateLogs(updated, newScore);
  };

  const handleSimulateDeviceImport = () => {
    setIsSimulatingSync(true);
    setTimeout(() => {
      // Simulate modern day phone screen usage
      const simulated: AppUsageItem[] = [
        { id: 'app-1', appName: 'Instagram Reels', category: 'social', minutes: 55, iconName: '📸', color: '#E1306C' },
        { id: 'app-2', appName: 'TikTok', category: 'social', minutes: 35, iconName: '🎵', color: '#00F2FE' },
        { id: 'app-3', appName: 'YouTube Deep Study', category: 'learning', minutes: 60, iconName: '▶️', color: '#FF0000' },
        { id: 'app-4', appName: 'Practice Lab / Drills', category: 'learning', minutes: 40, iconName: '💻', color: '#FFA116' },
        { id: 'app-5', appName: 'Notion & Reading', category: 'productivity', minutes: 30, iconName: '📝', color: '#6366F1' },
        { id: 'app-6', appName: 'X (Twitter)', category: 'social', minutes: 20, iconName: '🐦', color: '#38BDF8' },
      ];
      setLogs(simulated);
      setIsSimulatingSync(false);
      onUpdateLogs(simulated, 78);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#141418] border border-purple-500/25 rounded-3xl p-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Phone App Data Record</h3>
              <p className="text-[10px] text-zinc-400">Live Device Screen-Time Simulator & Balance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Sync / Import Button */}
        <div className="mt-3 flex items-center justify-between p-3 rounded-2xl bg-[#0A0A0A] border border-purple-500/20">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-xs font-bold text-white">Daily Screen Time Sync</div>
              <div className="text-[10px] text-zinc-400">Total Logged: {(totalMins / 60).toFixed(1)} hrs today</div>
            </div>
          </div>
          <button
            onClick={handleSimulateDeviceImport}
            disabled={isSimulatingSync}
            className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 font-semibold text-xs border border-purple-500/30 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingSync ? 'animate-spin' : ''}`} />
            <span>{isSimulatingSync ? 'Syncing...' : 'Sync Device Data'}</span>
          </button>
        </div>

        {/* Score & Ratio Highlight */}
        <div className="grid grid-cols-2 gap-2.5 my-3">
          <div className="p-3 rounded-2xl bg-teal-950/30 border border-teal-800/40">
            <div className="flex items-center justify-between text-xs text-teal-300 font-bold">
              <span>Meaningful Score</span>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{meaningfulScoreCalculated}%</div>
            <div className="text-[10px] text-teal-400/80 mt-0.5">High Intentionality</div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-800/40">
            <div className="flex items-center justify-between text-xs text-rose-300 font-bold">
              <span>Passive Scroll Time</span>
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{socialMins} min</div>
            <div className="text-[10px] text-rose-400/80 mt-0.5">Needs dopamine swap</div>
          </div>
        </div>

        {/* App List Entries */}
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {logs.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-2xl bg-[#0A0A0A] border border-zinc-800/80 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{item.iconName}</span>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {item.appName}
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-md font-semibold ${
                        item.category === 'learning'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : item.category === 'productivity'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400">{item.minutes} minutes logged</div>
                </div>
              </div>

              {/* Adjust minutes buttons & Trigger intervention */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleMinuteChange(item.id, -5)}
                  className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <button
                  onClick={() => handleMinuteChange(item.id, 5)}
                  className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold flex items-center justify-center cursor-pointer"
                >
                  +
                </button>

                {item.category === 'social' && item.minutes >= 20 && (
                  <button
                    onClick={() => {
                      onClose();
                      onTriggerIntervention(item.appName, item.minutes);
                    }}
                    className="ml-1 px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-bold border border-purple-500/30 flex items-center gap-1 cursor-pointer"
                    title="Simulate Proactive AI Intervention"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Swap</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Proactive Behavioral Smart Insight */}
        <div className="mt-3 p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-200">
          <div className="font-bold text-white flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Dopamine Replacement Insight:</span>
          </div>
          You logged <span className="text-rose-400 font-bold">{socialMins} min</span> of passive feeds. Swapping just 10 mins into your 180-day goal earns 40 XP and gives a fresh food bowl to your companion!
        </div>
      </div>
    </div>
  );
};
