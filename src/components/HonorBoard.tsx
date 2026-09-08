import React, { useState } from 'react';
import { Trophy, Medal, Award, Crown, Star, Sparkles, Flame, UserCheck } from 'lucide-react';

export interface HonorStudent {
  id: string;
  rank: number;
  name: string;
  avatarBg: string;
  points: number;
  completedLevels: number;
  groupName: string;
  badge: string;
  specialty: string;
}

const INITIAL_HONOR_STUDENTS: HonorStudent[] = [
  {
    id: 'h-1',
    rank: 1,
    name: 'سارة أحمد الشناوي',
    avatarBg: 'from-amber-400 to-yellow-600',
    points: 980,
    completedLevels: 10,
    groupName: 'تنافسي + تغذية فورية',
    badge: 'وسام الإتقان الماسي',
    specialty: 'تكنولوجيا التعليم',
  },
  {
    id: 'h-2',
    rank: 2,
    name: 'محمد خالد عبد الرازق',
    avatarBg: 'from-slate-300 to-slate-500',
    points: 940,
    completedLevels: 9,
    groupName: 'تعاوني + تغذية فورية',
    badge: 'وسام التميز الذهبي',
    specialty: 'تكنولوجيا التعليم',
  },
  {
    id: 'h-3',
    rank: 3,
    name: 'مريم محمود إبراهيم',
    avatarBg: 'from-amber-600 to-amber-800',
    points: 915,
    completedLevels: 9,
    groupName: 'تنافسي + تغذية مرجئة',
    badge: 'وسام الإبداع الفضي',
    specialty: 'تكنولوجيا التعليم',
  },
  {
    id: 'h-4',
    rank: 4,
    name: 'عمر ياسر المنشاوي',
    avatarBg: 'from-purple-500 to-indigo-600',
    points: 870,
    completedLevels: 8,
    groupName: 'تعاوني + تغذية مرجئة',
    badge: 'وسام المثابرة والابتكار',
    specialty: 'تكنولوجيا التعليم',
  },
  {
    id: 'h-5',
    rank: 5,
    name: 'فاطمة حسن القاضي',
    avatarBg: 'from-cyan-500 to-blue-600',
    points: 840,
    completedLevels: 8,
    groupName: 'تنافسي + تغذية فورية',
    badge: 'وسام الكفاءة الرقمية',
    specialty: 'تكنولوجيا التعليم',
  },
];

interface HonorBoardProps {
  currentUsername?: string;
}

