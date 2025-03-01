import React, { useState } from 'react';
import { useTontineMembers } from '@/hooks/useTontineMembers';
import { TontineMember } from '@/types/database';

interface TontineMembersProps {
  tontineGroupId: string;
}

export function TontineMembers({ tontineGroupId }: TontineMembersProps) {
  const {
    members,
    loading,
    error,
    updateMember,
    removeMember,
    updatePayoutPosition,
    markPayoutReceived,
    updateReliabilityScore,
  } = useTontineMembers({ tontineGroupId });

  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [payoutPosition, setPayoutPosition] = useState<number>(0);
  const [reliabilityScore, setReliabilityScore] = useState<number>(1);

  if (loading) {
    return <div className="p-4">Loading members...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading members: {error.message}</div>;
  }

  if (!members || members.length === 0) {
    return <div className="p-4">No members found for this tontine group.</div>;
  }

  const handleUpdatePayoutPosition = async (memberId: number) => {
    try {
      await updatePayoutPosition(memberId, payoutPosition);
      setEditingMemberId(null);
    } catch (err) {
      console.error('Failed to update payout position:', err);
    }
  };

  const handleUpdateReliabilityScore = async (memberId: number) => {
    try {
      await updateReliabilityScore(memberId, reliabilityScore);
      setEditingMemberId(null);
    } catch (err) {
      console.error('Failed to update reliability score:', err);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMember(memberId);
      } catch (err) {
        console.error('Failed to remove member:', err);
      }
    }
  };

  const handleMarkPayoutReceived = async (memberId: number) => {
    try {
      await markPayoutReceived(memberId);
    } catch (err) {
      console.error('Failed to mark payout as received:', err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Tontine Members</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">User</th>
              <th className="py-2 px-4 border-b text-left">Role</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
              <th className="py-2 px-4 border-b text-left">Payout Position</th>
              <th className="py-2 px-4 border-b text-left">Payout Received</th>
              <th className="py-2 px-4 border-b text-left">Reliability Score</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">
                  {member.profile ? (
                    <div className="flex items-center">
                      {member.profile.avatar_url && (
                        <img 
                          src={member.profile.avatar_url} 
                          alt={member.profile.full_name || 'User'} 
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      )}
                      <div>
                        <div>{member.profile.full_name || 'Unnamed User'}</div>
                        <div className="text-xs text-gray-500">{member.profile.email}</div>
                      </div>
                    </div>
                  ) : (
                    <span>User ID: {member.user_id}</span>
                  )}
                </td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    member.status === 'active' ? 'bg-green-100 text-green-800' : 
                    member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="py-2 px-4">
                  {editingMemberId === member.id ? (
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={payoutPosition}
                        onChange={(e) => setPayoutPosition(parseInt(e.target.value))}
                        className="w-16 border rounded p-1 mr-2"
                        min="1"
                      />
                      <button
                        onClick={() => handleUpdatePayoutPosition(member.id)}
                        className="text-green-600 hover:text-green-800 mr-1"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingMemberId(null)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {member.payout_position || 'Not set'}
                      <button
                        onClick={() => {
                          setEditingMemberId(member.id);
                          setPayoutPosition(member.payout_position || 0);
                        }}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center">
                    <span className={member.payout_received ? 'text-green-600' : 'text-red-600'}>
                      {member.payout_received ? 'Yes' : 'No'}
                    </span>
                    {!member.payout_received && (
                      <button
                        onClick={() => handleMarkPayoutReceived(member.id)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        Mark Received
                      </button>
                    )}
                  </div>
                </td>
                <td className="py-2 px-4">
                  {editingMemberId === member.id ? (
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={reliabilityScore}
                        onChange={(e) => setReliabilityScore(parseFloat(e.target.value))}
                        className="w-16 border rounded p-1 mr-2"
                        min="0"
                        max="5"
                        step="0.1"
                      />
                      <button
                        onClick={() => handleUpdateReliabilityScore(member.id)}
                        className="text-green-600 hover:text-green-800 mr-1"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingMemberId(null)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {member.reliability_score}
                      <button
                        onClick={() => {
                          setEditingMemberId(member.id);
                          setReliabilityScore(member.reliability_score);
                        }}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </td>
                <td className="py-2 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TontineMembers;