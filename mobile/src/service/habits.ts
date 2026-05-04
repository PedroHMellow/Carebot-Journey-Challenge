import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitCategory } from '../types';

const HABITS_KEY = '@carebot_habits';

const DEFAULT_HABITS: Habit[] = [
  {
    id: '1',
    name: 'Beber água',
    icon: 'water',
    weekHistory: [true, true, true, false, true, true, false],
    color: '#0073E6',
    category: HabitCategory.HEALTH,
  },
  {
    id: '2',
    name: 'Exercitar',
    icon: 'run',
    weekHistory: [true, false, true, false, true, false, false],
    color: '#22C55E',
    category: HabitCategory.FITNESS,
  },
  {
    id: '3',
    name: 'Meditar',
    icon: 'meditation',
    weekHistory: [true, true, false, true, false, false, false],
    color: '#8B5CF6',
    category: HabitCategory.MENTAL,
  },
  {
    id: '4',
    name: 'Dormir cedo',
    icon: 'sleep',
    weekHistory: [false, true, true, false, true, true, false],
    color: '#F59E0B',
    category: HabitCategory.SLEEP,
  },
  {
    id: '5',
    name: 'Frutas e Legumes',
    icon: 'food-apple',
    weekHistory: [true, false, false, true, false, false, false],
    color: '#EF4444',
    category: HabitCategory.NUTRITION,
  },
  {
    id: '6',
    name: 'Sem açúcar',
    icon: 'cup-off',
    weekHistory: [true, true, false, false, false, false, false],
    color: '#10B981',
    category: HabitCategory.NUTRITION,
  },
];

const getHabits = async (): Promise<Habit[]> => {
  const stored = await AsyncStorage.getItem(HABITS_KEY);
  if (!stored) {
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(DEFAULT_HABITS));
    return DEFAULT_HABITS;
  }
  return JSON.parse(stored) as Habit[];
};

const toggleTodayHabit = async (id: string): Promise<Habit[]> => {
  const habits = await getHabits();
  const todayIndex = 6;

  const updated = habits.map((h) => {
    if (h.id !== id) return h;
    const newHistory = [...h.weekHistory];
    newHistory[todayIndex] = !newHistory[todayIndex];
    return { ...h, weekHistory: newHistory };
  });

  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
  return updated;
};

const getStreakCount = (habit: Habit): number => {
  let streak = 0;
  for (let i = habit.weekHistory.length - 1; i >= 0; i--) {
    if (habit.weekHistory[i]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

const getCompletionRate = (habit: Habit): number => {
  const completed = habit.weekHistory.filter(Boolean).length;
  return Math.round((completed / habit.weekHistory.length) * 100);
};

export const habitsService = {
  getHabits,
  toggleTodayHabit,
  getStreakCount,
  getCompletionRate,
};
