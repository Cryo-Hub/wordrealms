const KEYS = [
  'wordrealms-resources',
  'wordrealms-daily',
  'wordrealms-world',
  'wordrealms-settings',
  'wordrealms-premium-dismiss',
  'wordrealms-rewarded-ad',
  'onboarding_complete',
  'wordrealms_install_ts',
  'wordrealms_guest_session',
  'guest_user_id',
];

export function resetAllProgress(): void {
  for (const k of KEYS) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }
  window.location.reload();
}
