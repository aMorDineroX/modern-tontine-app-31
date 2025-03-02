-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security on all tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tontine_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.payment_methods CASCADE;
DROP TABLE IF EXISTS public.payouts CASCADE;
DROP TABLE IF EXISTS public.contributions CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
DROP TABLE IF EXISTS public.tontine_groups CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone_number TEXT,
    preferred_language TEXT DEFAULT 'fr',
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Tontine Groups Table
CREATE TABLE public.tontine_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    contribution_amount NUMERIC(15, 2) NOT NULL,
    currency TEXT DEFAULT 'XAF',
    frequency TEXT CHECK (frequency IN ('weekly', 'biweekly', 'monthly')) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    payout_method TEXT CHECK (payout_method IN ('rotation', 'random', 'bidding')) NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('active', 'completed', 'cancelled', 'pending')) DEFAULT 'pending',
    max_members INTEGER,
    current_round INTEGER DEFAULT 0,
    total_rounds INTEGER,
    rules JSONB
);

-- Group Members Table
CREATE TABLE public.group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.tontine_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    status TEXT CHECK (status IN ('active', 'pending', 'inactive', 'removed')) DEFAULT 'pending',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    payout_position INTEGER,
    payout_received BOOLEAN DEFAULT FALSE,
    total_contributions NUMERIC(15, 2) DEFAULT 0,
    last_contribution_date DATE,
    invitation_email TEXT,
    invitation_status TEXT CHECK (invitation_status IN ('sent', 'accepted', 'declined')),
    UNIQUE(group_id, user_id)
);

-- Contributions Table
CREATE TABLE public.contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.tontine_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'paid', 'missed', 'late')) DEFAULT 'pending',
    payment_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    payment_method TEXT,
    transaction_id TEXT,
    round_number INTEGER,
    late_fee_amount NUMERIC(15, 2),
    notes TEXT,
    receipt_url TEXT,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verification_date TIMESTAMPTZ
);

-- Payouts Table
CREATE TABLE public.payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.tontine_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    payout_date DATE NOT NULL,
    status TEXT CHECK (status IN ('scheduled', 'paid', 'pending', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    payment_method TEXT,
    transaction_id TEXT,
    round_number INTEGER NOT NULL,
    bid_amount NUMERIC(15, 2),
    notes TEXT,
    receipt_url TEXT,
    processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    processing_date TIMESTAMPTZ
);

-- Payment Methods Table
CREATE TABLE public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('bank_account', 'mobile_money', 'card', 'other')) NOT NULL,
    details JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Notifications Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (
        type IN (
            'payment_due', 
            'payment_received', 
            'payout_scheduled', 
            'payout_sent', 
            'group_invitation', 
            'system'
        )
    ) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    related_entity JSONB
);

-- Transactions Table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    currency TEXT DEFAULT 'XAF',
    type TEXT CHECK (
        type IN (
            'contribution', 
            'payout', 
            'fee', 
            'refund'
        )
    ) NOT NULL,
    status TEXT CHECK (
        status IN (
            'pending', 
            'completed', 
            'failed', 
            'cancelled'
        )
    ) DEFAULT 'pending',
    payment_method TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    related_entity JSONB,
    metadata JSONB
);

-- Create function to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_tontine_groups_modtime
    BEFORE UPDATE ON public.tontine_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_contributions_modtime
    BEFORE UPDATE ON public.contributions
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_payouts_modtime
    BEFORE UPDATE ON public.payouts
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_payment_methods_modtime
    BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_transactions_modtime
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Function to create a new profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, created_at)
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'full_name', 
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create a profile when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update group member total contributions
CREATE OR REPLACE FUNCTION update_member_contributions()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the total contributions for the member
    UPDATE public.group_members
    SET 
        total_contributions = (
            SELECT COALESCE(SUM(amount), 0)
            FROM public.contributions
            WHERE 
                group_id = NEW.group_id AND 
                user_id = NEW.user_id AND
                status = 'paid'
        ),
        last_contribution_date = NEW.payment_date
    WHERE 
        group_id = NEW.group_id AND 
        user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update member contributions when a contribution is added or updated
CREATE TRIGGER update_member_contributions_trigger
    AFTER INSERT OR UPDATE ON public.contributions
    FOR EACH ROW
    WHEN (NEW.status = 'paid')
    EXECUTE FUNCTION update_member_contributions();

