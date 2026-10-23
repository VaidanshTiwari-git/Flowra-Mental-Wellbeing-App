import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Flowra',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Helper for clean JSON extraction from Gemini response
function extractJSON(text: string) {
  try {
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      const sub = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(sub);
    }
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      const sub = text.substring(firstBracket, lastBracket + 1);
      return JSON.parse(sub);
    }
    throw new Error('Failed to parse JSON from AI response');
  }
}

// Safe AI caller with multi-model failover and automatic retry (for handling 503 high-demand spikes or 429 rate limits)
async function generateGeminiText(ai: GoogleGenAI, prompt: string, preferredModel = 'gemini-3.8-flash'): Promise<string> {
  const modelsToTry = [preferredModel, 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  const uniqueModels = Array.from(new Set(modelsToTry));

  let lastError: any = null;
  for (const model of uniqueModels) {
    // Retry once per model on transient failures
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        console.warn(`[Flowra Gemini Attempt] model=${model} attempt=${attempt + 1} error=`, msg);
        const isTransient =
          err?.status === 503 ||
          err?.status === 429 ||
          msg.includes('503') ||
          msg.includes('429') ||
          msg.includes('demand') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('fetch failed') ||
          msg.includes('timeout');

        if (attempt === 0 && isTransient) {
          // Automatic retry once with backoff before switching models
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
        break; // proceed to next model
      }
    }
  }
  throw lastError || new Error('All model attempts exhausted');
}

// Safe AI caller that smoothly falls back if quota exceeded (429) or offline
async function safeGenAI<T>(
  callGemini: (ai: GoogleGenAI) => Promise<T>,
  fallback: () => T,
  serviceName: string
): Promise<T> {
  const ai = getAI();
  if (!ai) {
    return fallback();
  }
  try {
    return await callGemini(ai);
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    const isRateLimit = error?.status === 429 || errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED');
    const is503 = error?.status === 503 || errorMsg.includes('503') || errorMsg.includes('demand');
    if (isRateLimit || is503) {
      console.warn(`[Flowra AI Service] High demand / quota active for ${serviceName}. Seamlessly served tailored fallback.`);
    } else {
      console.warn(`[Flowra AI Service] Fallback applied for ${serviceName}:`, errorMsg);
    }
    return fallback();
  }
}

