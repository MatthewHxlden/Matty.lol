-- Create apps table
CREATE TABLE public.apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tech TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'dev',
  github_url TEXT,
  demo_url TEXT,
  stars INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

-- Anyone can view apps
CREATE POLICY "Apps are viewable by everyone"
ON public.apps FOR SELECT
USING (true);

-- Only admins can modify apps
CREATE POLICY "Admins can insert apps"
ON public.apps FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update apps"
ON public.apps FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete apps"
ON public.apps FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create tools table
CREATE TABLE public.tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'dev',
  url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Anyone can view tools
CREATE POLICY "Tools are viewable by everyone"
ON public.tools FOR SELECT
USING (true);

-- Only admins can modify tools
CREATE POLICY "Admins can insert tools"
ON public.tools FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update tools"
ON public.tools FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tools"
ON public.tools FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create links table
CREATE TABLE public.links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT,
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'Globe',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Anyone can view links
CREATE POLICY "Links are viewable by everyone"
ON public.links FOR SELECT
USING (true);

-- Only admins can modify links
CREATE POLICY "Admins can insert links"
ON public.links FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update links"
ON public.links FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete links"
ON public.links FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_apps_updated_at
BEFORE UPDATE ON public.apps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tools_updated_at
BEFORE UPDATE ON public.tools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_links_updated_at
BEFORE UPDATE ON public.links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.apps (name, description, tech, status, github_url, demo_url, stars, sort_order)
VALUES 
  ('NeonTask', 'A cyberpunk-themed task manager with terminal vibes', ARRAY['React', 'TypeScript', 'Tailwind'], 'live', '#', '#', 42, 1),
  ('ByteBuddy', 'AI-powered coding companion for the terminal', ARRAY['Python', 'OpenAI', 'Click'], 'beta', '#', '#', 128, 2),
  ('GlitchGen', 'Generate glitch art from any image', ARRAY['JavaScript', 'Canvas API', 'WebGL'], 'live', '#', '#', 89, 3),
  ('TerminalFolio', 'Portfolio template with terminal aesthetics', ARRAY['Next.js', 'Framer Motion', 'MDX'], 'dev', '#', NULL, 256, 4);

INSERT INTO public.tools (name, description, category, url, sort_order)
VALUES 
  ('Color Converter', 'Convert between HEX, RGB, HSL and more', 'design', '#', 1),
  ('JSON Formatter', 'Pretty print and validate JSON data', 'dev', '#', 2),
  ('Base64 Encoder', 'Encode and decode Base64 strings', 'dev', '#', 3),
  ('Lorem Generator', 'Generate placeholder text with style', 'content', '#', 4),
  ('Regex Tester', 'Test and debug regular expressions', 'dev', '#', 5),
  ('CSS Gradient Maker', 'Create beautiful CSS gradients', 'design', '#', 6);

INSERT INTO public.links (name, handle, url, icon, sort_order)
VALUES 
  ('GitHub', '@matty', 'https://github.com', 'Github', 1),
  ('Twitter / X', '@matty', 'https://twitter.com', 'Twitter', 2),
  ('LinkedIn', 'in/matty', 'https://linkedin.com', 'Linkedin', 3),
  ('YouTube', '@matty', 'https://youtube.com', 'Youtube', 4),
  ('Discord', 'matty#0001', '#', 'MessageCircle', 5),
  ('Website', 'matty.lol', '#', 'Globe', 6);