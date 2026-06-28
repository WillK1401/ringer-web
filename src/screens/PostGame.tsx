import { useState } from 'react';
import { useNavigate } from 'react-router';
import { VenueAutocomplete } from '../components/VenueAutocomplete';
import { FormSection } from '../components/ui/FormSection';
import { gamesApi, paymentsApi } from '../lib/api';

type Visibility = 'first' | 'second' | 'public';
type Recurrence = 'once' | 'weekly' | 'fortnightly';

const REC_OPTS: { key: Recurrence; label: string }[] = [
  { key: 'once',        label: 'One-off'     },
  { key: 'weekly',      label: 'Weekly'      },
  { key: 'fortnightly', label: 'Fortnightly' },
];

const VIS_OPTS: { key: Visibility; label: string; description: string }[] = [
  {
    key: 'first',
    label: 'Friends',
    description: 'Only your direct connections can see this game.',
  },
  {
    key: 'second',
    label: 'Friends of Friends',
    description: 'Friends and their connections can join.',
  },
  {
    key: 'public',
    label: 'Public',
    description: 'Visible to everyone nearby on Ringer.',
  },
];

// Minimum date = today (prevent past dates)
function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function PostGame() {
  const navigate = useNavigate();
  const [venue,       setVenue]      = useState('');
  const [venueLat,    setVenueLat]   = useState<number | undefined>();
  const [venueLng,    setVenueLng]   = useState<number | undefined>();
  const [date,        setDate]       = useState('');
  const [time,        setTime]       = useState('');
  const [players,     setPlayers]    = useState(10);
  const [pitchCost,   setPitchCost]  = useState('');
  const [visibility,  setVisibility] = useState<Visibility>('second');
  const [recurrence,  setRecurrence] = useState<Recurrence>('once');
  const [loading,     setLoading]    = useState(false);
  const [error,       setError]      = useState('');
  const [stripeNeeded, setStripeNeeded] = useState(false);

  const pitchCostNum = parseFloat(pitchCost) || 0;
  const perPlayer    = players > 0 && pitchCostNum > 0 ? pitchCostNum / players : 0;

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
      const kickoffAt       = new Date(`${date}T${time}`).toISOString();
      const pitchCostPence  = Math.round(pitchCostNum * 100);
      await gamesApi.postGame({
        venue,
        venueLatitude:  venueLat,
        venueLongitude: venueLng,
        kickoffAt,
        format:         '5-a-side',
        playerCount:    players,
        pitchCost:      pitchCostPence,
        visibility,
        autoEscalate:   true,
      });
      navigate('/');
    } catch (e: any) {
      if (e.message?.includes('STRIPE_NOT_ONBOARDED')) {
        setStripeNeeded(true);
      } else {
        setError(e.message || 'Failed to post game. Please try again.');
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
      <div
        className="min-h-screen pb-[80px] flex flex-col justify-center"
        style={{ backgroundColor: '#F0EDE6', padding: '0 24px' }}
      >
        <h1 style={headingStyle}>Set up payments first</h1>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#666', lineHeight: 1.7, marginBottom: 40, fontWeight: 400 }}>
          Connect a Stripe account to post games and collect payment from ringers. Takes about 5 minutes.
        </p>
        <button
          onClick={handleStripeOnboard}
          disabled={loading}
          className="btn-primary"
          style={{
            backgroundColor: '#042b2b',
            color: '#F0EDE6',
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: 16,
            padding: '16px 24px',
            borderRadius: 50,
            border: 'none',
            cursor: 'pointer',
            marginBottom: 16,
            minHeight: 52,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Redirecting…' : 'Connect with Stripe →'}
        </button>
        <button
          onClick={() => setStripeNeeded(false)}
          style={{ fontFamily: 'Inter', fontSize: 14, color: '#666', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }}
        >
          ← Back to form
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[80px]" style={{ backgroundColor: '#F0EDE6' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px 0' }}>

        {/* Page title */}
        <h1 style={{ ...headingStyle, marginBottom: 8 }}>Post a Game</h1>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#666', marginBottom: 0, fontWeight: 400 }}>
          Fill in the details below and your game will appear in your connections' feeds.
        </p>

        {/* ── Game Details ──────────────────────────────────────────── */}
        <FormSection title="Game Details">
          <div>
            <label htmlFor="venue" style={labelStyle}>
              Venue <span aria-hidden="true" style={{ color: '#c8102e' }}>*</span>
            </label>
            <VenueAutocomplete value={venue} onChange={handleVenueChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" style={labelStyle}>
                Date <span aria-hidden="true" style={{ color: '#c8102e' }}>*</span>
              </label>
              <input
                id="date"
                type="date"
                value={date}
                min={todayISO()}
                onChange={(e) => setDate(e.target.value)}
                aria-required="true"
                style={{ ...inputStyle, color: date ? '#1a1a1a' : '#999' }}
              />
            </div>
            <div>
              <label htmlFor="time" style={labelStyle}>
                Time <span aria-hidden="true" style={{ color: '#c8102e' }}>*</span>
              </label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                aria-required="true"
                style={{ ...inputStyle, color: time ? '#1a1a1a' : '#999' }}
              />
            </div>
          </div>
        </FormSection>

        {/* ── Game Setup ────────────────────────────────────────────── */}
        <FormSection title="Game Setup">
          <div>
            <fieldset style={{ border: 'none', padding: 0 }}>
              <legend style={labelStyle}>Recurrence</legend>
              <div
                className="flex rounded-xl overflow-hidden"
                style={{ backgroundColor: 'rgba(0,0,0,0.04)', padding: 4, gap: 2 }}
              >
                {REC_OPTS.map(({ key, label }) => {
                  const isActive = recurrence === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRecurrence(key)}
                      className={`seg-btn flex-1 rounded-lg${isActive ? ' seg-active' : ''}`}
                      aria-pressed={isActive}
                      style={{
                        fontFamily: 'Inter',
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#F0EDE6' : '#555',
                        backgroundColor: isActive ? '#042b2b' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 150ms ease, color 150ms ease',
                        padding: '10px 8px',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <div>
            <label htmlFor="players" style={labelStyle}>Maximum Players</label>
            <input
              id="players"
              type="number"
              value={players}
              onChange={(e) => setPlayers(Math.max(2, parseInt(e.target.value) || 10))}
              min={2}
              max={22}
              aria-describedby="players-hint"
              style={inputStyle}
            />
            <p id="players-hint" style={helperStyle}>Including yourself as organiser</p>
          </div>
        </FormSection>

        {/* ── Pricing ───────────────────────────────────────────────── */}
        <FormSection title="Pricing">
          <div>
            <label htmlFor="pitch-cost" style={labelStyle}>
              Total Pitch Cost (£) <span aria-hidden="true" style={{ color: '#c8102e' }}>*</span>
            </label>
            <div
              className="flex items-center rounded-xl"
              style={{ backgroundColor: 'rgba(0,0,0,0.03)', border: '1px solid transparent' }}
            >
              <span
                style={{ fontFamily: 'Inter', fontSize: 15, color: '#666', marginLeft: 16, fontWeight: 400, flexShrink: 0 }}
                aria-hidden="true"
              >
                £
              </span>
              <input
                id="pitch-cost"
                type="number"
                value={pitchCost}
                onChange={(e) => setPitchCost(e.target.value)}
                placeholder="80"
                className="flex-1"
                min={0}
                aria-required="true"
                style={{ ...inputStyle, backgroundColor: 'transparent', border: 'none', paddingLeft: 8 }}
              />
            </div>
          </div>

          {pitchCostNum > 0 && (
            <div
              className="flex justify-between items-center py-4 px-5 rounded-2xl"
              style={{ backgroundColor: 'rgba(4,43,43,0.05)' }}
              aria-live="polite"
              aria-label={`Each player pays approximately £${perPlayer % 1 === 0 ? perPlayer.toFixed(0) : perPlayer.toFixed(2)}`}
            >
              <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#555', fontWeight: 400 }}>
                Each player pays approximately
              </span>
              <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 20, color: '#1a1a1a' }}>
                £{perPlayer % 1 === 0 ? perPlayer.toFixed(0) : perPlayer.toFixed(2)}
              </span>
            </div>
          )}
        </FormSection>

        {/* ── Visibility ────────────────────────────────────────────── */}
        <FormSection title="Who can see this game?">
          <fieldset style={{ border: 'none', padding: 0 }}>
            <legend className="sr-only">Game visibility</legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {VIS_OPTS.map(({ key, label, description }) => {
                const isActive = visibility === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setVisibility(key)}
                    className={`vis-card text-left${isActive ? ' vis-active' : ''}`}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 14,
                      border: `1.5px solid ${isActive ? '#042b2b' : 'rgba(0,0,0,0.08)'}`,
                      backgroundColor: isActive ? 'rgba(4,43,43,0.05)' : 'rgba(0,0,0,0.02)',
                      width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      {/* Radio dot */}
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: `2px solid ${isActive ? '#042b2b' : '#bbb'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'border-color 150ms ease',
                        }}
                        aria-hidden="true"
                      >
                        {isActive && (
                          <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#042b2b' }} />
                        )}
                      </div>
                      <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 15, color: '#1a1a1a' }}>
                        {label}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#666', lineHeight: 1.5, marginLeft: 26, fontWeight: 400 }}>
                      {description}
                    </p>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </FormSection>

        {/* ── Actions ───────────────────────────────────────────────── */}
        <div style={{ paddingTop: 40, paddingBottom: 40 }}>
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                fontFamily: 'Inter',
                fontSize: 14,
                color: '#c8102e',
                backgroundColor: 'rgba(200,16,46,0.06)',
                padding: '12px 16px',
                borderRadius: 12,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <span aria-hidden="true" style={{ flexShrink: 0 }}>⚠</span>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              minHeight: 52,
              backgroundColor: '#042b2b',
              color: '#F0EDE6',
              fontFamily: 'Inter',
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 50,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 16,
              opacity: loading ? 0.6 : 1,
            }}
            aria-busy={loading}
          >
            {loading ? 'Posting…' : 'Post Game'}
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              fontFamily: 'Inter',
              fontSize: 14,
              color: '#666',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '10px 0',
            }}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'Inter',
  fontWeight: 700,
  fontSize: 42,
  color: '#1a1a1a',
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
  marginBottom: 32,
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'Inter',
  fontSize: 15,
  color: '#2a2a2a',
  display: 'block',
  marginBottom: 8,
  fontWeight: 500,
};

const helperStyle: React.CSSProperties = {
  fontFamily: 'Inter',
  fontSize: 13,
  color: '#666',
  marginTop: 6,
  fontWeight: 400,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 12,
  backgroundColor: 'rgba(0,0,0,0.03)',
  border: '1px solid transparent',
  fontFamily: 'Inter',
  fontSize: 15,
  color: '#1a1a1a',
  fontWeight: 400,
  minHeight: 48,
};
