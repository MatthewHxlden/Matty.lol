-- Add mission field to site_profile for editable homepage mission.txt
ALTER TABLE public.site_profile
ADD COLUMN IF NOT EXISTS mission text NOT NULL DEFAULT 'Welcome to my corner of the web. This is where I share projects, thoughts, and random experiments. Navigate using the links above or explore below.';

-- Backfill existing rows
UPDATE public.site_profile
SET mission = COALESCE(mission, 'Welcome to my corner of the web. This is where I share projects, thoughts, and random experiments. Navigate using the links above or explore below.');
