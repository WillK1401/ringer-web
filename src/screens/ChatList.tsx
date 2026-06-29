import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Spinner } from '../components/Spinner';
import { chatsApi } from '../lib/api';

export function ChatList() {
  const navigate = useNavigate();
  const [chats, setChats] = useState<{ id: string; venue: string; kickoff_at: string; role: 'organiser' | 'player' }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatsApi.getMyChats().then(setChats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-[90px]" style={{ backgroundColor: '#F0EDE6' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 0' }}>
        <h1 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 42, color: '#1a1a1a', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 32 }}>
          Chat
        </h1>

        {loading ? (
          <Spinner />
        ) : chats.length === 0 ? (
          <div className="pt-8 flex flex-col items-center text-center">
            <h2 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 22, color: '#1a1a1a', marginBottom: 10, letterSpacing: '-0.02em' }}>
              No active chats
            </h2>
            <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#666', lineHeight: 1.6, maxWidth: 260, marginBottom: 32 }}>
              When you join or post a game, the chat thread will appear here.
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
              style={{ backgroundColor: '#042b2b', color: '#F0EDE6', fontFamily: 'Inter', fontWeight: 600, fontSize: 15, padding: '14px 32px', borderRadius: 50, border: 'none', cursor: 'pointer', minHeight: 52 }}
            >
              Browse games
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chats.map((chat) => {
              const date   = new Date(chat.kickoff_at);
              const isPast = date < new Date();
              return (
                <button
                  key={chat.id}
                  onClick={() => navigate(`/chat/thread?gameId=${chat.id}`)}
                  className="game-card w-full text-left"
                  style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      className="rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ width: 44, height: 44, backgroundColor: chat.role === 'organiser' ? '#042b2b' : 'rgba(4,43,43,0.1)' }}
                    >
                      <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: chat.role === 'organiser' ? '#F0EDE6' : '#042b2b', letterSpacing: '-0.01em' }}>
                        {chat.venue.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 15, color: '#1a1a1a', marginBottom: 3 }}>
                        {chat.venue}
                      </div>
                      <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#666' }}>
                        {date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {' · '}
                        <span style={{ color: chat.role === 'organiser' ? '#042b2b' : '#666', fontWeight: chat.role === 'organiser' ? 500 : 400 }}>
                          {chat.role === 'organiser' ? 'Organiser' : 'Player'}
                        </span>
                        {isPast && <span style={{ color: '#bbb' }}> · Past</span>}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 18, color: '#bbb', flexShrink: 0, marginLeft: 12 }}>›</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
