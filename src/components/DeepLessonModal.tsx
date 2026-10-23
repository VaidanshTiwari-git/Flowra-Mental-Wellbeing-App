import React, { useState } from 'react';
import { LessonPackage, ModuleContent, QuizQuestion, ThemeMode } from '../types';
import {
  BookOpen,
  X,
  Play,
  CheckCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  ExternalLink,
  Award,
  ChevronRight,
  Flame,
  HelpCircle,
  Layers,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DeepLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: LessonPackage | null;
  isLoading?: boolean;
  onCompleteModule: (moduleId: string) => void;
  onCompleteQuiz: (score: number, total: number) => void;
  themeMode?: ThemeMode;
}

export const DeepLessonModal: React.FC<DeepLessonModalProps> = ({
  isOpen,
  onClose,
  lesson,
  isLoading = false,
  onCompleteModule,
  onCompleteQuiz,
  themeMode = 'dark',
}) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [readModules, setReadModules] = useState<string[]>([]);
  const [isQuizMode, setIsQuizMode] = useState(false);

  // Quiz state
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  if (!isOpen) return null;

  const modules = lesson?.modules || [];
  const currentModule = modules[activeModuleIndex];
  const allModulesRead = modules.length > 0 && modules.every((m) => readModules.includes(m.id));

  const handleMarkModuleAsRead = (moduleId: string) => {
    if (!readModules.includes(moduleId)) {
      const updated = [...readModules, moduleId];
      setReadModules(updated);
      onCompleteModule(moduleId);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10B981', '#34D399', '#6EE7B7'],
      });
    }

    if (activeModuleIndex < modules.length - 1) {
      setActiveModuleIndex(activeModuleIndex + 1);
    } else {
      setIsQuizMode(true);
    }
  };

  const handleSelectQuizOption = (questionId: string, optionIdx: number) => {
    if (isQuizSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIdx,
    });
  };

  const handleSubmitQuiz = () => {
    if (!lesson?.quiz) return;
    let score = 0;
    lesson.quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        score += 1;
      }
    });

    setQuizScore(score);
    setIsQuizSubmitted(true);
    onCompleteQuiz(score, lesson.quiz.length);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#10B981', '#F59E0B', '#6366F1', '#EC4899'],
    });
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsQuizSubmitted(false);
    setCurrentQuizQuestionIndex(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-4xl max-h-[92vh] rounded-3xl p-5 sm:p-6 shadow-2xl border flex flex-col overflow-hidden ${
          themeMode === 'light'
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[#0B0F17] border-zinc-800 text-white'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black truncate max-w-md">
                  {lesson?.title || 'Deep Learning Blueprint'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  6000+ Words
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span>{modules.length} Deep Modules</span>
                <span>•</span>
                <span>10 Final MCQs</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">+10 Aura / Module</span>
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

        {/* Working YouTube Video Integration Header */}
        {lesson?.youtubeVideoId && (
          <div className="mt-3 shrink-0">
            {!showVideo ? (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-950/40 via-zinc-900 to-zinc-900 border border-rose-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 ml-0.5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                      <span>Verified YouTube Lecture</span>
                      <span className="text-[10px] text-zinc-400 font-normal">({lesson.durationStr})</span>
                    </div>
                    <div className="text-[11px] text-zinc-300 font-medium">
                      Watch top video explanation alongside deep text modules
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowVideo(true)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-extrabold text-xs shadow-md transition-all flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Watch In-App</span>
                  </button>
                  <a
                    href={lesson.youtubeUrl || `https://www.youtube.com/watch?v=${lesson.youtubeVideoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-rose-500/40 bg-black aspect-video max-h-56 w-full shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${lesson.youtubeVideoId}?autoplay=1`}
                  title={lesson.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <button
                  onClick={() => setShowVideo(false)}
                  className="absolute top-2 right-2 px-2 py-1 bg-black/80 hover:bg-black text-white text-[10px] font-bold rounded-lg border border-zinc-700 z-10"
                >
                  Collapse Video ✕
                </button>
              </div>
            )}
          </div>
        )}

        {/* Module Navigation Tabs */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 shrink-0 border-b border-zinc-800/80">
          {modules.map((m, idx) => {
            const isRead = readModules.includes(m.id);
            const isActive = activeModuleIndex === idx && !isQuizMode;

            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveModuleIndex(idx);
                  setIsQuizMode(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-black shadow-md'
                    : isRead
                    ? 'bg-zinc-800/90 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-white'
                }`}
              >
                {isRead ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Layers className="w-3.5 h-3.5" />}
                <span>Module {m.moduleNumber}</span>
              </button>
            );
          })}

          {/* 10-Question Knowledge Retention Quiz Tab */}
          <button
            onClick={() => {
              if (allModulesRead) {
                setIsQuizMode(true);
              }
            }}
            disabled={!allModulesRead}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              isQuizMode
                ? 'bg-amber-500 text-black shadow-lg'
                : allModulesRead
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-zinc-900/40 text-zinc-600 border border-zinc-800/40 cursor-not-allowed'
            }`}
          >
            {allModulesRead ? <Award className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5" />}
            <span>10 MCQs Final Assessment</span>
            {!allModulesRead && <span className="text-[10px] font-normal">(Read modules first)</span>}
          </button>
        </div>

        {/* Main Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto my-3 pr-2 flex flex-col gap-4">
          {!isQuizMode && currentModule ? (
            /* Module Content View */
            <div className="flex flex-col gap-3 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {currentModule.title}
                </div>
                <div className="text-sm font-semibold text-zinc-300 mt-0.5">
                  {currentModule.subtitle}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-2">
                  <span>⏳ ~{currentModule.readingTimeMinutes} mins reading</span>
                  <span>•</span>
                  <span>📄 {currentModule.wordCount} words</span>
                  <span>•</span>
                  <span className="text-emerald-300 font-semibold">Reward: +10 Aura points</span>
                </div>
              </div>

              {/* Rich Content Markdown */}
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap font-sans">
                {currentModule.contentMarkdown}
              </div>

              {/* Key Takeaways Box */}
              {currentModule.keyTakeaways && (
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col gap-2">
                  <div className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Core Key Takeaways</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                    {currentModule.keyTakeaways.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* 10-Question Knowledge Retention Quiz View */
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    <span>Comprehensive 10-Question Knowledge Check</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Test your deep retention across all modules. Score 8+ to unlock +15 Aura points!
                  </p>
                </div>
                {isQuizSubmitted && (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs">
                    Score: {quizScore} / {lesson?.quiz?.length || 10}
                  </div>
                )}
              </div>

              {/* 10 Multiple Choice Questions */}
              <div className="flex flex-col gap-4">
                {lesson?.quiz?.map((q, qIndex) => {
                  const userAns = selectedAnswers[q.id];
                  const isCorrect = userAns === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isQuizSubmitted
                          ? isCorrect
                            ? 'bg-emerald-950/30 border-emerald-500/50'
                            : 'bg-rose-950/30 border-rose-500/50'
                          : 'bg-zinc-900/60 border-zinc-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-bold text-white flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] shrink-0 font-bold text-amber-400">
                            {q.questionNumber || qIndex + 1}
                          </span>
                          <span>{q.question}</span>
                        </div>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAns === optIdx;
                          const isOptionCorrect = optIdx === q.correctOptionIndex;

                          let btnStyle = 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700';

                          if (isQuizSubmitted) {
                            if (isOptionCorrect) {
                              btnStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold';
                            } else if (isSelected && !isOptionCorrect) {
                              btnStyle = 'bg-rose-500/20 border-rose-400 text-rose-300 line-through';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-emerald-500/20 border-emerald-400 text-white shadow-sm ring-1 ring-emerald-400';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectQuizOption(q.id, optIdx)}
                              className={`p-3 rounded-xl text-left border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isQuizSubmitted && isOptionCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation if submitted */}
                      {isQuizSubmitted && (
                        <div className="mt-2.5 pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
                          <span className="font-bold text-zinc-200">Explanation: </span>
                          <span>{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Controls */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between shrink-0">
          {!isQuizMode && currentModule ? (
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-zinc-400">
                {readModules.includes(currentModule.id) ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Module {currentModule.moduleNumber} Completed (+10 Aura)
                  </span>
                ) : (
                  <span>Finish reading to unlock +10 Aura points</span>
                )}
              </div>

              <button
                onClick={() => handleMarkModuleAsRead(currentModule.id)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition-all"
              >
                <span>{readModules.includes(currentModule.id) ? 'Next Module' : 'Complete Module (+10 Aura)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setIsQuizMode(false)}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold"
              >
                Back to Modules
              </button>

              {!isQuizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(selectedAnswers).length < (lesson?.quiz?.length || 10)}
                  className={`px-6 py-2.5 rounded-xl text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition-all ${
                    Object.keys(selectedAnswers).length >= (lesson?.quiz?.length || 10)
                      ? 'bg-amber-400 hover:bg-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                      : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Submit 10 MCQs & Claim Aura</span>
                </button>
              ) : (
                <button
                  onClick={handleResetQuiz}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake 10 MCQs</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
