export enum MissionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
}

export enum MissionFrequency {
  DAILY = 'Todos os dias',
  WEEKLY_3 = '3 vezes por semana',
  WEEKLY = 'Semanalmente',
}

export enum HabitCategory {
  HEALTH = 'Saúde',
  FITNESS = 'Fitness',
  MENTAL = 'Mental',
  SLEEP = 'Sono',
  NUTRITION = 'Nutrição',
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  frequency: MissionFrequency;
  status: MissionStatus;
  current: number;
  target: number;
  unit: string;
  xpReward: number;
  color: string;
}

export interface UserProgress {
  level: number;
  currentXP: number;
  targetXP: number;
  streak: number;
  completedMissions: number;
  weeklyProgress: number;
  levelTitle: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  weekHistory: boolean[];
  color: string;
  category: HabitCategory;
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  professional: string;
  type: string;
  location: string;
}

export interface IoTData {
  deviceId: string;
  waterIntake: number;
  steps: number;
  heartRate: number;
  timestamp: number;
}

export type RealtimeEventType = 'mission-update' | 'iot-data' | 'achievement' | 'notification';

export interface RealtimeEvent {
  type: RealtimeEventType;
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}
