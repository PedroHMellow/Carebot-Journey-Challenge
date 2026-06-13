import AsyncStorage from '@react-native-async-storage/async-storage';
import { habitsService } from '../habits';

const sampleHabit = {
  id: '1',
  name: 'Beber água',
  icon: 'water',
  weekHistory: [false, true, true, true, true, true, true],
  color: '#0073E6',
  category: 'HEALTH',
};

describe('habitsService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should return default habits when none saved', async () => {
    const habits = await habitsService.getHabits();

    expect(habits.length).toBeGreaterThan(0);
  });

  it('should toggle today habit state', async () => {
    const habits = await habitsService.toggleTodayHabit('1');

    const habit = habits.find((h) => h.id === '1');
    expect(habit).toBeDefined();
    expect(habit?.weekHistory[6]).toBe(true);
  });

  it('should calculate streak count correctly', () => {
    const streak = habitsService.getStreakCount(sampleHabit as any);
    expect(streak).toBe(6);
  });

  it('should calculate completion rate correctly', () => {
    const rate = habitsService.getCompletionRate(sampleHabit as any);
    expect(rate).toBe(86);
  });
});
