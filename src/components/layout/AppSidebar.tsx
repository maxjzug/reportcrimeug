import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes, FaHome, FaGavel, FaHandsHelping, FaSearch,
  FaUserFriends, FaMapMarkerAlt, FaBook, FaCog, FaBell,
  FaSignOutAlt, FaShieldAlt, FaCrown,
} from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";

const NAV_ITEMS = [
  { key: "dashboard", icon: FaHome, route: "/main" },
  { key: "reportCrime", icon: FaGavel, route: "/report-crime" },
  { key: "getHelp", icon: FaHandsHelping, route: "/get-help" },
  { key: "lostAndFound", icon: FaSearch, route: "/lost-and-found" },
  { key: "missingPersons", icon: FaUserFriends, route: "/missing-persons" },
  { key: "searchStations", icon: FaMapMarkerAlt, route: "/search-stations" },
  { key: "lawsAndRights", icon: FaBook, route: "/laws-and-rights" },
  { key: "settings", icon: FaCog, route: "/settings" },
  { key: "notifications", icon: FaBell, route: "/notifications" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isAdmin, signOut } = useAuth();
  const { t } = useLang();

  const handleNav = (route: string) => {
    navigate(route);
    onClose();
  };

  const allItems = isAdmin
    ? [{ key: "admin", icon: FaCrown, route: "/admin" }, ...NAV_ITEMS]
    : NAV_ITEMS;

  const renderNavItems = (items: typeof allItems) =>
    items.map((item) => {
      const Icon = item.icon;
      const active = location.pathname === item.route || (item.route === "/admin" && location.pathname.startsWith("/admin"));
      return (
        <button key={item.key} onClick={() => handleNav(item.route)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            active ? "bg-sidebar-accent text-sidebar-primary-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          }`}>
          <Icon className="text-sm" />
          {item.key === "admin" ? "Admin Dashboard" : t(item.key)}
        </button>
      );
    });

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0">
        <div className="flex items-center gap-2 px-4 h-14 border-b border-sidebar-border">
          <FaShieldAlt className="text-primary text-lg" />
          <span className="font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>ReportCrime</span>
        </div>
        {user && (
          <div className="px-3 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground overflow-hidden shrink-0"
                style={{ background: "var(--gradient-primary)" }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  (profile?.display_name?.[0] || user.email?.[0]?.toUpperCase() || "U")
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{profile?.display_name || user.email?.split("@")[0]}</p>
                <p className="text-[10px] text-sidebar-foreground/40 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {renderNavItems(allItems)}
        </nav>
        {user && (
          <div className="p-3 border-t border-sidebar-border">
            <button onClick={async () => { await signOut(); navigate("/home"); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all">
              <FaSignOutAlt className="text-sm" />
              {t("signOut")}
            </button>
          </div>
        )}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40" onClick={onClose} />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-sidebar text-sidebar-foreground z-50 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-4 h-14 border-b border-sidebar-border">
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-primary text-lg" />
                  <span className="font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>ReportCrime</span>
                </div>
                <button onClick={onClose} className="text-sidebar-foreground/60 hover:text-sidebar-foreground">
                  <FaTimes />
                </button>
              </div>

              {user && (
                <div className="px-4 py-4 border-b border-sidebar-border">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-primary-foreground mb-2 overflow-hidden"
                    style={{ background: "var(--gradient-primary)" }}>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      (profile?.display_name?.[0] || user.email?.[0]?.toUpperCase() || "U")
                    )}
                  </div>
                  <p className="text-sm font-semibold">{profile?.display_name || user.email}</p>
                  <p className="text-xs text-sidebar-foreground/50">{user.email}</p>
                </div>
              )}

              <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
                {renderNavItems(allItems)}
              </nav>

              {user && (
                <div className="p-3 border-t border-sidebar-border">
                  <button onClick={async () => { await signOut(); navigate("/home"); onClose(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground text-sm font-medium transition-all">
                    <FaSignOutAlt className="text-sm" />
                    {t("signOut")}
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