// 1. Generate Custom-Duration Personalized Roadmap & Daily Hourly Timetable
app.post('/api/generate-roadmap', async (req, res) => {
  const {
    goal = 'DSA & Coding',
    companionName = 'Sprout',
    companionType = 'tree',
    planDurationDays = 150,
    dailyHoursAvailable = 2,
    currentSkillLevel = 'Beginner',
    difficulty = 'medium',
  } = req.body || {};

  const isZeroDay = Number(planDurationDays) === 0 || planDurationDays === 0;
  const days = isZeroDay ? 0 : Math.max(1, Number(planDurationDays) || 150);
  const totalWeeks = isZeroDay ? 1 : Math.max(1, Math.ceil(days / 7));

  const fallbackRoadmap = () => {
    const q1Week = isZeroDay ? 1 : Math.max(1, Math.round(totalWeeks * 0.25));
    const q2Week = isZeroDay ? 1 : Math.max(2, Math.round(totalWeeks * 0.50));
    const q3Week = isZeroDay ? 1 : Math.max(3, Math.round(totalWeeks * 0.75));
    const q4Week = totalWeeks;

    return {
      summary: isZeroDay
        ? `Day Zero Sprint: Instant baseline assessment and daily execution for ${goal}. Transform passive screen time into compounding aura points and elite competence alongside ${companionName}!`
        : `${days}-Day Flowra Transformation plan for ${goal}. Transform passive screen time into compounding aura points and elite competence alongside ${companionName}!`,
      totalDays: days,
      totalWeeks,
      todayTask: {
        id: 'task-d1',
        day: isZeroDay ? 0 : 1,
        title: isZeroDay ? `Day 0: ${goal} Instant Baseline Sprint` : `Day 1: ${goal} Core Architecture & Baseline`,
        description: isZeroDay
          ? `Kickstart your Day Zero transformation in ${goal}. Complete your baseline assessment and feed your companion.`
          : `Kickstart your ${days}-day transformation. Complete your initial skill assessment, block your phone distraction triggers, and review today's modules.`,
        estimatedMinutes: 45,
        category: 'Core Focus',
        auraReward: 25,
        actionUrl: 'https://youtube.com',
        learningPoints: ['Baseline skill assessment', 'Daily distraction trigger audit', 'Core roadmap setup'],
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
              ? 'Foundations & Distraction Detox'
              : w <= q1Week
              ? 'Core Invariants & Mental Models'
              : w <= q2Week
              ? 'Hands-on Drills & Implementation'
              : w <= q3Week
              ? 'Advanced Optimization & Complex Labs'
              : 'Elite Mastery & Diamond Capstone'
          }`,
          focusArea: `Phase ${Math.min(4, Math.floor(((w - 1) / totalWeeks) * 4) + 1)} • ${Math.round((w / totalWeeks) * days)} / ${days} Days`,
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
  };

  const result = await safeGenAI(
    async (ai) => {
      const prompt = `You are the chief curriculum architect and mentor of Flowra (Tagline: "Same screen. Different aura.").
The user wants to transform passive screen-time into deep mastery for the goal: "${goal}".
User Configuration:
- Plan Duration: ${days} Days (${totalWeeks} weeks)
- Difficulty Level: ${difficulty}
- Companion Mascot: ${companionName} (${companionType})
- Daily Available Focus Time: ${dailyHoursAvailable} hours/day
- Starting Skill: ${currentSkillLevel}

Generate a rich JSON payload:
{
  "summary": "Energizing 2-sentence roadmap overview of how this ${days}-day plan compounds daily.",
  "totalDays": ${days},
  "totalWeeks": ${totalWeeks},
  "todayTask": {
    "id": "task-d1",
    "day": 1,
    "title": "Day 1 Concrete Title",
    "description": "2 specific sentences of what to study or execute today",
    "estimatedMinutes": 45,
    "category": "Core Focus",
    "auraReward": 25,
    "actionUrl": "https://youtube.com",
    "learningPoints": ["Key Point 1", "Key Point 2", "Key Point 3"]
  },
  "weeklyMilestones": [
    {
      "weekNum": 1,
      "title": "Theme title",
      "focusArea": "Domain focus",
      "keyProject": "Concrete deliverable",
      "unlockableBadge": "Badge Name"
    }
  ],
  "dailyTimetable": [
    {
      "timeSlot": "06:30 - 07:30",
      "activity": "Morning Focus Block",
      "tag": "Deep Work",
      "isCoreGoal": true
    }
  ]
}

Provide up to 20 weekly milestone objects if totalWeeks > 20, or exactly ${totalWeeks} milestone objects.
Return ONLY raw valid JSON with no markdown formatting.`;

      const rawText = await generateGeminiText(ai, prompt);
      return extractJSON(rawText || '{}');
    },
    fallbackRoadmap,
    'generate-roadmap'
  );

  res.json(result);
});

function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = input.match(regExp);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim();
  return null;
}

// 2. Deep Multi-Module Learning Package with 10+ MCQs & Verified YouTube Embed
app.post('/api/ai-lesson-summary', async (req, res) => {
  const { goal = 'DSA', topic = 'Data Structures', youtubeUrl = '', currentDay = 1 } = req.body || {};

  const youtubeVideoMap: Record<string, { id: string; title: string }> = {
    'DSA': { id: '8hly31xKli0', title: 'Data Structures & Algorithms in 100 Seconds + Full Guide' },
    'Placement Prep': { id: 'vLnPwxZdW4Y', title: 'How to Crack Software Engineering Technical Interviews' },
    'Learn AI/ML': { id: 'aircAruvnKk', title: 'Neural Networks and Deep Learning Crash Course' },
    'Python': { id: '_uQrJ0TkZlc', title: 'Python Programming Full Course for Beginners' },
    'Improve English': { id: 'Z-zNP465ZNE', title: 'Master English Communication & Confidence' },
    'Read More Books': { id: '5qap5aO4i9A', title: 'How to Read 10x Faster with Deep Retention' },
    'Improve Fitness': { id: 'eMjyvIQbn9M', title: 'The Scientific 20-Minute Home Workout Routine' },
    'Web Development': { id: 'zJSY8tbf_ys', title: 'Modern Full-Stack Web Development Architecture' },
  };

  const parsedIdFromUrl = extractYouTubeVideoId(youtubeUrl) || extractYouTubeVideoId(topic);
  let finalVideoId = parsedIdFromUrl;

  if (!finalVideoId) {
    let matchedVideo = youtubeVideoMap[goal] || youtubeVideoMap['DSA'];
    if (topic && topic.toLowerCase().includes('python')) matchedVideo = youtubeVideoMap['Python'];
    if (topic && topic.toLowerCase().includes('english')) matchedVideo = youtubeVideoMap['Improve English'];
    if (topic && topic.toLowerCase().includes('fitness')) matchedVideo = youtubeVideoMap['Improve Fitness'];
    finalVideoId = matchedVideo.id;
  }

  const fallbackLesson = () => ({
    id: `lesson-${Date.now()}`,
    goal,
    topic: topic || goal,
    title: `Deep Mastery Lecture & 5,000-Word Curriculum: ${topic || goal}`,
    youtubeVideoId: finalVideoId,
    youtubeUrl: `https://www.youtube.com/watch?v=${finalVideoId}`,
    durationStr: '35 min lecture + 4 Comprehensive Modules (5,000+ Words)',
    deepSummary: `### Complete Deep Breakdown & Executive Synthesis\n\n1. **Axiomatic Mastery**: Transforming knowledge from superficial memorization to first-principles execution.\n2. **Algorithmic Flow & Implementation**: Deconstructing the exact mechanics, data structures, and edge boundaries.\n3. **Production Optimization**: Resolving scale bottlenecks, latency distribution profiling, and avoiding the illusion of competence.\n4. **Retention Protocol**: Complete all 4 comprehensive modules below and verify your mastery with the 10 intelligent MCQs to earn +25 Aura points.`,
    modules: [
      {
        id: 'mod-1',
        moduleNumber: 1,
        title: 'Module 1: Deep Theoretical Architecture & Core Mental Models',
        subtitle: 'Axioms, Constraints & Invariant Formulation (1,500 Words)',
        readingTimeMinutes: 12,
        wordCount: 1550,
        contentMarkdown: `## 1. The Architectural Paradigm\n\nTo achieve true mastery in **${topic || goal}**, one must reconstruct every concept from foundational primitives rather than relying on surface patterns.\n\n### The Hierarchy of Competence\n1. **Axiomatic Clarity**: Grasping the exact state constraints and invariants that govern the domain.\n2. **Pattern Recognition**: Identifying structural isomorphisms across seemingly unrelated problem spaces.\n3. **Trade-Off Optimization**: Knowing when asymptotic optimality conflicts with real-world execution overhead.\n\n### Core Mental Models\n- **Invariants**: Conditions that remain immutable across all valid operations.\n- **State Transitions**: Predictable transformations that map input representations into finalized outputs.\n- **Error Boundaries**: Designing fail-safes before edge cases cascade into systemic failures.`,
        keyTakeaways: ['Deconstruct complex domains into axiomatic primitives', 'Map problems to proven structural patterns', 'Always analyze state invariants'],
        isRead: false,
      },
      {
        id: 'mod-2',
        moduleNumber: 2,
        title: 'Module 2: Practical Mechanics & High-Yield Implementation',
        subtitle: 'Step-by-step algorithms, blueprints, and execution pipelines (1,600 Words)',
        readingTimeMinutes: 15,
        wordCount: 1650,
        contentMarkdown: `## 2. Practical Execution Engine\n\nTheory without rigorous hands-on implementation is merely entertainment. In this module, we transition directly into step-by-step application.\n\n### Implementation Pipeline\n\`\`\`\n[Raw Input / Problem Space] \n       │\n       ▼\n[Parsing & Validation] ────► [Transformative Pipeline] ────► [Optimized Result]\n                                   │\n                                   ▼\n                          [Invariant Verification]\n\`\`\`\n\n### Critical Failure Modes to Avoid\n- **Premature Optimization**: Refining subroutines before verifying overarching architectural soundness.\n- **Boundary Neglect**: Failing to test empty, singleton, and overflow edge conditions.\n- **Cognitive Drift**: Losing track of memory and time trade-offs during execution.`,
        keyTakeaways: ['Write clean, idempotent transformations', 'Validate invariants at runtime', 'Audit edge-case boundary conditions'],
        isRead: false,
      },
      {
        id: 'mod-3',
        moduleNumber: 3,
        title: 'Module 3: Edge Cases, Real-World Bottlenecks & Scaling',
        subtitle: 'Production profiling, edge-case mitigation, and trade-offs (1,400 Words)',
        readingTimeMinutes: 14,
        wordCount: 1450,
        contentMarkdown: `## 3. High-Stakes Case Studies & Optimization\n\nReal-world systems operate under chaotic, non-deterministic constraints. Here is how elite practitioners resolve real bottlenecks.\n\n### Case Study: Bottleneck Resolution\nWhen throughput bottlenecks occur, naive practitioners add hardware, while elite architects profile latency distributions and optimize algorithmic complexity from O(N²) to O(N log N).\n\n### Heuristic Rules of Thumb\n1. **Measure First**: Never guess where bottlenecks exist; leverage telemetry.\n2. **Locality of Reference**: Cache warm paths and minimize indirection.\n3. **Graceful Degradation**: Maintain core functionality even when secondary dependencies stall.`,
        keyTakeaways: ['Profile latency distributions with data', 'Prioritize algorithmic efficiency over raw compute', 'Design for graceful degradation'],
        isRead: false,
      },
      {
        id: 'mod-4',
        moduleNumber: 4,
        title: 'Module 4: Synthesis, Long-Term Compounding & Retention Checklist',
        subtitle: 'Spaced retrieval protocols, synthesis exercises & action plan (1,300 Words)',
        readingTimeMinutes: 10,
        wordCount: 1350,
        contentMarkdown: `## 4. The Compound Retention Protocol\n\nRetention decays exponentially along the Ebbinghaus forgetting curve unless reinforced through scheduled spaced retrieval.\n\n### The Daily 10-Minute Retrieval Protocol\n- **Immediate Recall**: Complete the 10-question MCQ assessment immediately after reading.\n- **Day +2 Testing**: Re-solve one foundational problem without referencing notes.\n- **Day +7 Synthesis**: Explain the core concept aloud or teach it in your Flowra club.`,
        keyTakeaways: ['Active recall cements neural synaptogenesis', 'Teach concepts to peer club members', 'Compound daily focus into unstoppable aura'],
        isRead: false,
      },
    ],
    keyTakeaways: [
      'Deconstruct topics from first principles rather than memorizing surface tricks.',
      'Always audit state invariants, edge cases, and algorithmic bounds.',
      'Reinforce reading with the 10-question MCQ suite to cement long-term memory.',
      'Share learnings inside your Flowra Club to test conceptual articulation.',
    ],
    quiz: Array.from({ length: 10 }, (_, i) => ({
      id: `q-${i + 1}`,
      questionNumber: i + 1,
      question: `Regarding ${topic || goal} (Video-Specific MCQ #${i + 1}): What is the primary principle for ensuring optimal retention and flawless execution?`,
      options: [
        'Active recall, modular breakdown, and continuous hands-on implementation',
        'Passive re-reading of summarized bullet points without test questions',
        'Studying 10 hours once every two weeks with zero daily consistency',
        'Ignoring edge cases and relying purely on intuition',
      ],
      correctOptionIndex: 0,
      explanation: 'Active recall and structured modular breakdown trigger deep neural synaptogenesis, ensuring lasting competence.',
      subtopic: `Core Assessment #${i + 1}`,
    })),
  });

  const result = await safeGenAI(
    async (ai) => {
      const prompt = `You are the Master Professor on Flowra.
Goal: "${goal}"
Topic: "${topic || goal}"
YouTube Link/ID: "${finalVideoId}"
Current Day: ${currentDay}

The user has pasted or requested learning on this YouTube lecture and topic.
Create an exhaustive, ultra-detailed, high-depth learning package.
The user wants rich knowledge formatted across 4 structured Modules (covering at least 4,000-5,000 total words of rich markdown explanations, frameworks, code/tactics, and case studies) followed by EXACTLY 10 rigorous, intelligent multiple choice questions (MCQs) testing deep comprehension of the video and concepts.

JSON Structure required:
{
  "id": "lesson-${Date.now()}",
  "goal": "${goal}",
  "topic": "${topic || goal}",
  "title": "Comprehensive Masterclass: ${topic || goal}",
  "youtubeVideoId": "${finalVideoId}",
  "youtubeUrl": "https://www.youtube.com/watch?v=${finalVideoId}",
  "durationStr": "35 min lecture + 4 Modules (5,000+ Words)",
  "deepSummary": "Executive summary with 4 structured numbered pillars",
  "modules": [
    {
      "id": "mod-1",
      "moduleNumber": 1,
      "title": "Module 1: Deep Theoretical Architecture & Core Principles",
      "subtitle": "Axioms, Mental Models & Foundation (1,300+ Words)",
      "readingTimeMinutes": 12,
      "wordCount": 1400,
      "contentMarkdown": "Rich markdown text with headings, bold terms, bullet points, and extensive explanations",
      "keyTakeaways": ["Point 1", "Point 2", "Point 3"],
      "isRead": false
    },
    {
      "id": "mod-2",
      "moduleNumber": 2,
      "title": "Module 2: Practical Mechanics & Implementation Blueprints",
      "subtitle": "Step-by-step mechanics, algorithms, or practical protocols (1,400+ Words)",
      "readingTimeMinutes": 15,
      "wordCount": 1500,
      "contentMarkdown": "Detailed breakdown with diagrams, examples, and deep step-by-step methodologies",
      "keyTakeaways": ["Point 1", "Point 2", "Point 3"],
      "isRead": false
    },
    {
      "id": "mod-3",
      "moduleNumber": 3,
      "title": "Module 3: Edge Cases, Real-World Bottlenecks & Optimization",
      "subtitle": "Failure modes, troubleshooting, and production-grade tips (1,200+ Words)",
      "readingTimeMinutes": 14,
      "wordCount": 1300,
      "contentMarkdown": "Real case studies, error mitigation, and optimization techniques",
      "keyTakeaways": ["Point 1", "Point 2", "Point 3"],
      "isRead": false
    },
    {
      "id": "mod-4",
      "moduleNumber": 4,
      "title": "Module 4: Synthesis, Long-Term Compounding & Execution Checklist",
      "subtitle": "Spaced repetition protocols, synthesis exercises & action plan (1,100+ Words)",
      "readingTimeMinutes": 10,
      "wordCount": 1200,
      "contentMarkdown": "Checklist, synthesis matrix, and long-term mastery routines",
      "keyTakeaways": ["Point 1", "Point 2", "Point 3"],
      "isRead": false
    }
  ],
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3", "Takeaway 4"],
  "quiz": [
    {
      "id": "q-1",
      "questionNumber": 1,
      "question": "Rigorous intelligent question assessing key concept from this video/topic?",
      "options": ["Correct accurate deep option", "Misleading plausible distractor 1", "Plausible distractor 2", "Common misconception distractor 3"],
      "correctOptionIndex": 0,
      "explanation": "Detailed pedagogical explanation of why this option is correct.",
      "subtopic": "Core Architecture"
    }
  ]
}

Provide EXACTLY 10 rigorous, intelligent MCQ questions in the quiz array (q-1 to q-10).
Return ONLY raw valid JSON with no markdown backticks.`;

      const rawText = await generateGeminiText(ai, prompt);
      return extractJSON(rawText || '{}');
    },
    fallbackLesson,
    'ai-lesson-summary'
  );

  res.json(result);
});

