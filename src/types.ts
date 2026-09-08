export interface AdminSettings {
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  whatsappEnabled: boolean;
  adminPasswordHash: string; // Stored securely in localStorage
  systemName: string;
  maintenanceMode: boolean;
  allowLogins: boolean;
}

export interface PortalUser {
  id: string;
  username: string;
  fullName: string;
  role: 'member' | 'supervisor' | 'analyst';
  password: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  groupCode?: 'G1' | 'G2' | 'G3' | 'G4';
  groupId?: 'grp-1' | 'grp-2' | 'grp-3' | 'grp-4';
  groupName?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  ip: string;
  status: 'success' | 'warning' | 'error';
}

export interface CartoonAvatar {
  id: string;
  name: string;
  title: string;
  emoji: string;
  bgGradient: string;
  borderClass: string;
  description: string;
}

export interface LevelQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

export interface CompletedLevelResult {
  levelNumber: number;
  score: number;
  maxScore: number;
  answers: Record<string, number>; // questionId -> chosenIndex
  completedAt: string;
  timeSpentSeconds: number;
  feedbackRevealedToStudent: boolean; // true for G1 & G3, false for G2 & G4
}

export interface StudentGameProgress {
  username: string;
  avatarId: string;
  currentLevel: number; // 1 to 10
  completedLevels: Record<number, CompletedLevelResult>;
  totalScore: number;
  hearts: number;
  badges: string[];
  lastActive: string;
}

export interface RealtimeStudentParticipant {
  username: string;
  fullName: string;
  avatarEmoji: string;
  avatarId: string;
  joinedAt: string;
  lastPing: number;
  isOnline: boolean;
}

export interface RealtimeQuestionAnswer {
  selectedOption: number;
  selectedBy: string;
  studentName: string;
  avatarEmoji: string;
  updatedAt: string;
}

export interface RealtimeVote {
  username: string;
  studentName: string;
  avatarEmoji: string;
  optionIndex: number;
}

export interface LiveRoomEvent {
  id: string;
  text: string;
  time: string;
  type: 'answer' | 'join' | 'submit' | 'info';
  actorName?: string;
  actorEmoji?: string;
}

export interface GroupRoomState {
  groupId: string; // 'G1' | 'G2' | 'G3' | 'G4'
  activeLevel: number;
  currentAnswers: Record<string, RealtimeQuestionAnswer>;
  votes: Record<string, Record<string, RealtimeVote>>; // questionId -> (username -> vote)
  activeStudents: Record<string, RealtimeStudentParticipant>;
  completedLevels: Record<number, CompletedLevelResult>;
  liveEvents: LiveRoomEvent[];
  lastUpdatedAt: string;
}

