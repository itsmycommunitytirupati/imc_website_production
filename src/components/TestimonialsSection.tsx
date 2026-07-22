import React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Quote, Star, MessageSquare, ArrowRight } from "lucide-react";
import { TESTIMONIALS } from "../data";

// Color Palette for variety
const CARD_THEMES = [
  { border: "hover:border-orange-500/50", accent: "text-orange-500", bg: "bg-orange-500/10", lightText: "text-orange-600 dark:text-orange-300", glow: "from-orange-500/20" },
  { border: "hover:border-teal-500/50", accent: "text-teal-500", bg: "bg-teal-500/10", lightText: "text-teal-600 dark:text-teal-300", glow: "from-teal-500/20" },
  { border: "hover:border-indigo-500/50", accent: "text-indigo-500", bg: "bg-indigo-500/10", lightText: "text-indigo-600 dark:text-indigo-300", glow: "from-indigo-500/20" },
  { border: "hover:border-rose-500/50", accent: "text-rose-500", bg: "bg-rose-500/10", lightText: "text-rose-600 dark:text-rose-300", glow: "from-rose-500/20" },
  { border: "hover:border-amber-500/50", accent: "text-amber-500", bg: "bg-amber-500/10", lightText: "text-amber-600 dark:text-amber-300", glow: "from-amber-500/20" },
];

const TiltCard = ({ testimonial, index }: { testimonial: typeof TESTIMONIALS[0], index: number }) => {
  const theme = CARD_THEMES[index % CARD_THEMES.length];
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const shineOpacity = useTransform(mouseYSpring, [-0.5, 0.5], [0, 0.3]);
  const shineX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative w-[340px] shrink-0 p-8 mx-4 rounded-[2.5rem] 
                 bg-white dark:bg-white/[0.03] backdrop-blur-2xl
                 border border-slate-200 dark:border-white/10 
                 ${theme.border} transition-colors duration-500 group cursor-grab active:cursor-grabbing`}
    >
      <motion.div
        style={{ opacity: shineOpacity, left: shineX }}
        className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
      />

      <div style={{ transform: "translateZ(50px)" }} className="relative z-10">
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className={`fill-current ${theme.accent}`} />
          ))}
        </div>

        <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed mb-6 italic whitespace-normal min-h-[80px]">
          "{testimonial.quote}"
        </p>

        <div className="flex items-center gap-4 pt-5 border-t border-slate-100 dark:border-white/5">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full ${theme.bg} ${theme.lightText} font-black text-lg border-2 border-current/10`}>
            {testimonial.author.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
              {testimonial.author}
            </h4>
            <p className={`text-[10px] ${theme.lightText} font-bold uppercase tracking-[0.12em] mt-1`}>
              {testimonial.role}
            </p>
          </div>
          <Quote size={20} className="text-slate-200 dark:text-white/5 shrink-0" />
        </div>
      </div>
    </motion.div>
  );
};

export default function TestimonialsSection({ onNavigate }: { onNavigate: (t: string) => void }) {
  const [isPaused, setIsPaused] = React.useState(false);

  return (
    <section className="relative min-h-screen py-24 flex flex-col justify-center bg-slate-50 dark:bg-[#050505] overflow-hidden">
      
      {/* Dynamic Backgrounds - Multiple Colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-teal-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full">
        {/* Header Section */}
        <div className="text-center mb-16 px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-6 shadow-sm"
          >
            <MessageSquare size={14} className="text-teal-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tribe Stories</span>
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] mb-6">
            REAL VOICES. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-500">
              REAL CONNECTION.
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
            Our captains and core team are the heartbeat of the community. 
            Hear what drives the mission from the insiders themselves.
          </p>
        </div>

        {/* SINGLE ROW MARQUEE */}
        <div 
          className="relative flex overflow-hidden py-10 group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Edge Gradients */}
          <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-slate-50 dark:from-[#050505] to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-slate-50 dark:from-[#050505] to-transparent z-20 pointer-events-none" />

          <motion.div
            animate={{ x: isPaused ? undefined : [0, -2500] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="flex whitespace-nowrap"
          >
            {/* Repeat triple to ensure seamless loop */}
            {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
              <TiltCard key={idx} testimonial={t} index={idx} />
            ))}
          </motion.div>
        </div>

        {/* Action Footer */}
        <div className="mt-16 flex flex-col items-center gap-8">
          <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <div className="flex -space-x-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`w-10 h-10 rounded-full ${CARD_THEMES[i].bg} ${CARD_THEMES[i].lightText} flex items-center justify-center border-4 border-slate-50 dark:border-[#050505] text-xs font-black`}>
                  {TESTIMONIALS[i].author.charAt(0)}
                </div>
              ))}
            </div>
            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
              Join the 40k+ Movement
            </p>
          </div>

          <button
            onClick={() => onNavigate("team")}
            className="group relative flex items-center gap-3 px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full text-xs font-black uppercase tracking-[0.2em] hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            Become a Member
            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
}