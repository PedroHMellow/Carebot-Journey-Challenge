import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const requestPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) return true;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('carebot-missions', {
      name: 'Missões Carebot',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return finalStatus === 'granted';
};

const sendMissionComplete = async (missionTitle: string): Promise<void> => {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🎯 Missão Concluída!',
      body: `Parabéns! Você completou: ${missionTitle}`,
      sound: 'default',
      data: { type: 'mission-complete' },
    },
    trigger: null,
  });
};

const sendLevelUp = async (level: number, title: string): Promise<void> => {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🏆 Subiu de Nível!',
      body: `Você alcançou o Nível ${level}: ${title}!`,
      sound: 'default',
      data: { type: 'level-up' },
    },
    trigger: null,
  });
};

const scheduleDailyReminder = async (): Promise<void> => {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💧 Lembrete Carebot Journey',
      body: 'Não esqueça de beber água e completar suas missões do dia!',
      sound: 'default',
      data: { type: 'daily-reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 0,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌙 Revisão do Dia',
      body: 'Como foi sua jornada hoje? Confira seu progresso!',
      sound: 'default',
      data: { type: 'evening-reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
};

const cancelAll = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const notificationsService = {
  requestPermissions,
  sendMissionComplete,
  sendLevelUp,
  scheduleDailyReminder,
  cancelAll,
};
