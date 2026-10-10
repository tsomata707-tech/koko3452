import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
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
  Navigation,
} from 'lucide-react';
import { CARTOON_AVATARS } from '../data/gameLevelsData';
import { getStudentProgress } from '../utils/gameStorage';
import { getStudentByUsername } from '../data/studentAccounts';
import {
  getPreTestQuestions,
  getPostTestQuestions,
  submitPreTestResult,
  submitPostTestResult,
} from '../data/preTestData';
import { PreTestQuestion, PreTestResult, StudentGameProgress } from '../types';

interface PreTestGameViewProps {
  username: string;
  mode?: 'pre' | 'post';
  onFinishPreTest: () => void;
  onBackToInstructions?: () => void;
}

// Retro Web Audio Synthesizer (Engine, Vroom, Win, Buzzer, Fanfare)
function playCarSound(type: 'engine' | 'drive' | 'correct' | 'wrong' | 'click' | 'fanfare') {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else if (type === 'engine' || type === 'drive') {
      // Car rev sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'correct') {
      // Cheerful victory melody
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.22);
      });
    } else if (type === 'wrong') {
      // Buzzer sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(130, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'fanfare') {
      const fanfare = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
      fanfare.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.16, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
      });
    }
  } catch {
    // Audio context may be restricted by browser policy
  }
}

// Interactive Sports Car SVG Component
const RacingCarGraphic: React.FC<{
  isDriving?: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  scale?: number;
}> = ({ isDriving, isCorrect, isWrong, scale = 1 }) => {
  return (
    <div
      className={`relative inline-block transition-transform duration-300 ${
        isDriving ? 'animate-bounce' : ''
      }`}
      style={{ transform: `scale(${scale})` }}
    >
      <svg
        width="110"
        height="56"
        viewBox="0 0 110 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_4px_12px_rgba(244,63,94,0.4)]"
      >
        <defs>
          <linearGradient id="carBodyGrad" x1="0" y1="0" x2="110" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor={isCorrect ? '#10b981' : isWrong ? '#ef4444' : '#ef4444'} />
            <stop offset="0.5" stopColor={isCorrect ? '#059669' : isWrong ? '#dc2626' : '#e11d48'} />
            <stop offset="1" stopColor={isCorrect ? '#047857' : isWrong ? '#991b1b' : '#be123c'} />
          </linearGradient>
          <linearGradient id="windshieldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#67e8f9" stopOpacity="0.9" />
            <stop offset="1" stopColor="#0891b2" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="headlightGlow" cx="0.5" cy="0.5" r="0.5">
            <stop stopColor="#fef08a" />
            <stop offset="1" stopColor="#facc15" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Headlight beam */}
        <path
          d="M102 36 L124 24 L124 48 Z"
          fill="url(#headlightGlow)"
          opacity={isDriving || isCorrect ? 0.9 : 0.4}
        />

        {/* Exhaust flame when driving */}
        {isDriving && (
          <path
            d="M0 38 Q-12 36 -18 38 Q-10 42 0 42 Z"
            fill="#f59e0b"
            className="animate-pulse"
          />
        )}

        {/* Shadow */}
        <ellipse cx="55" cy="50" rx="46" ry="4" fill="#000000" opacity="0.45" />

        {/* Rear Spoiler */}
        <path d="M4 18 L18 18 L14 26 L2 26 Z" fill="#1e293b" />
        <line x1="8" y1="26" x2="8" y2="34" stroke="#0f172a" strokeWidth="2.5" />
        <line x1="16" y1="26" x2="16" y2="34" stroke="#0f172a" strokeWidth="2.5" />

        {/* Car Body */}
        <path
          d="M8 35 C12 28 24 20 40 18 C58 16 72 20 86 28 L98 32 C104 34 106 38 104 42 C102 46 96 46 92 46 L14 46 C9 46 6 42 8 35 Z"
          fill="url(#carBodyGrad)"
          stroke="#ffe4e6"
          strokeWidth="1.2"
        />

        {/* Racing Stripes */}
        <path d="M38 18 L84 28 L82 32 L36 22 Z" fill="#ffffff" opacity="0.3" />
        <path d="M42 18 L88 28 L86 32 L40 22 Z" fill="#ffd700" opacity="0.5" />

        {/* Cabin & Windshield */}
        <path
          d="M34 22 C42 16 56 16 66 18 C74 20 78 24 82 28 L32 28 Z"
          fill="url(#windshieldGrad)"
          stroke="#0e7490"
          strokeWidth="1"
        />

        {/* Driver Helmet (Mascot) */}
        <circle cx="54" cy="22" r="5" fill="#f8fafc" />
        <path d="M52 21 Q56 20 58 23" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />

        {/* Front Headlight */}
        <path d="M98 34 C102 34 104 36 104 38 L98 40 Z" fill="#fef08a" />

        {/* Wheels */}
        {/* Rear Wheel */}
        <g className={isDriving ? 'origin-[24px_46px] animate-spin' : ''}>
          <circle cx="24" cy="46" r="8" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          <circle cx="24" cy="46" r="4.5" fill="#64748b" />
          <circle cx="24" cy="46" r="2" fill="#ffd700" />
        </g>

        {/* Front Wheel */}
        <g className={isDriving ? 'origin-[84px_46px] animate-spin' : ''}>
          <circle cx="84" cy="46" r="8" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          <circle cx="84" cy="46" r="4.5" fill="#64748b" />
          <circle cx="84" cy="46" r="2" fill="#ffd700" />
        </g>

        {/* Speed / Energy Sparks */}
        {(isDriving || isCorrect) && (
          <>
            <circle cx="95" cy="20" r="1.5" fill="#fef08a" />
            <circle cx="102" cy="16" r="2" fill="#67e8f9" />
          </>
        )}
      </svg>
    </div>
  );
};

