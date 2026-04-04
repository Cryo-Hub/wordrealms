type OrnamentDividerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const heights = { sm: 10, md: 14, lg: 18 };

export function OrnamentDivider({ size = 'md', className = '' }: OrnamentDividerProps) {
  const h = heights[size];
  const w = size === 'lg' ? 280 : size === 'md' ? 220 : 160;
  return (
    <div className={`mx-auto flex w-full max-w-md justify-center ${className}`} role="presentation">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="text-[var(--border-gold-bright)]" aria-hidden>
        <line x1={0} y1={h / 2} x2={w / 2 - 16} y2={h / 2} stroke="currentColor" strokeWidth={1} opacity={0.85} />
        <path
          d={`M ${w / 2 - 8} ${h / 2} L ${w / 2} ${h / 2 - 6} L ${w / 2 + 8} ${h / 2} L ${w / 2} ${h / 2 + 6} Z`}
          fill="currentColor"
          opacity={0.9}
        />
        <line x1={w / 2 + 16} y1={h / 2} x2={w} y2={h / 2} stroke="currentColor" strokeWidth={1} opacity={0.85} />
      </svg>
    </div>
  );
}
