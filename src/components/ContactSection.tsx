import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  Instagram,
  Copy,
  Check,
  ExternalLink,
  ArrowUpRight,
  MapPin
} from "lucide-react";

export default function ContactSection() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const contactMethods = [
    {
      id: "email",
      label: "Email our team",
      value: "itsmycommunity.tirupati@gmail.com",
      href: "mailto:itsmycommunity.tirupati@gmail.com",
      icon: <Mail className="w-6 h-6" />,
      color: "bg-blue-500",
      description: "For collaborations, partnerships, and general queries."
    },
    {
      id: "phone",
      label: "Call or WhatsApp",
      value: "+91 9550815185",
      href: "https://wa.me/919550815185",
      icon: <Phone className="w-6 h-6" />,
      color: "bg-emerald-500",
      description: "Direct line for event RSVPs and urgent questions."
    },
    {
      id: "instagram",
      label: "Instagram DM",
      value: "@imc.tirupati",
      href: "https://www.instagram.com/imc.tirupati",
      icon: <Instagram className="w-6 h-6" />,
      color: "bg-pink-500",
      description: "The best place to see our daily captures and stories."
    }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <section id="contact" className="py-24 md:py-40 bg-[var(--paper)] relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header Section */}
        {/* Header Section */}
        <div className="mb-16 md:mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 block mb-4"
          >
            Direct Access
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] text-[var(--ink)]"
          >
            Let’s start <br />
            <span className="italic font-normal text-[var(--ink-soft)]">a conversation.</span>
          </motion.h2> {/* Corrected this line from </h2> to </motion.h2> */}
        </div>

        {/* Contact Hub Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Main Large Card (Location/Message) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="md:col-span-7 lg:col-span-8 p-8 md:p-12 rounded-[2rem] bg-[var(--card)] border border-[var(--board)] flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8">
                <MapPin size={18} className="text-orange-500" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-40">Based in Tirupati, AP</span>
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-bold mb-6 max-w-md">
                No forms to fill. Just reach out whenever you're ready.
              </h3>
              <p className="text-[var(--ink-soft)] max-w-sm font-medium leading-relaxed">
                Whether you want to join a wing, collaborate on an event, or just say hi, our leads are just a click away.
              </p>
            </div>

            {/* Visual element for the large card */}
            <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500">
              <SparkleIcon className="w-64 h-64 rotate-12" />
            </div>
          </motion.div>

          {/* Contact Methods Column */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-6">
            {contactMethods.map((method, idx) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity" />

                <div className="relative p-6 rounded-3xl bg-[var(--card)] border border-[var(--board)] hover:border-orange-500/30 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${method.color} text-white shadow-lg shadow-inherit/20`}>
                      {method.icon}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(method.value, method.id)}
                        className="p-2 rounded-full hover:bg-[var(--board)] transition-colors text-[var(--ink-soft)] relative"
                        title="Copy to clipboard"
                      >
                        <AnimatePresence mode="wait">
                          {copiedText === method.id ? (
                            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                              <Check size={16} className="text-emerald-500" />
                            </motion.div>
                          ) : (
                            <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                              <Copy size={16} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                      <a
                        href={method.href}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-full hover:bg-[var(--board)] transition-colors text-[var(--ink-soft)]"
                      >
                        <ArrowUpRight size={18} />
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 block">
                      {method.label}
                    </span>
                    <p className="text-lg font-bold truncate pr-8 tracking-tight">
                      {method.value}
                    </p>
                    <p className="text-xs text-[var(--ink-soft)] mt-2 font-medium">
                      {method.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

function FooterLink({ label }: { label: string }) {
  return (
    <a href="#" className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-orange-500 transition-all">
      {label}
    </a>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}