import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { FaUserShield, FaTrash, FaPlus, FaArrowLeft } from "react-icons/fa";

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: { display_name: string | null; email: string | null; avatar_url: string | null };
}

export function ManageAdminsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserId, setNewUserId] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("user_roles")
      .select("id, user_id, role, created_at")
      .eq("role", "admin");
    
    const adminList = (data || []) as AdminUser[];
    // Fetch profiles for each admin
    for (const admin of adminList) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, email, avatar_url")
        .eq("user_id", admin.user_id)
        .single();
      admin.profile = profile as any;
    }
    setAdmins(adminList);
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const addAdmin = async () => {
    if (!newUserId.trim()) return;
    setAdding(true);
    try {
      // Check if user exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", newUserId.trim())
        .single();
      
      if (!profile) {
        toast({ title: "User not found", description: "No user with that ID exists.", variant: "destructive" });
        setAdding(false);
        return;
      }

      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: newUserId.trim(), role: "admin" as any });
      
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Admin added successfully" });
        setNewUserId("");
        fetchAdmins();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setAdding(false);
  };

  const removeAdmin = async (roleId: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Admin removed" });
      fetchAdmins();
    }
  };

  if (!isAdmin) return <p className="text-center text-muted-foreground mt-20">Admin access required.</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
        <FaUserShield className="text-primary" /> Manage Admins
      </h1>

      {/* Add admin */}
      <div className="p-4 rounded-lg bg-card border border-border space-y-3">
        <p className="text-sm font-semibold text-foreground">Add Admin by User ID</p>
        <div className="flex gap-2">
          <input type="text" value={newUserId} onChange={(e) => setNewUserId(e.target.value)}
            placeholder="Paste user ID (UUID)"
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary" />
          <button onClick={addAdmin} disabled={adding}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}>
            <FaPlus className="text-xs" /> Add
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Find user IDs on the Manage Users page.</p>
      </div>

      {/* Admin list */}
      {loading ? (
        <div className="space-y-3">{[0,1].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {admins.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-lg bg-card border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 overflow-hidden"
                style={{ background: "var(--gradient-primary)" }}>
                {a.profile?.avatar_url ? (
                  <img src={a.profile.avatar_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  (a.profile?.display_name?.[0] || "A").toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{a.profile?.display_name || "Admin"}</p>
                <p className="text-xs text-muted-foreground truncate">{a.profile?.email || a.user_id}</p>
              </div>
              <button onClick={() => removeAdmin(a.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors">
                <FaTrash className="text-xs" />
              </button>
            </motion.div>
          ))}
          {admins.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No admins found.</p>}
        </div>
      )}
    </div>
  );
}
