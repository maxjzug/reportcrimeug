import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  FaUsers, FaUserShield, FaClipboardList, FaExclamationTriangle,
  FaCheckCircle, FaChartBar, FaSync, FaTimes, FaBell,
} from "react-icons/fa";

function formatNumber(val: number) {
  try { return val.toLocaleString(); } catch { return String(val); }
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0, pendingRequests: 0, resolvedRequests: 0,
    totalAdmins: 0, totalReports: 0, missingPersons: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");

  const safeCount = async (query: any) => {
    try {
      const res = await query;
      return typeof res?.count === "number" ? res.count : 0;
    } catch { return 0; }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const counts = await Promise.all([
        safeCount(supabase.from("profiles").select("*", { count: "exact", head: true })),
        safeCount(supabase.from("crime_reports").select("*", { count: "exact", head: true }).eq("status", "pending")),
        safeCount(supabase.from("crime_reports").select("*", { count: "exact", head: true }).eq("status", "resolved")),
        safeCount(supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin")),
        safeCount(supabase.from("crime_reports").select("*", { count: "exact", head: true })),
        safeCount(supabase.from("missing_persons").select("*", { count: "exact", head: true }).eq("status", "missing")),
      ]);
      setStats({
        totalUsers: counts[0], pendingRequests: counts[1],
        resolvedRequests: counts[2], totalAdmins: counts[3],
        totalReports: counts[4], missingPersons: counts[5],
      });
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const handleBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;
    try {
      const { data: users } = await supabase.from("profiles").select("user_id");
      if (!users?.length) { toast({ title: "No users found", variant: "destructive" }); return; }
      const rows = users.map((u: any) => ({ user_id: u.user_id, title: broadcastTitle, message: broadcastMsg }));
      await supabase.from("notifications").insert(rows);
      toast({ title: `Notification sent to ${rows.length} user(s)!` });
      setShowBroadcast(false);
      setBroadcastTitle(""); setBroadcastMsg("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Access denied. Admin only.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const STAT_CARDS = [
    { icon: FaUsers, label: "Total Users", value: stats.totalUsers, color: "hsl(221, 83%, 53%)" },
    { icon: FaClipboardList, label: "Pending", value: stats.pendingRequests, color: "hsl(38, 92%, 50%)" },
    { icon: FaCheckCircle, label: "Resolved", value: stats.resolvedRequests, color: "hsl(160, 84%, 39%)" },
    { icon: FaChartBar, label: "Total Reports", value: stats.totalReports, color: "hsl(263, 70%, 50%)" },
    { icon: FaUserShield, label: "Admins", value: stats.totalAdmins, color: "hsl(192, 91%, 36%)" },
    { icon: FaExclamationTriangle, label: "Missing Persons", value: stats.missingPersons, color: "hsl(0, 84%, 60%)" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Admin Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowBroadcast(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}>
            <FaBell className="text-xs" /> Broadcast
          </button>
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors">
            <FaSync className={`text-xs ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.color + "15", color: card.color }}>
                  <Icon className="text-lg" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(card.value)}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Broadcast Modal */}
      {showBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>Broadcast Notification</h2>
              <button onClick={() => setShowBroadcast(false)}><FaTimes className="text-muted-foreground" /></button>
            </div>
            <input type="text" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="Title" className="w-full p-3 rounded-lg border border-border bg-background text-foreground text-sm mb-3 focus:outline-none focus:border-primary" />
            <textarea value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)}
              placeholder="Message" rows={3} className="w-full p-3 rounded-lg border border-border bg-background text-foreground text-sm mb-4 focus:outline-none focus:border-primary" />
            <button onClick={handleBroadcast}
              className="w-full py-3 rounded-lg font-semibold text-sm text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}>Send to All Users</button>
          </div>
        </div>
      )}
    </div>
  );
}
