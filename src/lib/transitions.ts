import type { Variants } from 'framer-motion';

// Apple-style easing: snappy decelerate on enter, fast ease-in on exit
const EASE_ENTER = [0.22, 1, 0.36, 1] as const;
const EASE_EXIT  = [0.55, 0, 1, 0.45] as const;
const DUR  = 0.28;
const EDUR = 0.14;

const enter = { duration: DUR,  ease: EASE_ENTER };
const exit  = { duration: EDUR, ease: EASE_EXIT  };

export const pageVariants: Record<string, Variants> = {
  // Same-level tab switch → crossfade only
  tab: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: enter },
    exit:    { opacity: 0, transition: exit  },
  },
  // Drill into a detail → slide in from the right
  push: {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0,  transition: enter },
    exit:    { opacity: 0, x: -16, transition: exit },
  },
  // Browser back / POP → slide in from the left
  pop: {
    initial: { opacity: 0, x: -24 },
    animate: { opacity: 1, x: 0,  transition: enter },
    exit:    { opacity: 0, x: 16, transition: exit  },
  },
  // Post-game sheet → slide up from below
  modal: {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0,  transition: enter },
    exit:    { opacity: 0, y: 32, transition: exit  },
  },
  // prefers-reduced-motion → fade only, shorter duration
  reduced: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.15 } },
    exit:    { opacity: 0, transition: { duration: 0.10 } },
  },
};

const TAB_PATHS = new Set(['/', '/network', '/gather', '/notifications', '/profile', '/groups', '/connections', '/chat', '/map']);

export function resolveVariantKey(
  navType: string,
  pathname: string,
  reducedMotion: boolean,
): keyof typeof pageVariants {
  if (reducedMotion)              return 'reduced';
  if (navType === 'POP')          return 'pop';
  if (pathname === '/post')       return 'modal';
  if (TAB_PATHS.has(pathname))    return 'tab';
  return 'push';
}
