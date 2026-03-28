import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { getSocket } from '../lib/socket';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  sentAt: string;
  isSystem: boolean;
  systemType?: string;
}

export function ChatThread() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');
  const groupId = searchParams.get('groupId');
  const threadName = searchParams.get('name') || 'Chat';
  const threadSub = searchParams.get('sub') || '';

  const { getToken, userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = await getToken();
      if (!token || !mounted) return;
      const socket = getSocket(token);
      socketRef.current = socket;

      socket.on('connect', () => { if (mounted) setConnected(true); });
      socket.on('disconnect', () => { if (mounted) setConnected(false); });

      if (gameId) {
        socket.emit('join:game', gameId);
        socket.on('chat:message', (msg: Message) => {
          if (mounted) setMessages(prev => [...prev, msg]);
        });
        socket.on('game:slot_taken', () => {
          if (mounted) setMessages(prev => [...prev, {
            id: Date.now().toString(), senderId: 'system', senderName: 'system',
            body: 'A spot was just taken', sentAt: new Date().toISOString(),
            isSystem: true, systemType: 'slot_taken',
          }]);
        });
      }
      if (groupId) {
        socket.emit('join:group', groupId);
        socket.on('chat:message', (msg: Message) => {
          if (mounted) setMessages(prev => [...prev, msg]);
        });
      }
    })();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.off('chat:message');
        socketRef.current.off('game:slot_taken');
      }
    };
  }, [gameId, groupId, getToken]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit('chat:send', { gameId, groupId, body: input.trim() });
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      senderId: userId || 'me',
      senderName: 'You',
      body: input.trim(),
      sentAt: new Date().toISOString(),
      isSystem: false,
    }]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#F0EDE6' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-6 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-5">
          <ArrowLeft size={22} strokeWidth={1.5} color="#1a1a1a" />
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 20, color: '#1a1a1a', lineHeight: 1.3, marginBottom: 4, letterSpacing: '-0.01em' }}>
              {threadName}
            </div>
            {threadSub && (
              <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#999', fontWeight: 400 }}>{threadSub}</div>
            )}
          </div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: connected ? '#22c55e' : '#e5e7eb', marginTop: 6, flexShrink: 0 }} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <div className="flex justify-center mt-8">
            <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#ccc', fontWeight: 400 }}>
              No messages yet. Say something 👋
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === userId || msg.senderName === 'You';

          if (msg.isSystem) {
            return (
              <div key={msg.id} className="flex justify-center mb-6">
                <div className="px-4 py-2 rounded-full"
                  style={{ fontFamily: 'Inter', fontSize: 12, color: '#999', backgroundColor: 'rgba(0,0,0,0.03)', fontWeight: 400 }}>
                  {msg.body}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`mb-5 ${isMe ? 'flex justify-end' : ''}`}>
              <div style={{ maxWidth: '75%' }}>
                {!isMe && (
                  <div style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 500, color: '#999', marginBottom: 6 }}>
                    {msg.senderName}
                  </div>
                )}
                <div
                  className="px-4 py-3"
                  style={{
                    fontFamily: 'Inter', fontSize: 15, fontWeight: 400, lineHeight: 1.4,
                    color: isMe ? '#F0EDE6' : '#1a1a1a',
                    backgroundColor: isMe ? '#042b2b' : 'rgba(0,0,0,0.05)',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  }}
                >
                  {msg.body}
                </div>
                <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#ccc', marginTop: 6, textAlign: isMe ? 'right' : 'left', fontWeight: 400 }}>
                  {new Date(msg.sentAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-6 py-4"
        style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            className="flex-1 py-3 px-4 rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)', border: 'none', fontFamily: 'Inter', fontSize: 15, color: '#1a1a1a', fontWeight: 400 }}
          />
          <button
            onClick={sendMessage}
            className="rounded-full flex items-center justify-center flex-shrink-0"
            style={{ width: 46, height: 46, backgroundColor: '#042b2b' }}
          >
            <Send size={18} strokeWidth={2} color="#F0EDE6" />
          </button>
        </div>
      </div>
    </div>
  );
}
