import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Search,
  X,
  Instagram,
  Sun,
  Moon,
  Maximize2,
  Camera,
} from "lucide-react";

import { localImages } from "../data";

/* ------------------------------------------------------------------ */
/*  DATA — Flattened and Simple                                       */
/* ------------------------------------------------------------------ */

// A generic list of titles to rotate through
const TITLES = [
  "Golden Hour", "Sunday Memories", "The Collective", "Street Wander", 
  "Candid Moments", "Afternoon Haze", "Archive 01", "Daily Chapter",
  "The High Note", "Quiet Space", "City Lights", "Gathering",
  "The Workshop", "Morning Ritual", "Weekend Vibe", "In Focus"
];

// Simple alternating tape colors for the scrapbook look
const TAPE_COLORS = ["#FF6452", "#1F9E96", "#7B5EA7", "#F5B942", "#E8607F", "#3E7CB1"];

const GALLERY_ITEMS = localImages.map((imgSrc, i) => ({
  id: `photo-${i + 1}`,
  title: TITLES[i % TITLES.length],
  url: imgSrc,
  tapeColor: TAPE_COLORS[i % TAPE_COLORS.length]
}));

const rot = (id, spread = 5) => {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997;
  return ((h % (spread * 20)) / 10 - spread).toFixed(1);
};

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function GalleryPage({ onBackToHome = () => {} }) {
  const [theme, setTheme] = useState("light");
  const [query, setQuery] = useState("");
  const [activePhoto, setActivePhoto] = useState(null);
  const [likes, setLikes] = useState({});

  const dark = theme === "dark";

  const filtered = useMemo(() => {
    return GALLERY_ITEMS.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLikes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className={dark ? "dark" : ""}
      style={{
        "--paper": dark ? "#0F1110" : "#F9F7F2",
        "--board": dark ? "#161817" : "#EBE6D9",
        "--ink": dark ? "#E0DDD5" : "#1A1714",
        "--ink-soft": dark ? "#88837A" : "#7A7369",
        "--card": dark ? "#1C1F1E" : "#FFFFFF",
        "--accent": "#FF6452",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400&family=Inter:wght@400;600;800&family=Caveat:wght@600;700&display=swap');

        .gp-root {
          font-family: 'Inter', sans-serif;
          background-color: var(--paper);
          color: var(--ink);
          min-height: 100vh;
          transition: background .4s ease;
          background-image: 
            linear-gradient(var(--board) 1.5px, transparent 1.5px),
            linear-gradient(90deg, var(--board) 1.5px, transparent 1.5px);
          background-size: 28px 28px;
        }
        @media (min-width: 768px) { .gp-root { background-size: 40px 40px; } }

        .gp-display { font-family: 'Fraunces', serif; }
        .gp-hand { font-family: 'Caveat', cursive; }

        .gp-tape {
          position: absolute;
          height: 24px;
          width: 68px;
          opacity: 0.7;
          backdrop-filter: blur(1px);
          clip-path: polygon(5% 0%, 95% 2%, 100% 15%, 98% 85%, 95% 98%, 5% 100%, 0% 80%, 2% 20%);
          box-shadow: inset 0 0 10px rgba(0,0,0,0.05);
          z-index: 10;
        }

        .gp-card {
          break-inside: avoid;
          margin-bottom: 24px;
          background: var(--card);
          padding: 12px 12px 16px;
          border-radius: 2px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 15px 30px -10px rgba(0,0,0,0.2);
          cursor: pointer;
          position: relative;
          transition: all .4s cubic-bezier(.175, .885, .32, 1.275);
        }

        @media (hover: hover) {
          .gp-card:hover {
            transform: rotate(0deg) translateY(-8px) scale(1.02) !important;
            box-shadow: 0 30px 60px -20px rgba(0,0,0,0.3);
            z-index: 20;
          }
        }

        .gp-tray {
          background: var(--card);
          border: 1px solid var(--board);
          border-radius: 24px;
        }
      `}</style>

      <div className="gp-root selection:bg-[#FF6452] selection:text-white">
        {/* NAV */}
        <nav className="fixed top-0 w-full z-50 h-16 md:h-20 flex items-center justify-between px-6 md:px-12 backdrop-blur-md bg-[var(--paper)]/80">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={onBackToHome}
            className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </motion.button>

          <h1 className="gp-display text-xl font-black tracking-tighter">
            IMC <span className="gp-hand text-2xl font-normal ml-1">Archives</span>
          </h1>

          <button
            onClick={() => setTheme(dark ? "light" : "dark")}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--board)]"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        {/* HERO */}
        <section className="pt-32 pb-16 px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <span className="gp-hand text-2xl text-[var(--accent)] block mb-2">Moments Captured</span>
            <h2 className="gp-display text-6xl md:text-8xl font-black tracking-tight leading-[0.85] mb-6">
              Our Visual <br /> <span className="italic font-normal">Diary.</span>
            </h2>
          </motion.div>
        </section>

        {/* SEARCH */}
        <section className="sticky top-24 z-40 px-6 mb-16">
          <div className="max-w-xl mx-auto gp-tray p-2 flex items-center">
            <Search size={18} className="ml-4 text-[var(--ink-soft)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search images..."
              className="w-full pl-3 pr-4 py-3 bg-transparent text-sm focus:outline-none"
            />
          </div>
        </section>

        {/* MASONRY WALL */}
        <section className="px-6 pb-32 max-w-7xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <div className="text-center py-20 opacity-30">
                <Camera size={40} className="mx-auto mb-4" />
                <p className="gp-display text-2xl font-bold">No memories found</p>
              </div>
            ) : (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-8">
                {filtered.map((item, idx) => {
                  const r = rot(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="gp-card"
                      style={{ rotate: `${r}deg` }}
                      onClick={() => setActivePhoto(item)}
                    >
                      <div
                        className="gp-tape"
                        style={{
                          backgroundColor: item.tapeColor,
                          top: -12,
                          left: "50%",
                          transform: `translateX(-50%) rotate(${Number(r) * -1.2}deg)`,
                        }}
                      />

                      <div className="relative overflow-hidden rounded-sm">
                        <img src={item.url} alt={item.title} className="w-full h-auto block" />
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="gp-hand text-2xl leading-none">{item.title}</p>
                        <button
                          onClick={(e) => toggleLike(item.id, e)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Heart
                            size={18}
                            fill={likes[item.id] ? "var(--accent)" : "none"}
                            color={likes[item.id] ? "var(--accent)" : "var(--ink-soft)"}
                          />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* LIGHTBOX */}
        <AnimatePresence>
          {activePhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePhoto(null)}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-12 bg-black/95"
            >
              <button className="absolute top-8 right-8 text-white">
                <X size={32} />
              </button>
              <motion.img
                layoutId={activePhoto.id}
                src={activePhoto.url}
                className="max-w-full max-h-full object-contain shadow-2xl"
              />
              <div className="absolute bottom-10 left-0 w-full text-center">
                <p className="gp-hand text-white text-4xl">{activePhoto.title}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}