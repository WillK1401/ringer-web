import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, UserPlus, Check, X } from 'lucide-react';
import { Spinner } from '../components/Spinner';
import { connectionsApi } from '../lib/api';

export function Connections() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'connections' | 'pending'>('connections');

  useEffect(() => {
    Promise.all([connectionsApi.getMyConnections(), connectionsApi.getPending()])
      .then(([conns, pend]) => { setConnections(conns); setPending(pend); })
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (connectionId: string) => {
    await connectionsApi.accept(connectionId);
    setPending(prev => prev.filter(p => p.connection.id !== connectionId));
    connectionsApi.getMyConnections().then(setConnections);
  };

  const handleDecline = async (connectionId: string) => {
    await connectionsApi.remove(connectionId);
    setPending(prev => prev.filter(p => p.connection.id !== connectionId));
  };

  return (
    <div className="min-h-screen pb-[90px]" style={{ backgroundColor: '#F0EDE6' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 0' }}>
        <button onClick={() => navigate('/profile')} className="flex items-center gap-1 mb-4" aria-label="Back to Profile">
          <ArrowLeft size={20} strokeWidth={1.5} color="#1a1a1a" />
        </button>
        <h1 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 42, color: '#1a1a1a', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 32 }}>
          Connections
        </h1>

      {/* Tabs */}
      <div className="px-6 mb-5">
        <div className="flex gap-0" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, overflow: 'hidden' }}>
          {(['connections', 'pending'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className="flex-1 py-2 relative"
              style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 500, color: tab === t ? '#F0EDE6' : '#666', backgroundColor: tab === t ? '#042b2b' : 'transparent', borderRight: t === 'connections' ? '1px solid rgba(0,0,0,0.08)' : 'none' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'pending' && pending.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: tab === 'pending' ? 'rgba(255,255,255,0.2)' : '#042b2b', color: '#F0EDE6', fontSize: 11 }}>
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading && <Spinner />}

      {!loading && tab === 'connections' && (
        <div className="px-6">
          {connections.length === 0 ? (
            <div className="py-12 text-center">
              <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#999', marginBottom: 8 }}>No connections yet.</div>
              <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#ccc' }}>Share your profile link to invite people.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map(({ connection, user }) => (
                <div key={connection.id} className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                  <div className="rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ width: 40, height: 40, backgroundColor: '#E0DDD6' }}>
                    <span style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 500, color: '#666' }}>
                      {user.displayName?.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 14, color: '#1a1a1a' }}>{user.displayName}</div>
                    <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#999' }}>@{user.handle} · {user.city}</div>
                  </div>
                  <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#ccc' }}>{user.gamesPlayed} games</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && tab === 'pending' && (
        <div className="px-6">
          {pending.length === 0 ? (
            <div className="py-12 text-center">
              <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#999' }}>No pending requests.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(({ connection, requester }) => (
                <div key={connection.id} className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                  <div className="rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ width: 40, height: 40, backgroundColor: '#E0DDD6' }}>
                    <span style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 500, color: '#666' }}>
                      {requester.displayName?.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 14, color: '#1a1a1a' }}>{requester.displayName}</div>
                    <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#999' }}>@{requester.handle}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(connection.id)}
                      className="rounded-full flex items-center justify-center"
                      style={{ width: 36, height: 36, backgroundColor: '#042b2b' }}>
                      <Check size={16} strokeWidth={2} color="#F0EDE6" />
                    </button>
                    <button onClick={() => handleDecline(connection.id)}
                      className="rounded-full flex items-center justify-center"
                      style={{ width: 36, height: 36, backgroundColor: 'rgba(0,0,0,0.08)' }}>
                      <X size={16} strokeWidth={2} color="#666" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      </div>{/* /max-width */}
    </div>
  );
}
