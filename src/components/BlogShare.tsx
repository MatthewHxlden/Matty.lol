import { useState } from "react";
import { Twitter, MessageCircle, Linkedin, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogShareProps {
  title: string;
  excerpt: string | null;
  url: string;
  coverImage: string | null;
}

const BlogShare = ({ title, excerpt, url, coverImage }: BlogShareProps) => {
  const [copied, setCopied] = useState(false);
  
  const shareText = `Check out this post: ${title}`;
  const description = excerpt || `Read this amazing article by Matty (JaeSwift)`;
  
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`,
    discord: url, // Discord doesn't have direct share URL, but users can paste
    copy: url
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const shareButtons = [
    {
      name: 'Twitter/X',
      icon: Twitter,
      url: shareUrls.twitter,
      color: 'hover:text-blue-400',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: shareUrls.linkedin,
      color: 'hover:text-blue-600',
      bgColor: 'bg-blue-600/10 hover:bg-blue-600/20'
    },
    {
      name: 'Discord',
      icon: MessageCircle,
      url: shareUrls.discord,
      color: 'hover:text-indigo-400',
      bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20'
    },
    {
      name: copied ? 'Copied!' : 'Copy Link',
      icon: copied ? Check : Link2,
      url: shareUrls.copy,
      color: copied ? 'hover:text-green-400 text-green-400' : 'hover:text-gray-400',
      bgColor: copied ? 'bg-green-500/20' : 'bg-gray-500/10 hover:bg-gray-500/20',
      action: handleCopy
    }
  ];

  return (
    <div className="terminal-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <span className="text-sm text-muted-foreground">Share this post</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {shareButtons.map((button) => {
          const Icon = button.icon;
          return (
            <Button
              key={button.name}
              variant="outline"
              size="sm"
              onClick={button.action || (() => window.open(button.url, '_blank'))}
              className={`terminal-button flex items-center gap-2 justify-center ${button.bgColor} ${button.color} transition-all duration-200`}
            >
              <Icon size={16} />
              <span className="text-xs">{button.name}</span>
            </Button>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-terminal/50 rounded border border-primary/20">
        <p className="text-xs text-muted-foreground mb-2">
          <span className="text-primary">$</span> share_preview
        </p>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            {coverImage && (
              <img 
                src={coverImage} 
                alt={title}
                className="w-16 h-16 object-cover rounded border border-primary/30"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-primary line-clamp-2">{title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{description}</p>
              <p className="text-xs text-accent mt-1">{url}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogShare;
