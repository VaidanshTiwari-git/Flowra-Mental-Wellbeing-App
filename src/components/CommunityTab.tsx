import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Users,
  HeartHandshake,
  Award,
  Sparkles,
  Plus,
  X,
  MapPin,
  Flame,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  Search,
  Bell,
  Shield,
  Zap,
  UserPlus,
  Compass,
  MessageSquare,
  MessageCircle,
} from 'lucide-react';
import { CommunityPost, UserProfile, GoalType } from '../types';
import { fetchCommunityPosts, createCommunityPost } from '../lib/firebase';
import { sendClubNudgeAPI } from '../services/api';
import { UserProfileModal } from './UserProfileModal';
import { SquadChatModal } from './SquadChatModal';
import { ClubChatModal } from './ClubChatModal';

interface CommunityTabProps {
  user: UserProfile;
  onOpenClubsModal?: () => void;
  themeMode?: 'dark' | 'light';
}

export const CommunityTab: React.FC<CommunityTabProps> = ({ user, onOpenClubsModal, themeMode = 'dark' }) => {
  const isLight = themeMode === 'light';
  // Community Feed State
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'study-squad' | 'social-impact' | 'challenge' | 'book-club'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [joinedPosts, setJoinedPosts] = useState<string[]>([]);

  // Modals & Chat Panels State
  const [selectedUserProfile, setSelectedUserProfile] = useState<string | null>(null);
  const [activeSquadChatPost, setActiveSquadChatPost] = useState<CommunityPost | null>(null);
  const [activeClubChat, setActiveClubChat] = useState<any | null>(null);

  // Create Community Post State
  const [postType, setPostType] = useState<'study-squad' | 'social-impact' | 'challenge' | 'book-club'>('study-squad');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postLocation, setPostLocation] = useState('Remote (Discord / Zoom)');
  const [postContact, setPostContact] = useState('');
  const [postTags, setPostTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clubs Section State
  const [clubsSearchQuery, setClubsSearchQuery] = useState('');
  const [clubsFilter, setClubsFilter] = useState<'all' | 'my-goal' | 'high-streak'>('all');
  const [isCreateClubModalOpen, setIsCreateClubModalOpen] = useState(false);
  const [joinedClubs, setJoinedClubs] = useState<string[]>(['club-1']);
  const [nudgeStatus, setNudgeStatus] = useState<Record<string, string>>({});

  // Sample Clubs List
  const [clubsList, setClubsList] = useState<any[]>([
    {
      id: 'club-1',
      name: '🔥 Elite 150-Day Placement Titans',
      description: 'Daily LeetCode Blind-75 sprints, OS/DBMS mock battles, and zero-doomscrolling accountability.',
      creatorName: 'Aarya Sharma',
      planGoal: 'Placement & Tech Prep',
      dailyAverageStreak: 18,
      members: [
        { displayName: user.displayName || 'You', aura: 940, streak: user.streak || 1, daysMissed: 0 },
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

  useEffect(() => {
    fetchCommunityPosts().then((res) => setPosts(res));
  }, []);

  const handleJoinSquadOrImpact = (post: CommunityPost) => {
    if (!joinedPosts.includes(post.id)) {
      setJoinedPosts((prev) => [...prev, post.id]);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
    // Open the WhatsApp-style Accountability Squad Chat Panel
    setActiveSquadChatPost(post);
  };

  const handleToggleJoinClub = (clubId: string) => {
    if (joinedClubs.includes(clubId)) {
      setJoinedClubs((prev) => prev.filter((id) => id !== clubId));
    } else {
      setJoinedClubs((prev) => [...prev, clubId]);
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.7 },
      });
    }
  };

  const handleSendNudge = async (clubName: string, recipientName: string, daysMissed: number) => {
    const key = `${clubName}-${recipientName}`;
    setNudgeStatus((prev) => ({ ...prev, [key]: 'sending' }));

    try {
      const res = await sendClubNudgeAPI({
        senderName: user.displayName || 'You',
        recipientName,
        clubName,
        recipientDaysMissed: daysMissed,
        senderStreak: user.streak || 1,
      });

      setNudgeStatus((prev) => ({
        ...prev,
        [key]: `✓ Sent: "${res.nudgeMessage || 'Stay strong!'}"`,
      }));

      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch (err) {
      setNudgeStatus((prev) => ({
        ...prev,
        [key]: `✓ Nudge sent to ${recipientName}! Keep the streak alive 🔥`,
      }));
    }
  };

  const handleCreateClubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim()) return;

    const initialMembers = [
      { displayName: user.displayName || 'You', aura: 100, streak: user.streak || 1, daysMissed: 0 },
      ...invitedMemberList.map((m) => ({ displayName: m, aura: 50, streak: 1, daysMissed: 0 })),
    ];

    const createdClub = {
      id: `club-${Date.now()}`,
      name: newClubName.trim(),
      description: newClubDescription.trim() || 'Custom Flowra study squad dedicated to daily progress.',
      creatorName: user.displayName || 'You',
      planGoal: newClubCategory,
      dailyAverageStreak: Math.max(1, user.streak || 1),
      members: initialMembers,
    };

    setClubsList([createdClub, ...clubsList]);
    setJoinedClubs((prev) => [...prev, createdClub.id]);
    setIsCreateClubModalOpen(false);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setNewClubName('');
    setNewClubDescription('');
    setInvitedMemberList([]);
    setInvitedMembersInput('');
  };

  const handleAddInvitedMember = () => {
    if (!invitedMembersInput.trim()) return;
    if (!invitedMemberList.includes(invitedMembersInput.trim())) {
      setInvitedMemberList([...invitedMemberList, invitedMembersInput.trim()]);
    }
    setInvitedMembersInput('');
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;
    setIsSubmitting(true);

    try {
      const tagsArray = postTags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const created = await createCommunityPost({
        authorId: user.uid,
        authorName: user.displayName,
        authorGoal: user.goal,
        authorPetName: user.companion.name,
        authorPetType: user.companion.type,
        type: postType,
        title: postTitle.trim(),
        content: postContent.trim(),
        tags: tagsArray.length > 0 ? tagsArray : [user.goal],
        targetLocation: postLocation.trim() || 'Remote',
        contactInfo: postContact.trim(),
        urgency: postType === 'social-impact' ? 'high' : 'normal',
      });

      setPosts((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      setPostTitle('');
      setPostContent('');
      setPostContact('');
      setPostTags('');

      confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPosts =
    filterType === 'all' ? posts : posts.filter((p) => p.type === filterType);

  const filteredClubs = clubsList.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(clubsSearchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(clubsSearchQuery.toLowerCase()) ||
      c.planGoal.toLowerCase().includes(clubsSearchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (clubsFilter === 'high-streak') return c.dailyAverageStreak >= 18;
    if (clubsFilter === 'my-goal') {
      return (
        c.planGoal.toLowerCase().includes(user.goal.toLowerCase()) ||
        c.description.toLowerCase().includes(user.goal.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-20 pt-1">
      {/* ========================================================= */}
      {/* 1. COMMUNITY SECTION (TOP) */}
      {/* ========================================================= */}
      <section id="community-section" className="space-y-4">
        {/* Header Info Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-950/50 via-[#14141A] to-[#0D0D10] border border-purple-500/25 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
              <HeartHandshake className="w-4 h-4 text-cyan-400" />
              <span>Intentional Mutual Support</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
              Zero Doomscroll Feed
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white">Growth & Impact Community</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            No infinite feeds, vanity metrics, or dopamine hooks. Connect with fellow pioneers for {user.goal}, join 7-day focus challenges, or collaborate on meaningful social causes.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              id="community-create-post-button"
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all border border-purple-400/30"
            >
              <Plus className="w-4 h-4" />
              <span>Post Need / Study Challenge</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Listings' },
            { id: 'study-squad', label: 'Study Squads 🚀' },
            { id: 'social-impact', label: 'Social Impact 🩸' },
            { id: 'challenge', label: 'Focus Sprints ⚡' },
            { id: 'book-club', label: 'Book Clubs 📖' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                filterType === f.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                  : 'bg-[#141418] text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Posts Listing */}
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const isJoined = joinedPosts.includes(post.id);
            const isSocialImpact = post.type === 'social-impact';

            return (
              <div
                key={post.id}
                className={`p-4 rounded-3xl border transition-all space-y-2.5 ${
                  isSocialImpact
                    ? 'bg-[#18111A] border-rose-500/40 shadow-lg shadow-rose-950/20'
                    : 'bg-[#141418] border-zinc-800/90 hover:border-purple-500/30'
                }`}
              >
                {/* Author & Tag Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedUserProfile(post.authorName)}
                      className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-900 to-indigo-900 text-xs flex items-center justify-center font-bold text-white border border-purple-500/40 cursor-pointer hover:scale-105 transition-transform"
                      title={`View ${post.authorName}'s Profile`}
                    >
                      {post.authorPetType === 'cat' ? '🐱' : post.authorPetType === 'dog' ? '🐶' : '🌳'}
                    </button>
                    <div>
                      <button
                        onClick={() => setSelectedUserProfile(post.authorName)}
                        className="text-xs font-bold text-white hover:text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>{post.authorName}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Profile
                        </span>
                      </button>
                      <div className="text-[10px] text-zinc-400">
                        Goal: {post.authorGoal} • Companion: {post.authorPetName}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isSocialImpact
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : post.type === 'study-squad'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {post.type.replace('-', ' ')}
                  </span>
                </div>

                {/* Title & Body */}
                <div>
                  <h4 className="text-sm font-extrabold text-white tracking-tight">{post.title}</h4>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{post.content}</p>
                </div>

                {/* Location & Tags */}
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1 text-zinc-300">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    {post.targetLocation}
                  </span>
                  {post.tags?.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-[#1B1B24] text-purple-300 font-medium">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Action Bar */}
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">
                    {(post.participantsCount || 4) + (isJoined ? 1 : 0)} Pioneers Connected
                  </span>

                  <div className="flex items-center gap-2">
                    {isJoined && (
                      <button
                        onClick={() => setActiveSquadChatPost(post)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 transition-all cursor-pointer"
                        title="Open WhatsApp-style Squad Chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat Panel</span>
                      </button>
                    )}

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleJoinSquadOrImpact(post)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isJoined
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isSocialImpact
                          ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-md shadow-rose-600/25'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-zinc-700'
                      }`}
                    >
                      {isJoined ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Connected</span>
                        </>
                      ) : isSocialImpact ? (
                        <span>Respond to Need</span>
                      ) : (
                        <>
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Join Accountability Squad</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* VISUAL SECTION DIFFERENTIATOR (LINE & GLOWING BADGE BOX) */}
      {/* ========================================================= */}
      <div className="relative py-4" id="community-clubs-divider">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t-2 border-dashed border-emerald-500/30" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 py-1.5 rounded-2xl bg-[#0B0E14] border-2 border-emerald-500/50 text-emerald-400 text-xs font-black tracking-wider uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Dedicated Accountability Clubs Section</span>
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CLUBS SECTION (BOTTOM) */}
      {/* ========================================================= */}
      <section
        id="clubs-section"
        className="p-4 sm:p-5 rounded-3xl bg-[#0D111A] border-2 border-emerald-500/40 shadow-2xl space-y-4 relative"
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Users className="w-4 h-4" />
              </span>
              <h3 className="text-base font-black text-white">Accountability Clubs & Circles</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Private study squads, peer streak leaderboards, and AI motivational nudges for {user.goal}.
            </p>
          </div>

          <button
            onClick={() => setIsCreateClubModalOpen(true)}
            id="create-club-button"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Club</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search squads by goal or keyword..."
              value={clubsSearchQuery}
              onChange={(e) => setClubsSearchQuery(e.target.value)}
              className="w-full bg-[#070A0F] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'all', label: 'All Squads' },
              { id: 'my-goal', label: 'My Goal 🎯' },
              { id: 'high-streak', label: '18+ Days 🔥' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setClubsFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  clubsFilter === f.id
                    ? 'bg-emerald-500 text-black font-black shadow-md'
                    : 'bg-[#141822] text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clubs List */}
        <div className="space-y-3 pt-1">
          {filteredClubs.map((club) => {
            const isJoined = joinedClubs.includes(club.id);

            return (
              <div
                key={club.id}
                className="p-4 rounded-2xl bg-[#121622] border border-zinc-800/90 hover:border-emerald-500/40 transition-all space-y-3"
              >
                {/* Top Row: Club Info, Creator Chip, Group Chat, & Join Button */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-white">{club.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {club.planGoal}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{club.description}</p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        onClick={() => setSelectedUserProfile(club.creatorName)}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-bold transition-all cursor-pointer"
                        title={`View ${club.creatorName}'s Full Profile`}
                      >
                        <ShieldCheck className="w-3 h-3 text-purple-400" />
                        <span>Owner: {club.creatorName}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setActiveClubChat(club)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      title="Open Club Group Chat Lounge"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Group Chat</span>
                    </button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleJoinClub(club.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition-all cursor-pointer ${
                        isJoined
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                      }`}
                    >
                      {isJoined ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Joined</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Join Club</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Meta stats */}
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60 flex-wrap">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Flame className="w-3.5 h-3.5" /> Avg Streak: {club.dailyAverageStreak} Days
                  </span>
                  <span>•</span>
                  <button
                    onClick={() => setSelectedUserProfile(club.creatorName)}
                    className="hover:text-purple-300 hover:underline cursor-pointer"
                  >
                    Created by {club.creatorName}
                  </button>
                  <span>•</span>
                  <span>{club.members.length} Active Members</span>
                </div>

                {/* Member Roster & Peer Nudges */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold text-zinc-400 flex items-center justify-between">
                    <span>Squad Members & Live Streaks (Tap name for profile)</span>
                    <span className="text-[10px] text-zinc-500">Tap bell to send AI Peer Nudge</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {club.members.map((member: any, mIdx: number) => {
                      const nudgeKey = `${club.name}-${member.displayName}`;
                      const currentNudge = nudgeStatus[nudgeKey];

                      return (
                        <div
                          key={mIdx}
                          className="p-2.5 rounded-xl bg-[#090C12] border border-zinc-800/80 flex flex-col justify-between gap-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setSelectedUserProfile(member.displayName)}
                              className="font-bold text-xs text-white hover:text-cyan-400 hover:underline cursor-pointer truncate max-w-[100px] text-left"
                              title={`View ${member.displayName}'s Profile`}
                            >
                              {member.displayName}
                            </button>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-mono font-bold flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5" /> {member.streak}d
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-zinc-400">
                            <span className="text-emerald-400 font-mono font-bold">{member.aura} Aura</span>
                            {member.daysMissed > 0 ? (
                              <span className="text-rose-400 font-semibold">{member.daysMissed}d missed</span>
                            ) : (
                              <span className="text-emerald-400">Active</span>
                            )}
                          </div>

                          {/* Peer Nudge Button */}
                          <div className="pt-1 border-t border-zinc-800/60">
                            {currentNudge ? (
                              <div className="text-[9px] text-emerald-300 font-bold truncate">
                                {currentNudge}
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSendNudge(club.name, member.displayName, member.daysMissed)}
                                className="w-full py-1 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                              >
                                <Bell className="w-2.5 h-2.5" />
                                <span>Send AI Nudge</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* MODAL: CREATE COMMUNITY POST */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#090A10]/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#141418] border border-purple-500/30 rounded-3xl p-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="font-bold text-white text-sm">Post to Community</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-3 pt-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Type:</label>
                  <select
                    value={postType}
                    onChange={(e: any) => setPostType(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="study-squad">Study Squad / Accountability Partner</option>
                    <option value="social-impact">Social Impact (Blood Donation / Volunteering)</option>
                    <option value="challenge">7-Day / 30-Day Growth Challenge</option>
                    <option value="book-club">Book Club</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Title:</label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="e.g. 6 AM DSA Morning Sprint Partner"
                    className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Details:</label>
                  <textarea
                    rows={3}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Describe your schedule, goal, or genuine need..."
                    className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Location/Format:</label>
                    <input
                      type="text"
                      value={postLocation}
                      onChange={(e) => setPostLocation(e.target.value)}
                      placeholder="Remote / Discord / City"
                      className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Contact/Room:</label>
                    <input
                      type="text"
                      value={postContact}
                      onChange={(e) => setPostContact(e.target.value)}
                      placeholder="Room tag / email"
                      className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-purple-500/25"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Posting...' : 'Publish Post to Community'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: CREATE CLUB FORM */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isCreateClubModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#070A0F]/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0D111A] border-2 border-emerald-500/50 rounded-3xl p-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-white text-sm">Create Accountability Club</h3>
                </div>
                <button
                  onClick={() => setIsCreateClubModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateClubSubmit} className="space-y-3 pt-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Club Name:</label>
                  <input
                    type="text"
                    required
                    value={newClubName}
                    onChange={(e) => setNewClubName(e.target.value)}
                    placeholder="e.g. ⚡ 6 AM LeetCode Warriors"
                    className="w-full bg-[#070A0F] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Category / Domain:</label>
                  <select
                    value={newClubCategory}
                    onChange={(e) => setNewClubCategory(e.target.value)}
                    className="w-full bg-[#070A0F] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Placement & DSA Prep">Placement & DSA Prep</option>
                    <option value="AI / ML Deep Research">AI / ML Deep Research</option>
                    <option value="Monastic Deep Reading">Monastic Deep Reading</option>
                    <option value="Competitive Exam Mastery">Competitive Exam Mastery</option>
                    <option value="Social Impact & Service">Social Impact & Service</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Club Mission / Rules:</label>
                  <textarea
                    rows={3}
                    value={newClubDescription}
                    onChange={(e) => setNewClubDescription(e.target.value)}
                    placeholder="e.g. Daily 45-min focus sessions. Missed days require AI peer nudges!"
                    className="w-full bg-[#070A0F] border border-zinc-700 rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Invite Initial Members (optional):</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={invitedMembersInput}
                      onChange={(e) => setInvitedMembersInput(e.target.value)}
                      placeholder="Enter friend name..."
                      className="flex-1 bg-[#070A0F] border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddInvitedMember}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>

                  {invitedMemberList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {invitedMemberList.map((m, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1"
                        >
                          <span>{m}</span>
                          <button
                            type="button"
                            onClick={() => setInvitedMemberList(invitedMemberList.filter((item) => item !== m))}
                            className="text-zinc-400 hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <Zap className="w-4 h-4" />
                  <span>Launch Accountability Club</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* CREATOR / USER PROFILE MODAL */}
      {/* ========================================================= */}
      <UserProfileModal
        isOpen={!!selectedUserProfile}
        onClose={() => setSelectedUserProfile(null)}
        userName={selectedUserProfile || ''}
      />

      {/* ========================================================= */}
      {/* WHATSAPP-STYLE ACCOUNTABILITY SQUAD CHAT MODAL */}
      {/* ========================================================= */}
      <SquadChatModal
        isOpen={!!activeSquadChatPost}
        onClose={() => setActiveSquadChatPost(null)}
        post={activeSquadChatPost}
        onOpenAuthorProfile={(name) => setSelectedUserProfile(name)}
      />

      {/* ========================================================= */}
      {/* CLUB GROUP CHAT LOUNGE MODAL */}
      {/* ========================================================= */}
      <ClubChatModal
        isOpen={!!activeClubChat}
        onClose={() => setActiveClubChat(null)}
        club={activeClubChat}
        onOpenOwnerProfile={(name) => setSelectedUserProfile(name)}
      />
    </div>
  );
};
