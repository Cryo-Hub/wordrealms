import { motion } from 'framer-motion';

export type WheelLetterProps = {
  letter: string;
  cx: number;
  cy: number;
  r: number;
  index: number;
  isOnPath: boolean;
  isPathEnd: boolean;
};

export function WheelLetter({
  letter,
  cx,
  cy,
  r,
  index,
  isOnPath,
  isPathEnd,
}: WheelLetterProps) {
  return (
    <motion.g
      data-wheel-index={index}
      initial={false}
      animate={{
        scale: isPathEnd ? 1.06 : isOnPath ? 1.03 : 1,
      }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
    >
      <motion.circle
        cx={cx}
        cy={cy}
        r={r}
        fill={isOnPath ? 'rgba(30, 20, 5, 0.95)' : 'rgba(10, 8, 6, 0.85)'}
        stroke={isOnPath ? '#c9a227' : '#6b5510'}
        strokeWidth={isOnPath ? 2 : 1}
        style={{
          filter: isOnPath ? 'drop-shadow(0 0 12px rgba(201, 162, 39, 0.5))' : undefined,
        }}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        className="pointer-events-none select-none font-cinzel font-bold"
        fill={isOnPath ? 'var(--gold-light)' : 'var(--text-primary)'}
        style={{
          fontSize: r * 1.05,
          fontFamily: "'Cinzel', serif",
          fontWeight: 700,
        }}
      >
        {letter}
      </text>
    </motion.g>
  );
}
