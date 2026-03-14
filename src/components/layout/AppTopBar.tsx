import { useNavigate } from "react-router-dom";
import { FaBars, FaBell, FaShieldAlt } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";

interface TopBarProps {
  onMenuClick: () => void;
}

export function AppTopBar({ onMenuClick }: TopBarProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        {user && (
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                profile?.display_name?.[0] || user.email?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <span className="text-sm font-semibold text-foreground hidden sm:block">
              {profile?.display_name || user.email?.split("@")[0]}
            </span>
          </button>
        )}
        {!user && (
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-primary text-lg" />
            <span className="font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>ReportCrime</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/notifications")}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
          <FaBell className="text-sm" />
        </button>
        <button onClick={onMenuClick}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors md:hidden">
          <FaBars className="text-sm" />
        </button>
      </div>
    </header>
  );
}
