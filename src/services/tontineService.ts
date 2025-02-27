
import { supabase, TontineGroup, GroupMember, Contribution, Payout } from '@/utils/supabase';

// Groups
export const createTontineGroup = async (group: Omit<TontineGroup, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('tontine_groups')
    .insert(group)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getUserGroups = async (userId: string) => {
  const { data, error } = await supabase
    .from('tontine_groups')
    .select(`
      *,
      group_members!inner(*)
    `)
    .eq('group_members.user_id', userId);
  
  if (error) throw error;
  return data;
};

export const getGroupDetails = async (groupId: string) => {
  const { data, error } = await supabase
    .from('tontine_groups')
    .select('*')
    .eq('id', groupId)
    .single();
  
  if (error) throw error;
  return data;
};

// Members
export const addMemberToGroup = async (member: Omit<GroupMember, 'id' | 'joined_at'>) => {
  const { data, error } = await supabase
    .from('group_members')
    .insert(member)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getGroupMembers = async (groupId: string) => {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      *,
      profiles:user_id(full_name, avatar_url)
    `)
    .eq('group_id', groupId);
  
  if (error) throw error;
  return data;
};

export const updateMemberStatus = async (memberId: string, status: GroupMember['status']) => {
  const { data, error } = await supabase
    .from('group_members')
    .update({ status })
    .eq('id', memberId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Contributions
export const recordContribution = async (contribution: Omit<Contribution, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('contributions')
    .insert(contribution)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getUserContributions = async (userId: string, groupId?: string) => {
  let query = supabase
    .from('contributions')
    .select('*')
    .eq('user_id', userId);
  
  if (groupId) {
    query = query.eq('group_id', groupId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

export const updateContributionStatus = async (contributionId: string, status: Contribution['status']) => {
  const { data, error } = await supabase
    .from('contributions')
    .update({ status })
    .eq('id', contributionId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Payouts
export const schedulePayout = async (payout: Omit<Payout, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('payouts')
    .insert(payout)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getUserPayouts = async (userId: string) => {
  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
};

export const getGroupPayouts = async (groupId: string) => {
  const { data, error } = await supabase
    .from('payouts')
    .select(`
      *,
      profiles:user_id(full_name, avatar_url)
    `)
    .eq('group_id', groupId);
  
  if (error) throw error;
  return data;
};

export const updatePayoutStatus = async (payoutId: string, status: Payout['status']) => {
  const { data, error } = await supabase
    .from('payouts')
    .update({ status })
    .eq('id', payoutId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// User profile
export const updateUserProfile = async (userId: string, updates: { full_name?: string, avatar_url?: string }) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};
