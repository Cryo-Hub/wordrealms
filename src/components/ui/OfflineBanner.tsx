import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { subscribeOnline } from '../../services/offlineManager';
import { useTranslation } from '../../i18n';

export function OfflineBanner() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => subscribeOnline((on) => setShow(!on)), []);

  return (
    <AnimatePresence>
      {show && !dismissed ? (
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          className="fixed left-0 right-0 top-[72px] z-50 mx-auto flex max-w-[430px] items-center justify-between gap-2 border-b border-[var(--border-blood)] bg-[var(--bg-elevated)] px-3 py-2 font-body text-xs text-[var(--text-secondary)] backdrop-blur"
        >
          <span>{t('offline.banner')}</span>
          <button
            type="button"
            className="btn-secondary px-2 py-1 text-[10px] uppercase"
            onClick={() => setDismissed(true)}
          >
            {t('offline.dismiss')}
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
