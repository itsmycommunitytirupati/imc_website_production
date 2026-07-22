import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Sparkles, MessageCircle, BrainCircuit,Music,
  Trophy,
  Camera,
  Trees,
  BookOpen, } from "lucide-react";
  import faq from '../../assets/faq.avif';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I join IMC Tirupati?",
    answer: "Submit the quick form in our Contact section. A coordinator will reach out within 24 hours to add you to our active community channels."
  },
  {
    question: "Is there a membership fee?",
    answer: "No, IMC is community-first. Regular gatherings and jams are free. Only specific rentals (turf/treks) are split among attendees."
  },
  {
    question: "Can I join multiple wings?",
    answer: "Absolutely! Most members jam with the Music Club, read with the Books Club, and hike with the Games wing simultaneously."
  },
  {
    question: "Do I need to be skilled to join?",
    answer: "Not at all. Our clubs are beginner-friendly. Whether you're a first-time painter or a casual gamer, you're welcome."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative h-screen min-h-[700px] bg-white dark:bg-[#050505] overflow-hidden flex items-center">
      
      <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* LEFT SIDE: VISUAL & THINKING */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative hidden lg:block"
        >
          {/* Main Image Container */}
          <div className="relative group overflow-hidden rounded-[2.5rem] aspect-[4/5] max-h-[600px] shadow-2xl">
            <img 
              src={faq} 
              alt="Discussion and Thinking"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Floating Thinking Badge */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-8 right-8 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Perspective</p>
                  <p className="text-sm font-bold text-white leading-none">Think. Discuss. Grow.</p>
                </div>
              </div>
            </motion.div>

            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-white text-lg font-medium leading-tight">
                "The best ideas come from the most casual conversations."
              </p>
            </div>
          </div>

          {/* Decorative background element */}
          <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full border-2 border-orange-500/20 rounded-[2.5rem]" />
        </motion.div>

        {/* RIGHT SIDE: FAQ */}
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-1 w-fit rounded-full bg-orange-500/10 border border-orange-500/20"
            >
              <Sparkles size={12} className="text-orange-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">
                Common Doubts
              </span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight"
            >
              Questions? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">We've got answers.</span>
            </motion.h2>
          </div>

          {/* Accordion List */}
          <div className="space-y-2">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index} 
                  className="border-b border-slate-100 dark:border-white/5 last:border-0"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full py-6 flex items-center justify-between text-left group"
                  >
                    <span className={`text-base font-bold transition-all duration-300 ${
                      isOpen ? "text-orange-500 pl-2" : "text-slate-700 dark:text-slate-300"
                    }`}>
                      {faq.question}
                    </span>
                    <div className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-orange-500" : "text-slate-400"}`}>
                      {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "circOut" }}
                      >
                        <div className="pb-6 pr-10 text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Small Support Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex items-center gap-4 pt-4"
          >
            <div className="flex -space-x-2">
              {[
                  { Icon: Music, color: "bg-pink-500" },
                  { Icon: Trophy, color: "bg-emerald-500" },
                  { Icon: BookOpen, color: "bg-orange-500" },
                ].map(({ Icon, color }, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full ${color} border-2 border-white dark:border-[#050505] flex items-center justify-center shadow-md`}
                  >
                    <Icon size={14} className="text-white" />
                  </div>
                ))}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Join 40k+ members. <a href="#contact" className="text-orange-500 font-bold hover:underline underline-offset-4">Talk to a coordinator</a>
            </p>
          </motion.div>
        </div>

      </div>

      {/* Background Decorative Blur */}
      <div className="absolute -top-[10%] -left-[10%] w-[30%] h-[30%] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
}