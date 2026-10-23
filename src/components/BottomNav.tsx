import React from 'react';
import { motion } from 'motion/react';
import { Home, Compass, Users, User, Bot } from 'lucide-react';
import { ThemeMode } from '../types';

export type TabType = 'home' | 'journey' | 'community' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenChat: () => void;
  themeMode?: ThemeMode;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenChat,
  themeMode = 'dark',
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'journey' as TabType, label: 'Journey', icon: Compass },
    { id: 'community' as TabType, label: 'Community', icon: Users },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl border-t px-3 py-2 transition-colors ${
        themeMode === 'light'
          ? 'bg-white/95 border-zinc-200 text-zinc-900 shadow-lg'
          : 'bg-[#0A0D14]/95 border-emerald-500/20 text-white shadow-2xl'
      }`}
    >
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        {/* Floating AI Mentor Center Trigger */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.06 }}
            onClick={onOpenChat}
            id="floating-ai-mentor-button"
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-[2px] shadow-[0_0_22px_rgba(16,185,129,0.55)] cursor-pointer flex items-center justify-center group"
            title="Open 24/7 AI Growth Mentor"
          >
            <div className="w-full h-full bg-[#10141E] group-hover:bg-[#161D2B] rounded-[14px] flex flex-col items-center justify-center transition-colors">
              <Bot className="w-5 h-5 text-emerald-300 group-hover:text-emerald-200 animate-pulse" />
              <span className="text-[8px] font-black text-emerald-300 tracking-tighter">AI</span>
            </div>
          </motion.button>
        </div>

        {/* 4 Tabs */}
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isLeft = idx < 2;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
                isLeft && idx === 1 ? 'mr-5' : ''
              } ${!isLeft && idx === 2 ? 'ml-5' : ''} ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-zinc-500 hover:text-zinc-300 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#10B981]"
                  />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
