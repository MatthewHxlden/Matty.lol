import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

// Minimal env typing for edge runtime
declare const process: { env: Record<string, string | undefined> };

type BlogPost = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  tags: string[];
};

const baseUrl = "https://matty.lol";
const logoUrl = `${baseUrl}/logo.png`;

const gradient = "linear-gradient(135deg, #0f172a 0%, #111827 35%, #1f2937 65%, #0b1224 100%)";

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
  return plain.length > 150 ? `${plain.slice(0, 147)}...` : plain;
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const slug = url.pathname.split("/").pop() || "";

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response("Missing Supabase environment variables", { status: 500 });
  }

  const apiUrl = `${supabaseUrl}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(
    slug
  )}&published=eq.true&select=title,slug,excerpt,content,cover_image,tags&limit=1`;

  const res = await fetch(apiUrl, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  if (!res.ok) {
    return new Response("Post not found", { status: 404 });
  }

  const rows = (await res.json()) as BlogPost[];
  const post = rows?.[0];

  if (!post) {
    return new Response("Post not found", { status: 404 });
  }
  const title = post.title;
  const description = generateExcerpt(post.content, post.excerpt) || "Matty.lol blog post";
  const imageUrl = post.cover_image || `${baseUrl}/og-banner.png`;

  // Basic tag pill colours fallback
  const tagPill = (tag: string, index: number) => ({
    backgroundColor: ["#10b98120", "#3b82f620", "#8b5cf620", "#f59e0b20"][index % 4],
    color: ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"][index % 4],
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          backgroundImage: gradient,
          color: "#e5e7eb",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src={logoUrl} alt="matty.lol" width={64} height={64} style={{ borderRadius: "12px" }} />
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#7c3aed" }}>matty.lol</div>
          </div>
          <div
            style={{
              padding: "8px 14px",
              borderRadius: "999px",
              border: "1px solid #7c3aed55",
              color: "#c084fc",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            Blog
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "32px",
            alignItems: "center",
            marginTop: "12px",
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontSize: "46px", fontWeight: 800, lineHeight: 1.1, color: "#f8fafc" }}>{title}</div>
            <div style={{ fontSize: "22px", color: "#cbd5e1", lineHeight: 1.4 }}>{description}</div>
            {post.tags && post.tags.length > 0 && (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {post.tags.slice(0, 4).map((tag, idx) => (
                  <div
                    key={tag}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "999px",
                      fontSize: "16px",
                      fontWeight: 700,
                      border: "1px solid #ffffff22",
                      ...tagPill(tag, idx),
                    }}
                  >
                    #{tag}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div
            style={{
              borderRadius: "18px",
              overflow: "hidden",
              border: "1px solid #1f2937",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              background: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={imageUrl}
              alt={title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scale(1.02)",
                filter: "saturate(1.02)",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#94a3b8", fontSize: "18px" }}>{baseUrl}/blog/{slug}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#cbd5e1", fontSize: "18px" }}>
            <span style={{ color: "#7c3aed", fontWeight: 700 }}>Matty</span>
            <span>—</span>
            <span>Crypto · Dev · AI</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
