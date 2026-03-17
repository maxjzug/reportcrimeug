import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaShieldAlt, FaArrowRight, FaGavel, FaHandsHelping, FaSignOutAlt, FaCrown } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function HomePage() {
  const navigate = useNavigate();
  const { user, isAdmin, profile, signOut } = useAuth();
  const [authTab, setAuthTab] = useState<"explore" | "signin" | "google">("explore");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
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
        navigate(isAdmin ? "/admin" : "/main");
      }
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out successfully" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "hsl(222 47% 8%)" }}>
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(210 40% 98%) 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="text-center mb-6 relative z-10">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          style={{ background: "var(--gradient-primary)" }}>
          <FaShieldAlt className="text-white text-2xl" />
        </div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
          ReportCrime Uganda
        </h1>
        <p className="text-sm text-white/60 mt-1">
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
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Icon className="text-primary text-sm" />
              <span className="text-xs font-medium text-white/70">{item.label}</span>
            </div>
          );
        })}
      </motion.div>

      {/* Card wrapper */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-sm relative z-10">

        {/* If logged in, show user panel */}
        {user ? (
          <div className="space-y-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-primary-foreground overflow-hidden shrink-0"
                style={{ background: "var(--gradient-primary)" }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  (profile?.display_name?.[0] || user.email?.[0]?.toUpperCase() || "U")
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{profile?.display_name || user.email?.split("@")[0]}</p>
                <p className="text-xs text-white/40 truncate">{user.email}</p>
              </div>
              {isAdmin && (
                <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full flex items-center gap-1">
                  <FaCrown className="text-[8px]" /> Admin
                </span>
              )}
            </div>

            <motion.button onClick={() => navigate(isAdmin ? "/admin" : "/main")}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl font-bold text-primary-foreground flex items-center justify-center gap-2 shadow-lg text-sm"
              style={{ background: "var(--gradient-primary)", boxShadow: "0 8px 32px hsl(221 83% 50% / 0.35)" }}>
              {isAdmin ? "Admin Dashboard" : "Go to Dashboard"} <FaArrowRight />
            </motion.button>

            {isAdmin && (
              <button onClick={() => navigate("/main")}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                User Dashboard
              </button>
            )}

            <button onClick={handleSignOut}
              className="w-full py-3 rounded-xl font-semibold text-sm text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-all flex items-center justify-center gap-2">
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-white/5 mb-4">
              <button onClick={() => setAuthTab("explore")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  authTab === "explore" ? "bg-white/10 text-white shadow" : "text-white/50 hover:text-white/70"
                }`}>Explore</button>
              <button onClick={() => setAuthTab("signin")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  authTab === "signin" ? "bg-white/10 text-white shadow" : "text-white/50 hover:text-white/70"
                }`}>Sign In</button>
              <button onClick={() => setAuthTab("google")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  authTab === "google" ? "bg-white/10 text-white shadow" : "text-white/50 hover:text-white/70"
                }`}>
                <FcGoogle className="text-sm" /> Google
              </button>
            </div>

            <AnimatePresence mode="wait">
              {authTab === "google" ? (
                <motion.div key="google" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-4">
                  <p className="text-white/60 text-sm text-center">Sign in with your Google account</p>
                  <button onClick={handleGoogleSignIn} disabled={authLoading}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 bg-white text-gray-800 hover:bg-gray-50 transition-all shadow-sm">
                    <FcGoogle className="text-xl" /> Continue with Google
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
                  <p className="text-white/40 text-xs text-center">
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
                    className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 bg-white text-gray-800 hover:bg-gray-50 transition-all shadow-sm">
                    <FcGoogle className="text-lg" /> Continue with Google
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-white/30">OR</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-all" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-all" />
                  <button type="submit" disabled={authLoading}
                    className="w-full py-3 rounded-xl font-semibold text-sm text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--gradient-primary)" }}>
                    {authLoading ? "..." : isSignUp ? "Create Account" : "Sign In"}
                  </button>
                  <p className="text-white/40 text-xs text-center">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-primary underline">
                      {isSignUp ? "Sign In" : "Create Account"}
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </div>
  );
}
