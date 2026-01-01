import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { Send, Mail, MapPin, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContactInfo {
  id: string;
  email: string;
  location: string;
  response_time: string;
  discussion_topics: string[];
}

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: contactInfo } = useQuery({
    queryKey: ["contact-info"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_info")
        .select("*")
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as ContactInfo | null;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "> Message sent!",
      description: "Thanks for reaching out. I'll get back to you soon.",
    });

    setFormData({ name: "", email: "", message: "" });
    setIsSubmitting(false);
  };

  // Fallback values
  const email = contactInfo?.email || "hello@matty.lol";
  const location = contactInfo?.location || "The Internet";
  const responseTime = contactInfo?.response_time || "~24-48 hours";
  const topics = contactInfo?.discussion_topics || [
    "New projects & ideas",
    "Collaboration opportunities",
    "Tech & dev discussions",
    "Coffee recommendations ☕",
  ];

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-secondary">$</span>
              <span className="text-foreground">./contact --send-message</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold neon-text">
              {">"} Contact
            </h1>
            <p className="text-muted-foreground">
              // let's connect
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <TerminalCard title="~/info.json" promptText="cat info.json">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-accent" />
                    <div>
                      <div className="text-xs text-muted-foreground">email:</div>
                      <div className="text-foreground">{email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-secondary" />
                    <div>
                      <div className="text-xs text-muted-foreground">location:</div>
                      <div className="text-foreground">{location}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">response_time:</div>
                      <div className="text-foreground">{responseTime}</div>
                    </div>
                  </div>
                </div>
              </TerminalCard>

              <TerminalCard promptText="cat topics.txt">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    <span className="text-secondary">// </span>
                    I'm always open to discussing:
                  </p>
                  <ul className="space-y-1 pl-4">
                    {topics.map((topic, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-accent">→</span> {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </TerminalCard>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TerminalCard title="~/compose.sh" promptText="./compose.sh --interactive">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      <span className="text-secondary">$</span> name:
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="w-full bg-input border border-border px-3 py-2 text-foreground focus:outline-none focus:border-primary focus:neon-border transition-all"
                      placeholder="Enter your name..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      <span className="text-secondary">$</span> email:
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="w-full bg-input border border-border px-3 py-2 text-foreground focus:outline-none focus:border-primary focus:neon-border transition-all"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      <span className="text-secondary">$</span> message:
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      required
                      rows={5}
                      className="w-full bg-input border border-border px-3 py-2 text-foreground focus:outline-none focus:border-primary focus:neon-border transition-all resize-none"
                      placeholder="Type your message here..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full border border-primary bg-primary/10 text-primary py-3 flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-pulse">Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>./send --message</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </TerminalCard>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default Contact;
