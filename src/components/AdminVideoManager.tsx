import React, { useState } from 'react';
import {
  Video,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  Play,
  Upload,
  Link,
  Layers,
  FileVideo,
  Clock,
  Sparkles,
  Save,
  X,
  ExternalLink,
} from 'lucide-react';
import { EducationalVideo, VideoSlotDef } from '../types';
import {
  VIDEO_SLOTS,
  getEducationalVideos,
  addEducationalVideo,
  updateEducationalVideo,
  deleteEducationalVideo,
} from '../utils/videoStorage';
import { addActivityLog } from '../utils/adminStorage';

export const AdminVideoManager: React.FC = () => {
  const [videos, setVideos] = useState<EducationalVideo[]>(() => getEducationalVideos());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<EducationalVideo | null>(null);
  const [previewVideo, setPreviewVideo] = useState<EducationalVideo | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetSlotId, setTargetSlotId] = useState(VIDEO_SLOTS[0].slotId);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoType, setVideoType] = useState<'youtube' | 'mp4' | 'embed' | 'file'>('youtube');
  const [duration, setDuration] = useState('05:00');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refreshVideos = () => {
    setVideos(getEducationalVideos());
  };

  const handleOpenAdd = (defaultSlotId?: string) => {
    setEditingVideo(null);
    setTitle('');
    setDescription('');
    setTargetSlotId(defaultSlotId || VIDEO_SLOTS[0].slotId);
    setVideoUrl('');
    setVideoType('youtube');
    setDuration('05:00');
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (v: EducationalVideo) => {
    setEditingVideo(v);
    setTitle(v.title);
    setDescription(v.description);
    setTargetSlotId(v.targetSlotId);
    setVideoUrl(v.videoUrl);
    setVideoType(v.videoType);
    setDuration(v.duration || '05:00');
    setFormError(null);
    setShowAddModal(true);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('يرجى إدخال اسم وعنوان الفيديو');
      return;
    }

    if (!videoUrl.trim()) {
      setFormError('يرجى إدخال رابط الفيديو (رابط يوتيوب أو ملف MP4 مباشر)');
      return;
    }

    if (editingVideo) {
      updateEducationalVideo(editingVideo.id, {
        title: title.trim(),
        description: description.trim(),
        targetSlotId,
        videoUrl: videoUrl.trim(),
        videoType,
        duration: duration.trim(),
      });
      addActivityLog(`تم تعديل الفيديو: "${title}" في موضع ${targetSlotId}`, 'المشرف', 'success');
      setSuccessMessage('تم تعديل بيانات الفيديو بنجاح!');
    } else {
      addEducationalVideo({
        title: title.trim(),
        description: description.trim(),
        targetSlotId,
        videoUrl: videoUrl.trim(),
        videoType,
        duration: duration.trim(),
        isActive: true,
      });
      addActivityLog(`تمت إضافة فيديو جديد: "${title}" في موضع ${targetSlotId}`, 'المشرف', 'success');
      setSuccessMessage('تمت إضافة الفيديو وربطه بالموضع المحدد بنجاح!');
    }

    refreshVideos();
    setShowAddModal(false);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleDelete = (v: EducationalVideo) => {
    if (confirm(`هل أنت متأكد من حذف الفيديو "${v.title}"؟`)) {
      deleteEducationalVideo(v.id);
      addActivityLog(`تم حذف الفيديو: "${v.title}"`, 'المشرف', 'warning');
      refreshVideos();
      setSuccessMessage('تم حذف الفيديو بنجاح');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 30MB for local base64/blob simulation
    if (file.size > 30 * 1024 * 1024) {
      alert('حجم الملف كبير جداً! يفضل استخدام روابط YouTube أو روابط استضافة سحابية للفيديوهات الكبيرة.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setVideoUrl(reader.result);
        setVideoType('mp4');
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 text-right font-['Cairo',_sans-serif]" id="admin-video-manager">
      {/* Header Overview Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/40 via-[#100d24] to-[#080612] border-2 border-blue-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full bg-blue-950 border border-blue-500/60 text-blue-300 text-xs font-bold flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-blue-400" />
              إدارة الفيديوهات التعليمية
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold">
              {videos.length} فيديو مفعل
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Tajawal']">
            إدارة ورفع الفيديوهات وتحديد مواضع ظهورها
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            يمكنك هنا رفع أو ربط مقاطع الفيديو وتحديد مكان ظهورها بدقة ليتسنى للطلاب مشاهدتها في المرحلة والمحتوى المخصص لها داخل بيئة Adobe Captivate 2019.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAdd()}
          className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة فيديو جديد وتحديد مكانه</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Slots Directory: Shows all predefined places on the site with status */}
      <div className="rounded-3xl bg-[#090714] border-2 border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-black text-white font-['Tajawal'] flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>دليل أماكن ومواضع الفيديوهات في المنصة (Target Slots)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              يوضح هذا الجدول اسم كل مكان متاح لوضع الفيديو، وحالته، والفيديو المرتبط به حالياً:
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">إجمالي المواضع: 12 موضعاً</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {VIDEO_SLOTS.map((slot) => {
            const linkedVideo = videos.find((v) => v.targetSlotId === slot.slotId);

            return (
              <div
                key={slot.slotId}
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between gap-3 transition-all ${
                  linkedVideo
                    ? 'bg-blue-950/20 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800 font-bold">
                      {slot.slotId}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        linkedVideo
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      {linkedVideo ? 'فيديو متاح ومتصل' : 'بانتظار فيديو'}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-white font-['Tajawal'] leading-snug">
                    {slot.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {slot.description}
                  </p>
                </div>

                {/* Linked Video Info or Add Action */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                  {linkedVideo ? (
                    <>
                      <div className="truncate">
                        <span className="text-[11px] font-bold text-amber-300 truncate block">
                          🎬 {linkedVideo.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {linkedVideo.duration} • {linkedVideo.videoType}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewVideo(linkedVideo)}
                          title="معاينة الفيديو"
                          className="p-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/60 text-blue-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(linkedVideo)}
                          title="تعديل الفيديو"
                          className="p-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/60 text-amber-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenAdd(slot.slotId)}
                      className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600/30 text-slate-400 hover:text-blue-300 font-bold text-xs border border-slate-800 hover:border-blue-500/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إرفاق فيديو لهذا الموضع</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Videos List Table */}
      <div className="rounded-3xl bg-[#090714] border-2 border-blue-500/40 p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <h3 className="text-base font-black text-white font-['Tajawal'] flex items-center gap-2">
            <FileVideo className="w-5 h-5 text-blue-400" />
            <span>قائمة الفيديوهات المسجلة في المنصة</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {videos.length} مقاطع فيديو
          </span>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            لا توجد فيديوهات مسجلة حالياً. اضغط على زر "إضافة فيديو جديد" بالأعلى لرفع وإرفاق الفيديوهات.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-['Cairo']">
                  <th className="pb-3 pr-2">عنوان الفيديو</th>
                  <th className="pb-3 pr-2">موضع الظهور الصحيح</th>
                  <th className="pb-3 pr-2">النوع والمدة</th>
                  <th className="pb-3 pr-2">تاريخ الإضافة</th>
                  <th className="pb-3 pr-2 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {videos.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 pr-2">
                      <div className="font-black text-white font-['Tajawal'] text-sm">{v.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{v.description}</div>
                    </td>
                    <td className="py-3 pr-2">
                      <span className="px-2.5 py-1 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-300 font-bold text-[11px] inline-block">
                        {v.targetSlotName}
                      </span>
                    </td>
                    <td className="py-3 pr-2 font-mono text-slate-300">
                      <div>{v.videoType.toUpperCase()}</div>
                      <div className="text-slate-500 text-[10px]">{v.duration || 'غير محدد'}</div>
                    </td>
                    <td className="py-3 pr-2 text-slate-400 font-mono text-[11px]">
                      {v.addedAt}
                    </td>
                    <td className="py-3 pr-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewVideo(v)}
                          title="معاينة الفيديو"
                          className="p-2 rounded-xl bg-blue-950/80 border border-blue-500/40 hover:bg-blue-600 text-blue-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(v)}
                          title="تعديل"
                          className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/40 hover:bg-amber-600 text-amber-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(v)}
                          title="حذف"
                          className="p-2 rounded-xl bg-red-950/80 border border-red-500/40 hover:bg-red-600 text-red-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Video Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0c0f20] border-2 border-blue-500/70 p-6 sm:p-8 text-right shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h3 className="text-lg font-black text-white font-['Tajawal'] flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-400" />
                <span>{editingVideo ? 'تعديل بيانات الفيديو وموضعه' : 'إضافة فيديو جديد وتحديد موضع ظهوره'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-500 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveVideo} className="space-y-4 text-right">
              {/* Target Slot (Crucial: Defines where the video goes) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-amber-300 font-['Cairo']">
                  🎯 تحديد موضع ظهور الفيديو في الموقع (المكان الصحيح):
                </label>
                <select
                  value={targetSlotId}
                  onChange={(e) => setTargetSlotId(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl bg-[#070914] text-white text-xs sm:text-sm border-2 border-[#ffd700]/70 focus:border-[#ffd700] focus:outline-none transition-colors"
                >
                  {VIDEO_SLOTS.map((s) => (
                    <option key={s.slotId} value={s.slotId}>
                      {s.name} ({s.slotId})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 block mt-1">
                  💡 سيظهر هذا الفيديو تلقائياً في الشاشة المحددة (سواء كانت مرحلة تعليمية أو مهمة تطبيقية).
                </span>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  اسم وعنوان الفيديو:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: شرح واجهة برنامج Captivate 2019 وأشرطة الأدوات"
                  className="w-full h-11 px-4 rounded-xl bg-[#070914] text-white text-sm border border-slate-700 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Video URL or File */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-200">
                  رابط الفيديو (YouTube أو رابط MP4 مباشر):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... أو رابط مباشر"
                    className="flex-1 h-11 px-4 rounded-xl bg-[#070914] text-white text-xs sm:text-sm border border-slate-700 focus:border-blue-500 focus:outline-none font-mono"
                  />
                  <label className="h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-700 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع ملف</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Duration and Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-200">
                    المدة الزمنية التقديرية (دقيقة:ثانية):
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="05:30"
                    className="w-full h-10 px-3 rounded-xl bg-[#070914] text-white text-xs border border-slate-700 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-200">
                    تصنيف مصدر الفيديو:
                  </label>
                  <select
                    value={videoType}
                    onChange={(e) => setVideoType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-[#070914] text-white text-xs border border-slate-700 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="youtube">YouTube Embed</option>
                    <option value="mp4">ملف فيديو MP4 مباشر</option>
                    <option value="embed">كود تضمين خارجي (Embed)</option>
                    <option value="file">ملف محلي مرفوع</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  وصف محتوى الفيديو والمهارات المستهدفة:
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب نبذة توضيحية عما سيتعلمه الطالب من هذا الفيديو..."
                  className="w-full p-3 rounded-xl bg-[#070914] text-white text-xs border border-slate-700 focus:border-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ ونشر الفيديو في الموضع المحدد</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl rounded-3xl bg-[#0c0f20] border-2 border-blue-500/80 p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-black text-white font-['Tajawal']">{previewVideo.title}</h3>
                <span className="text-xs text-amber-300 font-bold font-['Cairo']">
                  الموضع: {previewVideo.targetSlotName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕ إغلاق
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 mb-4">
              {previewVideo.videoType === 'youtube' || previewVideo.videoUrl.includes('youtube.com') || previewVideo.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={previewVideo.videoUrl}
                  title={previewVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={previewVideo.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                >
                  متصفحك لا يدعم تشغيل هذا الفيديو مباشرة.
                </video>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {previewVideo.description}
            </p>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
