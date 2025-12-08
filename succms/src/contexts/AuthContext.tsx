import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase'; // Import our new client

type UserProfile = {
  id: string;
  full_name: string;
  avatar_url: string;
  role: 'student' | 'lecturer' | 'admin';
  program_or_department: string;
};

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  selectedRole: 'student' | 'lecturer' | 'admin' | null;
  signIn: (username: string, password: string, role: 'student' | 'lecturer' | 'admin') => Promise<any>;
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'lecturer' | 'admin') => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'student' | 'lecturer' | 'admin' | null>(null);

  useEffect(() => {
    let didCancel = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const getSession = async () => {
      try {
        console.debug('[AuthProvider] initializing session');
        
        // Set a fallback timeout to avoid indefinite loading
        fallbackTimer = setTimeout(() => {
          if (!didCancel) {
            console.warn('[AuthProvider] session init timeout reached — continuing without waiting');
            setIsLoading(false);
          }
         }, 3000);

         // Get the current session (if any)
        const { data: { session } } = await supabase.auth.getSession();
        if (didCancel) return;
         console.debug('[AuthProvider] got session', session);

         // Load existing session and profile (do NOT force sign out on init)
         setSession(session);
         setUser(session?.user ?? null);
         if (session?.user) {
           try {
             const { data: userProfile } = await supabase.from('user_profiles').select('*').eq('id', session.user.id).single();
             setProfile(userProfile as UserProfile);
           } catch (err) {
             console.error('[AuthProvider] error loading profile', err);
             setProfile(null);
           }
         } else {
           setProfile(null);
         }
      } catch (err) {
        console.error('[AuthProvider] error initializing session', err);
         // On error, just set to logged out state
         setSession(null);
         setUser(null);
         setProfile(null);
      } finally {
        if (!didCancel) setIsLoading(false);
        if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.debug('[AuthProvider] auth state changed', _event, session);
      // Log specific event types for clarity
      if (_event === 'SIGNED_IN') console.debug('[AuthProvider] SIGNED_IN event');
      if (_event === 'SIGNED_OUT') console.debug('[AuthProvider] SIGNED_OUT event');
      if (_event === 'USER_UPDATED') console.debug('[AuthProvider] USER_UPDATED event');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          const { data: userProfile } = await supabase.from('user_profiles').select('*').eq('id', session.user.id).single();
          setProfile(userProfile as UserProfile);
        } catch (err) {
          console.error('[AuthProvider] failed to load profile on auth change', err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      didCancel = true;
      if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    session,
    isLoading,
    selectedRole,
    signIn: async (username: string, password: string, selectedRole: 'student' | 'lecturer' | 'admin') => {
      console.debug('[AuthProvider] signing in with username:', username, 'role:', selectedRole);
      
      try {
        // Step 1: Find the user by username (full_name)
        const { data: profiles, error: lookupError } = await supabase
          .from('user_profiles')
          .select('id, email, role, full_name')
          .ilike('full_name', `%${username}%`)
          .limit(1);
        
        console.debug('[AuthProvider] lookup result:', { error: lookupError, profiles });
        
        if (lookupError || !profiles || profiles.length === 0) {
          console.warn('[AuthProvider] username not found');
          // If the input looks like an email, try signing in directly with that email as fallback.
          if (username.includes('@')) {
            console.debug('[AuthProvider] lookup empty but input looks like email — trying direct email sign-in');
            const direct = await supabase.auth.signInWithPassword({ email: username, password });
            if (direct.error) {
              console.error('[AuthProvider] direct email sign-in failed:', direct.error);
              return { error: { message: 'Username not found.' } };
            }
            return direct;
          }

          return { error: { message: 'Username not found.' } };
        }
        
        const foundUser = profiles[0];
        
        // Step 2: Validate that the user's role matches the selected role
        if (foundUser.role !== selectedRole) {
          console.warn('[AuthProvider] role mismatch:', { userRole: foundUser.role, selectedRole });
          return { error: { message: `This account is registered as a ${foundUser.role}, not a ${selectedRole}. Please select the correct role.` } };
        }
        
        console.debug('[AuthProvider] found user with matching role:', foundUser.email);
        
        // Step 3: Authenticate with the email
        const result = await supabase.auth.signInWithPassword({ email: foundUser.email, password });
        if (result.error) {
          console.error('[AuthProvider] sign in error:', result.error);
        }
        return result;
      } catch (err) {
        console.error('[AuthProvider] error during sign in', err);
        return { error: { message: 'Error during sign in' } };
      }
    },
    signUp: async (email: string, password: string, fullName: string, role: 'student' | 'lecturer' | 'admin') => {
      console.debug('[AuthProvider] signUp called for', email, 'username(full_name)=', fullName, 'role=', role);
      const res = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, role: role, username: fullName } } });
      console.debug('[AuthProvider] signUp result:', res);
      return res;
    },
    signOut: async () => {
      console.debug('[AuthProvider] signOut called');
      // Immediately clear local state so UI returns to login without waiting
      console.debug('[AuthProvider] clearing local state (immediate)');
      setUser(null);
      setSession(null);
      setProfile(null);
      setSelectedRole(null);

      // Fire the Supabase signOut but don't block the UI on it.
      (async () => {
        try {
          const result = await supabase.auth.signOut();
          console.debug('[AuthProvider] supabase.auth.signOut completed (background):', result);
        } catch (err) {
          console.error('[AuthProvider] error calling supabase.auth.signOut (background):', err);
        }
      })();

      return { ok: true };
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};