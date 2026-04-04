import { useEffect, useState } from 'react';
import { LANGUAGE_CHANGE_EVENT } from '../core/game/dictionaryManager';

/** Erhöht sich bei jedem Sprachwechsel — als Dependency nutzen, um Puzzles neu zu laden. */
export function useLanguageVersion(): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    const h = () => setV((x) => x + 1);
    window.addEventListener(LANGUAGE_CHANGE_EVENT, h);
    return () => window.removeEventListener(LANGUAGE_CHANGE_EVENT, h);
  }, []);
  return v;
}
