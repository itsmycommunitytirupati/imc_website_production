import { motion } from "motion/react";
import { Instagram, ArrowUpRight, Sparkles } from "lucide-react";

import songs from '../../assets/about2.jpeg';
import community from '../../assets/about1.jpeg';
import sports1 from '../../assets/about3.jpeg';

interface AboutSectionProps {
  onExploreAbout: () => void;
}

export default function AboutSection({ onExploreAbout }: AboutSectionProps) {
  const highlights = [
    {
      title: "Interest-Based Wings",
      desc: "Six dedicated clubs — Music, Books, Games, Craft, Photo, Social — to suit your unique creativity.",
      accent: "orange"
    },
    {
      title: "Break the Regular Routine",
      desc: "Weekend activities, treks, jamming, and workshops designed to escape your regular schedule.",
      accent: "purple"
    },
    {
      title: "Build Meaningful Connections",
      desc: "Meet empathetic, progressive, and friendly like-minded individuals in an open community.",
      accent: "emerald"
    },
    {
      title: "Tirupati-Centric Gatherings",
      desc: "Local, organic meetups celebrating the beauty, heritage, and people of Tirupati.",
      accent: "indigo"
    }
  ];

  const accentStyles: Record<string, { ring: string; dot: string; text: string; bg: string }> = {
    orange: {
      ring: "group-hover:border-orange-400/50",
      dot: "bg-orange-500",
      text: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500/10"
    },
    purple: {
      ring: "group-hover:border-purple-400/50",
      dot: "bg-purple-500",
      text: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10"
    },
    emerald: {
      ring: "group-hover:border-emerald-400/50",
      dot: "bg-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10"
    },
    indigo: {
      ring: "group-hover:border-indigo-400/50",
      dot: "bg-indigo-500",
      text: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10"
    }
  };

  return (
    <section id="about" className="py-20 md:py-32 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* Decorative ambient blobs */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Side: Scrapbook-style photo stack */}
          <div className="lg:col-span-5 relative">
            <div className="relative h-[420px] sm:h-[480px] lg:h-[520px] max-w-md mx-auto lg:mx-0">

              {/* Back photo — rotated left */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotate: -10 }}
                whileInView={{ opacity: 1, y: 0, rotate: -8 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                whileHover={{ rotate: -3, scale: 1.03 }}
                className="absolute top-0 left-0 w-[60%] aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-slate-900 z-10"
              >
                <img
                  src={community}
                  alt="Singing together"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              {/* Front photo — rotated right, layered on top */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotate: 10 }}
                whileInView={{ opacity: 1, y: 0, rotate: 6 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ rotate: 2, scale: 1.03 }}
                className="absolute bottom-0 right-0 w-[65%] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-900 z-20"
              >
                <img
                  src={sports1}
                  alt="Laughter and community"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              {/* Small accent photo, top right */}
              <motion.div
                initial={{ opacity: 0, y: -20, rotate: 6 }}
                whileInView={{ opacity: 1, y: 0, rotate: 4 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ rotate: 0, scale: 1.05 }}
                className="absolute top-4 right-2 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-slate-900 z-30"
              >
                <img
                  src={songs}
                  alt="Board games night"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              {/* Floating stat badge — signature element */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 0.35, type: "spring" }}
                className="absolute bottom-6 left-2 sm:left-0 z-40 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 px-5 py-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div className="leading-tight">
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white font-display">50+ Clubs</div>
                  <div className="text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">One Community</div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Side: Copy & Content */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-orange-500 dark:text-orange-400 uppercase font-sans">
                <span className="w-6 h-px bg-orange-500 dark:bg-orange-400" />
                About IMC Tirupati
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-display leading-tight">
                More Than a Community. <br />
                It's Where You <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Belong.</span>
              </h2>
            </div>

            <p className="text-lg sm:text-xl text-slate-800 dark:text-slate-200 font-medium leading-relaxed font-sans max-w-2xl">
              IMC Tirupati brings people together beyond the daily grind. Clubs for your interests, weekend trips that actually get you outdoors, workshops that teach you something new, and a community that turns strangers into your people.</p>

            <p className="text-base text-orange-700 font-semibold leading-relaxed font-sans max-w-2xl">
              Come for the hobby. Stay for the connections.
            </p>

            {/* highlights list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highlights.map((item, idx) => {
                const accent = accentStyles[item.accent];
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className={`group flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${accent.ring}`}
                  >
                    <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${accent.dot}`} />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white font-display">{item.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-sans">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-4 items-center pt-2">
              <button
                type="button"
                onClick={onExploreAbout}
                className="group inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-3.5 px-7 rounded-full text-xs tracking-wider uppercase transition-all shadow-sm active:scale-95"
              >
                <span>Know More About IMC</span>
                <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <a
                href="https://www.instagram.com/imc.tirupati?igsh=MTE2ZjJzYXpmdXg4MQ=="
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold py-3.5 px-7 rounded-full text-xs tracking-wider uppercase transition-all shadow-lg shadow-pink-600/20 active:scale-95"
              >
                <Instagram size={14} />
                <span>Follow on Instagram</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}