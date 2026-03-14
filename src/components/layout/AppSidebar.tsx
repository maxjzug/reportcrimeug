import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes, FaHome, FaGavel, FaHandsHelping, FaSearch,
  FaUserFriends, FaMapMarkerAlt, FaBook, FaCog, FaBell,
  FaSignOutAlt, FaShieldAlt,
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
  const { user, profile, signOut } = useAuth();
  const { t } = useLang();

  const handleNav = (route: string) => {
    navigate(route);
    onClose();
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0">
        <div className="flex items-center gap-2 px-4 h-14 border-b border-sidebar-border">
          <FaShieldAlt className="text-primary text-lg" />
          <span className="font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>ReportCrime</span>
        </div>
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.route;
            return (
              <button key={item.key} onClick={() => handleNav(item.route)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active ? "bg-sidebar-accent text-sidebar-primary-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}>
                <Icon className="text-sm" />
                {t(item.key)}
              </button>
            );
          })}
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
              className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />
            <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-sidebar text-sidebar-foreground z-50 flex flex-col md:hidden shadow-2xl">
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
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-primary-foreground mb-2"
                    style={{ background: "var(--gradient-primary)" }}>
                    {profile?.display_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <p className="text-sm font-semibold">{profile?.display_name || user.email}</p>
                  <p className="text-xs text-sidebar-foreground/50">{user.email}</p>
                </div>
              )}

              <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.route;
                  return (
                    <button key={item.key} onClick={() => handleNav(item.route)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active ? "bg-sidebar-accent text-sidebar-primary-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }`}>
                      <Icon className="text-sm" />
                      {t(item.key)}
                    </button>
                  );
                })}
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
