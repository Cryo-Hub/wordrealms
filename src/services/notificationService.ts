const LS_PERMISSION = 'wordrealms-notify-permission';
const LS_FIRST_NOTIFY = 'wordrealms-notify-first-done';

function readLs(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLs(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function getStoredPermissionState(): NotificationPermission | 'unsupported' {
  if (typeof Notification === 'undefined') return 'unsupported';
  const s = readLs(LS_PERMISSION);
  if (s === 'granted' || s === 'denied' || s === 'default') return s;
  return Notification.permission;
}

export function syncPermissionFromBrowser(): void {
  if (typeof Notification === 'undefined') return;
  writeLs(LS_PERMISSION, Notification.permission);
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (typeof Notification === 'undefined') return 'denied';
  const p = await Notification.requestPermission();
  writeLs(LS_PERMISSION, p);
  return p;
}

/** Einmal nach dem ersten abgeschlossenen Daily-Puzzle um Erlaubnis bitten. */
export async function requestPermissionAfterFirstCompletion(): Promise<void> {
  if (readLs(LS_FIRST_NOTIFY)) return;
  writeLs(LS_FIRST_NOTIFY, '1');
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'granted') {
    scheduleDailyReminder();
    return;
  }
  if (Notification.permission === 'denied') return;
  await requestPermission();
  scheduleDailyReminder();
}

let dailyTimer: ReturnType<typeof setTimeout> | undefined;

export function scheduleDailyReminder(): void {
  if (typeof window === 'undefined') return;
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;

  const run = () => {
    if (dailyTimer) clearTimeout(dailyTimer);
    const now = new Date();
    const next = new Date(now);
    next.setHours(8, 0, 0, 0);
    if (next.getTime() <= now.getTime()) {
      next.setDate(next.getDate() + 1);
    }
    const ms = next.getTime() - now.getTime();
    dailyTimer = setTimeout(() => {
      void showDailyReminderNotification();
      run();
    }, ms);
  };
  run();
}

async function showDailyReminderNotification(): Promise<void> {
  if (Notification.permission !== 'granted') return;
  const title = 'WordRealms';
  const body =
    '⚔️ Your daily WordRealms puzzle is ready! Can you keep your streak?';
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg) {
      await reg.showNotification(title, { body, icon: '/assets/icon-192.png', badge: '/assets/icon-192.png' });
      return;
    }
  } catch {
    /* fallback */
  }
  try {
    new Notification(title, { body, icon: '/assets/icon-192.png' });
  } catch {
    /* ignore */
  }
}

export function showLeagueReset(): void {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  const title = 'WordRealms';
  const body = '🏆 League reset! Check your new rank, warrior.';
  try {
    new Notification(title, { body, icon: '/assets/icon-192.png' });
  } catch {
    /* ignore */
  }
}
