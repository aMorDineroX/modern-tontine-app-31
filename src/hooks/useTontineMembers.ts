import { useState, useEffect, useCallback } from 'react';
import tontineMemberService from '@/services/tontineMemberService';
import { TontineMember, CreateTontineMemberInput, UpdateTontineMemberInput } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface UseTontineMembersProps {
  tontineGroupId?: string;
  userId?: string;
  initialMembers?: TontineMember[];
}

export function useTontineMembers({
  tontineGroupId,
  userId,
  initialMembers = [],
}: UseTontineMembersProps = {}) {
  const [members, setMembers] = useState<TontineMember[]>(initialMembers);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Fetch members for a specific tontine group
  const fetchMembers = useCallback(async (groupId: string) => {
    if (!groupId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await tontineMemberService.getTontineMembers(groupId);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tontine members'));
      toast({
        title: 'Error',
        description: 'Failed to load tontine members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch tontine groups for a specific user
  const fetchUserGroups = useCallback(async (uid: string) => {
    if (!uid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await tontineMemberService.getUserTontineGroups(uid);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user tontine groups'));
      toast({
        title: 'Error',
        description: 'Failed to load user tontine groups',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Add a new member
  const addMember = useCallback(async (memberData: CreateTontineMemberInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const newMember = await tontineMemberService.addTontineMember(memberData);
      setMembers(prev => [...prev, newMember]);
      toast({
        title: 'Success',
        description: 'Member added successfully',
      });
      return newMember;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add member'));
      toast({
        title: 'Error',
        description: 'Failed to add member',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update a member
  const updateMember = useCallback(async (memberId: number, updates: Omit<UpdateTontineMemberInput, 'id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedMember = await tontineMemberService.updateTontineMember(memberId, updates);
      setMembers(prev => prev.map(member => 
        member.id === memberId ? updatedMember : member
      ));
      toast({
        title: 'Success',
        description: 'Member updated successfully',
      });
      return updatedMember;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update member'));
      toast({
        title: 'Error',
        description: 'Failed to update member',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Remove a member (set status to inactive)
  const removeMember = useCallback(async (memberId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const removedMember = await tontineMemberService.removeTontineMember(memberId);
      setMembers(prev => prev.map(member => 
        member.id === memberId ? removedMember : member
      ));
      toast({
        title: 'Success',
        description: 'Member removed successfully',
      });
      return removedMember;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove member'));
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Delete a member permanently
  const deleteMember = useCallback(async (memberId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await tontineMemberService.deleteTontineMember(memberId);
      setMembers(prev => prev.filter(member => member.id !== memberId));
      toast({
        title: 'Success',
        description: 'Member deleted successfully',
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete member'));
      toast({
        title: 'Error',
        description: 'Failed to delete member',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Invite a user to join a tontine group
  const inviteUser = useCallback(async (tontineGroupId: string, userId: string, invitedBy: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const newMember = await tontineMemberService.inviteUserToTontine(tontineGroupId, userId, invitedBy);
      setMembers(prev => [...prev, newMember]);
      toast({
        title: 'Success',
        description: 'Invitation sent successfully',
      });
      return newMember;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send invitation'));
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Accept an invitation
  const acceptInvitation = useCallback(async (memberId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedMember = await tontineMemberService.acceptTontineInvitation(memberId);
      setMembers(prev => prev.map(member => 
        member.id === memberId ? updatedMember : member
      ));
      toast({
        title: 'Success',
        description: 'Invitation accepted successfully',
      });
      return updatedMember;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to accept invitation'));
      toast({
        title: 'Error',
        description: 'Failed to accept invitation',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Decline an invitation
  const declineInvitation = useCallback(async (memberId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedMember = await tontineMemberService.declineTontineInvitation(memberId);
      setMembers(prev => prev.map(member => 
        member.id === memberId ? updatedMember : member
      ));
      toast({
        title: 'Success',
        description: 'Invitation declined',
      });
      return updatedMember;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to decline invitation'));
      toast({
        title: 'Error',
        description: 'Failed to decline invitation',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update a member's payout position
  const updatePayoutPosition = useCallback(async (memberId: number, position: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedMember = await tontineMemberService.updatePayoutPosition(memberId, position);
      setMembers(prev => prev.map(member => 
        member.id === memberId ? updatedMember : member
      ));
      toast({
        title: 'Success',
        description: 'Payout position updated',
      });
      return updatedMember;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update payout position'));
      toast({
        title: 'Error',
        description: 'Failed to update payout position',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Mark a member as having received their payout
  const markPayoutReceived = useCallback(async (memberId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedMember = await tontineMemberService.markPayoutReceived(memberId);
      setMembers(prev => prev.map(member => 
        member.id === memberId ? updatedMember : member
      ));
      toast({
        title: 'Success',
        description: 'Payout marked as received',
      });
      return updatedMember;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark payout as received'));
      toast({
        title: 'Error',
        description: 'Failed to mark payout as received',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update a member's reliability score
  const updateReliabilityScore = useCallback(async (memberId: number, score: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedMember = await tontineMemberService.updateReliabilityScore(memberId, score);
      setMembers(prev => prev.map(member => 
        member.id === memberId ? updatedMember : member
      ));
      toast({
        title: 'Success',
        description: 'Reliability score updated',
      });
      return updatedMember;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update reliability score'));
      toast({
        title: 'Error',
        description: 'Failed to update reliability score',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load data on component mount
  useEffect(() => {
    if (tontineGroupId) {
      fetchMembers(tontineGroupId);
    } else if (userId) {
      fetchUserGroups(userId);
    }
  }, [tontineGroupId, userId, fetchMembers, fetchUserGroups]);

  return {
    members,
    loading,
    error,
    fetchMembers,
    fetchUserGroups,
    addMember,
    updateMember,
    removeMember,
    deleteMember,
    inviteUser,
    acceptInvitation,
    declineInvitation,
    updatePayoutPosition,
    markPayoutReceived,
    updateReliabilityScore,
  };
}