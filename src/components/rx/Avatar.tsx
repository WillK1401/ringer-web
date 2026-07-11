import type { Person } from '../../lib/sampleWorld';

interface AvatarProps {
  person: Person;
  size?: number;
  ring?: string;      // border colour for stacking
  live?: boolean;     // green presence dot
  liveRing?: string;  // background the dot's border blends into
  style?: React.CSSProperties;
}

export function Avatar({ person, size = 44, ring, live, liveRing = '#FBFAF7', style }: AvatarProps) {
  const dotSize = Math.max(10, Math.round(size * 0.27));
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: person.color, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.round(size * 0.34), fontWeight: 600,
        border: ring ? `2.5px solid ${ring}` : 'none',
        position: 'relative',
        ...style,
      }}
      aria-label={person.name}
    >
      {person.init}
      {live && (
        <span style={{
          position: 'absolute', bottom: 0, right: 0,
          width: dotSize, height: dotSize, borderRadius: '50%',
          background: '#6FA84E', border: `2.5px solid ${liveRing}`,
        }} />
      )}
    </div>
  );
}
