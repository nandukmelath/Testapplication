import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissionsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export const FASTING_PHASES = [
  { id: 'ketosis', hours: 12, title: 'Ketosis Started', body: 'Your body is now using fat for energy.' },
  { id: 'fat_burning', hours: 18, title: 'Heavy Fat Burning', body: 'You are now in heavy fat burning mode.' },
  { id: 'autophagy', hours: 24, title: 'Autophagy Triggered', body: 'Your cells are cleaning up and regenerating.' },
  { id: 'growth_hormone', hours: 48, title: 'Growth Hormone Peak', body: 'Growth hormone levels are peaking for muscle protection.' },
  { id: 'immune_regen', hours: 72, title: 'Immune Regeneration', body: 'Your immune system is regenerating stem cells.' }
];

export async function scheduleFastingNotifications(startTime) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const hasPermission = await requestNotificationPermissionsAsync();
  if (!hasPermission) return;

  const startMillis = new Date(startTime).getTime();

  for (const phase of FASTING_PHASES) {
    const triggerTime = startMillis + phase.hours * 60 * 60 * 1000;

    // Only schedule if the time is in the future
    if (triggerTime > Date.now()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: phase.title,
          body: phase.body,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(triggerTime),
        },
      });
    }
  }
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
