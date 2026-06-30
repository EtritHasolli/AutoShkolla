import { useState, useEffect } from 'react';

// Returns true while the given media query matches. Updates on resize.
export function useMediaQuery(query) {
  const get = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(get);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = () => setMatches(mql.matches);
    handler();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Convenience: true on phone-width screens.
export function useIsMobile(bp = 860) {
  return useMediaQuery(`(max-width: ${bp}px)`);
}