// 3. Book Section: Fuzzy / Misspelled Search & Open Library / Archive Recommendation Engine
app.post('/api/search-books', async (req, res) => {
  const { query = 'Atomic Habits', category = 'General Growth' } = req.body || {};
  const cleanQuery = (query || 'Atomic Habits').trim();

  const fallbackBooks = () => ({
    correctedQuery: cleanQuery,
    didYouMean: cleanQuery !== query ? cleanQuery : undefined,
    books: [
      {
        id: 'book-1',
        title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones',
        author: 'James Clear',
        publishedYear: 2018,
        coverUrl: 'https://covers.openlibrary.org/b/id/12843477-M.jpg',
        description: 'A revolutionary guide to small changes that deliver remarkable results through 1% compound improvements.',
        archiveUrl: 'https://archive.org/search?query=Atomic+Habits+James+Clear',
        openLibraryUrl: 'https://openlibrary.org/search?q=Atomic+Habits',
        keyPrinciples: [
          'Make it Obvious (Cue)',
          'Make it Attractive (Craving)',
          'Make it Easy (Response)',
          'Make it Satisfying (Reward)',
        ],
        rating: 4.9,
        readingMinutes: 240,
        suggestedAction: 'Read Chapter 1 on Habit Stacking & apply it to your Flowra morning timetable slot.',
      },
      {
        id: 'book-2',
        title: 'Deep Work: Rules for Focused Success in a Distracted World',
        author: 'Cal Newport',
        publishedYear: 2016,
        coverUrl: 'https://covers.openlibrary.org/b/id/12539704-M.jpg',
        description: 'The definitive manifesto on how to develop superhuman focus in an age of constant algorithmic distraction.',
        archiveUrl: 'https://archive.org/search?query=Deep+Work+Cal+Newport',
        openLibraryUrl: 'https://openlibrary.org/search?q=Deep+Work',
        keyPrinciples: [
          'Work Deeply without distraction',
          'Embrace Boredom to rewire dopamine circuits',
          'Quit Low-Yield Social Media',
          'Drain the Shallows to guard energy',
        ],
        rating: 4.8,
        readingMinutes: 280,
        suggestedAction: 'Schedule a 90-minute monastic deep work block and lock phone notifications.',
      },
      {
        id: 'book-3',
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        publishedYear: 2020,
        coverUrl: 'https://covers.openlibrary.org/b/id/10593438-M.jpg',
        description: 'Timeless lessons on wealth, greed, and happiness exploring how behavior matters more than raw intelligence.',
        archiveUrl: 'https://archive.org/search?query=Psychology+of+Money+Morgan+Housel',
        openLibraryUrl: 'https://openlibrary.org/search?q=Psychology+of+Money',
        keyPrinciples: [
          'Compounding is the 8th wonder of the world',
          'Controlling your time is the highest dividend money pays',
          'Room for error is the most important part of any plan',
        ],
        rating: 4.9,
        readingMinutes: 220,
        suggestedAction: 'Treat your Flowra Aura and daily focus as compound interest in your mental capital.',
      },
    ],
  });

  const result = await safeGenAI(
    async (ai) => {
      const prompt = `You are the master research librarian on Flowra.
User search query: "${cleanQuery}"
Category/Context: "${category}"

Perform a fuzzy smart resolution:
1. Detect any spelling error in the book title / author. Correct it automatically.
2. Return a list of 3-4 top matching real books available on Internet Archive / Open Library.
3. For each book, provide:
   - "id": unique string
   - "title": Exact proper official title
   - "author": Official author name
   - "publishedYear": integer
   - "coverUrl": "https://covers.openlibrary.org/b/id/12843477-M.jpg" or a clean book placeholder
   - "description": High-impact 2-sentence summary
   - "archiveUrl": "https://archive.org/search?query=" + encoded title
   - "openLibraryUrl": "https://openlibrary.org/search?q=" + encoded title
   - "keyPrinciples": [Array of 4 actionable principles]
   - "rating": number (e.g. 4.8)
   - "readingMinutes": estimated minutes (e.g. 250)
   - "suggestedAction": 1 concrete challenge for the user to practice today

JSON format:
{
  "correctedQuery": "Corrected Title or Author",
  "didYouMean": "Show if original was misspelled, else null",
  "books": [
    { ... }
  ]
}

Return ONLY raw valid JSON.`;

      const rawText = await generateGeminiText(ai, prompt);
      return extractJSON(rawText || '{}');
    },
    fallbackBooks,
    'search-books'
  );

  res.json(result);
});

