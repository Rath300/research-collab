-- Enable RLS and add policies for project_documents
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner or collaborator can insert document"
  ON public.project_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    uploader_user_id = auth.uid() OR
    project_id IN (SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "Owner or collaborator can select document"
  ON public.project_documents
  FOR SELECT
  TO authenticated
  USING (
    uploader_user_id = auth.uid() OR
    project_id IN (SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "Owner or collaborator can update document"
  ON public.project_documents
  FOR UPDATE
  TO authenticated
  USING (
    uploader_user_id = auth.uid() OR
    project_id IN (SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid() AND status = 'active')
  )
  WITH CHECK (
    uploader_user_id = auth.uid() OR
    project_id IN (SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "Owner or collaborator can delete document"
  ON public.project_documents
  FOR DELETE
  TO authenticated
  USING (
    uploader_user_id = auth.uid() OR
    project_id IN (SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid() AND status = 'active')
  );

-- Repeat for project_files
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner or collaborator can insert file"
  ON public.project_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    uploader_id = auth.uid() OR
    research_post_id IN (SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "Owner or collaborator can select file"
  ON public.project_files
  FOR SELECT
  TO authenticated
  USING (
    uploader_id = auth.uid() OR
    research_post_id IN (SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "Owner or collaborator can update file"
  ON public.project_files
  FOR UPDATE
  TO authenticated
  USING (
    uploader_id = auth.uid() OR
    research_post_id IN (SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid() AND status = 'active')
  )
  WITH CHECK (
    uploader_id = auth.uid() OR
    research_post_id IN (SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "Owner or collaborator can delete file"
  ON public.project_files
  FOR DELETE
  TO authenticated
  USING (
    uploader_id = auth.uid() OR
    research_post_id IN (SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid() AND status = 'active')
  );

-- Enable RLS and add policies for project_members
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage members"
  ON public.project_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.leader_id = auth.uid()
    )
  );

-- Enable RLS and add policies for project_timeline_milestones
ALTER TABLE public.project_timeline_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner or collaborator can manage milestones"
  ON public.project_timeline_milestones
  FOR ALL
  TO authenticated
  USING (
    project_id IN (SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid() AND status = 'active')
  );

-- Enable RLS and add policies for project_activity_log
ALTER TABLE public.project_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner or collaborator can view activity log"
  ON public.project_activity_log
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "Owner or collaborator can insert activity log"
  ON public.project_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid() AND status = 'active')
  );

-- Enable RLS and add policies for project_timeline_milestones
ALTER TABLE public.project_timeline_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner or collaborator can manage milestones"
  ON public.project_timeline_milestones
  FOR ALL
  TO authenticated
  USING (
    project_id IN (SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid() AND status = 'active')
  );

-- Enable RLS and add policies for project_documents (already above)
-- Enable RLS and add policies for project_files (already above)
-- Enable RLS and add policies for project_members (already above)
-- Enable RLS and add policies for project_activity_log (already above)
-- Enable RLS and add policies for project_timeline_milestones (already above) 