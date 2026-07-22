import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CommunityJoinModal from "./CommunityJoinModal";
import {
  Music, BookOpen, Gamepad2, Palette, Camera, Heart,
  Users, Clock, Sparkles, ArrowRight, CheckCircle2,
  TreePine, Rocket, Trophy, Move, Flower2, Baby,
  Search, MapPin, Briefcase,ChevronLeft, ChevronRight
} from "lucide-react";
import { WINGS_DATA } from "../data";

/**
 * UPDATED THEME DEFINITIONS
 * Added mappings for all 11+ clubs
 */
const THEMES: Record<string, {
  color: string;
  glow: string;
  border: string;
  bg: string;
  icon: any
}> = {
  culture: { color: "from-violet-600 to-purple-500", glow: "rgba(139, 92, 246, 0.15)", border: "border-purple-500/20", bg: "bg-purple-500/5", icon: Palette },
  connect: { color: "from-blue-600 to-cyan-500", glow: "rgba(37, 99, 235, 0.15)", border: "border-blue-500/20", bg: "bg-blue-500/5", icon: Briefcase },
  social: { color: "from-red-600 to-rose-500", glow: "rgba(225, 29, 72, 0.15)", border: "border-rose-500/20", bg: "bg-rose-500/5", icon: Heart },
  nature: { color: "from-emerald-600 to-green-500", glow: "rgba(5, 150, 105, 0.15)", border: "border-emerald-500/20", bg: "bg-emerald-500/5", icon: TreePine },
  music: { color: "from-indigo-600 to-blue-500", glow: "rgba(79, 70, 229, 0.15)", border: "border-indigo-500/20", bg: "bg-indigo-500/5", icon: Music },
  sports: { color: "from-orange-600 to-red-500", glow: "rgba(234, 88, 12, 0.15)", border: "border-orange-500/20", bg: "bg-orange-500/5", icon: Trophy },
  startup: { color: "from-amber-600 to-yellow-500", glow: "rgba(217, 119, 6, 0.15)", border: "border-amber-500/20", bg: "bg-amber-500/5", icon: Rocket },
  dance: { color: "from-pink-600 to-rose-500", glow: "rgba(219, 39, 119, 0.15)", border: "border-pink-500/20", bg: "bg-pink-500/5", icon: Move },
  woman: { color: "from-fuchsia-600 to-pink-500", glow: "rgba(192, 38, 211, 0.15)", border: "border-fuchsia-500/20", bg: "bg-fuchsia-500/5", icon: Flower2 },
  kids: { color: "from-sky-600 to-blue-500", glow: "rgba(2, 132, 199, 0.15)", border: "border-sky-500/20", bg: "bg-sky-500/5", icon: Baby },
  creator: { color: "from-rose-600 to-orange-500", glow: "rgba(225, 29, 72, 0.15)", border: "border-rose-500/20", bg: "bg-rose-500/5", icon: Camera },
};

interface WingsSectionProps {
  onNavigate?: (sectionId: string) => void;
}

