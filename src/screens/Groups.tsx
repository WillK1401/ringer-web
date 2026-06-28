import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, ChevronRight } from 'lucide-react';
import { groupsApi } from '../lib/api';
import { Spinner } from '../components/Spinner';
import { formatDate, formatTime } from '../lib/utils';

// Design tokens
const BG = '#F0EDE6';
const FG = '#1a1a1a';
const GREEN = '#042b2b';
const MUTED = '#999';

interface GroupSummary {
  id: string;
  name: string;
  memberCount: number;
  nextGame?: { kickoffAt: string; venue?: string; slotsOpen: number; full: boolean } | null;
}

function groupInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

function nextGameLabel(g: GroupSummary): string {
  if (!g.nextGame) return 'No upcoming games';
  const { kickoffAt, slotsOpen, full } = g.nextGame;
  const when = `${formatDate(kickoffAt)} ${formatTime(kickoffAt)}`;
  const spots = full ? 'Full' : `${slotsOpen} spot${slotsOpen === 1 ? '' : 's'} left`;
  return `Next: ${when} · ${spots}`;
}

export function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    groupsApi
      .getMyGroups()
      .then((rows: GroupSummary[]) => active && setGroups(rows))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100%', background: BG }}>
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: '100%', background: BG }}>
      <header className="flex items-center justify-between" style={{ padding: '10px 24px 14px', flexShrink: 0 }}>
        <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-0.03em', color: FG, margin: 0, lineHeight: 1.1 }}>Groups</h1>
        <button
          onClick={() => navigate('/groups/new')}
          className="flex items-center justify-center"
          style={{ width: 38, height: 38, borderRadius: 999, background: GREEN, color: BG, border: 'none' }}
          aria-label="Create group"
        >
          <Plus size={22} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto" style={{ padding: '0 16px 100px' }}>
        {groups.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', fontSize: 14, color: MUTED }}>
            You're not in any groups yet.
          </div>
        )}

        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => navigate(`/groups/${g.id}`)}
            className="flex items-center w-full text-left"
            style={{ gap: 15, padding: '16px 12px', cursor: 'pointer', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
          >
            <div
              className="flex items-center justify-center"
              style={{ width: 50, height: 50, borderRadius: 15, flexShrink: 0, background: 'rgba(4,43,43,0.1)', color: GREEN, fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}
            >
              {groupInitials(g.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 15, fontWeight: 500, color: FG }}>{g.name}</div>
              <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>
                {g.memberCount} members · {nextGameLabel(g)}
              </div>
            </div>
            <ChevronRight size={20} color="#ccc" />
          </button>
        ))}

        <button
          onClick={() => navigate('/groups/new')}
          className="flex items-center justify-center w-full"
          style={{ gap: 8, margin: '20px 12px 0', width: 'calc(100% - 24px)', padding: 15, border: '1px dashed rgba(0,0,0,0.15)', borderRadius: 16, color: '#666', fontSize: 14, fontWeight: 500, background: 'transparent' }}
        >
          <Plus size={18} /> Create a group
        </button>
      </div>
    </div>
  );
}
