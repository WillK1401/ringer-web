import { useState, useRef, useEffect } from 'react';

interface Result {
  place_id: number;
  name: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
}

interface Props {
  value: string;
  onChange: (venue: string, lat?: number, lng?: number) => void;
}

// Shorten display_name to just "Name, Area, City" (drop country/postcode clutter)
function shortAddress(result: Result): string {
  const parts = result.display_name.split(', ');
  // Remove the result name itself from the start if duplicated
  const rest = parts[0] === result.name ? parts.slice(1) : parts;
  // Keep up to 3 meaningful parts, drop "England", "United Kingdom"
  return rest
    .filter(p => !['England', 'United Kingdom', 'UK', 'Wales', 'Scotland'].includes(p))
    .slice(0, 3)
    .join(', ');
}

export function VenueAutocomplete({ value, onChange }: Props) {
  const [suggestions, setSuggestions] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = async (q: string) => {
    if (q.length < 2) { setSuggestions([]); setOpen(false); return; }
    setSearching(true);
    try {
      const params = new URLSearchParams({
        q,
        format: 'json',
        countrycodes: 'gb',
        limit: '6',
        addressdetails: '0',
        namedetails: '1',
        dedupe: '1',
      });
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        { headers: { 'Accept-Language': 'en-GB,en' } }
      );
      const data: Result[] = await res.json();
      // Prefer named places over raw road segments
      const sorted = [...data].sort((a, b) => {
        const priority = (r: Result) =>
          ['leisure', 'amenity', 'sport', 'natural', 'tourism'].includes(r.class) ? 0 : 1;
        return priority(a) - priority(b);
      });
      setSuggestions(sorted);
      setOpen(sorted.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // 400ms debounce — respectful of Nominatim's 1 req/s fair-use policy
    debounceRef.current = setTimeout(() => search(e.target.value), 400);
  };

  const handleSelect = (r: Result) => {
    onChange(r.name, parseFloat(r.lat), parseFloat(r.lon));
    setSuggestions([]);
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={handleInput}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="e.g. Hackney Marshes"
        autoComplete="off"
        style={inputStyle}
      />
      {searching && (
        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14 }}>
          <div style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#042b2b', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      )}

      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          zIndex: 200, backgroundColor: '#fff', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.13)', overflow: 'hidden',
        }}>
          {suggestions.map((r, i) => (
            <button
              key={r.place_id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(r); }}
              className="w-full text-left px-4 py-3"
              style={{
                fontFamily: 'Inter', fontSize: 14, color: '#1a1a1a', fontWeight: 400,
                backgroundColor: 'transparent',
                borderBottom: i < suggestions.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
              }}
            >
              <div style={{ fontWeight: 500, marginBottom: 2, fontSize: 14 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: '#999' }}>{shortAddress(r)}</div>
            </button>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: 12,
  backgroundColor: 'rgba(0,0,0,0.03)', border: 'none',
  fontFamily: 'Inter', fontSize: 15, color: '#1a1a1a', fontWeight: 400,
};
