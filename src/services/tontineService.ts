/**
 * Service for managing tontine-related operations
 */
import { supabase, TontineGroup, GroupMember, Contribution, Payout, PaymentMethod, Notification, Transaction } from '@/utils/supabase';
import { PostgrestError } from '@supabase/supabase-js';

// Error handling
export class TontineServiceError extends Error {
  code?: string;
  details?: any;

  constructor(message: string, code?: string, details?: any) {
    super(message);
    this.name = 'TontineServiceError';
    this.code = code;
    this.details = details;
  }
}

// Helper function to handle Supabase errors
const handleError = (error: PostgrestError | null, customMessage: string): never => {
  throw new TontineServiceError(
    customMessage || error?.message || 'Une erreur est survenue',
    error?.code,
    error?.details
  );
};

// ==================== TONTINE GROUPS ====================

/**
 * Create a new tontine group
 */
export const createTontineGroup = async (
  group: Omit<TontineGroup, 'id' | 'created_at' | 'updated_at' | 'status' | 'current_round'>
): Promise<TontineGroup> => {
  const { data, error } = await supabase
    .from('tontine_groups')
    .insert({
      ...group,
      status: 'pending',
      current_round: 0,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) handleError(error, 'Erreur lors de la création du groupe');
  return data as TontineGroup;
};

/**
 * Get all tontine groups for a user
 */
export const getUserGroups = async (userId: string): Promise<TontineGroup[]> => {
  const { data, error } = await supabase
    .from('tontine_groups')
    .select(`
      *,
      group_members!inner(*)
    `)
    .eq('group_members.user_id', userId);
  
  if (error) handleError(error, 'Erreur lors de la récupération des groupes');
  return data as TontineGroup[];
};

/**
 * Get details for a specific tontine group
 */
export const getGroupDetails = async (groupId: string): Promise<TontineGroup> => {
  const { data, error } = await supabase
    .from('tontine_groups')
    .select('*')
    .eq('id', groupId)
    .single();
  
  if (error) handleError(error, 'Erreur lors de la récupération des détails du groupe');
  return data as TontineGroup;
};

/**
 * Update a tontine group
 */
export const updateTontineGroup = async (
  groupId: string, 
  updates: Partial<Omit<TontineGroup, 'id' | 'created_at' | 'created_by'>>
): Promise<TontineGroup> => {
  const { data, error } = await supabase
    .from('tontine_groups')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', groupId)
    .select()
    .single();
  
  if (error) handleError(error, 'Erreur lors de la mise à jour du groupe');
  return data as TontineGroup;
};

/**
 * Delete a tontine group
 */
export const deleteTontineGroup = async (groupId: string): Promise<void> => {
  const { error } = await supabase
    .from('tontine_groups')
    .delete()
    .eq('id', groupId);
  
  if (error) handleError(error, 'Erreur lors de la suppression du groupe');
};

// ==================== GROUP MEMBERS ====================

/**
 * Add a member to a tontine group
 */
export const addMemberToGroup = async (
  member: Omit<GroupMember, 'id' | 'joined_at'>
): Promise<GroupMember> => {
  const { data, error } = await supabase
    .from('group_members')
    .insert({
      ...member,
      joined_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) handleError(error, 'Erreur lors de l\'ajout du membre au groupe');
  return data as GroupMember;
};

/**
 * Get all members of a tontine group
 */
export const getGroupMembers = async (groupId: string): Promise<(GroupMember & { profile?: any })[]> => {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      *,
      profiles:user_id(id, full_name, avatar_url, email)
    `)
    .eq('group_id', groupId);
  
  if (error) handleError(error, 'Erreur lors de la récupération des membres du groupe');
  return data as (GroupMember & { profile?: any })[];
};

/**
 * Update a group member's status or role
 */
export const updateGroupMember = async (
  memberId: string, 
  updates: Partial<Omit<GroupMember, 'id' | 'group_id' | 'user_id' | 'joined_at'>>
): Promise<GroupMember> => {
  const { data, error } = await supabase
    .from('group_members')
    .update(updates)
    .eq('id', memberId)
    .select()
    .single();
  
  if (error) handleError(error, 'Erreur lors de la mise à jour du membre');
  return data as GroupMember;
};

/**
 * Remove a member from a group
 */
export const removeMemberFromGroup = async (memberId: string): Promise<void> => {
  const { error } = await supabase
    .from('group_members')
    .update({ status: 'removed' })
    .eq('id', memberId);
  
  if (error) handleError(error, 'Erreur lors de la suppression du membre');
};

/**
 * Invite a user to join a group by email
 */
export const inviteUserToGroup = async (
  groupId: string, 
  email: string, 
  role: 'admin' | 'member' = 'member'
): Promise<GroupMember> => {
  // First check if user with this email exists
  const { data: existingUser, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();
  
  if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found" error
    handleError(userError, 'Erreur lors de la recherche de l\'utilisateur');
  }
  
  if (existingUser) {
    // User exists, add them directly
    return addMemberToGroup({
      group_id: groupId,
      user_id: existingUser.id,
      role,
      status: 'pending',
      invitation_email: email,
      invitation_status: 'sent'
    });
  } else {
    // User doesn't exist, create a placeholder member
    const { data, error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        // We'll use a placeholder user_id that will be replaced when the user registers
        user_id: '00000000-0000-0000-0000-000000000000',
        role,
        status: 'pending',
        joined_at: new Date().toISOString(),
        invitation_email: email,
        invitation_status: 'sent'
      })
      .select()
      .single();
    
    if (error) handleError(error, 'Erreur lors de l\'invitation de l\'utilisateur');
    return data as GroupMember;
  }
};

// ==================== CONTRIBUTIONS ====================

/**
 * Record a new contribution
 */
export const recordContribution = async (
  contribution: Omit<Contribution, 'id' | 'created_at' | 'updated_at'>
): Promise<Contribution> => {
  const { data, error } = await supabase
    .from('contributions')
    .insert({
      ...contribution,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) handleError(error, 'Erreur lors de l\'enregistrement de la contribution');
  return data as Contribution;
};

/**
 * Get all contributions for a user, optionally filtered by group
 */
export const getUserContributions = async (
  userId: string, 
  groupId?: string
): Promise<Contribution[]> => {
  let query = supabase
    .from('contributions')
    .select('*')
    .eq('user_id', userId);
  
  if (groupId) {
    query = query.eq('group_id', groupId);
  }
  
  const { data, error } = await query;
  
  if (error) handleError(error, 'Erreur lors de la récupération des contributions');
  return data as Contribution[];
};

/**
 * Get all contributions for a group
 */
export const getGroupContributions = async (
  groupId: string, 
  roundNumber?: number
): Promise<(Contribution & { profile?: any })[]> => {
  let query = supabase
    .from('contributions')
    .select(`
      *,
      profiles:user_id(id, full_name, avatar_url)
    `)
    .eq('group_id', groupId);
  
  if (roundNumber !== undefined) {
    query = query.eq('round_number', roundNumber);
  }
  
  const { data, error } = await query;
  
  if (error) handleError(error, 'Erreur lors de la récupération des contributions du groupe');
  return data as (Contribution & { profile?: any })[];
};

/**
 * Update a contribution's status
 */
export const updateContribution = async (
  contributionId: string, 
  updates: Partial<Omit<Contribution, 'id' | 'group_id' | 'user_id' | 'created_at'>>
): Promise<Contribution> => {
  const { data, error } = await supabase
    .from('contributions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', contributionId)
    .select()
    .single();
  
  if (error) handleError(error, 'Erreur lors de la mise à jour de la contribution');
  return data as Contribution;
};

/**
 * Delete a contribution
 */
export const deleteContribution = async (contributionId: string): Promise<void> => {
  const { error } = await supabase
    .from('contributions')
    .delete()
    .eq('id', contributionId);
  
  if (error) handleError(error, 'Erreur lors de la suppression de la contribution');
};

// ==================== PAYOUTS ====================

/**
 * Schedule a new payout
 */
export const schedulePayout = async (
  payout: Omit<Payout, 'id' | 'created_at' | 'updated_at'>
): Promise<Payout> => {
  const { data, error } = await supabase
    .from('payouts')
    .insert({
      ...payout,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) handleError(error, 'Erreur lors de la programmation du paiement');
  return data as Payout;
};

/**
 * Get all payouts for a user
 */
export const getUserPayouts = async (userId: string): Promise<Payout[]> => {
  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('user_id', userId);
  
  if (error) handleError(error, 'Erreur lors de la récupération des paiements');
  return data as Payout[];
};

/**
 * Get all payouts for a group
 */
export const getGroupPayouts = async (
  groupId: string
): Promise<(Payout & { profile?: any })[]> => {
  const { data, error } = await supabase
    .from('payouts')
    .select(`
      *,
      profiles:user_id(id, full_name, avatar_url)
    `)
    .eq('group_id', groupId);
  
  if (error) handleError(error, 'Erreur lors de la récupération des paiements du groupe');
  return data as (Payout & { profile?: any })[];
};

/**
 * Update a payout's status
 */
export const updatePayout = async (
  payoutId: string, 
  updates: Partial<Omit<Payout, 'id' | 'group_id' | 'user_id' | 'created_at'>>
): Promise<Payout> => {
  const { data, error } = await supabase
    .from('payouts')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', payoutId)
    .select()
    .single();
  
  if (error) handleError(error, 'Erreur lors de la mise à jour du paiement');
  return data as Payout;
};

// ==================== PAYMENT METHODS ====================

/**
 * Add a new payment method for a user
 */
export const addPaymentMethod = async (
  paymentMethod: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>
): Promise<PaymentMethod> => {
  // If this is set as default, unset any existing default
  if (paymentMethod.is_default) {
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', paymentMethod.user_id);
  }
  
  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      ...paymentMethod,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) handleError(error, 'Erreur lors de l\'ajout du moyen de paiement');
  return data as PaymentMethod;
};

/**
 * Get all payment methods for a user
 */
export const getUserPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });
  
  if (error) handleError(error, 'Erreur lors de la récupération des moyens de paiement');
  return data as PaymentMethod[];
};

/**
 * Update a payment method
 */
export const updatePaymentMethod = async (
  paymentMethodId: string, 
  updates: Partial<Omit<PaymentMethod, 'id' | 'user_id' | 'created_at'>>
): Promise<PaymentMethod> => {
  // If this is set as default, unset any existing default
  if (updates.is_default) {
    const { data: existingMethod } = await supabase
      .from('payment_methods')
      .select('user_id')
      .eq('id', paymentMethodId)
      .single();
    
    if (existingMethod) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', existingMethod.user_id)
        .neq('id', paymentMethodId);
    }
  }
  
  const { data, error } = await supabase
    .from('payment_methods')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', paymentMethodId)
    .select()
    .single();
  
  if (error) handleError(error, 'Erreur lors de la mise à jour du moyen de paiement');
  return data as PaymentMethod;
};

/**
 * Delete a payment method
 */
export const deletePaymentMethod = async (paymentMethodId: string): Promise<void> => {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', paymentMethodId);
  
  if (error) handleError(error, 'Erreur lors de la suppression du moyen de paiement');
};

// ==================== NOTIFICATIONS ====================

/**
 * Get all notifications for a user
 */
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) handleError(error, 'Erreur lors de la récupération des notifications');
  return data as Notification[];
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single();
  
  if (error) handleError(error, 'Erreur lors de la mise à jour de la notification');
  return data as Notification;
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  
  if (error) handleError(error, 'Erreur lors de la mise à jour des notifications');
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
  
  if (error) handleError(error, 'Erreur lors de la suppression de la notification');
};

// ==================== TRANSACTIONS ====================

/**
 * Get all transactions for a user
 */
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) handleError(error, 'Erreur lors de la récupération des transactions');
  return data as Transaction[];
};

/**
 * Create a new transaction
 */
export const createTransaction = async (
  transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      ...transaction,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) handleError(error, 'Erreur lors de la création de la transaction');
  return data as Transaction;
};

/**
 * Update a transaction's status
 */
export const updateTransactionStatus = async (
  transactionId: string, 
  status: Transaction['status']
): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', transactionId)
    .select()
    .single();
  
  if (error) handleError(error, 'Erreur lors de la mise à jour de la transaction');
  return data as Transaction;
};

// ==================== USER PROFILE ====================

/**
 * Update a user's profile
 */
export const updateUserProfile = async (
  userId: string, 
  updates: { 
    full_name?: string; 
    avatar_url?: string;
    phone_number?: string;
    preferred_language?: string;
    notification_preferences?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    }
  }
): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) handleError(error, 'Erreur lors de la mise à jour du profil');
  return data as User;
};

/**
 * Get a user's profile
 */
export const getUserProfile = async (userId: string): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) handleError(error, 'Erreur lors de la récupération du profil');
  return data as User;
};

// Export all functions as a service object
const tontineService = {
  // Groups
  createTontineGroup,
  getUserGroups,
  getGroupDetails,
  updateTontineGroup,
  deleteTontineGroup,
  
  // Members
  addMemberToGroup,
  getGroupMembers,
  updateGroupMember,
  removeMemberFromGroup,
  inviteUserToGroup,
  
  // Contributions
  recordContribution,
  getUserContributions,
  getGroupContributions,
  updateContribution,
  deleteContribution,
  
  // Payouts
  schedulePayout,
  getUserPayouts,
  getGroupPayouts,
  updatePayout,
  
  // Payment Methods
  addPaymentMethod,
  getUserPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod,
  
  // Notifications
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  
  // Transactions
  getUserTransactions,
  createTransaction,
  updateTransactionStatus,
  
  // User Profile
  updateUserProfile,
  getUserProfile
};

export default tontineService;