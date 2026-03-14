import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaShieldAlt } from "react-icons/fa";

export function SplashPage() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      navigate("/home");
    }, 3500);
    return () => clearTimeout(timer);
  }, [navigate]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-card">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: "var(--gradient-primary)" }}>
          <FaShieldAlt className="text-primary-foreground text-3xl" />
        </div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          ReportCrime
        </h1>
        <p className="text-sm text-primary font-semibold tracking-wide">Uganda</p>
        <p className="text-xs text-muted-foreground text-center max-w-xs mt-1">
          Your safety companion. Report crimes, find help, know your rights.
        </p>
      </motion.div>

      {/* Progress bar */}
      <div className="absolute bottom-20 w-48 h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="h-full rounded-full"
          style={{ background: "var(--gradient-primary)" }}
        />
      </div>

      {/* Animated dots */}
      <div className="absolute bottom-12 flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}
