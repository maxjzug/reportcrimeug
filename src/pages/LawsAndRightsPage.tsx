import { FaGavel, FaBook, FaBalanceScale } from "react-icons/fa";
import { motion } from "framer-motion";

const LAWS = [
  { title: "Constitution of Uganda, 1995", desc: "Chapter 4 – Bill of Rights: Right to life, dignity, liberty, fair trial, legal representation.", icon: FaBalanceScale, color: "hsl(221, 83%, 53%)" },
  { title: "Penal Code Act (Cap 120)", desc: "Criminal offences and penalties including theft, assault, murder, fraud, and more.", icon: FaGavel, color: "hsl(0, 84%, 60%)" },
  { title: "Domestic Violence Act, 2010", desc: "Criminalises physical, sexual, emotional and economic abuse within households.", icon: FaBook, color: "hsl(330, 81%, 60%)" },
  { title: "Computer Misuse Act, 2011", desc: "Covers cybercrime, unauthorised access, cyber harassment, and electronic fraud.", icon: FaBook, color: "hsl(192, 91%, 36%)" },
  { title: "Narcotic Drugs Act", desc: "Penalties for possession (up to 10 yrs), trafficking (up to 25 yrs).", icon: FaGavel, color: "hsl(38, 92%, 50%)" },
  { title: "Land Act (Cap 227)", desc: "Protects kibanja holders, regulates land ownership and eviction procedures.", icon: FaBalanceScale, color: "hsl(160, 84%, 39%)" },
  { title: "Witness Protection Act, 2021", desc: "Legal protection for witnesses against intimidation and retaliation.", icon: FaBook, color: "hsl(263, 70%, 50%)" },
];

export function LawsAndRightsPage() {
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Laws & Rights</h1>
      <p className="text-sm text-muted-foreground mb-6">Key Ugandan laws and your constitutional rights.</p>

      <div className="space-y-3">
        {LAWS.map((law, i) => {
          const Icon = law.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: law.color + "15", color: law.color }}>
                  <Icon className="text-lg" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{law.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{law.desc}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
