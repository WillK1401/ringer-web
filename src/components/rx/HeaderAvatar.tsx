import { useNavigate } from 'react-router';
import { useUser } from '@clerk/clerk-react';
import { loadProfile } from '../../lib/sampleWorld';

/**
 * The "You" affordance. Profile is no longer a bottom-bar tab (the bar is
 * down to Home · Gather · Activity), so identity lives as this avatar in the
 * top-right of the main screens' headers.
 *
 * Clerk hosts the profile photo · it arrives automatically for Google
 * sign-ins and is replaced by any photo the user uploads. Falls back to the
 * initial when there is no photo.
 */
export function HeaderAvatar() {
  const navigate = useNavigate();
  const { user } = useUser();
  const me = loadProfile();
  const photo = user?.imageUrl && user?.hasImage ? user.imageUrl : null;

  return (
    <button
      onClick={() => navigate('/profile')}
      aria-label="You"
      style={{
        position: 'relative', width: 32, height: 32, borderRadius: '50%',
        background: 'var(--rx-card)', border: 'none', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        fontSize: 12, fontWeight: 700, color: 'var(--rx-green)', cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      {photo
        ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : me.init}
    </button>
  );
}
