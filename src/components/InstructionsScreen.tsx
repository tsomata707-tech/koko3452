import React, { useState } from 'react';
import { Target, Star, Award, TrendingUp, CheckCircle, ArrowLeft, BookOpen, Sparkles, Shield, HelpCircle } from 'lucide-react';

interface InstructionsScreenProps {
  onGotIt: () => void;
  onBackToWelcome?: () => void;
}

export const InstructionsScreen: React.FC<InstructionsScreenProps> = ({ onGotIt, onBackToWelcome }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'goals' | 'points' | 'badges' | 'levels'>('all');

  const cards = [
    {
      id: 'goals',
      title: 'الأهداف التعليمية والمهارية',
      icon: <Target className="w-6 h-6 text-blue-400" />,
      borderColor: 'border-blue-500/40',
      bgColor: 'from-blue-950/40 to-slate-950/60',
      tag: 'الهدف الرئيسي',
      tagColor: 'bg-blue-950 text-blue-300 border-blue-500/50',
      text: 'تنمية مهارات إنتاج الوسائط المتعددة التفاعلية باستخدام برنامج Adobe Captivate 2019 وتعزيز التقبل التكنولوجي للتعلم الإلكتروني القائم على الألعاب.',
      bullets: [
        'إتقان واجهة البرنامج وإدارة الشرائح والمشاهد التفاعلية.',
        'إدراج وتنسيق الوسائط (النصوص، الصور، الأصوات، الفيديو).',
        'برمجة الأزرار ونقاط التفاعل ومسارات التعلم المتقدمة.',
        'إنشاء بنوك الأسئلة والاختبارات التفاعلية وتصدير المشاريع بدقة.',
      ],
    },
    {
      id: 'points',
      title: 'نظام النقاط التراكمي',
      icon: <Star className="w-6 h-6 text-[#ffd700]" />,
      borderColor: 'border-[#ffd700]/50',
      bgColor: 'from-amber-950/30 to-slate-950/60',
      tag: '⭐ رصيد XP',
      tagColor: 'bg-amber-950 text-[#ffd700] border-[#ffd700]/50',
      text: 'تحصل على نقاط ذهبية (XP) عند حل الأنشطة والمهام التعليمية. الإجابة الصحيحة والسريعة تمنحك نقاطاً أكثر لتعزيز ترتيبك وإنجازك.',
      bullets: [
        'كل سؤال صحيح يمنحك نقاطاً تضاف مباشرة لسجلك.',
        'الدقة والتركيز في المحاولة الأولى تمنحك مكافآت إضافية.',
        'في النمط التعاوني: نقاطك تساهم مباشرة في رفع رصيد وإنجاز فريقك المشترك.',
        'في النمط التنافسي: نقاطك تحدد ترتيبك الفردي على لوحة متصدري الدفعة.',
      ],
    },
    {
      id: 'badges',
      title: 'نظام الشارات والأوسمة',
      icon: <Award className="w-6 h-6 text-purple-400" />,
      borderColor: 'border-purple-500/50',
      bgColor: 'from-purple-950/30 to-slate-950/60',
      tag: '🏅 أوسمة شرف',
      tagColor: 'bg-purple-950 text-purple-300 border-purple-500/50',
      text: 'إنجازات محددة تمنحك شارات مميزة تثبت جدارتك مثل "خبير التفاعل"، "مهندس الشرائح"، و"نجم الوسائط".',
      bullets: [
        'كل مرحلة من الـ 10 مراحل تمنحك وساماً نوعياً عند إتقان مهاراتها.',
        'أوسمة خاصة للسرعة الفائقة والتفوق الخالي من الأخطاء.',
        'تُعرض أوسمتك في ملفك الشخصي ولوحة الشرف أمام زملائك.',
        'جمع الأوسمة يفتح لك صلاحيات ومزايا متقدمة في بيئة التعلم.',
      ],
    },
    {
      id: 'levels',
      title: 'نظام المستويات والترقية',
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      borderColor: 'border-emerald-500/50',
      bgColor: 'from-emerald-950/30 to-slate-950/60',
      tag: '📈 سلم الترقية',
      tagColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/50',
      text: 'اجمع النقاط وأكمل المهام للانتقال التدريجي من مستوى "مبتدئ" إلى "ممارس" ثم "متقدم" وصولاً إلى مستوى "محترف وخبير Captivate".',
      bullets: [
        'المستوى 1-2: مبتدئ (استكشاف المفاهيم الأساسية وواجهة البرنامج).',
        'المستوى 3-5: ممارس (التعامل الاحترافي مع الشرائح والوسائط).',
        'المستوى 6-8: متقدم (بناء التفاعلية والمحاكاة والتقييمات).',
        'المستوى 9-10: خبير ومصمم محترف (النشر والتكامل والجودة التعليمية).',
      ],
    },
  ];

  const filteredCards = activeTab === 'all' ? cards : cards.filter((c) => c.id === activeTab);

  return (
    <div className="relative w-full max-w-5xl mx-auto z-10 font-['Cairo',_sans-serif] text-right py-4 animate-fadeIn">
      {/* Background Ambient Glow */}
      <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-500/15 blur-xl opacity-70 pointer-events-none" />

      {/* Main Glass Container */}
      <div className="relative rounded-3xl bg-[#0b0e1e]/95 backdrop-blur-2xl border-2 border-blue-500/40 p-6 sm:p-10 shadow-[0_0_40px_rgba(37,99,235,0.2)] overflow-hidden">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/50 text-blue-300 text-xs font-bold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                دليل قواعد البيئة التعليمية
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Tajawal'] tracking-tight">
              قواعد الرحلة ونظام اللعبة
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              أهلاً بك مصمم المستقبل! هذه البيئة تعتمد على التعلم القائم على الألعاب (Gamification) لتمكينك من إتقان Adobe Captivate 2019.
            </p>
          </div>

          {/* Quick tab switcher */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#070914] border border-slate-800 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              الكل
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('goals')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'goals' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              الأهداف
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('points')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'points' ? 'bg-[#ffd700] text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              النقاط
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('badges')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'badges' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              الشارات
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('levels')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'levels' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              المستويات
            </button>
          </div>
        </div>

        {/* The Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-8">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-2xl bg-gradient-to-br ${card.bgColor} border-2 ${card.borderColor} p-6 shadow-lg flex flex-col justify-between hover:scale-[1.01] transition-transform`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow">
                      {card.icon}
                    </div>
                    <h3 className="text-lg font-black text-white font-['Tajawal']">{card.title}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${card.tagColor}`}>
                    {card.tag}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4 font-medium">
                  {card.text}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  {card.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Action Button: فهمت، لنبدأ! */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            id="btn-instructions-got-it"
            onClick={onGotIt}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] border-2 border-emerald-400/60 hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
          >
            <span>فهمت، لنبدأ!</span>
            <ArrowLeft className="w-5 h-5" />
          </button>

          {onBackToWelcome && (
            <button
              type="button"
              onClick={onBackToWelcome}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-sm border border-slate-700 transition-all cursor-pointer"
            >
              العودة للترحيب
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
