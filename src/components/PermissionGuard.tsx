import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Permission, UserRole } from '@/services/authService';

interface PermissionGuardProps {
  children: ReactNode;
  permissions?: Permission[];
  roles?: UserRole[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

/**
 * Composant qui protège le contenu en fonction des permissions ou des rôles de l'utilisateur
 * 
 * @param children - Le contenu à afficher si l'utilisateur a les permissions/rôles requis
 * @param permissions - Liste des permissions requises
 * @param roles - Liste des rôles requis
 * @param requireAll - Si true, toutes les permissions/rôles sont requis. Si false, au moins un est requis.
 * @param fallback - Contenu à afficher si l'utilisateur n'a pas les permissions/rôles requis
 */
export default function PermissionGuard({
  children,
  permissions = [],
  roles = [],
  requireAll = true,
  fallback = null
}: PermissionGuardProps) {
  const { user, hasPermission, hasRole, hasAllPermissions, hasAnyPermission } = useAuth();

  // Si l'utilisateur n'est pas connecté, afficher le fallback
  if (!user) {
    return <>{fallback}</>;
  }

  // Vérifier les permissions si elles sont spécifiées
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  // Vérifier les rôles si ils sont spécifiés
  if (roles.length > 0) {
    const hasRequiredRole = roles.some(role => hasRole(role));
    
    if (!hasRequiredRole) {
      return <>{fallback}</>;
    }
  }

  // Si toutes les vérifications sont passées, afficher le contenu
  return <>{children}</>;
}