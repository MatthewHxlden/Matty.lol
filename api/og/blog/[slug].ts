import { createClient } from "@supabase/supabase-js";

// Edge runtime lacks Node typings; declare minimal process.env shape
declare const process: { env: Record<string, string | undefined> };

export const config = {
  runtime: "edge",
};

type BlogPost = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  created_at: string;
  tags: string[];
};

const baseUrl = "https://matty.lol";
const fallbackImage = `${baseUrl}/og-banner.png`;

const generateExcerpt = (content: string | null, fallback: string | null) => {
  if (fallback) return fallback;
  if (!content) return "";
  const plain = content
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 180 ? `${plain.slice(0, 177)}...` : plain;
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const slug = url.pathname.split("/").pop() || "";

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response("Missing Supabase environment variables", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from("blog_posts")
    .select("title, slug, excerpt, content, cover_image, created_at, tags")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) {
    return new Response("Post not found", { status: 404 });
  }

  const post = data as BlogPost;
  const title = `Matty.lol - ${post.title}`;
  const description = generateExcerpt(post.content, post.excerpt) || "Matty.lol blog post";
  const imageUrl = post.cover_image || fallbackImage;
  const canonical = `${baseUrl}/blog/${post.slug}`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="canonical" href="${canonical}" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:alt" content="${escapeHtml(post.title)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Matty.lol" />
    <meta property="og:locale" content="en_GB" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <meta name="twitter:image:alt" content="${escapeHtml(post.title)}" />
    <meta name="twitter:site" content="@matty" />
    <meta name="twitter:creator" content="@matty" />
  </head>
  <body>
    <p>Redirecting to blog post...</p>
    <script>location.replace("${canonical}");</script>
  </body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
