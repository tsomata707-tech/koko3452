import React, { useState, useEffect } from 'react';
import { CpLogo } from './CpLogo';
import { WhatsAppSupport } from './WhatsAppSupport';
import { CURRICULUM_MODULES, RESEARCH_INFO } from '../data/curriculumData';
import { RightSidebarModules } from './RightSidebarModules';
import { ModuleDetailsView } from './ModuleDetailsView';
import { HonorBoard } from './HonorBoard';
import { ResearchGroups } from './ResearchGroups';
import { EducationalGameView } from './EducationalGameView';
import { getGroupByUsername } from '../data/studentAccounts';
import { getStudentProgress } from '../utils/gameStorage';
import {
  GraduationCap,
  Trophy,
  Users,
  BookOpen,
  LogOut,
  Layers,
  Sparkles,
  Zap,
  Shield,
  Gamepad2,
} from 'lucide-react';

interface PortalHomeProps {
  username: string;
  onLogout: () => void;
}

export const PortalHome: React.FC<PortalHomeProps> = ({ username, onLogout }) => {
  // Main Section Navigation (اللعبة التعليمية -> لوحة الشرف -> الأربع جروبات -> المستويات التعليمية)
  const [activeMainSection, setActiveMainSection] = useState<'game' | 'honor' | 'groups' | 'levels'>('game');

  // Detect user's research group based on username (G1xx, G2xx, G3xx, G4xx)
  const userGroupMeta = getGroupByUsername(username);

  // Student Game Progress
  const studentGame = getStudentProgress(username);

  // Selected Research Group defaults strictly to student's assigned group
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    userGroupMeta ? userGroupMeta.id : 'grp-1'
  );

  useEffect(() => {
    if (userGroupMeta) {
      setSelectedGroupId(userGroupMeta.id);
    }
  }, [username]);

  // Educational Levels State
  const [activeModuleId, setActiveModuleId] = useState<string>(CURRICULUM_MODULES[0].id);
  const [completedObjectives, setCompletedObjectives] = useState<Record<string, boolean>>({
    'obj-1-1': true,
    'obj-1-2': true,
    'obj-2-1': true,
  });

  const handleToggleObjective = (objId: string) => {
    setCompletedObjectives((prev) => ({
      ...prev,
      [objId]: !prev[objId],
    }));
  };

  const activeModuleIndex = CURRICULUM_MODULES.findIndex((m) => m.id === activeModuleId);
  const currentModule = CURRICULUM_MODULES[activeModuleIndex] || CURRICULUM_MODULES[0];

  // Calculation of progress
  const completedCountByModule: Record<string, number> = {};
  let totalObjectivesCount = 0;
  let totalCompletedCount = 0;

  CURRICULUM_MODULES.forEach((mod) => {
    let count = 0;
    mod.objectives.forEach((obj) => {
      totalObjectivesCount++;
      if (completedObjectives[obj.id]) {
        count++;
        totalCompletedCount++;
      }
    });
    completedCountByModule[mod.id] = count;
  });

  const overallPercentage =
    totalObjectivesCount > 0
      ? Math.round((totalCompletedCount / totalObjectivesCount) * 100)
      : 0;

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6 space-y-6" id="portal-dashboard">
      {/* Top Banner Overview Card */}
      <div className="rounded-3xl bg-[#0b0914]/95 backdrop-blur-2xl border-2 border-[#d4af37] shadow-[0_0_35px_rgba(212,175,55,0.2)] p-6 sm:p-8 text-right overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[#d4af37]/25">
          {/* Right Header & Greeting */}
          <div className="flex items-center gap-4">
            <CpLogo size="lg" showText={false} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-['Cairo']">
                  جلسة تعليمية نشطة
                </span>
                {userGroupMeta ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-950/70 border border-[#d4af37] text-[#ffd700] text-xs font-bold font-['Cairo']">
                    {userGroupMeta.code}: {userGroupMeta.learningMode} + {userGroupMeta.feedbackMode}
                  </span>
                ) : (
                  <span className="text-xs text-[#ffd700] font-semibold font-['Cairo']">
                    {RESEARCH_INFO.software}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white font-['Tajawal'] mt-1">
                مرحباً بك، <span className="text-[#ffd700] font-mono">{username}</span> في المنصة التعليمية
              </h1>
              <p className="text-xs text-slate-300 mt-1 font-['IBM_Plex_Sans_Arabic']">
                {userGroupMeta ? userGroupMeta.name : RESEARCH_INFO.title}
              </p>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            <div className="px-4 py-2.5 rounded-2xl bg-[#141026] border border-[#d4af37]/40 text-right">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">إجمالي الإنجاز</span>
              <span className="text-lg font-black text-amber-300 font-['Outfit']">{overallPercentage}%</span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-[#141026] border border-purple-500/40 text-right">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">المهام المتقنة</span>
              <span className="text-lg font-black text-purple-300 font-['Outfit']">
                {totalCompletedCount}/{totalObjectivesCount}
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-[#141026] border border-cyan-500/40 text-right">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">المستويات التعليمية</span>
              <span className="text-lg font-black text-cyan-300 font-['Outfit']">10 مستويات</span>
            </div>
          </div>
        </div>

        {/* Master Navigation Bar: 1. اللعبة التعليمية - 2. لوحة الشرف - 3. الأربع جروبات - 4. المستويات التعليمية */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-[#d4af37]/50 shadow-inner w-full sm:w-auto overflow-x-auto">
            {/* 1. اللعبة التعليمية التفاعلية */}
            <button
              type="button"
              id="tab-educational-game"
              onClick={() => setActiveMainSection('game')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'game'
                  ? 'bg-gradient-to-r from-[#ffd700] via-amber-400 to-[#d4af37] text-slate-950 shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>🎮 اللعبة التعليمية (10 مستويات + أفاتار)</span>
            </button>

            {/* 2. لوحة الشرف */}
            <button
              type="button"
              id="tab-honor-board"
              onClick={() => setActiveMainSection('honor')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'honor'
                  ? 'bg-gradient-to-r from-[#ffd700] to-[#d4af37] text-slate-950 shadow-[0_0_15px_rgba(212,175,55,0.35)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>لوحة الشرف</span>
            </button>

            {/* 3. الأربع جروبات */}
            <button
              type="button"
              id="tab-research-groups"
              onClick={() => setActiveMainSection('groups')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'groups'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>الأربع جروبات (مجموعتك المصرح بها)</span>
            </button>

            {/* 4. المستويات التعليمية */}
            <button
              type="button"
              id="tab-educational-levels"
              onClick={() => setActiveMainSection('levels')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'levels'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>المستويات التعليمية والدليل</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-['Cairo']">
            <GraduationCap className="w-4 h-4 text-[#ffd700]" />
            <span>{RESEARCH_INFO.university}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area based on Selected Master Tab */}
      {activeMainSection === 'game' && (
        <EducationalGameView username={username} />
      )}

      {activeMainSection === 'honor' && (
        <HonorBoard currentUsername={username} />
      )}

      {activeMainSection === 'groups' && (
        <ResearchGroups
          selectedGroupId={selectedGroupId}
          onSelectGroup={(id) => setSelectedGroupId(id)}
          currentUsername={username}
        />
      )}

      {activeMainSection === 'levels' && (
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Right Sidebar: 10 Main Headings with Icons */}
          <RightSidebarModules
            modules={CURRICULUM_MODULES}
            activeModuleId={activeModuleId}
            onSelectModule={(id) => setActiveModuleId(id)}
            completedObjectivesCount={completedCountByModule}
          />

          {/* Center Details View: Behavioral Objectives + Practical Simulator */}
          <ModuleDetailsView
            module={currentModule}
            isFirst={activeModuleIndex === 0}
            isLast={activeModuleIndex === CURRICULUM_MODULES.length - 1}
            onPrevModule={() => {
              if (activeModuleIndex > 0) {
                setActiveModuleId(CURRICULUM_MODULES[activeModuleIndex - 1].id);
              }
            }}
            onNextModule={() => {
              if (activeModuleIndex < CURRICULUM_MODULES.length - 1) {
                setActiveModuleId(CURRICULUM_MODULES[activeModuleIndex + 1].id);
              }
            }}
            completedObjectives={completedObjectives}
            onToggleObjective={handleToggleObjective}
          />
        </div>
      )}

      {/* Bottom Footer Utilities */}
      <div className="mt-8 pt-6 border-t border-[#d4af37]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <WhatsAppSupport />

        <button
          type="button"
          onClick={onLogout}
          id="btn-portal-bottom-logout"
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-red-500/40 bg-red-950/30 hover:bg-red-900/40 text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج والعودة لصفحة الدخول</span>
        </button>
      </div>
    </div>
  );
};
