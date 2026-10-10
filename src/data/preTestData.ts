import { PreTestQuestion, PreTestResult, StudentGameProgress } from '../types';
import { getAllStudentsProgress, saveAllStudentsProgress } from '../utils/gameStorage';
import { addActivityLog } from '../utils/adminStorage';

const PRETEST_QUESTIONS_KEY = 'cp_pretest_questions_bank_v1';

export const DEFAULT_PRETEST_QUESTIONS: PreTestQuestion[] = [
  {
    id: 'pt-1',
    question: 'ما هو المفهوم الأساسي للوسائط المتعددة التفاعلية (Interactive Multimedia) في بيئات التعلم؟',
    options: [
      'عرض نصوص ثابتة ومطبوعة فقط دون أي حركة',
      'دمج النص والصوت والصورة والفيديو تحت تحكم وتفاعل المتعلم النشط',
      'مقاطع فيديو طويلة دون إمكانية إيقافها أو التحكم فيها',
      'تسجيلات صوتية بحتة دون مؤثرات بصرية'
    ],
    correctIndex: 1,
    explanation: 'الوسائط المتعددة التفاعلية هي منظومة رقمية متكاملة تدمج عناصر متعددة (نص، صوت، صورة، فيديو) مع إعطاء المتعلم القدرة على التحكم والتفاعل مع المحتوى.',
    points: 50,
  },
  {
    id: 'pt-2',
    question: 'ما هي الميزة الأساسية لإنشاء "مشروع متجاوب" (Responsive Project) في Adobe Captivate 2019؟',
    options: [
      'التشغيل حصرياً على الحواسيب المكتبية فقط',
      'التكيف التلقائي مع مختلف قياسات الشاشات والهواتف الذكية والأجهزة اللوحية',
      'إلغاء الحاجة إلى استخدام أي وسائط بصرية',
      'تحويل المشروع تلقائياً إلى ملف نصي Word'
    ],
    correctIndex: 1,
    explanation: 'المشروعات المتجاوبة تعتمد على تقنية Fluid Boxes لتعديل موضع وحجم العناصر تلقائياً ليتناسب العرض مع شاشات الهواتف والأجهزة اللوحية والمكتبية.',
    points: 50,
  },
  {
    id: 'pt-3',
    question: 'أي من العناصر التالية يُستخدم لربط استجابة المتعلم بتنفيذ إجراء (Action) مثل الانتقال لشريحة أخرى؟',
    options: [
      'الأزرار التفاعلية (Buttons) ومربعات النقر (Click Boxes)',
      'الخلفية اللونية الثابتة للشريحة',
      'اسم المشروع في شريط العنوان',
      'مقياس التكبير والتصغير (Zoom Level)'
    ],
    correctIndex: 0,
    explanation: 'الأزرار ومربعات النقر والأشكال الذكية التفاعلية هي الأدوات التي تستقبل نقرات المتعلم وتنفذ أوامر الانتقال والتحكم في مسار التعلم.',
    points: 50,
  },
  {
    id: 'pt-4',
    question: 'ما هو الغرض الرئيسي من ميزة Fluid Boxes في Adobe Captivate 2019؟',
    options: [
      'حاويات ذكية تنظم العناصر تلقائياً وتضمن عدم تداخلها عند تغير حجم الشاشة',
      'تشفير كلمات المرور الخاصة بالمستخدمين',
      'ضغط الملفات الصوتية فقط لتقليل الحجم',
      'حذف الشرائح غير المستخدمة'
    ],
    correctIndex: 0,
    explanation: 'مربعات الانسيابية (Fluid Boxes) توفر شبكة مرنة تضم العناصر وتتحكم في تدفقها رأسياً أو أفقياً لضمان تجربة عرض مثالية على جميع الأجهزة.',
    points: 50,
  },
  {
    id: 'pt-5',
    question: 'عند إضافة ملف صوتي لشريحة معينة، ما هي اللوحة التي تتيح تسجيل الصوت وتحريره بدقة داخل البرنامج؟',
    options: [
      'لوحة الخطوط والنصوص (Fonts)',
      'لوحة الصوت (Audio Editor / Audio Panel)',
      'مدير ملفات الويندوز الخارجي',
      'قائمة التعليمات والمساعدة'
    ],
    correctIndex: 1,
    explanation: 'لوحة محرر الصوت في Adobe Captivate تتيح التسجيل المباشر عبر الميكروفون، القص، إزالة الضوضاء، ومزامنة الصوت مع العناصر في الـ Timeline.',
    points: 50,
  },
  {
    id: 'pt-6',
    question: 'ما هو المعيار العالمي الأبرز لتصدير حزم المحتوى الإلكتروني التفاعلي لتعمل بكفاءة على منصات LMS؟',
    options: [
      'معيار SCORM / xAPI في حزمة مضغوطة تعمل بـ HTML5',
      'ملف نصي بامتداد TXT فقط',
      'صورة مفردة بامتداد PNG',
      'ملف صوتي خام بدون كود'
    ],
    correctIndex: 0,
    explanation: 'معيار SCORM (1.2 / 2004) هو المعيار القياسي لإدارة التعلم الذي يتيح تتبع درجات الطلاب ووقت المشاهدة ونسب الإكمال عبر منصات LMS.',
    points: 50,
  },
  {
    id: 'pt-7',
    question: 'ما فائدة "المتغيرات" (Variables) والإجراءات المتقدمة (Advanced Actions) في كابتيفايت؟',
    options: [
      'بناء مسارات تفاعلية مخصصة وحساب الدرجات وإظهار تغذية راجعة شرطية',
      'تغيير لغة نظام ويندوز بالكامل',
      'إلغاء تثبيت البرامج من الحاسب',
      'طباعة الشرائح على طابعة ورقية فقط'
    ],
    correctIndex: 0,
    explanation: 'المتغيرات تخزن بيانات المتعلم (مثل الاسم، الدرجات، الإجابات)، والإجراءات المتقدمة تتيح برمجة الشروط (If... Else) لتقديم مسارات وتغذية راجعة متمايزة.',
    points: 50,
  },
  {
    id: 'pt-8',
    question: 'في بنك الأسئلة والاختبارات، ما هو الخيار الذي يمنع الطالب من التخمين العشوائي ويقيس التعلم الحقيقي؟',
    options: [
      'عشوائية ترتيب الأسئلة والخيارات وتحديد عدد المحاولات لكل سؤال',
      'عرض الإجابة الصحيحة مباشرة قبل اختيار الطالب',
      'إلغاء احتساب أي درجات',
      'جعل جميع الخيارات متطابقة'
    ],
    correctIndex: 0,
    explanation: 'خلط الأسئلة والخيارات عشوائياً (Shuffle Questions & Options) وضبط عدد المحاولات يضمن قياساً دقيقاً وموضوعياً لمهارات المتعلم.',
    points: 50,
  },
];

