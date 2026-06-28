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
      <div className="px-6 pb-5" style={{ paddingTop: 48 }}>
        <h1 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 42, color: '#1a1a1a', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
          Chat
        </h1>
      </div>

      {loading ? (
        <Spinner />
      ) : chats.length === 0 ? (
        <div className="px-6 pt-8 flex flex-col items-center text-center">
          <h2 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 22, color: '#1a1a1a', marginBottom: 10, letterSpacing: '-0.02em' }}>
            No active chats
          </h2>
          <div style={{ fontFamily: 'Inter', fontSize: 15, color: '#666', lineHeight: 1.6, maxWidth: 260, marginBottom: 32 }}>
            When you join or post a game, the chat thread will appear here.
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 rounded-full"
            style={{ backgroundColor: '#042b2b', color: '#F0EDE6', fontFamily: 'Inter', fontWeight: 500, fontSize: 15 }}
          >
            Browse games →
          </button>
        </div>
      ) : (
        <div className="px-6 flex flex-col gap-3">
          {chats.map((chat) => {
            const date = new Date(chat.kickoff_at);
            const isPast = date < new Date();
            return (
              <button
                key={chat.id}
                onClick={() => navigate(`/chat/thread?gameId=${chat.id}`)}
                className="w-full text-left p-4 rounded-2xl flex items-center justify-between"
                style={{ backgroundColor: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ width: 40, height: 40, backgroundColor: chat.role === 'organiser' ? '#042b2b' : 'rgba(4,43,43,0.1)' }}>
                    <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: chat.role === 'organiser' ? '#F0EDE6' : '#042b2b', letterSpacing: '-0.01em' }}>
                      {chat.venue.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 14, color: '#1a1a1a', marginBottom: 2 }}>
                      {chat.venue}
                    </div>
                    <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#999' }}>
                      {date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {' · '}
                      <span style={{ color: chat.role === 'organiser' ? '#042b2b' : '#999' }}>
                        {chat.role === 'organiser' ? 'Organiser' : 'Player'}
                      </span>
                      {isPast && <span style={{ color: '#ccc' }}> · Past</span>}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 16, color: '#ccc' }}>›</div>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}