export const HonorBoard: React.FC<HonorBoardProps> = ({ currentUsername = '' }) => {
  const [students] = useState<HonorStudent[]>(INITIAL_HONOR_STUDENTS);

  return (
    <section className="space-y-6 text-right" id="honor-board-section">
      {/* Honor Board Header Card */}
      <div className="rounded-3xl bg-gradient-to-b from-[#19142b] via-[#100d1e] to-[#0a0814] border-2 border-[#d4af37] p-6 sm:p-8 shadow-[0_0_35px_rgba(212,175,55,0.25)] relative overflow-hidden">
        {/* Golden Crown Aura */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-24 bg-gradient-to-b from-[#ffd700]/15 via-purple-600/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#d4af37] via-[#ffd700] to-[#f59e0b] text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] shrink-0">
              <Trophy className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-amber-300 text-xs font-bold font-['Cairo']">
                  لوحة الشرف للمتميزين
                </span>
                <span className="text-xs text-purple-300 font-semibold font-['Cairo'] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#ffd700]" />
                  <span>أوائل موديولات إنتاج الوسائط المتعددة</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Tajawal'] mt-1">
                فرسان التميز والتقبل التكنولوجي
              </h2>
              <p className="text-xs text-slate-300 mt-1 font-['IBM_Plex_Sans_Arabic']">
                تكريم الطلاب الأكثر تفاعلاً وإنجازاً للأهداف السلوكية والمحاكاة البرمجية ببرنامج Adobe Captivate 2019
              </p>
            </div>
          </div>

          {/* Current User Standing Badge */}
          {currentUsername && (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-[#d4af37]/50 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-600/50 flex items-center justify-center text-amber-300 font-bold font-['Outfit']">
                ★
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-['Cairo']">حسابك الحالي النشط</span>
                <span className="text-xs font-bold text-white font-mono">{currentUsername}</span>
                <span className="text-[10px] text-emerald-400 block font-semibold">مؤهل للوحة الشرف</span>
              </div>
            </div>
          )}
        </div>

        {/* Top 3 Podium Highlights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {students.slice(0, 3).map((stu) => {
            const isFirst = stu.rank === 1;
            const isSecond = stu.rank === 2;
            const isThird = stu.rank === 3;

            return (
              <div
                key={stu.id}
                className={`relative rounded-2xl p-5 text-center transition-all duration-300 border flex flex-col items-center justify-between ${
                  isFirst
                    ? 'bg-gradient-to-b from-[#241c3a] to-[#120d22] border-2 border-[#ffd700] shadow-[0_0_25px_rgba(255,215,0,0.3)] md:-translate-y-2 order-1 md:order-2'
                    : isSecond
                    ? 'bg-gradient-to-b from-[#19152b] to-[#0f0c1c] border-slate-700/80 hover:border-[#d4af37]/50 order-2 md:order-1'
                    : 'bg-gradient-to-b from-[#19152b] to-[#0f0c1c] border-slate-700/80 hover:border-[#d4af37]/50 order-3'
                }`}
              >
                {/* Crown / Medal Top Icon */}
                <div className="mb-3 relative">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stu.avatarBg} text-slate-950 flex items-center justify-center font-black text-xl shadow-lg`}
                  >
                    {isFirst ? (
                      <Crown className="w-8 h-8 text-slate-950 stroke-[2.5]" />
                    ) : isSecond ? (
                      <Medal className="w-7 h-7 text-slate-950" />
                    ) : (
                      <Award className="w-7 h-7 text-slate-950" />
                    )}
                  </div>
                  <span
                    className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs border ${
                      isFirst
                        ? 'bg-[#ffd700] text-slate-950 border-white'
                        : isSecond
                        ? 'bg-slate-300 text-slate-900 border-white'
                        : 'bg-amber-700 text-white border-amber-300'
                    }`}
                  >
                    {stu.rank}
                  </span>
                </div>

                <h3 className="text-sm font-black text-white font-['Tajawal']">{stu.name}</h3>
                <span className="text-[11px] text-amber-300 font-medium font-['Cairo'] mt-0.5">
                  {stu.badge}
                </span>

                <div className="my-3 py-1.5 px-3 rounded-xl bg-slate-950/70 border border-slate-800 w-full flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">النقاط:</span>
                  <span className="text-[#ffd700] font-bold text-sm">{stu.points} pt</span>
                </div>

                <div className="w-full flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                  <span>{stu.groupName}</span>
                  <span className="text-emerald-400 font-bold">{stu.completedLevels}/10 مستويات</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Table of Honor Students */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#d4af37]/30 bg-[#090712]/90">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#151126] text-amber-200 border-b border-[#d4af37]/20 font-bold font-['Cairo']">
              <tr>
                <th className="p-3.5 text-center w-14">المركز</th>
                <th className="p-3.5">اسم الطالب المتميز</th>
                <th className="p-3.5">المجموعة التجريبية</th>
                <th className="p-3.5">الوسام الأكاديمي</th>
                <th className="p-3.5">المستويات المنجزة</th>
                <th className="p-3.5 text-center">مجموع النقاط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {students.map((stu) => (
                <tr key={stu.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        stu.rank === 1
                          ? 'bg-[#ffd700] text-slate-950'
                          : stu.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : stu.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {stu.rank}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-white font-['Tajawal'] flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>{stu.name}</span>
                  </td>
                  <td className="p-3.5 text-slate-300">{stu.groupName}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-purple-950/70 border border-purple-700/50 text-purple-300 text-[11px]">
                      {stu.badge}
                    </span>
                  </td>
                  <td className="p-3.5 text-emerald-400 font-semibold">{stu.completedLevels} من 10 مستويات</td>
                  <td className="p-3.5 text-center font-mono font-bold text-amber-300 text-sm">
                    {stu.points} pt
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
