interface Props {
  avatars?: string[];
  initials?: string[];
  max?: number;
  size?: number;
}

export function AvatarStack({ avatars = [], initials = [], max = 4, size = 28 }: Props) {
  const display = avatars.length > 0 ? avatars.slice(0, max) : initials.slice(0, max);
  const remaining = Math.max(avatars.length, initials.length) - max;
  const hasPhotos = avatars.length > 0;

  return (
    <div className="flex items-center">
      {display.map((item, i) => (
        <div
          key={i}
          className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
          style={{
            width: size, height: size,
            marginLeft: i > 0 ? -8 : 0,
            border: '1.5px solid #F0EDE6',
            backgroundColor: '#E0DDD6',
            fontFamily: 'Inter', fontSize: size * 0.35, fontWeight: 500, color: '#666',
          }}
        >
          {hasPhotos
            ? <img src={item} alt="" className="w-full h-full object-cover" />
            : item}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className="rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            width: size, height: size,
            marginLeft: -8,
            border: '1.5px solid #F0EDE6',
            backgroundColor: '#E0DDD6',
            fontFamily: 'Inter', fontSize: 10, fontWeight: 500, color: '#666',
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
