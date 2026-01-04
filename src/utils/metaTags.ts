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
  const baseUrl = 'https://matty.lol';
  const blogUrl = `${baseUrl}/blog/${post.slug}`;
  
  // Generate excerpt if not provided
  const excerpt = post.excerpt || generateExcerpt(post.content || '');
  
  // Update page title
  document.title = `${post.title} | Matty.lol - Crypto Trader & Developer`;
  
  // Update or create meta tags
  setMetaTag('og:title', post.title);
  setMetaTag('og:description', excerpt);
  setMetaTag('og:image', post.cover_image || `${baseUrl}/og-banner.png`);
  setMetaTag('og:image:alt', post.title);
  setMetaTag('og:image:width', '1200');
  setMetaTag('og:image:height', '630');
  setMetaTag('og:url', blogUrl);
  setMetaTag('og:type', 'article');
  setMetaTag('og:site_name', 'Matty.lol');
  setMetaTag('og:locale', 'en_US');
  
  // Twitter Card tags
  setMetaTag('twitter:title', post.title);
  setMetaTag('twitter:description', excerpt);
  setMetaTag('twitter:image', post.cover_image || `${baseUrl}/og-banner.png`);
  setMetaTag('twitter:image:alt', post.title);
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:site', '@matty');
  setMetaTag('twitter:creator', '@matty');
  setMetaTag('twitter:domain', 'matty.lol');
  
  // Article specific tags
  setMetaTag('article:author', post.author_name || 'Matty (JaeSwift)');
  setMetaTag('article:published_time', post.created_at);
  setMetaTag('article:modified_time', new Date().toISOString());
  setMetaTag('article:section', 'Technology');
  if (post.tags.length > 0) {
    setMetaTag('article:tag', post.tags.join(','));
  }
  
  // Additional SEO tags
  setMetaTag('description', excerpt);
  setMetaTag('keywords', `${post.tags.join(', ')}, cryptocurrency, trading, web development, Matty, JaeSwift, blog, ${post.title}`);
  setMetaTag('author', post.author_name || 'Matty (JaeSwift)');
  
  // Canonical URL
  setMetaTag('canonical', blogUrl, 'rel');
};

const setMetaTag = (property: string, content: string, attribute: string = 'property') => {
  // Try to find existing tag
  let tag = document.querySelector(`meta[${attribute}="${property}"]`) ||
           document.querySelector(`meta[name="${property}"]`);
  
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, property);
    document.head.appendChild(tag);
  }
  
  tag.setAttribute('content', content);
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
