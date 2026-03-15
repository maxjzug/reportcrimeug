import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { FaUsers, FaToggleOn, FaToggleOff, FaSearch } from "react-icons/fa";

interface UserProfile {
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export function ManageUsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, email, avatar_url, is_active, created_at")
      .order("created_at", { ascending: false });
    setUsers((data as UserProfile[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleActive = async (userId: string, current: boolean) => {
    await supabase.from("profiles").update({ is_active: !current }).eq("user_id", userId);
    toast({ title: `User ${current ? "deactivated" : "activated"}` });
    fetchUsers();
  };

  if (!isAdmin) return <p className="text-center text-muted-foreground mt-20">Admin access required.</p>;

  const filtered = users.filter(u =>
    !search || (u.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
          <FaUsers className="text-primary" /> Manage Users
        </h1>
        <span className="text-xs text-muted-foreground">{users.length} total</span>
      </div>

      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
        <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary" />
      </div>

      {loading ? (
        <div className="space-y-3">{[0,1,2].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u, i) => (
            <motion.div key={u.user_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-4 rounded-lg bg-card border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 overflow-hidden"
                style={{ background: "var(--gradient-primary)" }}>
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  (u.display_name?.[0] || u.email?.[0] || "U").toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{u.display_name || "Unnamed"}</p>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${u.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {u.is_active ? "Active" : "Inactive"}
                </span>
                <button onClick={() => toggleActive(u.user_id, u.is_active)} className="text-lg">
                  {u.is_active ? <FaToggleOn className="text-green-500" /> : <FaToggleOff className="text-muted-foreground" />}
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No users found.</p>}
        </div>
      )}
    </div>
  );
}
