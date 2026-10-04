import React, { useState } from 'react';
import {
  Award,
  Crown,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  getSupervisorsBoardConfig,
  saveSupervisorsBoardConfig,
  resetSupervisorsBoardConfig,
} from '../utils/supervisorsStorage';
import { SupervisorsHonorBoardConfig, SupervisorCard } from '../types';
import { addActivityLog } from '../utils/adminStorage';
import { SupervisorsHonorBoard } from './SupervisorsHonorBoard';

export const AdminSupervisorsHonorManager: React.FC = () => {
  const [config, setConfig] = useState<SupervisorsHonorBoardConfig>(() => getSupervisorsBoardConfig());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // File Upload Helper to convert JPG/PNG to Base64 easily
  const handlePhotoUpload = (cardId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file format: jpg, jpeg, png
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      setErrorMessage('يرجى اختيار صورة بصيغة JPG أو JPEG أو PNG صالحة.');
      return;
    }

    // Limit size to 2MB to keep localStorage healthy
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('حجم الصورة كبير، يرجى اختيار صورة أقل من 2 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      if (base64Data) {
        setConfig((prev) => ({
          ...prev,
          supervisors: prev.supervisors.map((card) =>
            card.id === cardId ? { ...card, imageUrl: base64Data } : card
          ),
        }));
        setSuccessMessage('تم تحميل وتعيين صورة المشرف بنجاح! لا تنسَ الضغط على "حفظ التعديلات".');
      }
    };
    reader.readAsDataURL(file);
  };

  // Add new small card
  const handleAddCard = () => {
    const nextIdx = config.supervisors.length + 1;
    const newCard: SupervisorCard = {
      id: `sup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      cardIndex: nextIdx,
      cardLabel: `البطاقة ${nextIdx}`,
      name: 'د/ اسم المشرف الجديد',
      title: 'كلية التربية النوعية - جامعة طنطا',
      role: 'مشرف علمي على البحث',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      accentColor: '#ffd700',
    };

    setConfig((prev) => ({
      ...prev,
      supervisors: [...prev.supervisors, newCard],
    }));
    setSuccessMessage(`تمت إضافة بطاقة جديدة (${newCard.cardLabel}) داخل لوحة الشرف.`);
  };

  // Delete small card
  const handleDeleteCard = (cardId: string, cardLabel: string) => {
    if (config.supervisors.length <= 1) {
      setErrorMessage('يجب أن تحتوي لوحة الشرف على بطاقة واحدة على الأقل.');
      return;
    }

    if (window.confirm(`هل أنت متأكد من حذف ${cardLabel} من لوحة الشرف؟`)) {
      setConfig((prev) => {
        const remaining = prev.supervisors.filter((c) => c.id !== cardId);
        // re-index remaining cards
        const reIndexed = remaining.map((c, i) => ({
          ...c,
          cardIndex: i + 1,
          cardLabel: c.cardLabel.startsWith('البطاقة') ? `البطاقة ${i + 1}` : c.cardLabel,
        }));
        return {
          ...prev,
          supervisors: reIndexed,
        };
      });
      setSuccessMessage(`تم حذف ${cardLabel} بنجاح.`);
    }
  };

  // Move card up/down
  const handleMoveCard = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= config.supervisors.length) return;

    setConfig((prev) => {
      const copy = [...prev.supervisors];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;

      // Update cardIndex and default labels
      const updated = copy.map((c, i) => ({
        ...c,
        cardIndex: i + 1,
        cardLabel: c.cardLabel.startsWith('البطاقة') ? `البطاقة ${i + 1}` : c.cardLabel,
      }));

      return {
        ...prev,
        supervisors: updated,
      };
    });
  };

  // Update card fields
  const handleUpdateCardField = (cardId: string, field: keyof SupervisorCard, value: any) => {
    setConfig((prev) => ({
      ...prev,
      supervisors: prev.supervisors.map((c) => (c.id === cardId ? { ...c, [field]: value } : c)),
    }));
  };

  // Save changes
  const handleSaveAll = () => {
    try {
      saveSupervisorsBoardConfig(config);
      addActivityLog('تم تحديث وتعديل بيانات لوحة الشرف للمشرفين', 'المشرف', 'success');
      setSuccessMessage('تم حفظ كافة إعدادات لوحة الشرف والبطاقات بنجاح!');
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setErrorMessage('حدث خطأ أثناء حفظ الإعدادات، يرجى المحاولة ثانية.');
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (window.confirm('هل تريد استعادة البيانات الافتراضية للوحة شرف مشرفي جامعة طنطا؟')) {
      const def = resetSupervisorsBoardConfig();
      setConfig(def);
      addActivityLog('تمت استعادة الضبط الافتراضي للوحة الشرف للمشرفين', 'المشرف', 'warning');
      setSuccessMessage('تمت استعادة البيانات الافتراضية للوحة الشرف بنجاح.');
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6 text-right font-['Cairo',_sans-serif]" id="admin-supervisors-honor-manager">
      {/* Top Banner & Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#171330] via-[#100c24] to-[#0a0817] border-2 border-[#ffd700]/70 p-6 sm:p-8 shadow-[0_0_35px_rgba(212,175,55,0.25)] relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-28 bg-[#ffd700]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ffd700] via-amber-400 to-[#d4af37] text-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(255,215,0,0.45)] shrink-0">
              <Crown className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full bg-[#ffd700]/20 border border-[#ffd700] text-[#ffd700] text-xs font-black">
                  إدارة لوحة الشرف
                </span>
                <span className="text-xs text-amber-200 flex items-center gap-1 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
                  <span>البطاقة الكبيرة الزجاجية + البطاقات الصغيرة (البطاقة 1، البطاقة 2...)</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 font-['Tajawal']">
                لوحة الشرف والتقدير لمشرفي المشروع والرسالة العلمية
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                تخصيص عنوان اللوحة باللون الذهبي، إدارة أسماء المشرفين ووظائفهم، ورفع الصور (JPG/PNG) بسهولة.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow"
            >
              <Eye className="w-4 h-4 text-[#ffd700]" />
              <span>معاينة حية للوحة الشرف</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_20px_rgba(255,215,0,0.4)]"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-white text-xs underline cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-950/80 border-2 border-red-500 text-red-200 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-white text-xs underline cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Section 1: Main Board Settings (البطاقة الكبيرة) */}
      <div className="rounded-3xl bg-[#0f0c22]/90 border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 font-['Tajawal']">
            <Layers className="w-5 h-5 text-[#ffd700]" />
            <span>1. إعدادات البطاقة الكبيرة الزجاجية (عنوان اللوحة الذهبي والبيانات)</span>
          </h3>
          <span className="text-xs text-amber-300 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            العنوان يظهر بلون ذهبي متألق ومختلف
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Board Title (عنوان اللوحة) */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs sm:text-sm font-black text-amber-300 flex items-center justify-between">
              <span>عنوان اللوحة الرئيسي (يظهر بلون ذهبي مميز):</span>
              <span className="text-[11px] text-slate-400 font-normal">
                مختلف تماماً عن أسماء الدكاترة ووظائفهم
              </span>
            </label>
            <input
              type="text"
              value={config.boardTitle}
              onChange={(e) => setConfig((prev) => ({ ...prev, boardTitle: e.target.value }))}
              placeholder="مثال: لوحة الشرف لمشرفي المشروع والرسالة العلمية"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border-2 border-amber-500/60 focus:border-[#ffd700] text-amber-300 font-black text-sm sm:text-base outline-none shadow-inner"
            />
            {/* Live Gold Preview Indicator */}
            <div className="p-3 rounded-xl bg-[#080714] border border-[#ffd700]/30 flex items-center gap-3">
              <span className="text-[11px] text-slate-400 font-bold">معاينة لون العنوان:</span>
              <span className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffeaa7] via-[#ffd700] to-[#f39c12] drop-shadow-[0_2px_15px_rgba(255,215,0,0.6)] font-['Tajawal']">
                {config.boardTitle || 'لوحة الشرف لمشرفي المشروع'}
              </span>
            </div>
          </div>

          {/* University / Affiliation */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-slate-200">
              الجامعة والكلية والقسم:
            </label>
            <input
              type="text"
              value={config.university}
              onChange={(e) => setConfig((prev) => ({ ...prev, university: e.target.value }))}
              placeholder="جامعة طنطا - كلية التربية النوعية - قسم تكنولوجيا التعليم"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-white text-xs sm:text-sm outline-none"
            />
          </div>

          {/* Researcher Name */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-slate-200">
              اسم الباحث / الباحثة:
            </label>
            <input
              type="text"
              value={config.researcher || ''}
              onChange={(e) => setConfig((prev) => ({ ...prev, researcher: e.target.value }))}
              placeholder="الباحثة/ حكمت عزت محمد غنيم"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-white text-xs sm:text-sm outline-none"
            />
          </div>

          {/* Subtitle / Department Dedication */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs sm:text-sm font-bold text-slate-200">
              الوصف والتقديم الأكاديمي للوحة:
            </label>
            <textarea
              rows={2}
              value={config.boardSubtitle}
              onChange={(e) => setConfig((prev) => ({ ...prev, boardSubtitle: e.target.value }))}
              placeholder="تقديراً وعرفاناً بالجهود العلمية الرائدة والتوجيه الأكاديمي السديد..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-white text-xs sm:text-sm outline-none resize-none"
            />
          </div>

          {/* Auto Display on Student Login Switch */}
          <div className="md:col-span-2 p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-slate-900/60 border border-blue-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white">
                  عرض لوحة الشرف تلقائياً بعد تسجيل دخول الطالب
                </h4>
                <p className="text-[11px] text-slate-300">
                  بمجرد تسجيل دخول الطالب تظهر له البطاقة الزجاجية الكبيرة تقديراً للمشرفين قبل استكمال الرحلة.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={config.showOnStudentLogin !== false}
                onChange={(e) => setConfig((prev) => ({ ...prev, showOnStudentLogin: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Section 2: Small Cards Inside the Large Glass Card (البطاقات الصغيرة داخل البطاقة الكبيرة) */}
      <div className="rounded-3xl bg-[#0f0c22]/90 border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 font-['Tajawal']">
              <Award className="w-5 h-5 text-[#ffd700]" />
              <span>2. البطاقات الصغيرة داخل البطاقة الكبيرة (البطاقة 1، البطاقة 2...)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              يمكنك تسمية البطاقات وتعديل اسم كل دكتور، وظيفته، ووضع صورته (JPG / PNG) بكل سهولة.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddCard}
            id="btn-add-supervisor-card"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all shadow"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة بطاقة مشرف جديدة</span>
          </button>
        </div>

        {/* List of Supervisor Sub-Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {config.supervisors.map((card, idx) => (
            <div
              key={card.id}
              className="rounded-2xl bg-gradient-to-b from-[#13102c]/95 via-[#0c091d]/95 to-[#070512]/95 border-2 border-slate-700/80 hover:border-amber-500/80 p-5 shadow-lg relative space-y-4 group transition-all"
            >
              {/* Card Header with Label & Actions */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400 text-amber-300 font-black text-xs font-['Cairo'] shadow-sm">
                    {card.cardLabel || `البطاقة ${idx + 1}`}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    #{idx + 1}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    title="تحريك لأعلى"
                    disabled={idx === 0}
                    onClick={() => handleMoveCard(idx, 'up')}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="تحريك لأسفل"
                    disabled={idx === config.supervisors.length - 1}
                    onClick={() => handleMoveCard(idx, 'down')}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="حذف هذه البطاقة"
                    onClick={() => handleDeleteCard(card.id, card.cardLabel)}
                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-800 text-red-300 hover:text-white border border-red-800/60 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Photo & Upload Area */}
              <div className="flex items-center gap-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                {/* Photo Preview in Glowing Golden Ring */}
                <div className="relative shrink-0">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-[#ffd700] to-yellow-200 shadow-[0_0_15px_rgba(255,215,0,0.4)]">
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
                </div>

                {/* Upload Buttons */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor={`photo-upload-${card.id}`}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة (JPG / PNG)</span>
                    </label>
                    <input
                      id={`photo-upload-${card.id}`}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={(e) => handlePhotoUpload(card.id, e)}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const url = window.prompt('أدخل رابط الصورة (URL) المباشر:', card.imageUrl);
                        if (url && url.trim()) {
                          handleUpdateCardField(card.id, 'imageUrl', url.trim());
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>رابط URL</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    ضع الصورة بكل سهولة بصيغة JPG أو PNG لتظهر مباشرة داخل الإطار الذهبي.
                  </p>
                </div>
              </div>

              {/* Form Inputs for this Card */}
              <div className="space-y-3">
                {/* 1. Card Label (تسمية البطاقة: البطاقة 1، البطاقة 2...) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-amber-300 block mb-1">
                      تسمية البطاقة (مثال: البطاقة 1):
                    </label>
                    <input
                      type="text"
                      value={card.cardLabel}
                      onChange={(e) => handleUpdateCardField(card.id, 'cardLabel', e.target.value)}
                      placeholder="البطاقة 1"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-amber-300 font-bold text-xs outline-none"
                    />
                  </div>

                  {/* 2. Supervision Role (الصفة في الإشراف) */}
                  <div>
                    <label className="text-[11px] font-bold text-purple-300 block mb-1">
                      الصفة في الإشراف (الوسام):
                    </label>
                    <input
                      type="text"
                      value={card.role}
                      onChange={(e) => handleUpdateCardField(card.id, 'role', e.target.value)}
                      placeholder="مثال: رئيس لجنة الإشراف العلمي"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-purple-400 text-purple-200 text-xs outline-none"
                    />
                  </div>
                </div>

                {/* 3. Doctor's Name (اسم الدكتور / المشرف) */}
                <div>
                  <label className="text-[11px] font-bold text-white block mb-1">
                    اسم الأستاذ الدكتور / المشرف (يظهر بلون أبيض ناصع):
                  </label>
                  <input
                    type="text"
                    value={card.name}
                    onChange={(e) => handleUpdateCardField(card.id, 'name', e.target.value)}
                    placeholder="مثال: أ.د/ حسناء عبد العاطي الطباخ"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-white font-black text-sm outline-none"
                  />
                </div>

                {/* 4. Doctor's Job / Academic Position (وظيفة الدكتور) */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    الوظيفة والدرجة الأكاديمية (وظيفتهم):
                  </label>
                  <textarea
                    rows={2}
                    value={card.title}
                    onChange={(e) => handleUpdateCardField(card.id, 'title', e.target.value)}
                    placeholder="أستاذ تكنولوجيا التعليم ورئيس القسم بكلية التربية النوعية جامعة طنطا"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-slate-200 text-xs outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Bottom Controls (حفظ واستعادة) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[#0c091d] border border-slate-800">
        <button
          type="button"
          onClick={handleResetToDefault}
          className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>استعادة الضبط الافتراضي (مشرفي جامعة طنطا)</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Eye className="w-4 h-4 text-[#ffd700]" />
            <span>معاينة البطاقة الزجاجية</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex-1 sm:flex-none px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-[#ffd700] to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_25px_rgba(255,215,0,0.45)]"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>حفظ جميع التعديلات</span>
          </button>
        </div>
      </div>

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <SupervisorsHonorBoard
          isModal={true}
          onClose={() => setIsPreviewOpen(false)}
          onContinue={() => setIsPreviewOpen(false)}
          showContinueButton={true}
        />
      )}
    </div>
  );
};
