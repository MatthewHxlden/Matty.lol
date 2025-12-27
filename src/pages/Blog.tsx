import { motion } from "framer-motion";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { Calendar, Clock, Tag } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "Building a Cyberpunk Terminal with React",
    date: "2024-12-27",
    readTime: "5 min",
    tags: ["react", "css", "design"],
    excerpt: "How I created this retro-futuristic terminal aesthetic using modern web technologies...",
  },
  {
    id: 2,
    title: "The Art of Procrastination-Driven Development",
    date: "2024-12-20",
    readTime: "3 min",
    tags: ["coding", "humor"],
    excerpt: "Why putting things off until the last minute actually works sometimes...",
  },
  {
    id: 3,
    title: "My Favorite CLI Tools in 2024",
    date: "2024-12-15",
    readTime: "7 min",
    tags: ["tools", "productivity"],
    excerpt: "A curated list of command-line tools that make development more enjoyable...",
  },
  {
    id: 4,
    title: "Why I Still Use Vim in 2024",
    date: "2024-12-10",
    readTime: "4 min",
    tags: ["vim", "opinion"],
    excerpt: "Despite all the fancy IDEs, here's why I keep coming back to the classics...",
  },
];

const Blog = () => {
  return (
    <TerminalLayout>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-secondary">$</span>
              <span className="text-foreground">cat ./blog/README.md</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">
              {">"} Blog
            </h1>
            <p className="text-muted-foreground">
              // thoughts, tutorials, and random musings
            </p>
          </div>

          {/* Blog Posts */}
          <div className="space-y-4">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TerminalCard className="group cursor-pointer hover:border-primary transition-all duration-300">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-foreground group-hover:text-primary group-hover:neon-text transition-all">
                      <span className="text-secondary">{">"}</span> {post.title}
                    </h2>

                    <p className="text-muted-foreground text-sm">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 text-xs px-2 py-1 border border-accent/30 text-accent"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </TerminalCard>
              </motion.div>
            ))}
          </div>

          {/* Footer note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-muted-foreground text-sm py-8"
          >
            <span className="text-secondary">// </span>
            more posts coming soon...
          </motion.div>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default Blog;
