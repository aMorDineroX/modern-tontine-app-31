import { useAuth } from '@/contexts/AuthContext';
import { Permission, UserRole } from '@/services/authService';

/**
 * Hook personnalisé pour gérer les permissions et les rôles
 */
export const usePermissions = () => {
  const { 
    user, 
    hasPermission, 
    hasRole, 
    hasAllPermissions, 
    hasAnyPermission 
  } = useAuth();

  return {
    // Utilisateur actuel
    user,

    // Vérifier une permission spécifique
    can: (permission: Permission) => hasPermission(permission),

    // Vérifier un rôle spécifique
    isRole: (role: UserRole) => hasRole(role),

    // Vérifier plusieurs permissions
    canAll: (permissions: Permission[]) => hasAllPermissions(permissions),
    canAny: (permissions: Permission[]) => hasAnyPermission(permissions),

    // Vérifier les rôles
    isAnyRole: (roles: UserRole[]) => roles.some(role => hasRole(role)),

    // Obtenir les permissions de l'utilisateur
    getPermissions: () => user?.permissions || [],

    // Obtenir le rôle de l'utilisateur
    getRole: () => user?.role,

    // Vérifications rapides
    isAdmin: () => hasRole(UserRole.ADMIN),
    isManager: () => hasRole(UserRole.MANAGER),
    isUser: () => hasRole(UserRole.USER),
    isGuest: () => hasRole(UserRole.GUEST),
  };
};

// Exemple d'utilisation des permissions
export const useCanCreateTontine = () => {
  const { can } = usePermissions();
  return can(Permission.CREATE_TONTINE);
};

export const useCanManageMembers = () => {
  const { can } = usePermissions();
  return can(Permission.MANAGE_MEMBERS);
};

export const useCanViewReports = () => {
  const { can } = usePermissions();
  return can(Permission.VIEW_REPORTS);
};