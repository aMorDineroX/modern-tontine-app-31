import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import authService, { User, Permission, UserRole } from '@/services/authService';

interface Session {
  user: User;
  token: string;
  expiresAt: number;
  refreshToken?: string;
}

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signUp: (email: string, password: string, fullName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Initialiser l'état d'authentification à partir du stockage au montage
  useEffect(() => {
    const initAuth = async () => {
      const { token, refreshToken, user, expiresAt } = authService.getAuthData();
      
      if (token && user && expiresAt) {
        // Vérifier si le token est expiré
        if (expiresAt > Date.now()) {
          setSession({ user, token, expiresAt, refreshToken: refreshToken || undefined });
          setUser(user);
          setIsAuthenticated(true);
        } else {
          // Token expiré, essayer de rafraîchir si un refreshToken est disponible
          if (refreshToken) {
            try {
              const response = await authService.refreshToken(refreshToken);
              setSession({
                user: response.user,
                token: response.token,
                expiresAt: response.expiresAt,
                refreshToken: response.refreshToken
              });
              setUser(response.user);
              setIsAuthenticated(true);
            } catch (error) {
              // Échec du rafraîchissement, effacer les données
              authService.clearAuthData();
            }
          } else {
            // Pas de refreshToken, effacer les données
            authService.clearAuthData();
          }
        }
      }
      
      setLoading(false);
    };
    
    initAuth();
  }, []);

  // Configurer un minuteur pour vérifier l'expiration du token
  useEffect(() => {
    if (!session) return;
    
    const timeUntilExpiry = session.expiresAt - Date.now();
    if (timeUntilExpiry <= 0) {
      signOut();
      return;
    }
    
    // Configurer un minuteur pour rafraîchir le token avant qu'il n'expire
    const refreshTimer = setTimeout(() => {
      refreshSession();
    }, timeUntilExpiry - 60000); // Rafraîchir 1 minute avant l'expiration
    
    return () => clearTimeout(refreshTimer);
  }, [session]);

  const refreshSession = async (): Promise<boolean> => {
    if (!session || !session.refreshToken) return false;
    
    try {
      const response = await authService.refreshToken(session.refreshToken);
      
      setSession({
        user: response.user,
        token: response.token,
        expiresAt: response.expiresAt,
        refreshToken: response.refreshToken
      });
      setUser(response.user);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error("Échec du rafraîchissement de la session:", error);
      // En cas d'échec, déconnecter l'utilisateur
      signOut();
      return false;
    }
  };

  const signIn = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    setLoading(true);
    try {
      // Valider le format de l'email
      if (!authService.isValidEmail(email)) {
        toast({
          title: "Email invalide",
          description: "Veuillez entrer une adresse email valide",
          variant: "destructive"
        });
        return false;
      }

      // Appeler le service de connexion
      const response = await authService.login({ email, password }, rememberMe);
      
      // Mettre à jour l'état avec la réponse
      setUser(response.user);
      setSession({
        user: response.user,
        token: response.token,
        expiresAt: response.expiresAt,
        refreshToken: response.refreshToken
      });
      setIsAuthenticated(true);
      
      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });
      
      return true;
    } catch (error) {
      console.error("Erreur de connexion:", error);
      
      let errorMessage = "Email ou mot de passe invalide";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Échec de la connexion",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Appeler le service d'inscription
      const response = await authService.signup({ email, password, fullName });
      
      // Mettre à jour l'état avec la réponse
      setUser(response.user);
      setSession({
        user: response.user,
        token: response.token,
        expiresAt: response.expiresAt,
        refreshToken: response.refreshToken
      });
      setIsAuthenticated(true);
      
      toast({
        title: "Inscription réussie",
        description: "Bienvenue sur Tontine !",
      });
      
      return true;
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      
      // Afficher un message d'erreur approprié en fonction de l'erreur
      let errorMessage = "Une erreur inattendue s'est produite. Veuillez réessayer.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Échec de l'inscription",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // Appeler le service de déconnexion
      await authService.logout();
      
      // Réinitialiser l'état
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);

      // Afficher le toast de déconnexion
      toast({
        title: "Déconnecté",
        description: "Vous avez été déconnecté avec succès",
      });
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      toast({
        title: "Erreur",
        description: "Échec de la déconnexion",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      // Appeler le service de réinitialisation du mot de passe
      await authService.resetPassword(email);
      
      toast({
        title: "Réinitialisation du mot de passe",
        description: "Les instructions de réinitialisation du mot de passe ont été envoyées à votre email",
      });
    } catch (error) {
      console.error("Erreur de réinitialisation du mot de passe:", error);
      
      let errorMessage = "Échec de l'envoi du lien de réinitialisation. Veuillez réessayer.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Échec de la réinitialisation",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!user || !session) return false;
    
    setLoading(true);
    try {
      // Appeler le service de mise à jour du profil
      const updatedUser = await authService.updateUserProfile(userData, session.token);
      
      // Mettre à jour l'état
      setUser(updatedUser);
      setSession({
        ...session,
        user: updatedUser
      });
      
      toast({
        title: "Profil mis à jour",
        description: "Votre profil a été mis à jour avec succès",
      });
      
      return true;
    } catch (error) {
      console.error("Erreur de mise à jour du profil:", error);
      
      let errorMessage = "Échec de la mise à jour de votre profil";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Échec de la mise à jour",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fonctions de vérification des permissions et des rôles
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.every(permission => user.permissions.includes(permission));
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.some(permission => user.permissions.includes(permission));
  };

  const value: AuthContextType = {
    session,
    user,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshSession,
    hasPermission,
    hasRole,
    hasAllPermissions,
    hasAnyPermission
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
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};