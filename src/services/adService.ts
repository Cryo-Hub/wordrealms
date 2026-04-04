const LS_AD_DAY = 'wordrealms-ad-day';
const LS_AD_COUNT = 'wordrealms-ad-count';

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getCount(): number {
  try {
    if (localStorage.getItem(LS_AD_DAY) !== today()) {
      localStorage.setItem(LS_AD_DAY, today());
      localStorage.setItem(LS_AD_COUNT, '0');
      return 0;
    }
    return Math.max(0, parseInt(localStorage.getItem(LS_AD_COUNT) ?? '0', 10) || 0);
  } catch {
    return 0;
  }
}

function bumpCount(): void {
  try {
    const n = getCount() + 1;
    localStorage.setItem(LS_AD_COUNT, String(n));
    localStorage.setItem(LS_AD_DAY, today());
  } catch {
    /* ignore */
  }
}

export function adsWatchedToday(): number {
  return getCount();
}

export function canWatchMoreAds(): boolean {
  return getCount() < 3;
}

export type AdReward =
  | { kind: 'hints'; amount: number }
  | { kind: 'gold'; amount: number }
  | { kind: 'double_gold_session' };

/**
 * Simuliert Rewarded Ad: Modal-Countdown 3s, max 3/Tag.
 */
export function showRewardedAd(_reward: AdReward): Promise<boolean> {
  return new Promise((resolve) => {
    if (!canWatchMoreAds()) {
      resolve(false);
      return;
    }
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-6';
    overlay.innerHTML = `<div class="fantasy-card max-w-sm p-6 text-center">
      <p class="font-cinzel text-lg text-[#c9a227]">📺 Ad Loading...</p>
      <p class="mt-4 font-num text-3xl text-[#f0e6cc]" id="wr-ad-sec">3</p>
    </div>`;
    document.body.appendChild(overlay);
    let left = 3;
    const id = window.setInterval(() => {
      left -= 1;
      const el = document.getElementById('wr-ad-sec');
      if (el) el.textContent = String(Math.max(0, left));
      if (left <= 0) {
        window.clearInterval(id);
        bumpCount();
        document.body.removeChild(overlay);
        resolve(true);
      }
    }, 1000);
  });
}
