import type { ReactNode } from 'react';

type OrnamentFrameProps = {
  children: ReactNode;
  className?: string;
};

function Corner({ className }: { className?: string }) {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" className={className} aria-hidden>
      <path
        d="M1 1v6h2V3h4V1H1zm0 10v6h6v-2H3v-4H1z"
        fill="currentColor"
        fillOpacity={0.75}
      />
    </svg>
  );
}

/** Dezente goldene Eckverzierungen. */
export function OrnamentFrame({ children, className = '' }: OrnamentFrameProps) {
  return (
    <div className={`relative ${className}`}>
      <Corner className="pointer-events-none absolute left-0 top-0 text-[var(--border-gold-bright)]" />
      <Corner className="pointer-events-none absolute right-0 top-0 rotate-90 text-[var(--border-gold-bright)]" />
      <Corner className="pointer-events-none absolute bottom-0 left-0 -rotate-90 text-[var(--border-gold-bright)]" />
      <Corner className="pointer-events-none absolute bottom-0 right-0 rotate-180 text-[var(--border-gold-bright)]" />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
