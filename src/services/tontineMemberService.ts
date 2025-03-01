/**
 * Service for managing tontine members operations
 */
import { supabase } from '@/utils/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { TontineMember, CreateTontineMemberInput, UpdateTontineMemberInput } from '@/types/database';

// Error handling
export class TontineMemberServiceError extends Error {
  code?: string;
  details?: any;

  constructor(message: string, code?: string, details?: any) {
    super(message);
    this.name = 'TontineMemberServiceError';
    this.code = code;
    this.details = details;
  }
}

// Helper function to handle Supabase errors
const handleError = (error: PostgrestError | null, customMessage: string): never => {
  throw new TontineMemberServiceError(
    customMessage || error?.message || 'An error occurred',
    error?.code,
    error?.details
  );
};

/**
 * Get all members of a tontine group
 */
export const getTontineMembers = async (tontineGroupId: string): Promise<(TontineMember & { profile?: any })[]> => {
  const { data, error } = await supabase
    .from('tontine_members')
    .select(`
      *,
      profiles:user_id(id, full_name, avatar_url, email)
    `)
    .eq('tontine_group_id', tontineGroupId);
  
  if (error) handleError(error, 'Error retrieving tontine members');
  return data as (TontineMember & { profile?: any })[];
};

/**
 * Get a specific tontine member
 */
export const getTontineMember = async (memberId: number): Promise<TontineMember> => {
  const { data, error } = await supabase
    .from('tontine_members')
    .select('*')
    .eq('id', memberId)
    .single();
  
  if (error) handleError(error, 'Error retrieving tontine member');
  return data as TontineMember;
};

/**
 * Get all tontine groups for a user
 */
export const getUserTontineGroups = async (userId: string): Promise<(TontineMember & { tontine_group?: any })[]> => {
  const { data, error } = await supabase
    .from('tontine_members')
    .select(`
      *,
      tontine_groups:tontine_group_id(*)
    `)
    .eq('user_id', userId);
  
  if (error) handleError(error, 'Error retrieving user tontine groups');
  return data as (TontineMember & { tontine_group?: any })[];
};

/**
 * Add a member to a tontine group
 */
export const addTontineMember = async (
  memberData: CreateTontineMemberInput
): Promise<TontineMember> => {
  const { data, error } = await supabase
    .from('tontine_members')
    .insert(memberData)
    .select()
    .single();
  
  if (error) handleError(error, 'Error adding tontine member');
  return data as TontineMember;
};

/**
 * Update a tontine member
 */
export const updateTontineMember = async (
  memberId: number,
  updates: Omit<UpdateTontineMemberInput, 'id'>
): Promise<TontineMember> => {
  const { data, error } = await supabase
    .from('tontine_members')
    .update(updates)
    .eq('id', memberId)
    .select()
    .single();
  
  if (error) handleError(error, 'Error updating tontine member');
  return data as TontineMember;
};

/**
 * Remove a member from a tontine group
 * This sets the status to 'inactive' rather than deleting the record
 */
export const removeTontineMember = async (memberId: number): Promise<TontineMember> => {
  const { data, error } = await supabase
    .from('tontine_members')
    .update({ status: 'inactive' })
    .eq('id', memberId)
    .select()
    .single();
  
  if (error) handleError(error, 'Error removing tontine member');
  return data as TontineMember;
};

/**
 * Delete a tontine member record
 * Use with caution - this permanently removes the record
 */
export const deleteTontineMember = async (memberId: number): Promise<void> => {
  const { error } = await supabase
    .from('tontine_members')
    .delete()
    .eq('id', memberId);
  
  if (error) handleError(error, 'Error deleting tontine member');
};

/**
 * Update a member's payout position
 */
export const updatePayoutPosition = async (
  memberId: number,
  payoutPosition: number
): Promise<TontineMember> => {
  const { data, error } = await supabase
    .from('tontine_members')
    .update({ payout_position: payoutPosition })
    .eq('id', memberId)
    .select()
    .single();
  
  if (error) handleError(error, 'Error updating payout position');
  return data as TontineMember;
};

/**
 * Mark a member as having received their payout
 */
export const markPayoutReceived = async (memberId: number): Promise<TontineMember> => {
  const { data, error } = await supabase
    .from('tontine_members')
    .update({ payout_received: true })
    .eq('id', memberId)
    .select()
    .single();
  
  if (error) handleError(error, 'Error marking payout as received');
  return data as TontineMember;
};

/**
 * Update a member's reliability score
 */
export const updateReliabilityScore = async (
  memberId: number,
  reliabilityScore: number
): Promise<TontineMember> => {
  const { data, error } = await supabase
    .from('tontine_members')
    .update({ reliability_score: reliabilityScore })
    .eq('id', memberId)
    .select()
    .single();
  
  if (error) handleError(error, 'Error updating reliability score');
  return data as TontineMember;
};

/**
 * Invite a user to join a tontine group
 */
export const inviteUserToTontine = async (
  tontineGroupId: string,
  userId: string,
  invitedBy: string
): Promise<TontineMember> => {
  const memberData: CreateTontineMemberInput = {
    tontine_group_id: tontineGroupId,
    user_id: userId,
    status: 'pending',
    role: 'member',
    invited_by: invitedBy
  };
  
  return addTontineMember(memberData);
};

/**
 * Accept an invitation to join a tontine group
 */
export const acceptTontineInvitation = async (memberId: number): Promise<TontineMember> => {
  const { data, error } = await supabase
    .from('tontine_members')
    .update({ status: 'active' })
    .eq('id', memberId)
    .eq('status', 'pending')
    .select()
    .single();
  
  if (error) handleError(error, 'Error accepting tontine invitation');
  return data as TontineMember;
};

/**
 * Decline an invitation to join a tontine group
 */
export const declineTontineInvitation = async (memberId: number): Promise<TontineMember> => {
  const { data, error } = await supabase
    .from('tontine_members')
    .update({ status: 'inactive' })
    .eq('id', memberId)
    .eq('status', 'pending')
    .select()
    .single();
  
  if (error) handleError(error, 'Error declining tontine invitation');
  return data as TontineMember;
};

/**
 * Promote a member to admin role
 */
export const promoteMemberToAdmin = async (memberId: number): Promise<TontineMember> => {
  const { data, error } = await supabase
    .from('tontine_members')
    .update({ role: 'admin' })
    .eq('id', memberId)
    .select()
    .single();
  
  if (error) handleError(error, 'Error promoting member to admin');
  return data as TontineMember;
};

/**
 * Demote an admin to member role
 */
export const demoteAdminToMember = async (memberId: number): Promise<TontineMember> => {
  const { data, error } = await supabase
    .from('tontine_members')
    .update({ role: 'member' })
    .eq('id', memberId)
    .select()
    .single();
  
  if (error) handleError(error, 'Error demoting admin to member');
  return data as TontineMember;
};

// Export all functions as a service object
const tontineMemberService = {
  getTontineMembers,
  getTontineMember,
  getUserTontineGroups,
  addTontineMember,
  updateTontineMember,
  removeTontineMember,
  deleteTontineMember,
  updatePayoutPosition,
  markPayoutReceived,
  updateReliabilityScore,
  inviteUserToTontine,
  acceptTontineInvitation,
  declineTontineInvitation,
  promoteMemberToAdmin,
  demoteAdminToMember
};

export default tontineMemberService;