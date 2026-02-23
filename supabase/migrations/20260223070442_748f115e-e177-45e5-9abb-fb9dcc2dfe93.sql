
-- Allow public INSERT on tasks
CREATE POLICY "Public insert tasks"
ON public.tasks
FOR INSERT
WITH CHECK (true);

-- Allow public UPDATE on tasks
CREATE POLICY "Public update tasks"
ON public.tasks
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow public DELETE on tasks
CREATE POLICY "Public delete tasks"
ON public.tasks
FOR DELETE
USING (true);
