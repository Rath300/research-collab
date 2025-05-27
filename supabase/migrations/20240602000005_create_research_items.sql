-- Create ENUM type for research_items table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'research_item_type') THEN
        CREATE TYPE research_item_type AS ENUM ('file', 'link', 'text_block');
    END IF;
END
$$;

-- Create research_items table
CREATE TABLE IF NOT EXISTS public.research_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL, -- Creator or last editor of this item
    type research_item_type NOT NULL,
    "order" INTEGER DEFAULT 0 NOT NULL, -- Using "order" as it's a reserved keyword

    title TEXT, -- Title for links/files, or a short heading for text_block
    description TEXT, -- Main content for text_block, or description for links/files

    -- Fields for 'link' type
    url TEXT,

    -- Fields for 'file' type
    file_path TEXT,       -- Path in Supabase storage
    file_name TEXT,       -- Original file name
    file_type TEXT,       -- MIME type
    file_size_bytes BIGINT, -- File size in bytes

    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT fk_project
        FOREIGN KEY(project_id) 
        REFERENCES public.research_posts(id) -- Assuming 'research_posts' is the definitive project table
        ON DELETE CASCADE,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES auth.users(id)
        ON DELETE CASCADE -- Or SET NULL if you want to keep items but mark user as deleted
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_research_items_project_id ON public.research_items(project_id);
CREATE INDEX IF NOT EXISTS idx_research_items_user_id ON public.research_items(user_id);
CREATE INDEX IF NOT EXISTS idx_research_items_type ON public.research_items(type);
CREATE INDEX IF NOT EXISTS idx_research_items_project_order ON public.research_items(project_id, "order" ASC);


-- RLS Policies for research_items
ALTER TABLE public.research_items ENABLE ROW LEVEL SECURITY;

-- Allow users to view items in projects they are part of
CREATE POLICY "Users can view research items in their collaborated projects"
ON public.research_items
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.project_collaborators pc
        WHERE pc.project_id = research_items.project_id
        AND pc.user_id = auth.uid()
        AND pc.status = 'active' -- Ensure they are an active collaborator
    )
);

-- Allow active collaborators with 'editor' or 'owner' role to create, update, delete items
CREATE POLICY "Editors/Owners can manage research items in their collaborated projects"
ON public.research_items
FOR ALL -- INSERT, UPDATE, DELETE
USING (
    EXISTS (
        SELECT 1
        FROM public.project_collaborators pc
        WHERE pc.project_id = research_items.project_id
        AND pc.user_id = auth.uid()
        AND pc.status = 'active'
        AND (pc.role = 'editor' OR pc.role = 'owner')
    )
)
WITH CHECK ( -- Ensure on INSERT/UPDATE, the user still meets the criteria
    EXISTS (
        SELECT 1
        FROM public.project_collaborators pc
        WHERE pc.project_id = research_items.project_id
        AND pc.user_id = auth.uid()
        AND pc.status = 'active'
        AND (pc.role = 'editor' OR pc.role = 'owner')
    )
);


-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_research_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_research_items_updated ON public.research_items;
CREATE TRIGGER on_research_items_updated
BEFORE UPDATE ON public.research_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_research_items_updated_at();

COMMENT ON TABLE public.research_items IS 'Stores individual content items (notes, links, files, text blocks) within a research project.';
COMMENT ON COLUMN public.research_items.project_id IS 'Foreign key to the research project (research_posts.id).';
COMMENT ON COLUMN public.research_items.user_id IS 'Foreign key to the user who created/last edited this item (auth.users.id).';
COMMENT ON COLUMN public.research_items.type IS 'Type of the research item (file, link, text_block).';
COMMENT ON COLUMN public.research_items."order" IS 'Defines the display order of items within a project.';
COMMENT ON COLUMN public.research_items.title IS 'Title for links/files, or a short heading for a text_block.';
COMMENT ON COLUMN public.research_items.description IS 'Main content for a text_block, or description for links/files.';
COMMENT ON COLUMN public.research_items.url IS 'URL for items of type ''link''.';
COMMENT ON COLUMN public.research_items.file_path IS 'Path to the uploaded file in Supabase storage for items of type ''file''.';
COMMENT ON COLUMN public.research_items.file_name IS 'Original name of the uploaded file.';
COMMENT ON COLUMN public.research_items.file_type IS 'MIME type of the uploaded file.';
COMMENT ON COLUMN public.research_items.file_size_bytes IS 'Size of the uploaded file in bytes.'; 