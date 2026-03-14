import { useState, useRef, useEffect, useCallback } from "react";
import {
  FaWhatsapp, FaSms, FaPhone, FaEnvelope, FaRobot,
  FaPaperPlane, FaTimes, FaHandsHelping,
  FaFacebookF, FaInstagram, FaGlobe,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";

const KB: Record<string, { patterns: string[]; response: string }> = {
  emergency: {
    patterns: ["emergency", "urgent", "help me", "danger", "attacked", "sos", "999", "112", "211"],
    response: `🚨 **EMERGENCY RESPONSE**\n\nCall these numbers **right now**:\n\n• 📞 **999** – Uganda Police Force\n• 📞 **211** – Emergency Services\n• 📞 **112** – General Emergency\n• 📞 **0800-199-699** – UPF Toll-free`,
  },
  report_crime: {
    patterns: ["report crime", "how to report", "submit report"],
    response: `📝 **How to Report a Crime**\n\n1. Go to **Report Crime** from the dashboard\n2. Select the crime type\n3. Provide location\n4. Describe the incident\n5. Submit`,
  },
  missing_person: {
    patterns: ["missing person", "someone missing", "find person"],
    response: `👤 **Missing Person?**\n\nReport immediately:\n1. Go to **Missing Persons** section\n2. File a detailed report\n\nContact: Police **999**, Child Helpline **116**`,
  },
  rights: {
    patterns: ["rights", "my rights", "legal rights", "constitution"],
    response: `⚖️ **Your Rights (Uganda Constitution)**\n\n• Right to life & dignity\n• Right to fair trial\n• Right to legal representation\n• Right to remain silent\n• Freedom from torture\n• Right to bail`,
  },
};

type Message = { role: "user" | "bot"; text: string };

function matchKB(input: string): string | null {
  const lower = input.toLowerCase();
  for (const entry of Object.values(KB)) {
    for (const pattern of entry.patterns) {
      if (lower.includes(pattern)) return entry.response;
    }
  }
  return null;
}

const CONTACT_METHODS = [
  { icon: FaPhone, label: "Emergency 999", value: "Call Now", href: "tel:999", color: "hsl(0, 84%, 60%)" },
  { icon: FaPhone, label: "Emergency 211", value: "Call Now", href: "tel:211", color: "hsl(38, 92%, 50%)" },
  { icon: FaWhatsapp, label: "WhatsApp", value: "+256 799 999 999", href: "https://wa.me/256799999999", color: "hsl(160, 84%, 39%)" },
  { icon: FaSms, label: "SMS", value: "Text 999", href: "sms:999", color: "hsl(210, 98%, 65%)" },
  { icon: FaEnvelope, label: "Email", value: "Report", href: "mailto:support@reportcrime.ug", color: "hsl(270, 50%, 55%)" },
];

const SOCIAL_LINKS = [
  { icon: FaInstagram, label: "Instagram", href: "https://www.instagram.com/metpolice_uk/", color: "hsl(330, 81%, 60%)" },
  { icon: FaFacebookF, label: "Facebook", href: "https://facebook.com/UgandaPoliceForce", color: "hsl(217, 91%, 60%)" },
  { icon: FaGlobe, label: "Website", href: "https://upf.go.ug", color: "hsl(192, 91%, 36%)" },
];

export function GetHelpPage() {
  const { t } = useLang();
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "👋 Hi! I'm the ReportCrime AI assistant. How can I help you today?\n\nTry asking about:\n• Emergency contacts\n• How to report a crime\n• Missing persons\n• Your legal rights" },
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);

    const fallbackResponse = "I'm not sure about that. Try asking about **emergency contacts**, **reporting crimes**, **missing persons**, or **your rights**. For urgent help, call **999**.";
    const kbMatch = matchKB(userMsg);
    const botResponse = kbMatch || fallbackResponse;
    setMessages((prev) => [...prev, { role: "bot", text: botResponse }]);
    setChatLoading(false);
  }, [input]);

  return (
    <div className="max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>{t("getHelp")}</h1>
        <p className="text-sm text-muted-foreground mb-6">Contact support, emergency services, or chat with our AI assistant.</p>

        {/* Emergency Banner */}
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 mb-6">
          <p className="text-sm font-bold text-destructive">🚨 In immediate danger?</p>
          <p className="text-xs text-muted-foreground mt-1">Call <strong>999</strong> or <strong>211</strong> right now.</p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {CONTACT_METHODS.map((method, i) => {
            const Icon = method.icon;
            return (
              <a key={i} href={method.href} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:shadow-md transition-all">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: method.color + "15", color: method.color }}>
                  <Icon className="text-sm" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{method.label}</p>
                  <p className="text-[10px] text-muted-foreground">{method.value}</p>
                </div>
              </a>
            );
          })}
        </div>

        {/* Social */}
        <div className="p-4 rounded-lg bg-card border border-border mb-6">
          <h2 className="text-sm font-bold text-foreground mb-3" style={{ fontFamily: "var(--font-display)" }}>Follow & Connect</h2>
          <div className="flex gap-3">
            {SOCIAL_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg flex items-center justify-center border border-border hover:shadow-md transition-all"
                  style={{ color: link.color }}>
                  <Icon className="text-lg" />
                </a>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* AI Chat Button */}
      {!chatOpen && (
        <motion.button onClick={() => setChatOpen(true)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
          className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full shadow-xl flex items-center justify-center z-40 text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}>
          <FaRobot className="text-xl" />
        </motion.button>
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-80 h-96 bg-card border border-border rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border" style={{ background: "var(--gradient-primary)" }}>
              <span className="text-sm font-semibold text-primary-foreground">AI Assistant</span>
              <button onClick={() => setChatOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground">
                <FaTimes />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-lg text-xs whitespace-pre-wrap ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex items-center gap-2 p-3 border-t border-border">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2.5 rounded-lg bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={sendMessage} className="text-primary hover:text-primary/80">
                <FaPaperPlane />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
