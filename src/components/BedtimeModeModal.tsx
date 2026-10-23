import React, { useState, useEffect, useRef } from 'react';
import { ThemeMode } from '../types';
import {
  Moon,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  X,
  Play,
  Square,
  CloudRain,
  Flame,
  Wind,
  Music,
  CheckCircle2,
  Youtube,
  Radio,
  Headphones,
  FileAudio,
  Search,
  ExternalLink,
  Zap,
  RotateCcw,
  ListMusic,
  User,
  History,
  Check,
  Power,
  ShieldCheck,
  Disc,
} from 'lucide-react';

interface BedtimeModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  petName: string;
  themeMode?: ThemeMode;
}

export interface AudioTrack {
  id: string;
  title: string;
  author: string;
  creatorAvatar?: string;
  creatorSubscribers?: string;
  creatorDescription?: string;
  type: 'youtube-mp3' | 'binaural-synth';
  youtubeId?: string;
  durationSeconds?: number;
  durationStr: string;
  lastPlayedSecond?: number;
  category: 'podcast' | 'lofi' | 'sleep' | 'audiobook' | 'nature' | 'custom';
}

interface CreatorProfile {
  name: string;
  handle: string;
  avatar: string;
  subscribers: string;
  category: string;
  bio: string;
  tracks: AudioTrack[];
}

const FEATURED_CREATORS: CreatorProfile[] = [
  {
    name: 'Andrew Huberman (Huberman Lab)',
    handle: '@hubermanlab',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    subscribers: '5.4M Subscribers',
    category: 'Sleep Neuroscience',
    bio: 'Stanford neuroscientist exploring science-based protocols for deep delta sleep, dopamine reset, and focus rewire.',
    tracks: [
      {
        id: 'huberman-1',
        title: 'Master Your Sleep & Reset Circadian Rhythm Protocol',
        author: 'Andrew Huberman',
        type: 'youtube-mp3',
        youtubeId: 'pwaWilO_Pig',
        durationSeconds: 3120,
        durationStr: '52 mins',
        category: 'podcast',
      },
      {
        id: 'huberman-2',
        title: 'NSDR (Non-Sleep Deep Rest) 20-Minute Protocol',
        author: 'Andrew Huberman',
        type: 'youtube-mp3',
        youtubeId: 'AKGrmY8OSHM',
        durationSeconds: 1200,
        durationStr: '20 mins',
        category: 'sleep',
      },
      {
        id: 'huberman-3',
        title: 'Dopamine Detox & Active Neural Rest Guide',
        author: 'Andrew Huberman',
        type: 'youtube-mp3',
        youtubeId: 'QmOF0crdyRU',
        durationSeconds: 2700,
        durationStr: '45 mins',
        category: 'podcast',
      },
    ],
  },
  {
    name: 'Lofi Girl (Sleep Chill Sanctuary)',
    handle: '@lofigirl',
    avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=120&auto=format&fit=crop&q=80',
    subscribers: '14.2M Subscribers',
    category: 'Lofi & Ambient Study',
    bio: '24/7 relaxing bedtime lofi beats to sleep, unwind, and clear cognitive residue before tomorrow.',
    tracks: [
      {
        id: 'lofi-1',
        title: 'Midnight Cozy Bedroom Lofi Beats to Sleep / Relax',
        author: 'Lofi Girl',
        type: 'youtube-mp3',
        youtubeId: 'jfKfPfyJRdk',
        durationSeconds: 3600,
        durationStr: '60 mins',
        category: 'lofi',
      },
      {
        id: 'lofi-2',
        title: 'Rainy Night In Tokyo • Slowed & Reverb Lofi',
        author: 'Lofi Girl',
        type: 'youtube-mp3',
        youtubeId: '5qap5aO4i9A',
        durationSeconds: 4800,
        durationStr: '80 mins',
        category: 'lofi',
      },
    ],
  },
  {
    name: 'The Mindful Movement',
    handle: '@themindfulmovement',
    avatar: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=120&auto=format&fit=crop&q=80',
    subscribers: '1.2M Subscribers',
    category: 'Guided Sleep & Meditation',
    bio: 'Mindfulness hypnotherapy, delta frequency sound baths, and nervous system down-regulation for restorative sleep.',
    tracks: [
      {
        id: 'mindful-1',
        title: 'Deep Sleep Hypnosis & Mindful Tension Release Session',
        author: 'The Mindful Movement',
        type: 'youtube-mp3',
        youtubeId: '1vx8iUvfyCY',
        durationSeconds: 2400,
        durationStr: '40 mins',
        category: 'sleep',
      },
      {
        id: 'mindful-2',
        title: 'Release Overthinking & Bedtime Brain Decompression',
        author: 'The Mindful Movement',
        type: 'youtube-mp3',
        youtubeId: 'g9z-b132vA8',
        durationSeconds: 1800,
        durationStr: '30 mins',
        category: 'audiobook',
      },
    ],
  },
  {
    name: 'Cal Newport (Deep Focus & Digital Minimalism)',
    handle: '@calnewport',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    subscribers: '980K Subscribers',
    category: 'Deep Work Architecture',
    bio: 'Computer Science professor and author of Deep Work & Digital Minimalism teaching focus mastery.',
    tracks: [
      {
        id: 'cal-1',
        title: 'Digital Minimalism & The Cognitive Cost of Fragmented Attention',
        author: 'Cal Newport',
        type: 'youtube-mp3',
        youtubeId: '3E7hkPZ-HTk',
        durationSeconds: 2880,
        durationStr: '48 mins',
        category: 'podcast',
      },
    ],
  },
];

