interface Props { total: number; filled: number; size?: number; }

export function SlotBar({ total, filled, size = 6 }: Props) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ width: size, height: size, backgroundColor: i < filled ? '#111' : '#E0DDD6' }} />
      ))}
    </div>
  );
}
