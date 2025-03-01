import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import tontineService from '@/services/tontineService';
import { TontineGroup, GroupMember, Contribution, Payout, Notification } from '@/utils/supabase';

// Types
interface TontineContextType {
  // State
  userGroups: TontineGroup[];
  currentGroup: TontineGroup | null;
  groupMembers: GroupMember[];
  contributions: Contribution[];
  payouts: Payout[];
  notifications: Notification[];
  isLoading: {
    groups: boolean;
    members: boolean;
    contributions: boolean;
    payouts: boolean;
    notifications: boolean;
  };
  error: string | null;

  // Group actions
  fetchUserGroups: () => Promise<void>;
  fetchGroupDetails: (groupId: string) => Promise<void>;
  createGroup: (group: Omit<TontineGroup, 'id' | 'created_at' | 'updated_at' | 'status' | 'current_round'>) => Promise<TontineGroup>;
  updateGroup: (groupId: string, updates: Partial<Omit<TontineGroup, 'id' | 'created_at' | 'created_by'>>) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  
  // Member actions
  fetchGroupMembers: (groupId: string) => Promise<void>;
  addMember: (member: Omit<GroupMember, 'id' | 'joined_at'>) => Promise<void>;
  updateMember: (memberId: string, updates: Partial<Omit<GroupMember, 'id' | 'group_id' | 'user_id' | 'joined_at'>>) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  inviteMember: (groupId: string, email: string, role?: 'admin' | 'member') => Promise<void>;
  
