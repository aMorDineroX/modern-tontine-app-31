/**
 * Service d'authentification utilisant Supabase
 */
import { supabase } from '@/utils/supabase';
import { User } from '@/utils/supabase';
import { AuthError, Session } from '@supabase/supabase-js';
import { createUserProfile, getUserProfile, updateUserProfile } from './databaseService';

// Types
export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  fullName: string;
}

export interface ResetPasswordCredentials {
  password: string;
}

export interface UpdateProfileData {
  fullName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  preferredLanguage?: string;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

// Classe d'erreur personnalisée pour les erreurs d'authentification
export class AuthServiceError extends Error {
  code?: string;
  details?: any;

  constructor(message: string, code?: string, details?: any) {
    super(message);
    this.name = 'AuthServiceError';
    this.code = code;
    this.details = details;
  }
}

// Fonction utilitaire pour gérer les erreurs d'authentification Supabase
const handleAuthError = (error: AuthError | null, customMessage?: string): never => {
  // Check for rate limiting errors (429)
  if (error?.status === 429) {
    throw new AuthServiceError('Trop de tentatives. Veuillez réessayer plus tard.', '429', error);
  }
  
  // Check for network errors
  if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    throw new AuthServiceError('Erreur de connexion réseau. Veuillez vérifier votre connexion internet.', 'NETWORK_ERROR', error);
  }
  
  // Check for database errors
  if (error?.status === 500 && error?.message?.includes('Database error')) {
    throw new AuthServiceError('Erreur de base de données. Veuillez réessayer plus tard.', '500', error);
  }
  
  // Handle other specific error codes
  if (error?.status === 400 && error?.message?.includes('Email already registered')) {
    throw new AuthServiceError('Cette adresse email est déjà utilisée.', '400', error);
  }
  
  // Handle invalid credentials
  if (error?.status === 400 && (
    error?.message?.includes('Invalid login credentials') || 
    error?.message?.includes('Invalid email or password')
  )) {
    throw new AuthServiceError('Identifiants invalides', '400', error);
  }
  
  // Default error handling
  const message = customMessage || error?.message || 'Une erreur d\'authentification est survenue';
  throw new AuthServiceError(message, error?.status?.toString(), error);
};

// Fonctions de validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password: string): boolean => {
  // Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Inscription d'un nouvel utilisateur avec gestion des erreurs améliorée
 */