export function getPreTestQuestions(): PreTestQuestion[] {
  try {
    const raw = localStorage.getItem(PRETEST_QUESTIONS_KEY);
    if (!raw) {
      savePreTestQuestions(DEFAULT_PRETEST_QUESTIONS);
      return DEFAULT_PRETEST_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_PRETEST_QUESTIONS;
    }
    return parsed;
  } catch {
    return DEFAULT_PRETEST_QUESTIONS;
  }
}

export function savePreTestQuestions(questions: PreTestQuestion[]): void {
  localStorage.setItem(PRETEST_QUESTIONS_KEY, JSON.stringify(questions));
}

export function resetPreTestQuestionsToDefault(): PreTestQuestion[] {
  savePreTestQuestions(DEFAULT_PRETEST_QUESTIONS);
  return DEFAULT_PRETEST_QUESTIONS;
}

export function submitPreTestResult(
  username: string,
  chosenAnswers: Record<string, number>,
  timeSpentSeconds: number
): {
  progress: StudentGameProgress;
  result: PreTestResult;
} {
  const all = getAllStudentsProgress();
  const prog = all[username] || {
    username,
    avatarId: 'avatar-cpbot',
    currentLevel: 1,
    completedLevels: {},
    totalScore: 0,
    hearts: 3,
    badges: [],
    lastActive: new Date().toISOString(),
  };

  const questions = getPreTestQuestions();
  let score = 0;
  let maxScore = 0;

  questions.forEach((q) => {
    maxScore += q.points;
    if (chosenAnswers[q.id] === q.correctIndex) {
      score += q.points;
    }
  });

  const passed = score >= Math.floor(maxScore * 0.4); // At least 40%

  const result: PreTestResult = {
    completed: true,
    score,
    maxScore,
    answers: chosenAnswers,
    completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    timeSpentSeconds,
    passed,
  };

  prog.preTestResult = result;
  prog.totalScore += score;
  const badgeName = 'وسام المستكشف التمهيدي (الاختبار القبلي)';
  if (!prog.badges.includes(badgeName)) {
    prog.badges.push(badgeName);
  }
  prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);

  all[username] = prog;
  saveAllStudentsProgress(all);

  addActivityLog(
    `إتمام الاختبار القبلي: أنهى الطالب ${username} لعبة الاختبار القبلي وحصد ${score}/${maxScore} نقطة`,
    username,
    'success'
  );

  return { progress: prog, result };
}

