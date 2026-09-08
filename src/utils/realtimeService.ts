import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  GroupRoomState,
  RealtimeQuestionAnswer,
  RealtimeVote,
  RealtimeStudentParticipant,
  LiveRoomEvent,
  StudentGameProgress,
  CompletedLevelResult,
} from '../types';
import { GAME_LEVELS_DATA } from '../data/gameLevelsData';
import { getGroupByUsername } from '../data/studentAccounts';

// Default initial state for a group room
export const getDefaultRoomState = (groupId: string): GroupRoomState => ({
  groupId,
  activeLevel: 1,
  currentAnswers: {},
  votes: {},
  activeStudents: {},
  completedLevels: {},
  liveEvents: [
    {
      id: 'init-1',
      text: `بدأت الغرفة التفاعلية اللحظية للمجموعة ${groupId}`,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      type: 'info',
    },
  ],
  lastUpdatedAt: new Date().toISOString(),
});

/**
 * Real-time listener for a collaborative group room.
 * Updates instantly whenever any of the 15 students clicks or answers!
 */
export const subscribeToGroupRoom = (
  groupId: string,
  onUpdate: (room: GroupRoomState) => void
): (() => void) => {
  const roomDocRef = doc(db, 'groupRooms', groupId);

  const unsubscribe = onSnapshot(
    roomDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as GroupRoomState;
        onUpdate({
          ...getDefaultRoomState(groupId),
          ...data,
          groupId,
        });
      } else {
        // Document does not exist yet, initialize it
        const initialState = getDefaultRoomState(groupId);
        setDoc(roomDocRef, initialState).catch((err) => {
          console.error('Failed to initialize group room in Firestore:', err);
        });
        onUpdate(initialState);
      }
    },
    (error) => {
      console.error(`Error listening to group room ${groupId}:`, error);
    }
  );

  return unsubscribe;
};

/**
 * Join group room and broadcast presence to all students
 */
export const joinGroupRoom = async (
  groupId: string,
  student: {
    username: string;
    fullName: string;
    avatarEmoji: string;
    avatarId: string;
  }
) => {
  try {
    const roomDocRef = doc(db, 'groupRooms', groupId);
    const docSnap = await getDoc(roomDocRef);

    const newParticipant: RealtimeStudentParticipant = {
      username: student.username,
      fullName: student.fullName,
      avatarEmoji: student.avatarEmoji,
      avatarId: student.avatarId,
      joinedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      lastPing: Date.now(),
      isOnline: true,
    };

    const newEvent: LiveRoomEvent = {
      id: `join-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: `${student.fullName} (${student.avatarEmoji}) انضم إلى الجلسة التفاعلية الحية`,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      type: 'join',
      actorName: student.fullName,
      actorEmoji: student.avatarEmoji,
    };

    if (docSnap.exists()) {
      const data = docSnap.data() as GroupRoomState;
      const currentStudents = data.activeStudents || {};
      const currentEvents = data.liveEvents || [];

      await updateDoc(roomDocRef, {
        [`activeStudents.${student.username}`]: newParticipant,
        liveEvents: [newEvent, ...currentEvents].slice(0, 30),
        lastUpdatedAt: new Date().toISOString(),
      });
    } else {
      const state = getDefaultRoomState(groupId);
      state.activeStudents[student.username] = newParticipant;
      state.liveEvents = [newEvent, ...state.liveEvents];
      await setDoc(roomDocRef, state);
    }
  } catch (error) {
    console.error('Failed to join group room in Firestore:', error);
  }
};

/**
 * When a student selects an option in real-time, broadcast it instantly to all 15 students!
 */
export const selectQuestionOptionRealtime = async (
  groupId: string,
  levelNumber: number,
  questionId: string,
  optionIndex: number,
  student: {
    username: string;
    fullName: string;
    avatarEmoji: string;
  }
) => {
  try {
    const roomDocRef = doc(db, 'groupRooms', groupId);
    const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newAnswer: RealtimeQuestionAnswer = {
      selectedOption: optionIndex,
      selectedBy: student.username,
      studentName: student.fullName,
      avatarEmoji: student.avatarEmoji,
      updatedAt: timeStr,
    };

    const newVote: RealtimeVote = {
      username: student.username,
      studentName: student.fullName,
      avatarEmoji: student.avatarEmoji,
      optionIndex,
    };

    const optionLetters = ['أ', 'ب', 'ج', 'د'];
    const newEvent: LiveRoomEvent = {
      id: `ans-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: `${student.fullName} ${student.avatarEmoji} اختار الإجابة (${optionLetters[optionIndex] || optionIndex + 1})`,
      time: timeStr,
      type: 'answer',
      actorName: student.fullName,
      actorEmoji: student.avatarEmoji,
    };

    // Update Firestore
    await updateDoc(roomDocRef, {
      [`currentAnswers.${questionId}`]: newAnswer,
      [`votes.${questionId}.${student.username}`]: newVote,
      lastUpdatedAt: new Date().toISOString(),
    });

    // Also push event (read doc to slice events)
    const docSnap = await getDoc(roomDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as GroupRoomState;
      const currentEvents = data.liveEvents || [];
      await updateDoc(roomDocRef, {
        liveEvents: [newEvent, ...currentEvents].slice(0, 30),
      });
    }
  } catch (error) {
    console.error('Failed to update realtime question answer in Firestore:', error);
  }
};

