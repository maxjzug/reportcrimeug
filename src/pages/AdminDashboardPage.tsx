import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers, FaUserShield, FaClipboardList, FaExclamationTriangle,
  FaCheckCircle, FaChartBar, FaSync, FaTimes, FaBell, FaCog,
  FaMapMarkerAlt, FaUserPlus, FaCrown, FaFileAlt, FaDatabase,
  FaToggleOn, FaToggleOff, FaArrowLeft, FaHistory, FaSignOutAlt,
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

interface RecentUser {
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, sub, color, onClick, index }: {
  icon: any; label: string; value: number; sub?: string; color: string; onClick?: () => void; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`relative p-5 rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 ${onClick ? "cursor-pointer hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5" : ""}`}
    >
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6" style={{ background: color }} />
      <div className="relative flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "18", color }}>
          <Icon className="text-lg" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-black text-foreground leading-tight">{formatNumber(value)}</p>
          {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Action Card ── */
function ActionCard({ icon: Icon, title, desc, color, onClick, badge }: {
  icon: any; title: string; desc: string; color: string; onClick?: () => void; badge?: number;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative p-4 rounded-2xl bg-card border border-border text-left hover:shadow-md hover:border-primary/30 transition-all w-full"
    >
      {!!badge && badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: color + "18", color }}>
        <Icon className="text-sm" />
      </div>
      <p className="text-xs font-bold text-foreground">{title}</p>
      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{desc}</p>
    </motion.button>
  );
}

