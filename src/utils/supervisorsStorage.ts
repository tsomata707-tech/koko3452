import { SupervisorCard, SupervisorsHonorBoardConfig } from '../types';

const SUPERVISORS_STORAGE_KEY = 'cp_supervisors_honor_board_v3';

export const INITIAL_SUPERVISORS_CONFIG: SupervisorsHonorBoardConfig = {
  boardTitle: 'لوحة الشرف لمشرفي المشروع والرسالة العلمية',
  boardSubtitle: 'تقديراً وعرفاناً بالجهود العلمية الرائدة والتوجيه الأكاديمي السديد لأساتذة قسم تكنولوجيا التعليم الموقرين',
  university: 'جامعة طنطا - كلية التربية النوعية - قسم تكنولوجيا التعليم',
  researcher: 'الباحثة/ حكمت عزت محمد غنيم',
  researchTitle: 'تصميم بيئة ألعاب تعليمية إلكترونية قائمة على التفاعل بين نمط التغذية الراجعة ونمط التعلم',
  showOnStudentLogin: true,
  supervisors: [
    {
      id: 'sup-1',
      cardIndex: 1,
      cardLabel: 'البطاقة 1',
      name: 'أ.د/ حسناء عبد العاطي الطباخ',
      title: 'أستاذ تكنولوجيا التعليم ورئيس القسم بكلية التربية النوعية جامعة طنطا',
      role: 'رئيس لجنة الإشراف العلمي',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      accentColor: '#ffd700',
    },
    {
      id: 'sup-2',
      cardIndex: 2,
      cardLabel: 'البطاقة 2',
      name: 'أ.م.د/ أمل إبراهيم حماده',
      title: 'أستاذ تكنولوجيا التعليم المساعد بكلية التربية النوعية جامعة طنطا',
      role: 'مشرف علمي على البحث',
      imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      accentColor: '#a855f7',
    },
    {
      id: 'sup-3',
      cardIndex: 3,
      cardLabel: 'البطاقة 3',
      name: 'د/ حنان جلال قلقيلة',
      title: 'مدرس تكنولوجيا التعليم بكلية التربية النوعية جامعة طنطا',
      role: 'مشرف علمي على البحث',
      imageUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
      accentColor: '#06b6d4',
    },
    {
      id: 'sup-4',
      cardIndex: 4,
      cardLabel: 'البطاقة 4',
      name: 'الباحثة/ حكمت عزت محمد غنيم',
      title: 'معيدة بقسم تكنولوجيا التعليم ومصممة بيئة الألعاب التعليمية',
      role: 'الباحثة ومعدة الدراسة',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      accentColor: '#10b981',
    },
  ],
  updatedAt: '2026-03-01 10:00',
};

export function getSupervisorsBoardConfig(): SupervisorsHonorBoardConfig {
  try {
    const raw = localStorage.getItem(SUPERVISORS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SUPERVISORS_STORAGE_KEY, JSON.stringify(INITIAL_SUPERVISORS_CONFIG));
      return INITIAL_SUPERVISORS_CONFIG;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.supervisors)) {
      return INITIAL_SUPERVISORS_CONFIG;
    }
    return {
      ...INITIAL_SUPERVISORS_CONFIG,
      ...parsed,
      showOnStudentLogin: parsed.showOnStudentLogin !== false,
    };
  } catch {
    return INITIAL_SUPERVISORS_CONFIG;
  }
}

export function saveSupervisorsBoardConfig(config: SupervisorsHonorBoardConfig): void {
  // Ensure cards have standardized default labels if empty: البطاقة 1, البطاقة 2...
  const normalizedSupervisors = config.supervisors.map((s, idx) => ({
    ...s,
    cardIndex: idx + 1,
    cardLabel: s.cardLabel?.trim() || `البطاقة ${idx + 1}`,
  }));

  const updatedConfig: SupervisorsHonorBoardConfig = {
    ...config,
    supervisors: normalizedSupervisors,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  localStorage.setItem(SUPERVISORS_STORAGE_KEY, JSON.stringify(updatedConfig));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('supervisors-honor-board-updated', { detail: updatedConfig }));
  }
}

export function resetSupervisorsBoardConfig(): SupervisorsHonorBoardConfig {
  localStorage.setItem(SUPERVISORS_STORAGE_KEY, JSON.stringify(INITIAL_SUPERVISORS_CONFIG));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('supervisors-honor-board-updated', { detail: INITIAL_SUPERVISORS_CONFIG }));
  }
  return INITIAL_SUPERVISORS_CONFIG;
}

export function addSupervisorCard(
  cardData: Omit<SupervisorCard, 'id' | 'cardIndex' | 'cardLabel'> & { cardLabel?: string }
): SupervisorsHonorBoardConfig {
  const current = getSupervisorsBoardConfig();
  const nextIndex = current.supervisors.length + 1;

  const newCard: SupervisorCard = {
    ...cardData,
    id: `sup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    cardIndex: nextIndex,
    cardLabel: cardData.cardLabel?.trim() || `البطاقة ${nextIndex}`,
    imageUrl: cardData.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  };

  const updated: SupervisorsHonorBoardConfig = {
    ...current,
    supervisors: [...current.supervisors, newCard],
  };

  saveSupervisorsBoardConfig(updated);
  return getSupervisorsBoardConfig();
}

export function updateSupervisorCard(
  id: string,
  updates: Partial<Omit<SupervisorCard, 'id' | 'cardIndex'>>
): SupervisorsHonorBoardConfig {
  const current = getSupervisorsBoardConfig();
  const index = current.supervisors.findIndex((s) => s.id === id);
  if (index === -1) return current;

  current.supervisors[index] = {
    ...current.supervisors[index],
    ...updates,
  };

  saveSupervisorsBoardConfig(current);
  return getSupervisorsBoardConfig();
}

export function deleteSupervisorCard(id: string): SupervisorsHonorBoardConfig {
  const current = getSupervisorsBoardConfig();
  const filtered = current.supervisors.filter((s) => s.id !== id);

  saveSupervisorsBoardConfig({
    ...current,
    supervisors: filtered,
  });
  return getSupervisorsBoardConfig();
}
