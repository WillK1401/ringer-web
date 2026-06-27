import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Spinner } from '../components/Spinner';
import { gamesApi } from '../lib/api';
import { formatTime } from '../lib/utils';

// Fix Leaflet default marker icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export function NearMeMap() {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  // Init map once
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    const map = L.map(mapRef.current, {
      center: [51.505, -0.09], // London default
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    leafletRef.current = map;

    return () => {
      map.remove();
      leafletRef.current = null;
    };
  }, []);

  // Load games
  useEffect(() => {
    gamesApi.getFeed({ day: 'all' }).then(setGames).finally(() => setLoading(false));
  }, []);

  // Try to get user location and centre map
  useEffect(() => {
    if (!leafletRef.current) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          leafletRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 13);
        },
        () => { /* permission denied — keep London default */ }
      );
    }
  }, []);

  // Add/update markers when games load
  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const withCoords = games.filter(g => g.venueLatitude && g.venueLongitude);

    withCoords.forEach((game) => {
      const priceStr = `£${Math.round((game.costPerPlayer ?? 0) / 100)}`;
      const icon = L.divIcon({
        html: `<div style="
          background:#042b2b;color:#F0EDE6;
          font-family:Inter,sans-serif;font-size:11px;font-weight:500;
          padding:4px 8px;border-radius:20px;white-space:nowrap;
          box-shadow:0 2px 8px rgba(0,0,0,0.25);
          border:1.5px solid rgba(255,255,255,0.15);
        ">${priceStr}</div>`,
        className: '',
        iconAnchor: [20, 16],
      });

      const marker = L.marker([game.venueLatitude, game.venueLongitude], { icon });
      marker.addTo(map);
      marker.on('click', () => {
        setSelected(game.id);
        // Scroll to the game card
        document.getElementById(`game-${game.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (withCoords.length > 0) {
      const bounds = L.latLngBounds(withCoords.map(g => [g.venueLatitude, g.venueLongitude]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [games]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh', backgroundColor: '#F0EDE6', paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ padding: '24px 24px 16px' }}>
        <h1 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 32, color: '#1a1a1a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
          Near Me
        </h1>
      </div>

      {/* Map */}
      <div
        ref={mapRef}
        style={{
          height: 280,
          width: '100%',
          flexShrink: 0,
        }}
      />

      {/* Game list */}
      <div style={{ flex: 1, padding: '16px 24px 0', overflowY: 'auto' }}>
        {loading && <Spinner />}

        {!loading && games.length === 0 && (
          <div style={{ paddingTop: 40, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#999', marginBottom: 20 }}>
              No games nearby right now.
            </div>
            <button
              onClick={() => navigate('/post')}
              style={{ padding: '12px 24px', borderRadius: 999, backgroundColor: '#042b2b', color: '#F0EDE6', fontFamily: 'Inter', fontSize: 14, fontWeight: 500 }}
            >
              Post one →
            </button>
          </div>
        )}

        {!loading && games.length > 0 && (
          <div>
            <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 13, color: '#999', marginBottom: 12 }}>
              {games.length} game{games.length !== 1 ? 's' : ''} nearby
            </div>
            {games.map((game, i) => {
              const isSelected = selected === game.id;
              const priceStr = `£${Math.round((game.costPerPlayer ?? 0) / 100)}`;
              const open = Math.max(0, (game.playerCount ?? 10) - (game.confirmedPlayers?.length ?? 0) - 1);
              return (
                <button
                  id={`game-${game.id}`}
                  key={game.id}
                  onClick={() => navigate(`/game/${game.id}`)}
                  style={{
                    display: 'flex',
                    width: '100%',
                    textAlign: 'left',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 0',
                    borderBottom: i < games.length - 1 ? '1px solid rgba(0,0,0,0.07)' : 'none',
                    background: isSelected ? 'rgba(4,43,43,0.04)' : 'transparent',
                    borderRadius: isSelected ? 12 : 0,
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    backgroundColor: game.venueLatitude ? '#042b2b' : 'rgba(0,0,0,0.15)',
                    flexShrink: 0, marginLeft: 4,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 15, color: '#1a1a1a', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {game.venue}
                    </div>
                    <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#999', fontWeight: 400 }}>
                      {formatTime(game.kickoffAt)} · {open} spot{open !== 1 ? 's' : ''} open
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 15, color: '#1a1a1a', flexShrink: 0 }}>
                    {priceStr}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