/* ── Broadcast Modal ── */
function BroadcastModal({ onClose, onSend }: { onClose: () => void; onSend: (t: string, m: string, ty: string) => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try { await onSend(title.trim(), message.trim(), type); } finally { setSending(false); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center">
              <FaBell className="text-pink-500" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground" style={{ fontFamily: "var(--font-display)" }}>Broadcast</h2>
              <p className="text-[10px] text-muted-foreground">Send to all users</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"><FaTimes /></button>
        </div>
        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
            className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary" />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" rows={3}
            className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary resize-none" />
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-sm">
            <option value="info">Info</option><option value="success">Success</option>
            <option value="warning">Warning</option><option value="alert">Alert / Emergency</option>
          </select>
        </div>
        <button onClick={handleSend} disabled={sending || !title.trim() || !message.trim()}
          className="w-full mt-4 py-3 rounded-xl font-bold text-sm text-primary-foreground disabled:opacity-50"
          style={{ background: "var(--gradient-primary)" }}>
          {sending ? "Sending…" : "Send to All Users"}
        </button>
      </motion.div>
    </div>
  );
}

/* ── System Panel ── */
function SystemPanel({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState({
    maintenanceMode: false, allowRegistrations: true, requireEmailVerification: true,
    maxReportsPerUser: 50, autoArchiveDays: 90,
  });
  const toggle = (key: string) => setSettings((s: any) => ({ ...s, [key]: !s[key] }));

  const rows = [
    { label: "Maintenance Mode", desc: "Disable all new submissions", key: "maintenanceMode" },
    { label: "New Registrations", desc: "Allow new user signups", key: "allowRegistrations" },
    { label: "Email Verification", desc: "Force email verification", key: "requireEmailVerification" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <FaCog className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground" style={{ fontFamily: "var(--font-display)" }}>System Settings</h2>
              <p className="text-[10px] text-muted-foreground">Environment config</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"><FaTimes /></button>
        </div>
        <div className="divide-y divide-border">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{r.label}</p>
                <p className="text-[10px] text-muted-foreground">{r.desc}</p>
              </div>
              <button onClick={() => toggle(r.key)} className="text-xl">
                {(settings as any)[r.key] ? <FaToggleOn className="text-green-500" /> : <FaToggleOff className="text-muted-foreground" />}
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-muted/50 border border-border">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Reports Limit</label>
            <input type="number" value={settings.maxReportsPerUser}
              onChange={(e) => setSettings(s => ({ ...s, maxReportsPerUser: +e.target.value }))}
              className="w-full mt-1 p-2 rounded-lg border border-border bg-background text-foreground text-sm" />
          </div>
          <div className="p-3 rounded-xl bg-muted/50 border border-border">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Auto-Archive (Days)</label>
            <input type="number" value={settings.autoArchiveDays}
              onChange={(e) => setSettings(s => ({ ...s, autoArchiveDays: +e.target.value }))}
              className="w-full mt-1 p-2 rounded-lg border border-border bg-background text-foreground text-sm" />
          </div>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
          <FaExclamationTriangle className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Settings are session-scoped. Connect a config table for persistence.</p>
        </div>
        <button onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl font-bold text-sm text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}>Save & Close</button>
      </motion.div>
    </div>
  );
}

/* ══════════ MAIN ADMIN DASHBOARD ══════════ */
export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin, profile, signOut } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0, pendingRequests: 0, resolvedRequests: 0,
    rejectedRequests: 0, totalAdmins: 0, totalReports: 0, missingPersons: 0,
  });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showSystem, setShowSystem] = useState(false);
  const channelRef = useRef<any>(null);

  const safeCount = async (query: any) => {
    try { const res = await query; return typeof res?.count === "number" ? res.count : 0; } catch { return 0; }
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
        totalUsers: counts[0], pendingRequests: counts[1], resolvedRequests: counts[2],
        rejectedRequests: counts[3], totalAdmins: counts[4], totalReports: counts[5], missingPersons: counts[6],
      });

      const { data: repData } = await supabase.from("crime_reports")
        .select("id, category, location, status, created_at, user_id")
        .order("created_at", { ascending: false }).limit(8);
      setRecentReports((repData as Report[]) || []);

      const { data: userData } = await supabase.from("profiles")
        .select("user_id, display_name, email, avatar_url, is_active, created_at")
        .order("created_at", { ascending: false }).limit(5);
      setRecentUsers((userData as RecentUser[]) || []);
    } catch (err) { console.error("Admin fetch error:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (channelRef.current) return;
    const channel = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "crime_reports" }, () => fetchData())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, () => fetchData())
      .subscribe();
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); channelRef.current = null; };
  }, [fetchData]);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const handleBroadcast = async (title: string, message: string, type: string) => {
    try {
      const { data: users } = await supabase.from("profiles").select("user_id");
      if (!users?.length) { toast({ title: "No users found", variant: "destructive" }); return; }
      const rows = users.map((u: any) => ({ user_id: u.user_id, title, message, type }));
      await supabase.from("notifications").insert(rows);
      toast({ title: `Notification sent to ${rows.length} user(s)!` });
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const handleApprove = async (id: string) => {
    await supabase.from("crime_reports").update({ status: "resolved", reviewed_by: user?.id, reviewed_at: new Date().toISOString() }).eq("id", id);
    toast({ title: "Report approved" }); fetchData();
  };

  const handleReject = async (id: string) => {
    await supabase.from("crime_reports").update({ status: "rejected", reviewed_by: user?.id, reviewed_at: new Date().toISOString() }).eq("id", id);
    toast({ title: "Report rejected" }); fetchData();
  };

  const handleToggleUser = async (userId: string, current: boolean) => {
    await supabase.from("profiles").update({ is_active: !current }).eq("user_id", userId);
    toast({ title: `User ${current ? "deactivated" : "activated"}` }); fetchData();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/home", { replace: true });
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">Access denied. Admin only.</p>
        <button onClick={() => navigate("/main")} className="text-sm text-primary hover:underline">← Back to Dashboard</button>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  const resolveRate = stats.totalReports > 0 ? Math.round((stats.resolvedRequests / stats.totalReports) * 100) : 0;

  const STAT_CARDS = [
    { icon: FaUsers, label: "Total Users", value: stats.totalUsers, sub: "Registered accounts", color: "hsl(221, 83%, 53%)" },
    { icon: FaClipboardList, label: "Pending", value: stats.pendingRequests, sub: "Awaiting review", color: "hsl(38, 92%, 50%)" },
    { icon: FaCheckCircle, label: "Resolved", value: stats.resolvedRequests, sub: `${resolveRate}% rate`, color: "hsl(160, 84%, 39%)" },
    { icon: FaChartBar, label: "Total Reports", value: stats.totalReports, sub: "All time", color: "hsl(263, 70%, 50%)" },
    { icon: FaUserShield, label: "Admins", value: stats.totalAdmins, sub: "System admins", color: "hsl(192, 91%, 36%)" },
    { icon: FaExclamationTriangle, label: "Missing Persons", value: stats.missingPersons, sub: "Active cases", color: "hsl(0, 84%, 60%)" },
  ];

  const QUICK_ACTIONS = [
    { icon: FaUsers, title: "Manage Users", desc: "View & manage all users", color: "hsl(221, 83%, 53%)", route: "/admin/manage-users", badge: stats.totalUsers },
    { icon: FaUserShield, title: "Manage Admins", desc: "Add or remove admin roles", color: "hsl(263, 70%, 50%)", route: "/admin/manage-admins" },
    { icon: FaClipboardList, title: "Pending Requests", desc: "Review pending reports", color: "hsl(38, 92%, 50%)", route: "/admin/pending-requests", badge: stats.pendingRequests },
    { icon: FaFileAlt, title: "All Reports", desc: "View all submitted reports", color: "hsl(200, 80%, 50%)", route: "/admin/pending-requests", badge: stats.totalReports },
    { icon: FaBell, title: "Broadcast", desc: "Send notification to all", color: "hsl(330, 81%, 60%)", action: () => setShowBroadcast(true) },
    { icon: FaMapMarkerAlt, title: "Police Stations", desc: "View station locations", color: "hsl(160, 84%, 39%)", route: "/search-stations" },
    { icon: FaCog, title: "System Settings", desc: "Configure platform", color: "hsl(40, 90%, 50%)", action: () => setShowSystem(true) },
    { icon: FaDatabase, title: "Reports Archive", desc: "Browse all records", color: "hsl(280, 60%, 60%)", route: "/admin/pending-requests" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Admin Profile Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-primary-foreground overflow-hidden shrink-0"
          style={{ background: "var(--gradient-primary)" }}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            (profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || "A")
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground truncate">{profile?.display_name || user?.email?.split("@")[0]}</h3>
            <span className="text-[9px] font-bold text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <FaCrown className="text-[7px]" /> Admin
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <button onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-destructive bg-destructive/10 hover:bg-destructive/15 transition-colors">
          <FaSignOutAlt className="text-xs" /> Sign Out
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/main")}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted hover:bg-muted/80 text-foreground transition-colors">
            <FaArrowLeft className="text-sm" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
              <FaCrown className="text-yellow-500" /> Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">Full control over users, reports, and system.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBroadcast(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}>
            <FaBell className="text-xs" /> Broadcast
          </button>
          <button onClick={() => setShowSystem(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-xs font-bold text-foreground bg-card hover:bg-muted transition-colors">
            <FaCog className="text-xs" /> System
          </button>
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors">
            <FaSync className={`text-xs ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {STAT_CARDS.map((card, i) => (
          <StatCard key={i} icon={card.icon} label={card.label} value={card.value} sub={card.sub} color={card.color} index={i}
            onClick={() => navigate(i === 0 ? "/admin/manage-users" : i === 4 ? "/admin/manage-admins" : "/admin/pending-requests")} />
        ))}
      </div>

      {/* Resolution Rate */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-foreground">📊 Report Resolution Rate</span>
          <span className="text-lg font-black text-primary">{resolveRate}%</span>
        </div>
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${resolveRate}%` }} transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full" style={{ background: "var(--gradient-primary)" }} />
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((a, i) => (
            <ActionCard key={i} icon={a.icon} title={a.title} desc={a.desc} color={a.color} badge={a.badge}
              onClick={() => a.route ? navigate(a.route) : a.action?.()} />
          ))}
        </div>
      </div>

      {/* Recent Reports & Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Reports */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FaExclamationTriangle className="text-amber-500" /> Recent Reports
            </h2>
            <button onClick={() => navigate("/admin/pending-requests")} className="text-xs text-primary font-medium hover:underline">View all →</button>
          </div>
          <div className="divide-y divide-border">
            {recentReports.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No reports yet.</p>
            ) : recentReports.slice(0, 5).map((r) => (
              <div key={r.id} className="p-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate capitalize">{r.category}</p>
                  <p className="text-[10px] text-muted-foreground truncate">📍 {r.location || "Unknown"}</p>
                  <p className="text-[9px] text-muted-foreground">{formatDate(r.created_at)}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                    r.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
                    r.status === "resolved" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }`}>{r.status}</span>
                  {r.status === "pending" && (
                    <>
                      <button onClick={() => handleApprove(r.id)} className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 font-bold hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300">✓</button>
                      <button onClick={() => handleReject(r.id)} className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300">✕</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FaUsers className="text-primary" /> Recent Users
            </h2>
            <button onClick={() => navigate("/admin/manage-users")} className="text-xs text-primary font-medium hover:underline">View all →</button>
          </div>
          <div className="divide-y divide-border">
            {recentUsers.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No users yet.</p>
            ) : recentUsers.map((u) => (
              <div key={u.user_id} className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0 overflow-hidden"
                    style={{ background: "var(--gradient-primary)" }}>
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      (u.display_name?.[0] || u.email?.[0] || "U").toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{u.display_name || "Unnamed"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${u.is_active !== false ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}>
                    {u.is_active !== false ? "Active" : "Inactive"}
                  </span>
                  <button onClick={() => handleToggleUser(u.user_id, u.is_active !== false)} className="text-base">
                    {u.is_active !== false ? <FaToggleOn className="text-green-500" /> : <FaToggleOff className="text-muted-foreground" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showBroadcast && <BroadcastModal onClose={() => setShowBroadcast(false)} onSend={handleBroadcast} />}
      </AnimatePresence>
      <AnimatePresence>
        {showSystem && <SystemPanel onClose={() => setShowSystem(false)} />}
      </AnimatePresence>
    </div>
  );
}