export default function WingsSection({ onNavigate }: WingsSectionProps) {
  const [selectedWingId, setSelectedWingId] = useState(WINGS_DATA[0]?.id || "culture");
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getTheme = (id: string) => {
    const key = id.toLowerCase();
    return THEMES[key] || THEMES.culture;
  };

  const activeWing = useMemo(() =>
    WINGS_DATA.find((w) => w.id === selectedWingId) || WINGS_DATA[0],
    [selectedWingId]
  );

  const theme = getTheme(activeWing.id);

  const changeWing = (direction: "left" | "right") => {
    const currentIndex = WINGS_DATA.findIndex((wing) => wing.id === selectedWingId);
    const nextIndex = direction === "left"
      ? (currentIndex - 1 + WINGS_DATA.length) % WINGS_DATA.length
      : (currentIndex + 1) % WINGS_DATA.length;

    const nextWing = WINGS_DATA[nextIndex];
    setSelectedWingId(nextWing.id);

    const button = scrollContainerRef.current?.children[nextIndex] as HTMLElement | undefined;
    button?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  return (
    <section id="wings" className="py-20 md:py-32 bg-white dark:bg-[#050505] relative overflow-hidden">

      {/* Dynamic Ambient Background */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-in-out opacity-40"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${theme.glow} 0%, transparent 70%)`
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* Header - Scaled for many wings */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.span
              className={`inline-block text-[10px] font-black tracking-[0.3em] uppercase mb-4 px-4 py-1.5 rounded-full border ${theme.border} bg-white dark:bg-slate-900 shadow-sm`}
            >
              Our Communities
            </motion.span>

            <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white leading-tight">
              The{" "}
              <span className={`bg-gradient-to-r ${theme.color} bg-clip-text text-transparent`}>
                Communities
              </span>{" "}
              of IMC.
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <p className="hidden lg:block text-slate-500 dark:text-slate-400 text-lg font-medium max-w-xs border-l-2 border-slate-100 dark:border-slate-800 pl-6">
              50+ specialized wings, one mission. Find where you belong.
            </p>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => changeWing("left")}
                className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all shadow-sm"
                aria-label="Scroll Left"
              >
                <ChevronLeft size={20} className="mx-auto" />
              </button>

              <button
                onClick={() => changeWing("right")}
                className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all shadow-sm"
                aria-label="Scroll Right"
              >
                <ChevronRight size={20} className="mx-auto" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Scrollable Selector with Fade Masks */}
        <div className="relative mb-16 group">
          {/* Gradient Masks for scrolling */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-[#050505] to-transparent z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-[#050505] to-transparent z-20 pointer-events-none" />

          <div
            ref={scrollContainerRef}
            className="flex flex-nowrap overflow-x-auto gap-3 pb-4 no-scrollbar scroll-smooth"
          >
            {WINGS_DATA.map((wing) => {
              const isSelected = wing.id === selectedWingId;
              const wingTheme = getTheme(wing.id);
              const WingIcon = wingTheme.icon || Users;

              return (
                <button
                  key={wing.id}
                  onClick={() => setSelectedWingId(wing.id)}
                  className={`relative flex-shrink-0 px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 border ${isSelected
                      ? `text-white border-transparent`
                      : "text-slate-500 border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
                    }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute inset-0 bg-gradient-to-r ${wingTheme.color} rounded-xl shadow-lg`}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">
                    <WingIcon size={18} className={isSelected ? "animate-pulse" : "opacity-70"} />
                  </span>
                  <span className="relative z-10 font-bold text-xs tracking-wide uppercase whitespace-nowrap">
                    {wing.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Main Content Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedWingId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12"
          >
            {/* Image & Stats Side */}
            <div className="lg:col-span-5">
              <div className="relative group">
                <div className={`absolute -inset-4 bg-gradient-to-r ${theme.color} opacity-10 blur-2xl rounded-[3rem] group-hover:opacity-20 transition-opacity duration-700`} />
                <div className="relative aspect-[16/10] lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
                  <img
                    src={activeWing.image}
                    alt={activeWing.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Floating Tag */}
                  <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Active Community
                  </div>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="space-y-6 mb-10">
                <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
                  {activeWing.name}
                </h3>
                <p className="text-xl font-bold italic bg-gradient-to-r from-slate-400 to-slate-500 bg-clip-text text-transparent">
                  "{activeWing.tagline}"
                </p>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                  {activeWing.detailedDesc}
                </p>
              </div>

              {/* Bento Grid Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {activeWing.activities.map((act, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-slate-200 dark:hover:border-white/20 transition-all"
                  >
                    <CheckCircle2 size={20} className={`mb-3 bg-gradient-to-r ${theme.color} text-white rounded-full p-0.5`} />
                    <h5 className="font-bold text-slate-900 dark:text-white mb-1">{act.title}</h5>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                      <Clock size={12} /> {act.frequency}
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Footer Section */}
              <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {activeWing.team.map((leader, idx) => (
                      <div
                        key={idx}
                        className={`w-12 h-12 rounded-full border-4 border-white dark:border-[#050505] bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black overflow-hidden shadow-lg`}
                      >
                        {/* Fallback to initials if no image */}
                        <span className="uppercase">{leader.name.charAt(0)}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Curated by Wing Leads</p>
                    <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-tighter">Experts in {activeWing.name}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsJoinModalOpen(true)}
                  className={`ml-auto flex items-center gap-3 px-8 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:shadow-2xl hover:-translate-y-1 transition-all group`}
                >
                  Join the Community
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <CommunityJoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onNavigateTerms={() => onNavigate?.("terms")}
      />

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}