// Laughing Anime Mascot Component (أنمي يضحك مع ملامح كارتونية مبتهجة)
const LaughingAnimeMascot: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center animate-bounce">
      {/* Anime Character SVG */}
      <svg width="140" height="150" viewBox="0 0 140 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="animeSkin" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#ffedd5" />
            <stop offset="1" stopColor="#fed7aa" />
          </linearGradient>
          <linearGradient id="animeHair" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#3b82f6" />
            <stop offset="0.5" stopColor="#6366f1" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* Joyful Sparkles around character */}
        <g className="animate-spin origin-[20px_25px]">
          <path d="M20 18 L22 23 L27 25 L22 27 L20 32 L18 27 L13 25 L18 23 Z" fill="#ffd700" />
        </g>
        <g className="animate-spin origin-[120px_35px]">
          <path d="M120 28 L122 33 L127 35 L122 37 L120 42 L118 37 L113 35 L118 33 Z" fill="#38bdf8" />
        </g>

        {/* Back Hair */}
        <path
          d="M25 45 C15 70 20 100 25 110 C35 115 105 115 115 110 C120 100 125 70 115 45 Z"
          fill="#4338ca"
        />

        {/* Body / Shirt */}
        <path d="M45 110 L95 110 L105 145 L35 145 Z" fill="#0284c7" />
        <path d="M55 110 L70 125 L85 110 Z" fill="#ffffff" />
        <path d="M68 125 L72 125 L70 145 Z" fill="#ef4444" />

        {/* Victory V Sign Hand (Left) */}
        <g transform="translate(18, 90)">
          <circle cx="12" cy="12" r="10" fill="#fed7aa" />
          {/* V fingers */}
          <rect x="7" y="-6" width="4" height="12" rx="2" fill="#fed7aa" transform="rotate(-15 7 -6)" />
          <rect x="15" y="-6" width="4" height="12" rx="2" fill="#fed7aa" transform="rotate(15 15 -6)" />
        </g>

        {/* Victory V Sign Hand (Right) */}
        <g transform="translate(98, 90)">
          <circle cx="12" cy="12" r="10" fill="#fed7aa" />
          <rect x="7" y="-6" width="4" height="12" rx="2" fill="#fed7aa" transform="rotate(-15 7 -6)" />
          <rect x="15" y="-6" width="4" height="12" rx="2" fill="#fed7aa" transform="rotate(15 15 -6)" />
        </g>

        {/* Neck */}
        <rect x="62" y="95" width="16" height="16" fill="#fed7aa" rx="4" />

        {/* Face */}
        <ellipse cx="70" cy="65" rx="36" ry="34" fill="url(#animeSkin)" />

        {/* Cute Ears */}
        <circle cx="34" cy="68" r="8" fill="#fed7aa" />
        <circle cx="106" cy="68" r="8" fill="#fed7aa" />

        {/* Front Hair Bangs */}
        <path
          d="M34 50 C40 30 55 20 70 20 C85 20 100 30 106 50 C96 42 85 45 78 54 C72 44 60 44 54 52 C46 44 38 46 34 50 Z"
          fill="url(#animeHair)"
        />
        <path d="M70 20 C72 10 78 12 76 22 Z" fill="#3b82f6" />

        {/* Laughing Eyes (Closed crescent shape ^ ^) */}
        <path
          d="M48 60 Q56 52 64 60"
          stroke="#1e293b"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M76 60 Q84 52 92 60"
          stroke="#1e293b"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Eyebrows */}
        <path d="M48 50 Q56 46 64 50" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M76 50 Q84 46 92 50" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Rosy Anime Blushing Cheeks */}
        <ellipse cx="46" cy="70" rx="9" ry="5.5" fill="#f43f5e" opacity="0.65" />
        <ellipse cx="94" cy="70" rx="9" ry="5.5" fill="#f43f5e" opacity="0.65" />

        {/* Anime Open Laughing Mouth (D shape with tongue) */}
        <path
          d="M58 72 Q70 70 82 72 Q70 92 58 72 Z"
          fill="#be123c"
          stroke="#881337"
          strokeWidth="1.5"
        />
        {/* Tongue */}
        <path d="M63 80 Q70 74 77 80 Q70 88 63 80 Z" fill="#fb7185" />
        {/* White tooth spark */}
        <path d="M62 73 Q70 73 78 73 Q70 76 62 73 Z" fill="#ffffff" />
      </svg>
      {/* Speech text */}
      <span className="text-emerald-400 font-black text-sm tracking-wide mt-1">
        ههههه رائع جداً! إجابة صحيحة يا بطل! 🎉✨
      </span>
    </div>
  );
};

