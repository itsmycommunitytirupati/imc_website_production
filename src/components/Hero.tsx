import { motion, useScroll, useTransform } from "framer-motion";
import {
  ChevronRight,
  Sparkles,
  MapPin,
  Users,
  Music,
  Trophy,
  BookOpen,
} from "lucide-react";
import { STATS } from "../data";
import { useRef, useState } from "react";
import CommunityJoinModal from "./CommunityJoinModal";
import heroImage1 from "../../assets/hero1.avif";
import heroImage2 from "../../assets/bghero2.PNG";
import heroImage3 from "../../assets/bghero1.PNG";

interface HeroProps {
  onNavigate: (sectionId: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Parallax and Opacity effects
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div
      ref={containerRef}
      id="home"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500"
    >
      {/* --- BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0">
        <motion.div style={{ y: y1, opacity }} className="absolute inset-0">
          <img
            src={heroImage1}
            alt="Background"
            className="w-full h-full object-cover opacity-20 dark:opacity-10 scale-110 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white dark:via-slate-950/80 dark:to-slate-950" />
        </motion.div>

        {/* Animated Gradient Blobs */}
        <div className="absolute top-1/4 -left-20 w-72 md:w-96 h-72 md:h-96 bg-orange-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-72 md:w-96 h-72 md:h-96 bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full pt-24 md:pt-32 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Side: Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 shadow-sm"
            >
              <Sparkles size={14} className="text-orange-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">
                Tirupati's #1 Community
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl sm:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white leading-[0.85] tracking-tighter"
            >
              <span className="block">MEET</span>
              <span className="block whitespace-nowrap text-[11vw] sm:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
                LIKE-MINDED
              </span>
              <span className="block">PEOPLE.</span>
            </motion.h1>

            {/* --- MOBILE ONLY IMAGE PREVIEW (The "Engagement" Fix) --- */}
            {/* --- MOBILE ONLY IMAGE PREVIEW --- */}
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ delay: 0.2 }}
  className="relative flex lg:hidden justify-center items-center py-10 h-[350px]"
>
  {/* BACK IMAGE (Left side, slightly lower) */}
  <div className="absolute w-[140px] h-[200px] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-900 -rotate-12 -translate-x-20 translate-y-4 z-0">
    <img src={heroImage2} className="w-full h-full object-cover" alt="Event 2" />
  </div>

  {/* FRONT IMAGE (Right side, slightly higher) */}
  <div className="absolute w-[160px] h-[230px] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-900 rotate-6 translate-x-16 z-10">
    <img src={heroImage3} className="w-full h-full object-cover" alt="Event 1" />
  </div>

  {/* JOIN TAG (Centered properly at the bottom) */}
  <div className="absolute bottom-4 z-20 bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
    </span>
    <span className="text-[11px] font-bold dark:text-white">Join 40k+ members</span>
  </div>
</motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-base md:text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"
            >
              Discover a community where friendships begin, passions come alive, and every weekend brings something new. Become a member to stay connected with everything happening, or join an upcoming event and experience the community for yourself.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start"
            >
              <button
                onClick={() => window.open("https://growezy.club/imctirupaticommunity", "_blank")}
                className="w-full sm:w-auto group relative px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-sm overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-orange-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Join Weekend Events <ChevronRight size={18} />
                </span>
              </button>

              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all font-bold text-sm text-slate-700 dark:text-slate-300"
              >
                <Users size={18} className="text-orange-500" />
                Join Community
              </button>
            </motion.div>
          </div>

          {/* Right Side: Desktop Interactive Photo Stack */}
          <div className="hidden lg:flex lg:col-span-5 relative h-[600px] items-center justify-center">
            {/* Main Floating Image */}
            <motion.div
              style={{ y: y2 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-20 w-72 h-96 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-900 rotate-3"
            >
              <img src={heroImage2} className="w-full h-full object-cover" alt="Board Games" />
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl">
                <p className="text-[10px] font-black uppercase text-orange-500">Board Games Night</p>
                <p className="text-xs font-bold dark:text-white">Social Wing Meetup</p>
              </div>
            </motion.div>

            {/* Smaller Secondary Image */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-0 z-30 w-48 h-48 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-900 -rotate-6"
            >
              <img src={heroImage3} className="w-full h-full object-cover" alt="Adventure" />
            </motion.div>

            {/* Badge: Live Location */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-20 -right-4 z-40 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs font-black dark:text-white">Tirupati, AP</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">12+ Active Spots</p>
              </div>
            </motion.div>

            {/* Floating Avatars / Categories */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-[40%] -left-10 z-40 bg-white dark:bg-slate-900 py-3 px-4 rounded-full shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {[
                  { Icon: Music, color: "bg-pink-500" },
                  { Icon: Trophy, color: "bg-emerald-500" },
                  { Icon: BookOpen, color: "bg-orange-500" },
                ].map(({ Icon, color }, index) => (
                  <div
                    key={index}
                    className={`w-9 h-9 rounded-full border-2 border-white dark:border-slate-800 ${color} flex items-center justify-center shadow-md`}
                  >
                    <Icon size={16} className="text-white" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-white">50+ Clubs</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Music • Sports</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* --- STATS BENTO BAR --- */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-6 w-full pb-10">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 p-2 md:p-4 rounded-[2rem] md:rounded-[2.5rem] bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/20 dark:border-slate-800 shadow-2xl"
        >
          {STATS.map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-4 md:p-6 rounded-[1.5rem] hover:bg-white dark:hover:bg-slate-800 transition-all group">
              <span className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:scale-110 transition-transform">
                {stat.label}
              </span>
              <span className="text-[8px] md:text-[10px] text-center font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-orange-500 mt-1">
                {stat.description}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      <CommunityJoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onNavigateTerms={() => onNavigate("terms")}
      />

      {/* Mobile Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex lg:hidden flex-col items-center gap-1 opacity-50"
      >
        <div className="w-1 h-1 rounded-full bg-slate-400" />
        <div className="w-1 h-1 rounded-full bg-slate-400" />
      </motion.div>
    </div>
  );
}