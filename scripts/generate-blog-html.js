import { supabase } from '../src/integrations/supabase/client.js';
import fs from 'fs';
import path from 'path';

/**
 * @typedef {Object} BlogPost
 * @property {string} id
 * @property {string} title
 * @property {string} slug
 * @property {string|null} excerpt
 * @property {string|null} content
 * @property {string|null} cover_image
 * @property {string} created_at
 * @property {string[]} tags
 * @property {boolean} published
 */

const generateBlogPostHTML = (post) => {
  const baseUrl = 'https://matty.lol';
  const blogUrl = `${baseUrl}/blog/${post.slug}`;
  const excerpt = post.excerpt || generateExcerpt(post.content || '');
  const coverImage = post.cover_image || `${baseUrl}/og-banner.png`;
  
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${post.title} | Matty.lol - Crypto Trader & Developer</title>
    <meta name="description" content="${excerpt}" />
    <meta name="author" content="Matty (JaeSwift)" />
    
    <!-- Favicon -->
    <link rel="icon" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="icon" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" sizes="96x96" href="/favicon-96x96.png" />
    <link rel="icon" sizes="144x144" href="/favicon-144x144.png" />
    <link rel="icon" sizes="180x180" href="/favicon-180x180.png" />
    <link rel="icon" sizes="192x192" href="/favicon-192x192.png" />
    <link rel="icon" sizes="512x512" href="/favicon-512x512.png" />
    
    <!-- Apple Touch Icons -->
    <link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png" />
    <link rel="apple-touch-icon" sizes="192x192" href="/favicon-192x192.png" />
    
    <!-- Android Chrome Icons -->
    <link rel="manifest" href="/site.webmanifest" crossorigin="use-credentials" />
    <meta name="theme-color" content="#00ffff" />

    <!-- Canonical URL -->
    <link rel="canonical" href="${blogUrl}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${blogUrl}" />
    <meta property="og:title" content="${post.title}" />
    <meta property="og:description" content="${excerpt}" />
    <meta property="og:image" content="${coverImage}" />
    <meta property="og:image:secure_url" content="${coverImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${post.title}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:site_name" content="Matty.lol" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter / X -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${blogUrl}" />
    <meta property="twitter:title" content="${post.title}" />
    <meta property="twitter:description" content="${excerpt}" />
    <meta property="twitter:image" content="${coverImage}" />
    <meta property="twitter:image:alt" content="${post.title}" />
    <meta property="twitter:site" content="@matty" />
    <meta property="twitter:creator" content="@matty" />
    <meta property="twitter:domain" content="matty.lol" />

    <!-- Article specific tags -->
    <meta property="article:author" content="Matty (JaeSwift)" />
    <meta property="article:published_time" content="${post.created_at}" />
    <meta property="article:modified_time" content="${new Date().toISOString()}" />
    <meta property="article:section" content="Technology" />
    ${post.tags.map(tag => `<meta property="article:tag" content="${tag}" />`).join('\n    ')}

    <!-- Additional SEO tags -->
    <meta name="keywords" content="${post.tags.join(', ')}, cryptocurrency, trading, web development, Matty, JaeSwift, blog, ${post.title}" />
    <meta name="robots" content="index, follow" />
    <meta name="googlebot" content="index, follow" />

    <!-- DNS prefetch for faster loading -->
    <link rel="dns-prefetch" href="//matty.lol" />
    <link rel="dns-prefetch" href="//www.matty.lol" />

    <!-- Redirect to main app after meta tags are loaded -->
    <script>
      // Redirect to the main React app
      window.location.href = '/blog/${post.slug}#' + window.location.search;
    </script>
  </head>
  <body>
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: monospace; color: #00ffff;">
      <div>
        <h1>${post.title}</h1>
        <p>Loading blog post...</p>
        <p><a href="/blog/${post.slug}">Click here if not redirected</a></p>
      </div>
    </div>
  </body>
</html>`;
};

const generateExcerpt = (content, maxLength = 160) => {
  const plainText = content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.substring(0, maxLength - 3) + '...';
};

const generateBlogHTMLFiles = async () => {
  try {
    console.log('Fetching published blog posts...');
    
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, content, cover_image, created_at, tags, published')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts:', error);
      return;
    }

    console.log(`Found ${posts?.length || 0} published posts`);

    const outputDir = path.join(process.cwd(), 'dist', 'blog');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate HTML file for each blog post
    for (const post of posts || []) {
      const html = generateBlogPostHTML(post);
      const filePath = path.join(outputDir, `${post.slug}.html`);
      
      fs.writeFileSync(filePath, html);
      console.log(`Generated: ${filePath}`);
    }

    console.log('Blog HTML files generated successfully!');
  } catch (error) {
    console.error('Error generating blog HTML files:', error);
  }
};

// Run the generator
generateBlogHTMLFiles();
