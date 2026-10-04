import { EducationalVideo, VideoSlotDef } from '../types';

export const VIDEO_SLOTS: VideoSlotDef[] = [
  {
    slotId: 'level-1',
    name: 'المرحلة 1: مفهوم الوسائط المتعددة والتعليم الإلكتروني',
    levelNumber: 1,
    description: 'يظهر في شاشة المحتوى التعليمي للمرحلة الأولى لشرح المفاهيم الأساسية للوسائط.',
    recommendedDuration: '04:30',
  },
  {
    slotId: 'level-2',
    name: 'المرحلة 2: التعرف على واجهة Adobe Captivate 2019',
    levelNumber: 2,
    description: 'يظهر في شاشة المحتوى للمرحلة الثانية لشرح لوحات العمل والأدوات وقوائم البرنامج.',
    recommendedDuration: '06:15',
  },
  {
    slotId: 'level-3',
    name: 'المرحلة 3: إدارة وتصميم الشرائح والمشاهد التفاعلية',
    levelNumber: 3,
    description: 'يظهر في المرحلة الثالثة لشرح خصائص الشريحة والماستر سلايد والتنقل بين المشاهد.',
    recommendedDuration: '05:45',
  },
  {
    slotId: 'level-4',
    name: 'المرحلة 4: التعامل مع النصوص والأشكال والأزرار الذكية',
    levelNumber: 4,
    description: 'يظهر في المرحلة الرابعة لشرح إدراج النصوص وتنسيق الخطوط والأشكال الذكية Smart Shapes.',
    recommendedDuration: '06:00',
  },
  {
    slotId: 'level-5',
    name: 'المرحلة 5: إدراج وتنسيق الأصوات والصور الرقمية',
    levelNumber: 5,
    description: 'يظهر في المرحلة الخامسة لشرح مكتبة الوسائط وتسجيل الصوت وتحرير الصور في Captivate.',
    recommendedDuration: '05:20',
  },
  {
    slotId: 'level-6',
    name: 'المرحلة 6: التفاعلية المتقدمة وبرمجة الإجراءات (Actions)',
    levelNumber: 6,
    description: 'يظهر في المرحلة السادسة لشرح المشغلات التفاعلية والأزرار البرمجية والمتغيرات.',
    recommendedDuration: '07:10',
  },
  {
    slotId: 'level-7',
    name: 'المرحلة 7: الأنماط والمؤثرات البصرية وتأثيرات الحركة',
    levelNumber: 7,
    description: 'يظهر في المرحلة السابعة لشرح خط الزمن Timeline وتأثيرات الدخول والخروج والحركات.',
    recommendedDuration: '05:50',
  },
  {
    slotId: 'level-8',
    name: 'المرحلة 8: إدراج ومعالجة الفيديو التفاعلي والمحاكاة',
    levelNumber: 8,
    description: 'يظهر في المرحلة الثامنة لشرح دمج مقاطع الفيديو وإضافة نقاط التوقف والأسئلة التفاعلية التراكبية.',
    recommendedDuration: '08:00',
  },
  {
    slotId: 'level-9',
    name: 'المرحلة 9: بنوك الأسئلة والاختبارات التفاعلية والتقييم',
    levelNumber: 9,
    description: 'يظهر في المرحلة التاسعة لشرح إنشاء شرائح الأسئلة، إعداد الدرجات، وتصميم التغذية الراجعة.',
    recommendedDuration: '07:30',
  },
  {
    slotId: 'level-10',
    name: 'المرحلة 10: نشر وتصدير المشروع النهائي (HTML5 / SCORM)',
    levelNumber: 10,
    description: 'يظهر في المرحلة العاشرة لشرح معايير النشر على منصات LMS وتصدير حزم SCORM للويب.',
    recommendedDuration: '06:40',
  },
  {
    slotId: 'app-task',
    name: 'شاشة المهمة التطبيقية (Practical Application Task)',
    description: 'يظهر في شاشة المهام التطبيقية كشرح إرشادي مرئي لكيفية تنفيذ خطوات المهمة في Captivate خارج البيئة.',
    recommendedDuration: '05:00',
  },
  {
    slotId: 'general-intro',
    name: 'شاشة التمهيد العام للبيئة (Environment Guide)',
    description: 'يظهر في الصفحة التمهيدية أو شاشة التعليمات لشرح آليات اللعب ونظام النقاط والشارات.',
    recommendedDuration: '03:30',
  },
];

const VIDEOS_STORAGE_KEY = 'cp_educational_videos_v1';

