
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { Session, User } from '@supabase/supabase-js';
// import { supabase } from '@/utils/supabase';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  session: any | null;
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false); // Initialize as false
  const { toast } = useToast();

  // useEffect(() => {
  //   // Get initial session
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setSession(session);
  //     setUser(session?.user ?? null);
  //     setLoading(false);
  //   });

  //   // Listen for auth changes
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session);
  //     setUser(session?.user ?? null);
  //     setLoading(false);
  //   });

  //   return () => subscription.unsubscribe();
  // }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    console.log(`Mock sign in with email: ${email}, password: ${password}`);
    // Simulate a successful sign-in
    setLoading(false);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    console.log(`Mock sign up with email: ${email}, password: ${password}, fullName: ${fullName}`);
    // Simulate a successful sign-up
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    console.log('Mock sign out');
    // Simulate a successful sign-out
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    console.log(`Mock reset password for email: ${email}`);
    // Simulate a successful password reset request
    setLoading(false);
  };

  const value: AuthContextType = {
    session: null, // Default to null
    user: null, // Default to null
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