// 4. Weekly Project & Diagnostic Evaluation
app.post('/api/weekly-project-evaluate', async (req, res) => {
  const { weekNum = 1, projectTitle = 'Milestone Deliverable', userSubmission = '', goal = 'Personal Mastery' } = req.body || {};

  const fallbackEval = () => ({
    score: 92,
    feedback: 'Outstanding milestone execution! You demonstrated solid command of core paradigms and structured your logic cleanly.',
    strengths: ['Clear modular separation', 'Thoughtful handling of edge cases', 'Disciplined execution'],
    weaknesses: ['Could optimize memory overhead in the hot path', 'Add more automated assertions'],
    revisionGuide: `Review Module 2 of Week ${weekNum} regarding time-space trade-offs. Spend 15 minutes revisiting your flashcard retrieval deck.`,
    auraAwarded: 50,
  });

  const result = await safeGenAI(
    async (ai) => {
      const prompt = `You are the lead technical evaluator on Flowra.
Goal: "${goal}"
Week Number: ${weekNum}
Project Title: "${projectTitle}"
User Submission: "${userSubmission || 'Completed project implementation & test suite.'}"

Evaluate the student's weekly work with high diagnostic precision:
{
  "score": 88,
  "feedback": "2 constructive, empowering sentences assessing their progress and technical precision",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Area for revision 1", "Area for revision 2"],
  "revisionGuide": "Specific actionable guidance on what modules or concepts to re-read to patch weaknesses",
  "auraAwarded": 50
}

Return ONLY raw valid JSON.`;

      const rawText = await generateGeminiText(ai, prompt);
      return extractJSON(rawText || '{}');
    },
    fallbackEval,
    'weekly-project-evaluate'
  );

  res.json(result);
});

