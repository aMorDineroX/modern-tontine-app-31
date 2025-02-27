import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  session: any | null;
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, fullName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate authentication logic
      if (email === "test@example.com" && password === "password123") {
        // Successful login
        const mockUser = {
          id: '1',
          email: email,
          name: 'Test User'
        };
        setUser(mockUser);
        setSession({ user: mockUser });
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        return true;
      } else {
        // Failed login
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Sign in error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate sign up logic
      if (email && password && fullName) {
        const mockUser = {
          id: '2',
          email: email,
          name: fullName
        };
        setUser(mockUser);
        setSession({ user: mockUser });
        toast({
          title: "Sign Up Successful",
          description: "Welcome to Tontine!",
        });
        return true;
      } else {
        toast({
          title: "Sign Up Failed",
          description: "Please fill in all fields",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Sign up error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // Reset user and session
      setUser(null);
      setSession(null);

      // Show logout toast
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      // Simulate password reset
      if (email) {
        toast({
          title: "Password Reset",
          description: "Password reset instructions sent to your email",
        });
      } else {
        toast({
          title: "Reset Failed",
          description: "Please provide a valid email",
          variant: "destructive"
        });
        throw new Error("Invalid email");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    session,
    user,
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