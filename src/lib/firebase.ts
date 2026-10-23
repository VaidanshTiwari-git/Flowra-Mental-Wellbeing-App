import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { UserProfile, ClubGroup, CommunityGroup, CommunityPost, AppUsageItem } from '../types';

export const firebaseConfig = firebaseConfigData;

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfigData.firestoreDatabaseId || undefined);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Safe Auth helpers with concurrency lock
let isGoogleSignInInProgress = false;

export async function signInWithGoogle(): Promise<User> {
  if (isGoogleSignInInProgress) {
    throw new Error('Google Sign-In is already in progress. Please complete the open popup.');
  }
  isGoogleSignInInProgress = true;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.info('[Flowra Auth Success]: Logged in with Google as', result.user.email);
    return result.user;
  } catch (error: any) {
    const errorCode = error?.code || '';
    const errorMsg = error?.message || String(error);
    console.error('[Flowra Google Sign-In Error Details]:', { errorCode, errorMsg, raw: error });

    // If popup was blocked by browser, attempt signInWithRedirect fallback
    if (errorCode === 'auth/popup-blocked') {
      try {
        console.warn('[Flowra Auth]: Popup was blocked by browser. Attempting signInWithRedirect fallback...');
        await signInWithRedirect(auth, googleProvider);
        throw new Error('Redirecting to Google Sign-In...');
      } catch (redirectErr: any) {
        console.error('[Flowra Auth Redirect Error]:', redirectErr);
        throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site or use email sign-in.');
      }
    }

    if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
      throw new Error('Google Sign-In window was closed before finishing.');
    }

    if (errorCode === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      const domainErr: any = new Error(
        `Domain "${currentHost}" is not authorized for Google Sign-In in Firebase Console. Please add it to Firebase Console > Authentication > Settings > Authorized Domains, or sign in with Email / Password or Guest Mode.`
      );
      domainErr.code = 'auth/unauthorized-domain';
      domainErr.domain = currentHost;
      throw domainErr;
    }

    if (errorCode === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection and try again.');
    }

    throw new Error(errorMsg || 'Google Sign-In failed. Please try again.');
  } finally {
    setTimeout(() => {
      isGoogleSignInInProgress = false;
    }, 500);
  }
}

export async function checkRedirectAuthResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      console.info('[Flowra Auth Redirect Result]: Found user', result.user.email);
      return result.user;
    }
  } catch (err) {
    console.warn('[Flowra Auth] getRedirectResult check:', err);
  }
  return null;
}

export async function loginWithEmail(email: string, pass: string) {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function registerWithEmail(email: string, pass: string) {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function logoutUser() {
  return await signOut(auth);
}

// User Document operations
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    // Check local cache
    const local = localStorage.getItem(`flowra_user_${uid}`) || localStorage.getItem('flowra_guest_user');
    if (local) {
      return JSON.parse(local) as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn('Firestore fetch error, falling back to local cache:', err);
    const local = localStorage.getItem(`flowra_user_${uid}`) || localStorage.getItem('flowra_guest_user');
    if (local) {
      return JSON.parse(local) as UserProfile;
    }
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    // Save to local cache first for instant UI response and offline safety
    localStorage.setItem(`flowra_user_${profile.uid}`, JSON.stringify(profile));
    if (profile.isGuest) {
      localStorage.setItem('flowra_guest_user', JSON.stringify(profile));
      return;
    }
    // Save to Cloud Firestore
    const userDocRef = doc(db, 'users', profile.uid);
    await setDoc(userDocRef, profile, { merge: true });
  } catch (err) {
    console.warn('Firestore save warning (cached locally):', err);
    localStorage.setItem(`flowra_user_${profile.uid}`, JSON.stringify(profile));
  }
}

// Migrate cached guest profile to Cloud Firestore when user signs in with Google/Email
export async function syncGuestDataToCloud(user: User, guestProfile: UserProfile): Promise<UserProfile> {
  const guestAura = guestProfile.companion?.aura || guestProfile.companion?.xp || 0;
  const mergedProfile: UserProfile = {
    ...guestProfile,
    uid: user.uid,
    email: user.email || guestProfile.email,
    displayName: user.displayName || guestProfile.displayName,
    photoURL: user.photoURL || guestProfile.photoURL,
    isGuest: false,
  };

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const remoteData = snap.data() as UserProfile;
      const remoteAura = remoteData.companion?.aura || remoteData.companion?.xp || 0;
      const finalAura = Math.max(guestAura, remoteAura);
      mergedProfile.streak = Math.max(guestProfile.streak, remoteData.streak || 0);
      mergedProfile.companion = {
        ...mergedProfile.companion,
        aura: finalAura,
        xp: finalAura,
      };
    }
    await setDoc(userDocRef, mergedProfile, { merge: true });
    localStorage.setItem(`flowra_user_${user.uid}`, JSON.stringify(mergedProfile));
    localStorage.removeItem('flowra_guest_user');
  } catch (e) {
    console.warn('Migration to cloud fallback locally:', e);
    localStorage.setItem(`flowra_user_${user.uid}`, JSON.stringify(mergedProfile));
  }

  return mergedProfile;
}