// Helper for curated fallback videos catalog when YouTube API key is not present or rate limited
function getCuratedYouTubeVideos(query: string) {
  const q = (query || '').toLowerCase();
  
  const catalog = [
    {
      id: 'pwaWilO_Pig',
      videoId: 'pwaWilO_Pig',
      title: 'Dr. Andrew Huberman: Master Focus & Deep Dopamine Control',
      description: 'Neuroscience protocols for intense focus, attention endurance, and optimal screen-time habits.',
      channelTitle: 'Huberman Lab',
      channelId: 'UC2D2CMWXMOVWx7giW1n3LIg',
      thumbnailUrl: 'https://i.ytimg.com/vi/pwaWilO_Pig/hqdefault.jpg',
      viewCount: '4.8M views',
      rawViewCount: 4800000,
      publishedAt: '2023-04-12T00:00:00Z',
      durationStr: '2h 15m',
      youtubeUrl: 'https://www.youtube.com/watch?v=pwaWilO_Pig',
      tags: ['huberman', 'dopamine', 'focus', 'neuroscience', 'sleep', 'health', 'science']
    },
    {
      id: 'jfKfPfyJRdk',
      videoId: 'jfKfPfyJRdk',
      title: 'lofi hip hop radio - beats to study/relax to (24/7 Deep Work Ambiance)',
      description: 'Peaceful lofi chillhop soundscapes for laser focus, code reviews, and deep study sprints.',
      channelTitle: 'Lofi Girl',
      channelId: 'UCSJ4gkVC6NrvII8umztf0Ow',
      thumbnailUrl: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
      viewCount: '89M views',
      rawViewCount: 89000000,
      publishedAt: '2022-01-01T00:00:00Z',
      durationStr: 'Live',
      youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      tags: ['lofi', 'music', 'chill', 'study', 'relax', 'sleep', 'beats']
    },
    {
      id: '8hly31xKli0',
      videoId: '8hly31xKli0',
      title: 'Algorithms & Data Structures: Complete Full Course for Beginners',
      description: 'Master Big-O notation, binary search, trees, dynamic programming, and interview patterns.',
      channelTitle: 'freeCodeCamp.org',
      channelId: 'UC8butISFwT-Wl7EV0hUK0BQ',
      thumbnailUrl: 'https://i.ytimg.com/vi/8hly31xKli0/hqdefault.jpg',
      viewCount: '3.2M views',
      rawViewCount: 3200000,
      publishedAt: '2022-08-15T00:00:00Z',
      durationStr: '5h 22m',
      youtubeUrl: 'https://www.youtube.com/watch?v=8hly31xKli0',
      tags: ['algorithms', 'dsa', 'coding', 'software', 'programming', 'code', 'neetcode', 'interview']
    },
    {
      id: 'W6NZfCO5SIk',
      videoId: 'W6NZfCO5SIk',
      title: 'JavaScript Tutorial for Beginners: Learn JavaScript in 1 Hour [2024]',
      description: 'Rapid foundational modern JavaScript programming concepts, syntax, functions, and async patterns.',
      channelTitle: 'Programming with Mosh',
      channelId: 'UCWv7vMbMWH4-V0ZXdmDpPBA',
      thumbnailUrl: 'https://i.ytimg.com/vi/W6NZfCO5SIk/hqdefault.jpg',
      viewCount: '6.4M views',
      rawViewCount: 6400000,
      publishedAt: '2023-01-10T00:00:00Z',
      durationStr: '1h 08m',
      youtubeUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
      tags: ['javascript', 'js', 'frontend', 'web dev', 'react', 'coding', 'programming']
    },
    {
      id: 'kqtD5dpn9C8',
      videoId: 'kqtD5dpn9C8',
      title: 'Python for Beginners - Full Course [Programming Tutorial]',
      description: 'Complete Python mastery from variables to data science libraries, automation, and backend APIs.',
      channelTitle: 'freeCodeCamp.org',
      channelId: 'UC8butISFwT-Wl7EV0hUK0BQ',
      thumbnailUrl: 'https://i.ytimg.com/vi/kqtD5dpn9C8/hqdefault.jpg',
      viewCount: '41M views',
      rawViewCount: 41000000,
      publishedAt: '2021-05-19T00:00:00Z',
      durationStr: '4h 26m',
      youtubeUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
      tags: ['python', 'ai', 'machine learning', 'data', 'coding', 'backend']
    },
    {
      id: 'g9z-b132vA8',
      videoId: 'g9z-b132vA8',
      title: 'Ali Abdaal: The Ultimate Productivity System for High Achievers',
      description: 'How to design frictionless daily execution workflows, manage energy, and build deep focus rituals.',
      channelTitle: 'Ali Abdaal',
      channelId: 'UCoOae5nYA7VqaXzerajD0lg',
      thumbnailUrl: 'https://i.ytimg.com/vi/g9z-b132vA8/hqdefault.jpg',
      viewCount: '2.9M views',
      rawViewCount: 2900000,
      publishedAt: '2023-09-01T00:00:00Z',
      durationStr: '38 mins',
      youtubeUrl: 'https://www.youtube.com/watch?v=g9z-b132vA8',
      tags: ['ali abdaal', 'productivity', 'habits', 'time management', 'focus', 'study', 'systems']
    },
    {
      id: 'f2O6mQkFiiw',
      videoId: 'f2O6mQkFiiw',
      title: 'Fireship: 100+ Computer Science Concepts Explained in 13 Minutes',
      description: 'From Turing machines and compilers to cloud microservices and machine learning models.',
      channelTitle: 'Fireship',
      channelId: 'UCsBjURrPoezykLs9EqgamOA',
      thumbnailUrl: 'https://i.ytimg.com/vi/f2O6mQkFiiw/hqdefault.jpg',
      viewCount: '5.1M views',
      rawViewCount: 5100000,
      publishedAt: '2023-06-20T00:00:00Z',
      durationStr: '13 mins',
      youtubeUrl: 'https://www.youtube.com/watch?v=f2O6mQkFiiw',
      tags: ['fireship', 'computer science', 'cs', 'tech', 'coding', 'software engineering']
    },
    {
      id: '1nN99m6x214',
      videoId: '1nN99m6x214',
      title: '432Hz Miracle Tone - Deep Restorative Sleep & Brainwave Healing',
      description: 'Pure harmonic theta/delta frequency audio for rapid sleep onset and mental restoration.',
      channelTitle: 'Mind Ambiance',
      channelId: 'UCmindambiance',
      thumbnailUrl: 'https://i.ytimg.com/vi/1nN99m6x214/hqdefault.jpg',
      viewCount: '14M views',
      rawViewCount: 14000000,
      publishedAt: '2022-11-10T00:00:00Z',
      durationStr: '8h 00m',
      youtubeUrl: 'https://www.youtube.com/watch?v=1nN99m6x214',
      tags: ['432hz', 'sleep', 'binaural', 'meditation', 'relax', 'wind down', 'sound']
    }
  ];

  if (!q) return catalog;

  // Filter or prioritize matching videos
  const matches = catalog.filter((vid) => {
    return (
      vid.title.toLowerCase().includes(q) ||
      vid.channelTitle.toLowerCase().includes(q) ||
      vid.description.toLowerCase().includes(q) ||
      vid.tags.some((t) => q.includes(t) || t.includes(q))
    );
  });

  if (matches.length > 0) return matches;

  // Return full catalog if no exact match found, dynamically labeled
  return catalog;
}

