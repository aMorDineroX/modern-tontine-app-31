// Service d'authentification pour gérer les opérations liées à l'authentification
import apiService, { ApiError } from './apiService';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  createdAt?: string;
  updatedAt?: string;
  profileImage?: string;
  provider?: AuthProvider;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  GUEST = 'guest'
}

export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  APPLE = 'apple'
}

export enum Permission {
  // Permissions générales
  READ_USERS = 'read:users',
  WRITE_USERS = 'write:users',
  DELETE_USERS = 'delete:users',
  
  // Permissions spécifiques aux tontines
  CREATE_TONTINE = 'create:tontine',
  READ_TONTINE = 'read:tontine',
  UPDATE_TONTINE = 'update:tontine',
  DELETE_TONTINE = 'delete:tontine',
  MANAGE_MEMBERS = 'manage:members',
  
  // Permissions de paiement
  READ_PAYMENTS = 'read:payments',
  MAKE_PAYMENT = 'make:payment',
  APPROVE_PAYMENT = 'approve:payment',
  
  // Permissions administratives
  MANAGE_SETTINGS = 'manage:settings',
  VIEW_REPORTS = 'view:reports',
  EXPORT_DATA = 'export:data'
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: number;
  refreshToken?: string;
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

// Clés de stockage
const TOKEN_KEY = 'tontine_auth_token';
const REFRESH_TOKEN_KEY = 'tontine_refresh_token';
const USER_KEY = 'tontine_user';
const EXPIRY_KEY = 'tontine_token_expiry';

// Fonctions utilitaires pour la gestion des tokens
export const saveAuthData = (
  token: string, 
  user: User, 
  expiresAt: number, 
  rememberMe: boolean,
  refreshToken?: string
) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
  storage.setItem(EXPIRY_KEY, expiresAt.toString());
  
  if (refreshToken) {
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRY_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(EXPIRY_KEY);
};

export const getAuthData = (): { 
  token: string | null; 
  refreshToken: string | null;
  user: User | null; 
  expiresAt: number | null 
} => {
  // Vérifier d'abord sessionStorage, puis localStorage
  let token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  let refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);
  let userStr = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
  let expiryStr = sessionStorage.getItem(EXPIRY_KEY) || localStorage.getItem(EXPIRY_KEY);
  
  const user = userStr ? JSON.parse(userStr) as User : null;
  const expiresAt = expiryStr ? parseInt(expiryStr, 10) : null;
  
  return { token, refreshToken, user, expiresAt };
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

// Fonctions d'authentification qui utilisent l'API
// Variable globale pour stocker les utilisateurs simulés
const simulatedUsers: User[] = [
  {
    id: 'user_1',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.USER,
    permissions: [
      Permission.READ_TONTINE,
      Permission.CREATE_TONTINE,
      Permission.MAKE_PAYMENT
    ],
    createdAt: new Date().toISOString(),
    provider: AuthProvider.EMAIL
  },
  {
    id: 'admin_1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
    permissions: [
      Permission.READ_USERS,
      Permission.WRITE_USERS,
      Permission.DELETE_USERS,
      Permission.MANAGE_SETTINGS,
      Permission.VIEW_REPORTS,
      Permission.EXPORT_DATA
    ],
    createdAt: new Date().toISOString(),
    provider: AuthProvider.EMAIL
  }
];

export const login = async (credentials: LoginCredentials, rememberMe: boolean = false): Promise<AuthResponse> => {
  // Simuler un délai de requête
  await new Promise(resolve => setTimeout(resolve, 500));

  // Rechercher l'utilisateur dans les utilisateurs simulés
  const user = simulatedUsers.find(u => u.email === credentials.email);

  if (user) {
    // Créer une réponse d'authentification simulée
    const authResponse: AuthResponse = {
      user,
      token: `mock_token_${Math.random().toString(36).substring(2, 15)}`,
      expiresAt: Date.now() + 3600000, // 1 heure
      refreshToken: `mock_refresh_token_${Math.random().toString(36).substring(2, 15)}`
    };

    // Sauvegarder les données d'authentification
    saveAuthData(
      authResponse.token,
      authResponse.user,
      authResponse.expiresAt,
      rememberMe,
      authResponse.refreshToken
    );

    return authResponse;
  } else {
    throw new Error('Identifiants invalides');
  }
};

export const signup = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  // Simuler un délai de requête
  await new Promise(resolve => setTimeout(resolve, 500));

