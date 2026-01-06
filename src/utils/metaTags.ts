interface BlogPostMeta {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  author_name?: string;
  created_at: string;
  tags: string[];
}

export const updateBlogMetaTags = (post: BlogPostMeta) => {
  const baseUrl = "https://matty.lol";
  const blogUrl = `${baseUrl}/blog/${post.slug}`;
  const titleWithSite = `Matty.lol - ${post.title}`;

  // Generate excerpt if not provided
  const excerpt = post.excerpt || generateExcerpt(post.content || "");

  // Update page title
  document.title = titleWithSite;

  const fallbackImage = `${baseUrl}/og-banner.png`;
  const imageUrl = post.cover_image || fallbackImage;

  // Open Graph
  setMetaTag("og:title", titleWithSite);
  setMetaTag("og:description", excerpt);
  setMetaTag("og:image", imageUrl);
  setMetaTag("og:image:alt", post.title);
  setMetaTag("og:image:width", "1200");
  setMetaTag("og:image:height", "630");
  setMetaTag("og:url", blogUrl);
  setMetaTag("og:type", "article");
  setMetaTag("og:site_name", "Matty.lol");
  setMetaTag("og:locale", "en_GB");

  // Twitter Card
  setMetaTag("twitter:title", titleWithSite, "name");
  setMetaTag("twitter:description", excerpt, "name");
  setMetaTag("twitter:image", imageUrl, "name");
  setMetaTag("twitter:image:alt", post.title, "name");
  setMetaTag("twitter:card", "summary_large_image", "name");
  setMetaTag("twitter:site", "@matty", "name");
  setMetaTag("twitter:creator", "@matty", "name");
  setMetaTag("twitter:domain", "matty.lol", "name");

  // Article specific tags
  setMetaTag("article:author", post.author_name || "Matty (JaeSwift)");
  setMetaTag("article:published_time", post.created_at);
  setMetaTag("article:modified_time", new Date().toISOString());
  setMetaTag("article:section", "Technology");
  if (post.tags.length > 0) {
    setMetaTag("article:tag", post.tags.join(","));
  }

  // Additional SEO tags
  setMetaTag("description", excerpt, "name");
  setMetaTag(
    "keywords",
    `${post.tags.join(", ")}, cryptocurrency, trading, web development, Matty, JaeSwift, blog, ${post.title}`,
    "name"
  );
  setMetaTag("author", post.author_name || "Matty (JaeSwift)", "name");

  // Canonical link
  setLinkTag("canonical", blogUrl);
};

const setMetaTag = (key: string, content: string, attribute: "property" | "name" = "property") => {
  if (!content) return;
  let tag =
    document.querySelector(`meta[${attribute}="${key}"]`) ||
    document.querySelector(`meta[name="${key}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
};

const setLinkTag = (rel: string, href: string) => {
  if (!href) return;
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

const generateExcerpt = (content: string, maxLength: number = 160): string => {
  // Remove markdown syntax
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Remove images, keep alt text
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  // Truncate and add ellipsis if needed
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.substring(0, maxLength - 3) + '...';
};

export const resetMetaTags = () => {
  // Reset to default site meta tags
  document.title = 'Matty.lol - Crypto Trader & Developer';
  
  const defaultTags = {
    'og:title': 'Matty.lol - Crypto Trader & Developer',
    'og:description': 'Personal website of cryptocurrency trader, web developer and designer, Matty AKA JaeSwift. Featuring crypto trading insights, development tutorials, DeFi guides, custom apps, tools, and a tech blog.',
    'og:image': 'https://matty.lol/og-banner.png',
    'og:url': 'https://matty.lol/',
    'og:type': 'website',
    'og:site_name': 'Matty.lol',
    'twitter:title': 'Matty.lol - Crypto Trader & Developer',
    'twitter:description': 'Personal website of cryptocurrency trader, web developer and designer, Matty AKA JaeSwift. Featuring crypto trading insights, development tutorials, DeFi guides, custom apps, tools, and a tech blog.',
    'twitter:image': 'https://matty.lol/og-banner.png',
    'twitter:card': 'summary_large_image',
    'twitter:site': '@matty',
    'twitter:creator': '@matty',
    'description': 'Personal website of cryptocurrency trader, web developer and designer, Matty AKA JaeSwift. Featuring crypto trading insights, development tutorials, DeFi guides, custom apps, tools, and a tech blog.',
    'canonical': 'https://matty.lol/'
  };
  
  Object.entries(defaultTags).forEach(([key, value]) => {
    setMetaTag(key, value);
  });
};
