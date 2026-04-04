import { Capacitor } from '@capacitor/core';
import { useSettingsStore } from '../stores/settingsStore';

function webEnabled(): boolean {
  try {
    return useSettingsStore.getState().hapticEnabled && 'vibrate' in navigator;
  } catch {
    return false;
  }
}

async function nativeImpact(style: 'Light' | 'Medium' | 'Heavy'): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    const map = {
      Light: ImpactStyle.Light,
      Medium: ImpactStyle.Medium,
      Heavy: ImpactStyle.Heavy,
    } as const;
    await Haptics.impact({ style: map[style] });
    return true;
  } catch {
    return false;
  }
}

function webVibrate(pattern: number | number[]) {
  if (!webEnabled()) return;
  navigator.vibrate(pattern);
}

export const hapticService = {
  light() {
    void (async () => {
      if (await nativeImpact('Light')) return;
      webVibrate(10);
    })();
  },
  medium() {
    void (async () => {
      if (await nativeImpact('Medium')) return;
      webVibrate(25);
    })();
  },
  heavy() {
    void (async () => {
      if (await nativeImpact('Heavy')) return;
      webVibrate([40, 30, 40]);
    })();
  },
};
