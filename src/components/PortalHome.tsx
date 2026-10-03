import React, { useState, useEffect } from 'react';
import { CpLogo } from './CpLogo';
import { WhatsAppSupport } from './WhatsAppSupport';
import { CURRICULUM_MODULES, RESEARCH_INFO } from '../data/curriculumData';
import { RightSidebarModules } from './RightSidebarModules';
import { ModuleDetailsView } from './ModuleDetailsView';
import { HonorBoard } from './HonorBoard';
import { ResearchGroups } from './ResearchGroups';
import { EducationalGameView } from './EducationalGameView';
import { WelcomeScreen } from './WelcomeScreen';
import { InstructionsScreen } from './InstructionsScreen';
import { ProfileScreen } from './ProfileScreen';
import { LearningMapScreen } from './LearningMapScreen';
import { LeaderboardOrTeamBoard } from './LeaderboardOrTeamBoard';
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
  Compass,
  User,
  HelpCircle,
  Award,
} from 'lucide-react';

interface PortalHomeProps {
  username: string;
  onLogout: () => void;
}

export type PortalSection =
  | 'map'
  | 'welcome'
  | 'instructions'
  | 'profile'
  | 'game'
  | 'ranking'
  | 'honor'
  | 'groups'
  | 'levels';

export const PortalHome: React.FC<PortalHomeProps> = ({ username, onLogout }) => {
  // Main Section Navigation - defaults to 'welcome' on first login for smooth onboarding, or 'map'
  const [activeMainSection, setActiveMainSection] = useState<PortalSection>('welcome');

  // Detect user's research group based on username (G1_Cp_01 -> G1)
  const userGroupMeta = getGroupByUsername(username);
  const isCollaborative = userGroupMeta?.learningMode === 'تعاوني';

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
      <div className="rounded-3xl bg-[#0b0f1e]/95 backdrop-blur-2xl border-2 border-blue-500/40 shadow-[0_0_35px_rgba(37,99,235,0.2)] p-6 sm:p-8 text-right overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          {/* Right Header & Greeting */}
          <div className="flex items-center gap-4">
            <CpLogo size="lg" showText={false} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold font-['Cairo']">
                  جلسة تعليمية نشطة
                </span>
                {userGroupMeta ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-400/50 text-blue-300 text-xs font-bold font-['Cairo']">
                    {userGroupMeta.code}: نمط {userGroupMeta.learningMode} + تغذية {userGroupMeta.feedbackMode}
                  </span>
                ) : (
                  <span className="text-xs text-[#ffd700] font-semibold font-['Cairo']">
                    {RESEARCH_INFO.software}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white font-['Tajawal'] mt-1">
                رحلة مصمم الوسائط المتعددة: مرحباً بك، <span className="text-[#ffd700] font-mono">{username}</span>
              </h1>
              <p className="text-xs text-slate-300 mt-1 font-['Cairo']">
                {userGroupMeta ? userGroupMeta.name : RESEARCH_INFO.title}
              </p>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            <div className="px-4 py-2.5 rounded-2xl bg-[#080d1e] border border-blue-500/30 text-right">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">رصيد النقاط</span>
              <span className="text-lg font-black text-amber-300 font-['Outfit']">
                {studentGame.totalScore} ⭐
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-[#080d1e] border border-purple-500/30 text-right">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">المرحلة الحالية</span>
              <span className="text-lg font-black text-purple-300 font-['Outfit']">
                L{studentGame.currentLevel} / 10
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-[#080d1e] border border-emerald-500/30 text-right">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">الأوسمة المكتسبة</span>
              <span className="text-lg font-black text-emerald-300 font-['Outfit']">
                {studentGame.badges.length} 🏅
              </span>
            </div>
          </div>
        </div>

        {/* Master Storyboard Navigation Bar: All 9 key sections accessible in 1 click */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#070a16] border border-blue-500/30 shadow-inner w-full overflow-x-auto">
            {/* 1. خريطة التعلم */}
            <button
              type="button"
              id="tab-learning-map"
              onClick={() => setActiveMainSection('map')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'map'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>🗺️ خريطة التعلم (10 مراحل)</span>
            </button>

            {/* 2. اللعبة والنشاط */}
            <button
              type="button"
              id="tab-educational-game"
              onClick={() => setActiveMainSection('game')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'game'
                  ? 'bg-gradient-to-r from-[#ffd700] via-amber-400 to-[#d4af37] text-slate-950 shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>🎮 النشاط والتقييم اللحظي</span>
            </button>

            {/* 3. لوحة المتصدرين أو إنجاز الفريق */}
            <button
              type="button"
              id="tab-ranking-or-team"
              onClick={() => setActiveMainSection('ranking')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'ranking'
                  ? isCollaborative
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              {isCollaborative ? (
                <>
                  <Users className="w-4 h-4" />
                  <span>👥 إنجاز الفريق المشترك</span>
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  <span>🥇 لوحة المتصدرين التنافسية</span>
                </>
              )}
            </button>

            {/* 4. الملف الشخصي */}
            <button
              type="button"
              id="tab-profile"
              onClick={() => setActiveMainSection('profile')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'profile'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>👤 الملف الشخصي</span>
            </button>

            {/* 5. قواعد الرحلة والتعليمات */}
            <button
              type="button"
              id="tab-instructions"
              onClick={() => setActiveMainSection('instructions')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'instructions'
                  ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-[0_0_15px_rgba(2,132,199,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>📋 قواعد الرحلة</span>
            </button>

            {/* 6. شاشة الترحيب */}
            <button
              type="button"
              id="tab-welcome"
              onClick={() => setActiveMainSection('welcome')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'welcome'
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>👋 بطاقة الترحيب</span>
            </button>

            {/* 7. لوحة الشرف */}
            <button
              type="button"
              id="tab-honor-board"
              onClick={() => setActiveMainSection('honor')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'honor'
                  ? 'bg-gradient-to-r from-amber-400 to-[#d4af37] text-slate-950 shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>لوحة الشرف</span>
            </button>

            {/* 8. الأربع مجموعات */}
            <button
              type="button"
              id="tab-research-groups"
              onClick={() => setActiveMainSection('groups')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'groups'
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>المجموعات الـ 4</span>
            </button>

            {/* 9. محتوى ومحاكي Captivate */}
            <button
              type="button"
              id="tab-educational-levels"
              onClick={() => setActiveMainSection('levels')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'levels'
                  ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>المحتوى والمحاكي العملي</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Render based on Selected Master Tab */}
      {/* 1. خريطة التعلم التفاعلية (Screen 6 & Screen 7 Stage Intro) */}
      {activeMainSection === 'map' && (
        <LearningMapScreen
          username={username}
          onSelectStageForContent={() => setActiveMainSection('levels')}
          onSelectStageForActivity={() => setActiveMainSection('game')}
        />
      )}

      {/* 2. شاشة الترحيب (Screen 3) */}
      {activeMainSection === 'welcome' && (
        <WelcomeScreen
          username={username}
          onStartLearning={() => setActiveMainSection('map')}
          onOpenInstructions={() => setActiveMainSection('instructions')}
        />
      )}

      {/* 3. شاشة التعليمات وقواعد الرحلة (Screen 4) */}
      {activeMainSection === 'instructions' && (
        <InstructionsScreen
          onGotIt={() => setActiveMainSection('map')}
          onBackToWelcome={() => setActiveMainSection('welcome')}
        />
      )}

      {/* 4. الملف الشخصي (Screen 5) */}
      {activeMainSection === 'profile' && (
        <ProfileScreen
          username={username}
          onNavigateToMap={() => setActiveMainSection('map')}
        />
      )}

      {/* 5. اللعبة التعليمية والنشاط والتغذية الراجعة المتمايزة (Screens 8, 9, 10) */}
      {activeMainSection === 'game' && (
        <EducationalGameView username={username} />
      )}

      {/* 6. لوحة المتصدرين الفردية (التنافسي) / لوحة إنجاز الفريق المشترك (التعاوني) (Screen 10 & 11) */}
      {activeMainSection === 'ranking' && (
        <LeaderboardOrTeamBoard currentUsername={username} />
      )}

      {/* 7. لوحة الشرف العامة */}
      {activeMainSection === 'honor' && (
        <HonorBoard currentUsername={username} />
      )}

      {/* 8. المجموعات البحثية الأربعة */}
      {activeMainSection === 'groups' && (
        <ResearchGroups
          selectedGroupId={selectedGroupId}
          onSelectGroup={(id) => setSelectedGroupId(id)}
          currentUsername={username}
        />
      )}

      {/* 9. المحتوى التعليمي الكامل ومحاكي Adobe Captivate 2019 التفاعلي */}
      {activeMainSection === 'levels' && (
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <RightSidebarModules
            modules={CURRICULUM_MODULES}
            activeModuleId={activeModuleId}
            onSelectModule={(id) => setActiveModuleId(id)}
            completedObjectivesCount={completedCountByModule}
          />

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
      <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <WhatsAppSupport />

        <button
          type="button"
          onClick={onLogout}
          id="btn-portal-bottom-logout"
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-red-500/40 bg-red-950/30 hover:bg-red-900/40 text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج والعودة لصفحة البداية</span>
        </button>
      </div>
    </div>
  );
};
