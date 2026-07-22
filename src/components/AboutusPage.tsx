import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "motion/react";
import {
  ArrowLeft,
  Sparkles,
  Heart,
  Handshake,
  Star,
  Globe,
  MessagesSquare,
  Instagram,
  Layers,
  TrendingUp,
  Activity,
  Flame,
  Mail,
  Phone,
  Sun,
  Moon,
  Music,
  Quote,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck,
  Briefcase,
  X,
  MapPin,
  ExternalLink,
  Users,
  Tent,
  Palette
} from "lucide-react";
import ragam from '../../assets/ragam.avif';
import wonderland from '../../assets/wonderland.avif';
import step from '../../assets/step.avif';
import music1 from '../../assets/music1.avif';
import hero1 from '../../assets/hero1.avif';
import hero2 from '../../assets/hero2.avif';

interface AboutPageProps {
  onBackToHome: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export default function AboutPage({ onBackToHome, theme, onToggleTheme }: AboutPageProps) {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  // Scroll Progress Logic
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Parallax Logic for Scrapbook
  const y1 = useTransform(scrollYProgress, [0, 0.4], [0, -80]);
  const y2 = useTransform(scrollYProgress, [0, 0.4], [0, 80]);

  // Data from PDF
  const pillars = [
    { title: "Community before commerce", desc: "Trust and belonging come first — monetization follows naturally.", icon: Handshake, color: "text-orange-500", bg: "bg-orange-50" },
    { title: "Experiences over transactions", desc: "People remember how they felt, not what they bought.", icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
    { title: "Collaboration over competition", desc: "Growth happens when creators & businesses work together.", icon: Star, color: "text-purple-500", bg: "bg-purple-50" },
    { title: "Local pride, global thinking", desc: "Celebrate Tirupati while building systems that scale.", icon: Globe, color: "text-blue-500", bg: "bg-blue-50" },
  ];

  const flagships = [
    {
      title: "IMC Wonderland",
      tag: "First-Ever Carnival",
      img: wonderland,
      desc: "2,000+ crowd. VR zones, ramp walks, and flashmobs. The city's biggest collaborative outdoor event."
    },
    {
      title: "Powerstride",
      tag: "Fitness Fest (SAAP)",
      img: step,
      desc: "Partnered with Police & Municipal Corp for the No Drug Campaign. Held at Tarakarama Stadium."
    },
    {
      title: "Raagam",
      tag: "Music Festival",
      img: ragam,
      desc: "Tirupati's biggest music celebration featuring live jamming, bands, and hundreds of singers."
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FDFDFD] text-slate-900 selection:bg-orange-100 selection:text-orange-600 transition-colors duration-500">

      {/* --- IMAGE POPUP (LIGHTBOX) --- */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-white/90 backdrop-blur-2xl cursor-zoom-out"
          >
            <motion.button
              className="absolute top-5 right-5 sm:top-10 sm:right-10 p-2.5 sm:p-3 rounded-full bg-slate-100 text-slate-900 hover:bg-orange-500 hover:text-white transition-all shadow-xl"
              onClick={() => setSelectedImg(null)}
            >
              <X size={22} />
            </motion.button>
            <motion.img
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              src={selectedImg} className="max-w-full max-h-[80vh] sm:max-h-[85vh] rounded-[1.25rem] sm:rounded-[2rem] shadow-2xl border-4 border-white"
              alt="Popup View"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="fixed top-0 left-0 right-0 h-1 sm:h-1.5 bg-orange-500 z-[110] origin-left" style={{ scaleX }} />

      {/* --- ELEGANT WHITE NAV --- */}
      <nav className="fixed top-0 w-full z-[100] border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          <button onClick={onBackToHome} className="group flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-colors shrink-0">
            <div className="p-1.5 sm:p-2 rounded-full bg-slate-50 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
              <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
            </div>
            <span className="hidden sm:inline">Back to Community</span>
            <span className="sm:hidden">Back</span>
          </button>


        </div>
      </nav>

      <main className="pt-16 sm:pt-20">

        {/* --- SECTION 1: SCRAPBOOK HERO --- */}
        <section className="relative min-h-[auto] sm:min-h-[90vh] flex items-center px-4 sm:px-6 py-16 sm:py-0 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center w-full">

            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left z-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <span className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-orange-50 text-orange-600 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] border border-orange-100">
                  <Sparkles size={13} className="sm:w-3.5 sm:h-3.5" /> It's My Community
                </span>
                <h1 className="text-[2.75rem] leading-[0.95] xs:text-5xl sm:text-6xl md:text-8xl lg:text-[8rem] font-black tracking-tighter sm:leading-[0.85] mt-6 mb-6 sm:mt-8 sm:mb-10 text-slate-900 break-words">
                  WE BUILD <br />
                  <span className="text-orange-500">BELONGING.</span>
                </h1>
                <p className="text-base sm:text-xl md:text-3xl text-slate-500 max-w-2xl font-medium leading-snug sm:leading-tight">
                  Tirupati's premier lifestyle ecosystem. We bridge the gap between tradition and social connection.
                </p>
                {/* <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8">
                   <button className="w-full sm:w-auto px-6 py-4 sm:px-10 sm:py-5 rounded-2xl bg-slate-900 text-white font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 transition-all">Explore Wings</button>
                   <button className="w-full sm:w-auto px-6 py-4 sm:px-10 sm:py-5 rounded-2xl border border-slate-200 font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all">Connect Now</button>
                </div> */}
              </motion.div>
            </div>

            <div className="lg:col-span-5 relative h-[600px] hidden lg:block">
              {/* SCRAPBOOK IMAGES */}
              <motion.div style={{ y: y1 }} className="absolute top-0 left-0 w-[70%] aspect-[4/5] rounded-[2.5rem] overflow-hidden border-[10px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-10 cursor-zoom-in group" onClick={() => setSelectedImg(hero1)}>
                <img src={hero1} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Scrapbook 1" />
              </motion.div>
              <motion.div style={{ y: y2 }} className="absolute bottom-10 right-0 w-[75%] aspect-[4/5] rounded-[2.5rem] overflow-hidden border-[10px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-20 cursor-zoom-in group" onClick={() => setSelectedImg(hero2)}>
                <img src={hero2} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Scrapbook 2" />
              </motion.div>

              {/* Floating Stat Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 12 }} transition={{ type: "spring", delay: 0.5 }}
                className="absolute top-1/2 -left-12 z-30 p-6 rounded-3xl bg-white border border-slate-100 shadow-2xl flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white">
                  <Users size={24} />
                </div>
                <div className="text-left">
                  <div className="text-3xl font-black italic tracking-tighter text-slate-900">25K+</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">WhatsApp Members</div>
                </div>
              </motion.div>
            </div>

            {/* Mobile-only stat strip (replaces the hidden desktop floating badge) */}
            <div className="lg:hidden flex items-center gap-3 mt-2 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm w-fit">
              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shrink-0">
                <Users size={20} />
              </div>
              <div className="text-left">
                <div className="text-xl font-black italic tracking-tighter text-slate-900">25K+</div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">WhatsApp Members</div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: BENTO NARRATIVE (PDF Page 2) --- */}
        <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
              <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 30 }} className="lg:col-span-8 bg-white border border-slate-100 p-6 sm:p-10 md:p-12 rounded-[2rem] sm:rounded-[3.5rem] text-left flex flex-col justify-between shadow-sm">
                <div>
                  <h2 className="text-[11px] sm:text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-orange-500 mb-4 sm:mb-6 italic">The Social Gap</h2>
                  <h3 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter leading-tight sm:leading-none mb-6 sm:mb-8 text-slate-900">
                    A city of temples—searching for connection.
                  </h3>
                  <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-8 sm:mb-10 max-w-xl">
                    Tirupati is a spiritual icon, but behind the scenes, thousands of students and professionals are struggling to find weekend life. IMC built the missing layer: A community ecosystem.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6 sm:gap-8 pt-6 sm:pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <TrendingUp className="text-orange-500 shrink-0" size={22} />
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">90%</div>
                      <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400">Awareness</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Star className="text-orange-500 shrink-0" size={22} />
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">50+</div>
                      <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400">Interest Clubs</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: 30 }} className="lg:col-span-4 p-8 sm:p-10 md:p-12 rounded-[2rem] sm:rounded-[3.5rem] bg-orange-500 text-white text-left flex flex-col justify-center shadow-xl shadow-orange-500/20">
                <Quote size={40} className="mb-6 sm:mb-8 opacity-30" />
                <p className="text-2xl sm:text-3xl font-black italic leading-tight mb-6 sm:mb-8">
                  "The real product is the relationships created when people come together."
                </p>
                <div className="h-[1px] bg-white/20 w-full mb-6 sm:mb-8" />
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-80">The IMC Model</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: THE 4 PILLARS (PDF Page 3) --- */}
        <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16 md:mb-20 space-y-3 sm:space-y-4">
              <h2 className="text-orange-500 font-black uppercase tracking-widest text-xs sm:text-sm italic">The Core DNA</h2>
              <h3 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-slate-900">Built on Trust.</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {pillars.map((p, i) => (
                <motion.div
                  key={i}
                  whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 30 }} transition={{ delay: i * 0.1 }}
                  className="p-7 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] bg-white border border-slate-100 text-left group hover:shadow-2xl hover:border-orange-100 transition-all"
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${p.bg} ${p.color} flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform`}>
                    <p.icon size={24} className="sm:w-7 sm:h-7" />
                  </div>
                  <h4 className="text-base sm:text-lg font-black mb-3 sm:mb-4 uppercase tracking-tighter text-slate-900">{p.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- SECTION 4: FLAGSHIP TRACK RECORD (PDF Page 5-6) --- */}
        <section className="py-16 sm:py-24 md:py-32 bg-slate-50 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 sm:mb-16 md:mb-20 gap-6 sm:gap-8">
              <div className="text-left">
                <h2 className="text-[11px] sm:text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-orange-500 mb-3 sm:mb-4 italic">Proof, Not Promises</h2>
                <h3 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-slate-900 uppercase italic">Event Track Record.</h3>
              </div>
              <div className="flex gap-6 sm:gap-10">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-orange-500 tracking-tighter">2,000+</div>
                  <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400">Crowd Pulled</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-orange-500 tracking-tighter">2</div>
                  <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400">Major Flagships</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {flagships.map((evt, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -15 }}
                  className="group relative h-[420px] sm:h-[460px] md:h-[520px] rounded-[2rem] sm:rounded-[3.5rem] overflow-hidden bg-slate-200 cursor-zoom-in shadow-lg"
                  onClick={() => setSelectedImg(evt.img)}
                >
                  <img src={evt.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={evt.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 sm:p-8 md:p-10 text-left w-full">
                    <span className="inline-block px-3 sm:px-4 py-1 rounded-full bg-orange-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 sm:mb-4">{evt.tag}</span>
                    <h4 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 italic tracking-tighter uppercase">{evt.title}</h4>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500">{evt.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 sm:mt-16 flex flex-wrap justify-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2.5 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 rounded-full bg-white border border-slate-100 shadow-sm text-slate-600 text-center">
                <ShieldCheck className="text-orange-500 shrink-0" size={18} />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Backed by SAAP, Police & Corp</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 5: WEEKENDS & ECOSYSTEM --- */}
        <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto text-center space-y-10 sm:space-y-12 md:space-y-16">
            <h3 className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter text-slate-900 leading-tight">
              Something is happening— <br /> <span className="text-orange-500 italic uppercase">Every single weekend.</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                { n: "Music Festivals", i: Music },
                { n: "Sports Tourneys", i: Activity },
                { n: "Nature Retreats", i: Tent },
                { n: "Creative Workshops", i: Palette },
                { n: "Community Lunches", i: Users },
                { n: "Networking Meetups", i: Handshake },
                { n: "Startup Sessions", i: Briefcase },
                { n: "Flagship Celebrations", i: Flame },
              ].map((act, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open("https://linktr.ee/IMC.Tirupati", "_blank")}
                  className="cursor-pointer p-5 sm:p-7 md:p-10 rounded-[1.75rem] sm:rounded-[2.5rem] md:rounded-[3rem] bg-white border border-slate-100 flex flex-col items-center gap-3 sm:gap-4 group hover:border-orange-200 transition-all shadow-sm"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                    <act.i size={22} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
                  </div>

                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600 leading-tight text-center">
                    {act.n}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- SECTION 6: COLLABS (Connect.Tirupati) --- */}
        <section className="py-16 sm:py-24 md:py-32 bg-slate-900 text-white px-4 sm:px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="text-left space-y-6 sm:space-y-8">
              <h2 className="text-orange-400 font-black uppercase tracking-widest text-xs sm:text-sm italic">Beyond Recreation</h2>
              <h3 className="text-4xl sm:text-5xl md:text-[5.5rem] font-black tracking-tighter leading-[0.95] sm:leading-[0.9] uppercase italic">Careers & <br />Brand Growth.</h3>
              <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
                We empower local businesses and help ambitious youth find their next big career step through Connect.Tirupati.
              </p>
              <div className="space-y-4">
                <div className="p-6 sm:p-8 rounded-[1.75rem] sm:rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="flex justify-between items-center mb-2 gap-2">
                    <h4 className="text-xl sm:text-2xl font-black italic text-orange-400 uppercase">Connect.Tirupati</h4>
                    <ArrowUpRight size={20} className="text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform shrink-0" />
                  </div>
                  <p className="text-slate-400 text-sm">Bridges employers and job seekers through city-wide career drives.</p>
                </div>
                <div className="p-6 sm:p-8 rounded-[1.75rem] sm:rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="flex justify-between items-center mb-2 gap-2">
                    <h4 className="text-xl sm:text-2xl font-black italic text-orange-400 uppercase">Instagram Media</h4>
                    <ArrowUpRight size={20} className="text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform shrink-0" />
                  </div>
                  <p className="text-slate-400 text-sm">Scales local cafes & startups through high-conversion brand storytelling.</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-7 sm:p-10 md:p-12 rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] text-left space-y-6 sm:space-y-8 md:space-y-10 shadow-2xl">
              <h4 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-white">Sponsorship Gain</h4>
              <ul className="space-y-4 sm:space-y-6">
                {[
                  "Direct access to an active, trust-built local audience",
                  "Experiential marketing at 2,000+ crowd flagship events",
                  "Launch products inside an engaged community, not cold ads",
                  "Authentic brand association with the value 'community first'"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 sm:gap-4">
                    <CheckCircle2 className="text-white shrink-0 mt-1" size={22} />
                    <span className="text-base sm:text-lg font-bold leading-tight text-white/90">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-5 sm:py-6 rounded-2xl sm:rounded-3xl bg-slate-900 text-white font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-all">Partner with IMC</button>
            </div>
          </div>
        </section>

        {/* --- SECTION 8: CONTACT FOOTER --- */}
        <footer className="py-20 sm:py-28 md:py-40 bg-white px-4 sm:px-6 relative overflow-hidden border-t border-slate-100">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-orange-50/50 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16 md:space-y-20 relative z-10 text-center">
            <motion.h2 whileInView={{ opacity: 1 }} initial={{ opacity: 0 }} className="text-4xl sm:text-6xl md:text-7xl lg:text-[8rem] font-black tracking-tighter leading-none italic uppercase text-slate-900">
              Join the <span className="text-orange-500">Tribe.</span>
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
              <div className="p-7 sm:p-10 md:p-12 rounded-[2rem] sm:rounded-[3.5rem] bg-slate-50 border border-slate-100 space-y-5 sm:space-y-6 group hover:border-orange-200 transition-all">
                <h4 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-slate-900 italic">For Brands</h4>
                <p className="text-slate-500 font-medium leading-relaxed text-sm sm:text-base">Reach ~90% of Tirupati's young population through authentic, trust-built community association.</p>
                <a href="mailto:itsmycommunity.tirupati@gmail.com" className="inline-flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-black uppercase tracking-widest text-orange-600 hover:gap-5 transition-all break-all sm:break-normal">
                  <Mail size={18} className="shrink-0" /> Send Partnership Mail
                </a>
              </div>
              <div className="p-7 sm:p-10 md:p-12 rounded-[2rem] sm:rounded-[3.5rem] bg-slate-50 border border-slate-100 space-y-5 sm:space-y-6 group hover:border-orange-200 transition-all">
                <h4 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-slate-900 italic">For Members</h4>
                <p className="text-slate-500 font-medium leading-relaxed text-sm sm:text-base">Escape your routine. Find your hobby wing. Find your family in the heart of the city.</p>
                <a href="tel:+919550815185" className="inline-flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-black uppercase tracking-widest text-orange-600 hover:gap-5 transition-all">
                  <Phone size={18} className="shrink-0" /> Call us at +91 9550815185
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}