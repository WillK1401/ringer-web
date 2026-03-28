import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { usersApi } from '../lib/api';
import { Spinner } from '../components/Spinner';

export function Onboarding() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    usersApi.getMe().then((user) => {
      setDisplayName(user.displayName || '');
      setHandle(user.handle || '');
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleChange = (val: string) => {
    setHandle(val.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (displayName.trim().length < 2) { setError('Display name must be at least 2 characters'); return; }
    if (handle.length < 2) { setError('Handle must be at least 2 characters'); return; }
    setSaving(true);
    try {
      await usersApi.updateMe({ displayName: displayName.trim(), handle });
      navigate('/');
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F0EDE6' }}>
      <Spinner />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col px-6" style={{ backgroundColor: '#F0EDE6' }}>
      <div className="pt-16 pb-8">
        <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 28, color: '#042b2b', letterSpacing: '-0.02em', marginBottom: 8 }}>
          ringer.
        </div>
        <h1 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 26, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Set up your profile
        </h1>
        <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#999', lineHeight: 1.6 }}>
          How should other players know you?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 500, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
            Display name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Will Kreibich"
            maxLength={60}
            className="w-full px-4 py-3 rounded-2xl outline-none"
            style={{ fontFamily: 'Inter', fontSize: 16, color: '#1a1a1a', backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}
          />
        </div>

        <div>
          <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 500, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
            Handle
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ fontFamily: 'Inter', fontSize: 16, color: '#999' }}>@</span>
            <input
              type="text"
              value={handle}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="yourhandle"
              maxLength={30}
              className="w-full pl-8 pr-4 py-3 rounded-2xl outline-none"
              style={{ fontFamily: 'Inter', fontSize: 16, color: '#1a1a1a', backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}
            />
          </div>
          <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#999', marginTop: 6 }}>
            Lowercase letters, numbers and underscores only
          </p>
        </div>

        {error && (
          <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#e53e3e' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-full mt-2"
          style={{ backgroundColor: '#042b2b', color: '#F0EDE6', fontFamily: 'Inter', fontWeight: 500, fontSize: 16, opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Saving…' : 'Let\'s go →'}
        </button>
      </form>
    </div>
  );
}