-- Function to create a notification when a contribution is due
CREATE OR REPLACE FUNCTION create_contribution_due_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a notification for the user
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        related_entity
    )
    VALUES (
        NEW.user_id,
        'Contribution Due',
        'Your contribution of ' || NEW.amount || ' is due on ' || NEW.payment_date,
        'payment_due',
        jsonb_build_object(
            'contribution_id', NEW.id,
            'group_id', NEW.group_id,
            'amount', NEW.amount,
            'due_date', NEW.payment_date
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create a notification when a contribution is created
CREATE TRIGGER create_contribution_notification_trigger
    AFTER INSERT ON public.contributions
    FOR EACH ROW
    EXECUTE FUNCTION create_contribution_due_notification();

-- Function to create a notification when a payout is scheduled
CREATE OR REPLACE FUNCTION create_payout_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a notification for the user
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        related_entity
    )
    VALUES (
        NEW.user_id,
        'Payout Scheduled',
        'Your payout of ' || NEW.amount || ' is scheduled for ' || NEW.payout_date,
        'payout_scheduled',
        jsonb_build_object(
            'payout_id', NEW.id,
            'group_id', NEW.group_id,
            'amount', NEW.amount,
            'payout_date', NEW.payout_date
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create a notification when a payout is created
CREATE TRIGGER create_payout_notification_trigger
    AFTER INSERT ON public.payouts
    FOR EACH ROW
    EXECUTE FUNCTION create_payout_notification();

-- Function to update group status based on rounds
CREATE OR REPLACE FUNCTION update_group_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If current_round equals total_rounds, mark the group as completed
    IF NEW.current_round = NEW.total_rounds AND NEW.status = 'active' THEN
        NEW.status := 'completed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update group status when current_round is updated
CREATE TRIGGER update_group_status_trigger
    BEFORE UPDATE ON public.tontine_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_group_status();

-- RLS Policies for Profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can view profiles of members in their groups" 
ON public.profiles FOR SELECT 
USING (
    EXISTS (
        SELECT 1 
        FROM public.group_members gm1
        JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
        WHERE gm1.user_id = auth.uid() AND gm2.user_id = profiles.id
    )
);

-- RLS Policies for Tontine Groups
CREATE POLICY "Users can create tontine groups" 
ON public.tontine_groups FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view groups they are members of" 
ON public.tontine_groups FOR SELECT 
USING (
    EXISTS (
        SELECT 1 
        FROM public.group_members gm 
        WHERE gm.group_id = tontine_groups.id 
        AND gm.user_id = auth.uid()
    )
);

CREATE POLICY "Group admins can update their groups" 
ON public.tontine_groups FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 
        FROM public.group_members gm 
        WHERE gm.group_id = tontine_groups.id 
        AND gm.user_id = auth.uid() 
        AND gm.role = 'admin'
    )
);

CREATE POLICY "Group admins can delete their groups" 
ON public.tontine_groups FOR DELETE 
USING (
    EXISTS (
        SELECT 1 
        FROM public.group_members gm 
        WHERE gm.group_id = tontine_groups.id 
        AND gm.user_id = auth.uid() 
        AND gm.role = 'admin'
    )
);

-- RLS Policies for Group Members
CREATE POLICY "Group admins can manage members" 
ON public.group_members FOR ALL 
USING (
    EXISTS (
        SELECT 1 
        FROM public.group_members gm 
        WHERE gm.group_id = group_members.group_id 
        AND gm.user_id = auth.uid() 
        AND gm.role = 'admin'
    )
);

CREATE POLICY "Users can view members in their groups" 
ON public.group_members FOR SELECT 
USING (
    EXISTS (
        SELECT 1 
        FROM public.group_members gm 
        WHERE gm.group_id = group_members.group_id 
        AND gm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own membership" 
ON public.group_members FOR UPDATE 
USING (
    group_members.user_id = auth.uid()
);

-- RLS Policies for Contributions
CREATE POLICY "Users can view contributions in their groups" 
ON public.contributions FOR SELECT 
USING (
    EXISTS (
        SELECT 1 
        FROM public.group_members gm 
        WHERE gm.group_id = contributions.group_id 
        AND gm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create their own contributions" 
ON public.contributions FOR INSERT 
WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 
        FROM public.group_members gm 
        WHERE gm.group_id = contributions.group_id 
        AND gm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own contributions" 
ON public.contributions FOR UPDATE 
USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 
        FROM public.group_members gm 
        WHERE gm.group_id = contributions.group_id 
        AND gm.user_id = auth.uid() 
        AND gm.role = 'admin'
    )
);

-- RLS Policies for Payouts
CREATE POLICY "Users can view payouts in their groups" 
ON public.payouts FOR SELECT 
USING (
    EXISTS (
        SELECT 1 
        FROM public.group_members gm 
        WHERE gm.group_id = payouts.group_id 
        AND gm.user_id = auth.uid()
    )
);

CREATE POLICY "Group admins can create payouts" 
ON public.payouts FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM public.group_members gm 
        WHERE gm.group_id = payouts.group_id 
        AND gm.user_id = auth.uid() 
        AND gm.role = 'admin'
    )
);

CREATE POLICY "Group admins can update payouts" 
ON public.payouts FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 
        FROM public.group_members gm 
        WHERE gm.group_id = payouts.group_id 
        AND gm.user_id = auth.uid() 
        AND gm.role = 'admin'
    )
);

