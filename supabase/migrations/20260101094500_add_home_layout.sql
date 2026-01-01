-- Create home_layout table for configurable homepage sections
CREATE TABLE IF NOT EXISTS public.home_layout (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  layout jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.home_layout ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Home layout viewable by everyone" ON public.home_layout
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert home layout" ON public.home_layout
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update home layout" ON public.home_layout
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete home layout" ON public.home_layout
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_home_layout_updated_at
  BEFORE UPDATE ON public.home_layout
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.home_layout (layout)
SELECT jsonb_build_array(
  jsonb_build_object('id','hero','enabled',true),
  jsonb_build_object('id','trades','enabled',true),
  jsonb_build_object('id','signals','enabled',true),
  jsonb_build_object('id','quick_links','enabled',true),
  jsonb_build_object('id','status','enabled',true)
)
WHERE NOT EXISTS (SELECT 1 FROM public.home_layout);
