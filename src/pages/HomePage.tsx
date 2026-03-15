import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaShieldAlt, FaArrowRight, FaGavel, FaHandsHelping } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useLang } from "@/contexts/LanguageContext";

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLang();
  const [authTab, setAuthTab] = useState<"explore" | "signin" | "google">("explore");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
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
    setAuthLoading(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthLoading(true);
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
    setAuthLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-sidebar">
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--sidebar-foreground)) 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="text-center mb-6 relative z-10">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          style={{ background: "var(--gradient-primary)" }}>
          <FaShieldAlt className="text-primary-foreground text-2xl" />
        </div>
        <h1 className="text-2xl font-bold text-sidebar-foreground" style={{ fontFamily: "var(--font-display)" }}>
          ReportCrime Uganda
        </h1>
        <p className="text-sm text-sidebar-foreground/60 mt-1">
          Your safety companion. Report crimes, find help, know your rights.
        </p>
      </motion.div>

      {/* Quick feature pills */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="flex gap-3 mb-6 relative z-10">
        {[
          { icon: FaGavel, label: "Report" },
          { icon: FaHandsHelping, label: "Get Help" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-sidebar-accent/50 border border-sidebar-border">
              <Icon className="text-primary text-sm" />
              <span className="text-xs font-medium text-sidebar-foreground/80">{item.label}</span>
            </div>
          );
        })}
      </motion.div>

      {/* Card wrapper */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-sm relative z-10">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-sidebar-accent/30 mb-4">
          <button onClick={() => setAuthTab("explore")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              authTab === "explore" ? "bg-sidebar-accent text-sidebar-foreground shadow" : "text-sidebar-foreground/70 hover:text-sidebar-foreground/90"
            }`}>Explore</button>
          <button onClick={() => setAuthTab("signin")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              authTab === "signin" ? "bg-sidebar-accent text-sidebar-foreground shadow" : "text-sidebar-foreground/70 hover:text-sidebar-foreground/90"
            }`}>Sign In</button>
          <button onClick={() => setAuthTab("google")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
              authTab === "google" ? "bg-sidebar-accent text-sidebar-foreground shadow" : "text-sidebar-foreground/70 hover:text-sidebar-foreground/90"
            }`}>
            <FcGoogle className="text-sm" /> Google
          </button>
        </div>

        <AnimatePresence mode="wait">
          {authTab === "google" ? (
            <motion.div key="google" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-4">
              <p className="text-sidebar-foreground/70 text-sm text-center">Sign in with your Google account</p>
              <button onClick={handleGoogleSignIn} disabled={authLoading}
                className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 bg-card text-foreground border border-border hover:bg-muted transition-all shadow-sm">
                <FcGoogle className="text-xl" /> {t("continueWithGoogle")}
              </button>
              <button onClick={() => setAuthTab("signin")} className="text-primary text-sm underline w-full text-center">
                Use email instead
              </button>
            </motion.div>
          ) : authTab === "explore" ? (
            <motion.div key="explore" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-4">
              <motion.button onClick={() => navigate("/main")}
                whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl font-bold text-primary-foreground flex items-center justify-center gap-2 shadow-lg text-sm"
                style={{ background: "var(--gradient-primary)", boxShadow: "0 8px 32px hsl(221 83% 50% / 0.35)" }}>
                Get Started <FaArrowRight />
              </motion.button>
              <p className="text-sidebar-foreground/50 text-xs text-center">
                Browse anonymously or{" "}
                <button onClick={() => setAuthTab("signin")} className="text-primary underline">sign in</button>
                {" / "}
                <button onClick={() => setAuthTab("google")} className="text-primary underline">Google</button>
                {" "}to save your reports.
              </p>
            </motion.div>
          ) : (
            <motion.form key="signin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              onSubmit={handleEmailAuth} className="space-y-3">
              <button type="button" onClick={handleGoogleSignIn} disabled={authLoading}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 bg-card text-foreground border border-border hover:bg-muted transition-all shadow-sm">
                <FcGoogle className="text-lg" /> {t("continueWithGoogle")}
              </button>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-sidebar-border" />
                <span className="text-xs text-sidebar-foreground/40">OR</span>
                <div className="flex-1 h-px bg-sidebar-border" />
              </div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={t("email")}
                className="w-full px-4 py-3 rounded-xl bg-sidebar-accent/30 border border-sidebar-border text-sidebar-foreground text-sm placeholder:text-sidebar-foreground/30 focus:outline-none focus:border-primary/50 transition-all" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={t("password")}
                className="w-full px-4 py-3 rounded-xl bg-sidebar-accent/30 border border-sidebar-border text-sidebar-foreground text-sm placeholder:text-sidebar-foreground/30 focus:outline-none focus:border-primary/50 transition-all" />
              <button type="submit" disabled={authLoading}
                className="w-full py-3 rounded-xl font-semibold text-sm text-primary-foreground transition-all"
                style={{ background: "var(--gradient-primary)" }}>
                {authLoading ? "..." : isSignUp ? t("createAccount") : t("signIn")}
              </button>
              <p className="text-sidebar-foreground/50 text-xs text-center">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-primary underline">
                  {isSignUp ? t("signIn") : t("createAccount")}
                </button>
              </p>
            </motion.form>
          )}
        </AnimatePresence>

        {user && (
          <div className="mt-4 text-center">
            <p className="text-sidebar-foreground/50 text-xs">Signed in as {user.email}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
