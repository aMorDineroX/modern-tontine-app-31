
import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = 'https://yxflkqatirvzlruaxabj.supabase.co';
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZmxrcWF0aXJ2emxydWF4YWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NzcxMzYsImV4cCI6MjA1NjE1MzEzNn0.xCDfs19OSt-Ijo_aahpcDfQKQR6HbQJgL3jFB7ygNrY';

// export const supabase = createClient(supabaseUrl, supabaseKey);

// Define database types based on our schema
export type User = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
};

export type TontineGroup = {
  id: string;
  name: string;
  contribution_amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  start_date: string;
  payout_method: 'rotation' | 'random' | 'bidding';
  created_by: string;
  created_at: string;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  status: 'active' | 'pending' | 'inactive';
  joined_at: string;
};

export type Contribution = {
  id: string;
  group_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'missed';
  payment_date: string;
  created_at: string;
};

export type Payout = {
  id: string;
  group_id: string;
  user_id: string;
  amount: number;
  payout_date: string;
  status: 'scheduled' | 'paid' | 'pending';
  created_at: string;
};
