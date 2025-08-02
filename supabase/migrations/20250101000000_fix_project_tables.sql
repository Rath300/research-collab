-- Fix project_collaborators to reference projects table instead of research_posts
ALTER TABLE IF EXISTS public.project_collaborators 
DROP CONSTRAINT IF EXISTS fk_project;

ALTER TABLE IF EXISTS public.project_collaborators 
ADD CONSTRAINT fk_project
    FOREIGN KEY(project_id) 
    REFERENCES public.projects(id)
    ON DELETE CASCADE;

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for project_tasks
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON public.project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to ON public.project_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON public.project_tasks(status);

-- Enable RLS on project_tasks
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_tasks
CREATE POLICY "Project collaborators can view tasks"
ON public.project_tasks
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.project_collaborators pc
        WHERE pc.project_id = project_tasks.project_id
        AND pc.user_id = auth.uid()
        AND pc.status = 'active'
    )
    OR
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_tasks.project_id
        AND p.leader_id = auth.uid()
    )
);

CREATE POLICY "Project owners and editors can manage tasks"
ON public.project_tasks
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.project_collaborators pc
        WHERE pc.project_id = project_tasks.project_id
        AND pc.user_id = auth.uid()
        AND pc.status = 'active'
        AND (pc.role = 'owner' OR pc.role = 'editor')
    )
    OR
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_tasks.project_id
        AND p.leader_id = auth.uid()
    )
);

-- Create project_notes table
CREATE TABLE IF NOT EXISTS public.project_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    section TEXT,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_edited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for project_notes
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON public.project_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_section ON public.project_notes(section);
CREATE INDEX IF NOT EXISTS idx_project_notes_tags ON public.project_notes USING GIN(tags);

-- Enable RLS on project_notes
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_notes
CREATE POLICY "Project collaborators can view notes"
ON public.project_notes
FOR SELECT
USING (
    is_public = true
    OR
    EXISTS (
        SELECT 1 FROM public.project_collaborators pc
        WHERE pc.project_id = project_notes.project_id
        AND pc.user_id = auth.uid()
        AND pc.status = 'active'
    )
    OR
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_notes.project_id
        AND p.leader_id = auth.uid()
    )
);

CREATE POLICY "Project owners and editors can manage notes"
ON public.project_notes
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.project_collaborators pc
        WHERE pc.project_id = project_notes.project_id
        AND pc.user_id = auth.uid()
        AND pc.status = 'active'
        AND (pc.role = 'owner' OR pc.role = 'editor')
    )
    OR
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_notes.project_id
        AND p.leader_id = auth.uid()
    )
);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_project_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_project_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_project_tasks_updated ON public.project_tasks;
CREATE TRIGGER on_project_tasks_updated
    BEFORE UPDATE ON public.project_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_project_tasks_updated_at();

DROP TRIGGER IF EXISTS on_project_notes_updated ON public.project_notes;
CREATE TRIGGER on_project_notes_updated
    BEFORE UPDATE ON public.project_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_project_notes_updated_at(); 