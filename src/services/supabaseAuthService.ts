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
    // Valider les entrées
    if (!isValidEmail(credentials.email)) {
      throw new AuthServiceError('Adresse email invalide');
    }
    
    if (!isStrongPassword(credentials.password)) {
      throw new AuthServiceError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre');
    }
    
    // Log the signup attempt with sanitized credentials
    console.log('Attempting signup with email:', credentials.email.replace(/(.{2}).*(@.*)/, '$1***$2'));
    
    // Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        // Add metadata for the user
        data: {
          full_name: credentials.fullName
        }
      }
    });

    // If signup fails due to database issues, try to handle it gracefully
    if (authError) {
      // Check for specific error codes or messages related to table or database issues
      const isDatabaseError = 
        authError.code === 'PGRST116' || // Table does not exist
        authError.code === '42P01' || // Undefined table
        authError.message.includes('Database error') ||
        authError.message.includes('table does not exist');

      if (isDatabaseError) {
        console.warn('Signup failed due to database issue. Attempting to create profiles table...');
        
        try {
          // Try to create the profiles table directly
          const { error: tableCreateError } = await supabase.from('profiles').insert([
            {
              id: authData?.user?.id || '00000000-0000-0000-0000-000000000000',
              email: credentials.email,
              full_name: credentials.fullName || '',
              created_at: new Date().toISOString()
            }
          ]);
          
          if (tableCreateError) {
            console.error('Failed to create profiles table:', tableCreateError);
            throw tableCreateError;
          }
          
          // Retry signup after creating the table
          const { data: retryAuthData, error: retryAuthError } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
              data: {
                full_name: credentials.fullName
              }
            }
          });
          
          if (retryAuthError) {
            console.error('Signup failed after table creation:', retryAuthError);
            throw retryAuthError;
          }
          
          return {
            user: retryAuthData.user,
            session: retryAuthData.session
          };
        } catch (tableCreationError) {
          console.error('Critical error during signup table creation:', tableCreationError);
          throw new AuthServiceError(
            'Erreur critique lors de l\'inscription. Impossible de créer le profil utilisateur.',
            'DATABASE_SETUP_FAILED',
            tableCreationError
          );
        }
      }
      
      // If it's not a database error, throw the original error
      throw authError;
    }

    // If signup fails due to database issues, try to create the profiles table
    if (authError && (
      authError.message.includes('Database error') || 
      authError.message.includes('table does not exist') || 
      authError.code === '42P01' // Undefined table
    )) {
      console.warn('Signup failed due to database issue. Attempting to create profiles table...');
      
      try {
        // Try to create the profiles table directly
        const { error: tableCreateError } = await supabase.query(`
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
        
        if (tableCreateError) {
          console.error('Failed to create profiles table:', tableCreateError);
          throw tableCreateError;
        }
        
        // Retry signup after creating the table
        const { data: retryAuthData, error: retryAuthError } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            data: {
              full_name: credentials.fullName
            }
          }
        });
        
        if (retryAuthError) {
          console.error('Signup failed after table creation:', retryAuthError);
          throw retryAuthError;
        }
        
        return {
          user: retryAuthData.user,
          session: retryAuthData.session
        };
      } catch (tableCreationError) {
        console.error('Critical error during signup table creation:', tableCreationError);
        throw new AuthServiceError(
          'Erreur critique lors de l\'inscription. Impossible de créer le profil utilisateur.',
          'DATABASE_SETUP_FAILED',
          tableCreationError
        );
      }
    }
    
    // Log detailed signup response
    console.log('Signup response:', {
      user: authData.user ? { id: authData.user.id, email: authData.user.email } : null,
      session: authData.session ? 'Session exists' : 'No session',
      error: authError
    });
    
    if (authError) {
      // Enhanced error logging
      console.error('Detailed Signup Auth Error:', {
        status: authError.status,
        message: authError.message,
        name: authError.name,
        details: JSON.stringify(authError)
      });
      
      // Check specifically for rate limiting errors
      if (authError.status === 429) {
        console.warn('Rate limiting detected during signup. Consider implementing a retry mechanism.');
        throw new AuthServiceError('Trop de tentatives d\'inscription. Veuillez réessayer plus tard.', '429', authError);
      }
      
      // Handle specific 500 error scenarios
      if (authError.status === 500) {
        console.error('Critical server error during signup:', {
          message: authError.message,
          details: JSON.stringify(authError)
        });
        
        // Provide more context about potential server issues
        throw new AuthServiceError(
          'Erreur serveur lors de l\'inscription. Vérifiez votre connexion et réessayez. Si le problème persiste, contactez le support.',
          '500', 
          authError
        );
      }
      
      // Log the full error details for debugging
      console.error('Signup Auth Error:', {
        status: authError.status,
        message: authError.message,
        details: authError
      });
      
      handleAuthError(authError, 'Erreur lors de l\'inscription');
    }
    
    // Si l'inscription a réussi, créer le profil utilisateur
    if (authData.user) {
      try {
        // Create user profile using the database service
        const userProfile = await createUserProfile({
          id: authData.user.id,
          email: credentials.email,
          full_name: credentials.fullName,
          created_at: new Date().toISOString()
        });
        
        return {
          user: userProfile,
          session: authData.session
        };
      } catch (profileError) {
        console.error('Error creating user profile:', {
          message: (profileError as Error).message,
          details: profileError
        });
        
        // Instead of trying to delete the auth user, just return the basic user info
        // This allows the user to continue with the app even if profile creation failed
        return {
          user: {
            id: authData.user.id,
            email: credentials.email,
            full_name: credentials.fullName,
            created_at: new Date().toISOString()
          },
          session: authData.session,
          error: 'Profile creation failed, but authentication succeeded. Some features may be limited.'
        };
      }
    }
    
    return {
      user: authData.user ? {
        id: authData.user.id,
        email: authData.user.email || credentials.email,
        full_name: credentials.fullName,
        created_at: new Date().toISOString()
      } : null,
      session: authData.session
    };
  } catch (error) {
    // Log the full error details for debugging
    console.error('Final Signup Error:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack,
      details: error
    });
    
    if (error instanceof AuthServiceError) {
      throw error;
    }
    
    // Create a more informative error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erreur inconnue lors de l\'inscription';
    
    throw new AuthServiceError(errorMessage, undefined, error);
  }
};

/**
 * Connexion d'un utilisateur existant avec gestion améliorée des erreurs
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // Validate credentials before attempting login
    if (!credentials.email || !credentials.password) {
      throw new AuthServiceError('Email et mot de passe requis', '400');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    
    if (error) {
      // Check specifically for rate limiting errors
      if (error.status === 429) {
        console.warn('Rate limiting detected during login. Consider implementing a retry mechanism.');
        throw new AuthServiceError('Trop de tentatives de connexion. Veuillez réessayer plus tard.', '429', error);
      }
      
      // Check for invalid credentials
      if (error.status === 400 && (
        error.message.includes('Invalid login credentials') || 
        error.message.includes('Invalid email or password') ||
        error.message.includes('Email not confirmed')
      )) {
        throw new AuthServiceError('Identifiants invalides', '400', error);
      }
      
      handleAuthError(error, 'Identifiants invalides');
    }
    
    // Récupérer les informations du profil
    let userProfile = null;
    if (data.user) {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.warn('Could not fetch user profile after login:', profileError);
        } else {
          userProfile = profileData;
        }
      } catch (profileError) {
        console.warn('Error fetching profile after login:', profileError);
      }
    }
    
    return {
      user: userProfile || (data.user ? {
        id: data.user.id,
        email: data.user.email || credentials.email,
        created_at: data.user.created_at || new Date().toISOString()
      } : null),
      session: data.session
    };
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError('Erreur lors de la connexion', undefined, error);
  }
};

/**
 * Connexion avec un fournisseur OAuth
 */
export const loginWithProvider = async (provider: 'google' | 'facebook' | 'twitter' | 'apple'): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) handleAuthError(error, `Erreur lors de la connexion avec ${provider}`);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError(`Erreur lors de la connexion avec ${provider}`, undefined, error);
  }
};

/**
 * Déconnexion de l'utilisateur
 */
export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) handleAuthError(error, 'Erreur lors de la déconnexion');
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError('Erreur lors de la déconnexion', undefined, error);
  }
};

/**
 * Récupérer la session actuelle
 */
export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) handleAuthError(error, 'Erreur lors de la récupération de la session');
    return data.session;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError('Erreur lors de la récupération de la session', undefined, error);
  }
};

/**
 * Récupérer l'utilisateur actuel
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Récupérer l'utilisateur authentifié
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) handleAuthError(authError, 'Erreur lors de la récupération de l\'utilisateur');
    
    if (!authData.user) return null;
    
    try {
      // Récupérer le profil complet using the database service
      const userProfile = await getUserProfile(authData.user.id);
      
      // If we get a profile, return it
      if (userProfile) {
        return userProfile as User;
      }
      
      // If no profile is found
      console.warn('User profile not found for user:', authData.user.id);
      
      // Try to get user metadata from auth
      const userData = authData.user.user_metadata || {};
      
      // Return basic user data
      return {
        id: authData.user.id,
        email: authData.user.email || '',
        full_name: userData.full_name || '',
        created_at: authData.user.created_at || new Date().toISOString()
      };
    } catch (profileError) {
      console.error('Error fetching user profile:', profileError);
      
      // Return basic user data from auth
      return {
        id: authData.user.id,
        email: authData.user.email || '',
        created_at: authData.user.created_at || new Date().toISOString()
      };
    }
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError('Erreur lors de la récupération de l\'utilisateur', undefined, error);
  }
};

/**
 * Demander une réinitialisation de mot de passe
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    if (!isValidEmail(email)) {
      throw new AuthServiceError('Adresse email invalide');
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) handleAuthError(error, 'Erreur lors de la demande de réinitialisation');
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError('Erreur lors de la demande de réinitialisation', undefined, error);
  }
};

/**
 * Mettre à jour le mot de passe
 */
export const updatePassword = async (newPassword: string): Promise<void> => {
  try {
    if (!isStrongPassword(newPassword)) {
      throw new AuthServiceError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre');
    }
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) handleAuthError(error, 'Erreur lors de la mise à jour du mot de passe');
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError('Erreur lors de la mise à jour du mot de passe', undefined, error);
  }
};

/**
 * Mettre à jour le profil utilisateur
 */
export const updateProfile = async (userId: string, data: UpdateProfileData): Promise<User> => {
  try {
    const updates: any = {};
    
    // First check which columns exist in the profiles table
    const { data: tableInfo, error: tableInfoError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (tableInfoError) {
      console.warn('Could not determine table schema for profile update:', tableInfoError);
      throw new AuthServiceError('Erreur lors de la mise à jour du profil', tableInfoError.code, tableInfoError);
    }
    
    // Only add fields that exist in the table schema
    if (tableInfo && tableInfo.length > 0) {
      const sampleRecord = tableInfo[0] || {};
      const availableColumns = Object.keys(sampleRecord);
      
      if (data.fullName !== undefined && availableColumns.includes('full_name')) {
        updates.full_name = data.fullName;
      }
      
      if (data.avatarUrl !== undefined && availableColumns.includes('avatar_url')) {
        updates.avatar_url = data.avatarUrl;
      }
      
      if (data.phoneNumber !== undefined && availableColumns.includes('phone_number')) {
        updates.phone_number = data.phoneNumber;
      }
      
      if (data.preferredLanguage !== undefined && availableColumns.includes('preferred_language')) {
        updates.preferred_language = data.preferredLanguage;
      }
      
      if (data.notificationPreferences !== undefined && availableColumns.includes('notification_preferences')) {
        updates.notification_preferences = data.notificationPreferences;
      }
    } else {
      // Fallback to basic fields if we can't determine schema
      if (data.fullName !== undefined) updates.full_name = data.fullName;
    }
    
    // Update the profile using the database service
    try {
      const updatedProfile = await updateUserProfile(userId, updates);
      return updatedProfile as User;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new AuthServiceError('Erreur lors de la mise à jour du profil', undefined, error);
    }
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError('Erreur lors de la mise à jour du profil', undefined, error);
  }
};

/**
 * Télécharger un avatar
 */
export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  try {
    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    // Télécharger le fichier
    const { error: uploadError } = await supabase.storage
      .from('user-content')
      .upload(filePath, file);
    
    if (uploadError) {
      // Check if the bucket doesn't exist
      if (uploadError.message.includes('not found') || uploadError.message.includes('does not exist')) {
        throw new AuthServiceError(
          'Le stockage d\'avatars n\'est pas configuré. Veuillez contacter l\'administrateur.',
          'STORAGE_NOT_FOUND',
          uploadError
        );
      }
      
      throw new AuthServiceError('Erreur lors du téléchargement de l\'avatar', uploadError.message, uploadError);
    }
    
    // Obtenir l'URL publique
    const { data } = supabase.storage
      .from('user-content')
      .getPublicUrl(filePath);
    
    // First check if avatar_url column exists in profiles table
    const { data: tableInfo, error: tableInfoError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (tableInfoError) {
      console.warn('Could not determine table schema for avatar update:', tableInfoError);
      // Return the URL even if we can't update the profile
      return data.publicUrl;
    }
    
    // Check if avatar_url column exists
    const sampleRecord = tableInfo[0] || {};
    const availableColumns = Object.keys(sampleRecord);
    
    if (availableColumns.includes('avatar_url')) {
      // Mettre à jour le profil avec la nouvelle URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', userId);
      
      if (updateError) {
        console.warn('Could not update profile with avatar URL:', updateError);
      }
    } else {
      console.warn('avatar_url column does not exist in profiles table');
    }
    
    return data.publicUrl;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError('Erreur lors du téléchargement de l\'avatar', undefined, error);
  }
};

/**
 * Vérifier si l'utilisateur est authentifié
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    return false;
  }
};

// Exporter l'objet par défaut avec toutes les fonctions
const supabaseAuthService = {
  signup,
  login,
  loginWithProvider,
  logout,
  getCurrentSession,
  getCurrentUser,
  resetPassword,
  updatePassword,
  updateProfile,
  uploadAvatar,
  isAuthenticated,
  isValidEmail,
  isStrongPassword
};

export default supabaseAuthService;