import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FaGavel, FaHandsHelping, FaSearch, FaUserFriends,
  FaMapMarkerAlt, FaBook, FaUserPlus, FaBox, FaTimes, FaCrown,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const CARDS = [
  { key: "report-crime", label: "Report Crime", desc: "Submit crime or complaint reports", route: "/report-crime", icon: FaGavel, color: "hsl(0, 84%, 60%)" },
  { key: "get-help", label: "Get Help", desc: "Contact support & AI assistant", route: "/get-help", icon: FaHandsHelping, color: "hsl(160, 84%, 39%)" },
  { key: "lost-and-found", label: "Lost & Found", desc: "Report or search for lost items", route: "/lost-and-found", icon: FaSearch, color: "hsl(38, 92%, 50%)" },
  { key: "missing-persons", label: "Missing Persons", desc: "View & report missing people", route: "/missing-persons", icon: FaUserFriends, color: "hsl(221, 83%, 53%)" },
  { key: "search-stations", label: "Search Stations", desc: "Find police stations near you", route: "/search-stations", icon: FaMapMarkerAlt, color: "hsl(263, 70%, 50%)" },
  { key: "laws", label: "Laws & Rights", desc: "Browse Ugandan laws & rights", route: "/laws-and-rights", icon: FaBook, color: "hsl(192, 91%, 36%)" },
  { key: "report-missing-person", label: "Report Missing Person", desc: "File a missing person report", route: "/report-missing-person", icon: FaUserPlus, color: "hsl(330, 81%, 60%)" },
  { key: "report-missing-property", label: "Report Missing Property", desc: "Report lost property", route: "/report-missing-property", icon: FaBox, color: "hsl(25, 95%, 53%)" },
];

export function MainDashboardPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState("");

  const filtered = CARDS.filter(
    (c) => !search || c.label.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Admin Panel Link */}
      {isAdmin && (
        <motion.button
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/admin")}
          className="w-full mb-4 p-3 rounded-xl border border-yellow-200 dark:border-yellow-900/30 flex items-center gap-3 transition-all hover:shadow-md"
          style={{ background: "linear-gradient(135deg, hsl(38 92% 50% / 0.08), hsl(45 93% 47% / 0.05))" }}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/30">
            <FaCrown className="text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-foreground">Admin Dashboard</p>
            <p className="text-[10px] text-muted-foreground">Manage users, reports & system settings</p>
          </div>
          <span className="text-xs text-primary font-medium">Open →</span>
        </motion.button>
      )}

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
          <input type="text" placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl py-2.5 pl-10 pr-10 border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition">
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button key={card.key} onClick={() => navigate(card.route)}
              initial={{ opacity: 0, y: 24, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.05 + i * 0.05, duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
              whileHover={{ y: -4, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-xl border border-border bg-card backdrop-blur-sm text-left p-4 transition-shadow duration-300 hover:shadow-lg hover:border-primary/30"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: card.color + "15", color: card.color }}>
                <Icon className="text-lg" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>{card.label}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
