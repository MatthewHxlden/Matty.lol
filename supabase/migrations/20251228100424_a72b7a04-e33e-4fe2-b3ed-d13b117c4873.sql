-- Create contact_info table for editable contact page content
CREATE TABLE public.contact_info (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL DEFAULT 'hello@example.com',
  location text NOT NULL DEFAULT 'The Internet',
  response_time text NOT NULL DEFAULT '~24-48 hours',
  discussion_topics text[] DEFAULT ARRAY['New projects & ideas', 'Collaboration opportunities', 'Tech & dev discussions', 'Coffee recommendations ☕']::text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create site_stats table for editable homepage stats
CREATE TABLE public.site_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_key text NOT NULL UNIQUE,
  stat_value text NOT NULL,
  stat_label text NOT NULL,
  icon_name text NOT NULL DEFAULT 'Zap',
  color_class text NOT NULL DEFAULT 'text-primary',
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create site_profile table for editable homepage whoami section
CREATE TABLE public.site_profile (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT 'Matty',
  role text NOT NULL DEFAULT 'Developer / Creator / Digital Wanderer',
  status text NOT NULL DEFAULT 'building cool stuff on the internet',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add cover_image column to blog_posts
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS cover_image text;

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_profile ENABLE ROW LEVEL SECURITY;

-- RLS for contact_info
CREATE POLICY "Contact info viewable by everyone" ON public.contact_info FOR SELECT USING (true);
CREATE POLICY "Admins can insert contact info" ON public.contact_info FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update contact info" ON public.contact_info FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete contact info" ON public.contact_info FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for site_stats
CREATE POLICY "Stats viewable by everyone" ON public.site_stats FOR SELECT USING (true);
CREATE POLICY "Admins can insert stats" ON public.site_stats FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update stats" ON public.site_stats FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete stats" ON public.site_stats FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for site_profile
CREATE POLICY "Site profile viewable by everyone" ON public.site_profile FOR SELECT USING (true);
CREATE POLICY "Admins can insert site profile" ON public.site_profile FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update site profile" ON public.site_profile FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete site profile" ON public.site_profile FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for blog-images bucket
CREATE POLICY "Blog images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Admins can upload blog images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update blog images" ON storage.objects FOR UPDATE USING (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete blog images" ON storage.objects FOR DELETE USING (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Insert default contact info
INSERT INTO public.contact_info (email, location, response_time, discussion_topics)
VALUES ('hello@matty.lol', 'The Internet', '~24-48 hours', ARRAY['New projects & ideas', 'Collaboration opportunities', 'Tech & dev discussions', 'Coffee recommendations ☕']::text[]);

-- Insert default site profile
INSERT INTO public.site_profile (name, role, status)
VALUES ('Matty', 'Developer / Creator / Digital Wanderer', 'building cool stuff on the internet');

-- Insert default stats
INSERT INTO public.site_stats (stat_key, stat_value, stat_label, icon_name, color_class, sort_order) VALUES
('coffees', '∞', 'coffees', 'Coffee', 'text-accent', 1),
('projects', '42+', 'projects', 'Code', 'text-secondary', 2),
('bugs_fixed', '9999', 'bugs fixed', 'Skull', 'text-destructive', 3),
('ideas', 'loading...', 'ideas', 'Zap', 'text-primary', 4);

-- Add updated_at triggers
CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON public.contact_info FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_stats_updated_at BEFORE UPDATE ON public.site_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_profile_updated_at BEFORE UPDATE ON public.site_profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();