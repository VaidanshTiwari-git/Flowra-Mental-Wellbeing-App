export type ThemeMode = 'dark' | 'light';

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bgLight: string;
  cardLight: string;
  borderLight: string;
  textLight: string;
  gradient: string;
  dotColor: string;
}

export type CompanionType =
  | 'tree'
  | 'cat'
  | 'dog'
  | 'fox'
  | 'bunny'
  | 'panda'
  | 'bear'
  | 'otter'
  | 'owl'
  | 'penguin'
  | 'koala'
  | 'hamster'
  | 'dragon';

export interface CompanionState {
  type: CompanionType;
  name: string;
  aura?: number;
  xp?: number;
  level: number;
  foodBowlsAvailable?: number;
  lastWateredDate?: string;
  lastFedDate?: string;
  mood: 'radiant' | 'happy' | 'neutral' | 'drooping' | 'hungry' | 'jailed' | 'withered';
  timesWatered?: number;
  totalLeaves?: number;
  leavesCount?: number;
  isJailed?: boolean;
  isWithering?: boolean;
  isWithered?: boolean;
  growthPercent?: number;
  feedCount?: number;
  tapCountToday?: number;
  daysMissed?: number;
  stage?: number;
  dailyNotification?: string;
}

export interface TaskItem {
  id: string;
  day: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  category: 'Core Focus' | 'Deep Work' | 'Micro-Drill' | 'Habit' | 'Exam Prep' | 'Wellness' | 'Core Sprint' | 'Core' | string;
  actionUrl?: string;
  learningPoints?: string[];
  isCompleted: boolean;
  auraReward: number;
  completedAt?: string;
  customTask?: boolean;
}

export interface TimetableBlock {
  timeSlot: string;
  activity: string;
  tag: string;
  isCoreGoal: boolean;
  isDone?: boolean;
}

export interface WeeklyMilestone {
  weekNum: number;
  title: string;
  focusArea: string;
  keyProject: string;
  unlockableBadge?: string;
  unlockablePetBadge?: string;
  isUnlocked?: boolean;
}

export interface RoadmapData {
  summary: string;
  totalDays?: number;
  totalWeeks?: number;
  todayTask?: TaskItem;
  weeklyMilestones: WeeklyMilestone[];
  dailyTimetable: TimetableBlock[];
}

export interface AppUsageItem {
  id?: string;
  name?: string;
  appName?: string;
  category: string;
  isProductive?: boolean;
  minutes?: number;
  minutesSpent?: number;
  pickups?: number;
  notifications?: number;
  brandColor?: string;
  color?: string;
  iconName?: string;
  logoType?: string;
  iconUrl?: string;
}

export interface PhoneAnalyticsState {
  permissionGranted?: boolean;
  totalScreenTimeMinutes: number;
  productiveMinutes: number;
  nonProductiveMinutes: number;
  dailyPickupsCount?: number;
  dailyNotificationsCount?: number;
  phoneUnlocksToday?: number;
  notificationsReceivedToday?: number;
  totalAppPickups?: number;
  topApps?: AppUsageItem[];
  apps?: AppUsageItem[];
  categoriesBreakdown?: Array<{ name: string; minutes: number; percentage: number }>;
  lastInterventionTimestamp?: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  title: string;
  type: 'reminder' | 'event' | 'milestone' | 'lesson';
  isCompleted?: boolean;
  completed?: boolean;
}

export type StreakCalendarEvent = CalendarEvent;

export interface StreakDayInfo {
  date: string;
  active: boolean;
  auraEarned: number;
  isStreakFire: boolean;
  events?: StreakCalendarEvent[];
}

export interface HabitItem {
  id: string;
  title: string;
  category: 'health' | 'learning' | 'lifestyle' | 'mindfulness';
  frequency: 'daily' | 'weekly';
  isCompletedToday: boolean;
  streak: number;
  auraReward: number;
  icon: string;
}

export interface QuizQuestion {
  id: string;
  questionNumber: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  subtopic?: string;
}

export interface ModuleContent {
  id: string;
  moduleNumber: number;
  title: string;
  subtitle: string;
  readingTimeMinutes?: number;
  wordCount?: number;
  contentMarkdown: string;
  keyTakeaways: string[];
  codeSnippets?: Array<{ title: string; language: string; code: string }>;
  isRead?: boolean;
  isCompleted?: boolean;
}

export interface LessonPackage {
  id: string;
  goal: string;
  topic: string;
  title: string;
  youtubeVideoId: string;
  youtubeUrl?: string;
  durationStr: string;
  deepSummary: string;
  modules?: ModuleContent[];
  keyTakeaways: string[];
  quiz: QuizQuestion[];
  isCompleted?: boolean;
  quizScore?: number;
  quizSubmitted?: boolean;
  selectedAnswers?: Record<number, number>;
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  publishedYear?: number;
  coverUrl?: string;
  description: string;
  archiveUrl: string;
  openLibraryUrl: string;
  keyPrinciples: string[];
  rating: number;
  readingMinutes: number;
  suggestedAction: string;
}

export interface WeeklyProject {
  weekNum: number;
  title: string;
  description: string;
  challengeType: 'coding' | 'case-study' | 'quiz-game' | 'system-design' | 'speaking-drill';
  starterPrompt: string;
  submission?: string;
  isCompleted: boolean;
  score?: number;
  feedback?: string;
  strengths?: string[];
  weaknesses?: string[];
  revisionGuide?: string;
}

