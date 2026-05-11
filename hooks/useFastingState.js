import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleFastingNotifications, cancelAllNotifications } from '../utils/notifications';

const FASTING_STATE_KEY = '@fasting_state';

export function useFastingState() {
  const [isFasting, setIsFasting] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [targetDuration, setTargetDuration] = useState(16); // in hours
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const storedStateString = await AsyncStorage.getItem(FASTING_STATE_KEY);
      if (storedStateString) {
        const storedState = JSON.parse(storedStateString);
        setIsFasting(storedState.isFasting);
        setStartTime(storedState.startTime);
        setTargetDuration(storedState.targetDuration);
      }
    } catch (e) {
      console.error('Failed to load fasting state', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveState = async (state) => {
    try {
      await AsyncStorage.setItem(FASTING_STATE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save fasting state', e);
    }
  };

  const startFast = async (durationHours) => {
    const now = new Date().toISOString();
    const newState = {
      isFasting: true,
      startTime: now,
      targetDuration: durationHours,
    };

    setIsFasting(true);
    setStartTime(now);
    setTargetDuration(durationHours);

    await saveState(newState);
    await scheduleFastingNotifications(now);
  };

  const endFast = async () => {
    const newState = {
      isFasting: false,
      startTime: null,
      targetDuration: targetDuration, // Keep the last chosen duration for next time
    };

    setIsFasting(false);
    setStartTime(null);

    await saveState(newState);
    await cancelAllNotifications();
  };

  return {
    isFasting,
    startTime,
    targetDuration,
    isLoading,
    startFast,
    endFast
  };
}