  // Vérifier si l'email existe déjà
  const existingUser = simulatedUsers.find(u => u.email === credentials.email);
  if (existingUser) {
    throw new Error('Cet email est déjà utilisé');
  }

  // Créer un nouvel utilisateur
  const newUser: User = {
    id: `user_${Math.random().toString(36).substring(2, 9)}`,
    email: credentials.email,
    name: credentials.fullName,
    role: UserRole.USER,
    permissions: [
      Permission.READ_TONTINE,
      Permission.CREATE_TONTINE,
      Permission.MAKE_PAYMENT
    ],
    createdAt: new Date().toISOString(),
    provider: AuthProvider.EMAIL
  };

  // Ajouter l'utilisateur aux utilisateurs simulés
  simulatedUsers.push(newUser);

  // Créer une réponse d'authentification simulée
  const authResponse: AuthResponse = {
    user: newUser,
    token: `mock_token_${Math.random().toString(36).substring(2, 15)}`,
    expiresAt: Date.now() + 3600000, // 1 heure
    refreshToken: `mock_refresh_token_${Math.random().toString(36).substring(2, 15)}`
  };

  // Sauvegarder les données d'authentification
  saveAuthData(
    authResponse.token,
    authResponse.user,
    authResponse.expiresAt,
    false,
    authResponse.refreshToken
  );

  return authResponse;
};

// Fonction pour la connexion via réseaux sociaux
export const socialLogin = async (provider: AuthProvider, accessToken: string): Promise<AuthResponse> => {
  // Simuler un délai de requête
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simuler des données utilisateur basées sur le fournisseur
  let userData: Partial<User> = {};
  
  switch (provider) {
    case AuthProvider.GOOGLE:
      userData = {
        email: `google_user_${Math.random().toString(36).substring(2, 9)}@gmail.com`,
        name: `Google User ${Math.floor(Math.random() * 1000)}`,
        profileImage: 'https://via.placeholder.com/150'
      };
      break;
    case AuthProvider.FACEBOOK:
      userData = {
        email: `fb_user_${Math.random().toString(36).substring(2, 9)}@facebook.com`,
        name: `Facebook User ${Math.floor(Math.random() * 1000)}`,
        profileImage: 'https://via.placeholder.com/150'
      };
      break;
    case AuthProvider.TWITTER:
      userData = {
        email: `twitter_user_${Math.random().toString(36).substring(2, 9)}@twitter.com`,
        name: `Twitter User ${Math.floor(Math.random() * 1000)}`,
        profileImage: 'https://via.placeholder.com/150'
      };
      break;
    case AuthProvider.APPLE:
      userData = {
        email: `apple_user_${Math.random().toString(36).substring(2, 9)}@icloud.com`,
        name: `Apple User ${Math.floor(Math.random() * 1000)}`,
        profileImage: 'https://via.placeholder.com/150'
      };
      break;
    default:
      throw new Error('Fournisseur d\'authentification non pris en charge');
  }

  // Vérifier si l'utilisateur existe déjà
  let user = simulatedUsers.find(u => u.email === userData.email);
  
  if (!user) {
    // Créer un nouvel utilisateur
    user = {
      id: `user_${Math.random().toString(36).substring(2, 9)}`,
      email: userData.email!,
      name: userData.name!,
      role: UserRole.USER,
      permissions: [
        Permission.READ_TONTINE,
        Permission.CREATE_TONTINE,
        Permission.MAKE_PAYMENT
      ],
      createdAt: new Date().toISOString(),
      profileImage: userData.profileImage,
      provider: provider
    };
    
    // Ajouter l'utilisateur aux utilisateurs simulés
    simulatedUsers.push(user);
  }

  // Créer une réponse d'authentification simulée
  const authResponse: AuthResponse = {
    user,
    token: `mock_token_${Math.random().toString(36).substring(2, 15)}`,
    expiresAt: Date.now() + 3600000, // 1 heure
    refreshToken: `mock_refresh_token_${Math.random().toString(36).substring(2, 15)}`
  };

  // Sauvegarder les données d'authentification
  saveAuthData(
    authResponse.token,
    authResponse.user,
    authResponse.expiresAt,
    true, // Toujours se souvenir pour les connexions sociales
    authResponse.refreshToken
  );

  return authResponse;
};

