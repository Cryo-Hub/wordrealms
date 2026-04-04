import { useState } from 'react';
import { signInAnonymously } from '../services/supabase/auth';
import { useTranslation } from '../i18n';
import { OrnamentDivider } from '../components/ui/OrnamentDivider';

type AuthScreenProps = {
  onAuthed: () => void;
};

export function AuthScreen({ onAuthed }: AuthScreenProps) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  return (
    <>
      <div className="wr-auth-castle-fixed" aria-hidden>
        <div className="wr-auth-castle-ken" />
        <div className="wr-auth-castle-overlay" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center px-6 pb-12 pt-16">
      <div className="mb-3 text-6xl" aria-hidden>
        🛡️
      </div>
      <div className="mb-6 w-full text-center">
        <h1 className="wr-screen-title text-[clamp(28px,7vw,40px)]">{t('auth.title')}</h1>
        <OrnamentDivider size="md" className="my-3" />
        <p className="wr-body text-base italic">{t('auth.subtitle')}</p>
      </div>

      <div className="flex w-full max-w-[430px] flex-col gap-3 px-2">
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await signInAnonymously();
              onAuthed();
            } finally {
              setBusy(false);
            }
          }}
          className="fantasy-button min-h-[52px] w-full"
        >
          {t('auth.play_guest')}
        </button>
        <p className="text-center font-body text-xs text-[var(--text-muted)]">{t('auth.more_options')}</p>
      </div>

      <p className="mt-8 max-w-xs text-center font-body text-xs text-[var(--text-muted)]">{t('auth.guest_disclaimer')}</p>
    </div>
    </>
  );
}
