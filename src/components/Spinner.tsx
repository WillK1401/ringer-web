export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center w-full py-12">
      <div
        style={{
          width: size, height: size,
          border: '2px solid rgba(0,0,0,0.1)',
          borderTopColor: '#042b2b',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
