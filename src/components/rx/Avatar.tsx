import { useState } from 'react';
import type { Person } from '../../lib/sampleWorld';

interface AvatarProps {
  person: Person;
  size?: number;
  ring?: string;      // border colour for stacking
  live?: boolean;     // green presence dot
  liveRing?: string;  // background the dot's border blends into
  src?: string | null; // profile photo · falls back to initials when absent or broken
  style?: React.CSSProperties;
}

export function Avatar({ person, size = 44, ring, live, liveRing = '#FBFAF7', src, style }: AvatarProps) {
  const dotSize = Math.max(10, Math.round(size * 0.27));
  const [broken, setBroken] = useState(false);
  const showPhoto = Boolean(src) && !broken;

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
      {showPhoto ? (
        // Rounded on the image itself · clipping the parent would cut off the live dot
        <img
          src={src!}
          alt=""
          onError={() => setBroken(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }}
        />
      ) : (
        person.init
      )}
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
