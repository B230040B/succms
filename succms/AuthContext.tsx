import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '/workspaces/succms/succms/src/lib/supabase.ts';

// Updated Profile to include Academic Details
export type UserProfile = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin';
  faculty?: string;   // New field
  programme?: string; // New field
};

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, username: string, fullName: string, role: 'student' | 'lecturer' | 'admin') => Promise<any>;
  signOut: () => Promise<any>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<any>; // New Function
  refreshProfile: () => Promise<void>; // New Function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load User Data
  const loadUserAndProfile = async (session: Session) => {
    if (!session?.user) {
      setProfile(null);
      setUser(null);
      return;
    }
    setUser(session.user);
    
    // Fetch Profile
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (data) {
      setProfile(data as UserProfile);
    } else {
      console.error("Profile load error:", error);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadUserAndProfile(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadUserAndProfile(session);
      else {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Auth Functions ---

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, username: string, fullName: string, role: 'student' | 'lecturer' | 'admin') => {
    try {
      // 1. Check if username exists
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        return { data: null, error: { message: "Username already taken" } };
      }

      // 2. Sign Up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, username, role } }
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    setSession(null);
    await supabase.auth.signOut();
  };

  // Allow components to update the profile (e.g., setting Faculty)
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: "No user" };

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (data) setProfile(data as UserProfile);
    return { data, error };
  };

  // Helper to re-fetch data manually if needed
  const refreshProfile = async () => {
    if (session) await loadUserAndProfile(session);
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, isLoading, signIn, signUp, signOut, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};