export const migrateGuestDataToCloud = syncGuestDataToCloud;

// Community Posts
export async function fetchCommunityPosts(): Promise<CommunityPost[]> {
  try {
    const postsRef = collection(db, 'community_posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'), limit(25));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CommunityPost));
    }
  } catch (e) {
    console.warn('Community posts firestore fallback:', e);
  }

  // Curated default community posts
  return [
    {
      id: 'post-1',
      authorId: 'u-101',
      authorName: 'Sarah K.',
      authorAvatar: '👩‍💻',
      authorStreak: 24,
      authorGoal: 'software-engineering' as any,
      type: 'study-squad',
      title: 'Daily 06:30 AM LeetCode & System Design Silent Sprint Squad',
      content: 'Looking for 3 dedicated peers preparing for Top Tech SDE roles. We do 45 mins timer silent focus + 15 mins peer explanation every morning.',
      tags: ['SDE', 'Algorithms', 'MorningSprint'],
      locationOrLink: 'Discord Voice #room-alpha',
      membersCount: 4,
      maxMembers: 5,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'post-2',
      authorId: 'u-102',
      authorName: 'David L.',
      authorAvatar: '⚡',
      authorStreak: 41,
      authorGoal: 'competitive-exams' as any,
      type: 'challenge',
      title: '30-Day Zero-Reels Dopamine Reset Challenge (₹0 Stake)',
      content: 'We log daily screen time every night at 21:30. Anyone who exceeds 20 mins non-productive scroll owes the group a 2-minute knowledge micro-lesson.',
      tags: ['NoDoomscroll', 'DopamineReset', 'StreakWarriors'],
      locationOrLink: 'Flowra Accountability Feed',
      membersCount: 18,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'post-3',
      authorId: 'u-103',
      authorName: 'Priya R.',
      authorAvatar: '📚',
      authorStreak: 15,
      authorGoal: 'upskilling' as any,
      type: 'book-club',
      title: 'Weekly Book Synthesis: "Deep Work" & "Atomic Habits" Implementation',
      content: 'Reading 10 pages daily and sharing real application breakthroughs every Sunday. All companion levels welcome!',
      tags: ['DeepWork', 'HabitLoop', 'ReadingClub'],
      locationOrLink: 'Weekly Sunday Google Meet',
      membersCount: 12,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ];
}

