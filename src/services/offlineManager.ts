type Queued = { fn: () => Promise<void> };

const queue: Queued[] = [];
let online = typeof navigator !== 'undefined' ? navigator.onLine : true;

export function isOnline(): boolean {
  return online;
}

export function subscribeOnline(cb: (v: boolean) => void): () => void {
  const up = () => {
    online = true;
    cb(true);
    void flushQueue();
  };
  const down = () => {
    online = false;
    cb(false);
  };
  window.addEventListener('online', up);
  window.addEventListener('offline', down);
  cb(online);
  return () => {
    window.removeEventListener('online', up);
    window.removeEventListener('offline', down);
  };
}

export function enqueueWhenOffline(fn: () => Promise<void>): void {
  if (online) {
    void fn();
    return;
  }
  queue.push({ fn });
}

async function flushQueue(): Promise<void> {
  while (queue.length && online) {
    const q = queue.shift();
    if (q) await q.fn().catch(() => {});
  }
}
