import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { VenueAutocomplete } from '../components/VenueAutocomplete';
import { gamesApi, paymentsApi } from '../lib/api';

type Visibility = 'first' | 'second' | 'public';
type Recurrence = 'once' | 'weekly' | 'fortnightly';

const VIS_OPTS: { key: Visibility; label: string }[] = [
  { key: 'first', label: '1st' },
  { key: 'second', label: '2nd' },
  { key: 'public', label: 'Public' },
];

const REC_OPTS: { key: Recurrence; label: string }[] = [
  { key: 'once', label: 'One-off' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'fortnightly', label: 'Fortnightly' },
];

const VIS_HINT: Record<Visibility, string> = {
  first: 'Only your direct connections can see this.',
  second: 'Friends of friends can also see it.',
  public: 'Anyone on Ringer can find this game.',
};

export function PostGame() {
  const navigate = useNavigate();
  const [venue, setVenue] = useState('');
  const [venueLat, setVenueLat] = useState<number | undefined>();
  const [venueLng, setVenueLng] = useState<number | undefined>();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [players, setPlayers] = useState(10);
  const [pitchCost, setPitchCost] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('second');
  const [recurrence, setRecurrence] = useState<Recurrence>('once');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stripeNeeded, setStripeNeeded] = useState(false);

  const pitchCostNum = parseFloat(pitchCost) || 0;
  const perPlayer = players > 0 && pitchCostNum > 0 ? (pitchCostNum / players) : 0;

  const handleVenueChange = (name: string, lat?: number, lng?: number) => {
    setVenue(name);
    setVenueLat(lat);
    setVenueLng(lng);
  };

  const handleSubmit = async () => {
    if (!venue || !date || !time || !pitchCost) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const kickoffAt = new Date(`${date}T${time}`).toISOString();
      const pitchCostPence = Math.round(pitchCostNum * 100);
      await gamesApi.postGame({
        venue,
        venueLatitude: venueLat,
        venueLongitude: venueLng,
        kickoffAt,
        format: '5-a-side',
        playerCount: players,
        pitchCost: pitchCostPence,
        visibility,
        autoEscalate: true,
      });
      navigate('/');
    } catch (e: any) {
      if (e.message?.includes('STRIPE_NOT_ONBOARDED')) {
        setStripeNeeded(true);
      } else {
        setError(e.message || 'Failed to post game');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStripeOnboard = async () => {
    setLoading(true);
    try {
      const { onboardingUrl } = await paymentsApi.startOnboarding();
      window.location.href = onboardingUrl;
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  if (stripeNeeded) {
    return (
      <div className="min-h-screen pb-[80px] px-6 flex flex-col justify-center" style={{ backgroundColor: '#F0EDE6' }}>
        <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 24, color: '#1a1a1a', marginBottom: 12 }}>
          Set up payments first
        </div>
        <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#999', lineHeight: 1.6, marginBottom: 32, fontWeight: 400 }}>
          Connect a Stripe account to post games and collect payment from ringers. Takes about 5 minutes.
        </div>
        <button onClick={handleStripeOnboard} disabled={loading} className="w-full py-4 rounded-full mb-4"
          style={{ backgroundColor: '#635bff', color: '#fff', fontFamily: 'Inter', fontWeight: 500, fontSize: 16 }}>
          {loading ? 'Redirecting…' : 'Connect with Stripe →'}
        </button>
        <button onClick={() => setStripeNeeded(false)}
          style={{ display: 'block', width: '100%', textAlign: 'center', fontFamily: 'Inter', fontSize: 14, color: '#999' }}>
          Back
        </button>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[80px]" style={{ backgroundColor: '#F0EDE6' }}>
        {/* Header */}
        <div className="px-6 pt-6 pb-8">
          <h1 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 32, color: '#1a1a1a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Post a Game
          </h1>
        </div>

        <div className="px-6 space-y-6">
          {/* Venue */}
          <div>
            <label style={labelStyle}>Venue</label>
            <VenueAutocomplete value={venue} onChange={handleVenueChange} />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                style={{ ...inputStyle, color: date ? '#1a1a1a' : '#999' }} />
            </div>
            <div>
              <label style={labelStyle}>Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                style={{ ...inputStyle, color: time ? '#1a1a1a' : '#999' }} />
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label style={labelStyle}>Recurrence</label>
            <div className="flex rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
              {REC_OPTS.map(({ key, label }, i) => (
                <button
                  key={key}
                  onClick={() => setRecurrence(key)}
                  className="flex-1 py-3"
                  style={{
                    fontFamily: 'Inter', fontSize: 13, fontWeight: 500,
                    color: recurrence === key ? '#F0EDE6' : '#666',
                    backgroundColor: recurrence === key ? '#042b2b' : 'transparent',
                    borderRight: i < REC_OPTS.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Pitch cost + Players */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Pitch cost (£)</label>
              <div className="flex items-center rounded-xl" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                <div style={{ fontFamily: 'Inter', fontSize: 15, color: '#999', marginLeft: 16, fontWeight: 400 }}>£</div>
                <input
                  type="number"
                  value={pitchCost}
                  onChange={(e) => setPitchCost(e.target.value)}
                  placeholder="80"
                  className="flex-1"
                  style={{ ...inputStyle, backgroundColor: 'transparent', paddingLeft: 8 }}
                  min={0}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Players</label>
              <input
                type="number"
                value={players}
                onChange={(e) => setPlayers(Math.max(2, parseInt(e.target.value) || 10))}
                style={inputStyle}
                min={2}
                max={22}
              />
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label style={labelStyle}>Visibility</label>
            <div className="flex rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
              {VIS_OPTS.map(({ key, label }, i) => (
                <button
                  key={key}
                  onClick={() => setVisibility(key)}
                  className="flex-1 py-3"
                  style={{
                    fontFamily: 'Inter', fontSize: 14, fontWeight: 500,
                    color: visibility === key ? '#F0EDE6' : '#666',
                    backgroundColor: visibility === key ? '#042b2b' : 'transparent',
                    borderRight: i < VIS_OPTS.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#999', marginTop: 8, fontWeight: 400 }}>
              {VIS_HINT[visibility]}
            </div>
          </div>

          {/* Per-player preview */}
          {pitchCostNum > 0 && (
            <div className="py-5 px-5 rounded-2xl" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
              <div className="flex justify-between items-center">
                <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#666', fontWeight: 400 }}>
                  Price per player
                </div>
                <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 20, color: '#1a1a1a' }}>
                  £{perPlayer % 1 === 0 ? perPlayer.toFixed(0) : perPlayer.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#d4183d', backgroundColor: 'rgba(212,24,61,0.08)', padding: '10px 14px', borderRadius: 10 }}>
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-full mb-3"
              style={{ backgroundColor: '#042b2b', color: '#F0EDE6', fontFamily: 'Inter', fontWeight: 500, fontSize: 16, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Posting…' : 'Post Game'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3"
              style={{ fontFamily: 'Inter', fontSize: 14, color: '#999', backgroundColor: 'transparent', fontWeight: 400 }}
            >
              Cancel
            </button>
          </div>
        </div>

      <BottomNav />
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'Inter', fontSize: 13, color: '#999',
  display: 'block', marginBottom: 10, fontWeight: 400,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: 12,
  backgroundColor: 'rgba(0,0,0,0.03)', border: 'none',
  fontFamily: 'Inter', fontSize: 15, color: '#1a1a1a', fontWeight: 400,
};