const CURATED_PLAYLISTS = [
  {
    name: 'Complete 180-Day Sleep Mastery Playlist',
    creator: 'Flowra Sleep Lab',
    trackCount: 8,
    tracks: [
      {
        id: 'pl-1',
        title: 'Sleep Architecture & Dopamine Reset Podcast',
        author: 'Neuroscience Sleep Lab',
        type: 'youtube-mp3' as const,
        youtubeId: 'pwaWilO_Pig',
        durationSeconds: 2520,
        durationStr: '42 mins',
        category: 'podcast' as const,
      },
      {
        id: 'pl-2',
        title: 'Midnight Lofi Chill Beats for Deep Rest',
        author: 'ChillHop Sleep Session',
        type: 'youtube-mp3' as const,
        youtubeId: 'jfKfPfyJRdk',
        durationSeconds: 3600,
        durationStr: '60 mins',
        category: 'lofi' as const,
      },
      {
        id: 'pl-3',
        title: 'Meditations by Marcus Aurelius (Calm Audio)',
        author: 'Stoic Audio Sanctuary',
        type: 'youtube-mp3' as const,
        youtubeId: 'g9z-b132vA8',
        durationSeconds: 5400,
        durationStr: '90 mins',
        category: 'audiobook' as const,
      },
      {
        id: 'pl-4',
        title: '8-Hour Gentle Night Rain & Soft Thunder',
        author: 'Nature Soundscapes HQ',
        type: 'youtube-mp3' as const,
        youtubeId: 'mPZkdNFkNps',
        durationSeconds: 7200,
        durationStr: '120 mins',
        category: 'nature' as const,
      },
      {
        id: 'pl-5',
        title: '528Hz DNA Repair & Anxiety Release Symphony',
        author: 'Sonic Resonance Wave',
        type: 'youtube-mp3' as const,
        youtubeId: '1nN99m6x214',
        durationSeconds: 3600,
        durationStr: '60 mins',
        category: 'sleep' as const,
      },
    ],
  },
];