  // Contribution actions
  fetchContributions: (groupId: string) => Promise<void>;
  recordContribution: (contribution: Omit<Contribution, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateContribution: (contributionId: string, updates: Partial<Omit<Contribution, 'id' | 'group_id' | 'user_id' | 'created_at'>>) => Promise<void>;
  
  // Payout actions
  fetchPayouts: (groupId: string) => Promise<void>;
  schedulePayout: (payout: Omit<Payout, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePayout: (payoutId: string, updates: Partial<Omit<Payout, 'id' | 'group_id' | 'user_id' | 'created_at'>>) => Promise<void>;
  
  // Notification actions
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  
  // Utility functions
  clearCurrentGroup: () => void;
  refreshData: (groupId?: string) => Promise<void>;
}

// Créer le contexte avec des valeurs par défaut
const TontineContext = createContext<TontineContextType>({
  // State
  userGroups: [],
  currentGroup: null,
  groupMembers: [],
  contributions: [],
  payouts: [],
  notifications: [],
  isLoading: {
    groups: false,
    members: false,
    contributions: false,
    payouts: false,
    notifications: false,
  },
  error: null,

  // Group actions
  fetchUserGroups: async () => {},
  fetchGroupDetails: async () => {},
  createGroup: async () => ({ id: '', name: '', contribution_amount: 0, currency: '', frequency: 'monthly', start_date: '', payout_method: 'rotation', created_by: '', created_at: '', status: 'pending' }),
  updateGroup: async () => {},
  deleteGroup: async () => {},
  
  // Member actions
  fetchGroupMembers: async () => {},
  addMember: async () => {},
  updateMember: async () => {},
  removeMember: async () => {},
  inviteMember: async () => {},
  
  // Contribution actions
  fetchContributions: async () => {},
  recordContribution: async () => {},
  updateContribution: async () => {},
  
  // Payout actions
  fetchPayouts: async () => {},
  schedulePayout: async () => {},
  updatePayout: async () => {},
  
  // Notification actions
  fetchNotifications: async () => {},
  markNotificationAsRead: async () => {},
  markAllNotificationsAsRead: async () => {},
  deleteNotification: async () => {},
  
  // Utility functions
  clearCurrentGroup: () => {},
  refreshData: async () => {},
});

// Hook personnalisé pour utiliser le contexte tontine
export const useTontine = () => useContext(TontineContext);

// Fournisseur du contexte tontine
export const TontineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [userGroups, setUserGroups] = useState<TontineGroup[]>([]);
  const [currentGroup, setCurrentGroup] = useState<TontineGroup | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState({
    groups: false,
    members: false,
    contributions: false,
    payouts: false,
    notifications: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Fonction pour gérer les erreurs
  const handleError = (error: any, customMessage: string) => {
    console.error(customMessage, error);
    const errorMessage = error.message || customMessage;
    setError(errorMessage);
    // Réinitialiser l'erreur après 5 secondes
    setTimeout(() => setError(null), 5000);
  };

  // Charger les groupes de l'utilisateur au chargement
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserGroups();
      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  // Fonction pour récupérer les groupes de l'utilisateur
  const fetchUserGroups = async () => {
    if (!user) return;
    
    setIsLoading(prev => ({ ...prev, groups: true }));
    setError(null);
    
    try {
      const groups = await tontineService.getUserGroups(user.id);
      setUserGroups(groups);
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération des groupes');
    } finally {
      setIsLoading(prev => ({ ...prev, groups: false }));
    }
  };

  // Fonction pour récupérer les détails d'un groupe
  const fetchGroupDetails = async (groupId: string) => {
    setIsLoading(prev => ({ ...prev, groups: true }));
    setError(null);
    
    try {
      const group = await tontineService.getGroupDetails(groupId);
      setCurrentGroup(group);
      
      // Charger les données associées au groupe
      fetchGroupMembers(groupId);
      fetchContributions(groupId);
      fetchPayouts(groupId);
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération des détails du groupe');
    } finally {
      setIsLoading(prev => ({ ...prev, groups: false }));
    }
  };

  // Fonction pour créer un nouveau groupe
  const createGroup = async (
    group: Omit<TontineGroup, 'id' | 'created_at' | 'updated_at' | 'status' | 'current_round'>
  ) => {
    if (!user) throw new Error('Utilisateur non authentifié');
    
    setIsLoading(prev => ({ ...prev, groups: true }));
    setError(null);
    
    try {
      const newGroup = await tontineService.createTontineGroup(group);
      
      // Ajouter le créateur comme membre admin
      await tontineService.addMemberToGroup({
        group_id: newGroup.id,
        user_id: user.id,
        role: 'admin',
        status: 'active'
      });
      
      // Mettre à jour la liste des groupes
      setUserGroups(prev => [...prev, newGroup]);
      
      return newGroup;
    } catch (error) {
      handleError(error, 'Erreur lors de la création du groupe');
      throw error;
    } finally {
      setIsLoading(prev => ({ ...prev, groups: false }));
    }
  };

  // Fonction pour mettre à jour un groupe
  const updateGroup = async (
    groupId: string, 
    updates: Partial<Omit<TontineGroup, 'id' | 'created_at' | 'created_by'>>
  ) => {
    setIsLoading(prev => ({ ...prev, groups: true }));
    setError(null);
    
    try {
      const updatedGroup = await tontineService.updateTontineGroup(groupId, updates);
      
      // Mettre à jour le groupe actuel si c'est celui qui est modifié
      if (currentGroup && currentGroup.id === groupId) {
        setCurrentGroup(updatedGroup);
      }
      
      // Mettre à jour la liste des groupes
      setUserGroups(prev => 
        prev.map(group => group.id === groupId ? updatedGroup : group)
      );
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour du groupe');
      throw error;
    } finally {
      setIsLoading(prev => ({ ...prev, groups: false }));
    }
  };

  // Fonction pour supprimer un groupe
  const deleteGroup = async (groupId: string) => {
    setIsLoading(prev => ({ ...prev, groups: true }));
    setError(null);
    
    try {
      await tontineService.deleteTontineGroup(groupId);
      
      // Supprimer le groupe de la liste
      setUserGroups(prev => prev.filter(group => group.id !== groupId));
      
      // Réinitialiser le groupe actuel s'il s'agit du groupe supprimé
      if (currentGroup && currentGroup.id === groupId) {
        setCurrentGroup(null);
      }
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression du groupe');
      throw error;
    } finally {
      setIsLoading(prev => ({ ...prev, groups: false }));
    }
  };

  // Fonction pour récupérer les membres d'un groupe
  const fetchGroupMembers = async (groupId: string) => {
    setIsLoading(prev => ({ ...prev, members: true }));
    setError(null);
    
    try {
      const members = await tontineService.getGroupMembers(groupId);
      setGroupMembers(members);
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération des membres du groupe');
    } finally {
      setIsLoading(prev => ({ ...prev, members: false }));
    }
  };

  // Fonction pour ajouter un membre à un groupe
  const addMember = async (member: Omit<GroupMember, 'id' | 'joined_at'>) => {
    setIsLoading(prev => ({ ...prev, members: true }));
    setError(null);
    
    try {
      const newMember = await tontineService.addMemberToGroup(member);
      
      // Mettre à jour la liste des membres
      setGroupMembers(prev => [...prev, newMember]);
    } catch (error) {
      handleError(error, 'Erreur lors de l\'ajout du membre');
      throw error;
    } finally {
      setIsLoading(prev => ({ ...prev, members: false }));
    }
  };

  // Fonction pour mettre à jour un membre
  const updateMember = async (
    memberId: string, 
    updates: Partial<Omit<GroupMember, 'id' | 'group_id' | 'user_id' | 'joined_at'>>
  ) => {
    setIsLoading(prev => ({ ...prev, members: true }));
    setError(null);
    
    try {
      const updatedMember = await tontineService.updateGroupMember(memberId, updates);
      
      // Mettre à jour la liste des membres
      setGroupMembers(prev => 
        prev.map(member => member.id === memberId ? updatedMember : member)
      );
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour du membre');
      throw error;
    } finally {
      setIsLoading(prev => ({ ...prev, members: false }));
    }
  };

  // Fonction pour supprimer un membre d'un groupe
  const removeMember = async (memberId: string) => {
    setIsLoading(prev => ({ ...prev, members: true }));
    setError(null);
    
    try {
      await tontineService.removeMemberFromGroup(memberId);
      
      // Mettre à jour la liste des membres
      setGroupMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression du membre');
      throw error;
    } finally {
      setIsLoading(prev => ({ ...prev, members: false }));
    }
  };

  // Fonction pour inviter un utilisateur à rejoindre un groupe
  const inviteMember = async (groupId: string, email: string, role: 'admin' | 'member' = 'member') => {
    setIsLoading(prev => ({ ...prev, members: true }));
    setError(null);
    
    try {
      const newMember = await tontineService.inviteUserToGroup(groupId, email, role);
      
      // Mettre à jour la liste des membres
      setGroupMembers(prev => [...prev, newMember]);
    } catch (error) {
      handleError(error, 'Erreur lors de l\'invitation du membre');
      throw error;
    } finally {
      setIsLoading(prev => ({ ...prev, members: false }));
    }
  };

  // Fonction pour récupérer les contributions d'un groupe
  const fetchContributions = async (groupId: string) => {
    setIsLoading(prev => ({ ...prev, contributions: true }));
    setError(null);
    
    try {
      const groupContributions = await tontineService.getGroupContributions(groupId);
      setContributions(groupContributions);
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération des contributions');
    } finally {
      setIsLoading(prev => ({ ...prev, contributions: false }));
    }
  };

  // Fonction pour enregistrer une contribution
  const recordContribution = async (contribution: Omit<Contribution, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(prev => ({ ...prev, contributions: true }));
    setError(null);
    
    try {
      const newContribution = await tontineService.recordContribution(contribution);
      
      // Mettre à jour la liste des contributions
      setContributions(prev => [...prev, newContribution]);
    } catch (error) {
      handleError(error, 'Erreur lors de l\'enregistrement de la contribution');
      throw error;
    } finally {
      setIsLoading(prev => ({ ...prev, contributions: false }));
    }
  };

  // Fonction pour mettre à jour une contribution
  const updateContribution = async (
    contributionId: string, 
    updates: Partial<Omit<Contribution, 'id' | 'group_id' | 'user_id' | 'created_at'>>
  ) => {
    setIsLoading(prev => ({ ...prev, contributions: true }));
    setError(null);
    
    try {
      const updatedContribution = await tontineService.updateContribution(contributionId, updates);
      
      // Mettre à jour la liste des contributions
      setContributions(prev => 
        prev.map(contribution => contribution.id === contributionId ? updatedContribution : contribution)
      );
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour de la contribution');
      throw error;
    } finally {
      setIsLoading(prev => ({ ...prev, contributions: false }));
    }
  };

  // Fonction pour récupérer les paiements d'un groupe
  const fetchPayouts = async (groupId: string) => {
    setIsLoading(prev => ({ ...prev, payouts: true }));
    setError(null);
    
    try {
      const groupPayouts = await tontineService.getGroupPayouts(groupId);
      setPayouts(groupPayouts);
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération des paiements');
    } finally {
      setIsLoading(prev => ({ ...prev, payouts: false }));
    }
  };

  // Fonction pour programmer un paiement
  const schedulePayout = async (payout: Omit<Payout, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(prev => ({ ...prev, payouts: true }));
    setError(null);
    
    try {
      const newPayout = await tontineService.schedulePayout(payout);
      
      // Mettre à jour la liste des paiements
      setPayouts(prev => [...prev, newPayout]);
    } catch (error) {
      handleError(error, 'Erreur lors de la programmation du paiement');
      throw error;
    } finally {
      setIsLoading(prev => ({ ...prev, payouts: false }));
    }
  };

  // Fonction pour mettre à jour un paiement
  const updatePayout = async (
    payoutId: string, 
    updates: Partial<Omit<Payout, 'id' | 'group_id' | 'user_id' | 'created_at'>>
  ) => {
    setIsLoading(prev => ({ ...prev, payouts: true }));
    setError(null);
    
    try {
      const updatedPayout = await tontineService.updatePayout(payoutId, updates);
      
      // Mettre à jour la liste des paiements
      setPayouts(prev => 
        prev.map(payout => payout.id === payoutId ? updatedPayout : payout)
      );
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour du paiement');
      throw error;
    } finally {
      setIsLoading(prev => ({ ...prev, payouts: false }));
    }
  };

  // Fonction pour récupérer les notifications
  const fetchNotifications = async () => {
    if (!user) return;
    
    setIsLoading(prev => ({ ...prev, notifications: true }));
    setError(null);
    
    try {
      const userNotifications = await tontineService.getUserNotifications(user.id);
      setNotifications(userNotifications);
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération des notifications');
    } finally {
      setIsLoading(prev => ({ ...prev, notifications: false }));
    }
  };

  // Fonction pour marquer une notification comme lue
  const markNotificationAsRead = async (notificationId: string) => {
    setIsLoading(prev => ({ ...prev, notifications: true }));
    setError(null);
    
    try {
      const updatedNotification = await tontineService.markNotificationAsRead(notificationId);
      
      // Mettre à jour la liste des notifications
      setNotifications(prev => 
        prev.map(notification => notification.id === notificationId ? updatedNotification : notification)
      );
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour de la notification');
    } finally {
      setIsLoading(prev => ({ ...prev, notifications: false }));
    }
  };

  // Fonction pour marquer toutes les notifications comme lues
  const markAllNotificationsAsRead = async () => {
    if (!user) return;
    
    setIsLoading(prev => ({ ...prev, notifications: true }));
    setError(null);
    
    try {
      await tontineService.markAllNotificationsAsRead(user.id);
      
      // Mettre à jour toutes les notifications
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour des notifications');
    } finally {
      setIsLoading(prev => ({ ...prev, notifications: false }));
    }
  };

  // Fonction pour supprimer une notification
  const deleteNotification = async (notificationId: string) => {
    setIsLoading(prev => ({ ...prev, notifications: true }));
    setError(null);
    
    try {
      await tontineService.deleteNotification(notificationId);
      
      // Mettre à jour la liste des notifications
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression de la notification');
    } finally {
      setIsLoading(prev => ({ ...prev, notifications: false }));
    }
  };

  // Fonction pour réinitialiser le groupe actuel
  const clearCurrentGroup = () => {
    setCurrentGroup(null);
    setGroupMembers([]);
    setContributions([]);
    setPayouts([]);
  };

  // Fonction pour rafraîchir toutes les données
  const refreshData = async (groupId?: string) => {
    if (!user) return;
    
    // Rafraîchir les groupes et les notifications
    await fetchUserGroups();
    await fetchNotifications();
    
    // Si un groupId est fourni, rafraîchir les données de ce groupe
    if (groupId) {
      await fetchGroupDetails(groupId);
    }
  };

  // Valeur du contexte
  const value = {
    // State
    userGroups,
    currentGroup,
    groupMembers,
    contributions,
    payouts,
    notifications,
    isLoading,
    error,

    // Group actions
    fetchUserGroups,
    fetchGroupDetails,
    createGroup,
    updateGroup,
    deleteGroup,
    
    // Member actions
    fetchGroupMembers,
    addMember,
    updateMember,
    removeMember,
    inviteMember,
    
    // Contribution actions
    fetchContributions,
    recordContribution,
    updateContribution,
    
    // Payout actions
    fetchPayouts,
    schedulePayout,
    updatePayout,
    
    // Notification actions
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    
    // Utility functions
    clearCurrentGroup,
    refreshData,
  };

  return <TontineContext.Provider value={value}>{children}</TontineContext.Provider>;
};

export default TontineContext;