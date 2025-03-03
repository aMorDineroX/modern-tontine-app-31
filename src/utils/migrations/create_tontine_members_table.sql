-- Create tontine_members table
CREATE TABLE IF NOT EXISTS public.tontine_members (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    tontine_group_id UUID NOT NULL REFERENCES public.tontine_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active'::text,
    role TEXT DEFAULT 'member'::text,
    payout_position INTEGER,
    payout_received BOOLEAN DEFAULT false,
    reliability_score NUMERIC DEFAULT 1.00,
    invited_by UUID REFERENCES public.profiles(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tontine_members_tontine_group_id ON public.tontine_members(tontine_group_id);
CREATE INDEX IF NOT EXISTS idx_tontine_members_user_id ON public.tontine_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tontine_members_status ON public.tontine_members(status);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.tontine_members ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see members of groups they belong to
CREATE POLICY select_tontine_members ON public.tontine_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tontine_members AS tm
            WHERE tm.tontine_group_id = tontine_group_id
            AND tm.user_id = auth.uid()
        )
    );

-- Policy to allow users to insert themselves as members
CREATE POLICY insert_tontine_members ON public.tontine_members
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.tontine_members AS tm
            WHERE tm.tontine_group_id = tontine_group_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('admin', 'owner')
        )
    );

-- Policy to allow admins to update members
CREATE POLICY update_tontine_members ON public.tontine_members
    FOR UPDATE
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.tontine_members AS tm
            WHERE tm.tontine_group_id = tontine_group_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('admin', 'owner')
        )
    );

-- Policy to allow admins to delete members
CREATE POLICY delete_tontine_members ON public.tontine_members
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.tontine_members AS tm
            WHERE tm.tontine_group_id = tontine_group_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('admin', 'owner')
        )
    );

-- Add comment to table
COMMENT ON TABLE public.tontine_members IS 'Stores membership information for users in tontine groups';