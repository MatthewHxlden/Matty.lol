-- Create activity_feed table for /feed
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid NULL,
  title text NOT NULL,
  content text NOT NULL,
  published boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity feed viewable by everyone" ON public.activity_feed
  FOR SELECT
  USING (published = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert activity feed" ON public.activity_feed
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update activity feed" ON public.activity_feed
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete activity feed" ON public.activity_feed
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_activity_feed_updated_at
  BEFORE UPDATE ON public.activity_feed
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
