type Tier = 'first' | 'second' | 'public';

const LABELS: Record<Tier, string> = { first: '1st', second: '2nd', public: 'Public' };

export function VisibilityBadge({ type }: { type: Tier }) {
  return (
    <span
      style={{
        fontFamily: 'Inter', fontSize: 10, fontWeight: 500,
        letterSpacing: '0.05em', textTransform: 'uppercase',
        color: '#111', border: '1px solid #C8C4BC',
        padding: '2px 6px', display: 'inline-block',
      }}
    >
      {LABELS[type]}
    </span>
  );
}
