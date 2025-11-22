import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextValue {
  user: import('@supabase/supabase-js').User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileHydrated, setProfileHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    // Guard: global timeout fallback to avoid perpetual loading states
    const loadingWatchdog = setTimeout(() => {
      if (mounted) {
        console.warn('[AuthContext] Watchdog: forcing loading=false after timeout');
        setLoading(false);
      }
    }, 15000);

    const adminEmailsRaw = (import.meta.env.VITE_ADMIN_EMAILS || '').trim();
    const adminEmailSet = new Set(
      adminEmailsRaw.length ? adminEmailsRaw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean) : []
    );

    const isAdminOverride = (email?: string | null) => {
      if (!email) return false;
      return adminEmailSet.has(email.toLowerCase());
    };

    // withTimeout no longer used for auth.getSession; rely on watchdog

    const fetchOrCreateProfile = async (currentUser: import('@supabase/supabase-js').User) => {
      try {
        console.log('[AuthContext] Fetching profile for user', currentUser.id);
        const { data: profileData, error: selectError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        console.log('[AuthContext] Profile query result:', { profileData, selectError });

        if (selectError) {
          // If no row found create it
          if ((selectError as any).code === 'PGRST116' || selectError.message.includes('No rows')) {
            console.warn('[AuthContext] No profile row found, creating one...');
            const { error: insertError } = await supabase.from('profiles').insert({
              id: currentUser.id,
              email: currentUser.email,
              full_name: (currentUser as any).user_metadata?.full_name || null,
              is_admin: isAdminOverride(currentUser.email) || false
            });
            if (insertError) {
              console.error('[AuthContext] Failed to create profile row', insertError);
              // Fallback stub profile if override applies
              if (isAdminOverride(currentUser.email)) {
                return {
                  id: currentUser.id,
                  email: currentUser.email,
                  full_name: null,
                  is_admin: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                } as Profile;
              }
              return null;
            }
            const { data: newProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();
            return newProfile || null;
          } else {
            console.error('[AuthContext] Profile select error', selectError);
            // Fallback: build stub if override says admin
            if (isAdminOverride(currentUser.email)) {
              console.warn('[AuthContext] Using admin email override stub profile');
              return {
                id: currentUser.id,
                email: currentUser.email,
                full_name: null,
                is_admin: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as Profile;
            }
            return null;
          }
        }
        console.log('[AuthContext] Returning profile:', profileData);
        // If profile exists but override says admin, ensure is_admin true client-side
        if (profileData && isAdminOverride(currentUser.email) && !profileData.is_admin) {
          console.log('[AuthContext] Elevating profile to admin via override');
          return { ...profileData, is_admin: true };
        }
        // If no profile but override applies
        if (!profileData && isAdminOverride(currentUser.email)) {
          console.warn('[AuthContext] No profile data but email override grants admin; using stub');
          return {
            id: currentUser.id,
            email: currentUser.email,
            full_name: null,
            is_admin: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as Profile;
        }
        return profileData || null;
      } catch (err) {
        console.error('[AuthContext] Unexpected profile fetch error', err);
        // Last resort stub if admin override
        if (isAdminOverride(currentUser.email)) {
          console.warn('[AuthContext] Using stub due to fetch error + admin override');
          return {
            id: currentUser.id,
            email: currentUser.email,
            full_name: null,
            is_admin: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as Profile;
        }
        return null;
      }
    };

    const init = async () => {
      try {
        // Avoid aggressive timeouts here; rely on watchdog as a fallback
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        const currentUser = data.session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          // Dedupe guard: ensure we only hydrate profile once during init
          if (!profileHydrated) {
            const profileData = await fetchOrCreateProfile(currentUser);
            if (mounted) setProfile(profileData);
            if (mounted) setProfileHydrated(true);
          }
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.warn('[AuthContext] getSession failed; proceeding without session', e);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        if (!profileHydrated) {
          const profileData = await fetchOrCreateProfile(currentUser);
          setProfile(profileData);
          setProfileHydrated(true);
        }
      } else {
        setProfile(null);
        setProfileHydrated(false);
      }
    });

    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
      clearTimeout(loadingWatchdog);
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('[AuthContext] Signing out...');
      await supabase.auth.signOut();
    } catch (e) {
      console.error('[AuthContext] signOut error', e);
    } finally {
      // Hard clear any lingering Supabase session keys
      try {
        Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k); });
      } catch {}
      setUser(null);
      setProfile(null);
      setLoading(false);
      console.log('[AuthContext] Signed out and state cleared');
    }
  };

  const value: AuthContextValue = { user, profile, loading, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
