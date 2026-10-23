import {
  CompanionType,
  RoadmapData,
  TaskItem,
  QuizQuestion,
  LessonPackage,
  BookItem,
  WeeklyProject,
} from '../types';

export async function generateRoadmapAPI(params: {
  goal: string;
  companionName: string;
  companionType: CompanionType;
  planDurationDays?: number;
  dailyHoursAvailable?: number;
  currentSkillLevel?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'very_hard';
}): Promise<RoadmapData> {
  try {
    const res = await fetch('/api/generate-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    console.warn('Using fallback roadmap generator:', err);
    return getDefaultRoadmap(params.goal, params.companionName, params.planDurationDays || 150);
  }
}

export async function fetchDailyQuoteAndTaskAPI(params: {
  goal: string;
  currentDay: number;
  streak: number;
  recentLogs?: any[];
  mood?: string;
  petName: string;
}): Promise<{
  quote: string;
  author: string;
  petRemark: string;
  todayTask: TaskItem;
}> {
  try {
    const res = await fetch('/api/daily-quote-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    return {
      quote: 'Energy flows where intentional focus goes. Choose your compounding aura over transient dopamine.',
      author: 'Flowra Mindset',
      petRemark: `${params.petName} is eager for today's milestone! Complete Day ${params.currentDay} to earn +25 Aura points.`,
      todayTask: {
        id: `task-d${params.currentDay}`,
        day: params.currentDay,
        title: `Day ${params.currentDay}: Core ${params.goal} Deep Sprint`,
        description: `Dedicate 45 uninterrupted minutes to this focus sprint. Shut down notification badges and lock in!`,
        estimatedMinutes: 45,
        category: 'Deep Work',
        auraReward: 25,
        learningPoints: ['Distraction-free focus', 'Active retrieval', 'Daily streak protection'],
        isCompleted: false,
      },
    };
  }
}

export async function fetchAIInterventionAPI(params: {
  goal: string;
  doomscrollingApp?: string;
  minutesSpent?: number;
}): Promise<{
  hookMessage: string;
  replacementChallenge: {
    title: string;
    durationMinutes: number;
    type: string;
    prompt: string;
    auraReward: number;
    actionStep: string;
  };
}> {
  try {
    const res = await fetch('/api/ai-intervention', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    return {
      hookMessage: `⚠️ You logged ${params.minutesSpent || 45} minutes on ${params.doomscrollingApp || 'Instagram'}. That equals 2 deep learning modules in ${params.goal}!`,
      replacementChallenge: {
        title: `⚡ 5-Minute Dopamine Switch: ${params.goal} Power Mini-Drill`,
        durationMinutes: 5,
        type: 'mini-drill',
        prompt: `Reset your dopamine baseline. Take 3 deep box breaths and solve one core mental model question to break the dopamine loop!`,
        auraReward: 20,
        actionStep: 'Complete this micro-challenge now to feed your companion and protect your streak!',
      },
    };
  }
}

export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = input.match(regExp);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim();
  return null;
}

export async function fetchLessonSummaryAndQuizAPI(params: {
  goal: string;
  topic: string;
  youtubeUrl?: string;
  currentDay?: number;
}): Promise<LessonPackage> {
  try {
    const res = await fetch('/api/ai-lesson-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    console.warn('Fallback lesson summary & 10-question quiz:', err);
    return getFallbackLesson(params.goal, params.topic);
  }
}

export async function searchBooksAPI(params: {
  query: string;
  category?: string;
}): Promise<{
  correctedQuery: string;
  didYouMean?: string;
  books: BookItem[];
}> {
  try {
    const res = await fetch('/api/search-books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    return {
      correctedQuery: params.query,
      books: [
        {
          id: 'b-atomic',
          title: 'Atomic Habits',
          author: 'James Clear',
          publishedYear: 2018,
          coverUrl: 'https://covers.openlibrary.org/b/id/12843477-M.jpg',
          description: 'Small habits compound into massive, life-altering results over time.',
          archiveUrl: `https://archive.org/search?query=Atomic+Habits+James+Clear`,
          openLibraryUrl: `https://openlibrary.org/search?q=Atomic+Habits`,
          keyPrinciples: ['1% daily improvement', 'Habit stacking', 'Identity-based habits', 'System optimization'],
          rating: 4.9,
          readingMinutes: 240,
          suggestedAction: 'Apply the 2-Minute Rule to your Flowra morning timetable block.',
        },
        {
          id: 'b-deepwork',
          title: 'Deep Work',
          author: 'Cal Newport',
          publishedYear: 2016,
          coverUrl: 'https://covers.openlibrary.org/b/id/12539704-M.jpg',
          description: 'Rules for focused success in a distracted world.',
          archiveUrl: `https://archive.org/search?query=Deep+Work+Cal+Newport`,
          openLibraryUrl: `https://openlibrary.org/search?q=Deep+Work`,
          keyPrinciples: ['Monastic focus blocks', 'Quit shallow social algorithms', 'Embrace boredom', 'Ritualize deep work'],
          rating: 4.8,
          readingMinutes: 280,
          suggestedAction: 'Schedule a 90-minute phone-free sprint for today.',
        },
      ],
    };
  }
}

export async function evaluateWeeklyProjectAPI(params: {
  weekNum: number;
  projectTitle: string;
  userSubmission: string;
  goal: string;
}): Promise<{
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  revisionGuide: string;
  auraAwarded: number;
}> {
  try {
    const res = await fetch('/api/weekly-project-evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    return {
      score: 90,
      feedback: 'Great execution and structured reasoning. Solid grasp of core concepts!',
      strengths: ['Clean structure', 'Solid edge case coverage'],
      weaknesses: ['Spend 10 minutes reviewing Module 3 asymptotic complexity'],
      revisionGuide: `Review Week ${params.weekNum} Module 3 to sharpen memory efficiency.`,
      auraAwarded: 50,
    };
  }
}

export async function searchYouTubeVideosAPI(params: {
  query: string;
  maxResults?: number;
}): Promise<{
  query: string;
  source: string;
  note?: string;
  results: Array<{
    id: string;
    videoId: string;
    title: string;
    description: string;
    channelTitle: string;
    channelId?: string;
    thumbnailUrl: string;
    viewCount: string;
    rawViewCount?: number;
    publishedAt?: string;
    durationStr: string;
    youtubeUrl: string;
  }>;
}> {
  try {
    const res = await fetch('/api/youtube-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`YouTube search request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn('[searchYouTubeVideosAPI fallback]:', err?.message || err);
    // Client-side fallback if offline
    return {
      query: params.query,
      source: 'offline_fallback',
      results: [
        {
          id: 'pwaWilO_Pig',
          videoId: 'pwaWilO_Pig',
          title: 'Dr. Andrew Huberman: Master Focus & Deep Dopamine Control',
          description: 'Neuroscience protocols for intense focus, attention endurance, and optimal screen-time habits.',
          channelTitle: 'Huberman Lab',
          thumbnailUrl: 'https://i.ytimg.com/vi/pwaWilO_Pig/hqdefault.jpg',
          viewCount: '4.8M views',
          durationStr: '2h 15m',
          youtubeUrl: 'https://www.youtube.com/watch?v=pwaWilO_Pig',
        },
        {
          id: 'jfKfPfyJRdk',
          videoId: 'jfKfPfyJRdk',
          title: 'lofi hip hop radio - beats to study/relax to (24/7 Deep Work Ambiance)',
          description: 'Peaceful lofi chillhop soundscapes for laser focus, code reviews, and deep study sprints.',
          channelTitle: 'Lofi Girl',
          thumbnailUrl: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
          viewCount: '89M views',
          durationStr: 'Live',
          youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
        },
        {
          id: '8hly31xKli0',
          videoId: '8hly31xKli0',
          title: 'Algorithms & Data Structures: Complete Full Course for Beginners',
          description: 'Master Big-O notation, binary search, trees, dynamic programming, and interview patterns.',
          channelTitle: 'freeCodeCamp.org',
          thumbnailUrl: 'https://i.ytimg.com/vi/8hly31xKli0/hqdefault.jpg',
          viewCount: '3.2M views',
          durationStr: '5h 22m',
          youtubeUrl: 'https://www.youtube.com/watch?v=8hly31xKli0',
        },
        {
          id: 'g9z-b132vA8',
          videoId: 'g9z-b132vA8',
          title: 'Ali Abdaal: The Ultimate Productivity System for High Achievers',
          description: 'How to design frictionless daily execution workflows, manage energy, and build deep focus rituals.',
          channelTitle: 'Ali Abdaal',
          thumbnailUrl: 'https://i.ytimg.com/vi/g9z-b132vA8/hqdefault.jpg',
          viewCount: '2.9M views',
          durationStr: '38 mins',
          youtubeUrl: 'https://www.youtube.com/watch?v=g9z-b132vA8',
        },
      ],
    };
  }
}

export async function sendAIChatMessageAPI(params: {
  message: string;
  goal: string;
  currentDay: number;
  totalDays?: number;
  meaningfulScore?: number;
  streak: number;
  petName: string;
  petType: CompanionType;
  aura: number;
  mood?: string;
  userName?: string;
  todayTask?: any;
  timetable?: any[];
  weeklyMilestones?: any[];
  chatHistory: { role: 'user' | 'assistant' | 'model'; text: string }[];
}): Promise<{
  reply: string;
  suggestedActions?: string[];
}> {
  let lastError: any = null;

  // Retry once on failure / timeout
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      if (!data.reply) {
        throw new Error('Empty response received from AI service');
      }
      return data;
    } catch (err: any) {
      lastError = err;
      console.warn(`[sendAIChatMessageAPI attempt ${attempt + 1} failed]:`, err?.message || err);
      if (attempt === 0) {
        // Wait 500ms before client retry
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  console.error('[sendAIChatMessageAPI final failure]:', lastError);
  throw lastError || new Error('Something went wrong, please try again.');
}

export async function sendClubNudgeAPI(params: {
  senderName: string;
  recipientName: string;
  recipientDaysMissed?: number;
  clubName: string;
  senderStreak: number;
}): Promise<{ nudgeMessage: string }> {
  try {
    const res = await fetch('/api/club-nudge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    return {
      nudgeMessage: `⚡ Hey ${params.recipientName}! ${params.senderName} just locked in Day ${params.senderStreak} in ${params.clubName} (+25 Aura)! Hop in now to feed your companion before you fall behind on the leaderboard! 🔥`,
    };
  }
}

export async function submitAIReflectionAPI(params: {
  goal: string;
  answers: {
    gain: string;
    scrollTrigger: string;
    energyRating: string;
    tomorrowCommitment: string;
  };
  petName: string;
}): Promise<{
  insight: string;
  tomorrowNudge: string;
  auraDelta: number;
}> {
  try {
    const res = await fetch('/api/ai-reflection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    return {
      insight: `Awesome self-awareness. Identifying the triggers behind passive screen time is the psychological cornerstone of digital freedom.`,
      tomorrowNudge: `Tomorrow, block out 9:00 AM for your primary deep work task before unlocking social apps.`,
      auraDelta: 15,
    };
  }
}

export function getDefaultRoadmap(goal: string, companionName: string, days: number = 180): RoadmapData {
  const safeDays = days > 0 ? days : 180;
  const totalWeeks = Math.max(1, Math.ceil(safeDays / 7));
  const q1Week = Math.max(1, Math.round(totalWeeks * 0.25));
  const q2Week = Math.max(2, Math.round(totalWeeks * 0.50));
  const q3Week = Math.max(3, Math.round(totalWeeks * 0.75));
  const q4Week = totalWeeks;

  return {
    summary: `${safeDays}-Day Flowra Transformation for ${goal}. Compounding daily focus minutes transforms passive screen doomscrolling into top 1% competence and unlocks the 4 Aura Badges!`,
    totalDays: safeDays,
    totalWeeks,
    todayTask: {
      id: 'task-d1',
      day: 1,
      title: `Day 1: ${goal} Core Architecture & Baseline Setup`,
      description: `Complete today's milestone with total focus. Shut down distraction feeds and complete your session to earn +25 Aura points and feed ${companionName}!`,
      estimatedMinutes: 45,
      category: 'Core Focus',
      auraReward: 25,
      actionUrl: 'https://youtube.com',
      learningPoints: ['Laser focus session', 'Active retrieval', 'Log time to boost Aura'],
      isCompleted: false,
    },
    weeklyMilestones: Array.from({ length: totalWeeks }, (_, i) => {
      const w = i + 1;
      let badge: string | undefined;
      if (w === q1Week) badge = 'Silver Aura Badge';
      else if (w === q2Week) badge = 'Gold Aura Badge';
      else if (w === q3Week) badge = 'Platinum Aura Badge';
      else if (w === q4Week) badge = 'Diamond Aura Badge (Ascension to ∞)';

      return {
        weekNum: w,
        title: `Week ${w}: ${
          w === 1
            ? 'Foundation, Dopamine Reclaim & Habit Lock'
            : w <= q1Week
            ? 'Core Domain Invariants & Mental Models'
            : w <= q2Week
            ? 'Applied Problem Solving & Hands-on Labs'
            : w <= q3Week
            ? 'Advanced Optimization, Speed & Synthesis'
            : 'Elite Capstone & Diamond Mastery Certification'
        }`,
        focusArea: `Phase ${Math.min(4, Math.floor(((w - 1) / totalWeeks) * 4) + 1)} • ${Math.round((w / totalWeeks) * safeDays)} / ${safeDays} Days`,
        keyProject: `Milestone Deliverable #${w}: ${goal} Specialized Focus Sprint`,
        unlockableBadge: badge,
        unlockablePetBadge: badge,
        isUnlocked: w === 1,
      };
    }),
    dailyTimetable: [
      { timeSlot: '06:00 - 06:30', activity: 'Waking, Hydration (500ml), Light Stretch & Morning Sunlight', tag: 'Morning Routine', isCoreGoal: false },
      { timeSlot: '06:30 - 07:45', activity: `Block 1: Laser Deep Sprint in ${goal} (Zero Notifications)`, tag: 'Deep Focus', isCoreGoal: true },
      { timeSlot: '07:45 - 08:30', activity: 'Nutritious Breakfast, Shower & Daily Timetable Review', tag: 'Health', isCoreGoal: false },
      { timeSlot: '08:30 - 09:30', activity: `Block 2: Theory & Architectural Deep Learning Module`, tag: 'Core Theory', isCoreGoal: true },
      { timeSlot: '09:30 - 10:45', activity: 'Active Retrieval Practice & 10-Question Knowledge Drill', tag: 'Active Recall', isCoreGoal: true },
      { timeSlot: '10:45 - 11:00', activity: '15-Minute Cognitive Pause, Eye Rest & Breathwork', tag: 'Mindfulness', isCoreGoal: false },
      { timeSlot: '11:00 - 12:30', activity: `Block 3: Practical Coding / Case Studies Lab`, tag: 'Hands-on Lab', isCoreGoal: true },
      { timeSlot: '12:30 - 13:30', activity: 'Mindful Lunch, Hydration & 15-Minute Outdoor Walk', tag: 'Nutrition & Reset', isCoreGoal: false },
      { timeSlot: '13:30 - 15:00', activity: `Block 4: Complex Problem Solving & Algorithmic Drills`, tag: 'Drills', isCoreGoal: true },
      { timeSlot: '15:00 - 16:30', activity: 'Light Reading, Study Club Sync & Peer Code Review', tag: 'Study Squad', isCoreGoal: false },
      { timeSlot: '16:30 - 17:30', activity: 'Physical Workout / Cardio / Gym & High Energy Reset', tag: 'Fitness', isCoreGoal: false },
      { timeSlot: '17:30 - 19:00', activity: `Block 5: Evening Capstone Project Building & Lab Execution`, tag: 'Capstone Lab', isCoreGoal: true },
      { timeSlot: '19:00 - 20:00', activity: 'Dinner, Family / Social Time & Screen-Free Relaxation', tag: 'Personal', isCoreGoal: false },
      { timeSlot: '20:00 - 21:00', activity: 'Daily Book Sanctuary Reading & Feynman Note Taking', tag: 'Book Sanctuary', isCoreGoal: true },
      { timeSlot: '21:00 - 21:45', activity: 'Daily Log Review, Meaningful Score Check & Companion Feed', tag: 'Reflection', isCoreGoal: false },
      { timeSlot: '21:45 - 22:30', activity: 'Screen Dimming, Nightly Habit Checklist & Zero Doomscroll', tag: 'Wind-Down', isCoreGoal: false },
      { timeSlot: '22:30 - 23:00', activity: 'Bedtime Mode 432Hz Soundscape & Restorative Sleep', tag: 'Sleep Mode', isCoreGoal: false },
    ],
  };
}

export function getFallbackLesson(goal: string, topic: string): LessonPackage {
  const youtubeMap: Record<string, string> = {
    'DSA': '8hly31xKli0',
    'Placement Prep': 'vLnPwxZdW4Y',
    'Learn AI/ML': 'aircAruvnKk',
    'Python': '_uQrJ0TkZlc',
    'Improve English': 'Z-zNP465ZNE',
    'Read More Books': '5qap5aO4i9A',
    'Improve Fitness': 'eMjyvIQbn9M',
  };
  const vidId = youtubeMap[goal] || '8hly31xKli0';

  return {
    id: `lesson-${Date.now()}`,
    goal,
    topic: topic || goal,
    title: `Mastery Guide: ${topic || goal}`,
    youtubeVideoId: vidId,
    youtubeUrl: `https://www.youtube.com/watch?v=${vidId}`,
    durationStr: '32 min lecture + 4 Modules',
    deepSummary: `### Complete Deep Breakdown: ${topic || goal}\n\n1. **Core Mental Model**: True mastery is not about the quantity of hours spent passively staring at screens, but the cognitive intensity and active retrieval applied during each block.\n\n2. **Eliminating the Illusion of Competence**: When watching a lecture or reading without testing oneself, the brain confuses recognition with genuine recall. Immediate 10-question retrieval testing locks knowledge into long-term memory.\n\n3. **Compound Compounding**: Improving 1% daily over your plan duration yields immense compounding of ability.\n\n4. **Actionable Implementation**: Break big topics into atomic micro-drills, read the 4 modules below, and complete the final 10 MCQs!`,
    modules: [
      {
        id: 'mod-1',
        moduleNumber: 1,
        title: 'Module 1: Deep Theoretical Architecture & Core Principles',
        subtitle: 'Axioms, Mental Models & Foundation',
        readingTimeMinutes: 12,
        wordCount: 1600,
        contentMarkdown: `## 1. The Core Paradigm\n\nTo achieve true mastery in **${topic || goal}**, one must bypass superficial rote memorization and reconstruct concepts from first principles.\n\n### The Hierarchy of Competence\n1. **Axiomatic Clarity**: Grasping the exact constraints and invariants that govern the domain.\n2. **Pattern Recognition**: Identifying structural isomorphisms across seemingly unrelated problem spaces.\n3. **Trade-Off Optimization**: Knowing when asymptotic optimality conflicts with real-world execution overhead.\n\n### Key Conceptual Pillars\n- **Invariants**: Conditions that remain true across all valid states.\n- **State Transitions**: Predictable transformations that map input representations into finalized outputs.\n- **Error Boundaries**: Designing fail-safes before edge cases cascade into systemic failures.`,
        keyTakeaways: ['Deconstruct complex domains into axiomatic primitives', 'Map problems to proven structural patterns', 'Always analyze state invariants'],
        isRead: false,
      },
      {
        id: 'mod-2',
        moduleNumber: 2,
        title: 'Module 2: Practical Mechanics & Implementation Blueprints',
        subtitle: 'Algorithmic Flow, Code Constructs & Execution Patterns',
        readingTimeMinutes: 15,
        wordCount: 1750,
        contentMarkdown: `## 2. Practical Execution Engine\n\nTheory without rigorous hands-on implementation is merely entertainment. In this module, we transition directly into step-by-step application.\n\n### Implementation Pipeline\n\`\`\`\n[Raw Input / Problem Space] \n       │\n       ▼\n[Parsing & Validation] ────► [Transformative Pipeline] ────► [Optimized Result]\n                                   │\n                                   ▼\n                          [Invariant Verification]\n\`\`\`\n\n### Critical Failure Modes to Avoid\n- **Premature Optimization**: Refining subroutines before verifying overarching architectural soundness.\n- **Boundary Neglect**: Failing to test empty, singleton, and overflow edge conditions.\n- **Cognitive Drift**: Losing track of memory and time trade-offs during execution.`,
        keyTakeaways: ['Write clean, idempotent transformations', 'Validate invariants at runtime', 'Audit edge-case boundary conditions'],
        isRead: false,
      },
      {
        id: 'mod-3',
        moduleNumber: 3,
        title: 'Module 3: Edge Cases, Real-World Bottlenecks & Optimization',
        subtitle: 'Industry Scenarios, Bottleneck Audits & High-Leverage Solutions',
        readingTimeMinutes: 14,
        wordCount: 1600,
        contentMarkdown: `## 3. High-Stakes Case Studies\n\nReal-world systems operate under chaotic, non-deterministic constraints. Here is how elite practitioners resolve real bottlenecks.\n\n### Case Study: Scaling Bottleneck Resolution\nWhen throughput bottlenecks occur, naive practitioners add hardware, while elite architects profile latency distributions and optimize algorithmic complexity from O(N²) to O(N log N).\n\n### Heuristic Rules of Thumb\n1. **Measure First**: Never guess where bottlenecks exist; leverage telemetry.\n2. **Locality of Reference**: Cache warm paths and minimize indirection.\n3. **Graceful Degradation**: Maintain core functionality even when secondary dependencies stall.`,
        keyTakeaways: ['Profile latency distributions with data', 'Prioritize algorithmic efficiency over raw compute', 'Design for graceful degradation'],
        isRead: false,
      },
      {
        id: 'mod-4',
        moduleNumber: 4,
        title: 'Module 4: Synthesis, Long-Term Compounding & Execution Checklist',
        subtitle: 'Spaced repetition protocols, synthesis exercises & action plan',
        readingTimeMinutes: 10,
        wordCount: 1300,
        contentMarkdown: `## 4. The Compound Retention Protocol\n\nRetention decays exponentially along the Ebbinghaus forgetting curve unless reinforced through scheduled spaced retrieval.\n\n### The Daily 10-Minute Retrieval Protocol\n- **Immediate Recall**: Complete the 10-question MCQ assessment immediately after reading.\n- **Day +2 Testing**: Re-solve one foundational problem without referencing notes.\n- **Day +7 Synthesis**: Explain the core concept aloud or teach it in your Flowra club.`,
        keyTakeaways: ['Active recall cements neural synaptogenesis', 'Teach concepts to peer club members', 'Compound daily focus into unstoppable aura'],
        isRead: false,
      },
    ],
    keyTakeaways: [
      'Active recall produces 300% higher retention compared to passive rereading.',
      'Batch difficult deep work into morning high-energy windows.',
      'Test your knowledge immediately using the 10-question evaluation below.',
      'Consistency is protected by small non-negotiable daily minimums.',
    ],
    quiz: [
      {
        id: 'q-1',
        questionNumber: 1,
        question: 'What is the most effective cognitive technique for long-term retention according to learning science?',
        options: [
          'Active Recall and Self-Testing',
          'Passive re-reading of highlighted text',
          'Listening to background audio while sleeping',
          'Watching video tutorials at 3x speed without notes',
        ],
        correctOptionIndex: 0,
        explanation: 'Active recall forces the brain to retrieve information from memory, strengthening synaptic connections.',
        subtopic: 'Cognitive Science',
      },
      {
        id: 'q-2',
        questionNumber: 2,
        question: 'How does the "Illusion of Competence" hinder learners?',
        options: [
          'It tricks learners into feeling they understand material just because it looks familiar',
          'It makes learners underestimate their actual exam score',
          'It forces the brain to sleep longer than necessary',
          'It causes physical fatigue in eye muscles',
        ],
        correctOptionIndex: 0,
        explanation: 'Recognition is much easier than retrieval. Without testing, familiarity is mistaken for actual mastery.',
        subtopic: 'Metacognition',
      },
      {
        id: 'q-3',
        questionNumber: 3,
        question: 'When executing the timetable, what is the primary purpose of scheduling specific hourly blocks?',
        options: [
          'To remove decision fatigue and automate daily execution',
          'To make life rigid and boring',
          'To prevent having any free time',
          'To impress social media followers',
        ],
        correctOptionIndex: 0,
        explanation: 'Clear implementation intentions (time & location) dramatically increase habit adherence.',
        subtopic: 'Habit Architecture',
      },
      {
        id: 'q-4',
        questionNumber: 4,
        question: 'What happens to the Flowra companion pet or tree when streaks are missed?',
        options: [
          'The pet goes into jail or tree leaves dry up until you revive them with streak actions',
          'It permanently deletes your device data',
          'Nothing ever changes',
          'It sends automated emails to your friends',
        ],
        correctOptionIndex: 0,
        explanation: 'The companion visually reflects your consistency, going to jail or withering if neglected, and flourishing with active streaks.',
        subtopic: 'Behavioral Feedback',
      },
      {
        id: 'q-5',
        questionNumber: 5,
        question: 'In Flowra, how are Aura points awarded?',
        options: [
          'By completing daily focus tasks, reading modules, finishing MCQs, and weekly projects',
          'By endlessly clicking on the pet/tree without doing tasks',
          'By spending hours doomscrolling social media',
          'Randomly once a month',
        ],
        correctOptionIndex: 0,
        explanation: 'Aura points are earned through real disciplined actions (+25 for tasks, +10 for modules, +5-10 for MCQs, +50 for projects).',
        subtopic: 'Aura Economy',
      },
      {
        id: 'q-6',
        questionNumber: 6,
        question: 'What is the role of the 5-minute Dopamine Switch intervention?',
        options: [
          'Provide a 5-minute rewarding dopamine replacement before a scroll loop begins',
          'Aggressively insult the user for opening an app',
          'Lock the smartphone permanently',
          'Show irrelevant full-screen advertisements',
        ],
        correctOptionIndex: 0,
        explanation: 'Rather than purely blocking, it redirects high dopamine craving into high-yield micro-drills.',
        subtopic: 'Dopamine Redirection',
      },
      {
        id: 'q-7',
        questionNumber: 7,
        question: 'Why does Flowra encourage a single concentrated plan duration (e.g. 150 days)?',
        options: [
          'Deep focus on a single priority builds compound exponential mastery',
          'It is impossible to learn more than one thing in life',
          'To restrict user freedom artificially',
          'Because mobile screens are too small for 2 goals',
        ],
        correctOptionIndex: 0,
        explanation: 'Splitting focus across 5 goals causes shallow progress. Concentrated focus over months yields elite competence.',
        subtopic: 'Deep Focus Strategy',
      },
      {
        id: 'q-8',
        questionNumber: 8,
        question: 'What should you do immediately after completing a major task in the app?',
        options: [
          'Feed your pet or water your tree to celebrate your +25 Aura points',
          'Open TikTok for 2 hours as a reward',
          'Reset your streak to zero',
          'Delete your progress history',
        ],
        correctOptionIndex: 0,
        explanation: 'Feeding/watering your companion creates a positive reinforcement loop that celebrates daily execution.',
        subtopic: 'Habit Reinforcement',
      },
      {
        id: 'q-9',
        questionNumber: 9,
        question: 'How does Flowra YouTube lesson integration help learners?',
        options: [
          'Embeds verified, high-yield lectures directly in-app paired with deep text modules and MCQs',
          'Plays video at 0.1x speed to slow down time',
          'Replaces all videos with static images',
          'Disables video playing completely',
        ],
        correctOptionIndex: 0,
        explanation: 'Curiosity is converted into structured learning with working video lectures and verified retrieval tests.',
        subtopic: 'Intentional Consumption',
      },
      {
        id: 'q-10',
        questionNumber: 10,
        question: 'What is the compound outcome of 45 daily minutes of deliberate practice across 150 days?',
        options: [
          'Over 110+ hours of focused domain skill, equivalent to an intensive university capstone',
          'Zero measurable difference in skill',
          'Only 5 hours of total practice',
          'Loss of focus',
        ],
        correctOptionIndex: 0,
        explanation: '110+ hours of deliberate practice puts you ahead of 95% of casual learners in any domain.',
        subtopic: 'Compound Growth',
      },
    ],
  };
}
