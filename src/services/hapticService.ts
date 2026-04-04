import { useSettingsStore } from '../stores/settingsStore';

function enabled(): boolean {
  try {
    return useSettingsStore.getState().hapticEnabled && 'vibrate' in navigator;
  } catch {
    return false;
  }
}

export const hapticService = {
  light() {
    if (!enabled()) return;
    navigator.vibrate(10);
  },
  medium() {
    if (!enabled()) return;
    navigator.vibrate(25);
  },
  heavy() {
    if (!enabled()) return;
    navigator.vibrate([40, 30, 40]);
  },
};
