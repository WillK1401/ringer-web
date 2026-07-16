/** Shimmer skeleton block. Compose these to mirror a screen's final layout. */
export function Skeleton({ w, h = 14, r, style }: { w?: number | string; h?: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="sk" aria-hidden style={{ width: w ?? '100%', height: h, borderRadius: r ?? 8, ...style }} />;
}

/** Game Detail loading placeholder — matches the real screen's rhythm. */
export function GameDetailSkeleton() {
  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto' }} aria-busy="true" aria-label="Loading game">
      <div style={{ padding: '6px 24px 130px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 20 }}>
          <Skeleton w={54} h={14} />
          <Skeleton w={64} h={30} r={99} />
        </div>
        <Skeleton w="72%" h={30} r={8} style={{ marginBottom: 12 }} />
        <Skeleton w={110} h={22} r={99} style={{ marginBottom: 32 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 36 }}>
          {[0, 1, 2].map(i => <Skeleton key={i} h={64} r={16} />)}
        </div>
        <Skeleton w={90} h={12} style={{ marginBottom: 16 }} />
        <Skeleton h={80} r={18} style={{ marginBottom: 36 }} />
        <Skeleton w={120} h={20} style={{ marginBottom: 20 }} />
        <div style={{ display: 'flex', gap: 16 }}>
          {[0, 1, 2, 3].map(i => <Skeleton key={i} w={52} h={52} r={26} />)}
        </div>
      </div>
    </div>
  );
}