export const logout = async (): Promise<void> => {
  const { token, refreshToken } = getAuthData();
  
  if (token) {
    try {
      // Informer le serveur de la déconnexion
      await apiService.post('/auth/logout', { refreshToken }, token);
    } catch (error) {
      console.error('Erreur lors de la déconnexion côté serveur:', error);
    }
  }
  
  // Toujours effacer les données locales, même si l'appel API échoue
  clearAuthData();
};

// Variable globale pour stocker les demandes de réinitialisation de mot de passe
interface PasswordResetRequest {
  email: string;
  token: string;
  createdAt: number;
  expiresAt: number;
}

const passwordResetRequests: PasswordResetRequest[] = [];

export const resetPassword = async (email: string): Promise<void> => {
  // Simuler un délai de requête
  await new Promise(resolve => setTimeout(resolve, 500));

  // Valider l'email
  if (!isValidEmail(email)) {
    throw new Error('Adresse email invalide');
  }

  // Vérifier si l'utilisateur existe
  const user = simulatedUsers.find(u => u.email === email);
  if (!user) {
    throw new Error('Aucun compte trouvé avec cet email');
  }

  // Générer un token de réinitialisation
  const resetToken = `reset_token_${Math.random().toString(36).substring(2, 15)}`;
  
  // Créer une demande de réinitialisation
  const resetRequest: PasswordResetRequest = {
    email,
    token: resetToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 3600000 // Expire dans 1 heure
  };

  // Ajouter ou remplacer une demande existante
  const existingRequestIndex = passwordResetRequests.findIndex(req => req.email === email);
  if (existingRequestIndex !== -1) {
    passwordResetRequests[existingRequestIndex] = resetRequest;
  } else {
    passwordResetRequests.push(resetRequest);
  }

  // Simuler l'envoi d'email
  console.log(`Email de réinitialisation envoyé à ${email}`);
  console.log(`Lien de réinitialisation : /reset-password?token=${resetToken}`);
};

export const verifyResetToken = async (token: string): Promise<string> => {
  // Simuler un délai de requête
  await new Promise(resolve => setTimeout(resolve, 300));

  // Trouver la demande de réinitialisation
  const resetRequest = passwordResetRequests.find(req => req.token === token);

  if (!resetRequest) {
    throw new Error('Token de réinitialisation invalide');
  }

  // Vérifier l'expiration du token
  if (resetRequest.expiresAt < Date.now()) {
    // Supprimer le token expiré
    const index = passwordResetRequests.indexOf(resetRequest);
    passwordResetRequests.splice(index, 1);
    throw new Error('Le lien de réinitialisation a expiré');
  }

  // Retourner l'email associé au token
  return resetRequest.email;
};

export const confirmPasswordReset = async (token: string, newPassword: string): Promise<void> => {
  // Simuler un délai de requête
  await new Promise(resolve => setTimeout(resolve, 500));

  // Valider le token
  const email = await verifyResetToken(token);

  // Valider le nouveau mot de passe
  if (!isStrongPassword(newPassword)) {
    throw new Error('Le nouveau mot de passe est trop faible');
  }

  // Trouver l'utilisateur
  const userIndex = simulatedUsers.findIndex(u => u.email === email);
  if (userIndex === -1) {
    throw new Error('Utilisateur non trouvé');
  }

  // Supprimer la demande de réinitialisation
  const resetRequestIndex = passwordResetRequests.findIndex(req => req.token === token);
  if (resetRequestIndex !== -1) {
    passwordResetRequests.splice(resetRequestIndex, 1);
  }

  // Simuler la mise à jour du mot de passe
  console.log(`Mot de passe mis à jour pour ${email}`);
};

