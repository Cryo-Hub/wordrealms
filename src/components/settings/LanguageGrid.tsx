import { LANGUAGE_OPTIONS } from '../../constants/languages';

type LanguageGridProps = {
  selected: string;
  onSelect: (code: string) => void;
};

export function LanguageGrid({ selected, onSelect }: LanguageGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {LANGUAGE_OPTIONS.map((opt) => {
        const isSel = selected === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => onSelect(opt.code)}
            className={`flex min-h-[48px] items-center gap-2 rounded-[8px] border border-[#2a2018] bg-[rgba(20,16,12,0.9)] px-3 py-2 text-left font-body text-sm text-[#f0e6cc] transition active:scale-[0.98] ${
              isSel ? 'border-[#c9a227] text-[#c9a227]' : ''
            }`}
          >
            <span className="text-lg" aria-hidden>
              {opt.flag}
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
