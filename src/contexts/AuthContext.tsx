import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { User } from '@/utils/supabase';
import supabaseAuthService, { AuthServiceError } from '@/services/supabaseAuthService';
import { supabase } from '@/utils/supabase';
import { retryWithBackoff, isRetryableError, rateLimitCheck } from '@/utils/retryUtils';

// Types
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithProvider: (provider: 'google' | 'facebook' | 'twitter' | 'apple') => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (data: {
    fullName?: string;
    avatarUrl?: string;
    phoneNumber?: string;
    preferredLanguage?: string;
    notificationPreferences?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  }) => Promise<User>;
  uploadAvatar: (file: File) => Promise<string>;
  refreshUser: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

// Créer le contexte avec des valeurs par défaut
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => false,
  loginWithProvider: async () => {},
  signup: async () => false,
  logout: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  updateProfile: async () => ({ id: '', email: '', created_at: '' }),
  uploadAvatar: async () => '',
  refreshUser: async () => {},
  refreshSession: async () => false,
});

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Fournisseur du contexte d'authentification
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fonction de rafraîchissement de session
  const refreshSession = async () => {
    try {
      // Attempt to get the current session
      const currentSession = await supabaseAuthService.getCurrentSession();
      
      // If a session exists, update the state
      if (currentSession) {
        setSession(currentSession);
        
        // Also refresh the user data
        const currentUser = await supabaseAuthService.getCurrentUser();
        setUser(currentUser);
        
        return true;
      }
      
      // No session found
      setSession(null);
      setUser(null);
      return false;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de la session:', error);
      setSession(null);
      setUser(null);
      return false;
    }
  };

  // Initialiser l'état d'authentification
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        // Récupérer la session actuelle
        const currentSession = await supabaseAuthService.getCurrentSession();
        setSession(currentSession);

        // Récupérer l'utilisateur si une session existe
        if (currentSession) {
          const currentUser = await supabaseAuthService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const currentUser = await supabaseAuthService.getCurrentUser();
          setUser(currentUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Nettoyer l'abonnement
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fonction de connexion avec gestion des erreurs améliorée
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Check client-side rate limiting first (but bypass in development)
    if (!import.meta.env.DEV && !rateLimitCheck('login', 5, 60000)) {
      throw new AuthServiceError('Trop de tentatives de connexion. Veuillez réessayer plus tard.', '429');
    }
    
    try {
      // Use retry with backoff for login
      const result = await retryWithBackoff(
        async () => {
          const response = await supabaseAuthService.login({
            email,
            password,
          });
          
          if (response.error) throw new Error(response.error);
          return response;
        },
        2, // Max 2 retries
        1000, // Base delay of 1 second
        (error) => {
          // Only retry on network errors or rate limiting, not on invalid credentials
          return isRetryableError(error) && 
                 !(error.message && (
                   error.message.includes('Invalid credentials') || 
                   error.message.includes('Identifiants invalides')
                 ));
        }
      );
      
      setSession(result.session);
      setUser(result.user);
      return true;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de connexion avec un fournisseur OAuth
  const loginWithProvider = async (provider: 'google' | 'facebook' | 'twitter' | 'apple') => {
    try {
      await supabaseAuthService.loginWithProvider(provider);
      // La redirection se fait automatiquement, donc pas besoin de mettre à jour l'état ici
    } catch (error) {
      console.error(`Erreur de connexion avec ${provider}:`, error);
      throw error;
    }
  };

  // Fonction d'inscription avec gestion des erreurs améliorée
  const signup = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    
    // Check client-side rate limiting first (but bypass in development)
    if (!import.meta.env.DEV && !rateLimitCheck('signup', 3, 3600000)) { // 3 attempts per hour
      throw new AuthServiceError('Trop de tentatives d\'inscription. Veuillez réessayer plus tard.', '429');
    }
    
    try {
      // Use retry with backoff for signup
      const result = await retryWithBackoff(
        async () => {
          try {
            const response = await supabaseAuthService.signup({
              email,
              password,
              fullName,
            });
            
            // Log detailed signup response
            console.log('Signup response in context:', {
              user: response.user ? { 
                id: response.user.id, 
                email: response.user.email 
              } : null,
              session: response.session ? 'Session exists' : 'No session',
              error: response.error
            });
            
            if (response.error) {
              console.warn('Signup completed with warning:', response.error);
            }
            
            return response;
          } catch (error: any) {
            // Log detailed error information
            console.error('Signup attempt error:', {
              name: error.name,
              message: error.message,
              details: error
            });
            
            // Don't retry on validation errors or "email already in use" errors
            if (error.message && (
              error.message.includes('email invalide') ||
              error.message.includes('mot de passe') ||
              error.message.includes('déjà utilisée')
            )) {
              throw error; // Don't retry these errors
            }
            
            // For database errors, we want to retry
            if (error.message && (
              error.message.includes('base de données') || 
              error.message.includes('Database error')
            )) {
              console.warn('Database error during signup, will retry:', error.message);
              throw error; // This will be retried
            }
            
            // For other errors, check if they're retryable
            if (!isRetryableError(error)) {
              throw error; // Don't retry non-retryable errors
            }
            
            console.warn('Retryable error during signup:', error.message);
            throw error; // This will be retried
          }
        },
        2, // Max 2 retries
        2000, // Base delay of 2 seconds
        (error) => {
          // Only retry on network errors, database errors or rate limiting
          return isRetryableError(error) || 
                 (error.message && (
                   error.message.includes('base de données') || 
                   error.message.includes('Database error')
                 ));
        }
      );
      
      setSession(result.session);
      setUser(result.user);
      return true;
    } catch (error: any) {
      console.error('Comprehensive Signup Error:', {
        name: error.name,
        message: error.message,
        details: error
      });
      
      // Create a more user-friendly error message
      if (error.message && (
        error.message.includes('base de données') || 
        error.message.includes('Database error')
      )) {
        throw new AuthServiceError(
          'Erreur temporaire du serveur. Veuillez réessayer dans quelques instants.',
          error.code,
          error
        );
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    setIsLoading(true);
    try {
      await supabaseAuthService.logout();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de réinitialisation de mot de passe
  const resetPassword = async (email: string) => {
    // Check client-side rate limiting (but bypass in development)
    if (!import.meta.env.DEV && !rateLimitCheck('resetPassword', 2, 3600000)) { // 2 attempts per hour
      throw new AuthServiceError('Trop de tentatives de réinitialisation. Veuillez réessayer plus tard.', '429');
    }
    
    try {
      await supabaseAuthService.resetPassword(email);
    } catch (error) {
      console.error('Erreur de réinitialisation de mot de passe:', error);
      throw error;
    }
  };

  // Fonction de mise à jour de mot de passe
  const updatePassword = async (newPassword: string) => {
    try {
      await supabaseAuthService.updatePassword(newPassword);
    } catch (error) {
      console.error('Erreur de mise à jour de mot de passe:', error);
      throw error;
    }
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (data: {
    fullName?: string;
    avatarUrl?: string;
    phoneNumber?: string;
    preferredLanguage?: string;
    notificationPreferences?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  }) => {
    try {
      if (!user) throw new Error('Utilisateur non authentifié');
      
      const updatedUser = await supabaseAuthService.updateProfile(user.id, {
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
        phoneNumber: data.phoneNumber,
        preferredLanguage: data.preferredLanguage,
        notificationPreferences: data.notificationPreferences,
      });
      
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Erreur de mise à jour du profil:', error);
      throw error;
    }
  };

  // Fonction de téléchargement d'avatar
  const uploadAvatar = async (file: File) => {
    try {
      if (!user) throw new Error('Utilisateur non authentifié');
      
      const avatarUrl = await supabaseAuthService.uploadAvatar(user.id, file);
      
      // Mettre à jour l'utilisateur avec la nouvelle URL d'avatar
      setUser(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      
      return avatarUrl;
    } catch (error) {
      console.error('Erreur de téléchargement d\'avatar:', error);
      throw error;
    }
  };

  // Fonction pour rafraîchir les données de l'utilisateur
  const refreshUser = async () => {
    try {
      if (!session) {
        setUser(null);
        return;
      }
      
      const currentUser = await supabaseAuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
      throw error;
    }
  };

  // Valeur du contexte
  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    login,
    loginWithProvider,
    signup,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    uploadAvatar,
    refreshUser,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;