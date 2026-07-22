import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { localImages } from "../data"; 
import { Heart, Camera, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

interface GallerySectionProps {
  onExploreStandalone: () => void;
}

/* ------------------------------------------------------------------ */
/*  DATA PREPARATION                                                  */
/* ------------------------------------------------------------------ */
const TAPE_COLORS = ["#FF6452", "#1F9E96", "#7B5EA7", "#F5B942", "#E8607F", "#3E7CB1"];

// Map localImages into the enriched format for the slider
const ENRICHED_ITEMS = localImages.map((img, i) => {
  const isObject = typeof img === 'object' && img !== null;
  const title = isObject ? (img.name || `Memory ${i + 1}`) : `Memory ${i + 1}`;
  const url = isObject ? img.url : img;

  return {
    id: `home-img-${i}`,
    title: title,
    url: url,
    tapeColor: TAPE_COLORS[i % TAPE_COLORS.length],
  };
});

export default function GallerySection({ onExploreStandalone }: GallerySectionProps) {
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Show only the first 10 items in the landing page slider
  const previewItems = ENRICHED_ITEMS.slice(0, 10);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -500 : 500;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="gallery" className="py-24 md:py-40 bg-[var(--paper)] relative overflow-hidden transition-colors duration-500">
      
      {/* Subtle Background Watermark */}
      <div className="absolute top-10 left-10 pointer-events-none opacity-[0.03] select-none dark:opacity-[0.05]">
        <h2 className="text-[15vw] font-black leading-none uppercase font-display">Archive</h2>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 block mb-4"
            >
              Visual Diary
            </motion.span>
            <h2 className="font-display text-5xl md:text-8xl font-black text-[var(--ink)] tracking-tighter leading-[0.85]">
              Moments <br /> 
              <span className="italic font-normal text-[var(--ink-soft)]">Documented.</span>
            </h2>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button 
              onClick={() => scroll("left")}
              className="p-5 rounded-full border border-[var(--board)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-all bg-[var(--card)] shadow-sm"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scroll("right")}
              className="p-5 rounded-full border border-[var(--board)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-all bg-[var(--card)] shadow-sm"
              aria-label="Scroll Right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Horizontal Scrapbook Slider */}
        <div 
          ref={scrollRef}
          className="flex gap-12 overflow-x-auto pb-20 pt-10 px-4 scrollbar-none snap-x snap-mandatory"
        >
          {previewItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex-shrink-0 w-[280px] md:w-[380px] snap-center"
            >
              <div 
                className="relative bg-[var(--card)] p-4 pb-12 shadow-2xl border border-[var(--board)] group transition-transform duration-500 hover:-translate-y-4 hover:rotate-0"
                style={{ rotate: `${(idx % 2 === 0 ? 1.5 : -1.5) * 1.5}deg` }}
              >
                {/* Tape Strip Decor */}
                <div 
                  className="absolute top-[-15px] left-1/2 -translate-x-1/2 w-24 h-8 opacity-80 blur-[0.3px] z-20"
                  style={{ 
                    backgroundColor: item.tapeColor,
                    clipPath: "polygon(2% 0%, 98% 3%, 100% 20%, 95% 80%, 98% 97%, 2% 100%, 0% 80%, 5% 20%)"
                  }}
                />

                {/* Image Container */}
                <div className="aspect-[4/5] overflow-hidden bg-[var(--board)] mb-6 rounded-sm">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Footer of the Polaroid */}
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-hand text-3xl text-[var(--ink)] tracking-tight">
                    {item.title}
                  </h3>
                  <button 
                    onClick={(e) => toggleLike(item.id, e)}
                    className="hover:scale-125 transition-transform text-[var(--ink-soft)] hover:text-orange-500"
                  >
                    <Heart 
                      size={20} 
                      className={likes[item.id] ? "fill-orange-500 text-orange-500" : ""} 
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* "View All" Portal Card */}
          <div className="flex-shrink-0 w-[300px] flex items-center justify-center snap-center">
            <button 
              onClick={onExploreStandalone}
              className="group flex flex-col items-center gap-6"
            >
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-[var(--board)] flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:rotate-90 transition-all duration-700">
                <ArrowRight size={32} className="group-hover:-rotate-90 group-hover:text-white transition-all duration-700" />
              </div>
              <span className="font-display text-lg font-black uppercase tracking-[0.2em] text-[var(--ink-soft)] group-hover:text-orange-500 transition-colors">
                Full Archive
              </span>
            </button>
          </div>
        </div>

        {/* Photowalk CTA - Premium Highlight */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 p-8 md:p-16 rounded-[3rem] bg-[var(--card)] border border-[var(--board)] relative overflow-hidden shadow-sm"
        >
          {/* Faint Background Icon */}
          <div className="absolute top-0 right-0 p-8 text-orange-500/10 pointer-events-none">
            <Camera size={140} strokeWidth={1} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 mb-4 block">
                Creator Collective
              </span>
              <h3 className="font-display text-3xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">
                Frame your <br /> own story.
              </h3>
              <p className="text-[var(--ink-soft)] font-medium text-lg leading-relaxed">
                Join our monthly heritage photowalks across Tirupati. Master manual settings, explore hidden streets, and get featured in our archives.
              </p>
            </div>
            
            <a
              href="https://www.instagram.com/imc.tirupati"
              target="_blank"
              rel="noreferrer"
              className="px-10 py-5 rounded-full bg-[var(--ink)] text-[var(--paper)] font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-500 transition-all shadow-xl whitespace-nowrap active:scale-95"
            >
              Join the next Walk
            </a>
          </div>
        </motion.div>

        {/* Explore More Footer Link */}
        <div className="mt-24 text-center">
          <button 
            onClick={onExploreStandalone}
            className="group inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-[var(--ink-soft)] hover:text-orange-500 transition-all"
          >
            <span>Explore Standalone Archive</span>
            <div className="w-16 h-px bg-[var(--board)] group-hover:bg-orange-500 transition-all" />
          </button>
        </div>
      </div>
    </section>
  );
}