export interface SocialLink {
  id: string;
  platform: 'instagram' | 'linkedin' | 'x' | 'github' | 'snapchat' | 'youtube' | 'website' | 'email' | 'phone';
  urlOrHandle: string;
  isPublic: boolean;
}

export interface ClubMember {
  id: string;
  name: string;
  avatar?: string;
  aura: number;
  streak: number;
  lastActive: string;
  currentDay: number;
  status: 'active' | 'slacking' | 'on_fire';
}

export interface ClubMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  time: string;
  isSystem?: boolean;
}

export interface ClubGroup {
  id: string;
  name: string;
  description: string;
  planTrack: string;
  isPrivate: boolean;
  accessKey: string;
  maxMembers: number;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  ownerLocation?: string;
  ownerSocials: SocialLink[];
  members: ClubMember[];
  messages: ClubMessage[];
  sharedNotes: Array<{ id: string; title: string; content: string; authorName: string; date: string }>;
  joined: boolean;
}

export interface CommunityNote {
  id: string;
  title: string;
  content: string;
  authorName: string;
  date: string;
  readTime: string;
  likes: number;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorStreak?: number;
  authorGoal?: string;
  authorPetName?: string;
  authorPetType?: string;
  type: 'study-squad' | 'social-impact' | 'challenge' | 'book-club';
  title: string;
  content: string;
  tags?: string[];
  locationOrLink?: string;
  targetLocation?: string;
  contactInfo?: string;
  membersCount?: number;
  maxMembers?: number;
  urgency?: 'normal' | 'urgent' | 'high' | string;
  createdAt: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  topic: string;
  description: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  ownerLocation?: string;
  ownerSocials: SocialLink[];
  followersCount: number;
  isFollowing: boolean;
  notes: CommunityNote[];
  announcements: string[];
}

export type GoalType = string;

export interface InterventionChallenge {
  id?: string;
  title: string;
  appName?: string;
  minutesSpent?: number;
  durationMinutes?: number;
  type?: string;
  prompt?: string;
  actionStep?: string;
  question?: string;
  options?: string[];
  correctOptionIndex?: number;
  explanation?: string;
  auraReward?: number;
  xpReward?: number;
}

export interface AuraTierBadge {
  id: string;
  tier: 'silver' | 'gold' | 'platinum' | 'diamond';
  level: number;
  name: string;
  quarter: 1 | 2 | 3 | 4;
  targetDay: number;
  unlocked: boolean;
  unlockedAt?: string;
  description: string;
  iconName: string;
  auraReward: number;
}

export interface PersonalizationAnswers {
  name?: string;
  goal?: string;
  primaryGoal?: string;
  targetRole?: string;
  preparingFor?: string;
  ageRange?: string;
  profession?: string;
  dailyPhoneTime?: string;
  productiveTime?: string;
  nonProductiveTime?: string;
  durationOption?: 'custom' | 'auto';
  planDurationDays?: number;
  customPlanDurationDays?: number;
  customDurationDays?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'very_hard';
  currentSkillLevel?: string;
  dailyHoursAvailable?: number;
  distractionTrigger?: string;
  primaryDistractionApp?: string;
  distractionApps?: string[];
  preferredLearningStyle?: string;
  clubPreference?: string;
  companionType?: CompanionType;
  companionName?: string;
  chosenColorPalette?: string;
  selectedPaletteId?: string;
  colorPaletteId?: string;
  themeMode?: ThemeMode;
  negativeNotificationsEnabled?: boolean;
  negativeNotificationThresholdMins?: number;
  bedtimeHour?: number | string;
  customGoalText?: string;
  weakAreas?: string[];
  otherAnswers?: Record<string, string>;
  otherCustomAnswers?: Record<string, string>;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  photoVisibility?: 'public' | 'friends' | 'private';
  isGuest?: boolean;
  themeMode?: ThemeMode;
  selectedPalette?: string;
  colorPaletteId?: string;
  goal: string;
  preparationTrack?: string;
  customPlanDurationDays?: number;
  totalRoadmapDays?: number;
  planDurationDays?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'very_hard';
  companion: CompanionState;
  currentDay: number;
  streak: number;
  aura?: number;
  meaningfulScore: number;
  totalProductiveHours: number;
  totalSavedScrollHours: number;
  bedtimeHour?: string;
  lastActiveDate?: string;
  createdAt?: string;
  isSetupComplete: boolean;
  roadmap?: RoadmapData;
  phoneAnalytics?: PhoneAnalyticsState;
  streakCalendar?: Record<string, StreakDayInfo>;
  customEvents?: StreakCalendarEvent[];
  tasks?: TaskItem[];
  completedTasksHistory?: string[];
  weeklyProjects?: WeeklyProject[];
  clubs?: ClubGroup[];
  communities?: CommunityGroup[];
  avatar?: string;
  todayTask?: TaskItem;
  timetable?: TimetableBlock[];
  weeklyMilestones?: WeeklyMilestone[];
  chatHistory?: Array<{ role: 'user' | 'assistant'; text: string; time: string }>;
  personalization?: PersonalizationAnswers;
  personalizationAnswers?: PersonalizationAnswers;
}
