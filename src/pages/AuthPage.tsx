import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaEnvelope, FaLock, FaUser, FaSignOutAlt, FaArrowLeft } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useLang } from "@/contexts/LanguageContext";

export function AuthPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { user, isAdmin, profile, signOut } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Don't redirect - show profile view instead
    }
  }, [user, isAdmin, navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    if (isSignUp) {
      if (password.length < 6) {
        toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: window.location.origin + "/main",
          data: { full_name: displayName || email.split("@")[0] },
        },
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check your email", description: "We sent a confirmation link to verify your account." });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        // Wait briefly for auth context to update, then redirect based on role
        setTimeout(() => {
          navigate("/main", { replace: true });
        }, 100);
      }
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/home", { replace: true });
  };

  // If user is logged in, show profile view
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ background: "hsl(222 47% 8%)" }}>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(210 40% 98%) 1px, transparent 0)", backgroundSize: "32px 32px" }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm relative z-10">
          
          <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-white/40 text-sm hover:text-white/60 transition-colors">
            <FaArrowLeft className="text-xs" /> Back
          </button>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-primary-foreground overflow-hidden shrink-0"
                style={{ background: "var(--gradient-primary)" }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-2xl object-cover" />
                ) : (
                  (profile?.display_name?.[0] || user.email?.[0]?.toUpperCase() || "U")
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white truncate">{profile?.display_name || user.email?.split("@")[0]}</h2>
                <p className="text-sm text-white/50 truncate">{user.email}</p>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>
            </div>

            {isAdmin && (
              <button onClick={() => navigate("/admin")}
                className="w-full py-3 rounded-xl font-semibold text-sm text-primary-foreground mb-3 transition-all hover:opacity-90"
                style={{ background: "var(--gradient-primary)" }}>
                Go to Admin Dashboard
              </button>
            )}

            <button onClick={() => navigate("/main")}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-white/10 border border-white/10 mb-3 hover:bg-white/15 transition-all">
              Go to Dashboard
            </button>

            <button onClick={handleSignOut}
              className="w-full py-3 rounded-xl font-semibold text-sm text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2">
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "hsl(222 47% 8%)" }}>
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(210 40% 98%) 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"
            style={{ background: "var(--gradient-primary)" }}>
            <FaShieldAlt className="text-white text-xl" />
          </div>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
            ReportCrime Uganda
          </h1>
          <p className="text-sm text-white/50 mt-1">
            {isSignUp ? "Create your account" : "Welcome back"}
          </p>
        </div>

        {/* Google */}
        <button onClick={handleGoogleSignIn} disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 bg-white text-gray-800 hover:bg-gray-50 transition-all shadow-lg mb-4">
          <FcGoogle className="text-xl" /> Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {isSignUp && (
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 text-sm" />
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
          )}
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 text-sm" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 text-sm" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all shadow-lg hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--gradient-primary)" }}>
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="text-white/40 text-xs text-center mt-4">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-medium hover:underline">
            {isSignUp ? "Sign In" : "Create Account"}
          </button>
        </p>

        <button onClick={() => navigate("/home")} className="text-white/30 text-xs w-full text-center mt-3 hover:text-white/50 transition-colors flex items-center justify-center gap-1">
          <FaArrowLeft className="text-[10px]" /> Back to home
        </button>
      </motion.div>
    </div>
  );
}
