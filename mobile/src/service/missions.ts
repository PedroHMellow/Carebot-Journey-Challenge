import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mission, MissionStatus, MissionFrequency, UserProgress } from '../types';

const MISSIONS_KEY = '@carebot_missions';
const PROGRESS_KEY = '@carebot_progress';

const DEFAULT_MISSIONS: Mission[] = [
  {
    id: '1',
    title: 'Beber 2 litros de água',
    description: 'Hidratação diária',
    icon: 'water',
    frequency: MissionFrequency.DAILY,
    status: MissionStatus.IN_PROGRESS,
    current: 1.2,
    target: 2,
    unit: 'L',
    xpReward: 50,
    color: '#0073E6',
  },
  {
    id: '2',
    title: 'Caminhar 30 minutos',
    description: 'Atividade física diária',
    icon: 'walk',
    frequency: MissionFrequency.DAILY,
    status: MissionStatus.COMPLETED,
    current: 30,
    target: 30,
    unit: 'min',
    xpReward: 75,
    color: '#22C55E',
  },
  {
    id: '3',
    title: 'Dormir 7-8 horas',
    description: 'Descanso adequado',
    icon: 'sleep',
    frequency: MissionFrequency.DAILY,
    status: MissionStatus.COMPLETED,
    current: 7.5,
    target: 8,
    unit: 'h',
    xpReward: 60,
    color: '#8B5CF6',
  },
  {
    id: '4',
    title: 'Meditar por 10 minutos',
    description: 'Saúde mental',
    icon: 'meditation',
    frequency: MissionFrequency.WEEKLY_3,
    status: MissionStatus.PENDING,
    current: 0,
    target: 10,
    unit: 'min',
    xpReward: 40,
    color: '#F59E0B',
  },
  {
    id: '5',
    title: 'Evitar bebidas açucaradas',
    description: 'Alimentação saudável',
    icon: 'cup-off',
    frequency: MissionFrequency.DAILY,
    status: MissionStatus.PENDING,
    current: 0,
    target: 1,
    unit: 'dia',
    xpReward: 30,
    color: '#EF4444',
  },
  {
    id: '6',
    title: 'Registrar refeições',
    description: 'Controle alimentar',
    icon: 'food',
    frequency: MissionFrequency.DAILY,
    status: MissionStatus.COMPLETED,
    current: 3,
    target: 3,
    unit: 'refeições',
    xpReward: 35,
    color: '#10B981',
  },
];

const DEFAULT_PROGRESS: UserProgress = {
  level: 7,
  currentXP: 750,
  targetXP: 1000,
  streak: 5,
  completedMissions: 12,
  weeklyProgress: 85,
  levelTitle: 'Cuidando de você!',
};

const LEVEL_TITLES: Record<number, string> = {
  1: 'Iniciante',
  2: 'Explorador',
  3: 'Dedicado',
  4: 'Persistente',
  5: 'Comprometido',
  6: 'Disciplinado',
  7: 'Cuidando de você!',
  8: 'Mestre da Saúde',
  9: 'Guerreiro Saudável',
  10: 'Lenda do Bem-Estar',
};

const getMissions = async (): Promise<Mission[]> => {
  const stored = await AsyncStorage.getItem(MISSIONS_KEY);
  if (!stored) {
    await AsyncStorage.setItem(MISSIONS_KEY, JSON.stringify(DEFAULT_MISSIONS));
    return DEFAULT_MISSIONS;
  }
  return JSON.parse(stored) as Mission[];
};

const getProgress = async (): Promise<UserProgress> => {
  const stored = await AsyncStorage.getItem(PROGRESS_KEY);
  if (!stored) {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(DEFAULT_PROGRESS));
    return DEFAULT_PROGRESS;
  }
  return JSON.parse(stored) as UserProgress;
};

const saveProgress = async (progress: UserProgress): Promise<void> => {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

const saveMissions = async (missions: Mission[]): Promise<void> => {
  await AsyncStorage.setItem(MISSIONS_KEY, JSON.stringify(missions));
};

const toggleMission = async (id: string): Promise<{ missions: Mission[]; progress: UserProgress; leveledUp: boolean }> => {
  const missions = await getMissions();
  const progress = await getProgress();
  let leveledUp = false;

  const updated = missions.map((m) => {
    if (m.id !== id) return m;

    const wasCompleted = m.status === MissionStatus.COMPLETED;
    const newStatus = wasCompleted ? MissionStatus.PENDING : MissionStatus.COMPLETED;

    if (!wasCompleted) {
      progress.currentXP += m.xpReward;
      progress.completedMissions += 1;
      const completed = missions.filter((x) => x.status === MissionStatus.COMPLETED).length + 1;
      const total = missions.length;
      progress.weeklyProgress = Math.round((completed / total) * 100);

      if (progress.currentXP >= progress.targetXP) {
        progress.level += 1;
        progress.currentXP -= progress.targetXP;
        progress.targetXP = Math.floor(progress.targetXP * 1.5);
        progress.levelTitle = LEVEL_TITLES[progress.level] ?? 'Mestre da Saúde';
        leveledUp = true;
      }
    } else {
      progress.currentXP = Math.max(0, progress.currentXP - m.xpReward);
      progress.completedMissions = Math.max(0, progress.completedMissions - 1);
    }

    return {
      ...m,
      status: newStatus,
      current: newStatus === MissionStatus.COMPLETED ? m.target : 0,
    };
  });

  await saveMissions(updated);
  await saveProgress(progress);

  return { missions: updated, progress, leveledUp };
};

const updateWaterProgress = async (waterIntake: number): Promise<Mission[]> => {
  const missions = await getMissions();

  const updated = missions.map((m) => {
    if (m.id !== '1') return m;
    const clamped = Math.min(waterIntake, m.target);
    const newStatus = clamped >= m.target ? MissionStatus.COMPLETED : MissionStatus.IN_PROGRESS;
    return { ...m, current: parseFloat(clamped.toFixed(1)), status: newStatus };
  });

  await saveMissions(updated);
  return updated;
};

const getCompletedCount = (missions: Mission[]): number =>
  missions.filter((m) => m.status === MissionStatus.COMPLETED).length;

export const missionsService = {
  getMissions,
  getProgress,
  toggleMission,
  updateWaterProgress,
  getCompletedCount,
};
