import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import TerminalLayout from "@/components/TerminalLayout";
import TerminalCard from "@/components/TerminalCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, User, Terminal, AlertCircle } from "lucide-react";

const emailSchema = z.string().email("Invalid email format");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const usernameSchema = z.string().min(3, "Username must be at least 3 characters").optional();

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; username?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { user, signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validate = () => {
    const newErrors: { email?: string; password?: string; username?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (!isLogin && username) {
      const usernameResult = usernameSchema.safeParse(username);
      if (!usernameResult.success) {
        newErrors.username = usernameResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "ACCESS DENIED",
              description: "Invalid email or password. Check your credentials.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "ERROR",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "ACCESS GRANTED",
            description: "Welcome back to the system.",
          });
        }
      } else {
        const { error } = await signUp(email, password, username || undefined);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "USER EXISTS",
              description: "This email is already registered. Try logging in.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "REGISTRATION FAILED",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "ACCOUNT CREATED",
            description: "Check your email to confirm your account.",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TerminalLayout>
      <div className="container mx-auto px-4 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Terminal className="w-6 h-6 text-primary" />
              <span className="text-secondary">$</span>
              <span className="text-foreground">./auth --{isLogin ? "login" : "register"}</span>
              <span className="cursor-blink text-primary">_</span>
            </div>
            <h1 className="text-3xl font-bold neon-text">
              {isLogin ? "> System Login" : "> Create Account"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin
                ? "// authenticate to access the system"
                : "// register a new user account"}
            </p>
          </div>

          {/* Auth Form */}
          <TerminalCard title={isLogin ? "login.sh" : "register.sh"}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field (signup only) */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    username
                  </label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="neo"
                    className="bg-input border-border focus:border-primary focus:ring-primary"
                  />
                  {errors.username && (
                    <p className="text-destructive text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.username}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@matrix.net"
                  className="bg-input border-border focus:border-primary focus:ring-primary"
                  required
                />
                {errors.email && (
                  <p className="text-destructive text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-input border-border focus:border-primary focus:ring-primary"
                  required
                />
                {errors.password && (
                  <p className="text-destructive text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border border-primary neon-border transition-all duration-300"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-pulse">processing</span>
                    <span className="cursor-blink">_</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    {isLogin ? "LOGIN" : "REGISTER"}
                  </span>
                )}
              </Button>
            </form>

            {/* Toggle login/signup */}
            <div className="mt-6 pt-4 border-t border-border text-center">
              <p className="text-muted-foreground text-sm">
                {isLogin ? "// no account?" : "// already registered?"}
              </p>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-secondary hover:text-primary hover-glow transition-all mt-1"
              >
                {isLogin ? "> create_account" : "> login"}
              </button>
            </div>
          </TerminalCard>

          {/* Back to home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <button
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-primary text-sm transition-all"
            >
              {"<"} back to ./home
            </button>
          </motion.div>
        </motion.div>
      </div>
    </TerminalLayout>
  );
};

export default Auth;
