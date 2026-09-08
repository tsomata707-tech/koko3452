import React, { useState, useEffect } from 'react';
import { CpLogo } from './CpLogo';
import {
  getAdminSettings,
  saveAdminSettings,
  getPortalUsers,
  savePortalUsers,
  getActivityLogs,
  addActivityLog,
} from '../utils/adminStorage';
import {
  getAllStudentsProgress,
  resetStudentProgress,
} from '../utils/gameStorage';
import { GAME_LEVELS_DATA, CARTOON_AVATARS } from '../data/gameLevelsData';
import { getGroupByUsername, RESEARCH_GROUPS_META, getStudentPassword } from '../data/studentAccounts';
import { AdminSettings, PortalUser, ActivityLog, StudentGameProgress, CompletedLevelResult } from '../types';
import { subscribeToAllStudentsProgress } from '../utils/realtimeService';
import {
  MessageCircle,
  Users,
  Shield,
  KeyRound,
  CheckCircle2,
  Save,
  Plus,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  ExternalLink,
  Activity,
  Cpu,
  AlertCircle,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Gamepad2,
  Trophy,
  Award,
  Sparkles,
  BarChart3,
  FileText,
  Clock,
  Download,
  Copy,
  LogIn,
  Check,

  CheckCircle,
  HelpCircle,
  Search,
  Zap,
  Wifi,
} from 'lucide-react';