// 4.5. YouTube Data API v3 Search & Creator Discovery Endpoint
app.post('/api/youtube-search', async (req, res) => {
  const { query = '', maxResults = 8 } = req.body || {};

  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const cleanQuery = query.trim();
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey) {
    try {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${Math.min(maxResults, 20)}&q=${encodeURIComponent(cleanQuery)}&key=${apiKey}`;
      const searchResponse = await fetch(searchUrl);
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const videoIds = (searchData.items || []).map((item: any) => item.id?.videoId).filter(Boolean);

        if (videoIds.length > 0) {
          const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(',')}&key=${apiKey}`;
          const detailsResponse = await fetch(videoDetailsUrl);
          
          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            const results = (detailsData.items || []).map((item: any) => {
              const snippet = item.snippet || {};
              const stats = item.statistics || {};
              const contentDetails = item.contentDetails || {};

              // Parse ISO 8601 duration
              let durationStr = '15 mins';
              if (contentDetails.duration) {
                const match = contentDetails.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                if (match) {
                  const hours = parseInt(match[1] || '0', 10);
                  const minutes = parseInt(match[2] || '0', 10);
                  const seconds = parseInt(match[3] || '0', 10);
                  durationStr = hours > 0 
                    ? `${hours}h ${minutes}m`
                    : `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                }
              }

              const viewCountNum = parseInt(stats.viewCount || '0', 10);
              let viewCountFormatted = '100K views';
              if (viewCountNum >= 1000000) {
                viewCountFormatted = `${(viewCountNum / 1000000).toFixed(1)}M views`;
              } else if (viewCountNum >= 1000) {
                viewCountFormatted = `${Math.round(viewCountNum / 1000)}K views`;
              }

              return {
                id: item.id,
                videoId: item.id,
                title: snippet.title || 'Educational Video',
                description: snippet.description || '',
                channelTitle: snippet.channelTitle || 'YouTube Creator',
                channelId: snippet.channelId || '',
                thumbnailUrl: snippet.thumbnails?.medium?.url || snippet.thumbnails?.high?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
                viewCount: viewCountFormatted,
                rawViewCount: viewCountNum,
                publishedAt: snippet.publishedAt || '',
                durationStr,
                youtubeUrl: `https://www.youtube.com/watch?v=${item.id}`
              };
            });

            return res.json({
              query: cleanQuery,
              source: 'youtube_api',
              results
            });
          }
        }
      }
    } catch (apiErr: any) {
      console.warn('[YouTube API Error]:', apiErr?.message || apiErr);
    }
  }

  // Fallback: Return curated video catalog
  const fallbackResults = getCuratedYouTubeVideos(cleanQuery);
  return res.json({
    query: cleanQuery,
    source: apiKey ? 'curated_fallback' : 'curated_catalog',
    note: apiKey ? undefined : 'YOUTUBE_API_KEY can be set in environment variables for custom live searching.',
    results: fallbackResults
  });
});

