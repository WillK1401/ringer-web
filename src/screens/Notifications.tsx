import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, PoundSterling, Clock, CheckCircle2 } from 'lucide-react';
import { notificationsApi, connectionsApi } from '../lib/api';
import { Spinner } from '../components/Spinner';

// Design tokens
const BG = '#F0EDE6';
const FG = '#1a1a1a';
const GREEN = '#042b2b';

type NotifType =
  | 'connection_request'
  | 'connection_accepted'
  | 'game_claimed'
  | 'game_filled'
  | 'payment_received'
  | 'game_joined'
  | 'game_starting';

interface Notification {
  id: string;
  type: NotifType;
  actor?: { id: string; displayName: string; handle?: string } | null;
  title: string;
  body?: string;
  createdAt: string;
  read: boolean;
  connectionId?: string;
  gameId?: string;
  requestStatus?: 'pending' | 'accepted' | 'declined';
}

function initials(name?: string): string {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Yest' : `${d}d`;
}

function chipFor(n: Notification) {
  switch (n.type) {
    case 'payment_received':
      return { useActor: false, Icon: PoundSterling, bg: 'rgba(34,197,94,0.14)', fg: '#16a34a' };
    case 'game_filled':
      return { useActor: false, Icon: CheckCircle2, bg: GREEN, fg: BG };
    case 'game_starting':
      return { useActor: false, Icon: Clock, bg: 'rgba(4,43,43,0.08)', fg: GREEN };
    case 'connection_accepted':
      return { useActor: true, Icon: null, bg: 'rgba(34,197,94,0.14)', fg: '#16a34a' };
    case 'connection_request':
    case 'game_claimed':
      return { useActor: true, Icon: null, bg: 'rgba(4,43,43,0.08)', fg: GREEN };
    default:
      return { useActor: true, Icon: null, bg: 'rgba(0,0,0,0.05)', fg: FG };
  }
}

export function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    notificationsApi
      .list()
      .then((rows: Notification[]) => active && setItems(rows))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const unread = items.filter((n) => !n.read).length;

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    notificationsApi.markRead(id).catch(() => {});
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    notificationsApi.markAllRead().catch(() => {});
  }

  async function resolveRequest(n: Notification, status: 'accepted' | 'declined', e: React.MouseEvent) {
    e.stopPropagation();
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true, requestStatus: status } : x)));
    try {
      if (status === 'accepted') await connectionsApi.accept(n.connectionId!);
      else await connectionsApi.remove(n.connectionId!);
    } catch {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, requestStatus: 'pending' } : x)));
    }
  }

  function onRowClick(n: Notification) {
    if (!n.read) markRead(n.id);
    if (n.gameId) navigate(`/game/${n.gameId}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100%', background: BG }}>
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: '100%', background: BG }}>
      <header className="flex items-end justify-between" style={{ padding: '10px 24px 14px', flexShrink: 0 }}>
        <div className="flex items-center" style={{ gap: 10 }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-0.03em', color: FG, margin: 0, lineHeight: 1.1 }}>Notifications</h1>
          {unread > 0 && (
            <div
              className="flex items-center justify-center"
              style={{ background: GREEN, color: BG, borderRadius: 999, minWidth: 22, height: 22, padding: '0 7px', fontSize: 12, fontWeight: 600 }}
            >
              {unread}
            </div>
          )}
        </div>
        <button onClick={markAllRead} style={{ border: 'none', background: 'none', fontSize: 13, color: GREEN, fontWeight: 500, padding: '6px 0' }}>
          Mark all read
        </button>
      </header>

      <div className="flex-1 overflow-y-auto flex flex-col" style={{ padding: '4px 16px 100px', gap: 6 }}>
        {items.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', fontSize: 14, color: '#999' }}>You're all caught up.</div>
        )}
        {items.map((n) => {
          const chip = chipFor(n);
          const Icon = chip.Icon;
          const isPendingRequest = n.type === 'connection_request' && (n.requestStatus ?? 'pending') === 'pending';
          return (
            <div
              key={n.id}
              onClick={() => onRowClick(n)}
              className="flex"
              style={{ gap: 14, padding: '16px 12px', borderRadius: 16, background: n.read ? 'transparent' : 'rgba(4,43,43,0.05)', cursor: 'pointer', alignItems: 'flex-start' }}
            >
              <div
                className="flex items-center justify-center"
                style={{ width: 42, height: 42, borderRadius: 999, flexShrink: 0, background: chip.bg, color: chip.fg, fontSize: 14, fontWeight: 600 }}
              >
                {chip.useActor ? initials(n.actor?.displayName) : Icon ? <Icon size={18} /> : null}
              </div>

              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 14, lineHeight: 1.4, color: FG }}>
                  {n.actor && <span style={{ fontWeight: 600 }}>{n.actor.displayName} </span>}
                  <span style={{ color: '#444' }}>{n.title}</span>
                </div>
                {n.body && <div style={{ fontSize: 13, color: '#999', marginTop: 3 }}>{n.body}</div>}

                {isPendingRequest && (
                  <div className="flex" style={{ gap: 8, marginTop: 11 }}>
                    <button
                      onClick={(e) => resolveRequest(n, 'accepted', e)}
                      style={{ border: 'none', background: GREEN, color: BG, borderRadius: 999, padding: '9px 20px', fontSize: 13, fontWeight: 500 }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={(e) => resolveRequest(n, 'declined', e)}
                      style={{ border: '1px solid rgba(0,0,0,0.12)', background: 'transparent', color: FG, borderRadius: 999, padding: '9px 20px', fontSize: 13, fontWeight: 500 }}
                    >
                      Decline
                    </button>
                  </div>
                )}
                {n.requestStatus === 'accepted' && (
                  <div className="flex items-center" style={{ gap: 6, marginTop: 10, fontSize: 13, fontWeight: 500, color: '#16a34a' }}>
                    <Check size={15} /> Connection accepted
                  </div>
                )}
                {n.requestStatus === 'declined' && (
                  <div style={{ marginTop: 10, fontSize: 13, color: '#999' }}>Request declined</div>
                )}
              </div>

              <div className="flex flex-col items-end" style={{ gap: 7, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: '#bbb' }}>{timeAgo(n.createdAt)}</span>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: 999, background: GREEN }} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
