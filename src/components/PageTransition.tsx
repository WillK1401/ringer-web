import { motion, useReducedMotion } from 'framer-motion';
import { useLocation, useNavigationType } from 'react-router';
import { pageVariants, resolveVariantKey } from '../lib/transitions';

interface Props {
  children: React.ReactNode;
}

export function PageTransition({ children }: Props) {
  const location     = useLocation();
  const navType      = useNavigationType();
  const reducedMotion = useReducedMotion() ?? false;

  const key        = resolveVariantKey(navType, location.pathname, reducedMotion);
  const variants   = pageVariants[key];

  return (
    <motion.div
      key={location.pathname}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ width: '100%', willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  );
}
