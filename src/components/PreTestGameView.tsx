import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Gamepad2,
  Trophy,
  Flame,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Shield,
  Zap,
  HelpCircle,
  Award,
  Star,
  RefreshCw,
  Volume2,
  VolumeX,
  Compass,
  Lightbulb,
  Check,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';
import { CARTOON_AVATARS } from '../data/gameLevelsData';
import { getStudentProgress } from '../utils/gameStorage';
import { getStudentByUsername } from '../data/studentAccounts';
import { getPreTestQuestions, submitPreTestResult } from '../data/preTestData';
import { PreTestQuestion, PreTestResult, StudentGameProgress } from '../types';

interface PreTestGameViewProps {
  username: string;
  onFinishPreTest: () => void;
  onBackToInstructions?: () => void;
}

// Simple Web Audio synthesizer for pleasant retro game sounds (zero external files)
function playSound(type: 'correct' | 'wrong' | 'click' | 'lifeline' | 'fanfare') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'correct') {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.07 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.2);
      });
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'lifeline') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'fanfare') {
      const fanfare = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      fanfare.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
      });
    }
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export const PreTestGameView: React.FC<PreTestGameViewProps> = ({
  username,
  onFinishPreTest,
  onBackToInstructions,
}) => {
  const [questions, setQuestions] = useState<PreTestQuestion[]>(() => getPreTestQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chosenAnswers, setChosenAnswers] = useState<Record<string, number>>({});
  const [answeredState, setAnsweredState] = useState<Record<string, { answered: boolean; isCorrect: boolean }>>({});
  const [scoreEarned, setScoreEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Lifelines
  const [usedFiftyFifty, setUsedFiftyFifty] = useState<Record<string, boolean>>({});
  const [hiddenOptions, setHiddenOptions] = useState<Record<string, number[]>>({});
  const [showHintForQ, setShowHintForQ] = useState<string | null>(null);

  // Time tracking
  const startTimeRef = useRef<number>(Date.now());

  // Result completion modal
  const [finalResult, setFinalResult] = useState<PreTestResult | null>(null);

  const studentInfo = useMemo(() => getStudentByUsername(username), [username]);
  const progress: StudentGameProgress = useMemo(() => getStudentProgress(username), [username]);
  const currentAvatar =
    CARTOON_AVATARS.find((a) => a.id === progress.avatarId) || CARTOON_AVATARS[0];

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isCurrentAnswered = !!answeredState[currentQ?.id]?.answered;

  const handleSelectOption = (optionIdx: number) => {
    if (isCurrentAnswered || !currentQ) return;

    if (soundEnabled) playSound('click');

    const isCorrect = optionIdx === currentQ.correctIndex;
    const qPoints = currentQ.points || 50;

    // Update chosen
    setChosenAnswers((prev) => ({ ...prev, [currentQ.id]: optionIdx }));
    setAnsweredState((prev) => ({
      ...prev,
      [currentQ.id]: { answered: true, isCorrect },
    }));

    if (isCorrect) {
      if (soundEnabled) playSound('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      setScoreEarned((prev) => prev + qPoints);
    } else {
      if (soundEnabled) playSound('wrong');
      setStreak(0);
    }
  };

  // Lifeline: 50:50
  const handleFiftyFifty = () => {
    if (!currentQ || isCurrentAnswered || usedFiftyFifty[currentQ.id]) return;
    if (soundEnabled) playSound('lifeline');

    // Find two wrong options to hide
    const wrongIndices = currentQ.options
      .map((_, idx) => idx)
      .filter((idx) => idx !== currentQ.correctIndex);

    // Shuffle and pick 2
    const toHide = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);

    setUsedFiftyFifty((prev) => ({ ...prev, [currentQ.id]: true }));
    setHiddenOptions((prev) => ({ ...prev, [currentQ.id]: toHide }));
  };

  // Lifeline: Hint
  const handleToggleHint = () => {
    if (!currentQ) return;
    if (soundEnabled) playSound('lifeline');
    setShowHintForQ((prev) => (prev === currentQ.id ? null : currentQ.id));
  };

  const handleNext = () => {
    if (soundEnabled) playSound('click');
    setShowHintForQ(null);
    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finish Pre-Test
      handleCompleteGame();
    }
  };

  const handleCompleteGame = () => {
    const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    const { result } = submitPreTestResult(username, chosenAnswers, elapsedSeconds);
    setFinalResult(result);
    if (soundEnabled) playSound('fanfare');
  };

  // Calculate stats
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answeredState).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="relative w-full max-w-5xl mx-auto z-10 font-['Cairo',_sans-serif] text-right py-4 animate-fadeIn">
      {/* Background Ambient Glow */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-amber-600/20 via-blue-600/20 to-purple-600/20 blur-2xl opacity-75 pointer-events-none" />

      {/* Main Container */}
      <div className="relative rounded-3xl bg-[#090b17]/95 backdrop-blur-2xl border-2 border-amber-500/40 p-5 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden">
        {/* Top Game HUD Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full bg-amber-950/90 border border-amber-500/60 text-[#ffd700] text-xs font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                <Gamepad2 className="w-4 h-4 text-amber-400 animate-pulse" />
                المستوى التمهيدي: لعبة الاختبار القبلي
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-bold">
                تشخيص المهارات التفاعلية
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-['Tajawal'] tracking-tight">
              تحدي الأسئلة القبلية (Adobe Captivate 2019)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              أجب عن الأسئلة بدقة وسرعة لحصد نقاط XP وكسب وسام الانطلاق الأول لفتح المراحل التعليمية.
            </p>
          </div>

          {/* HUD Badges: Score, Streak, Sound */}
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
            {/* Score */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#0e1224] border border-amber-500/50 shadow-inner">
              <Star className="w-4 h-4 text-[#ffd700] fill-amber-400" />
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block font-bold">النقاط المكتسبة</span>
                <span className="text-sm font-black text-[#ffd700] font-['Outfit']">+{scoreEarned} XP</span>
              </div>
            </div>

            {/* Streak Combo */}
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border transition-all ${
              streak > 1 ? 'bg-rose-950/70 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse' : 'bg-[#0e1224] border-slate-800 text-slate-400'
            }`}>
              <Flame className={`w-4 h-4 ${streak > 1 ? 'text-rose-400 fill-rose-500' : 'text-slate-500'}`} />
              <div className="text-center">
                <span className="text-[10px] block font-bold">سلسلة صحيحة</span>
                <span className="text-xs font-black font-['Outfit']">{streak}x</span>
              </div>
            </div>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-2xl bg-[#0e1224] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
              title={soundEnabled ? 'كتم المؤثرات الصوتية' : 'تفعيل المؤثرات الصوتية'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Progress Bar & Question Tracker */}
        <div className="my-5">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span>السؤال</span>
              <span className="text-[#ffd700] text-sm font-black">{currentIndex + 1}</span>
              <span className="text-slate-500">من {totalQuestions}</span>
            </span>
            <span className="text-slate-400 font-mono">{progressPercent}% إنجاز</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Game Arena Layout: Avatar + Question */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-6">
          {/* Avatar Cheerleader (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl bg-gradient-to-b from-[#11162d] to-[#080b18] border border-blue-500/30 p-5 flex flex-col items-center justify-between shadow-lg text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-amber-400 to-purple-500" />

            <div className="w-full">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 text-[11px] font-bold border border-blue-500/40 inline-block mb-3">
                شخصيتك المرافقة
              </span>

              <div className="relative w-24 h-24 mx-auto mb-3 flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border-2 border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.25)] text-4xl">
                <span>{currentAvatar.emoji}</span>
              </div>

              <h4 className="text-base font-black text-white font-['Tajawal']">{currentAvatar.name}</h4>
              <p className="text-xs text-amber-300 font-medium mb-3">{currentAvatar.title}</p>
            </div>

            {/* Dynamic Commentary Speech Bubble */}
            <div className="w-full p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed shadow relative">
              <div className="absolute -top-2 right-1/2 translate-x-1/2 w-3 h-3 bg-slate-950 border-t border-r border-slate-800 rotate-[-45deg]" />
              {!isCurrentAnswered ? (
                <span>
                  «ركز جيداً يا <strong className="text-[#ffd700]">{studentInfo?.fullName || username}</strong>! اقرأ السؤال بدقة واختر الإجابة الأكثر ملاءمة لمعايير الوسائط المتعددة.»
                </span>
              ) : answeredState[currentQ.id]?.isCorrect ? (
                <span className="text-emerald-300 font-bold">
                  «إجابة مبهرة وصحيحة! رصيدك يرتفع، وأنت في طريقك لاجتياز الاختبار القبلي بنجاح 🌟»
                </span>
              ) : (
                <span className="text-rose-300 font-bold">
                  «محاولة قريبة! لا تقلق، هذا اختبار تشخيصي لتحديد ما ستتعلمه في المستويات القادمة.»
                </span>
              )}
            </div>

            {/* Lifelines section */}
            <div className="w-full mt-4 pt-3 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400 block font-bold mb-2">أدوات المساعدة في اللعبة:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleFiftyFifty}
                  disabled={isCurrentAnswered || usedFiftyFifty[currentQ.id]}
                  className={`px-2.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border ${
                    usedFiftyFifty[currentQ.id]
                      ? 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                      : isCurrentAnswered
                      ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border-indigo-500/50 hover:border-indigo-400 cursor-pointer shadow-sm'
                  }`}
                  title="حذف خيارين غير صحيحين"
                >
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>50:50</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleHint}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                    showHintForQ === currentQ.id
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md'
                      : 'bg-amber-950/70 hover:bg-amber-900 text-amber-300 border-amber-500/50'
                  }`}
                  title="عرض تلميح تفاعلي"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>تلميح</span>
                </button>
              </div>
            </div>
          </div>

          {/* Question & Choices Arena (8 cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
            {/* The Question Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121630] to-[#0c0f20] border-2 border-blue-500/40 shadow-xl relative">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-blue-950 border border-blue-500/50 text-blue-300 text-xs font-bold">
                  سؤال تشخيصي #{currentIndex + 1}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500/50 text-[#ffd700] text-xs font-black">
                  +{currentQ?.points || 50} XP
                </span>
              </div>

              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white font-['Tajawal'] leading-relaxed">
                {currentQ?.question}
              </h2>

              {/* Hint Box if triggered */}
              {showHintForQ === currentQ?.id && (
                <div className="mt-4 p-3.5 rounded-xl bg-amber-950/80 border border-amber-500/60 text-xs text-amber-200 animate-fadeIn flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-amber-300 mb-0.5">تلميح المهارة:</strong>
                    <span>{currentQ.explanation}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-1 gap-3">
              {currentQ?.options.map((opt, optIdx) => {
                const isSelected = chosenAnswers[currentQ.id] === optIdx;
                const isCorrect = optIdx === currentQ.correctIndex;
                const isHiddenByFiftyFifty = (hiddenOptions[currentQ.id] || []).includes(optIdx);

                if (isHiddenByFiftyFifty) {
                  return (
                    <div
                      key={optIdx}
                      className="p-3.5 rounded-xl border border-dashed border-slate-800 bg-slate-950/30 text-slate-700 text-xs line-through text-center select-none"
                    >
                      (خيار مستبعد بواسطة 50:50)
                    </div>
                  );
                }

                let stateClasses = 'bg-[#0e1224] border-slate-800 text-slate-200 hover:border-amber-400/60 hover:bg-[#141a33]';

                if (isCurrentAnswered) {
                  if (isCorrect) {
                    stateClasses = 'bg-emerald-950/90 border-2 border-emerald-400 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.4)]';
                  } else if (isSelected && !isCorrect) {
                    stateClasses = 'bg-rose-950/90 border-2 border-rose-500 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.4)]';
                  } else {
                    stateClasses = 'bg-[#0a0d1a] border-slate-900 text-slate-500 opacity-50';
                  }
                } else if (isSelected) {
                  stateClasses = 'bg-amber-950/70 border-2 border-amber-400 text-[#ffd700]';
                }

                const optionLetter = ['أ', 'ب', 'ج', 'د'][optIdx] || `${optIdx + 1}`;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={isCurrentAnswered}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 rounded-2xl border transition-all text-right flex items-center justify-between gap-3 text-sm font-semibold cursor-pointer select-none transform ${
                      !isCurrentAnswered ? 'hover:-translate-y-0.5 active:scale-[0.99]' : ''
                    } ${stateClasses}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border ${
                          isCurrentAnswered && isCorrect
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                            : isCurrentAnswered && isSelected && !isCorrect
                            ? 'bg-rose-500 text-white border-rose-300'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        {optionLetter}
                      </div>
                      <span className="leading-relaxed">{opt}</span>
                    </div>

                    {isCurrentAnswered && (
                      <div className="shrink-0">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : isSelected ? (
                          <X className="w-5 h-5 text-rose-400" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation & Next Button */}
            {isCurrentAnswered && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/40 animate-fadeIn">
                <div className="flex items-start gap-2.5 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-200 leading-relaxed">
                    <strong className="text-white">التفسير الأكاديمي: </strong>
                    {currentQ.explanation}
                  </p>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    id="btn-pretest-next-q"
                    onClick={handleNext}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(255,215,0,0.4)] border border-amber-300 transition-all cursor-pointer flex items-center gap-2 transform hover:-translate-y-0.5"
                  >
                    <span>{isLastQuestion ? 'إنهاء الاختبار القبلي ورؤية النتيجة' : 'السؤال التالي'}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Back Button */}
        {onBackToInstructions && (
          <div className="pt-4 border-t border-slate-800 flex justify-start">
            <button
              type="button"
              onClick={onBackToInstructions}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold border border-slate-800 transition cursor-pointer"
            >
              العودة لشاشة القواعد والإرشادات
            </button>
          </div>
        )}
      </div>

      {/* FINAL CELEBRATION MODAL */}
      {finalResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#090b17] border-2 border-[#ffd700] p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(255,215,0,0.4)] overflow-hidden font-['Cairo',_sans-serif]">
            {/* Ambient burst */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-b from-amber-500/30 via-yellow-500/20 to-transparent blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.5)] border-2 border-amber-200">
                <Trophy className="w-10 h-10 text-slate-950 animate-bounce" />
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-xs font-black inline-block mb-2">
                ✅ تم إتمام الاختبار القبلي بنجاح
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-white font-['Tajawal'] mb-2">
                مبروك يا بطل! أنهيت المستوى التمهيدي
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed max-w-sm mx-auto">
                تم تسجيل درجاتك وإجاباتك القبلية في لوحة الإشراف الأكاديمي، وتم فتح المسار التعليمي والمرحلة الأولى رسمياً.
              </p>

              {/* Score & Badge Showcase */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 rounded-2xl bg-[#11162d] border border-amber-500/40 text-center">
                  <span className="text-xs text-slate-400 block font-bold mb-1">الدرجة المحققة</span>
                  <span className="text-2xl font-black text-[#ffd700] font-['Outfit']">
                    {finalResult.score} <span className="text-xs text-slate-400">/ {finalResult.maxScore} XP</span>
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#11162d] border border-purple-500/40 text-center">
                  <span className="text-xs text-slate-400 block font-bold mb-1">الشارة المكتسبة</span>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-black text-purple-300">وسام المستكشف التمهيدي</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  id="btn-pretest-launch-map"
                  onClick={onFinishPreTest}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-emerald-400/80 transition-all cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  <Compass className="w-5 h-5 text-amber-300" />
                  <span>انطلق الآن إلى خريطة التعلم (المستوى 1)</span>
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
