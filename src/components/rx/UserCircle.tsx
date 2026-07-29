import { useState } from 'react';

interface UserCircleProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: number;
  background?: string;
  style?: React.CSSProperties;
}

function initialsOf(name?: string | null): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Avatar for a real account from the API · shows their photo when they have
 * one, falling back to initials. (The sample-world cast uses <Avatar>.)
 */
export function UserCircle({ name, avatarUrl, size = 30, background = '#6E9A82', style }: UserCircleProps) {
  const [broken, setBroken] = useState(false);
  const showPhoto = Boolean(avatarUrl) && !broken;

  return (
    <span
      style={{
        position: 'relative', width: size, height: size, borderRadius: '50%',
        background, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.round(size * 0.37), fontWeight: 600, flexShrink: 0, overflow: 'hidden',
        ...style,
      }}
      aria-label={name || undefined}
    >
      {showPhoto
        ? <img src={avatarUrl!} alt="" onError={() => setBroken(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : initialsOf(name)}
    </span>
  );
}