// Angry Anime Mascot Component (أنمي غاضب ومعصب دون قصاصات ورقية)
const AngryAnimeMascot: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center animate-pulse">
      {/* Anime Character SVG - Angry */}
      <svg width="140" height="150" viewBox="0 0 140 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="angrySkin" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#fecdd3" />
            <stop offset="1" stopColor="#fda4af" />
          </linearGradient>
          <linearGradient id="angryHair" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#b91c1c" />
            <stop offset="0.5" stopColor="#991b1b" />
            <stop offset="1" stopColor="#7f1d1d" />
          </linearGradient>
        </defs>

        {/* Steam Puffs (Steam coming out of ears / head) */}
        <g className="animate-bounce">
          <ellipse cx="24" cy="40" rx="6" ry="4" fill="#e2e8f0" opacity="0.8" />
          <ellipse cx="18" cy="34" rx="4" ry="3" fill="#cbd5e1" opacity="0.6" />
          <ellipse cx="116" cy="40" rx="6" ry="4" fill="#e2e8f0" opacity="0.8" />
          <ellipse cx="122" cy="34" rx="4" ry="3" fill="#cbd5e1" opacity="0.6" />
        </g>

        {/* Back Hair */}
        <path
          d="M25 45 C15 70 20 100 25 110 C35 115 105 115 115 110 C120 100 125 70 115 45 Z"
          fill="#450a0a"
        />

        {/* Body / Shirt */}
        <path d="M45 110 L95 110 L105 145 L35 145 Z" fill="#991b1b" />
        <path d="M55 110 L70 125 L85 110 Z" fill="#334155" />

        {/* Clenched Fists (Left & Right) */}
        <circle cx="28" cy="115" r="9" fill="#fda4af" stroke="#991b1b" strokeWidth="2" />
        <circle cx="112" cy="115" r="9" fill="#fda4af" stroke="#991b1b" strokeWidth="2" />

        {/* Neck */}
        <rect x="62" y="95" width="16" height="16" fill="#fda4af" rx="4" />

        {/* Face */}
        <ellipse cx="70" cy="65" rx="36" ry="34" fill="url(#angrySkin)" />

        {/* Ears */}
        <circle cx="34" cy="68" r="8" fill="#fda4af" />
        <circle cx="106" cy="68" r="8" fill="#fda4af" />

        {/* Front Hair */}
        <path
          d="M34 50 C40 30 55 20 70 20 C85 20 100 30 106 50 C96 42 85 45 78 54 C72 44 60 44 54 52 C46 44 38 46 34 50 Z"
          fill="url(#angryHair)"
        />

        {/* Classic Anime Angry Cross Mark (💢) on forehead */}
        <g transform="translate(86, 32)">
          <path d="M0 6 Q6 0 12 6" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M0 12 Q6 18 12 12" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M6 0 Q0 6 6 12" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M12 0 Q18 6 12 12" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </g>

        {/* Sharply Furrowed Angry Eyebrows (\ /) */}
        <path d="M46 54 L64 62" stroke="#450a0a" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M94 54 L76 62" stroke="#450a0a" strokeWidth="4.5" strokeLinecap="round" />

        {/* Fierce Angry Eyes */}
        <ellipse cx="56" cy="66" rx="6" ry="7" fill="#450a0a" />
        <circle cx="55" cy="64" r="2" fill="#ffffff" />
        <ellipse cx="84" cy="66" rx="6" ry="7" fill="#450a0a" />
        <circle cx="83" cy="64" r="2" fill="#ffffff" />

        {/* Gritted Angry Mouth (Zigzag / Pout 😠) */}
        <path
          d="M58 84 Q70 78 82 84"
          stroke="#450a0a"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Teeth clench lines */}
        <line x1="64" y1="81" x2="64" y2="85" stroke="#450a0a" strokeWidth="2" />
        <line x1="70" y1="80" x2="70" y2="84" stroke="#450a0a" strokeWidth="2" />
        <line x1="76" y1="81" x2="76" y2="85" stroke="#450a0a" strokeWidth="2" />
      </svg>
      {/* Speech text */}
      <span className="text-rose-400 font-black text-sm tracking-wide mt-1">
        أوووه لاااا! وجهة خاطئة تماماً! 💢 ركز يا بطل!
      </span>
    </div>
  );
};

