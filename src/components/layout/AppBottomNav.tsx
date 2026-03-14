import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaGavel, FaHandsHelping, FaBell, FaCog } from "react-icons/fa";
import { useLang } from "@/contexts/LanguageContext";

const ITEMS = [
  { key: "dashboard", icon: FaHome, route: "/main" },
  { key: "reportCrime", icon: FaGavel, route: "/report-crime" },
  { key: "getHelp", icon: FaHandsHelping, route: "/get-help" },
  { key: "notifications", icon: FaBell, route: "/notifications" },
  { key: "settings", icon: FaCog, route: "/settings" },
];

export function AppBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around h-16 bg-card border-t border-border md:hidden">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.route;
        return (
          <button key={item.key} onClick={() => navigate(item.route)}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}>
            <Icon className="text-lg" />
            <span className="text-[10px] font-medium">{t(item.key)}</span>
          </button>
        );
      })}
    </nav>
  );
}
