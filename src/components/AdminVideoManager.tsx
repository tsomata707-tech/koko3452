import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Play,
  Upload,
  Link as LinkIcon,
  FileVideo,
  Clock,
  Sparkles,
  Save,
  X,
  RefreshCw,
  HardDrive,
  Globe,
} from 'lucide-react';
import { EducationalVideo, VideoSlotDef } from '../types';
import {
  VIDEO_SLOTS,
  getEducationalVideos,
  addEducationalVideo,
  updateEducationalVideo,
  deleteEducationalVideo,
  rehydrateLocalVideoUrls,
} from '../utils/videoStorage';
import { storeVideoBlob } from '../utils/indexedDbVideo';
import { addActivityLog } from '../utils/adminStorage';

export const AdminVideoManager: React.FC = () => {
  const [videos, setVideos] = useState<EducationalVideo[]>(() => getEducationalVideos());
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<EducationalVideo | null>(null);

  // Upload Mode: 'file' (from device) or 'url' (web link / youtube)
  const [uploadSource, setUploadSource] = useState<'file' | 'url'>('file');

  // Form State (Only Video Name and Target Slot - NO description!)
  const [title, setTitle] = useState('');
  const [targetSlotId, setTargetSlotId] = useState(VIDEO_SLOTS[0].slotId);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoType, setVideoType] = useState<'youtube' | 'mp4' | 'file'>('file');
  const [duration, setDuration] = useState('04:00');
  const [blobId, setBlobId] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | null>(null);

  // Processing & Feedback State
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isProcessingLevel1, setIsProcessingLevel1] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const level1FileInputRef = useRef<HTMLInputElement>(null);

  // Level 1 specific video
  const level1Video = videos.find((v) => v.targetSlotId === 'level-1' && v.isActive);

  // Re-hydrate any IndexedDB blobs on component mount
  useEffect(() => {
    rehydrateLocalVideoUrls().then((refreshed) => {
      setVideos(refreshed);
    });

    const handleUpdate = () => {
      setVideos(getEducationalVideos());
    };
    window.addEventListener('videos-storage-updated', handleUpdate);
    return () => window.removeEventListener('videos-storage-updated', handleUpdate);
  }, []);

  const refreshVideos = () => {
    setVideos(getEducationalVideos());
  };

  // 🌟 Dedicated Handler for Level 1 Upload from Device
  const handleLevel1DeviceFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingLevel1(true);
    setFormError(null);

    try {
      const generatedBlobId = `blob_lvl1_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const objectUrl = await storeVideoBlob(generatedBlobId, file, file.name);

      // Detect duration
      let detectedDuration = '04:30';
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = objectUrl;

      await new Promise<void>((resolve) => {
        tempVideo.onloadedmetadata = () => {
          const totalSecs = Math.round(tempVideo.duration || 0);
          if (totalSecs > 0) {
            const mins = Math.floor(totalSecs / 60);
            const secs = totalSecs % 60;
            detectedDuration = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
          }
          resolve();
        };
        tempVideo.onerror = () => resolve();
        setTimeout(resolve, 1500);
      });

      const slotDef = VIDEO_SLOTS.find((s) => s.slotId === 'level-1');
      const targetSlotName = slotDef ? slotDef.name : 'المستوى 1: أساسيات الوسائط وتثبيت Adobe Captivate 2019';

      addEducationalVideo({
        title: 'مقدمة في إنتاج وتصميم الوسائط المتعددة',
        targetSlotId: 'level-1',
        videoUrl: objectUrl,
        videoType: 'file',
        duration: detectedDuration,
        blobId: generatedBlobId,
        isActive: true,
      });

      addActivityLog(
        `قام المشرف برفع فيديو المرحلة 1 (مقدمة في إنتاج وتصميم الوسائط المتعددة) من جهازه: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
        'المشرف',
        'success'
      );

      setSuccessMessage(
        `✅ تم رفع ونشر فيديو المستوى 1: "مقدمة في إنتاج وتصميم الوسائط المتعددة" بنجاح من جهازك (${file.name})! متاح الآن لجميع الطلاب في اللعبة وخريطة التعلم.`
      );

      refreshVideos();
      setIsProcessingLevel1(false);
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch {
      setIsProcessingLevel1(false);
      setFormError('حدث خطأ أثناء رفع ملف الفيديو من الجهاز، يرجى المحاولة مرة ثانية.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Open modal in initial clean state
  const handleOpenAdd = (defaultSlotId?: string) => {
    const slot = defaultSlotId || VIDEO_SLOTS[0].slotId;
    const slotObj = VIDEO_SLOTS.find((s) => s.slotId === slot);

    setTitle(slot === 'level-1' ? 'مقدمة في إنتاج وتصميم الوسائط المتعددة' : slotObj ? `فيديو شرح ${slotObj.name.split(':')[0]}` : '');
    setTargetSlotId(slot);
    setVideoUrl('');
    setUploadSource('file');
    setVideoType('file');
    setDuration(slotObj?.recommendedDuration || '05:00');
    setBlobId(undefined);
    setFileName(null);
    setFormError(null);
    setShowAddModal(true);
  };

  // 🌟 Self-Configuring / Automatic File Selection from Device
  const handleDeviceFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setFormError(null);

    try {
      // 1. Automatic Title generation from clean file name
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
      setFileName(file.name);
      setVideoType('file');

      // 2. Automatically store video blob in IndexedDB for persistent storage
      const generatedBlobId = `blob_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const objectUrl = await storeVideoBlob(generatedBlobId, file, file.name);
      setVideoUrl(objectUrl);
      setBlobId(generatedBlobId);

      // 3. Automatically detect video duration using hidden video element
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = objectUrl;

      tempVideo.onloadedmetadata = () => {
        const totalSecs = Math.round(tempVideo.duration || 0);
        if (totalSecs > 0) {
          const mins = Math.floor(totalSecs / 60);
          const secs = totalSecs % 60;
          const formattedDuration = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
          setDuration(formattedDuration);
        }
      };

      setIsProcessingFile(false);
    } catch {
      setIsProcessingFile(false);
      setFormError('حدث خطأ أثناء تجهيز ملف الفيديو من الجهاز، يرجى المحاولة مرة ثانية.');
    }
  };

  // 🌟 Automatic URL Handling
  const handleUrlChange = (url: string) => {
    setVideoUrl(url);
    const trimmed = url.trim();

    if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      setVideoType('youtube');
    } else {
      setVideoType('mp4');
    }

    // Auto-fill title if empty
    if (!title) {
      const slotObj = VIDEO_SLOTS.find((s) => s.slotId === targetSlotId);
      if (slotObj) {
        setTitle(`فيديو ${slotObj.name}`);
      }
    }
  };

  // 🌟 Upload & Publish Button Handler
  const handlePublishVideo = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const finalTitle = title.trim();
    if (!finalTitle) {
      setFormError('يرجى كتابة اسم الفيديو أو اختيار ملف من الجهاز لتعيين الاسم ذاتياً.');
      return;
    }

    if (!videoUrl.trim()) {
      if (uploadSource === 'file') {
        setFormError('يرجى اختيار ملف فيديو من جهازك أولاً ليتم رفعه ونشره.');
      } else {
        setFormError('يرجى إدخال رابط الفيديو (YouTube أو رابط MP4 مباشر).');
      }
      return;
    }

    setIsPublishing(true);

    try {
      const slotDef = VIDEO_SLOTS.find((s) => s.slotId === targetSlotId);
      const slotName = slotDef ? slotDef.name : targetSlotId;

      addEducationalVideo({
        title: finalTitle,
        targetSlotId,
        videoUrl: videoUrl.trim(),
        videoType,
        duration: duration.trim() || '05:00',
        blobId,
        isActive: true,
      });

      addActivityLog(`تم رفع ونشر فيديو: "${finalTitle}" في ${slotName}`, 'المشرف', 'success');

      // Success Notification
      setSuccessMessage(`✅ تم رفع ونشر الفيديو بنجاح! أصبح الفيديو متاحاً الآن لجميع الطلاب في: ${slotName}`);
      refreshVideos();
      setIsPublishing(false);
      setShowAddModal(false);

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch {
      setIsPublishing(false);
      setFormError('حدث خطأ أثناء نشر الفيديو، يرجى المحاولة مرة أخرى.');
    }
  };

  const handleDelete = (v: EducationalVideo) => {
    if (confirm(`هل أنت متأكد من حذف الفيديو "${v.title}"؟`)) {
      deleteEducationalVideo(v.id);
      addActivityLog(`تم حذف الفيديو: "${v.title}"`, 'المشرف', 'warning');
      refreshVideos();
      setSuccessMessage(`تم حذف الفيديو "${v.title}" بنجاح.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 text-right font-['Cairo',_sans-serif]" id="admin-video-manager">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#171330] via-[#100c24] to-[#0a0817] border-2 border-[#ffd700]/70 p-6 sm:p-8 shadow-[0_0_35px_rgba(212,175,55,0.25)] relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-28 bg-[#ffd700]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.45)] shrink-0">
              <Video className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400 text-blue-300 text-xs font-black">
                  إدارة ورفع الفيديوهات
                </span>
                <span className="text-xs text-amber-200 flex items-center gap-1 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
                  <span>رفع من الجهاز أو عبر رابط URL بنقرة واحدة</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 font-['Tajawal']">
                رفع ونشر الفيديوهات التعليمية للطلاب
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                اختر فيديو من جهازك أو ضع رابط يوتيوب وسيقوم النظام بكل شيء ذاتياً لنشره فوراً للطلاب.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => handleOpenAdd()}
              id="btn-open-upload-video-modal"
              className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(37,99,235,0.5)] border-2 border-blue-400/60 cursor-pointer transition-all transform hover:-translate-y-0.5"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>+ رفع فيديو جديد ونشره</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Success Banner Notification */}
      {successMessage && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#0d2a1d]/90 to-emerald-950/90 border-2 border-emerald-400 text-emerald-200 text-xs sm:text-sm font-black flex items-center justify-between gap-3 shadow-[0_0_30px_rgba(16,185,129,0.35)] animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-white text-xs underline cursor-pointer shrink-0"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* 2.5. SPECIAL LEVEL 1 SPOTLIGHT CARD: المستوى 1: أساسيات الوسائط وتثبيت Adobe Captivate 2019 */}
      <div className="rounded-3xl bg-gradient-to-br from-[#12102e] via-[#0e0c24] to-[#070517] border-2 border-[#ffd700] p-6 sm:p-8 shadow-[0_0_40px_rgba(255,215,0,0.25)] space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-1/3 w-80 h-32 bg-[#ffd700]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#ffd700] text-slate-950 font-black text-xs font-['Cairo'] shadow-sm">
                المستوى 1: المرحلة الحالية المطلوبة
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-950/80 border border-blue-400 text-blue-300 text-xs font-bold font-['Cairo']">
                فيديو المرحلة: مقدمة في إنتاج وتصميم الوسائط المتعددة
              </span>
              {level1Video?.videoType === 'file' ? (
                <span className="px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-xs font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>فيديو مرفوع من جهازك ونشط 🟢</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-bold">
                  جاهز لرفع الفيديو من جهازك 📤
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white font-['Tajawal'] mt-1">
              المستوى 1: أساسيات الوسائط وتثبيت Adobe Captivate 2019
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-['Cairo'] leading-relaxed">
              الفيديو المخصص للمرحلة الأولى: <strong className="text-amber-300">«مقدمة في إنتاج وتصميم الوسائط المتعددة»</strong>. ارفع من جهازك الفيديو الخاص والصحيح بصيغة MP4 أو WebM، وسيعمل فوراً للطلاب في اللعبة التفاعلية وخريطة التعلم!
            </p>
          </div>

          {/* Quick Upload Buttons from Device */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              type="button"
              disabled={isProcessingLevel1}
              onClick={() => level1FileInputRef.current?.click()}
              id="btn-upload-level1-device"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-emerald-300 cursor-pointer transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isProcessingLevel1 ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري رفع ومعالجة الفيديو من جهازك...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                  <span>رفع الفيديو الخاص من جهازك الآن 💻</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleOpenAdd('level-1')}
              className="px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>أو إدخال رابط</span>
            </button>

            <input
              ref={level1FileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska,video/*"
              onChange={handleLevel1DeviceFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Video Player & Verification Area for Level 1 */}
        {level1Video && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Player Preview */}
            <div className="lg:col-span-7">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border-2 border-[#ffd700]/60 shadow-[0_0_25px_rgba(255,215,0,0.2)]">
                {level1Video.videoType === 'youtube' ||
                level1Video.videoUrl.includes('youtube.com') ||
                level1Video.videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={level1Video.videoUrl}
                    title={level1Video.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={level1Video.videoUrl}
                    controls
                    preload="metadata"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>

            {/* Video Metadata & Controls */}
            <div className="lg:col-span-5 space-y-4 text-right">
              <div className="p-4 rounded-2xl bg-[#090714] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs text-slate-400 font-bold">حالة فيديو المرحلة 1:</span>
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>متاح ويعمل للطلاب 100%</span>
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">العنوان الرسمي:</span>
                    <span className="font-bold text-white">{level1Video.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">المدة الزمنية:</span>
                    <span className="font-mono text-[#ffd700] font-bold">{level1Video.duration || '04:30'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">نوع ومصدر الملف:</span>
                    <span className="font-mono text-cyan-300">
                      {level1Video.videoType === 'file' ? 'ملف محلي مخزن بـ IndexedDB' : 'رابط ويب خارجي'}
                    </span>
                  </div>
                  {level1Video.updatedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">آخر تحديث:</span>
                      <span className="font-mono text-slate-400">{level1Video.updatedAt}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => level1FileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-[#ffd700]/50 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>تغيير واستبدال الملف بملف آخر من الجهاز</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewVideo(level1Video)}
                  className="py-2.5 px-4 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-500/50 text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>ملء الشاشة</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Published Videos Table */}
      <div className="rounded-3xl bg-[#0f0c22]/90 border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 font-['Tajawal']">
              <Play className="w-5 h-5 text-[#ffd700]" />
              <span>قائمة الفيديوهات المنشورة للطلاب</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              الفيديوهات النشطة المتاحة للطلاب في مراحل وخريطة التعلم.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 font-bold">
              إجمالي {videos.length} فيديوهات منشورة
            </span>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-3 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
            <Video className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm font-bold">لا توجد فيديوهات منشورة حالياً.</p>
            <p className="text-xs text-slate-500">
              اضغط على زر <strong>"+ رفع فيديو جديد ونشره"</strong> بالأعلى للبدء.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-['Cairo']">
                  <th className="pb-3 pr-3">اسم الفيديو</th>
                  <th className="pb-3 pr-3">موضع الظهور المحدد</th>
                  <th className="pb-3 pr-3">مصدر الفيديو</th>
                  <th className="pb-3 pr-3">المدة</th>
                  <th className="pb-3 pr-3">حالة النشر</th>
                  <th className="pb-3 pr-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {videos.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-900/50 transition-colors">
                    {/* Only Video Name (No description!) */}
                    <td className="py-4 pr-3 font-bold text-white text-xs sm:text-sm font-['Tajawal']">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-500/40 text-blue-300 flex items-center justify-center shrink-0">
                          <Play className="w-4 h-4 fill-blue-300/40" />
                        </div>
                        <span className="leading-snug">{v.title}</span>
                      </div>
                    </td>

                    {/* Slot Name */}
                    <td className="py-4 pr-3">
                      <span className="px-3 py-1 rounded-xl bg-blue-950/70 border border-blue-500/40 text-blue-300 font-bold text-[11px] inline-block">
                        {v.targetSlotName}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-4 pr-3">
                      {v.videoType === 'file' ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold flex items-center gap-1 w-fit">
                          <HardDrive className="w-3 h-3" />
                          <span>من جهازك</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-lg bg-purple-950/80 border border-purple-500/50 text-purple-300 text-[10px] font-bold flex items-center gap-1 w-fit">
                          <Globe className="w-3 h-3" />
                          <span>رابط خارجي</span>
                        </span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-4 pr-3 font-mono text-slate-300 text-xs">
                      {v.duration || '05:00'}
                    </td>

                    {/* Status */}
                    <td className="py-4 pr-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400 text-emerald-300 text-[11px] font-black flex items-center gap-1.5 w-fit">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>منشور ونشط</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 pr-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewVideo(v)}
                          title="معاينة وتشغيل الفيديو"
                          className="px-3 py-1.5 rounded-xl bg-blue-950/80 border border-blue-500/50 hover:bg-blue-600 text-blue-300 hover:text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>تشغيل</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(v)}
                          title="حذف هذا الفيديو"
                          className="p-1.5 rounded-xl bg-red-950/60 border border-red-500/40 hover:bg-red-800 text-red-300 hover:text-white cursor-pointer transition-colors"
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

      {/* 4. MODAL: رفع الفيديو والنشر الفوري (URL أو من الجهاز + ذاتي بالكامل + بدون وصف) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0c0f20] border-2 border-blue-500/70 p-6 sm:p-8 text-right shadow-2xl overflow-y-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/60 text-blue-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-['Tajawal']">
                    رفع ونشر فيديو جديد
                  </h3>
                  <p className="text-xs text-slate-400">
                    اختر الفيديو من جهازك أو ضع رابطه، وسيقوم النظام بتجهيزه ذاتياً للنشر.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3.5 mb-4 rounded-xl bg-red-950/80 border-2 border-red-500 text-red-200 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handlePublishVideo} className="space-y-5 text-right">
              {/* Dual Source Switcher (من الجهاز أو رابط URL) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-amber-300">
                  اختر طريقة إرفاق الفيديو:
                </label>
                <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-slate-900/90 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadSource('file');
                      setVideoType('file');
                    }}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      uploadSource === 'file'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <HardDrive className="w-4 h-4" />
                    <span>فيديو من جهازك (MP4 / WebM)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadSource('url');
                      setVideoType('youtube');
                    }}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      uploadSource === 'url'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.35)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>رابط فيديو (YouTube / مباشر)</span>
                  </button>
                </div>
              </div>

              {/* Source Option A: Upload from Device */}
              {uploadSource === 'file' && (
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#111933] to-[#0a1024] border-2 border-dashed border-emerald-400/60 hover:border-emerald-400 cursor-pointer text-center space-y-3 transition-all hover:bg-slate-900 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner group-hover:scale-105 transition-transform">
                      <Upload className="w-8 h-8 stroke-[2.2]" />
                    </div>

                    <div>
                      <h4 className="text-sm sm:text-base font-black text-white font-['Tajawal']">
                        اضغط هنا لاختيار ملف الفيديو من جهازك
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">
                        يدعم صيغ MP4 و WebM و MOV. سيقوم النظام ذاتياً بحساب المدة واستخراج الاسم.
                      </p>
                    </div>

                    {fileName ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold font-mono">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>الملف المختار: {fileName}</span>
                      </div>
                    ) : (
                      <span className="inline-block px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
                        تصفح ملفات جهازك الآن
                      </span>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                      onChange={handleDeviceFileSelect}
                      className="hidden"
                    />
                  </div>

                  {isProcessingFile && (
                    <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/60 text-blue-200 text-xs flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                      <span>جاري معالجة الفيديو وحساب مدته ذاتياً...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Source Option B: URL Link */}
              {uploadSource === 'url' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-200">
                    رابط الفيديو (YouTube أو رابط MP4 مباشر):
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... أو رابط مباشر"
                      className="w-full h-12 pr-11 pl-4 rounded-xl bg-[#070914] text-white text-xs sm:text-sm border-2 border-slate-700 focus:border-blue-500 focus:outline-none font-mono"
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 right-3.5 text-slate-400 pointer-events-none">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    💡 يدعم روابط يوتيوب (العادية أو Shorts أو التضمين) وروابط ملفات MP4 المباشرة.
                  </span>
                </div>
              )}

              {/* Video Title (Name) - ONLY Title, NO description! */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  اسم الفيديو (تم تعيينه ذاتياً ويمكنك تعديله):
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="اسم الفيديو"
                  className="w-full h-12 px-4 rounded-xl bg-[#070914] text-white text-sm font-bold border-2 border-slate-700 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Target Slot (Defined automatically with option to pick) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-amber-300">
                  موضع ظهور الفيديو (الشاشة أو المرحلة المخصصة):
                </label>
                <select
                  value={targetSlotId}
                  onChange={(e) => setTargetSlotId(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl bg-[#070914] text-white text-xs sm:text-sm border-2 border-[#ffd700]/70 focus:border-[#ffd700] focus:outline-none cursor-pointer"
                >
                  {VIDEO_SLOTS.map((s) => (
                    <option key={s.slotId} value={s.slotId}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration (Auto-calculated from video, or editable) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  المدة الزمنية (محسوبة ذاتياً):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="05:00"
                    className="w-32 h-10 px-3 rounded-xl bg-[#070914] text-white text-xs border border-slate-700 font-mono text-center"
                  />
                  <span className="text-[11px] text-slate-400">دقيقة : ثانية</span>
                </div>
              </div>

              {/* Instant Mini Player Preview (if videoUrl is present) */}
              {videoUrl && (
                <div className="p-3 rounded-2xl bg-black/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>معاينة الفيديو الفورية قبل النشر:</span>
                    </span>
                    <span className="font-mono text-[11px]">{duration}</span>
                  </div>

                  <div className="relative aspect-video max-h-44 rounded-xl overflow-hidden bg-black border border-slate-700 mx-auto">
                    {videoType === 'youtube' || videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                      <iframe
                        src={videoUrl.replace('/watch?v=', '/embed/')}
                        title="معاينة الفيديو"
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    ) : (
                      <video src={videoUrl} controls className="w-full h-full object-contain" />
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons: Cancel and Upload & Publish Now */}
              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isPublishing || isProcessingFile}
                  id="btn-confirm-upload-publish-video"
                  className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-emerald-400 flex items-center justify-center gap-2.5 cursor-pointer transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري الرفع والنشر...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 stroke-[2.5]" />
                      <span>رفع الفيديو ونشره الآن</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Fullscreen Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl rounded-3xl bg-[#090b1c] border-2 border-blue-500/70 p-5 sm:p-7 text-right shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-xs text-amber-300 font-bold font-mono">
                  {previewVideo.targetSlotName}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white font-['Tajawal'] mt-0.5">
                  {previewVideo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border-2 border-slate-800 shadow-2xl">
              {previewVideo.videoType === 'youtube' ||
              previewVideo.videoUrl.includes('youtube.com') ||
              previewVideo.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={previewVideo.videoUrl}
                  title={previewVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={previewVideo.videoUrl} controls autoPlay className="w-full h-full object-contain" />
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">المدة: {previewVideo.duration || '05:00'}</span>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
