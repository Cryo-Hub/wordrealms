import { isSupabaseConfigured, supabase } from './client';
import { ensureProfileForUser } from './userProfileService';

/** Aktueller Schlüssel für rein lokalen Gast (Fallback ohne Supabase-Session). */
export const GUEST_USER_ID_KEY = 'guest_user_id';
const LEGACY_GUEST_KEY = 'wordrealms_guest_session';
const AUTH_EVT = 'wordrealms-auth-change';

const SIGNIN_ANON_TIMEOUT_MS = 12_000;

export type SimpleUser = { id: string };

function readLocalGuestId(): string | null {
  return localStorage.getItem(GUEST_USER_ID_KEY) ?? localStorage.getItem(LEGACY_GUEST_KEY);
}

function getLocalGuestUser(): SimpleUser | null {
  const id = readLocalGuestId();
  return id ? { id } : null;
}

/** Nur lokaler Gast: UUID anlegen und Event feuern. Liefert immer ein User-Objekt. */
function activateLocalGuestSession(): SimpleUser {
  const id = crypto.randomUUID();
  localStorage.setItem(GUEST_USER_ID_KEY, id);
  try {
    localStorage.removeItem(LEGACY_GUEST_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(AUTH_EVT));
  return { id };
}

function clearLocalGuestSession(): void {
  try {
    localStorage.removeItem(GUEST_USER_ID_KEY);
    localStorage.removeItem(LEGACY_GUEST_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Zuerst Supabase Anonymous Auth; bei Fehler, Timeout oder fehlendem User: lokaler Gast.
 * Löst immer auf (kein Hängen).
 */
export async function signInAnonymously(): Promise<SimpleUser> {
  if (!isSupabaseConfigured) {
    return activateLocalGuestSession();
  }

  const timeoutResult = new Promise<{ data: null; error: { message: string } }>((resolve) => {
    setTimeout(
      () => resolve({ data: null, error: { message: 'signInAnonymously_timeout' } }),
      SIGNIN_ANON_TIMEOUT_MS,
    );
  });

  let data: Awaited<ReturnType<typeof supabase.auth.signInAnonymously>>['data'];
  let error: Awaited<ReturnType<typeof supabase.auth.signInAnonymously>>['error'];

  try {
    const raced = await Promise.race([supabase.auth.signInAnonymously(), timeoutResult]);
    if ('error' in raced && raced.error?.message === 'signInAnonymously_timeout') {
      return activateLocalGuestSession();
    }
    const res = raced as Awaited<ReturnType<typeof supabase.auth.signInAnonymously>>;
    data = res.data;
    error = res.error;
  } catch {
    return activateLocalGuestSession();
  }

  if (error) {
    return activateLocalGuestSession();
  }

  const userId = data.user?.id ?? data.session?.user?.id;
  if (!userId) {
    return activateLocalGuestSession();
  }

  clearLocalGuestSession();
  try {
    await ensureProfileForUser(userId);
  } catch {
    /* Profil optional; Gast bleibt eingeloggt */
  }
  window.dispatchEvent(new CustomEvent(AUTH_EVT));
  return { id: userId };
}

/**
 * Stellt sicher, dass eine Supabase-Session existiert (sonst anonym anmelden).
 * Kein Aufruf nötig, wenn Supabase nicht konfiguriert ist.
 */
export async function ensureAuth(): Promise<void> {
  if (!isSupabaseConfigured) return;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) return;
  await signInAnonymously();
}

export async function signOut(): Promise<void> {
  clearLocalGuestSession();
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
  }
  window.dispatchEvent(new CustomEvent(AUTH_EVT));
}

/**
 * Liefert den aktuellen Nutzer ohne `getUser()` (Server-Roundtrip).
 * `getSession()` nutzt nur den lokalen JWT-Cache und vermeidet 401 bei fehlendem/abgelaufenem Token.
 * Ohne Session: anonym anmelden (persistiert über Supabase-Client in localStorage).
 */
export async function getCurrentUser(): Promise<SimpleUser | null> {
  if (!isSupabaseConfigured) {
    return getLocalGuestUser();
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.id) {
      return { id: session.user.id };
    }
  } catch {
    /* Session lesen fehlgeschlagen */
  }

  try {
    return await signInAnonymously();
  } catch {
    return getLocalGuestUser();
  }
}

export function onAuthStateChange(cb: (user: SimpleUser | null) => void): () => void {
  const handler = () => {
    void getCurrentUser().then(cb);
  };
  window.addEventListener(AUTH_EVT, handler);
  if (isSupabaseConfigured) {
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          await ensureProfileForUser(session.user.id);
        } catch {
          /* ignore */
        }
        cb({ id: session.user.id });
        return;
      }
      cb(getLocalGuestUser());
    });
    return () => {
      window.removeEventListener(AUTH_EVT, handler);
      data.subscription.unsubscribe();
    };
  }
  handler();
  return () => window.removeEventListener(AUTH_EVT, handler);
}
