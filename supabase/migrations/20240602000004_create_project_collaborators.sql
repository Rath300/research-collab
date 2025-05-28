-- Create ENUM types for project_collaborators table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_collaborator_role') THEN
        CREATE TYPE project_collaborator_role AS ENUM ('owner', 'editor', 'viewer');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_collaborator_status') THEN
        CREATE TYPE project_collaborator_status AS ENUM ('pending', 'active', 'declined', 'revoked');
    END IF;
END
$$;

-- Create project_collaborators table
CREATE TABLE IF NOT EXISTS public.project_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role project_collaborator_role NOT NULL DEFAULT 'viewer',
    status project_collaborator_status NOT NULL DEFAULT 'pending',
    invited_by UUID,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT fk_project
        FOREIGN KEY(project_id) 
        REFERENCES public.research_posts(id) -- Assuming 'research_posts' is the definitive project table
        ON DELETE CASCADE,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES auth.users(id) -- Assuming collaborations are with auth.users
        ON DELETE CASCADE,
    CONSTRAINT fk_invited_by
        FOREIGN KEY(invited_by) 
        REFERENCES auth.users(id)
        ON DELETE SET NULL,
    
    UNIQUE (project_id, user_id) -- A user can only have one role/status per project
);

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON public.project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON public.project_collaborators(user_id);

-- RLS Policies for project_collaborators
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own collaborations/invitations
CREATE POLICY "Users can view their own project collaborations"
ON public.project_collaborators
FOR SELECT
USING (auth.uid() = user_id);

-- Allow project owners/editors to manage collaborators (more specific policies will be needed later)
-- This is a broad starting point and will need refinement based on exact actions (invite, update role, remove)
CREATE POLICY "Project owners/editors can manage collaborators"
ON public.project_collaborators
FOR ALL -- ALL is broad, will refine to INSERT, UPDATE, DELETE with more specific conditions
USING (
    EXISTS (
        SELECT 1
        FROM public.project_collaborators pc_check
        WHERE pc_check.project_id = project_collaborators.project_id
        AND pc_check.user_id = auth.uid()
        AND (pc_check.role = 'owner' OR pc_check.role = 'editor')
    )
);

-- Allow project owners to see all collaborators on their projects
CREATE POLICY "Project owners can view all collaborators on their projects"
ON public.project_collaborators
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.research_posts rp_check -- Check against the main project table
        WHERE rp_check.id = project_collaborators.project_id
        AND rp_check.user_id = auth.uid() -- Assuming research_posts.user_id is the owner
    )
    OR -- Also allow if the current user is an owner in project_collaborators table (belt and suspenders)
    EXISTS (
        SELECT 1
        FROM public.project_collaborators pc_owner_check
        WHERE pc_owner_check.project_id = project_collaborators.project_id
        AND pc_owner_check.user_id = auth.uid()
        AND pc_owner_check.role = 'owner'
    )
);


-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_project_collaborators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_project_collaborators_updated ON public.project_collaborators;
CREATE TRIGGER on_project_collaborators_updated
BEFORE UPDATE ON public.project_collaborators
FOR EACH ROW
EXECUTE FUNCTION public.handle_project_collaborators_updated_at();

-- When a project (research_post) is created, automatically add the creator as an 'owner'
CREATE OR REPLACE FUNCTION public.handle_new_project_owner()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.project_collaborators (project_id, user_id, role, status, invited_by)
    VALUES (NEW.id, NEW.user_id, 'owner', 'active', NEW.user_id); -- project creator invites themselves as owner
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_project_created_add_owner ON public.research_posts;
CREATE TRIGGER after_project_created_add_owner
AFTER INSERT ON public.research_posts -- Assuming 'research_posts' is the main project table
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_project_owner();

COMMENT ON TABLE public.project_collaborators IS 'Manages user collaborations, roles, and invitation status for projects.';
COMMENT ON COLUMN public.project_collaborators.project_id IS 'Foreign key to the project (research_posts.id).';
COMMENT ON COLUMN public.project_collaborators.user_id IS 'Foreign key to the user (auth.users.id).';
COMMENT ON COLUMN public.project_collaborators.role IS 'Role of the user in the project (owner, editor, viewer).';
COMMENT ON COLUMN public.project_collaborators.status IS 'Status of the collaboration (pending invitation, active, declined, revoked).';
COMMENT ON COLUMN public.project_collaborators.invited_by IS 'User ID of the person who sent the invitation.'; 
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_collaborator_role') THEN
        CREATE TYPE project_collaborator_role AS ENUM ('owner', 'editor', 'viewer');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_collaborator_status') THEN
        CREATE TYPE project_collaborator_status AS ENUM ('pending', 'active', 'declined', 'revoked');
    END IF;
