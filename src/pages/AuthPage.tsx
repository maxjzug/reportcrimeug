import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaEnvelope, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { backendAuth } from "@/config/backendAuth";
import { toast } from "@/hooks/use-toast";
import { useLang } from "@/contexts/LanguageContext";

export function AuthPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await backendAuth.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/main",
      });
      if (result.error) {
        toast({ title: "Error", description: String(result.error), variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to sign in with Google", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin + "/main" },
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check your email", description: "We sent a confirmation link." });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        navigate("/main");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-sidebar">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--sidebar-foreground)) 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"
            style={{ background: "var(--gradient-primary)" }}>
            <FaShieldAlt className="text-primary-foreground text-xl" />
          </div>
          <h1 className="text-xl font-bold text-sidebar-foreground" style={{ fontFamily: "var(--font-display)" }}>
            ReportCrime Uganda
          </h1>
          <p className="text-sm text-sidebar-foreground/60 mt-1">
            {isSignUp ? t("createAccount") : t("welcomeBack")}
          </p>
        </div>

        {/* Google */}
        <button onClick={handleGoogleSignIn} disabled={loading}
          className="w-full py-3.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-3 bg-card text-foreground border border-border hover:bg-muted transition-all shadow-sm mb-4">
          <FcGoogle className="text-xl" /> {t("continueWithGoogle")}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-sidebar-border" />
          <span className="text-xs text-sidebar-foreground/40">OR</span>
          <div className="flex-1 h-px bg-sidebar-border" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-sidebar-foreground/30 text-sm" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={t("email")}
              className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-sidebar-accent/30 border border-sidebar-border text-sidebar-foreground text-sm placeholder:text-sidebar-foreground/35 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-sidebar-foreground/30 text-sm" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={t("password")}
              className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-sidebar-accent/30 border border-sidebar-border text-sidebar-foreground text-sm placeholder:text-sidebar-foreground/35 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-lg font-semibold text-sm text-primary-foreground transition-all"
            style={{ background: "var(--gradient-primary)" }}>
            {loading ? "..." : isSignUp ? t("createAccount") : t("signIn")}
          </button>
        </form>

        <p className="text-sidebar-foreground/50 text-xs text-center mt-4">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-medium hover:underline">
            {isSignUp ? t("signIn") : t("createAccount")}
          </button>
        </p>

        <button onClick={() => navigate("/home")} className="text-sidebar-foreground/40 text-xs w-full text-center mt-3 hover:text-sidebar-foreground/50 transition-colors">
          ← Back to home
        </button>
      </motion.div>
    </div>
  );
}