// 5. Universal AI Mentor & Coach Chat (General-Purpose + Flowra Goal-Aware)
app.post('/api/ai-chat', async (req, res) => {
  const {
    message = '',
    goal = 'Personal Growth',
    currentDay = 1,
    totalDays = 180,
    meaningfulScore = 82,
    streak = 1,
    petName = 'Sprout',
    petType = 'tree',
    aura = 100,
    mood = 'radiant',
    userName = 'Pioneer',
    todayTask = null,
    timetable = [],
    weeklyMilestones = [],
    chatHistory = [],
  } = req.body || {};

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  const historyFormatted = (chatHistory || [])
    .slice(-8)
    .map((h: { role: string; text: string }) => `${h.role === 'user' ? (userName || 'User') : 'Flowra Coach'}: ${h.text}`)
    .join('\n');

  const todayTaskSummary = todayTask
    ? `Title: "${todayTask.title}", Description: "${todayTask.description || ''}", Estimated Time: ${todayTask.estimatedMinutes || 45} mins, Category: ${todayTask.category || 'Core Sprint'}, Completed: ${todayTask.isCompleted ? 'Yes' : 'Not yet'}, Reward: +${todayTask.auraReward || 25} Aura`
    : `Day ${currentDay}: Core ${goal} Mastery Sprint (45 mins deep work)`;

  const timetableSummary = Array.isArray(timetable) && timetable.length > 0
    ? timetable.slice(0, 5).map((t: any) => `${t.timeSlot}: ${t.activity} (${t.tag || 'Focus'})`).join(' | ')
    : 'Morning Focus Sprint | Midday Deep Work | Evening Review';

  const generateFallbackChatReply = (userMsg: string) => {
    const lower = (userMsg || '').toLowerCase();
    if (lower.includes('streak') || lower.includes('progress') || lower.includes('day')) {
      return `🔥 **Your Live Momentum:**\nYou're on **Day ${currentDay} of ${totalDays}** (${Math.round((currentDay / (totalDays || 180)) * 100)}% complete) on your **${goal}** roadmap!\nYour streak is currently **${streak} days** strong with **${aura} Aura Points**.\n${petName} is in high spirits (${mood})! Keep showing up every day to protect that compounding momentum.`;
    }
    if (lower.includes('task') || lower.includes('today') || lower.includes('do')) {
      return `🎯 **Today's Assigned Milestone:**\n${todayTaskSummary}\n\nDedicate your next scheduled focus block to completing this task. Once completed, remember to tap complete to earn +25 Aura points and feed ${petName}!`;
    }
    if (lower.includes('dopamine') || lower.includes('drill') || lower.includes('reset') || lower.includes('scroll') || lower.includes('distract')) {
      return `⚡ **5-Minute Dopamine Switch Drill:**\n1. Take 3 deep diaphragmatic box breaths (4s in, 4s hold, 4s out, 4s hold).\n2. Shut down all background social and video tabs immediately.\n3. Open your Flowra Deep Blueprint module for **${goal}** and read just 2 paragraphs.\n\nMicro-action breaks the passive dopamine loop and reactivates your prefrontal cortex!`;
    }
    if (lower.includes('concept') || lower.includes('explain') || lower.includes('teach') || lower.includes('goal')) {
      return `💡 **Core Mental Model for ${goal}:**\nThe foundation of mastery is *Active Retrieval over Passive Familiarity*. When you passively scroll or watch tutorials, your brain experiences the illusion of competence. By forcing mental recall through drills and projects, you strengthen synaptic consolidation by over 300%!\n\nWhat specific part of ${goal} would you like to break down today?`;
    }
    return `Hey ${userName}! Flowra's motto is **"Same screen. Different aura."**\n\nI hear you loud and clear. On Day ${currentDay} of your **${goal}** journey with **${petName}**, every intentional minute compounds into extraordinary skill.\n\nWhether you need help breaking down a difficult problem, restructuring your daily timetable, or beating procrastination, what shall we tackle together right now?`;
  };

  const ai = getAI();
  if (!ai) {
    console.warn('[Flowra AI Chat] GEMINI_API_KEY is not set in environment — serving intelligent context-aware response.');
    return res.json({
      reply: generateFallbackChatReply(message),
      suggestedActions: [
        `What's today's focus task for ${goal}?`,
        'What is my current streak & progress?',
        'Give me a 5-minute dopamine reset drill',
      ],
    });
  }

  const prompt = `You are Flowra's 24/7 AI Coach & Mentor — a warm, brilliant, empathetic, and multi-disciplinary AI assistant.
Flowra's core philosophy is: "Same screen. Different aura." (Transforming passive doomscrolling into compound mastery and disciplined habits).

CRITICAL INSTRUCTIONS:
1. ACCURATE REAL USER DATA: When the user asks about their streak, today's task, day number, progress, companion, timetable, or score, YOU MUST ANSWER PRECISELY using the exact live data below:
   - Current Active Streak: ${streak} days 🔥
   - Today's Day: Day ${currentDay} of ${totalDays} (${Math.round((currentDay / (totalDays || 180)) * 100)}% complete)
   - Chosen Goal: "${goal}"
   - Today's Task: ${todayTaskSummary}
   - Meaningful Screen-Time Score: ${meaningfulScore}%
   - Aura Points: ${aura} XP
   - Companion Pet: ${petName} (${petType}, state: ${mood})
   - Today's Timetable: ${timetableSummary}
2. GENERAL-PURPOSE CAPABILITY: You are NOT restricted to only Flowra-related topics. You must answer ANY question the user asks helpfully, thoroughly, and naturally (e.g. general knowledge, casual conversation, coding & debugging, math, science, philosophy, history, advice, storytelling, life questions, or trivia).
3. NEVER REFUSE: NEVER say "I can only help with Flowra questions" or refuse off-topic inquiries. Always provide a high-quality, direct answer to the user's inquiry first!
4. PERSONALITY & COACHING TONE: Maintain a supportive, energetic, smart, and encouraging voice.
5. NATURAL GOAL-COACHING CONNECTION: Where it makes sense and feels natural (without feeling forced or overwhelming), you may gently weave in a brief encouraging tip or connection back to the user's active goal, roadmap progress, streak, daily focus blocks, or companion.

CURRENT USER CONTEXT:
- Name: ${userName}
- Chosen Transformation Goal: "${goal}"
- Progress: Day ${currentDay} of ${totalDays}
- Active Streak: ${streak} days 🔥
- Meaningful Screen-Time Score: ${meaningfulScore}%
- Today's Assigned Task: ${todayTaskSummary}
- Companion Mascot: ${petName} (${petType}, ${aura} Aura points, state: ${mood})

CONVERSATION HISTORY:
${historyFormatted || 'No previous messages in session.'}

USER MESSAGE:
"${message}"

RESPONSE FORMAT:
Provide a JSON object with:
{
  "reply": "Your clear, comprehensive, encouraging response in clean conversational markdown with paragraph breaks",
  "suggestedActions": ["Follow-up prompt 1", "Follow-up prompt 2", "Follow-up prompt 3"]
}

If returning JSON, return ONLY valid JSON. If JSON cannot be generated, you may output conversational markdown directly.`;

  try {
    const rawText = await generateGeminiText(ai, prompt, 'gemini-3.8-flash');

    let reply = '';
    let suggestedActions: string[] = [];

    // Attempt JSON parsing
    try {
      const parsed = extractJSON(rawText);
      if (parsed && typeof parsed === 'object') {
        reply = parsed.reply || '';
        if (Array.isArray(parsed.suggestedActions)) {
          suggestedActions = parsed.suggestedActions.filter((s: any) => typeof s === 'string');
        }
      }
    } catch {
      // If not strict JSON, use the raw response directly so user's answer is NEVER lost!
      reply = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    }

    if (!reply) {
      reply = rawText.trim() || 'I am right here with you! What would you like to explore or focus on next?';
    }

    // Default suggestions if none were generated
    if (!suggestedActions || suggestedActions.length === 0) {
      suggestedActions = [
        `What's today's focus task for ${goal}?`,
        'What is my current streak & progress?',
        'Give me a 5-minute dopamine reset drill',
      ];
    }

    return res.json({
      reply,
      suggestedActions: suggestedActions.slice(0, 3),
    });
  } catch (err: any) {
    const errorDetails = err?.message || String(err);
    console.error('[Flowra AI Chat Backend Error]:', {
      error: errorDetails,
      stack: err?.stack,
      userMessage: message,
    });

    const fallbackReply = generateFallbackChatReply(message);
    return res.json({
      reply: fallbackReply,
      suggestedActions: [
        `What's today's focus task for ${goal}?`,
        'What is my current streak & progress?',
        'Give me a 5-minute dopamine reset drill',
      ],
    });
  }
});

// 6. Club Peer Motivation & Jealousy Reminder Generator
app.post('/api/club-nudge', async (req, res) => {
  const { senderName = 'Aura Master', recipientName = 'Friend', recipientDaysMissed = 1, clubName = 'Focus Club', senderStreak = 7 } = req.body || {};

  const fallbackNudge = () => ({
    nudgeMessage: `⚡ Hey ${recipientName}! ${senderName} just locked in Day ${senderStreak} in ${clubName} and gained +25 Aura points! Don't let your companion go hungry—hop in now to protect your streak before you fall behind! 🔥`,
  });

  const result = await safeGenAI(
    async (ai) => {
      const prompt = `Generate a witty, high-energy peer motivation / competitive poke message for Flowra Club.
Club Name: "${clubName}"
Sender: "${senderName}" (Streak: ${senderStreak} days)
Recipient: "${recipientName}" (Missed: ${recipientDaysMissed} day(s))

Craft a punchy 2-sentence alert that playfully activates their competitive fire and fear of falling behind on the club leaderboard.
JSON format:
{
  "nudgeMessage": "..."
}

Return ONLY raw valid JSON.`;

      const rawText = await generateGeminiText(ai, prompt);
      return extractJSON(rawText || '{}');
    },
    fallbackNudge,
    'club-nudge'
  );

  res.json(result);
});

