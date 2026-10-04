import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  GraduationCap,
  Star,
  ArrowLeft,
  CheckCircle,
  X,
  BookOpen,
  Crown,
} from 'lucide-react';
import { getSupervisorsBoardConfig } from '../utils/supervisorsStorage';
import { SupervisorsHonorBoardConfig } from '../types';
import { CpLogo } from './CpLogo';

interface SupervisorsHonorBoardProps {
  onContinue?: () => void;
  onClose?: () => void;
  isModal?: boolean;
  showContinueButton?: boolean;
}

export const SupervisorsHonorBoard: React.FC<SupervisorsHonorBoardProps> = ({
  onContinue,
  onClose,
  isModal = false,
  showContinueButton = true,
}) => {
  const [config, setConfig] = useState<SupervisorsHonorBoardConfig>(() => getSupervisorsBoardConfig());

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getSupervisorsBoardConfig());
    };
    window.addEventListener('supervisors-honor-board-updated', handleUpdate);
    return () => {
      window.removeEventListener('supervisors-honor-board-updated', handleUpdate);
    };
  }, []);

  const boardContent = (
    <div
      className="relative w-full max-w-6xl mx-auto z-10 font-['Cairo',_sans-serif] text-right py-2 select-none animate-fadeIn"
      id="supervisors-honor-board"
    >
      {/* Outer Golden & Purple Ambient Aura */}
      <div className="absolute -inset-4 sm:-inset-6 rounded-[40px] bg-gradient-to-r from-[#ffd700]/20 via-purple-600/15 to-blue-600/20 blur-3xl opacity-80 pointer-events-none" />

      {/* Main Large Glassmorphic Card (بطاقة كبيرة زجاجية) */}
      <div className="relative rounded-3xl bg-[#090b1c]/90 backdrop-blur-2xl border-2 border-[#ffd700]/80 shadow-[0_0_60px_rgba(212,175,55,0.3),0_30px_70px_rgba(0,0,0,0.9)] p-4 sm:p-7 lg:p-10 max-h-[90vh] overflow-y-auto">
        {/* Close Button if rendered as Modal */}
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق لوحة الشرف"
            className="absolute top-3 left-3 sm:top-4 sm:left-4 p-1.5 sm:p-2.5 rounded-full bg-slate-900/80 hover:bg-red-500/20 text-slate-300 hover:text-white border border-slate-700/60 transition-all z-20 cursor-pointer shadow-lg"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Decorative Golden Corner Flourishes (hidden on small mobile screens to prevent overlap) */}
        <div className="hidden sm:block absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[#ffd700] rounded-tr-3xl pointer-events-none" />
        <div className="hidden sm:block absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-[#ffd700] rounded-bl-3xl pointer-events-none" />

        {/* Header Section */}
        <div className="flex flex-col items-center text-center pb-5 sm:pb-8 border-b border-[#ffd700]/30 relative z-10">
          {/* Logo with Golden Laurel Crown */}
          <div className="relative mb-2.5 sm:mb-3">
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#141a38] to-[#0c1024] border-2 border-[#ffd700] shadow-[0_0_30px_rgba(255,215,0,0.45)]">
              <CpLogo size="md" showText={false} />
            </div>
            <div className="absolute -top-3 -right-3 sm:-top-3.5 sm:-right-3.5 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-amber-500 via-[#ffd700] to-yellow-200 text-slate-950 flex items-center justify-center text-sm sm:text-lg shadow-[0_0_15px_rgba(255,215,0,0.6)] animate-bounce">
              👑
            </div>
          </div>

          {/* Academic Affiliation Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-blue-950/80 border border-blue-400/50 text-blue-200 text-[11px] sm:text-sm font-bold flex items-center gap-1.5 shadow-sm">
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
              <span>{config.university}</span>
            </span>
            <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-amber-950/80 border border-[#ffd700] text-[#ffd700] text-[11px] sm:text-sm font-black flex items-center gap-1.5 shadow-sm">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ffd700]" />
              <span>رسالة ماجستير في تكنولوجيا التعليم</span>
            </span>
          </div>

          {/* 🌟 DISTINCTIVE GOLDEN TITLE (عنوان اللوحة بلون ذهبي متألق ومختلف تماماً عن أسماء الدكاترة ووظيفتهم) 🌟 */}
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffeaa7] via-[#ffd700] to-[#f39c12] drop-shadow-[0_4px_25px_rgba(255,215,0,0.65)] font-['Tajawal'] tracking-tight mb-2 max-w-4xl leading-snug sm:leading-tight">
            {config.boardTitle}
          </h1>

          {/* Subtitle / Department Dedication */}
          <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed font-medium mt-1 px-2">
            {config.boardSubtitle}
          </p>

          {/* Researcher Note */}
          {config.researcher && (
            <div className="mt-2 text-xs sm:text-sm text-amber-200/90 font-bold bg-[#ffd700]/10 border border-[#ffd700]/30 px-3 sm:px-3.5 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
              <span>إعداد {config.researcher}</span>
            </div>
          )}
        </div>

        {/* Small Cards Grid inside the Large Glass Card (البطاقات الصغيرة داخل البطاقة الكبيرة) */}
        <div className="my-5 sm:my-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4 sm:mb-5">
            <h3 className="text-xs sm:text-base font-bold text-white font-['Tajawal'] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ffd700]" />
              <span>أعضاء لجنة الإشراف العلمي والبحث الأكاديمي الموقرين:</span>
            </h3>
            <span className="text-[11px] sm:text-xs text-amber-300 font-semibold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-slate-900/80 border border-slate-700">
              إجمالي {config.supervisors.length} بطاقات شرف وتقدير
            </span>
          </div>

          {/* Sub-cards: البطاقة 1، البطاقة 2، البطاقة 3... */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {config.supervisors.map((card, idx) => (
              <div
                key={card.id}
                className="relative rounded-2xl bg-gradient-to-b from-[#121832]/95 via-[#0b1024]/95 to-[#080c1c]/95 border-2 border-slate-700/80 hover:border-[#ffd700] shadow-[0_12px_32px_rgba(0,0,0,0.7)] hover:shadow-[0_0_30px_rgba(255,215,0,0.35)] transition-all duration-300 p-4 sm:p-5 flex flex-col items-center text-center group hover:-translate-y-1"
              >
                {/* Card Label Tag: تسمية البطاقات (البطاقة 1، البطاقة 2، إلخ) */}
                <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/60 text-[#ffd700] font-black text-[10px] sm:text-[11px] font-['Cairo'] shadow-sm">
                  {card.cardLabel || `البطاقة ${idx + 1}`}
                </div>

                {/* Supervisor Photo (.jpg/.png in circular glowing golden frame) */}
                <div className="relative my-2 sm:my-3">
                  <div className="w-20 h-20 sm:w-26 sm:h-26 rounded-full p-1 sm:p-1.5 bg-gradient-to-tr from-amber-500 via-[#ffd700] to-yellow-200 shadow-[0_0_20px_rgba(255,215,0,0.45)] group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="w-full h-full rounded-full object-cover border-2 border-slate-950"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src =
                          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -left-1 p-1 sm:p-1.5 rounded-full bg-gradient-to-tr from-amber-500 to-[#ffd700] text-slate-950 shadow-md">
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </div>
                </div>

                {/* Supervisor Role Tag */}
                <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-400/50 text-purple-200 text-[10px] sm:text-[11px] font-bold mb-1.5 sm:mb-2 font-['Cairo']">
                  {card.role}
                </span>

                {/* Supervisor Name: في لون أبيض ناصع مميز ومختلف عن عنوان اللوحة الذهبي */}
                <h4 className="text-sm sm:text-base lg:text-lg font-black text-white font-['Tajawal'] tracking-tight leading-snug">
                  {card.name}
                </h4>

                {/* Supervisor Job / Academic Title: في لون رمادي فاتح مريح ومختلف */}
                <p className="text-[11px] sm:text-xs text-slate-300 mt-1.5 font-medium leading-relaxed font-['Cairo']">
                  {card.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Action Section */}
        {showContinueButton && onContinue && (
          <div className="pt-4 sm:pt-6 border-t border-[#ffd700]/30 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 relative z-10">
            <div className="text-[11px] sm:text-xs text-slate-300 flex items-center gap-1.5 sm:gap-2">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span>تم اعتماد هذا التوثيق الأكاديمي رسمياً لبيئة الألعاب التعليمية بجامعة طنطا</span>
            </div>

            <button
              type="button"
              onClick={onContinue}
              id="btn-supervisors-continue"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm md:text-base shadow-[0_0_25px_rgba(37,99,235,0.45)] border-2 border-blue-400/50 flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5"
            >
              <span>استكمال الرحلة التعليمية والبدء</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
        {boardContent}
      </div>
    );
  }

  return boardContent;
};
