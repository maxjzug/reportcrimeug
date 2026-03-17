import { useNavigate } from "react-router-dom";
import { FaCog, FaBell, FaGlobe, FaMoon, FaUser, FaChevronRight, FaSignOutAlt, FaCrown, FaSignInAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { useState } from "react";

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  const { t, lang, setLang, langNames, allLangs } = useLang();
  const [showLangPicker, setShowLangPicker] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/home", { replace: true });
  };

  const SETTINGS = [
    { icon: FaUser, label: t("profile"), desc: user?.email || "Update your personal information", color: "hsl(221, 83%, 53%)", action: () => navigate("/auth") },
    { icon: FaBell, label: t("notifications"), desc: "Manage push & email notifications", color: "hsl(38, 92%, 50%)", action: () => navigate("/notifications") },
    { icon: FaGlobe, label: t("language"), desc: langNames[lang], color: "hsl(160, 84%, 39%)", action: () => setShowLangPicker(!showLangPicker) },
    { icon: FaMoon, label: t("appearance"), desc: "Light / Dark / System theme", color: "hsl(263, 70%, 50%)", action: () => {} },
  ];

  return (
    <div className="max-w-lg mx-auto">
      {/* Profile Card */}
      {user ? (
        <div className="mb-6 p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-primary-foreground overflow-hidden shrink-0"
              style={{ background: "var(--gradient-primary)" }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                (profile?.display_name?.[0] || user.email?.[0]?.toUpperCase() || "U")
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground truncate">{profile?.display_name || user.email?.split("@")[0]}</p>
                {isAdmin && (
                  <span className="text-[9px] font-bold text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <FaCrown className="text-[7px]" /> Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {isAdmin && (
              <button onClick={() => navigate("/admin")}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-primary-foreground transition-all hover:opacity-90"
                style={{ background: "var(--gradient-primary)" }}>
                Admin Panel
              </button>
            )}
            <button onClick={handleSignOut}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 hover:bg-destructive/15 transition-all flex items-center justify-center gap-1.5">
              <FaSignOutAlt className="text-[10px]" /> Sign Out
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => navigate("/auth")}
          className="w-full mb-6 p-4 rounded-2xl bg-card border border-border flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-primary"
            style={{ backgroundColor: "hsl(221 83% 53% / 0.1)" }}>
            <FaSignInAlt className="text-lg" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Sign In / Create Account</p>
            <p className="text-xs text-muted-foreground">Sign in to save your reports</p>
          </div>
          <FaChevronRight className="text-xs text-muted-foreground" />
        </button>
      )}

      <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>{t("settings")}</h1>
      <p className="text-sm text-muted-foreground mb-6">Manage your account and preferences.</p>

      <div className="space-y-2">
        {SETTINGS.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i}>
              <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} onClick={item.action}
                className="w-full p-4 rounded-xl bg-card border border-border flex items-center gap-4 hover:shadow-md transition-all text-left">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: item.color + "15", color: item.color }}>
                  <Icon className="text-lg" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <FaChevronRight className="text-xs text-muted-foreground" />
              </motion.button>

              {item.label === t("language") && showLangPicker && (
                <div className="mt-1 p-2 rounded-xl bg-card border border-border">
                  {allLangs.map((l) => (
                    <button key={l} onClick={() => { setLang(l); setShowLangPicker(false); }}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                        lang === l ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted"
                      }`}>{langNames[l]}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