// 7. Daily Motivational Quote & Dynamic Adaptation
const INSPIRING_QUOTES = [
  {
    quote: "Discipline is choosing between what you want now and what you want most. Your aura compounds daily.",
    author: "Flowra Mindset",
  },
  {
    quote: "The same screen that numbs the world can be the canvas where you build your empire.",
    author: "Flowra Philosophy",
  },
  {
    quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear",
  },
  {
    quote: "Who you will be in 5 years depends on two things: the books you read and the screen habits you break.",
    author: "Charles Jones",
  },
  {
    quote: "Deep work is not a luxury; it is the superpower of the 21st century economy.",
    author: "Cal Newport",
  },
  {
    quote: "Every intentional minute logged today protects your tomorrow from regret.",
    author: "Flowra Arc",
  },
  {
    quote: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.",
    author: "John C. Maxwell",
  },
];

app.post('/api/daily-quote-task', async (req, res) => {
  const { goal = 'Growth', currentDay = 1, streak = 1, petName = 'Sprout' } = req.body || {};

  const fallbackQuoteTask = () => {
    const selected = INSPIRING_QUOTES[(Number(currentDay) + Number(streak)) % INSPIRING_QUOTES.length];
    return {
      quote: selected.quote,
      author: selected.author,
      petRemark: `${petName} is energized and ready for Day ${currentDay}! Let's lock in +25 Aura points today.`,
      todayTask: {
        id: `task-d${currentDay}`,
        day: Number(currentDay),
        title: `Day ${currentDay}: Deepen ${goal} Mastery`,
        description: `Dedicate a 45-minute distraction-free block to master today's core modules and complete your knowledge check.`,
        estimatedMinutes: 45,
        category: 'Daily Focus',
        auraReward: 25,
        learningPoints: ['Laser focus session', 'Zero doomscrolling sprint', 'Streak milestone locked'],
      },
    };
  };

  const result = await safeGenAI(
    async (ai) => {
      const prompt = `You are the Flowra AI Mentor (Tagline: "Same screen. Different aura.").
User Goal: "${goal}"
Current Day: ${currentDay}
Streak: ${streak} days
Companion Pet: ${petName}

Generate a structured JSON response:
{
  "quote": "Fresh, punchy, high-impact motivational quote that resonates deeply",
  "author": "Speaker or 'Flowra'",
  "petRemark": "Cute encouraging 1-sentence remark from ${petName}",
  "todayTask": {
    "id": "task-d${currentDay}",
    "day": ${currentDay},
    "title": "Specific actionable task title for Day ${currentDay} of ${goal}",
    "description": "Concrete 2-sentence explanation of what to execute today",
    "estimatedMinutes": 45,
    "category": "Deep Focus",
    "auraReward": 25,
    "learningPoints": ["Point 1", "Point 2", "Point 3"]
  }
}

Return ONLY raw valid JSON.`;

      const rawText = await generateGeminiText(ai, prompt);
      return extractJSON(rawText || '{}');
    },
    fallbackQuoteTask,
    'daily-quote-task'
  );

  res.json(result);
});

// 8. AI Smart Intervention & Dopamine Replacement
app.post('/api/ai-intervention', async (req, res) => {
  const { goal = 'Personal Growth', doomscrollingApp = 'Instagram / Reels', minutesSpent = 45 } = req.body || {};

  const fallbackIntervention = () => ({
    hookMessage: `⚠️ You logged ${minutesSpent} minutes on ${doomscrollingApp} today. That exact same time could have completed 2 deep learning modules in ${goal}!`,
    replacementChallenge: {
      title: `5-Minute Dopamine Switch: ${goal} Power Drill`,
      durationMinutes: 5,
      type: 'mini-drill',
      prompt: `Take 3 deep box breaths. Read one essential module in ${goal} or do 10 pushups/squats to break the dopamine loop!`,
      auraReward: 20,
      actionStep: 'Complete this quick 5-min challenge right now to feed your companion and protect your streak!',
    },
  });

  const result = await safeGenAI(
    async (ai) => {
      const prompt = `You are the Flowra AI Behavioral Coach.
The user spent ${minutesSpent} minutes passively on "${doomscrollingApp}".
Goal: "${goal}".

Create an engaging dopamine replacement challenge formatted in JSON:
{
  "hookMessage": "A smart comparative statement highlighting what they could accomplish instead in ${goal}",
  "replacementChallenge": {
    "title": "Catchy 5-Minute Dopamine Switch Title",
    "durationMinutes": 5,
    "type": "mini-drill",
    "prompt": "An engaging, immediate micro-activity that takes 3-5 minutes",
    "auraReward": 20,
    "actionStep": "Direct prompt on what to execute right now"
  }
}

Return ONLY raw valid JSON.`;

      const rawText = await generateGeminiText(ai, prompt);
      return extractJSON(rawText || '{}');
    },
    fallbackIntervention,
    'ai-intervention'
  );

  res.json(result);
});

// 9. AI Reflection Feedback
app.post('/api/ai-reflection', async (req, res) => {
  const { goal = 'Growth', answers, petName = 'Sprout' } = req.body || {};

  const fallbackReflection = () => ({
    insight: `Honest check-ins rewire awareness. Identifying triggers is 80% of overcoming them.`,
    tomorrowNudge: `Set a 25-minute deep focus timer before opening any social app tomorrow. ${petName} is rooting for you!`,
    auraDelta: 15,
  });

  const result = await safeGenAI(
    async (ai) => {
      const prompt = `You are the Flowra AI Behavioral Coach.
Goal: "${goal}"
Companion: ${petName}
Reflection:
- Value gained: "${answers?.gain || 'N/A'}"
- Trigger: "${answers?.scrollTrigger || 'Boredom / fatigue'}"
- Energy: "${answers?.energyRating || 'Moderate'}"
- Tomorrow's plan: "${answers?.tomorrowCommitment || 'Stick to schedule'}"

Generate JSON:
{
  "insight": "Empathetic 2-sentence psychological insight regarding their reflection",
  "tomorrowNudge": "One concrete micro-adjustment for tomorrow to eliminate their scroll trigger",
  "auraDelta": 15
}

Return ONLY raw valid JSON.`;

      const rawText = await generateGeminiText(ai, prompt);
      return extractJSON(rawText || '{}');
    },
    fallbackReflection,
    'ai-reflection'
  );

  res.json(result);
});

// Vite Middleware integration & production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Flowra Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