END
$$;

-- Create project_collaborators table
CREATE TABLE IF NOT EXISTS public.project_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role project_collaborator_role NOT NULL DEFAULT 'viewer',
    status project_collaborator_status NOT NULL DEFAULT 'pending',
    invited_by UUID,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT fk_project
        FOREIGN KEY(project_id) 
        REFERENCES public.research_posts(id) -- Assuming 'research_posts' is the definitive project table
        ON DELETE CASCADE,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES auth.users(id) -- Assuming collaborations are with auth.users
        ON DELETE CASCADE,
    CONSTRAINT fk_invited_by
        FOREIGN KEY(invited_by) 
        REFERENCES auth.users(id)
        ON DELETE SET NULL,
    
    UNIQUE (project_id, user_id) -- A user can only have one role/status per project
);

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON public.project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON public.project_collaborators(user_id);

-- RLS Policies for project_collaborators
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own collaborations/invitations
CREATE POLICY "Users can view their own project collaborations"
ON public.project_collaborators
FOR SELECT
USING (auth.uid() = user_id);

-- Allow project owners/editors to manage collaborators (more specific policies will be needed later)
-- This is a broad starting point and will need refinement based on exact actions (invite, update role, remove)
CREATE POLICY "Project owners/editors can manage collaborators"
ON public.project_collaborators
FOR ALL -- ALL is broad, will refine to INSERT, UPDATE, DELETE with more specific conditions
USING (
    EXISTS (
        SELECT 1
        FROM public.project_collaborators pc_check
        WHERE pc_check.project_id = project_collaborators.project_id
        AND pc_check.user_id = auth.uid()
        AND (pc_check.role = 'owner' OR pc_check.role = 'editor')
    )
);

-- Allow project owners to see all collaborators on their projects
CREATE POLICY "Project owners can view all collaborators on their projects"
ON public.project_collaborators
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.research_posts rp_check -- Check against the main project table
        WHERE rp_check.id = project_collaborators.project_id
        AND rp_check.user_id = auth.uid() -- Assuming research_posts.user_id is the owner
    )
    OR -- Also allow if the current user is an owner in project_collaborators table (belt and suspenders)
    EXISTS (
        SELECT 1
        FROM public.project_collaborators pc_owner_check
        WHERE pc_owner_check.project_id = project_collaborators.project_id
        AND pc_owner_check.user_id = auth.uid()
        AND pc_owner_check.role = 'owner'
    )
);


-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_project_collaborators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_project_collaborators_updated ON public.project_collaborators;
CREATE TRIGGER on_project_collaborators_updated
BEFORE UPDATE ON public.project_collaborators
FOR EACH ROW
EXECUTE FUNCTION public.handle_project_collaborators_updated_at();

-- When a project (research_post) is created, automatically add the creator as an 'owner'
CREATE OR REPLACE FUNCTION public.handle_new_project_owner()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.project_collaborators (project_id, user_id, role, status, invited_by)
    VALUES (NEW.id, NEW.user_id, 'owner', 'active', NEW.user_id); -- project creator invites themselves as owner
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_project_created_add_owner ON public.research_posts;
CREATE TRIGGER after_project_created_add_owner
AFTER INSERT ON public.research_posts -- Assuming 'research_posts' is the main project table
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_project_owner();

COMMENT ON TABLE public.project_collaborators IS 'Manages user collaborations, roles, and invitation status for projects.';
COMMENT ON COLUMN public.project_collaborators.project_id IS 'Foreign key to the project (research_posts.id).';
COMMENT ON COLUMN public.project_collaborators.user_id IS 'Foreign key to the user (auth.users.id).';
COMMENT ON COLUMN public.project_collaborators.role IS 'Role of the user in the project (owner, editor, viewer).';
COMMENT ON COLUMN public.project_collaborators.status IS 'Status of the collaboration (pending invitation, active, declined, revoked).';
COMMENT ON COLUMN public.project_collaborators.invited_by IS 'User ID of the person who sent the invitation.'; 