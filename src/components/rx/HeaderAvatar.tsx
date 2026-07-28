import { useNavigate } from 'react-router';
import { loadProfile } from '../../lib/sampleWorld';

/**
 * The "You" affordance. Profile is no longer a bottom-bar tab (the bar is
 * down to Home · Gather · Activity), so identity lives as this avatar in the
 * top-right of the main screens' headers.
 */
export function HeaderAvatar() {
  const navigate = useNavigate();
  const me = loadProfile();
  return (
    <button
      onClick={() => navigate('/profile')}
      aria-label="You"
      style={{
        width: 32, height: 32, borderRadius: '50%', background: 'var(--rx-card)', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        fontSize: 12, fontWeight: 700, color: 'var(--rx-green)', cursor: 'pointer',
      }}
    >
      {me.init}
    </button>
  );
}