// Celebration Confetti (قصاصات ورقية ملونة تظهر فقط عند الإجابة الصحيحة)
const ConfettiRain: React.FC = () => {
  // Generate random pieces
  const pieces = useMemo(() => {
    const colors = ['#ffd700', '#f43f5e', '#38bdf8', '#10b981', '#a855f7', '#fb923c', '#ec4899'];
    return Array.from({ length: 55 }).map((_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: `${(i * 1.8 + Math.random() * 2) % 100}%`,
      delay: `${(Math.random() * 0.8).toFixed(2)}s`,
      duration: `${(1.8 + Math.random() * 1.5).toFixed(2)}s`,
      size: `${6 + Math.floor(Math.random() * 10)}px`,
      rotate: `${Math.floor(Math.random() * 360)}deg`,
    }));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: p.left,
            top: '-20px',
            width: p.size,
            height: `${parseInt(p.size, 10) * 1.6}px`,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotate})`,
            borderRadius: '2px',
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg) scale(0.8);
            opacity: 1;
          }
          50% {
            transform: translateY(50vh) rotate(360deg) scale(1.1);
            opacity: 0.9;
          }
          100% {
            transform: translateY(105vh) rotate(720deg) scale(0.7);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation-name: confettiFall;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};

export const PreTestGameView: React.FC<PreTestGameViewProps> = ({
  username,
  mode = 'pre',
  onFinishPreTest,
  onBackToInstructions,
}) => {
  // Load questions based on mode
  const [questions, setQuestions] = useState<PreTestQuestion[]>(() => {
    return mode === 'post' ? getPostTestQuestions() : getPreTestQuestions();
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [chosenAnswers, setChosenAnswers] = useState<Record<string, number>>({});
  const [selectedStationIndex, setSelectedStationIndex] = useState<number | null>(null);

  // Dedicated Game Mode & Intro
  const [gameStarted, setGameStarted] = useState(false);

  // Interaction State
  const [isDrivingToStation, setIsDrivingToStation] = useState<number | null>(null);
  const [answeredState, setAnsweredState] = useState<'idle' | 'evaluating' | 'correct' | 'wrong'>('idle');

  // Dragging connection state (Pointer & Touch supported)
  const [isDraggingCar, setIsDraggingCar] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredStationIndex, setHoveredStationIndex] = useState<number | null>(null);

  // Top Screen Anime Mascot: moves at the top for 10 seconds then hides
  const [showTopAnime, setShowTopAnime] = useState(false);
  const [animeSecondsLeft, setAnimeSecondsLeft] = useState(10);

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Gamification metrics
  const [streakCount, setStreakCount] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [finalResult, setFinalResult] = useState<PreTestResult | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const carDockRef = useRef<HTMLDivElement>(null);
  const stationsContainerRef = useRef<HTMLDivElement>(null);
  const animeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger top anime mascot banner with 10s countdown
  useEffect(() => {
    if (answeredState === 'correct' || answeredState === 'wrong') {
      setShowTopAnime(true);
      setAnimeSecondsLeft(10);

      if (animeTimerRef.current) {
        clearInterval(animeTimerRef.current);
      }

      const timerId = setInterval(() => {
        setAnimeSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            setShowTopAnime(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      animeTimerRef.current = timerId;

      return () => {
        clearInterval(timerId);
      };
    }
  }, [answeredState, currentIndex]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (animeTimerRef.current) {
        clearInterval(animeTimerRef.current);
      }
    };
  }, []);

  const currentQ = questions[currentIndex] || questions[0];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  // Play sound wrapper
  const triggerSound = (type: 'engine' | 'drive' | 'correct' | 'wrong' | 'click' | 'fanfare') => {
    if (soundEnabled) {
      playCarSound(type);
    }
  };

  // Handle driving the car to a destination answer station
  const handleDriveCarToStation = (stationIdx: number) => {
    if (answeredState !== 'idle' || isDrivingToStation !== null) return;

    setSelectedStationIndex(stationIdx);
    setIsDrivingToStation(stationIdx);
    triggerSound('drive');

    // Simulate car acceleration and travel
    setTimeout(() => {
      setIsDrivingToStation(null);
      evaluateAnswer(stationIdx);
    }, 450);
  };

  // Evaluate the chosen answer
  const evaluateAnswer = (stationIdx: number) => {
    const isCorrect = stationIdx === currentQ.correctIndex;
    setChosenAnswers((prev) => ({ ...prev, [currentQ.id]: stationIdx }));

    if (isCorrect) {
      setAnsweredState('correct');
      setEarnedPoints((prev) => prev + currentQ.points);
      setStreakCount((prev) => prev + 1);
      triggerSound('correct');
    } else {
      setAnsweredState('wrong');
      setStreakCount(0);
      triggerSound('wrong');
    }
  };

  // Pointer drag move & drop handling for hand-steering (Touch & Mouse)
  const handlePointerDownCar = (e: React.PointerEvent) => {
    if (answeredState !== 'idle') return;
    setIsDraggingCar(true);
    setDragPosition({ x: e.clientX, y: e.clientY });
    triggerSound('engine');
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveCar = (e: React.PointerEvent) => {
    if (!isDraggingCar) return;
    setDragPosition({ x: e.clientX, y: e.clientY });

    // Detect which answer station is currently hovered by touch/mouse point
    const stations = document.querySelectorAll('[data-station-index]');
    let foundStationIndex: number | null = null;
    stations.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        foundStationIndex = Number(el.getAttribute('data-station-index'));
      }
    });
    setHoveredStationIndex(foundStationIndex);
  };

  const handlePointerUpCar = (e: React.PointerEvent) => {
    if (!isDraggingCar) return;
    setIsDraggingCar(false);
    setDragPosition(null);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (hoveredStationIndex !== null && answeredState === 'idle') {
      handleDriveCarToStation(hoveredStationIndex);
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    triggerSound('click');
    setAnsweredState('idle');
    setSelectedStationIndex(null);
    setIsDrivingToStation(null);
    setHoveredStationIndex(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishGame();
    }
  };

  // Finish Game & Record Score
  const finishGame = () => {
    const totalTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    let submission;
    if (mode === 'post') {
      submission = submitPostTestResult(username, chosenAnswers, totalTime);
    } else {
      submission = submitPreTestResult(username, chosenAnswers, totalTime);
    }
    setFinalResult(submission.result);
    setIsFinished(true);
    triggerSound('fanfare');
  };

  // Retrying current question if wrong
  const handleRetryCurrent = () => {
    triggerSound('click');
    setAnsweredState('idle');
    setSelectedStationIndex(null);
    setIsDrivingToStation(null);
  };

  // Header Titles
  const gameTitle =
    mode === 'post'
      ? '🏁 لعبة توصيل الأسئلة بالإجابات: الاختبار البعدي'
      : '🏎️ لعبة توصيل الأسئلة بالإجابات: الاختبار القبلي';
  const gameBadge = mode === 'post' ? 'مستوى الإتقان النهائي' : 'المستوى التمهيدي الأول';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Cairo'] pb-16 relative overflow-hidden select-none">
      {/* Dynamic Background Asphalt / Neon Tracks */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      {/* Confetti Rain: ONLY SHOW WHEN CORRECT! NEVER SHOW WHEN WRONG! */}
      {answeredState === 'correct' && <ConfettiRain />}

      {/* TOP FLOATING ANIME BANNER: MOVES AT TOP OF SCREEN FOR 10 SECONDS THEN DISAPPEARS */}
      {showTopAnime && answeredState !== 'idle' && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl transition-all duration-500 animate-in fade-in slide-in-from-top-6">
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border-2 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-4 relative overflow-hidden ${
              answeredState === 'correct'
                ? 'bg-emerald-950/95 border-emerald-400 text-white shadow-[0_10px_35px_rgba(16,185,129,0.45)]'
                : 'bg-rose-950/95 border-rose-500 text-white shadow-[0_10px_35px_rgba(244,63,94,0.45)]'
            }`}
          >
            {/* Mascot SVG thumbnail + moving animation */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-white/20 p-1 flex items-center justify-center shadow-inner overflow-hidden animate-bounce">
                {answeredState === 'correct' ? (
                  <svg width="48" height="48" viewBox="0 0 140 150" fill="none">
                    <ellipse cx="70" cy="70" rx="40" ry="38" fill="#fed7aa" />
                    <path d="M48 60 Q56 52 64 60" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
                    <path d="M76 60 Q84 52 92 60" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
                    <path d="M58 74 Q70 72 82 74 Q70 95 58 74 Z" fill="#be123c" />
                    <ellipse cx="46" cy="70" rx="9" ry="5.5" fill="#f43f5e" opacity="0.8" />
                    <ellipse cx="94" cy="70" rx="9" ry="5.5" fill="#f43f5e" opacity="0.8" />
                  </svg>
                ) : (
                  <svg width="48" height="48" viewBox="0 0 140 150" fill="none">
                    <ellipse cx="70" cy="65" rx="36" ry="34" fill="#fda4af" />
                    <path d="M46 54 L64 62" stroke="#450a0a" strokeWidth="6" strokeLinecap="round" />
                    <path d="M94 54 L76 62" stroke="#450a0a" strokeWidth="6" strokeLinecap="round" />
                    <path d="M58 84 Q70 78 82 84" stroke="#450a0a" strokeWidth="5" strokeLinecap="round" />
                    <ellipse cx="56" cy="66" rx="6" ry="7" fill="#450a0a" />
                    <ellipse cx="84" cy="66" rx="6" ry="7" fill="#450a0a" />
                  </svg>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-black/40 border border-white/20">
                    {answeredState === 'correct' ? '🎉 تفاعل الأنمي الضاحك' : '💢 تفاعل الأنمي الغاضب'}
                  </span>
                  <span className="text-[11px] font-mono text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                    ⏱️ يختفي خلال: {animeSecondsLeft}ث
                  </span>
                </div>
                <p className="text-xs font-bold mt-1 text-slate-100">
                  {answeredState === 'correct'
                    ? 'هههههه! برافو عليك، قيادة مذهلة وإجابة نموذجية! 🌟'
                    : 'أوووه لاااا! وجهة خاطئة! ركز وأعد توجيه السيارة! 😠'}
                </p>
              </div>
            </div>

            {/* Close Button & 10s Countdown Bar */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowTopAnime(false)}
                className="w-7 h-7 rounded-xl bg-black/30 hover:bg-black/50 text-slate-300 hover:text-white flex items-center justify-center text-xs transition"
                title="إخفاء الآن"
              >
                ✕
              </button>
              <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-1000"
                  style={{ width: `${(animeSecondsLeft / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 pt-6">
        {/* Top Racing HUD Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border-2 border-slate-800 backdrop-blur-md shadow-2xl mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-900/40 animate-pulse">
              <span className="text-2xl">🏎️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white font-['Tajawal']">
                  {gameTitle}
                </h1>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {gameBadge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                حرك سيارة السباق من نهاية السؤال وقُدها لتوصيلها بمحطة الإجابة الصحيحة! 🏁
              </p>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title={soundEnabled ? 'كتم المؤثرات الصوتية' : 'تفعيل الصوت'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-black shadow-inner">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>حماسة: {streakCount}</span>
            </div>

            {/* Points / XP */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500/50 text-emerald-300 text-xs font-black shadow-inner">
              <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>{earnedPoints} XP</span>
            </div>

            {onBackToInstructions && (
              <button
                type="button"
                onClick={onBackToInstructions}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition"
              >
                <span>خروج</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Lap Progress Track */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span>المرحلة {currentIndex + 1} من {questions.length}</span>
              <span className="text-slate-500">({progressPercent}%)</span>
            </span>
            <span className="text-amber-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>قيمة السؤال: {currentQ.points} نقطة</span>
            </span>
          </div>

          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* MAIN GAME ARENA: THE RACE CIRCUIT */}
        {!gameStarted ? (
          /* DEDICATED GAME ZONE LAUNCHER (كانها جيم يبدأ بضغطة زر وتحدي حماسي) */
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#0b0f19] to-black border-2 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black">
              <span>🎮 بيئة اللعبة التفاعلية الخاصة: مضمار السباق</span>
            </div>

            <div className="flex justify-center items-center gap-4 py-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/40 shadow-xl">
                <RacingCarGraphic scale={1.2} />
              </div>
            </div>

            <div className="max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white font-['Tajawal']">
                جاهز لبدء اللعبة وتحريك سيارة السباق باليد؟
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                في نهاية كل سؤال ستجد سيارة السباق جاهزة! استخدم إصبعك أو الفأرة لتحريك وتوجيه السيارة بيدك مباشرة نحو محطة الإجابة الصحيحة.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-400">
                <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  👆 تحريك السيارة باليد واللمس والسحب
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  🎉 شخصية الأنمي تتحرك في أعلى الشاشة لـ 10 ثوانٍ
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  🎊 قصاصات ورقية مبهجة عند الفوز فقط
                </span>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  triggerSound('engine');
                  setGameStarted(true);
                }}
                className="px-8 sm:px-12 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-base transition-all transform hover:scale-105 shadow-2xl shadow-rose-900/50 flex items-center gap-3 mx-auto cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>انطلاق الجيم وبدء السباق الآن! 🏁</span>
              </button>
            </div>
          </div>
        ) : !isFinished ? (
          <div className="space-y-6">
            {/* 1. THE QUESTION BOX + CAR AT THE END OF QUESTION (نهاية السؤال) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-2 border-slate-700/80 shadow-[0_0_40px_rgba(30,41,59,0.5)] relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold text-xs">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>خط الانطلاق: نص التحدي</span>
                </span>
                <span className="text-xs text-amber-300 font-bold bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-500/40">
                  ✋ حرّك السيارة بيدك باللمس أو السحب نحو المحطة الصحيحة!
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-relaxed text-right font-['Tajawal'] tracking-wide">
                {currentQ.question}
              </h2>

              {/* Racetrack divider & Car Launch Bay at the end of the question (نهاية السؤال) */}
              <div className="mt-6 pt-5 border-t-2 border-dashed border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-black text-slate-300">
                    نهاية السؤال وموقع سيارة السباق:
                  </span>
                </div>

                {/* THE INTERACTIVE CAR AT THE TERMINAL OF THE QUESTION */}
                <div
                  ref={carDockRef}
                  draggable={answeredState === 'idle'}
                  onPointerDown={handlePointerDownCar}
                  onPointerMove={handlePointerMoveCar}
                  onPointerUp={handlePointerUpCar}
                  onDragStart={(e) => {
                    if (answeredState !== 'idle') return;
                    setIsDraggingCar(true);
                    triggerSound('engine');
                    e.dataTransfer.setData('text/plain', 'car');
                  }}
                  onDragEnd={() => {
                    setIsDraggingCar(false);
                    if (hoveredStationIndex !== null && answeredState === 'idle') {
                      handleDriveCarToStation(hoveredStationIndex);
                    }
                  }}
                  className={`relative p-2.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 transition-all cursor-grab active:cursor-grabbing touch-none select-none ${
                    isDraggingCar
                      ? 'border-amber-400 scale-105 shadow-[0_0_25px_rgba(251,191,36,0.6)]'
                      : 'border-rose-500/60 hover:border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  }`}
                  title="حرّك سيارة السباق بيدك (لمس/سحب) أو اضغط على محطة الإجابة لتوصيلها!"
                >
                  <div className="flex items-center gap-3">
                    <RacingCarGraphic
                      isDriving={isDrivingToStation !== null || isDraggingCar}
                      isCorrect={answeredState === 'correct'}
                      isWrong={answeredState === 'wrong'}
                    />
                    <div className="text-right">
                      <span className="block text-[11px] font-black text-rose-400">
                        سيارة السباق الذكية
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {isDraggingCar ? 'يتم تحريكها بيدك الآن... 🏎️' : 'حرّكها بيدك نحو الإجابة 🖐️'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connecting Track Road Indicator */}
            <div className="flex items-center justify-center gap-2 py-1">
              <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-amber-500/50" />
              <span className="text-[11px] font-bold text-amber-400/90 bg-slate-900/90 px-3 py-1 rounded-full border border-amber-500/30">
                🛣️ محطات الوصول (اختر المحطة الصحيحة لقيادة السيارة إليها):
              </span>
              <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-amber-500/50" />
            </div>

            {/* 2. THE 4 ANSWER STATIONS (محطات الإجابة للتوصيل) */}
            <div ref={stationsContainerRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedStationIndex === optIdx;
                const isCorrectOption = currentQ.correctIndex === optIdx;
                const letter = ['أ', 'ب', 'ج', 'د'][optIdx];

                let stationBg = 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-850';
                let bayBadge = 'bg-slate-800 text-slate-300 border-slate-700';

                if (hoveredStationIndex === optIdx) {
                  stationBg = 'bg-amber-950/60 border-amber-400 text-white shadow-[0_0_25px_rgba(251,191,36,0.5)] scale-[1.02] ring-2 ring-amber-400/50';
                }

                if (answeredState !== 'idle') {
                  if (isSelected && answeredState === 'correct') {
                    stationBg = 'bg-emerald-950/80 border-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)]';
                    bayBadge = 'bg-emerald-500 text-slate-950 border-emerald-300';
                  } else if (isSelected && answeredState === 'wrong') {
                    stationBg = 'bg-rose-950/80 border-rose-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.5)]';
                    bayBadge = 'bg-rose-500 text-white border-rose-300';
                  } else if (isCorrectOption && answeredState === 'wrong') {
                    // Highlight correct station for educational feedback
                    stationBg = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200';
                    bayBadge = 'bg-emerald-600/80 text-white border-emerald-400';
                  }
                }

                return (
                  <div
                    key={optIdx}
                    data-station-index={optIdx}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setHoveredStationIndex(optIdx);
                    }}
                    onDragLeave={() => {
                      if (hoveredStationIndex === optIdx) setHoveredStationIndex(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setHoveredStationIndex(null);
                      handleDriveCarToStation(optIdx);
                    }}
                    onClick={() => handleDriveCarToStation(optIdx)}
                    className={`p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[110px] ${stationBg}`}
                  >
                    {/* Header of Station: Letter + Bay Status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center border shadow-sm ${bayBadge}`}
                        >
                          {letter}
                        </span>
                        <span className="text-[11px] font-black text-slate-400">
                          محطة الوصول رقم {optIdx + 1}
                        </span>
                      </div>

                      {/* Docking Bay indicator / Parking Mark */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 text-[10px] font-bold text-slate-300">
                        <span>🅿️ موقف السيارة</span>
                        {isSelected && isDrivingToStation === null && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        )}
                      </div>
                    </div>

                    {/* Option Text */}
                    <p className="text-sm font-bold text-right leading-relaxed flex-1 font-['Cairo']">
                      {option}
                    </p>

                    {/* Car Docked inside station upon selection */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>وصلت السيارة إلى هذه المحطة</span>
                        </span>
                        <RacingCarGraphic
                          scale={0.7}
                          isDriving={isDrivingToStation === optIdx}
                          isCorrect={answeredState === 'correct'}
                          isWrong={answeredState === 'wrong'}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 3. REACTION CARD: LAUGHING ANIME + CONFETTI vs ANGRY ANIME WITHOUT CONFETTI */}
            {answeredState !== 'idle' && (
              <div
                className={`p-6 sm:p-8 rounded-3xl border-2 backdrop-blur-md transition-all duration-300 shadow-2xl relative ${
                  answeredState === 'correct'
                    ? 'bg-gradient-to-b from-emerald-950/90 to-slate-950 border-emerald-500/80 shadow-[0_0_40px_rgba(16,185,129,0.3)]'
                    : 'bg-gradient-to-b from-rose-950/90 to-slate-950 border-rose-500/80 shadow-[0_0_40px_rgba(244,63,94,0.3)]'
                }`}
              >
                <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
                  {/* ANIME CHARACTER REACTION */}
                  <div className="shrink-0 flex flex-col items-center justify-center">
                    {answeredState === 'correct' ? (
                      <LaughingAnimeMascot />
                    ) : (
                      <AngryAnimeMascot />
                    )}
                  </div>

                  {/* Feedback Explanation & Educational Content */}
                  <div className="flex-1 text-right space-y-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-xl uppercase tracking-wider ${
                          answeredState === 'correct'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {answeredState === 'correct'
                          ? '🎉 إجابة صحيحة ومباركة (+ ' + currentQ.points + ' XP)'
                          : '⛔ إجابة غير دقيقة (0 XP)'}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white font-['Tajawal']">
                      {answeredState === 'correct'
                        ? 'تهانينا! وصلت سيارة السباق إلى المحطة المنشودة بدقة فائقة!'
                        : 'لم تصل السيارة للوجهة الصحيحة في هذه الجولة!'}
                    </h3>

                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-medium">
                      <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                        <Lightbulb className="w-4 h-4" />
                        <span>التفسير الأكاديمي والتعليمي:</span>
                      </div>
                      <p>{currentQ.explanation}</p>
                    </div>

                    {/* Action Buttons: Next Stage or Retry */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      {answeredState === 'wrong' && (
                        <button
                          type="button"
                          onClick={handleRetryCurrent}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black transition border border-slate-700"
                        >
                          <RotateCcw className="w-4 h-4 text-amber-400" />
                          <span>إعادة تحريك السيارة وتجربة محطة أخرى</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition shadow-lg ${
                          answeredState === 'correct'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-900/50'
                            : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-900/50'
                        }`}
                      >
                        <span>
                          {currentIndex + 1 < questions.length
                            ? 'الانتقال إلى السؤال التالي 🏁'
                            : 'إنهاء السباق وعرض النتائج 🏆'}
                        </span>
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 4. FINAL VICTORY PODIUM */
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/50 text-center shadow-[0_0_50px_rgba(251,191,36,0.2)] max-w-2xl mx-auto space-y-6">
            <ConfettiRain />

            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-2xl shadow-amber-500/40 animate-bounce">
              <Trophy className="w-12 h-12" />
            </div>

            <div>
              <span className="text-xs font-black px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                تم اجتياز سباق التوصيل بنجاح 🏅
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-3 font-['Tajawal']">
                {mode === 'post'
                  ? 'مبروك! أتممت الاختبار البعدي بنجاح فائق!'
                  : 'مبروك! أتممت لعبة الاختبار القبلي بنجاح!'}
              </h2>
              <p className="text-sm text-slate-300 mt-2">
                لقد قدت سيارة السباق ببراعة وربطت المعارف والمهارات التقنية لبرنامج Adobe Captivate
                2019!
              </p>
            </div>

            {/* Scorecard */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="p-3">
                <span className="block text-slate-400 text-xs mb-1">النقاط المكتسبة</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {earnedPoints} XP
                </span>
              </div>
              <div className="p-3 border-x border-slate-800">
                <span className="block text-slate-400 text-xs mb-1">النتيجة النهائية</span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {finalResult ? `${finalResult.score} / ${finalResult.maxScore}` : `${earnedPoints}`}
                </span>
              </div>
              <div className="p-3">
                <span className="block text-slate-400 text-xs mb-1">الوسام الممنوح</span>
                <span className="text-xs font-black text-sky-400">
                  {mode === 'post' ? 'وسام الإتقان والختام 🏆' : 'وسام المستكشف التمهيدي 🏅'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onFinishPreTest}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-sm transition shadow-xl shadow-amber-900/40"
            >
              استكمال رحلة التعلم والدخول إلى خريطة المستويات 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
