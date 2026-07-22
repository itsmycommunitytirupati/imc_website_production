import { useState } from "react";
import { motion } from "framer-motion";
import {
    ArrowUpRight,
    ArrowRight,
    ArrowLeft
} from "lucide-react";

// Import the structured data from your data.ts
import { TRIBE_MEMBERS } from "../data";
import logo from '../../assets/logo.PNG'; 
import CommunityJoinModal from "./CommunityJoinModal";

// --- CONFIG ---
const LATEST_EVENTS_LINK = "https://linktr.ee/IMC.Tirupati";

export default function JoinTeamPage({
    onBackToHome,
    onNavigate,
}: {
    onBackToHome?: () => void;
    onNavigate?: (sectionId: string) => void;
}) {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 font-sans overflow-x-hidden">

            {/* --- NAVIGATION --- */}
            <nav className="fixed top-0 w-full z-[70] p-4 md:p-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[2rem] px-4 md:px-8 py-3 md:py-4 shadow-2xl">
                    <button
                        onClick={() => onBackToHome?.()}
                        className="flex items-center gap-2 text-xs md:text-sm font-bold text-white/80 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} />
                        <span className="hidden xs:inline">Back</span>
                    </button>

                    <div className="text-lg md:text-xl font-black tracking-tighter italic flex items-center gap-2">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-orange-600 rounded-lg flex items-center justify-center not-italic text-xs md:text-sm text-white">I</div>
                        IMC TRIBE
                    </div>
                    
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-white text-black px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-xs md:text-sm hover:bg-orange-600 hover:text-white transition-all active:scale-95"
                    >
                        Join Now
                    </button>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-28 pb-12 md:pt-40 md:pb-32 px-4 overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 md:w-[500px] md:h-[500px] bg-orange-600/20 rounded-full blur-[60px] md:blur-[120px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl mx-auto text-center"
                >
                    {/* --- MAIN HERO LOGO --- */}
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="mb-6 md:mb-8 flex justify-center"
                    >
                        <div className="relative group">
                            <div className="absolute inset-0 bg-orange-600/10 blur-2xl rounded-full group-hover:bg-orange-600/30 transition-all duration-700" />
                            <img 
                                src={logo} 
                                alt="IMC Collective Logo" 
                                className="relative w-32 h-32 md:w-80 md:h-80 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]"
                            />
                        </div>
                    </motion.div>

                    <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[110px] font-black tracking-tighter mb-6 md:mb-8 leading-[0.85] uppercase text-white">
                        Meet the <br />
                        <span className="text-orange-500 italic relative inline-block">
                            Curators.
                            <motion.span
                                initial={{ width: 0 }}
                                whileInView={{ width: "100%" }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="absolute bottom-1 md:bottom-4 left-0 h-[2px] md:h-[6px] bg-orange-600/30 -z-10"
                            />
                        </span>
                    </h1>

                    <p className="max-w-[280px] sm:max-w-md md:max-w-lg mx-auto text-zinc-400 text-sm md:text-lg mb-8 md:mb-12">
                        A premium collective of digital visionaries. Join the next generation of creative curation.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
                        <button
                            onClick={() => setShowModal(true)}
                            className="w-full sm:w-auto px-8 py-4 bg-orange-600 text-white font-black rounded-xl md:rounded-2xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-600/20"
                        >
                            Join Our Team <ArrowRight size={18} />
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* --- STAGGERED PHOTO GRID --- */}
            <section className="px-4 md:px-6 pb-24 md:pb-40">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
                        {TRIBE_MEMBERS.map((member, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: (idx % 3) * 0.1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                className={`relative group rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 aspect-[3/4] 
                                    ${idx % 2 === 1 ? 'mt-6 md:mt-0' : ''} 
                                    ${idx % 3 === 1 ? 'md:mt-24' : ''}
                                    ${idx % 3 === 2 ? 'md:mt-12' : ''}
                                `}
                            >
                                <img 
                                    src={member.img} 
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-out" 
                                    alt={member.name} 
                                />

                                {/* Glass Label Overlay (Desktop) */}
                                <div className="absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4 p-3 md:p-5 rounded-xl md:rounded-[1.8rem] bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 hidden md:flex">
                                    <div className="flex flex-col">
                                        <p className="text-[12px] md:text-[14px] font-black leading-none mb-1 text-white uppercase tracking-tighter">{member.name}</p>
                                        <p className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-orange-500 font-black">{member.role}</p>
                                    </div>
                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-orange-600 flex items-center justify-center shrink-0">
                                        <ArrowUpRight size={14} className="text-white" />
                                    </div>
                                </div>

                                {/* Mobile Always-Visible Label */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:hidden pointer-events-none" />
                                <div className="absolute bottom-3 left-3 md:hidden">
                                    <p className="text-[10px] font-black tracking-tight text-white uppercase">{member.name}</p>
                                    <p className="text-[7px] uppercase tracking-widest text-orange-500 font-bold">{member.role}</p>
                                </div>

                                {/* Static Label for Desktop (pre-hover) */}
                                <div className="absolute bottom-6 left-6 group-hover:opacity-0 transition-opacity duration-300 hidden md:block">
                                    <p className="text-sm font-black tracking-tight text-white/80 uppercase">{member.name}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- REGISTRATION MODAL --- */}
            <CommunityJoinModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onNavigateTerms={() => onNavigate?.("terms")}
                submissionType="member"
            />
        </div>
    );
}