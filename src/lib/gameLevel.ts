/**
 * How hard the game will be · deliberately not how good the player is.
 *
 * Ranking people ("beginner / intermediate / pro") makes them self-deselect
 * or over-claim, and both send them to the wrong game. Describing the game
 * is a statement of fact nobody has to rank themselves against.
 */
export type GameLevel = 'relaxed' | 'competitive' | 'full_tilt';

export const GAME_LEVELS: { key: GameLevel; label: string; sub: string }[] = [
  { key: 'relaxed',     label: 'Relaxed',     sub: "Everyone gets a game. Nobody's counting." },
  { key: 'competitive', label: 'Competitive', sub: 'We play to win, but it stays friendly.' },
  { key: 'full_tilt',   label: 'Full tilt',   sub: 'High tempo. Expect to be pushed.' },
];

export function levelLabel(level?: string | null): string {
  return GAME_LEVELS.find(l => l.key === level)?.label ?? 'Competitive';
}

export function levelSub(level?: string | null): string {
  return GAME_LEVELS.find(l => l.key === level)?.sub ?? '';
}

/** Tint by intensity · calm green through to clay for the hardest games. */
export function levelColors(level?: string | null): { fg: string; bg: string } {
  switch (level) {
    case 'relaxed':   return { fg: 'var(--rx-green)', bg: 'var(--rx-green-tint)' };
    case 'full_tilt': return { fg: 'var(--rx-clay)',  bg: '#F6ECE5' };
    default:          return { fg: 'var(--rx-ink-soft)', bg: 'var(--rx-chip)' };
  }
}
