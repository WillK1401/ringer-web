import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, MoreHorizontal, MapPin, ChevronRight } from 'lucide-react';
import { groupsApi } from '../lib/api';
import { Spinner } from '../components/Spinner';
import { formatDate, formatTime } from '../lib/utils';

// Design tokens
const BG = '#F0EDE6';
const FG = '#1a1a1a';
const GREEN = '#042b2b';
const MUTED = '#999';
const CARD = 'rgba(0,0,0,0.03)';

interface GroupGame {
  id: string;
  kickoffAt: string;
  venue: string;
  playerCount: number;
  filledCount: number;
}

interface GroupMember {
  id: string;
  displayName: string;
}

interface GroupFull {
  id: string;
  name: string;
  memberCount: number;
  role: 'organiser' | 'member';
  description?: string;
  visibility: string;
  members: GroupMember[];
  games: GroupGame[];
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

export function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    groupsApi
      .getGroup(id!)
      .then((g: GroupFull) => active && setGroup(g))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100%', background: BG }}>
        <Spinner size={28} />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100%', background: BG, fontSize: 15, color: '#666' }}>
        Group not found.
      </div>
    );
  }

  const stack = group.members.slice(0, 6);
  const overflow = group.memberCount - stack.length;

  return (
    <div className="flex flex-col" style={{ height: '100%', background: BG }}>
      <header className="flex items-center justify-between" style={{ padding: '8px 18px', flexShrink: 0 }}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center"
          style={{ width: 38, height: 38, borderRadius: 999, background: 'rgba(0,0,0,0.04)', border: 'none' }}
          aria-label="Back"
        >
          <ChevronLeft size={22} color={FG} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 500, color: FG }}>Group</span>
        <button
          className="flex items-center justify-center"
          style={{ width: 38, height: 38, borderRadius: 999, background: 'rgba(0,0,0,0.04)', border: 'none' }}
          aria-label="More"
        >
          <MoreHorizontal size={18} color={FG} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto" style={{ padding: '8px 24px 24px' }}>
        {/* Group header */}
        <div className="flex items-center" style={{ gap: 16 }}>
          <div
            className="flex items-center justify-center"
            style={{ width: 62, height: 62, borderRadius: 18, flexShrink: 0, background: 'rgba(4,43,43,0.1)', color: GREEN, fontSize: 22, fontWeight: 600 }}
          >
            {initials(group.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: FG, margin: 0, lineHeight: 1.2 }}>
              {group.name}
            </h1>
            <div className="flex items-center" style={{ gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 13, color: MUTED }}>{group.memberCount} members</span>
              <span
                style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.03em', color: GREEN, background: 'rgba(4,43,43,0.08)', borderRadius: 999, padding: '3px 9px', textTransform: 'uppercase' }}
              >
                {group.role}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center" style={{ gap: 7, marginTop: 14, fontSize: 13, color: '#666' }}>
          <MapPin size={14} color={MUTED} />
          {group.visibility}
        </div>

        {group.description && (
          <p style={{ fontSize: 14, lineHeight: 1.55, color: '#444', margin: '16px 0 0' }}>
            {group.description}
          </p>
        )}

        {/* Members */}
        <button
          onClick={() => navigate(`/groups/${group.id}/members`)}
          className="flex items-center w-full text-left"
          style={{ gap: 14, marginTop: 20, padding: '14px 16px', background: CARD, borderRadius: 16, border: 'none' }}
        >
          <div className="flex">
            {stack.map((m, i) => (
              <div
                key={m.id}
                className="flex items-center justify-center"
                style={{ width: 32, height: 32, borderRadius: 999, background: '#e4dfd5', border: `2px solid ${BG}`, fontSize: 10, fontWeight: 600, color: '#555', marginLeft: i === 0 ? 0 : -10 }}
              >
                {initials(m.displayName)}
              </div>
            ))}
            {overflow > 0 && (
              <div
                className="flex items-center justify-center"
                style={{ width: 32, height: 32, borderRadius: 999, background: '#e4dfd5', border: `2px solid ${BG}`, fontSize: 10, fontWeight: 600, color: '#555', marginLeft: -10 }}
              >
                +{overflow}
              </div>
            )}
          </div>
          <div className="flex-1" style={{ fontSize: 14, fontWeight: 500, color: FG }}>
            {group.memberCount} members
          </div>
          <ChevronRight size={20} color="#ccc" />
        </button>

        {/* Upcoming games */}
        <div style={{ fontSize: 13, fontWeight: 500, color: MUTED, letterSpacing: '0.02em', margin: '24px 0 10px' }}>
          UPCOMING GAMES
        </div>
        {group.games.length === 0 ? (
          <div style={{ padding: '20px 16px', background: CARD, borderRadius: 16, fontSize: 14, color: MUTED, textAlign: 'center' }}>
            No upcoming games yet.
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: 10 }}>
            {group.games.map((gm) => {
              const open = gm.filledCount < gm.playerCount;
              return (
                <button
                  key={gm.id}
                  onClick={() => navigate(`/game/${gm.id}`)}
                  className="flex items-center w-full text-left"
                  style={{ gap: 14, padding: '14px 16px', background: CARD, borderRadius: 16, border: 'none' }}
                >
                  <div style={{ width: 56, textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: GREEN, letterSpacing: '0.03em' }}>{formatDate(gm.kickoffAt)}</div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{formatTime(gm.kickoffAt)}</div>
                  </div>
                  <div style={{ width: 1, height: 34, background: 'rgba(0,0,0,0.08)', flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 14, fontWeight: 500, color: FG }}>{gm.venue}</div>
                    <div style={{ fontSize: 12, marginTop: 3, color: open ? '#16a34a' : MUTED }}>
                      {gm.filledCount}/{gm.playerCount} · {open ? 'spots open' : 'full'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ flexShrink: 0, padding: '14px 24px 28px', borderTop: '1px solid rgba(0,0,0,0.06)', background: BG }}>
        <button
          onClick={() => navigate(`/post?groupId=${group.id}`)}
          style={{ width: '100%', background: GREEN, color: BG, borderRadius: 999, padding: 16, fontSize: 16, fontWeight: 500, border: 'none' }}
        >
          Post a game to this group
        </button>
      </div>
    </div>
  );
}
