import type { RootScreen, TabId } from '../../types/navigation';
import { useTranslation } from '../../i18n';

type NavigationBarProps = {
  active: TabId;
  onNavigate: (screen: RootScreen) => void;
};

const tabs: { id: TabId; labelKey: string; icon: string }[] = [
  { id: 'home', labelKey: 'nav.home', icon: '🏠' },
  { id: 'game', labelKey: 'nav.play', icon: '⚔️' },
  { id: 'world', labelKey: 'nav.world', icon: '🌍' },
  { id: 'league', labelKey: 'nav.league', icon: '🏆' },
];

export function NavigationBar({ active, onNavigate }: NavigationBarProps) {
  const { t } = useTranslation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[42] border-t border-[#2a2018] bg-[rgba(8,6,4,0.97)] px-1 py-2">
      <div className="mx-auto flex max-w-[430px] items-stretch justify-around gap-0">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`relative flex min-h-[48px] min-w-[44px] flex-1 flex-col items-center justify-center rounded-[8px] transition active:scale-95 ${
                isActive ? 'text-[#c9a227]' : 'text-[#4a3828]'
              }`}
            >
              <span className="text-xl leading-none" aria-hidden>
                {tab.icon}
              </span>
              <span className="mt-0.5 font-cinzel text-[11px] font-semibold leading-tight">{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
