import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '@clerk/clerk-react';
import { loadProfile, saveProfile } from '../../lib/sampleWorld';
import { usersApi } from '../../lib/api';

const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // Clerk's limit

const label: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--rx-ghost)', marginBottom: 8, display: 'block',
};

const field: React.CSSProperties = {
  width: '100%', fontSize: 15, fontFamily: 'inherit', padding: '13px 16px',
  borderRadius: 14, border: '1px solid #E7E2D9', background: '#fff',
  color: 'var(--rx-ink)', outline: 'none',
};

export function EditProfile() {
  const navigate = useNavigate();
  const { user } = useUser();
  const fileRef = useRef<HTMLInputElement>(null);
  const [p, setP]       = useState(loadProfile());
  const [saved, setSaved] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const photo = user?.hasImage ? user.imageUrl : null;

  // Clerk stores the image · we mirror the resulting URL onto our own account
  const onPickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // let the same file be re-picked after an error
    if (!file) return;
    if (!file.type.startsWith('image/')) { setPhotoError('That file is not an image.'); return; }
    if (file.size > MAX_PHOTO_BYTES) { setPhotoError('That image is too large · 10MB max.'); return; }

    setPhotoError('');
    setPhotoBusy(true);
    try {
      const updated = await user!.setProfileImage({ file });
      const url = updated?.publicUrl ?? user!.imageUrl;
      if (url) await usersApi.updateMe({ avatarUrl: url }).catch(() => {});
      await user!.reload();
    } catch {
      setPhotoError('Could not update your photo · try again.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const onRemovePhoto = async () => {
    setPhotoError('');
    setPhotoBusy(true);
    try {
      await user!.setProfileImage({ file: null });
      await user!.reload();
    } catch {
      setPhotoError('Could not remove your photo · try again.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const set = (k: keyof typeof p) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setP(prev => ({ ...prev, [k]: e.target.value }));
    setSaved(false);
  };

  const initial = (p.name.trim()[0] || 'W').toUpperCase();

  const onSave = () => {
    const name = p.name.trim() || 'Player';
    saveProfile({ name, city: p.city.trim(), oneLiner: p.oneLiner.trim() });
    // Push to the real account; local copy is already saved either way
    usersApi.updateMe({ displayName: name, city: p.city.trim() }).catch(() => {});
    setSaved(true);
    setTimeout(() => navigate('/profile'), 500);
  };

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '6px 24px 120px' }}>
        <button
          onClick={() => navigate('/profile')}
          aria-label="Back to your sporting life"
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', fontSize: 12.5, fontWeight: 600, color: '#726D64', cursor: 'pointer', padding: '6px 0 14px' }}
        >
          ‹ Sporting Life
        </button>

        <h2 style={{ margin: '0 0 4px', fontSize: 25, fontWeight: 700, letterSpacing: '-0.02em' }}>Edit profile</h2>
        <div className="serif" style={{ fontSize: 15.5, color: 'var(--rx-muted)', marginBottom: 28 }}>
          Your sporting life tells your story · this is just the top of it.
        </div>

        {/* Photo · Clerk hosts it. Google sign-ins arrive with one already. */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={photoBusy}
            aria-label={photo ? 'Change your profile photo' : 'Upload a profile photo'}
            style={{
              position: 'relative', width: 84, height: 84, borderRadius: '50%',
              background: p.color, color: '#fff', border: 'none', padding: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, fontWeight: 600, cursor: photoBusy ? 'default' : 'pointer',
              opacity: photoBusy ? 0.6 : 1,
            }}
          >
            {/* Rounded on the image itself · clipping the button would cut off the camera badge */}
            {photo
              ? <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} />
              : initial}
            {/* Camera badge */}
            <span aria-hidden style={{
              position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%',
              background: 'var(--rx-green)', border: '2.5px solid var(--rx-paper)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 8.5h3l1.5-2h7L17 8.5h3v10H4v-10Z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="3" stroke="#fff" strokeWidth="2" />
              </svg>
            </span>
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onPickPhoto}
            style={{ display: 'none' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={photoBusy}
              style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: 'var(--rx-green)', cursor: photoBusy ? 'default' : 'pointer', padding: 0 }}
            >
              {photoBusy ? 'Updating…' : photo ? 'Change photo' : 'Add a photo'}
            </button>
            {photo && !photoBusy && (
              <button
                onClick={onRemovePhoto}
                style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: 'var(--rx-faint)', cursor: 'pointer', padding: 0 }}
              >
                Remove
              </button>
            )}
          </div>

          {photoError && (
            <div role="alert" style={{ fontSize: 12.5, color: 'var(--rx-error)', marginTop: 8, textAlign: 'center' }}>
              {photoError}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <label style={label} htmlFor="ep-name">Name</label>
            <input id="ep-name" style={field} value={p.name} onChange={set('name')} placeholder="Your name" />
          </div>
          <div>
            <label style={label} htmlFor="ep-city">City</label>
            <input id="ep-city" style={field} value={p.city} onChange={set('city')} placeholder="Where you play" />
          </div>
          <div>
            <label style={label} htmlFor="ep-oneliner">One line</label>
            <input id="ep-oneliner" style={field} value={p.oneLiner} onChange={set('oneLiner')} placeholder="e.g. Wednesday football. Sunday tennis." maxLength={48} />
            <div style={{ fontSize: 12, color: 'var(--rx-ghost)', marginTop: 6 }}>
              One line, no bio · your history speaks for you.
            </div>
          </div>
        </div>

        <button
          onClick={onSave}
          aria-label="Save profile"
          style={{ width: '100%', marginTop: 30, background: 'var(--rx-green)', color: '#fff', border: 'none', fontSize: 16, fontWeight: 600, padding: 16, borderRadius: 99, cursor: 'pointer', boxShadow: '0 12px 24px -12px rgba(62, 82, 54,0.5)', letterSpacing: '-0.01em' }}
        >
          {saved ? 'Saved ✓' : 'Save'}
        </button>

        {/* Account & payments · the legacy settings surface, demoted */}
        <div style={{ marginTop: 34 }}>
          <div style={{ ...label, marginBottom: 12 }}>Account</div>
          <button
            onClick={() => navigate('/settings')}
            aria-label="Payments and account settings"
            style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', background: '#fff', border: '1px solid #EEEAE3', borderRadius: 16, padding: 16, cursor: 'pointer' }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>Payments &amp; account</div>
              <div style={{ fontSize: 12.5, color: 'var(--rx-faint)', marginTop: 2 }}>Stripe payouts, sign-out, connected details</div>
            </div>
            <span style={{ fontSize: 16, color: '#C2BBB0' }}>›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