export async function createCommunityPost(post: Omit<CommunityPost, 'id' | 'createdAt'>): Promise<CommunityPost> {
  const newPost: CommunityPost = {
    ...post,
    id: `post-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  try {
    const postsRef = collection(db, 'community_posts');
    await addDoc(postsRef, {
      ...newPost,
      serverTime: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Firestore createCommunityPost local fallback:', e);
  }

  return newPost;
}

// ============================================================================
// DYNAMIC APP USAGE & SCREEN TIME LOGS (Firestore dailyLogs Collection)
// ============================================================================

export interface DailyAppLogEntry {
  id?: string;
  userId: string;
  appName: string;
  category: string;
  minutesSpent: number;
  isProductive: boolean;
  color?: string;
  date: string; // YYYY-MM-DD
  loggedAt: string;
}

const DEFAULT_APP_COLORS: Record<string, string> = {
  'instagram': '#EC4899',
  'instagram reels': '#EC4899',
  'youtube': '#EF4444',
  'youtube shorts': '#EF4444',
  'vs code': '#38BDF8',
  'flowra': '#10B981',
  'flowra study': '#10B981',
  'leetcode': '#FFA116',
  'notion': '#E2E8F0',
  'whatsapp': '#22C55E',
  'reddit': '#F97316',
  'kindle': '#A855F7',
  'tiktok': '#00F2FE',
  'twitter': '#06B6D4',
  'x': '#06B6D4',
  'spotify': '#1DB954',
  'duolingo': '#58CC02',
  'netflix': '#E50914',
  'chatgpt': '#10A37F',
  'github': '#94A3B8',
  'discord': '#5865F2',
  'telegram': '#2AABEE',
  'chess.com': '#7FA650',
};

const PRODUCTIVE_CATEGORIES = new Set([
  'education',
  'deep work',
  'books',
  'reading',
  'organization',
  'coding',
  'development',
  'learning',
  'language',
  'health',
  'work',
  'mind games',
  'productivity',
]);

export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function detectIsProductive(appName: string, category: string): boolean {
  const appLower = appName.toLowerCase().trim();
  const catLower = category.toLowerCase().trim();

  if (
    appLower.includes('flowra') ||
    appLower.includes('code') ||
    appLower.includes('leetcode') ||
    appLower.includes('notion') ||
    appLower.includes('kindle') ||
    appLower.includes('duolingo') ||
    appLower.includes('book') ||
    appLower.includes('study')
  ) {
    return true;
  }

  if (
    appLower.includes('reels') ||
    appLower.includes('shorts') ||
    appLower.includes('tiktok') ||
    appLower.includes('instagram') ||
    appLower.includes('reddit') ||
    appLower.includes('netflix') ||
    appLower.includes('gaming')
  ) {
    return false;
  }

  return PRODUCTIVE_CATEGORIES.has(catLower);
}

export function getAppBrandColor(appName: string, category: string, isProductive: boolean): string {
  const lower = appName.toLowerCase().trim();
  for (const [key, color] of Object.entries(DEFAULT_APP_COLORS)) {
    if (lower.includes(key)) {
      return color;
    }
  }
  return isProductive ? '#10B981' : '#F43F5E';
}

/**
 * Fetch today's logged app entries for a user from Firestore (subcollection users/{uid}/dailyLogs)
 * with instant local cache fallback.
 */
export async function fetchUserTodayAppLogs(uid: string, targetDate: string = getTodayDateString()): Promise<DailyAppLogEntry[]> {
  const cacheKey = `flowra_app_logs_${uid}_${targetDate}`;
  const localCache = localStorage.getItem(cacheKey);
  let cachedLogs: DailyAppLogEntry[] = [];
  if (localCache) {
    try {
      cachedLogs = JSON.parse(localCache);
    } catch {
      cachedLogs = [];
    }
  }

  try {
    const logsRef = collection(db, 'users', uid, 'dailyLogs');
    const q = query(logsRef, where('date', '==', targetDate), orderBy('loggedAt', 'desc'), limit(50));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const firestoreLogs = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as DailyAppLogEntry[];

      localStorage.setItem(cacheKey, JSON.stringify(firestoreLogs));
      return firestoreLogs;
    }
  } catch (err) {
    console.warn('[Flowra Firestore] fetchUserTodayAppLogs query fallback to cache:', err);
  }

  return cachedLogs;
}

/**
 * Log a new app usage entry for the current user into Firestore & local cache.
 */
export async function logUserAppUsage(
  uid: string,
  entry: {
    appName: string;
    category: string;
    minutesSpent: number;
    isProductive?: boolean;
    color?: string;
    date?: string;
  }
): Promise<DailyAppLogEntry> {
  const dateStr = entry.date || getTodayDateString();
  const isProductive =
    entry.isProductive !== undefined
      ? entry.isProductive
      : detectIsProductive(entry.appName, entry.category);
  const color = entry.color || getAppBrandColor(entry.appName, entry.category, isProductive);

  const newLog: DailyAppLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: uid,
    appName: entry.appName.trim(),
    category: entry.category.trim(),
    minutesSpent: Math.max(1, Math.round(entry.minutesSpent)),
    isProductive,
    color,
    date: dateStr,
    loggedAt: new Date().toISOString(),
  };

  // 1. Update local cache immediately for instant UI responsiveness
  const cacheKey = `flowra_app_logs_${uid}_${dateStr}`;
  const existingRaw = localStorage.getItem(cacheKey);
  const currentLogs: DailyAppLogEntry[] = existingRaw ? JSON.parse(existingRaw) : [];
  const updatedLogs = [newLog, ...currentLogs];
  localStorage.setItem(cacheKey, JSON.stringify(updatedLogs));

  // 2. Persist to Firestore subcollection users/{uid}/dailyLogs
  try {
    const logsRef = collection(db, 'users', uid, 'dailyLogs');
    const docRef = await addDoc(logsRef, {
      ...newLog,
      serverTimestamp: serverTimestamp(),
    });
    newLog.id = docRef.id;
    localStorage.setItem(cacheKey, JSON.stringify(updatedLogs.map((l) => (l.id === newLog.id ? newLog : l))));
  } catch (err) {
    console.warn('[Flowra Firestore] logUserAppUsage saved to local cache:', err);
  }

  return newLog;
}

/**
 * Delete a logged app entry
 */
export async function deleteUserAppLog(uid: string, logId: string, targetDate: string = getTodayDateString()): Promise<void> {
  const cacheKey = `flowra_app_logs_${uid}_${targetDate}`;
  const existingRaw = localStorage.getItem(cacheKey);
  if (existingRaw) {
    const currentLogs: DailyAppLogEntry[] = JSON.parse(existingRaw);
    const filtered = currentLogs.filter((l) => l.id !== logId);
    localStorage.setItem(cacheKey, JSON.stringify(filtered));
  }

  try {
    const logDocRef = doc(db, 'users', uid, 'dailyLogs', logId);
    await deleteDoc(logDocRef);
  } catch (err) {
    console.warn('[Flowra Firestore] deleteUserAppLog error:', err);
  }
}

