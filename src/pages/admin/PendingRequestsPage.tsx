import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { FaClipboardList, FaCheckCircle, FaTimesCircle, FaArrowLeft } from "react-icons/fa";

interface Report {
  id: string;
  category: string;
  description: string | null;
  location: string | null;
  status: string;
  created_at: string;
  user_id: string | null;
}

export function PendingRequestsPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchReports = async () => {
    setLoading(true);
    let query = supabase
      .from("crime_reports")
      .select("id, category, description, location, status, created_at, user_id")
      .order("created_at", { ascending: false });
    
    if (filter !== "all") {
      query = query.eq("status", filter);
    }
    
    const { data } = await query;
    setReports((data as Report[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("crime_reports").update({
      status, reviewed_by: user?.id, reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    toast({ title: `Report ${status}` });
    fetchReports();
  };

  if (!isAdmin) return <p className="text-center text-muted-foreground mt-20">Admin access required.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
        <FaClipboardList className="text-primary" /> Crime Reports
      </h1>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "pending", "resolved", "rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-muted"
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[0,1,2].map(i => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {reports.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{r.category}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      r.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      r.status === "resolved" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>{r.status}</span>
                  </div>
                  {r.description && <p className="text-xs text-muted-foreground mb-1 line-clamp-2">{r.description}</p>}
                  <p className="text-xs text-muted-foreground">📍 {r.location || "Unknown"}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString()}</p>
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => updateStatus(r.id, "resolved")}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                      <FaCheckCircle className="text-sm" />
                    </button>
                    <button onClick={() => updateStatus(r.id, "rejected")}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                      <FaTimesCircle className="text-sm" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {reports.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No reports found.</p>}
        </div>
      )}
    </div>
  );
}