const POSTTEST_QUESTIONS_KEY = 'cp_posttest_questions_bank_v1';

export function getPostTestQuestions(): PreTestQuestion[] {
  try {
    const raw = localStorage.getItem(POSTTEST_QUESTIONS_KEY);
    if (!raw) {
      savePostTestQuestions(DEFAULT_PRETEST_QUESTIONS);
      return DEFAULT_PRETEST_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_PRETEST_QUESTIONS;
    }
    return parsed;
  } catch {
    return DEFAULT_PRETEST_QUESTIONS;
  }
}

export function savePostTestQuestions(questions: PreTestQuestion[]): void {
  localStorage.setItem(POSTTEST_QUESTIONS_KEY, JSON.stringify(questions));
}

export function submitPostTestResult(
  username: string,
  chosenAnswers: Record<string, number>,
  timeSpentSeconds: number
): {
  progress: StudentGameProgress;
  result: PreTestResult;
} {
  const all = getAllStudentsProgress();
  const prog = all[username] || {
    username,
    avatarId: 'avatar-cpbot',
    currentLevel: 1,
    completedLevels: {},
    totalScore: 0,
    hearts: 3,
    badges: [],
    lastActive: new Date().toISOString(),
  };

  const questions = getPostTestQuestions();
  let score = 0;
  let maxScore = 0;

  questions.forEach((q) => {
    maxScore += q.points;
    if (chosenAnswers[q.id] === q.correctIndex) {
      score += q.points;
    }
  });

  const passed = score >= Math.floor(maxScore * 0.5);

  const result: PreTestResult = {
    completed: true,
    score,
    maxScore,
    answers: chosenAnswers,
    completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    timeSpentSeconds,
    passed,
  };

  prog.postTestResult = result;
  prog.totalScore += score;
  const badgeName = 'وسام الإتقان والختام (الاختبار البعدي)';
  if (!prog.badges.includes(badgeName)) {
    prog.badges.push(badgeName);
  }
  prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);

  all[username] = prog;
  saveAllStudentsProgress(all);

  addActivityLog(
    `إتمام الاختبار البعدي: أنهى الطالب ${username} لعبة الاختبار البعدي وحصد ${score}/${maxScore} نقطة`,
    username,
    'success'
  );

  return { progress: prog, result };
}

