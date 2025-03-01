/**
 * TypeScript interfaces for database models
 */

/**
 * Interface for the tontine_members table
 */
export interface TontineMember {
  id: number;
  created_at: Date;
  tontine_group_id: string; // UUID
  user_id: string; // UUID
  status: 'active' | 'inactive' | 'pending' | string;
  role: 'member' | 'admin' | 'owner' | string;
  payout_position: number | null;
  payout_received: boolean;
  reliability_score: number;
  invited_by: string | null; // UUID
}

/**
 * Interface for creating a new tontine member
 * Omits auto-generated fields and includes fields with defaults as optional
 */
export type CreateTontineMemberInput = Omit<TontineMember, 'id' | 'created_at'> & {
  status?: TontineMember['status'];
  role?: TontineMember['role'];
  payout_received?: TontineMember['payout_received'];
  reliability_score?: TontineMember['reliability_score'];
};

/**
 * Interface for updating an existing tontine member
 * Makes all fields optional except the ID
 */
export type UpdateTontineMemberInput = Partial<Omit<TontineMember, 'id' | 'created_at'>> & {
  id: number;
};