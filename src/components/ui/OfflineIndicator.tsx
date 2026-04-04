import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Eigenständiger Offline-Hinweis (englischer Standardtext).
 * Ergänzt die bestehende i18n-Offline-Logik mit einem dezenten Top-Banner.
 */
export function OfflineIndicator() {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const on = () => setOnline(navigator.onLine);
    window.addEventListener('online', on);
    window.addEventListener('offline', on);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', on);
    };
  }, []);

  return (
    <AnimatePresence>
      {!online ? (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none fixed left-0 right-0 top-0 z-[60] mx-auto max-w-[430px] px-3 pt-[max(0.5rem,env(safe-area-inset-top))] text-center"
        >
          <span className="inline-block rounded-b-[8px] border border-[#2a2018] border-t-0 bg-[rgba(8,6,4,0.92)] px-3 py-1.5 font-body text-[11px] text-[#a89880] shadow-md backdrop-blur-sm">
            ⚔️ Playing offline — scores sync when connected
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