export const refreshToken = async (currentRefreshToken: string): Promise<AuthResponse> => {
  try {
    const response = await apiService.post<AuthResponse>('/auth/refresh-token', { 
      refreshToken: currentRefreshToken 
    });
    
    // Déterminer si le token était dans localStorage (rememberMe) ou sessionStorage
    const isInLocalStorage = localStorage.getItem(TOKEN_KEY) !== null;
    
    // Sauvegarder les nouvelles données d'authentification
    saveAuthData(
      response.data.token,
      response.data.user,
      response.data.expiresAt,
      isInLocalStorage,
      response.data.refreshToken
    );
    
    return response.data;
  } catch (error) {
    // Si le rafraîchissement échoue, déconnecter l'utilisateur
    clearAuthData();
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }
};

export const updateUserProfile = async (userData: Partial<User>, token: string): Promise<User> => {
  try {
    const response = await apiService.patch<{ user: User }>('/users/profile', userData, token);
    
    // Mettre à jour les données utilisateur stockées
    const { expiresAt, refreshToken } = getAuthData();
    const updatedUser = response.data.user;
    
    if (expiresAt) {
      // Déterminer si le token était dans localStorage (rememberMe) ou sessionStorage
      const isInLocalStorage = localStorage.getItem(TOKEN_KEY) !== null;
      
      // Sauvegarder les données utilisateur mises à jour
      saveAuthData(
        token,
        updatedUser,
        expiresAt,
        isInLocalStorage,
        refreshToken || undefined
      );
    }
    
    return updatedUser;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearAuthData();
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
    throw new Error('Erreur lors de la mise à jour du profil');
  }
};

// Vérifier si l'utilisateur est authentifié
export const isAuthenticated = (): boolean => {
  const { token, expiresAt } = getAuthData();
  
  if (!token || !expiresAt) {
    return false;
  }
  
  // Vérifier si le token est expiré
  return expiresAt > Date.now();
};

// Vérifier si l'utilisateur a un rôle spécifique
export const hasRole = (requiredRole: UserRole): boolean => {
  const { user } = getAuthData();
  
  if (!user) {
    return false;
  }
  
  // Vérifier le rôle de l'utilisateur
  return user.role === requiredRole;
};

// Vérifier si l'utilisateur a une permission spécifique
export const hasPermission = (requiredPermission: Permission): boolean => {
  const { user } = getAuthData();
  
  if (!user || !user.permissions) {
    return false;
  }
  
  // Vérifier si l'utilisateur a la permission requise
  return user.permissions.includes(requiredPermission);
};

// Vérifier si l'utilisateur a toutes les permissions spécifiées
export const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
  const { user } = getAuthData();
  
  if (!user || !user.permissions) {
    return false;
  }
  
  // Vérifier si l'utilisateur a toutes les permissions requises
  return requiredPermissions.every(permission => user.permissions.includes(permission));
};

// Vérifier si l'utilisateur a au moins une des permissions spécifiées
export const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
  const { user } = getAuthData();
  
  if (!user || !user.permissions) {
    return false;
  }
  
  // Vérifier si l'utilisateur a au moins une des permissions requises
  return requiredPermissions.some(permission => user.permissions.includes(permission));
};

// Obtenir les permissions de l'utilisateur actuel
export const getUserPermissions = (): Permission[] => {
  const { user } = getAuthData();
  
  if (!user || !user.permissions) {
    return [];
  }
  
  return user.permissions;
};

// Exporter l'objet par défaut avec toutes les fonctions
const authService = {
  login,
  signup,
  socialLogin,
  logout,
  resetPassword,
  refreshToken,
  updateUserProfile,
  isAuthenticated,
  hasRole,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getUserPermissions,
  getAuthData,
  clearAuthData,
  isValidEmail,
  isStrongPassword,
  UserRole,
  Permission,
  AuthProvider
};

export default authService;