-- RLS Policies for Payment Methods
CREATE POLICY "Users can manage their own payment methods" 
ON public.payment_methods FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for Notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for Transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Group admins can view transactions in their groups" 
ON public.transactions FOR SELECT 
USING (
    EXISTS (
        SELECT 1 
        FROM public.group_members gm 
        JOIN jsonb_array_elements_text(transactions.related_entity->'group_ids') AS group_id_text ON TRUE
        WHERE gm.group_id::text = group_id_text 
        AND gm.user_id = auth.uid() 
        AND gm.role = 'admin'
    )
);

-- Create indexes for better performance
CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX idx_contributions_group_id ON public.contributions(group_id);
CREATE INDEX idx_contributions_user_id ON public.contributions(user_id);
CREATE INDEX idx_contributions_payment_date ON public.contributions(payment_date);
CREATE INDEX idx_payouts_group_id ON public.payouts(group_id);
CREATE INDEX idx_payouts_user_id ON public.payouts(user_id);
CREATE INDEX idx_payouts_payout_date ON public.payouts(payout_date);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);

-- Create views for common queries
CREATE OR REPLACE VIEW public.active_groups AS
SELECT tg.*, COUNT(gm.id) as member_count
FROM public.tontine_groups tg
JOIN public.group_members gm ON tg.id = gm.group_id
WHERE tg.status = 'active' AND gm.status = 'active'
GROUP BY tg.id;

CREATE OR REPLACE VIEW public.upcoming_contributions AS
SELECT c.*, tg.name as group_name
FROM public.contributions c
JOIN public.tontine_groups tg ON c.group_id = tg.id
WHERE c.status = 'pending' AND c.payment_date >= CURRENT_DATE
ORDER BY c.payment_date;

CREATE OR REPLACE VIEW public.upcoming_payouts AS
SELECT p.*, tg.name as group_name
FROM public.payouts p
JOIN public.tontine_groups tg ON p.group_id = tg.id
WHERE p.status IN ('scheduled', 'pending') AND p.payout_date >= CURRENT_DATE
ORDER BY p.payout_date;

-- Create function to get user's tontine summary
CREATE OR REPLACE FUNCTION get_user_tontine_summary(user_uuid UUID)
RETURNS TABLE (
    active_groups BIGINT,
    total_contributed NUMERIC,
    pending_contributions BIGINT,
    upcoming_payouts BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM public.group_members WHERE user_id = user_uuid AND status = 'active'),
        (SELECT COALESCE(SUM(amount), 0) FROM public.contributions WHERE user_id = user_uuid AND status = 'paid'),
        (SELECT COUNT(*) FROM public.contributions WHERE user_id = user_uuid AND status = 'pending' AND payment_date >= CURRENT_DATE),
        (SELECT COUNT(*) FROM public.payouts WHERE user_id = user_uuid AND status IN ('scheduled', 'pending') AND payout_date >= CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate next payout date for a group
CREATE OR REPLACE FUNCTION calculate_next_payout_date(group_uuid UUID)
RETURNS DATE AS $$
DECLARE
    group_frequency TEXT;
    last_payout_date DATE;
    next_date DATE;
BEGIN
    -- Get the group frequency
    SELECT frequency INTO group_frequency
    FROM public.tontine_groups
    WHERE id = group_uuid;
    
    -- Get the last payout date
    SELECT MAX(payout_date) INTO last_payout_date
    FROM public.payouts
    WHERE group_id = group_uuid;
    
    -- If no previous payout, use the group start date
    IF last_payout_date IS NULL THEN
        SELECT start_date INTO next_date
        FROM public.tontine_groups
        WHERE id = group_uuid;
    ELSE
        -- Calculate next date based on frequency
        CASE group_frequency
            WHEN 'weekly' THEN
                next_date := last_payout_date + INTERVAL '1 week';
            WHEN 'biweekly' THEN
                next_date := last_payout_date + INTERVAL '2 weeks';
            WHEN 'monthly' THEN
                next_date := last_payout_date + INTERVAL '1 month';
            ELSE
                next_date := last_payout_date + INTERVAL '1 month';
        END CASE;
    END IF;
    
    RETURN next_date;
END;
$$ LANGUAGE plpgsql;