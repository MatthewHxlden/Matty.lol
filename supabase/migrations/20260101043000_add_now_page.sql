-- Create now_page table for editable /now content
CREATE TABLE IF NOT EXISTS public.now_page (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT 'now',
  content text NOT NULL DEFAULT 'building, learning, shipping.\n\n- current focus: ...\n- currently reading: ...\n- currently shipping: ...',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.now_page ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Now page viewable by everyone" ON public.now_page FOR SELECT USING (true);
CREATE POLICY "Admins can insert now page" ON public.now_page FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update now page" ON public.now_page FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete now page" ON public.now_page FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_now_page_updated_at BEFORE UPDATE ON public.now_page FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.now_page (title, content)
SELECT 'now', 'building, learning, shipping.\n\n- current focus: ...\n- currently reading: ...\n- currently shipping: ...'
WHERE NOT EXISTS (SELECT 1 FROM public.now_page);
