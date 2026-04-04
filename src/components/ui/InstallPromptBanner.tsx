import { useEffect, useState } from 'react';

const LS_VISITS = 'wordrealms-app-visits';
const LS_DISMISS = 'wordrealms-install-dismissed';

function readVisits(): number {
  try {
    return Math.max(0, parseInt(localStorage.getItem(LS_VISITS) ?? '0', 10) || 0);
  } catch {
    return 0;
  }
}

function writeVisits(n: number): void {
  try {
    localStorage.setItem(LS_VISITS, String(n));
  } catch {
    /* ignore */
  }
}

function isDismissed(): boolean {
  try {
    return localStorage.getItem(LS_DISMISS) === '1';
  } catch {
    return false;
  }
}

function dismiss(): void {
  try {
    localStorage.setItem(LS_DISMISS, '1');
  } catch {
    /* ignore */
  }
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function InstallPromptBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    const v = readVisits() + 1;
    writeVisits(v);
    if (v < 2) return;
    if (isDismissed()) return;
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[88px] z-[90] flex justify-center px-3 sm:bottom-[96px]">
      <div className="pointer-events-auto flex max-w-md flex-col gap-2 rounded-[10px] border border-[#2a2018] bg-[rgba(12,9,6,0.96)] px-4 py-3 shadow-xl backdrop-blur-sm">
        <p className="text-center font-body text-sm text-[#e8dcc8]">
          ⚔️ Play offline — Add to Home Screen
        </p>
        <button
          type="button"
          className="btn-secondary w-full py-2 text-xs"
          onClick={() => {
            dismiss();
            setShow(false);
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