// Initial educational videos seeding
const INITIAL_VIDEOS: EducationalVideo[] = [
  {
    id: 'vid-1',
    title: 'مقدمة في إنتاج وتصميم الوسائط المتعددة',
    description: 'شرح مفصل لمفهوم الوسائط المتعددة، مكوناتها الرقمية، ودورها في تعزيز التقبل التكنولوجي وتصميم المحتوى التفاعلي.',
    targetSlotId: 'level-1',
    targetSlotName: 'المرحلة 1: مفهوم الوسائط المتعددة والتعليم الإلكتروني',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Standard embed
    videoType: 'youtube',
    duration: '04:30',
    addedAt: '2026-03-01 10:00',
    isActive: true,
  },
  {
    id: 'vid-2',
    title: 'جولة استكشافية في واجهة Adobe Captivate 2019',
    description: 'استعراض أشرطة الأدوات العلوية، نافذة الشرائح Filmstrip، لوحة الخصائص Properties، ومكتبة العناصر Library.',
    targetSlotId: 'level-2',
    targetSlotName: 'المرحلة 2: التعرف على واجهة Adobe Captivate 2019',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoType: 'youtube',
    duration: '06:15',
    addedAt: '2026-03-01 10:30',
    isActive: true,
  },
  {
    id: 'vid-3',
    title: 'إدارة وتخطيط الشرائح والمشاهد في كابتيفيت',
    description: 'كيفية إنشاء شريحة فارغة، ضبط التوقيت، استخدام الماستر سلايد، وتنظيم تسلسل المحتوى التعليمي.',
    targetSlotId: 'level-3',
    targetSlotName: 'المرحلة 3: إدارة وتصميم الشرائح والمشاهد التفاعلية',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoType: 'youtube',
    duration: '05:45',
    addedAt: '2026-03-01 11:00',
    isActive: true,
  },
  {
    id: 'vid-8',
    title: 'تقنيات الفيديو التفاعلي في Adobe Captivate',
    description: 'شرح إدراج مقاطع الفيديو، إنشاء نقاط المعاينة Bookmarks، وتركيب أسئلة التحقق المعرفي على الفيديو.',
    targetSlotId: 'level-8',
    targetSlotName: 'المرحلة 8: إدراج ومعالجة الفيديو التفاعلي والمحاكاة',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoType: 'youtube',
    duration: '08:00',
    addedAt: '2026-03-01 12:00',
    isActive: true,
  },
  {
    id: 'vid-task',
    title: 'دليل تنفيذ المهمة التطبيقية العملية',
    description: 'خطوات إنجاز السيناريو العملي خطوة بخطوة في برنامج Captivate وتجهيز ملف المشروع للتسليم.',
    targetSlotId: 'app-task',
    targetSlotName: 'شاشة المهمة التطبيقية (Practical Application Task)',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoType: 'youtube',
    duration: '05:00',
    addedAt: '2026-03-01 13:00',
    isActive: true,
  },
];

export function getEducationalVideos(): EducationalVideo[] {
  try {
    const raw = localStorage.getItem(VIDEOS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(INITIAL_VIDEOS));
      return INITIAL_VIDEOS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_VIDEOS;
  }
}

export function saveEducationalVideos(videos: EducationalVideo[]): void {
  localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(videos));
}

export function getVideoBySlot(slotId: string): EducationalVideo | undefined {
  const all = getEducationalVideos();
  return all.find((v) => v.targetSlotId === slotId && v.isActive);
}

export function addEducationalVideo(
  videoData: Omit<EducationalVideo, 'id' | 'addedAt' | 'targetSlotName'>
): EducationalVideo {
  const all = getEducationalVideos();
  const slotDef = VIDEO_SLOTS.find((s) => s.slotId === videoData.targetSlotId);

  const newVideo: EducationalVideo = {
    ...videoData,
    id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    targetSlotName: slotDef ? slotDef.name : videoData.targetSlotId,
    videoUrl: normalizeVideoUrl(videoData.videoUrl),
    addedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  // Replace any existing video in the same slot or add to list
  const filtered = all.filter((v) => v.targetSlotId !== videoData.targetSlotId);
  filtered.unshift(newVideo);
  saveEducationalVideos(filtered);
  return newVideo;
}

export function updateEducationalVideo(
  id: string,
  updates: Partial<Omit<EducationalVideo, 'id' | 'addedAt'>>
): EducationalVideo | null {
  const all = getEducationalVideos();
  const index = all.findIndex((v) => v.id === id);
  if (index === -1) return null;

  let slotName = all[index].targetSlotName;
  if (updates.targetSlotId) {
    const slotDef = VIDEO_SLOTS.find((s) => s.slotId === updates.targetSlotId);
    if (slotDef) slotName = slotDef.name;
  }

  const updated: EducationalVideo = {
    ...all[index],
    ...updates,
    targetSlotName: slotName,
    videoUrl: updates.videoUrl ? normalizeVideoUrl(updates.videoUrl) : all[index].videoUrl,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  all[index] = updated;
  saveEducationalVideos(all);
  return updated;
}

export function deleteEducationalVideo(id: string): boolean {
  const all = getEducationalVideos();
  const filtered = all.filter((v) => v.id !== id);
  if (filtered.length !== all.length) {
    saveEducationalVideos(filtered);
    return true;
  }
  return false;
}

/**
 * Normalizes YouTube URLs into proper embed iframe URLs
 */
export function normalizeVideoUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  // YouTube watch URL: https://www.youtube.com/watch?v=XXXX
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}?rel=0&modestbranding=1`;
  }

  return trimmed;
}
