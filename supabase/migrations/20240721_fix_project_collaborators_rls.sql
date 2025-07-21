-- Allow the owner to insert themselves (for direct API calls)
CREATE POLICY "Allow owner to insert themselves"
  ON public.project_collaborators
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow the trigger function (running as 'authenticator') to insert the owner row
CREATE POLICY "Allow trigger to insert owner row"
  ON public.project_collaborators
  FOR INSERT
  TO authenticator
  WITH CHECK (role = 'owner'); 