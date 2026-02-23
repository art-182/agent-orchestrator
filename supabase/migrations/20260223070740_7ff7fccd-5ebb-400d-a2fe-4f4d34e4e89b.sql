-- Add url column to deliverables for links/access
ALTER TABLE public.deliverables ADD COLUMN url text DEFAULT '';
