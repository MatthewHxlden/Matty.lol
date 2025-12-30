import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  created_at: string;
  tags: string[];
}

const RssFeed = () => {
  const { data: posts } = useQuery({
    queryKey: ["rss-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, content, created_at, tags")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as BlogPost[];
    },
  });

  useEffect(() => {
    if (!posts) return;

    const siteUrl = window.location.origin;
    const escapeXml = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>matty.lol Blog</title>
    <link>${siteUrl}</link>
    <description>thoughts, tutorials, and random musings</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt || "")}</description>
      ${post.tags?.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

    // Display as XML
    document.body.innerHTML = `<pre style="white-space: pre-wrap; word-wrap: break-word; font-family: monospace; background: #0a0a0f; color: #00ffff; padding: 20px;">${escapeXml(rssXml)}</pre>`;
    document.title = "RSS Feed - matty.lol";
  }, [posts]);

  return null;
};

export default RssFeed;
