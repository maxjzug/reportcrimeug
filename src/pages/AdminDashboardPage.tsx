import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  FaUsers, FaUserShield, FaClipboardList, FaExclamationTriangle,
  FaCheckCircle, FaChartBar, FaSync, FaTimes, FaBell, FaCog,
  FaMapMarkerAlt, FaDownload, FaUserPlus, FaCrown, FaFileAlt,
} from "react-icons/fa";

function formatNumber(val: number) {
  try { return val.toLocaleString(); } catch { return String(val); }
}

function formatDate(d: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleString(); } catch { return "—"; }
}

interface Report {
  id: string;
  category: string;
  location: string | null;
  status: string;
  created_at: string;
  user_id: string | null;
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0, pendingRequests: 0, resolvedRequests: 0,
    rejectedRequests: 0, totalAdmins: 0, totalReports: 0, missingPersons: 0,
  });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastType, setBroadcastType] = useState("info");
  const channelRef = useRef<any>(null);

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
        safeCount(supabase.from("crime_reports").select("*", { count: "exact", head: true }).eq("status", "rejected")),
        safeCount(supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin")),
        safeCount(supabase.from("crime_reports").select("*", { count: "exact", head: true })),
        safeCount(supabase.from("missing_persons").select("*", { count: "exact", head: true }).eq("status", "missing")),
      ]);
      setStats({
        totalUsers: counts[0], pendingRequests: counts[1],
        resolvedRequests: counts[2], rejectedRequests: counts[3],
        totalAdmins: counts[4], totalReports: counts[5], missingPersons: counts[6],
      });

      const { data: repData } = await supabase
        .from("crime_reports")
        .select("id, category, location, status, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(8);
      setRecentReports((repData as Report[]) || []);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime
  useEffect(() => {
    if (channelRef.current) return;
    const channel = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "crime_reports" }, () => fetchData())
      .subscribe();
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); channelRef.current = null; };
  }, [fetchData]);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const handleBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;
    try {
      const { data: users } = await supabase.from("profiles").select("user_id");
      if (!users?.length) { toast({ title: "No users found", variant: "destructive" }); return; }
      const rows = users.map((u: any) => ({
        user_id: u.user_id, title: broadcastTitle, message: broadcastMsg, type: broadcastType,
      }));
      await supabase.from("notifications").insert(rows);
      toast({ title: `Notification sent to ${rows.length} user(s)!` });
      setShowBroadcast(false);
      setBroadcastTitle(""); setBroadcastMsg("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleApprove = async (id: string) => {
    await supabase.from("crime_reports").update({
      status: "resolved", reviewed_by: user?.id, reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    toast({ title: "Report approved" });
    fetchData();
  };

  const handleReject = async (id: string) => {
    await supabase.from("crime_reports").update({
      status: "rejected", reviewed_by: user?.id, reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    toast({ title: "Report rejected" });
    fetchData();
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

  const resolveRate = stats.totalReports > 0 ? Math.round((stats.resolvedRequests / stats.totalReports) * 100) : 0;

  const STAT_CARDS = [
    { icon: FaUsers, label: "Total Users", value: stats.totalUsers, color: "hsl(221, 83%, 53%)" },
    { icon: FaClipboardList, label: "Pending", value: stats.pendingRequests, color: "hsl(38, 92%, 50%)" },
    { icon: FaCheckCircle, label: "Resolved", value: stats.resolvedRequests, color: "hsl(160, 84%, 39%)" },
    { icon: FaChartBar, label: "Total Reports", value: stats.totalReports, color: "hsl(263, 70%, 50%)" },
    { icon: FaUserShield, label: "Admins", value: stats.totalAdmins, color: "hsl(192, 91%, 36%)" },
    { icon: FaExclamationTriangle, label: "Missing Persons", value: stats.missingPersons, color: "hsl(0, 84%, 60%)" },
  ];

  const QUICK_ACTIONS = [
    { icon: FaUsers, title: "Manage Users", desc: "View & manage all users", color: "hsl(221, 83%, 53%)", route: "/admin/manage-users" },
    { icon: FaUserShield, title: "Manage Admins", desc: "Add or remove admin roles", color: "hsl(263, 70%, 50%)", route: "/admin/manage-admins" },
    { icon: FaClipboardList, title: "Pending Requests", desc: "Review pending reports", color: "hsl(38, 92%, 50%)", route: "/admin/pending-requests" },
    { icon: FaBell, title: "Broadcast", desc: "Send notification to all", color: "hsl(330, 81%, 60%)", action: () => setShowBroadcast(true) },
    { icon: FaMapMarkerAlt, title: "Stations", desc: "Manage police stations", color: "hsl(160, 84%, 39%)", route: "/search-stations" },
    { icon: FaFileAlt, title: "All Reports", desc: "View all crime reports", color: "hsl(25, 95%, 53%)", route: "/admin/pending-requests" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
            <FaCrown className="text-yellow-500" /> Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Full control over users, reports, and system.</p>
        </div>
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

      {/* Resolution Rate */}
      <div className="p-4 rounded-lg bg-card border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">📊 Report Resolution Rate</span>
          <span className="text-lg font-bold text-primary">{resolveRate}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${resolveRate}%`, background: "var(--gradient-primary)" }} />
        </div>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span>Pending: {stats.pendingRequests}</span>
          <span>Resolved: {stats.resolvedRequests}</span>
          <span>Rejected: {stats.rejectedRequests}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3" style={{ fontFamily: "var(--font-display)" }}>⚡ Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.button key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => a.route ? navigate(a.route) : a.action?.()}
                className="p-3 rounded-lg bg-card border border-border text-left hover:shadow-md hover:border-primary/30 transition-all">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: a.color + "15", color: a.color }}>
                  <Icon className="text-sm" />
                </div>
                <p className="text-xs font-semibold text-foreground">{a.title}</p>
                <p className="text-[10px] text-muted-foreground">{a.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>📋 Recent Reports</h2>
          <button onClick={() => navigate("/admin/pending-requests")} className="text-xs text-primary font-medium hover:underline">
            View all →
          </button>
        </div>
        <div className="divide-y divide-border">
          {recentReports.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No reports yet.</p>
          ) : (
            recentReports.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{r.category}</p>
                  <p className="text-xs text-muted-foreground truncate">📍 {r.location || "Unknown"}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDate(r.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    r.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    r.status === "resolved" ? "bg-green-100 text-green-800" :
                    "bg-red-100 text-red-800"
                  }`}>{r.status}</span>
                  {r.status === "pending" && (
                    <div className="flex gap-1">
                      <button onClick={() => handleApprove(r.id)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium hover:bg-green-200">
                        ✓
                      </button>
                      <button onClick={() => handleReject(r.id)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-medium hover:bg-red-200">
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
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
              placeholder="Message" rows={3} className="w-full p-3 rounded-lg border border-border bg-background text-foreground text-sm mb-3 focus:outline-none focus:border-primary" />
            <select value={broadcastType} onChange={(e) => setBroadcastType(e.target.value)}
              className="w-full p-3 rounded-lg border border-border bg-background text-foreground text-sm mb-4">
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="alert">Alert / Emergency</option>
            </select>
            <button onClick={handleBroadcast}
              className="w-full py-3 rounded-lg font-semibold text-sm text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}>Send to All Users</button>
          </div>
        </div>
      )}
    </div>
  );
}
