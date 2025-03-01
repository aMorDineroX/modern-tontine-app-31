-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tontine_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
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
    created_by UUID REFERENCES public.profiles(id),
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
    verified_by UUID REFERENCES public.profiles(id),
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
    processed_by UUID REFERENCES public.profiles(id),
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

-- Triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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

-- RLS Policies for Profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

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

-- RLS Policies for Payment Methods
CREATE POLICY "Users can manage their own payment methods" 
ON public.payment_methods FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for Notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for Transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

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
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();