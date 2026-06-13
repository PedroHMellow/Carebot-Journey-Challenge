import AsyncStorage from '@react-native-async-storage/async-storage';
import { missionsService } from '../missions';
import { MissionStatus } from '../../types';

describe('missionsService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should return default missions if no storage exists', async () => {
    const missions = await missionsService.getMissions();

    expect(missions.some((m) => m.id === '1')).toBe(true);
  });

  it('should complete water mission when progress reaches target', async () => {
    const missions = await missionsService.updateWaterProgress(2);
    const waterMission = missions.find((m) => m.id === '1');

    expect(waterMission?.status).toBe(MissionStatus.COMPLETED);
    expect(waterMission?.current).toBe(2);
  });

  it('should calculate completed missions count', () => {
    const missions = [
      { id: '1', status: MissionStatus.COMPLETED },
      { id: '2', status: MissionStatus.IN_PROGRESS },
      { id: '3', status: MissionStatus.COMPLETED },
    ] as any;

    expect(missionsService.getCompletedCount(missions)).toBe(2);
  });

  it('should level up when XP target reached after completing mission', async () => {
    await AsyncStorage.setItem(
      '@carebot_progress',
      JSON.stringify({
        level: 7,
        currentXP: 980,
        targetXP: 1000,
        streak: 5,
        completedMissions: 12,
        weeklyProgress: 85,
        levelTitle: 'Cuidando de você!',
      }),
    );

    const response = await missionsService.toggleMission('1');

    expect(response.leveledUp).toBe(true);
    expect(response.progress.level).toBe(8);
    expect(response.progress.currentXP).toBe(30);
  });
});