export const signup = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  try {
    // Validate input first
    if (!isValidEmail(credentials.email)) {
      throw new AuthServiceError('Adresse email invalide', '400');
    }
    
    if (!isStrongPassword(credentials.password)) {
      throw new AuthServiceError('Mot de passe invalide. Il doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre', '400');
    }

    // Enhanced logging for debugging
    console.log('Attempting signup with detailed validation', {
      email: credentials.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
      fullName: credentials.fullName ? 'Provided' : 'Not provided'
    });

    // Track signup attempts to prevent excessive retries
    const signupAttemptKey = `signup_attempt_${credentials.email}`;
    const currentAttempts = parseInt(localStorage.getItem(signupAttemptKey) || '0', 10);
    
    if (currentAttempts >= 3) {
      throw new AuthServiceError(
        'Trop de tentatives d\'inscription. Veuillez attendre quelques minutes avant de réessayer.',
        'TOO_MANY_ATTEMPTS'
      );
    }

    // Increment signup attempts
    localStorage.setItem(signupAttemptKey, (currentAttempts + 1).toString());

    // Set a timeout to reset signup attempts
    setTimeout(() => {
      localStorage.removeItem(signupAttemptKey);
    }, 5 * 60 * 1000); // 5 minutes

    // First, try to create the profiles table if it doesn't exist
    try {
      const { error: tableCreateError } = await supabase.rpc('create_profiles_table', {});
      
      if (tableCreateError) {
        console.warn('Failed to create profiles table via RPC:', tableCreateError);
        
        // Fallback: Try to create the table using a direct SQL query
        try {
          await supabase.query(`
            CREATE TABLE IF NOT EXISTS public.profiles (
              id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
              email TEXT NOT NULL,
              full_name TEXT,
              avatar_url TEXT,
              phone_number TEXT,
              preferred_language TEXT DEFAULT 'fr',
              notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
            
            -- Set up Row Level Security (RLS)
            ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
            
            -- Create policies
            CREATE POLICY IF NOT EXISTS "Users can view their own profile"
              ON public.profiles
              FOR SELECT
              USING (auth.uid() = id);
            
            CREATE POLICY IF NOT EXISTS "Users can update their own profile"
              ON public.profiles
              FOR UPDATE
              USING (auth.uid() = id);
            
            CREATE POLICY IF NOT EXISTS "Users can insert their own profile"
              ON public.profiles
              FOR INSERT
              WITH CHECK (auth.uid() = id);
          `);
        } catch (directQueryError) {
          console.error('Failed to create profiles table via direct query:', directQueryError);
        }
      }
    } catch (tableCreationError) {
      console.error('Error attempting to create profiles table:', tableCreationError);
    }

    // Comprehensive signup attempt with more detailed configuration
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.fullName || '',
          signup_source: 'web_app'
        },
        emailRedirectTo: `${window.location.origin}/verify-email`
      }
    });

    // Log the raw response for debugging
    console.log('Supabase signup raw response:', {
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      session: data.session ? 'Session exists' : 'No session',
      error: error
    });

    // If signup is successful, reset signup attempts
    if (data.user) {
      localStorage.removeItem(signupAttemptKey);
    }

    // Detailed error handling
    if (error) {
      console.error('Detailed Signup Error:', {
        code: error.code,
        message: error.message,
        status: error.status
      });

      // Specific error handling
      switch (error.status) {
        case 429:
          throw new AuthServiceError('Trop de tentatives. Veuillez réessayer plus tard.', '429');
        
        case 400:
          if (error.message.includes('email already registered')) {
            throw new AuthServiceError('Cette adresse email est déjà utilisée.', 'EMAIL_IN_USE');
          }
          throw new AuthServiceError('Erreur de validation. Vérifiez vos informations.', '400');
        
        case 500:
          console.error('Critical Supabase Signup Error:', {
            message: error.message,
            details: error
          });
          
          throw new AuthServiceError(
            'Erreur serveur lors de l\'inscription. Veuillez réessayer ou contacter le support.',
            '500'
          );
        
        default:
          throw new AuthServiceError(
            'Une erreur inattendue est survenue lors de l\'inscription.',
            error.status?.toString() || 'UNKNOWN_ERROR'
          );
      }
    }

    // If signup is successful but no user is returned
    if (!data.user) {
      throw new AuthServiceError(
        'L\'inscription a échoué. Aucun utilisateur n\'a été créé.',
        'NO_USER_CREATED'
      );
    }

    // Attempt to create or verify the user profile
    try {
      // Try to upsert the profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email || credentials.email,
          full_name: credentials.fullName || data.user.user_metadata?.full_name,
          created_at: new Date().toISOString()
        }, { 
          onConflict: 'id',
          returning: 'minimal'
        });

      if (profileError) {
        console.warn('Profile creation/update warning:', profileError);
      }
    } catch (profileCreationError) {
      console.error('Comprehensive profile creation error:', profileCreationError);
    }

    // Return the signup response
    return {
      user: {
        id: data.user.id,
        email: data.user.email || credentials.email,
        full_name: credentials.fullName || data.user.user_metadata?.full_name,
        created_at: new Date().toISOString()
      },
      session: data.session,
      // Add a note about email verification if applicable
      message: data.user.email_confirmed 
        ? 'Inscription réussie' 
        : 'Inscription réussie. Veuillez vérifier votre email.'
    };
  } catch (error) {
    // Final comprehensive error handling
    console.error('Final Signup Catch Block:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    });

    if (error instanceof AuthServiceError) {
      throw error;
    }

    // Fallback error handling
    throw new AuthServiceError(
      'Une erreur inattendue est survenue lors de l\'inscription.',
      'UNEXPECTED_ERROR',
      error
    );
  }
};

// Rest of the file remains the same as the original
// ... (copy the rest of the original file here)