/**
 * Submit level challenge collaboratively in real-time.
 * Locks the level, saves the score, moves to next level, and syncs progress for all!
 */
export const submitGroupLevelRealtime = async (
  groupId: string,
  levelNumber: number,
  answers: Record<string, number>,
  submittedBy: {
    username: string;
    fullName: string;
    avatarEmoji: string;
  }
): Promise<{
  levelResult: CompletedLevelResult;
  isImmediateFeedback: boolean;
}> => {
  const levelDef = GAME_LEVELS_DATA.find((l) => l.levelNumber === levelNumber) || GAME_LEVELS_DATA[0];
  const userGroupMeta = getGroupByUsername(submittedBy.username);
  const isImmediateFeedback = userGroupMeta ? userGroupMeta.feedbackMode === 'فورية' : true;

  // Calculate score
  let score = 0;
  levelDef.questions.forEach((q) => {
    if (answers[q.id] === q.correctIndex) {
      score += q.points;
    }
  });

  const levelResult: CompletedLevelResult = {
    levelNumber,
    score,
    maxScore: levelDef.questions.length * 50,
    answers,
    completedAt: new Date().toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    timeSpentSeconds: 60,
    feedbackRevealedToStudent: isImmediateFeedback,
  };

  try {
    const roomDocRef = doc(db, 'groupRooms', groupId);
    const newEvent: LiveRoomEvent = {
      id: `submit-${Date.now()}`,
      text: `🔒 تم اعتماد المستوى ${levelNumber} وإغلاقه بنجاح بواسطة ${submittedBy.fullName} (${submittedBy.avatarEmoji})`,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      type: 'submit',
      actorName: submittedBy.fullName,
      actorEmoji: submittedBy.avatarEmoji,
    };

    const nextLevel = Math.min(10, levelNumber + 1);

    await updateDoc(roomDocRef, {
      [`completedLevels.${levelNumber}`]: levelResult,
      activeLevel: nextLevel,
      currentAnswers: {}, // Clear answers for the new active level
      votes: {},
      lastUpdatedAt: new Date().toISOString(),
    });

    // Also update student's individual progress in Firestore
    const studentDocRef = doc(db, 'studentsProgress', submittedBy.username);
    const studentSnap = await getDoc(studentDocRef);

    let totalScore = score;
    let completedLevels: Record<number, CompletedLevelResult> = { [levelNumber]: levelResult };
    let badges: string[] = [levelDef.badgeName];

    if (studentSnap.exists()) {
      const existing = studentSnap.data() as StudentGameProgress;
      completedLevels = { ...(existing.completedLevels || {}), [levelNumber]: levelResult };
      totalScore = Object.values(completedLevels).reduce((acc, l) => acc + l.score, 0);
      badges = Array.from(new Set([...(existing.badges || []), levelDef.badgeName]));
    }

    const updatedProgress: StudentGameProgress = {
      username: submittedBy.username,
      avatarId: 'cp-bot',
      currentLevel: nextLevel,
      completedLevels,
      totalScore,
      hearts: 3,
      badges,
      lastActive: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    await setDoc(studentDocRef, updatedProgress, { merge: true });
  } catch (error) {
    console.error('Failed to submit level challenge to Firestore:', error);
  }

  return { levelResult, isImmediateFeedback };
};

/**
 * Sync individual student progress to Firestore
 */
export const syncStudentProgressToFirestore = async (progress: StudentGameProgress) => {
  try {
    const studentDocRef = doc(db, 'studentsProgress', progress.username);
    await setDoc(studentDocRef, progress, { merge: true });
  } catch (error) {
    console.error('Failed to sync student progress to Firestore:', error);
  }
};

/**
 * Subscribe to all students progress for the Admin Panel live analytics
 */
export const subscribeToAllStudentsProgress = (
  onUpdate: (map: Record<string, StudentGameProgress>) => void
): (() => void) => {
  const colRef = collection(db, 'studentsProgress');

  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      const map: Record<string, StudentGameProgress> = {};
      snapshot.forEach((docSnap) => {
        if (docSnap.exists()) {
          map[docSnap.id] = docSnap.data() as StudentGameProgress;
        }
      });
      onUpdate(map);
    },
    (error) => {
      console.error('Error listening to all students progress in Firestore:', error);
    }
  );

  return unsubscribe;
};