interface AdminPanelProps {
  onExitAdmin: () => void;
  onLoginAsStudent?: (username: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExitAdmin, onLoginAsStudent }) => {
  const [activeTab, setActiveTab] = useState<'game_analytics' | 'whatsapp' | 'users' | 'security' | 'overview'>('game_analytics');
  const [settings, setSettings] = useState<AdminSettings>(getAdminSettings());
  const [users, setUsers] = useState<PortalUser[]>(getPortalUsers());
  const [logs, setLogs] = useState<ActivityLog[]>(getActivityLogs());
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [copiedAllAccounts, setCopiedAllAccounts] = useState(false);


  // Game Analytics State
  const [gameProgressMap, setGameProgressMap] = useState<Record<string, StudentGameProgress>>(() =>
    getAllStudentsProgress()
  );
  const [gameGroupFilter, setGameGroupFilter] = useState<'all' | 'G1' | 'G2' | 'G3' | 'G4'>('all');
  const [gameSearch, setGameSearch] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentGameProgress | null>(null);

  // Subscribe to Firebase Firestore for Real-time game analytics across all 60 students!
  useEffect(() => {
    const unsub = subscribeToAllStudentsProgress((firestoreMap) => {
      if (firestoreMap && Object.keys(firestoreMap).length > 0) {
        setGameProgressMap((prev) => ({
          ...prev,
          ...firestoreMap,
        }));
      }
    });

    return () => {
      unsub();
    };
  }, []);

  const refreshGameData = () => {
    setGameProgressMap(getAllStudentsProgress());
  };


  // WhatsApp form state
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [whatsappMessage, setWhatsappMessage] = useState(settings.whatsappDefaultMessage);
  const [whatsappEnabled, setWhatsappEnabled] = useState(settings.whatsappEnabled);
  const [whatsappSavedSuccess, setWhatsappSavedSuccess] = useState(false);

  // Admin password change state
  const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New user form state
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'member' | 'supervisor' | 'analyst'>('member');
  const [userFormError, setUserFormError] = useState<string | null>(null);

  // Filter & Search states for the 60 students
  const [userFilter, setUserFilter] = useState<'all' | 'G1' | 'G2' | 'G3' | 'G4' | 'admin'>('all');
  const [userSearch, setUserSearch] = useState('');

  const filteredUsers = users.filter((u) => {
    if (userFilter === 'admin') {
      if (u.role !== 'supervisor') return false;
    } else if (userFilter !== 'all') {
      if (!u.username.toUpperCase().startsWith(userFilter)) return false;
    }
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return (
        u.username.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q) ||
        (u.groupName && u.groupName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  useEffect(() => {
    const current = getAdminSettings();
    setSettings(current);
    setWhatsappNumber(current.whatsappNumber);
    setWhatsappMessage(current.whatsappDefaultMessage);
    setWhatsappEnabled(current.whatsappEnabled);
  }, []);

  // Save WhatsApp Settings
  const handleSaveWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedNumber = whatsappNumber.trim().replace(/\s+/g, '');
    const updated = saveAdminSettings({
      whatsappNumber: cleanedNumber,
      whatsappDefaultMessage: whatsappMessage.trim(),
      whatsappEnabled,
    });
    setSettings(updated);
    addActivityLog('تم تعديل رقم وإعدادات واتساب الأدمن', 'المشرف', 'success');
    setLogs(getActivityLogs());

    // Dispatch event so other components sync instantly
    window.dispatchEvent(new Event('cp_settings_updated'));

    setWhatsappSavedSuccess(true);
    setTimeout(() => setWhatsappSavedSuccess(false), 3500);
  };

  // Test WhatsApp Link directly
  const handleTestWhatsApp = () => {
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/${cleanNumber}?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  // Save New Admin Password
  const handleUpdateAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    const storedSettings = getAdminSettings();
    const actualOldPassword = storedSettings.adminPasswordHash || 'admin123';

    if (currentAdminPassword !== actualOldPassword) {
      setPasswordMsg({ type: 'error', text: 'كلمة المرور الحالية غير مطابقة' });
      return;
    }

    if (!newAdminPassword || newAdminPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'يجب أن تتكون كلمة المرور الجديدة من 4 خانات على الأقل' });
      return;
    }

    if (newAdminPassword !== confirmAdminPassword) {
      setPasswordMsg({ type: 'error', text: 'كلمتا المرور غير متطابقتين' });
      return;
    }

    saveAdminSettings({ adminPasswordHash: newAdminPassword });
    addActivityLog('تم تغيير كلمة مرور لوحة تحكم المشرف', 'المشرف', 'warning');
    setLogs(getActivityLogs());
    setCurrentAdminPassword('');
    setNewAdminPassword('');
    setConfirmAdminPassword('');
    setPasswordMsg({ type: 'success', text: 'تم تحديث كلمة مرور الأدمن بنجاح!' });
    setTimeout(() => setPasswordMsg(null), 4000);
  };

  // Add User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);

    if (!newUsername.trim() || !newUserPassword.trim()) {
      setUserFormError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    if (users.some((u) => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      setUserFormError('اسم المستخدم هذا مسجل مسبقاً');
      return;
    }

    const newUser: PortalUser = {
      id: 'usr_' + Date.now(),
      username: newUsername.trim(),
      fullName: newFullName.trim() || newUsername.trim(),
      role: newUserRole,
      password: newUserPassword.trim(),
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    savePortalUsers(updatedUsers);
    addActivityLog(`تم إنشاء مستخدم جديد: ${newUser.username}`, 'المشرف', 'success');
    setLogs(getActivityLogs());

    // Reset Form
    setNewUsername('');
    setNewFullName('');
    setNewUserPassword('');
    setIsAddingUser(false);
  };

  // Toggle User Active Status
  const handleToggleUser = (id: string) => {
    const updated = users.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u));
    setUsers(updated);
    savePortalUsers(updated);
    addActivityLog(`تم تعديل حالة المستخدم: ${users.find((u) => u.id === id)?.username}`, 'المشرف', 'warning');
    setLogs(getActivityLogs());
  };

  // Delete User
  const handleDeleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    if (confirm(`هل أنت متأكد من حذف المستخدم "${target.username}"؟`)) {
      const updated = users.filter((u) => u.id !== id);
      setUsers(updated);
      savePortalUsers(updated);
      addActivityLog(`تم حذف المستخدم: ${target.username}`, 'المشرف', 'error');
      setLogs(getActivityLogs());
    }
  };

  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-6" id="admin-panel-container">
      {/* Main Container Card with Golden Edge */}
      <div className="rounded-3xl bg-[#0b0914]/95 backdrop-blur-2xl border-2 border-[#d4af37] shadow-[0_0_40px_rgba(212,175,55,0.25)] overflow-hidden text-right">
        {/* Top Header Bar */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-[#161229] to-[#0d0a1a] border-b border-[#d4af37]/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <CpLogo size="lg" showText={true} />
            <div className="hidden sm:block h-10 w-[1px] bg-[#d4af37]/30" />
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-[#d4af37] text-amber-300 text-xs font-bold font-['Cairo']">
                  لوحة تحكم الأدمن
                </span>
                <span className="text-xs text-slate-400 font-medium">نظام الإشراف المركزي</span>
              </div>
              <p className="text-sm text-slate-300 font-semibold mt-1">
                إدارة أرقام التواصل، المستخدمين، والصلاحيات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={onExitAdmin}
              id="btn-exit-admin-panel"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/40 bg-red-950/40 hover:bg-red-900/50 text-red-200 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج من لوحة المشرف</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-800 bg-[#090712] flex items-center gap-2 overflow-x-auto py-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('game_analytics');
              refreshGameData();
            }}
            id="tab-btn-game-analytics"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'game_analytics'
                ? 'bg-gradient-to-r from-[#ffd700] via-amber-400 to-[#d4af37] text-slate-950 font-black shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>🎮 لوحة نتائج اللعبة والدرجات اللحظية (Game Live Analytics)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            id="tab-btn-whatsapp"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'whatsapp'
                ? 'bg-gradient-to-r from-emerald-600/30 to-emerald-500/10 border border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(37,211,102,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>إعدادات الواتساب</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            id="tab-btn-users"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-amber-600/30 to-amber-500/10 border border-[#d4af37] text-amber-300 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            <Users className="w-4 h-4 text-[#ffd700]" />
            <span>دليل الطلاب وحسابات الدخول ({users.length})</span>
          </button>


          <button
            type="button"
            onClick={() => setActiveTab('security')}
            id="tab-btn-security"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-purple-600/30 to-purple-500/10 border border-purple-500/60 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            <KeyRound className="w-4 h-4 text-purple-400" />
            <span>باسوورد الأدمن والأمان</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            id="tab-btn-overview"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-cyan-600/30 to-cyan-500/10 border border-cyan-500/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>نظرة عامة وسجل العمليات</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 sm:p-8">
          {/* TAB 0: GAME LIVE ANALYTICS & STUDENT PROGRESS */}
          {activeTab === 'game_analytics' && (
            <div className="space-y-6 text-right" id="admin-game-analytics-section">
              {/* Header Info & Refresh */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#120e26] via-[#1a1435] to-[#120e26] border-2 border-[#d4af37]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ffd700] text-slate-950 font-black text-xs font-['Cairo']">
                      مباشر ولحظي
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-bold text-xs font-['Cairo'] flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      متصل بـ Firebase Real-time (تحديثات فورية)
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white font-['Tajawal'] w-full mt-1">
                      لوحة مراقبة نتائج اللعبة التفاعلية والدرجات اللحظية
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 font-['Cairo'] mt-1 leading-relaxed max-w-2xl">
                    يتم رصد إجابات الطلاب ودرجاتهم فورياً في هذه اللوحة بمجرد إتمام أي مستوى. تظهر النتائج هنا لكافة الطلاب (سواء كانت مجموعتهم فورية أو مرجأة) لإتاحة الإشراف الكامل والتحليل الإحصائي للبحث.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={refreshGameData}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-[#d4af37]/60 text-amber-300 text-xs font-bold font-['Cairo'] flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تحديث البيانات اللحظية</span>
                  </button>
                </div>
              </div>

              {/* Comparative Group KPIs */}
              {(() => {
                const allProgressValues: StudentGameProgress[] = Object.values(gameProgressMap);
                const getGroupStats = (grpPrefix: string) => {
                  const grpStudents = allProgressValues.filter((s: StudentGameProgress) =>
                    s.username.toUpperCase().startsWith(grpPrefix)
                  );
                  const totalScore = grpStudents.reduce((acc: number, s: StudentGameProgress) => acc + s.totalScore, 0);
                  const totalLevelsCompleted = grpStudents.reduce(
                    (acc: number, s: StudentGameProgress) => acc + Object.keys(s.completedLevels).length,
                    0
                  );
                  const avgScore = grpStudents.length > 0 ? Math.round(totalScore / grpStudents.length) : 0;
                  return { count: grpStudents.length, totalScore, avgScore, totalLevelsCompleted };
                };

                const g1Stats = getGroupStats('G1');
                const g2Stats = getGroupStats('G2');
                const g3Stats = getGroupStats('G3');
                const g4Stats = getGroupStats('G4');

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* G1 Card */}
                    <div className="p-4 rounded-2xl bg-[#120f26] border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-right">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 text-[10px] font-bold">
                          G1: تنافسي • فوري
                        </span>
                        <Zap className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-2xl font-black text-white font-['Outfit']">
                          {g1Stats.avgScore} <span className="text-xs text-emerald-400">متوسط XP</span>
                        </span>
                        <span className="text-xs text-slate-400 font-mono">15 طالب</span>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-300 font-['Cairo'] flex items-center justify-between">
                        <span>المستويات المنجزة:</span>
                        <span className="font-bold text-emerald-300 font-mono">{g1Stats.totalLevelsCompleted} مستويات</span>
                      </div>
                      <div className="mt-1 text-[10px] text-emerald-400 font-['Cairo']">
                        ⚡ التغذية الراجعة معلنة للطالب فورياً
                      </div>
                    </div>

                    {/* G2 Card */}
                    <div className="p-4 rounded-2xl bg-[#120f26] border-2 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] text-right">
                      <div className="flex items-center justify-between pb-2 border-b border-purple-500/30">
                        <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 text-[10px] font-bold">
                          G2: تنافسي • مرجأ
                        </span>
                        <Clock className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-2xl font-black text-white font-['Outfit']">
                          {g2Stats.avgScore} <span className="text-xs text-purple-400">متوسط XP</span>
                        </span>
                        <span className="text-xs text-slate-400 font-mono">15 طالب</span>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-300 font-['Cairo'] flex items-center justify-between">
                        <span>المستويات المنجزة:</span>
                        <span className="font-bold text-purple-300 font-mono">{g2Stats.totalLevelsCompleted} مستويات</span>
                      </div>
                      <div className="mt-1 text-[10px] text-purple-400 font-['Cairo']">
                        ⏳ تظهر للأدمن فقط ومرجأة عن الطالب
                      </div>
                    </div>

                    {/* G3 Card */}
                    <div className="p-4 rounded-2xl bg-[#120f26] border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-right">
                      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/30">
                        <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 text-[10px] font-bold">
                          G3: تعاوني • فوري
                        </span>
                        <Users className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-2xl font-black text-white font-['Outfit']">
                          {g3Stats.avgScore} <span className="text-xs text-cyan-400">متوسط XP</span>
                        </span>
                        <span className="text-xs text-slate-400 font-mono">15 طالب</span>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-300 font-['Cairo'] flex items-center justify-between">
                        <span>المستويات المنجزة:</span>
                        <span className="font-bold text-cyan-300 font-mono">{g3Stats.totalLevelsCompleted} مستويات</span>
                      </div>
                      <div className="mt-1 text-[10px] text-cyan-400 font-['Cairo']">
                        ⚡ التغذية الراجعة معلنة للطالب فورياً
                      </div>
                    </div>

                    {/* G4 Card */}
                    <div className="p-4 rounded-2xl bg-[#120f26] border-2 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-right">
                      <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
                        <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 text-[10px] font-bold">
                          G4: تعاوني • مرجأ
                        </span>
                        <Clock className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-2xl font-black text-white font-['Outfit']">
                          {g4Stats.avgScore} <span className="text-xs text-amber-400">متوسط XP</span>
                        </span>
                        <span className="text-xs text-slate-400 font-mono">15 طالب</span>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-300 font-['Cairo'] flex items-center justify-between">
                        <span>المستويات المنجزة:</span>
                        <span className="font-bold text-amber-300 font-mono">{g4Stats.totalLevelsCompleted} مستويات</span>
                      </div>
                      <div className="mt-1 text-[10px] text-amber-400 font-['Cairo']">
                        ⏳ تظهر للأدمن فقط ومرجأة عن الطالب
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Filter and Search Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                {/* Group Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {(['all', 'G1', 'G2', 'G3', 'G4'] as const).map((grp) => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setGameGroupFilter(grp)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        gameGroupFilter === grp
                          ? 'bg-[#ffd700] text-slate-950 font-black shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {grp === 'all' ? 'جميع الطلاب (60)' : `المجموعة ${grp}`}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={gameSearch}
                    onChange={(e) => setGameSearch(e.target.value)}
                    placeholder="بحث باسم الطالب أو الكود..."
                    className="w-full h-10 pr-9 pl-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:border-[#ffd700] focus:outline-none text-right font-['Cairo']"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Real-time Students Progress Table */}
              <div className="overflow-x-auto rounded-2xl border-2 border-slate-800 bg-[#0d0a1a]">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-['Cairo']">
                    <tr>
                      <th className="p-3.5">الطالب والشخصية</th>
                      <th className="p-3.5">المجموعة التجريبية</th>
                      <th className="p-3.5">نمط التغذية</th>
                      <th className="p-3.5 text-center">المستوى الحالي</th>
                      <th className="p-3.5 text-center">المستويات المكتملة</th>
                      <th className="p-3.5 text-center">النقاط (XP)</th>
                      <th className="p-3.5 text-center">حالة الإغلاق</th>
                      <th className="p-3.5 text-center">إجراءات المراجعة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {users
                      .filter((u) => u.role === 'member')
                      .filter((u) => {
                        if (gameGroupFilter !== 'all') {
                          if (!u.username.toUpperCase().startsWith(gameGroupFilter)) return false;
                        }
                        if (gameSearch.trim()) {
                          const q = gameSearch.toLowerCase();
                          return (
                            u.username.toLowerCase().includes(q) ||
                            u.fullName.toLowerCase().includes(q)
                          );
                        }
                        return true;
                      })
                      .map((u) => {
                        const prog = gameProgressMap[u.username] || {
                          username: u.username,
                          avatarId: 'cp-bot',
                          currentLevel: 1,
                          completedLevels: {},
                          totalScore: 0,
                          badges: [],
                          lastActiveAt: 'لم يبدأ بعد',
                        };

                        const avatar =
                          CARTOON_AVATARS.find((a) => a.id === prog.avatarId) || CARTOON_AVATARS[0];
                        const grpMeta = getGroupByUsername(u.username);
                        const completedCount = Object.keys(prog.completedLevels).length;

                        return (
                          <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                            {/* Student & Avatar */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                                  {avatar.emoji}
                                </span>
                                <div>
                                  <span className="font-mono font-bold text-white text-xs block">
                                    {u.username}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-['Cairo']">
                                    {u.fullName}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Group Meta */}
                            <td className="p-3.5 font-['Cairo']">
                              {grpMeta ? (
                                <span className="font-bold text-slate-200">
                                  {grpMeta.code} ({grpMeta.learningMode})
                                </span>
                              ) : (
                                'غير محدد'
                              )}
                            </td>

                            {/* Feedback Mode */}
                            <td className="p-3.5 font-['Cairo']">
                              {grpMeta?.feedbackMode === 'فورية' ? (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                                  ⚡ فورية معلنة
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[10px] font-bold">
                                  ⏳ مرجأة (أدمن فقط)
                                </span>
                              )}
                            </td>

                            {/* Current Level */}
                            <td className="p-3.5 text-center font-mono">
                              <span className="px-2 py-0.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold">
                                L{prog.currentLevel} / 10
                              </span>
                            </td>

                            {/* Completed Count */}
                            <td className="p-3.5 text-center font-mono">
                              <span className="text-slate-200 font-bold">
                                {completedCount} من 10
                              </span>
                            </td>

                            {/* XP Score */}
                            <td className="p-3.5 text-center">
                              <span className="font-mono font-black text-amber-300 text-sm">
                                {prog.totalScore}
                              </span>
                              <span className="text-[10px] text-slate-400 mr-1">XP</span>
                            </td>

                            {/* Level Lock status */}
                            <td className="p-3.5 text-center font-['Cairo']">
                              {completedCount > 0 ? (
                                <span className="text-[11px] text-rose-300 flex items-center justify-center gap-1 font-bold">
                                  <Lock className="w-3 h-3 text-rose-400" />
                                  <span>{completedCount} مستويات مقفلة</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500">في انتظار البدء</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-3.5 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedStudentDetail(prog)}
                                  className="px-2.5 py-1 rounded-lg bg-[#ffd700]/20 hover:bg-[#ffd700]/30 border border-[#ffd700]/50 text-amber-300 text-[11px] font-bold font-['Cairo'] flex items-center gap-1 transition-all cursor-pointer"
                                  title="عرض تفاصيل الإجابات لكل مستوى"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>كشف الإجابات</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      confirm(
                                        `هل تريد بالتأكيد إعادة تعيين سجل الطالب ${u.username} ليعيد اللعبة من المستوى 1؟`
                                      )
                                    ) {
                                      resetStudentProgress(u.username);
                                      refreshGameData();
                                    }
                                  }}
                                  className="px-2 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-[11px] font-bold font-['Cairo'] transition-all cursor-pointer"
                                  title="إعادة تعيين للمستوى 1"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* DETAILED STUDENT ANSWERS MODAL */}
              {selectedStudentDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-right">
                  <div className="bg-[#0f0c1f] border-2 border-[#ffd700] rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-right shadow-[0_0_60px_rgba(212,175,55,0.35)] max-h-[85vh] flex flex-col">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-[#ffd700] flex items-center justify-center text-2xl">
                          {CARTOON_AVATARS.find((a) => a.id === selectedStudentDetail.avatarId)?.emoji || '🤖'}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white font-['Tajawal'] flex items-center gap-2">
                            <span>تقرير إجابات الطالب:</span>
                            <span className="font-mono text-[#ffd700]">
                              {selectedStudentDetail.username}
                            </span>
                          </h3>
                          <span className="text-xs text-slate-400 font-['Cairo']">
                            إجمالي النقاط المحققة: {selectedStudentDetail.totalScore} XP • المستوى الحالي: L{selectedStudentDetail.currentLevel}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedStudentDetail(null)}
                        className="text-slate-400 hover:text-white text-sm font-bold font-['Cairo'] cursor-pointer p-1"
                      >
                        ✕ إغلاق
                      </button>
                    </div>

                    {/* Modal Body: Levels Breakdown */}
                    <div className="overflow-y-auto py-4 space-y-4 pr-1">
                      {Object.keys(selectedStudentDetail.completedLevels).length === 0 ? (
                        <div className="p-8 text-center text-slate-400 font-['Cairo']">
                          لم يقم الطالب بإنهاء أي مستوى حتى الآن.
                        </div>
                      ) : (
                        (Object.values(selectedStudentDetail.completedLevels) as CompletedLevelResult[]).map((lvlRes) => {
                          const lvlDef = GAME_LEVELS_DATA.find((l) => l.levelNumber === lvlRes.levelNumber);

                          return (
                            <div
                              key={lvlRes.levelNumber}
                              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                            >
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md bg-[#ffd700] text-slate-950 text-xs font-black font-['Outfit']">
                                    L{lvlRes.levelNumber}
                                  </span>
                                  <h4 className="text-sm font-bold text-white font-['Tajawal']">
                                    {lvlDef?.title || `المستوى ${lvlRes.levelNumber}`}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 text-xs font-mono font-bold">
                                    {lvlRes.score} / {lvlRes.maxScore} XP
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono" dir="ltr">
                                    {lvlRes.completedAt}
                                  </span>
                                </div>
                              </div>

                              {/* Questions Details */}
                              <div className="space-y-2 pt-1">
                                {lvlDef?.questions.map((q, idx) => {
                                  const studentChoice = lvlRes.answers[q.id];
                                  const isCorrect = studentChoice === q.correctIndex;

                                  return (
                                    <div
                                      key={q.id}
                                      className={`p-3 rounded-xl border text-xs font-['Cairo'] ${
                                        isCorrect
                                          ? 'bg-emerald-950/20 border-emerald-500/30'
                                          : 'bg-red-950/20 border-red-500/30'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <span className="font-bold text-slate-200">
                                          س{idx + 1}: {q.question}
                                        </span>
                                        <span
                                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                            isCorrect
                                              ? 'bg-emerald-900/60 text-emerald-300'
                                              : 'bg-red-900/60 text-red-300'
                                          }`}
                                        >
                                          {isCorrect ? 'إجابة صحيحة' : 'إجابة خاطئة'}
                                        </span>
                                      </div>

                                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                                          <span className="text-slate-400 block text-[10px]">إجابة الطالب:</span>
                                          <span className={isCorrect ? 'text-emerald-300' : 'text-red-300 line-through'}>
                                            {studentChoice !== undefined
                                              ? q.options[studentChoice]
                                              : 'لم يجب'}
                                          </span>
                                        </div>

                                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                                          <span className="text-slate-400 block text-[10px]">الإجابة النموذجية:</span>
                                          <span className="text-emerald-300 font-bold">
                                            {q.options[q.correctIndex]}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="mt-1.5 text-[10px] text-slate-400">
                                        💡 {q.explanation}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="text-[10px] text-amber-300/80 font-['Cairo'] pt-1">
                                🔒 المستوى مقفل نهائياً على الطالب • {lvlRes.feedbackRevealedToStudent ? 'عُرضت النتيجة فورياً للطالب' : 'تم حجب النتيجة الفورية عن الطالب وفقاً لمتغيرات التغذية المرجئة'}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: WHATSAPP CONFIGURATION */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6 max-w-3xl mx-auto" id="admin-whatsapp-section">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-300">
                    التحكم برقم الواتساب المحول إليه
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    تم نقل إمكانية تعديل رقم الواتساب إلى لوحة الأدمن فقط. أيقونة الواتساب في صفحة تسجيل الدخول ستقوم فوراً بتحويل المستخدم إلى هذا الرقم المحدد هنا.
                  </p>
                </div>
              </div>

              {whatsappSavedSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-900/40 border border-emerald-400 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>تم حفظ وتحديث رقم واتساب المشرف بنجاح! الأيقونة أصبحت متصلة بالرقم الجديد.</span>
                </div>
              )}

              <form onSubmit={handleSaveWhatsApp} className="space-y-5">
                {/* Phone Number Field */}
                <div className="space-y-2">
                  <label htmlFor="admin-whatsapp-input" className="block text-xs font-bold text-amber-200">
                    رقم هاتف الواتساب (مع كود الدولة):
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      dir="ltr"
                      id="admin-whatsapp-input"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+201000000000"
                      className="w-full h-12 px-4 rounded-xl bg-[#090812] text-white font-mono text-base border-2 border-[#d4af37]/60 focus:border-[#ffd700] focus:ring-2 focus:ring-[#d4af37]/20 focus:outline-none text-left"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    مثال: +201012345678 أو +966501234567 (يشترط إدخال مفتاح الدولة بدون مسافات).
                  </span>
                </div>

                {/* Default Pre-filled Message */}
                <div className="space-y-2">
                  <label htmlFor="admin-whatsapp-msg" className="block text-xs font-bold text-amber-200">
                    الرسالة التلقائية التي تظهر للمستخدم عند فتح الواتساب:
                  </label>
                  <textarea
                    id="admin-whatsapp-msg"
                    rows={2}
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    placeholder="مرحباً، أحتاج مساعدة بخصوص تسجيل الدخول في بوابة CP"
                    className="w-full p-3 rounded-xl bg-[#090812] text-white text-sm border-2 border-[#d4af37]/60 focus:border-[#ffd700] focus:outline-none text-right"
                  />
                </div>

                {/* Live Preview & Action Buttons */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleTestWhatsApp}
                    id="btn-test-whatsapp-link"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-emerald-500/50 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>تجربة فتح الرابط والتأكد من الرقم</span>
                  </button>

                  <button
                    type="submit"
                    id="btn-save-whatsapp-settings"
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4 stroke-[2.5]" />
                    <span>حفظ وتطبيق رقم الواتساب فوراً</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT (Since registration is closed) */}
          {activeTab === 'users' && (
            <div className="space-y-6" id="admin-users-section">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white font-['Cairo'] flex items-center gap-2">
                      <span>دليل حسابات وكلمات مرور الطلاب الـ 60</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-amber-300 font-bold">
                        خاص بالأدمن فقط 🔒
                      </span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    تم نقل كافة اليوزر نيم والباسورد هنا لضمان السرية والخصوصية. يمكنك نسخ البيانات، تصديرها، أو الدخول فوراً بحساب أي طالب.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const groups = ['G1', 'G2', 'G3', 'G4'] as const;
                      let text = 'جدول حسابات وكلمات مرور الطلاب الـ 60:\n\n';
                      groups.forEach((g) => {
                        const meta = RESEARCH_GROUPS_META[g];
                        text += `=== ${g}: ${meta.name} (${meta.learningMode} - ${meta.feedbackMode}) ===\n`;
                        text += 'م \t اسم المستخدم \t كلمة المرور\n';
                        for (let i = 1; i <= 15; i++) {
                          const pad = i < 10 ? `0${i}` : `${i}`;
                          const u = `${g}_Cp_${pad}`;
                          const p = getStudentPassword(g, pad);
                          text += `${pad} \t ${u} \t ${p}\n`;
                        }
                        text += '\n';
                      });
                      navigator.clipboard.writeText(text);
                      setCopiedAllAccounts(true);
                      setTimeout(() => setCopiedAllAccounts(false), 2500);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="نسخ جدول الـ 60 طالباً بالكامل مع كلمات المرور"
                  >
                    {copiedAllAccounts ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedAllAccounts ? 'تم نسخ الجدول!' : 'نسخ الجدول كاملاً'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const groups = ['G1', 'G2', 'G3', 'G4'] as const;
                      let csv = '\uFEFFم,المجموعة,اسم المستخدم,كلمة المرور,نمط التعلم,نمط التغذية الراجعة\n';
                      let index = 1;
                      groups.forEach((g) => {
                        const meta = RESEARCH_GROUPS_META[g];
                        for (let i = 1; i <= 15; i++) {
                          const pad = i < 10 ? `0${i}` : `${i}`;
                          const u = `${g}_Cp_${pad}`;
                          const p = getStudentPassword(g, pad);
                          csv += `${index},${g},${u},${p},${meta.learningMode},${meta.feedbackMode}\n`;
                          index++;
                        }
                      });
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'جدول_حسابات_الطلاب_وكلمات_المرور_60_طالب.csv';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    title="استخراج وتحميل جدول حسابات وكلمات مرور الطلاب الـ 60 بصيغة CSV / Excel"
                  >
                    <Download className="w-4 h-4" />
                    <span>استخراج CSV / Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddingUser(!isAddingUser)}
                    id="btn-toggle-add-user"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffd700] to-[#d4af37] text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:opacity-90 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAddingUser ? 'إلغاء الإضافة' : 'إضافة مستخدم جديد'}</span>
                  </button>
                </div>
              </div>

              {/* 4 Research Groups Quick Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-right">
                {(['G1', 'G2', 'G3', 'G4'] as const).map((g) => {
                  const meta = RESEARCH_GROUPS_META[g];
                  const isSelected = userFilter === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setUserFilter(isSelected ? 'all' : g)}
                      className={`p-3.5 rounded-2xl text-right transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[#d4af37]/20 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                          : 'bg-[#120f22] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-sm text-[#ffd700]">{g}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                          15 طالب
                        </span>
                      </div>
                      <div className="font-bold text-xs text-white mt-1.5">
                        {meta.learningMode} • {meta.feedbackMode}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        {g}_Cp_01 - {g}_Cp_15
                      </div>
                    </button>
                  );
                })}
              </div>



              {/* Add User Modal / Box */}
              {isAddingUser && (
                <form
                  onSubmit={handleCreateUser}
                  className="p-5 rounded-2xl bg-[#120f22] border-2 border-[#d4af37] space-y-4 animate-in fade-in"
                >
                  <h4 className="text-sm font-bold text-amber-300">إضافة مستخدم معتمد جديد للمنصة:</h4>
                  {userFormError && (
                    <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/60 text-red-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{userFormError}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs text-slate-300">اسم المستخدم (للتسجيل):</label>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="username"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs text-slate-300">الاسم الكامل:</label>
                      <input
                        type="text"
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        placeholder="الاسم الثلاثي أو الوصف"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs text-slate-300">كلمة المرور:</label>
                      <input
                        type="text"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="كلمة مرور الحساب"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs text-slate-300">صلاحية المستخدم:</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                      >
                        <option value="member">عضو معتمد (Member)</option>
                        <option value="analyst">محلل رقمي (Analyst)</option>
                        <option value="supervisor">مشرف ثانوي (Supervisor)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                    >
                      حفظ المستخدم الجديد
                    </button>
                  </div>
                </form>
              )}

              {/* Group Filter & Search Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setUserFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userFilter === 'all'
                        ? 'bg-[#ffd700] text-slate-950 shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    الكل ({users.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserFilter('G1')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userFilter === 'G1'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    G1 (تنافسي فوري - 15)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserFilter('G2')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userFilter === 'G2'
                        ? 'bg-purple-500 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    G2 (تنافسي مرجأ - 15)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserFilter('G3')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userFilter === 'G3'
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    G3 (تعاوني فوري - 15)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserFilter('G4')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userFilter === 'G4'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    G4 (تعاوني مرجأ - 15)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserFilter('admin')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userFilter === 'admin'
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    الإدارة
                  </button>
                </div>

                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="بحث باسم المستخدم أو المجموعة..."
                    className="w-full px-3 py-1.5 rounded-xl bg-[#090812] border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto rounded-2xl border border-[#d4af37]/30 bg-[#090712]">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#151224] text-amber-200 border-b border-[#d4af37]/20 font-bold">
                    <tr>
                      <th className="p-3.5">اسم المستخدم</th>
                      <th className="p-3.5">المجموعة التجريبية</th>
                      <th className="p-3.5">الاسم / الوصف</th>
                      <th className="p-3.5">كلمة المرور</th>
                      <th className="p-3.5">الدور</th>
                      <th className="p-3.5">الحالة</th>
                      <th className="p-3.5 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
                          لا توجد حسابات مطابقة لمعايير البحث
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-white">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[#ffd700]">
                                {u.username}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(u.username);
                                  setCopiedItem(`user-${u.username}`);
                                  setTimeout(() => setCopiedItem(null), 2000);
                                }}
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title="نسخ اسم المستخدم"
                              >
                                {copiedItem === `user-${u.username}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="p-3.5">
                            {u.groupCode ? (
                              <div className="flex flex-col gap-0.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block w-fit ${
                                    u.groupCode === 'G1'
                                      ? 'bg-amber-950 border-amber-600 text-amber-300'
                                      : u.groupCode === 'G2'
                                      ? 'bg-purple-950 border-purple-600 text-purple-300'
                                      : u.groupCode === 'G3'
                                      ? 'bg-cyan-950 border-cyan-600 text-cyan-300'
                                      : 'bg-emerald-950 border-emerald-600 text-emerald-300'
                                  }`}
                                >
                                  {u.groupCode}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {u.groupCode === 'G1' && 'تنافسي فوري'}
                                  {u.groupCode === 'G2' && 'تنافسي مرجأ'}
                                  {u.groupCode === 'G3' && 'تعاوني فوري'}
                                  {u.groupCode === 'G4' && 'تعاوني مرجأ'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className="p-3.5 text-slate-300 max-w-[200px] truncate">{u.fullName}</td>
                          <td className="p-3.5 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/40 text-amber-300 font-bold">
                                {u.password}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(u.password || '');
                                  setCopiedItem(`pass-${u.username}`);
                                  setTimeout(() => setCopiedItem(null), 2000);
                                }}
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                                title="نسخ كلمة المرور"
                              >
                                {copiedItem === `pass-${u.username}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800/60 text-purple-300 text-[10px]">
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                u.isActive
                                    ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                                    : 'bg-red-950 border border-red-500/40 text-red-300'
                              }`}
                            >
                              {u.isActive ? 'مفعل' : 'معطل'}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {onLoginAsStudent && u.role === 'member' && (
                                <button
                                  type="button"
                                  onClick={() => onLoginAsStudent(u.username)}
                                  className="px-2 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/60 hover:bg-emerald-800/90 text-emerald-300 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                                  title={`دخول فوري ومباشر بحساب الطالب ${u.username}`}
                                >
                                  <LogIn className="w-3 h-3" />
                                  <span>دخول كطالب</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleToggleUser(u.id)}
                                className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:text-amber-300 text-slate-400 cursor-pointer"
                                title={u.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                              >
                                {u.isActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-slate-500" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 rounded-lg border border-red-900/50 bg-red-950/40 hover:bg-red-900 text-red-400 cursor-pointer"
                                title="حذف المستخدم"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ADMIN PASSWORD & SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-xl mx-auto" id="admin-security-section">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-purple-300">
                    باسوورد الأدمن المنفصل
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    لوحة الأدمن محمية بكلمة مرور خاصة بها تختلف عن حسابات المستخدمين العاديين، ويمكنك تغييرها هنا في أي وقت.
                  </p>
                </div>
              </div>

              {passwordMsg && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200'
                      : 'bg-red-950/60 border-red-400 text-red-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateAdminPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-amber-200">
                    كلمة مرور الأدمن الحالية:
                  </label>
                  <input
                    type="password"
                    value={currentAdminPassword}
                    onChange={(e) => setCurrentAdminPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الحالية"
                    className="w-full h-11 px-4 rounded-xl bg-[#090812] text-white text-sm border-2 border-slate-700 focus:border-amber-400 focus:outline-none text-right"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-amber-200">
                    كلمة مرور الأدمن الجديدة:
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPass ? 'text' : 'password'}
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور الجديدة"
                      className="w-full h-11 pr-4 pl-10 rounded-xl bg-[#090812] text-white text-sm border-2 border-slate-700 focus:border-amber-400 focus:outline-none text-right"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPass(!showAdminPass)}
                      className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 hover:text-white"
                    >
                      {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-amber-200">
                    تأكيد كلمة مرور الأدمن الجديدة:
                  </label>
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور للتأكيد"
                    className="w-full h-11 px-4 rounded-xl bg-[#090812] text-white text-sm border-2 border-slate-700 focus:border-amber-400 focus:outline-none text-right"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold text-xs tracking-wide shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>تحديث وحفظ باسوورد الأدمن الجديد</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: SYSTEM OVERVIEW & LOGS */}
          {activeTab === 'overview' && (
            <div className="space-y-6" id="admin-overview-section">
              {/* Quick Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#120f22] border border-[#d4af37]/40 text-right">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">حالة واتساب الأدمن</span>
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-mono font-bold text-emerald-300 mt-2" dir="ltr">
                    {settings.whatsappNumber}
                  </div>
                  <span className="text-[10px] text-emerald-400/80">جاهز ومفعل للتحويل المباشر</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#120f22] border border-[#d4af37]/40 text-right">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">المستخدمين المسجلين</span>
                    <Users className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-xl font-bold text-white mt-2">
                    {users.length} حساب
                  </div>
                  <span className="text-[10px] text-amber-400/80">تسجيل الدخول مغلق للعامة</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#120f22] border border-[#d4af37]/40 text-right">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">المحرك الروبوتي الذكي</span>
                    <Cpu className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-xl font-bold text-white mt-2">
                    يعمل بكفاءة 100%
                  </div>
                  <span className="text-[10px] text-purple-400/80">رسومات ذكاء اصطناعي رمادية</span>
                </div>
              </div>

              {/* Logs Stream */}
              <div className="p-4 rounded-2xl bg-[#090712] border border-slate-800 text-right">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>سجل النشاطات والإجراءات الإدارية:</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">محدث لحظياً</span>
                </div>

                <div className="divide-y divide-slate-800/80 mt-2 max-h-60 overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.status === 'success'
                              ? 'bg-emerald-400'
                              : log.status === 'warning'
                              ? 'bg-amber-400'
                              : 'bg-red-400'
                          }`}
                        />
                        <span className="text-white font-medium">{log.action}</span>
                        <span className="text-[11px] text-slate-400">({log.user})</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500" dir="ltr">
                        {log.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
