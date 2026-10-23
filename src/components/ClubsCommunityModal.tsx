import React, { useState } from 'react';
import { ClubGroup, CommunityGroup, WeeklyProject, ThemeMode } from '../types';
import { sendClubNudgeAPI } from '../services/api';
import {
  Users,
  Search,
  Plus,
  Flame,
  X,
  Award,
  Bell,
  Lock,
  Globe,
  MessageSquare,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Send,
  HelpCircle,
  FileCode,
  Zap,
  UserPlus,
  Shield,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ClubsCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  userDisplayName: string;
  userStreak: number;
  userGoal: string;
  themeMode?: ThemeMode;
}

export const ClubsCommunityModal: React.FC<ClubsCommunityModalProps> = ({
  isOpen,
  onClose,
  userDisplayName,
  userStreak,
  userGoal,
  themeMode = 'dark',
}) => {
  const [activeTab, setActiveTab] = useState<'clubs' | 'create-club' | 'projects'>('clubs');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Clubs
  const [clubs, setClubs] = useState<any[]>([
    {
      id: 'club-1',
      name: '🔥 Elite 150-Day Placement Titans',
      description: 'Daily LeetCode Blind-75 sprints, OS/DBMS mock battles, and zero-doomscrolling accountability.',
      creatorName: 'Aarya Sharma',
      planGoal: 'Placement & Tech Prep',
      dailyAverageStreak: 18,
      members: [
        { displayName: 'Aarya Sharma', aura: 940, streak: 22, daysMissed: 0 },
        { displayName: 'Kavya Nair', aura: 820, streak: 19, daysMissed: 0 },
        { displayName: 'Rohit Gupta', aura: 450, streak: 8, daysMissed: 2 },
      ],
    },
    {
      id: 'club-2',
      name: '🤖 AI Research & Neural Builders',
      description: 'Building PyTorch mini-models, fine-tuning LLMs, and breaking dopamine phone addiction together.',
      creatorName: 'Sara Chen',
      planGoal: 'Learn AI/ML & LLMs',
      dailyAverageStreak: 25,
      members: [
        { displayName: 'Sara Chen', aura: 1200, streak: 30, daysMissed: 0 },
        { displayName: 'Dev Patel', aura: 1050, streak: 26, daysMissed: 0 },
        { displayName: 'Alex Mercer', aura: 320, streak: 5, daysMissed: 3 },
      ],
    },
    {
      id: 'club-3',
      name: '📚 Monastic Deep Readers Circle',
      description: '20 pages a day minimum. Atomic Habits, Deep Work, Meditations. Weekly synthesis breakdowns.',
      creatorName: 'David Miller',
      planGoal: 'Read More Books',
      dailyAverageStreak: 15,
      members: [
        { displayName: 'David Miller', aura: 780, streak: 16, daysMissed: 0 },
        { displayName: 'Priya Joshi', aura: 690, streak: 14, daysMissed: 1 },
      ],
    },
  ]);

  // Create Club Form State
  const [newClubName, setNewClubName] = useState('');
  const [newClubCategory, setNewClubCategory] = useState('Competitive Leaderboard');
  const [newClubDescription, setNewClubDescription] = useState('');
  const [invitedMembersInput, setInvitedMembersInput] = useState('');
  const [invitedMemberList, setInvitedMemberList] = useState<string[]>([]);
  const [isPrivateClub, setIsPrivateClub] = useState(false);

  // Nudge State
  const [nudgeStatus, setNudgeStatus] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleAddInvitedMember = () => {
    if (!invitedMembersInput.trim()) return;
    if (!invitedMemberList.includes(invitedMembersInput.trim())) {
      setInvitedMemberList([...invitedMemberList, invitedMembersInput.trim()]);
    }
    setInvitedMembersInput('');
  };

  const handleRemoveInvitedMember = (member: string) => {
    setInvitedMemberList(invitedMemberList.filter((m) => m !== member));
  };

  const handleCreateClubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim()) return;

    const initialMembers = [
      { displayName: userDisplayName || 'Club Owner (You)', aura: 50, streak: userStreak || 1, daysMissed: 0 },
      ...invitedMemberList.map((m) => ({ displayName: m, aura: 25, streak: 1, daysMissed: 0 })),
    ];

    const createdClub = {
      id: `club-${Date.now()}`,
      name: newClubName.trim(),
      description: newClubDescription.trim() || 'Custom Flowra study squad dedicated to daily progress.',
      creatorName: userDisplayName || 'You',
      planGoal: newClubCategory,
      dailyAverageStreak: Math.max(1, userStreak),
      members: initialMembers,
    };

    setClubs([createdClub, ...clubs]);
    setActiveTab('clubs');

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Reset Form
    setNewClubName('');
    setNewClubDescription('');
    setInvitedMemberList([]);
    setInvitedMembersInput('');
  };

  const handleSendNudge = async (clubName: string, recipientName: string, daysMissed: number) => {
    try {
      await sendClubNudgeAPI({
        senderName: userDisplayName || 'You',
        recipientName,
        recipientDaysMissed: daysMissed,
        clubName,
        senderStreak: userStreak,
      });

      setNudgeStatus((prev) => ({
        ...prev,
        [recipientName]: `⚡ Nudge sent to ${recipientName} to save their streak!`,
      }));

      confetti({
        particleCount: 40,
        spread: 50,
      });
    } catch (e) {
      setNudgeStatus((prev) => ({
        ...prev,
        [recipientName]: `⚡ Nudge sent!`,
      }));
    }
  };

  const filteredClubs = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.planGoal.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] rounded-3xl p-5 sm:p-6 border shadow-2xl flex flex-col overflow-hidden transition-colors ${
          themeMode === 'light'
            ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
            : 'bg-[#0B0F19] border-indigo-500/30 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                <span>Flowra Clubs & Communities</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Clubs
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Create & join any type of club (Study, Coding, Fitness, Books, Career & more), invite members & send peer streak nudges
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between gap-2 mt-3 pb-2 border-b border-zinc-800/60 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('clubs')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'clubs'
                  ? 'bg-indigo-500 text-black shadow-md'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Explore Clubs ({clubs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('create-club')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'create-club'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Club</span>
            </button>
          </div>
        </div>

        {/* TAB 1: EXPLORE CLUBS */}
        {activeTab === 'clubs' && (
          <div className="flex-1 overflow-y-auto my-3 pr-1 flex flex-col gap-3">
            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search clubs by name, topic, or goal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {filteredClubs.map((club) => (
              <div
                key={club.id}
                className="p-4 rounded-3xl bg-zinc-900/70 border border-zinc-800 flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>{club.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {club.planGoal}
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{club.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> Avg {club.dailyAverageStreak}d Streak
                    </span>
                  </div>
                </div>

                {/* Club Members Leaderboard & Nudge Controls */}
                <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Club Members ({club.members.length}):</span>
                    <span className="text-[10px] text-indigo-400">Created by {club.creatorName}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {club.members.map((member: any, i: number) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1">
                            <span>#{i + 1}</span>
                            <span>{member.displayName}</span>
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">
                            {member.aura} Aura
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-zinc-400">
                          <span className="flex items-center gap-1 text-amber-400 font-semibold">
                            <Flame className="w-2.5 h-2.5" /> {member.streak}d
                          </span>

                          {member.daysMissed > 0 ? (
                            <button
                              onClick={() => handleSendNudge(club.name, member.displayName, member.daysMissed)}
                              className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 text-[9px] font-bold flex items-center gap-1 transition-all"
                            >
                              <Zap className="w-2.5 h-2.5" /> Poke ({member.daysMissed}d)
                            </button>
                          ) : (
                            <span className="text-emerald-400 text-[9px] font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Active Today
                            </span>
                          )}
                        </div>

                        {nudgeStatus[member.displayName] && (
                          <div className="p-1 rounded-lg bg-rose-950/80 border border-rose-500/40 text-[9px] text-rose-200">
                            {nudgeStatus[member.displayName]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: CREATE NEW CLUB WITH CUSTOM NAME & MEMBER ADDING OPTION */}
        {activeTab === 'create-club' && (
          <form onSubmit={handleCreateClubSubmit} className="flex-1 overflow-y-auto my-3 pr-1 flex flex-col gap-3.5">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
              <div className="text-xs text-indigo-200">
                You are the Owner. You can give <span className="font-bold">any custom name</span> to your club and add/invite members by username, email, or peer tags!
              </div>
            </div>

            {/* Custom Club Name Input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-300">Club & Community Name:</label>
              <input
                type="text"
                required
                placeholder="e.g. 🚀 100-Day DSA Spartan Squad, AI Paper Reading Guild..."
                value={newClubName}
                onChange={(e) => setNewClubName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Club Category */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-300">Target Focus Track:</label>
              <select
                value={newClubCategory}
                onChange={(e) => setNewClubCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Placement & DSA Prep">Placement & DSA Prep</option>
                <option value="Learn AI/ML & LLMs">Learn AI/ML & LLMs</option>
                <option value="Improve English & Fluency">Improve English & Fluency</option>
                <option value="Read More Non-Fiction Books">Read More Non-Fiction Books</option>
                <option value="Full Stack & Web Dev">Full Stack & Web Dev</option>
                <option value="Monastic Focus & Dopamine Reset">Monastic Focus & Dopamine Reset</option>
                <option value="Fitness, Calisthenics & Health">Fitness, Calisthenics & Health</option>
                <option value="Competitive Exams Mastery">Competitive Exams Mastery</option>
                <option value="Startup & Business Creation">Startup & Business Creation</option>
                <option value="Creative Arts & Writing">Creative Arts & Writing</option>
                <option value="Custom Accountability Group">Custom Accountability Group</option>
              </select>
            </div>

            {/* Club Description */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-300">Club Mission & Rules:</label>
              <textarea
                rows={2}
                placeholder="Describe your squad's daily streak requirements, shared resources, or weekly goals..."
                value={newClubDescription}
                onChange={(e) => setNewClubDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* MEMBER ADDING OPTION IN THE CLUB FORM */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  <span>Add / Invite Members to Club:</span>
                </label>
                <span className="text-[10px] text-zinc-400">({invitedMemberList.length} Added)</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter username or email to add..."
                  value={invitedMembersInput}
                  onChange={(e) => setInvitedMembersInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInvitedMember();
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddInvitedMember}
                  className="px-3 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all shrink-0"
                >
                  Add Member
                </button>
              </div>

              {/* Invited Chips */}
              {invitedMemberList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {invitedMemberList.map((member) => (
                    <span
                      key={member}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold"
                    >
                      <span>{member}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInvitedMember(member)}
                        className="hover:text-rose-400 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all mt-1"
            >
              <Plus className="w-4 h-4" />
              <span>Create & Launch Club</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