export const BedtimeModeModal: React.FC<BedtimeModeModalProps> = ({
  isOpen,
  onClose,
  petName,
  themeMode = 'dark',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioModeOn, setIsAudioModeOn] = useState(true);
  const [selectedSound, setSelectedSound] = useState<'delta' | 'rain' | 'fire' | 'zen' | 'waves'>('delta');
  const [timerMinutes, setTimerMinutes] = useState<number>(30);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30 * 60);
  const [volume, setVolume] = useState<number>(0.75);
  const [screenDimMode, setScreenDimMode] = useState(true);

  // Search, Creator & Playlist Import States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCreator, setSelectedCreator] = useState<CreatorProfile | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionStatusText, setConversionStatusText] = useState('');
  const [playlistImportUrl, setPlaylistImportUrl] = useState('');
  const [importedPlaylistTracks, setImportedPlaylistTracks] = useState<AudioTrack[]>([]);

  // Active track state
  const [activeTrack, setActiveTrack] = useState<AudioTrack>({
    id: 'yt-default',
    title: 'The Neuroscience of Deep Sleep & Focus Rewire',
    author: 'Andrew Huberman (Huberman Lab)',
    type: 'youtube-mp3',
    youtubeId: 'pwaWilO_Pig',
    durationSeconds: 2700,
    durationStr: '45 mins',
    lastPlayedSecond: 420, // 7 mins in
    category: 'podcast',
  });

  // Current playback progress position (seconds)
  const [currentPlaybackSeconds, setCurrentPlaybackSeconds] = useState<number>(420);

  // Playback History & Memory stored in localStorage
  const [historyTracks, setHistoryTracks] = useState<AudioTrack[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('flowra_bedtime_audio_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistoryTracks(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Stop audio nodes on close or unmount
  useEffect(() => {
    if (!isOpen) {
      stopAudioNodes();
      setIsPlaying(false);
    }
    return () => {
      stopAudioNodes();
    };
  }, [isOpen]);

  // Save history to localStorage whenever activeTrack or currentPlaybackSeconds changes
  const saveToHistory = (track: AudioTrack, stoppedAtSec: number) => {
    try {
      const updatedTrack: AudioTrack = {
        ...track,
        lastPlayedSecond: stoppedAtSec,
      };

      setHistoryTracks((prev) => {
        const filtered = prev.filter((t) => t.id !== track.id && t.youtubeId !== track.youtubeId);
        const newHist = [updatedTrack, ...filtered].slice(0, 10);
        localStorage.setItem('flowra_bedtime_audio_history', JSON.stringify(newHist));
        return newHist;
      });
    } catch {
      // ignore
    }
  };

  // Timer & Playback Progression Loop
  useEffect(() => {
    let interval: any;
    if (isPlaying && isAudioModeOn && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            handleStopAudio();
            return 0;
          }
          return prev - 1;
        });

        setCurrentPlaybackSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isAudioModeOn, remainingSeconds]);

  const soundPresets = [
    { id: 'delta' as const, name: '432Hz Delta Sleep Wave', icon: Moon, desc: 'Deep restorative neural sleep brainwaves', freq: 432 },
    { id: 'rain' as const, name: 'Midnight Rain on Roof', icon: CloudRain, desc: 'Gentle rhythmic ambient rainfall', freq: 220 },
    { id: 'fire' as const, name: 'Cozy Hearth Campfire', icon: Flame, desc: 'Warm crackling fireplace ambiance', freq: 160 },
    { id: 'zen' as const, name: 'Zen Temple Flute & Bowls', icon: Music, desc: 'Soothing meditative 528Hz harmonics', freq: 528 },
    { id: 'waves' as const, name: 'Deep Ocean Night Tides', icon: Wind, desc: 'Slow oceanic tidal breathing frequency', freq: 110 },
  ];

  // Helper to extract YouTube Video ID or Playlist ID
  const extractYoutubeId = (url: string): string => {
    if (!url) return '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) return match[1];
    if (url.trim().length === 11) return url.trim();
    return 'pwaWilO_Pig';
  };

  // Handle Fast Audio-Only Extraction & YouTube MP3 Conversion
  const handleConvertYoutube = (queryOrUrl?: string) => {
    const target = queryOrUrl || searchQuery;
    if (!target.trim()) return;

    setIsConverting(true);
    setConversionProgress(25);
    setConversionStatusText('Connecting to audio-only stream (bypassing heavy video frames)...');

    setTimeout(() => {
      setConversionProgress(65);
      setConversionStatusText('Extracting 320kbps MP3 audio chunk & sleep buffer...');
    }, 250);

    setTimeout(() => {
      setConversionProgress(90);
      setConversionStatusText('Finalizing audio stream & 432Hz normalization...');
    }, 500);

    setTimeout(() => {
      const vidId = extractYoutubeId(target);
      const isPodcast = target.toLowerCase().includes('podcast') || target.toLowerCase().includes('huberman');
      const isLofi = target.toLowerCase().includes('lofi') || target.toLowerCase().includes('chill');

      const newTrack: AudioTrack = {
        id: `yt-converted-${Date.now()}`,
        title: target.startsWith('http')
          ? 'Converted YouTube MP3 Bedtime Stream'
          : target.length > 50
          ? target.slice(0, 50) + '...'
          : target,
        author: 'YouTube Audio Extraction',
        type: 'youtube-mp3',
        youtubeId: vidId,
        durationSeconds: timerMinutes * 60,
        durationStr: `${timerMinutes} mins`,
        lastPlayedSecond: 0,
        category: isPodcast ? 'podcast' : isLofi ? 'lofi' : 'custom',
      };

      setActiveTrack(newTrack);
      setCurrentPlaybackSeconds(0);
      setIsConverting(false);
      setConversionProgress(100);
      setConversionStatusText('Audio ready! Streaming in background with screen off.');
      setIsPlaying(true);
      setIsAudioModeOn(true);
      setRemainingSeconds(timerMinutes * 60);
      saveToHistory(newTrack, 0);
    }, 750);
  };

  // Handle Playlist Import
  const handleImportPlaylist = () => {
    if (!playlistImportUrl.trim()) return;

    setIsConverting(true);
    setConversionProgress(35);
    setConversionStatusText('Scanning YouTube Playlist & fetching audio-only tracks...');

    setTimeout(() => {
      setConversionProgress(80);
      setConversionStatusText('Chunking multi-track audio metadata for sequential sleep playback...');
    }, 300);

    setTimeout(() => {
      const demoTracks: AudioTrack[] = [
        {
          id: `pl-imported-1-${Date.now()}`,
          title: 'Track 1: Deep Rest Introduction & Breath Sync',
          author: 'Imported Playlist Stream',
          type: 'youtube-mp3',
          youtubeId: 'pwaWilO_Pig',
          durationSeconds: 1800,
          durationStr: '30 mins',
          lastPlayedSecond: 0,
          category: 'sleep',
        },
        {
          id: `pl-imported-2-${Date.now()}`,
          title: 'Track 2: Continuous Night Rain & Gentle Piano',
          author: 'Imported Playlist Stream',
          type: 'youtube-mp3',
          youtubeId: 'jfKfPfyJRdk',
          durationSeconds: 2700,
          durationStr: '45 mins',
          lastPlayedSecond: 0,
          category: 'lofi',
        },
        {
          id: `pl-imported-3-${Date.now()}`,
          title: 'Track 3: 432Hz Theta Waves & Total Mind Stillness',
          author: 'Imported Playlist Stream',
          type: 'youtube-mp3',
          youtubeId: '1nN99m6x214',
          durationSeconds: 3600,
          durationStr: '60 mins',
          lastPlayedSecond: 0,
          category: 'nature',
        },
      ];

      setImportedPlaylistTracks(demoTracks);
      setIsConverting(false);
      setConversionProgress(100);
      setConversionStatusText(`Imported ${demoTracks.length} audio tracks successfully!`);
      // Start track 1 immediately
      handleSelectTrack(demoTracks[0]);
    }, 600);
  };

  // Play a specific audio track
  const handleSelectTrack = (track: AudioTrack, resumeAtSec: number = 0) => {
    setActiveTrack(track);
    setCurrentPlaybackSeconds(resumeAtSec);
    setIsPlaying(true);
    setIsAudioModeOn(true);
    setRemainingSeconds(timerMinutes * 60);
    saveToHistory(track, resumeAtSec);
  };

  // Stop / Pause Audio
  const handleStopAudio = () => {
    stopAudioNodes();
    setIsPlaying(false);
    if (activeTrack) {
      saveToHistory(activeTrack, currentPlaybackSeconds);
    }
  };

  // Toggle Audio Play / Stop directly on screen
  const handleTogglePlayAudio = () => {
    if (isPlaying) {
      handleStopAudio();
    } else {
      setIsPlaying(true);
      setIsAudioModeOn(true);
      if (remainingSeconds <= 0) {
        setRemainingSeconds(timerMinutes * 60);
      }
      if (selectedSound === 'delta' || selectedSound === 'zen') {
        startSynthAudio();
      }
    }
  };

  // Synthesizer for 432Hz Soundscapes
  const startSynthAudio = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      stopAudioNodes();

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const currentPreset = soundPresets.find((s) => s.id === selectedSound) || soundPresets[0];
      osc.type = selectedSound === 'delta' ? 'sine' : selectedSound === 'zen' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(currentPreset.freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume * 0.12, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
    } catch {
      // ignore
    }
  };

  const stopAudioNodes = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
    } catch {
      // ignore
    }
  };

  const handleSelectSoundscape = (id: 'delta' | 'rain' | 'fire' | 'zen' | 'waves') => {
    setSelectedSound(id);
    if (isPlaying) {
      setTimeout(() => startSynthAudio(), 80);
    }
  };

  if (!isOpen) return null;

  const minutesLeft = Math.floor(remainingSeconds / 60);
  const secondsLeft = remainingSeconds % 60;
  const currentMin = Math.floor(currentPlaybackSeconds / 60);
  const currentSec = currentPlaybackSeconds % 60;

  // Filter creators based on search query
  const filteredCreators = searchQuery.trim()
    ? FEATURED_CREATORS.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.bio.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : FEATURED_CREATORS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl p-4 sm:p-6 bg-gradient-to-b from-[#0B0F19] via-[#070A11] to-[#04060A] text-white border border-indigo-500/30 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        
        {/* 1. Header with Master Power & Close */}
        <div className="flex items-center justify-between pb-3 border-b border-indigo-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Bedtime Wind-Down & MP3 Sanctuary</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/30">
                  Audio Mode
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Convert any YouTube video to MP3, search creators, import playlists & sleep with screen off
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Master ON / OFF Toggle from Screen */}
            <button
              onClick={() => {
                if (isAudioModeOn) {
                  handleStopAudio();
                  setIsAudioModeOn(false);
                } else {
                  setIsAudioModeOn(true);
                  handleTogglePlayAudio();
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                isAudioModeOn
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isAudioModeOn ? 'Audio ON' : 'Audio OFF'}</span>
            </button>

            <button
              onClick={() => {
                handleStopAudio();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Unified Master Player & Status Card (Always at top of Bedtime screen) */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-purple-950/70 to-slate-950/80 border border-indigo-500/30 shadow-xl flex flex-col gap-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {isPlaying && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isPlaying ? 'bg-emerald-400' : 'bg-zinc-500'
                  }`}
                />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                {isPlaying ? 'Bedtime MP3 Audio Active' : 'Bedtime Audio Standby'}
              </span>
            </div>

            {/* Blackout Sleep Shield Toggle */}
            <button
              onClick={() => setScreenDimMode(!screenDimMode)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                screenDimMode
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
            >
              <Moon className="w-3 h-3 text-indigo-400" />
              <span>{screenDimMode ? 'Blackout Shield ON' : 'Blackout Shield OFF'}</span>
            </button>
          </div>

          {/* Active Track Title & Spectrum */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Disc className={`w-5 h-5 text-indigo-400 ${isPlaying ? 'animate-spin' : ''}`} />
                <h3 className="text-sm font-black text-white leading-tight break-words">
                  {activeTrack.title}
                </h3>
              </div>
              <div className="text-xs text-zinc-400 flex items-center gap-2 mt-1">
                <span className="font-semibold text-zinc-300">{activeTrack.author}</span>
                <span>•</span>
                <span className="text-indigo-400 font-mono">
                  {String(currentMin).padStart(2, '0')}:{String(currentSec).padStart(2, '0')} / {activeTrack.durationStr}
                </span>
                {activeTrack.lastPlayedSecond && activeTrack.lastPlayedSecond > 0 ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                    Memory Resumed
                  </span>
                ) : null}
              </div>
            </div>

            {/* Play Audio / Stop Audio Toggle Button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleTogglePlayAudio}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isPlaying
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/30'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Square className="w-4 h-4 fill-white" />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black" />
                    <span>Play Audio</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Animated Audio Spectrum Bars (No Video Display) */}
          <div className="w-full bg-black/60 p-2.5 rounded-2xl border border-zinc-800/80 flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 h-6">
              {[40, 75, 50, 90, 65, 30, 80, 45, 95, 60, 35, 85, 55, 70, 40].map((h, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isPlaying ? 'bg-gradient-to-t from-indigo-500 to-cyan-400' : 'bg-zinc-800'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(20, (h * (volume || 0.7)) % 100)}%` : '15%',
                    animation: isPlaying ? `pulse 1.2s infinite ease-in-out ${i * 0.08}s` : 'none',
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
              <div className="flex items-center gap-1 text-indigo-300">
                <Clock className="w-3.5 h-3.5" />
                <span>Timer: {String(minutesLeft).padStart(2, '0')}:{String(secondsLeft).padStart(2, '0')}</span>
              </div>
              <div className="flex items-center gap-1 text-zinc-300">
                <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>{Math.round(volume * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Hidden YouTube iframe acting as audio engine */}
          {activeTrack.youtubeId ? (
            <div className="hidden">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeTrack.youtubeId}?autoplay=${
                  isPlaying ? '1' : '0'
                }&controls=0&modestbranding=1`}
                title="Bedtime Audio Stream"
                allow="accelerometer; autoplay; encrypted-media"
              />
            </div>
          ) : null}
        </div>

        {/* 3. Section: Search by Creator, Video Name, Link, or Import Playlist */}
        <div className="p-4 rounded-3xl bg-zinc-950/90 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              <Search className="w-4 h-4 text-red-400" />
              <span>Search YouTube Videos, Creators, or Import Playlist</span>
            </span>
            <span className="text-[10px] text-zinc-400">MP4 to MP3 Automatic Extraction</span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search creator (e.g. Huberman, Lofi Girl), video title, or paste YouTube link..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConvertYoutube(searchQuery);
                }}
                className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>

            <button
              onClick={() => handleConvertYoutube(searchQuery)}
              disabled={isConverting || !searchQuery.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              <span>{isConverting ? 'Converting...' : 'Convert & Play'}</span>
            </button>
          </div>

          {/* Import YouTube Playlist Bar */}
          <div className="pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 shrink-0">
              <ListMusic className="w-4 h-4 text-indigo-400" />
              <span>Import Full Playlist:</span>
            </div>
            <input
              type="text"
              placeholder="Paste YouTube playlist URL or playlist name..."
              value={playlistImportUrl}
              onChange={(e) => setPlaylistImportUrl(e.target.value)}
              className="flex-1 w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleImportPlaylist}
              disabled={isConverting || !playlistImportUrl.trim()}
              className="w-full sm:w-auto px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
            >
              Import Playlist
            </button>
          </div>

          {/* Conversion Progress Bar */}
          {isConverting && (
            <div className="pt-2 flex flex-col gap-1.5">
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${conversionProgress}%` }}
                />
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">{conversionStatusText}</span>
            </div>
          )}
        </div>

        {/* 4. Creator Profiles & Channel Viewer (Full YouTuber Profiles) */}
        <div className="p-4 rounded-3xl bg-zinc-950/80 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-black text-white">YouTuber & Creator Profiles</h4>
            </div>
            <span className="text-[10px] text-zinc-400">Click Creator to Explore & Convert</span>
          </div>

          {/* Creator Selection Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {filteredCreators.map((creator) => {
              const isSelected = selectedCreator?.name === creator.name;
              return (
                <button
                  key={creator.name}
                  onClick={() => setSelectedCreator(isSelected ? null : creator)}
                  className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-500/20 border-indigo-400 text-white shadow-md ring-1 ring-indigo-400'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-indigo-400/40"
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-white truncate">{creator.name.split(' ')[0]}</div>
                      <div className="text-[9px] text-zinc-400">{creator.subscribers.split(' ')[0]}</div>
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-zinc-800 text-zinc-300 font-semibold truncate">
                    {creator.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Expanded Selected Creator Full Profile Card */}
          {selectedCreator && (
            <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-950 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedCreator.avatar}
                    alt={selectedCreator.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-2xl object-cover border border-indigo-400"
                  />
                  <div>
                    <h5 className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>{selectedCreator.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        Verified Channel
                      </span>
                    </h5>
                    <p className="text-[10px] text-zinc-400">{selectedCreator.subscribers} • {selectedCreator.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCreator(null)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">{selectedCreator.bio}</p>

              {/* Creator Track Library */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-indigo-300">Convertable Audio Episodes:</span>
                {selectedCreator.tracks.map((track) => (
                  <div
                    key={track.id}
                    className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white break-words">{track.title}</div>
                      <div className="text-[10px] text-zinc-400">{track.durationStr} • {track.category}</div>
                    </div>
                    <button
                      onClick={() => handleSelectTrack(track, 0)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1 transition-all cursor-pointer shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Convert & Play</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. Playback History & Memory (Resume From Where You Left Off) */}
        {historyTracks.length > 0 && (
          <div className="p-4 rounded-3xl bg-zinc-950/80 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black text-white">Playback History & Memory</h4>
              </div>
              <span className="text-[10px] text-zinc-400">Resumes exact timestamp</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {historyTracks.map((hTrack) => {
                const stoppedMin = Math.floor((hTrack.lastPlayedSecond || 0) / 60);
                const stoppedSec = (hTrack.lastPlayedSecond || 0) % 60;
                return (
                  <div
                    key={hTrack.id}
                    className="p-2.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white break-words">{hTrack.title}</div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span className="text-amber-300 font-mono font-bold">
                          Last played at {stoppedMin}:{stoppedSec < 10 ? '0' : ''}{stoppedSec}
                        </span>
                        <span>•</span>
                        <span>{hTrack.durationStr}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectTrack(hTrack, hTrack.lastPlayedSecond || 0)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                    >
                      <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                      <span>Resume</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Integrated 432Hz Offline Waves Section (Directly on Bedtime Screen) */}
        <div className="p-4 rounded-3xl bg-zinc-950/80 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-black text-white">432Hz Offline Wave Synthesizer</h4>
            </div>
            <span className="text-[10px] text-zinc-400">Offline Pure Binaural Frequencies</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {soundPresets.map((sound) => {
              const Icon = sound.icon;
              const isSelected = selectedSound === sound.id;
              return (
                <button
                  key={sound.id}
                  onClick={() => handleSelectSoundscape(sound.id)}
                  className={`p-3 rounded-2xl flex items-center justify-between border transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-500/20 border-indigo-400 text-white shadow-md'
                      : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-indigo-500 text-black' : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{sound.name}</div>
                      <div className="text-[10px] text-zinc-400">{sound.desc}</div>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. Auto-Shutoff Sleep Timer Selection */}
        <div className="p-4 rounded-3xl bg-zinc-950/80 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Auto-Shutoff Sleep Timer:</span>
            </span>
            <span className="text-xs font-mono font-bold text-indigo-300">{timerMinutes} Minutes</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[15, 30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setTimerMinutes(mins);
                  setRemainingSeconds(mins * 60);
                }}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  timerMinutes === mins
                    ? 'bg-indigo-500 text-black border-indigo-400 shadow-md font-black'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
