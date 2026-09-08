import { StudentGameProgress, CompletedLevelResult } from '../types';
import { GAME_LEVELS_DATA, CARTOON_AVATARS } from '../data/gameLevelsData';
import { getGroupByUsername } from '../data/studentAccounts';
import { addActivityLog } from './adminStorage';

const GAME_STORAGE_KEY = 'cp_game_progress_v2';

export function getAllStudentsProgress(): Record<string, StudentGameProgress> {
  try {
    const raw = localStorage.getItem(GAME_STORAGE_KEY);
    if (!raw) {
      const seeded = generateInitialGameSeeding();
      localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveAllStudentsProgress(all: Record<string, StudentGameProgress>): void {
  localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(all));
}

export function getStudentProgress(username: string): StudentGameProgress {
  const all = getAllStudentsProgress();
  const cleanUsername = username.trim();

  if (all[cleanUsername]) {
    return all[cleanUsername];
  }

  // Assign a default cartoon avatar based on username hash
  const avatarIndex = Math.abs(cleanUsername.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % CARTOON_AVATARS.length;
  const newProg: StudentGameProgress = {
    username: cleanUsername,
    avatarId: CARTOON_AVATARS[avatarIndex].id,
    currentLevel: 1,
    completedLevels: {},
    totalScore: 0,
    hearts: 3,
    badges: [],
    lastActive: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };

  all[cleanUsername] = newProg;
  saveAllStudentsProgress(all);
  return newProg;
}

export function updateStudentAvatar(username: string, avatarId: string): StudentGameProgress {
  const all = getAllStudentsProgress();
  const prog = getStudentProgress(username);
  prog.avatarId = avatarId;
  prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);
  all[username] = prog;
  saveAllStudentsProgress(all);
  return prog;
}

export function submitLevelChallenge(
  username: string,
  levelNumber: number,
  chosenAnswers: Record<string, number>, // questionId -> chosen option index
  timeSpentSeconds: number
): {
  progress: StudentGameProgress;
  levelResult: CompletedLevelResult;
  isImmediateFeedback: boolean;
  scoreGained: number;
} {
  const all = getAllStudentsProgress();
  const prog = getStudentProgress(username);

  const levelDef = GAME_LEVELS_DATA.find((l) => l.levelNumber === levelNumber);
  if (!levelDef) {
    throw new Error('Level not found');
  }

  // Calculate score
  let scoreGained = 0;
  let maxScore = 0;

  levelDef.questions.forEach((q) => {
    maxScore += q.points;
    if (chosenAnswers[q.id] === q.correctIndex) {
      scoreGained += q.points;
    }
  });

  // Determine feedback mode from group:
  // G1 (فوري) & G3 (فوري) -> immediate feedback to student
  // G2 (مرجأ) & G4 (مرجأ) -> deferred feedback (hidden from student until course completion, but visible to admin immediately)
  const groupMeta = getGroupByUsername(username);
  const isImmediate = groupMeta ? groupMeta.feedbackMode === 'فورية' : true;

  const levelResult: CompletedLevelResult = {
    levelNumber,
    score: scoreGained,
    maxScore,
    answers: chosenAnswers,
    completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    timeSpentSeconds,
    feedbackRevealedToStudent: isImmediate,
  };

  // Lock this level permanently
  prog.completedLevels[levelNumber] = levelResult;
  prog.totalScore += scoreGained;

  // Add badge if not already owned
  if (!prog.badges.includes(levelDef.badgeName)) {
    prog.badges.push(levelDef.badgeName);
  }

  // Advance to next level if finishing current level
  if (prog.currentLevel === levelNumber && levelNumber < 10) {
    prog.currentLevel = levelNumber + 1;
  }

  prog.lastActive = new Date().toISOString().replace('T', ' ').substring(0, 19);

  all[username] = prog;
  saveAllStudentsProgress(all);

  addActivityLog(
    `إتمام المستوى ${levelNumber} (${levelDef.shortTitle}) للطالب ${username} - النتيجة: ${scoreGained}/${maxScore} (${isImmediate ? 'تغذية فورية' : 'تغذية مرجئة'})`,
    username,
    'success'
  );

  return {
    progress: prog,
    levelResult,
    isImmediateFeedback: isImmediate,
    scoreGained,
  };
}

export function resetStudentProgress(username: string): StudentGameProgress {
  const all = getAllStudentsProgress();
  const resetProg: StudentGameProgress = {
    username,
    avatarId: CARTOON_AVATARS[0].id,
    currentLevel: 1,
    completedLevels: {},
    totalScore: 0,
    hearts: 3,
    badges: [],
    lastActive: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  all[username] = resetProg;
  saveAllStudentsProgress(all);
  addActivityLog(`إعادة تعيين تقدم اللعبة للطالب: ${username}`, 'المشرف', 'warning');
  return resetProg;
}

// Generates initial seed progress for other demo students across G1, G2, G3, G4
function generateInitialGameSeeding(): Record<string, StudentGameProgress> {
  const seeded: Record<string, StudentGameProgress> = {};
  const groups = ['G1', 'G2', 'G3', 'G4'] as const;

  groups.forEach((grp, grpIdx) => {
    for (let i = 1; i <= 15; i++) {
      const pad = i < 10 ? `0${i}` : `${i}`;
      const uname = `${grp}_Cp_${pad}`;
      const avatar = CARTOON_AVATARS[(i + grpIdx) % CARTOON_AVATARS.length];

      // Give students sample progression between 1 and 4 levels completed
      const completedCount = ((i * 3 + grpIdx) % 4); // 0 to 3 completed levels
      const completedLevels: Record<number, CompletedLevelResult> = {};
      let total = 0;
      const isImmediate = grp === 'G1' || grp === 'G3';

      for (let lvl = 1; lvl <= completedCount; lvl++) {
        const lvlDef = GAME_LEVELS_DATA[lvl - 1];
        const answers: Record<string, number> = {};
        let score = 0;
        lvlDef.questions.forEach((q, qIdx) => {
          // Mostly correct
          const isCorrect = (i + qIdx) % 4 !== 0;
          answers[q.id] = isCorrect ? q.correctIndex : (q.correctIndex + 1) % q.options.length;
          if (isCorrect) score += q.points;
        });

        total += score;
        completedLevels[lvl] = {
          levelNumber: lvl,
          score,
          maxScore: lvlDef.questions.length * 50,
          answers,
          completedAt: `2026-09-08 05:${10 + i}:${lvl * 12}`,
          timeSpentSeconds: 45 + lvl * 15,
          feedbackRevealedToStudent: isImmediate,
        };
      }

      seeded[uname] = {
        username: uname,
        avatarId: avatar.id,
        currentLevel: Math.min(10, completedCount + 1),
        completedLevels,
        totalScore: total,
        hearts: 3,
        badges: completedCount > 0 ? [GAME_LEVELS_DATA[0].badgeName] : [],
        lastActive: completedCount > 0 ? `2026-09-08 05:${20 + i}:00` : 'لم يبدأ بعد',
      };
    }
  });

  return seeded;
}
