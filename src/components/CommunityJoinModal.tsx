import { type ChangeEvent, type FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    User,
    Mail,
    Smartphone,
    Briefcase,
    Check,
    Sparkles,
    ChevronRight,
    AlertCircle,
} from "lucide-react";

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzBwWnb61rI82_k5zj5P4pWnmfd1YpUqOz6KKC1SkHUbvaj93v1iNMkOtXV34alqzpn/exec";
const LINKTREE_URL = "https://linktr.ee/IMC.Tirupati";

interface CommunityJoinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigateTerms?: () => void;
}

export default function CommunityJoinModal({ isOpen, onClose, onNavigateTerms }: CommunityJoinModalProps) {
    const [modalStep, setModalStep] = useState<"terms" | "details" | "submitting" | "success">("terms");
    const [agreed, setAgreed] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", contact: "", profession: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const resetState = () => {
        setModalStep("terms");
        setAgreed(false);
        setFormData({ name: "", email: "", contact: "", profession: "" });
        setErrors({});
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleTermsClick = () => {
        resetState();
        onClose();
        onNavigateTerms?.();
    };

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
        setFormData({ ...formData, contact: val });
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (formData.name.trim().length < 2) newErrors.name = "Please enter your full name";
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Enter a valid email address";
        if (formData.contact.length !== 10) newErrors.contact = "Phone number must be 10 digits";
        if (formData.profession.trim().length < 2) newErrors.profession = "Please tell us what you do";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setModalStep("submitting");

        try {
            const now = new Date();
            const payload = new URLSearchParams();

            payload.append("name", formData.name);
            payload.append("email", formData.email);
            payload.append("contact", formData.contact);
            payload.append("profession", formData.profession);
            payload.append("source", "imc-website");
            payload.append("submittedAt", now.toISOString());
            payload.append(
                "submittedTime",
                now.toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "medium",
                    hour12: true,
                })
            );
            payload.append("termsAndConditions", agreed ? "Agreed" : "Not Agreed");

            await fetch(GOOGLE_SHEET_URL, {
                method: "POST",
                mode: "no-cors",
                body: payload,
            });

            setModalStep("success");
            setTimeout(() => {
                window.location.href = LINKTREE_URL;
            }, 2500);
        } catch (error) {
            setModalStep("details");
            console.error("Error submitting form:", error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-3xl bg-black/80">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#0F0F0F] border border-white/10 rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-2xl"
                    >
                        <button
                            onClick={handleClose}
                            className="absolute top-10 right-10 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={28} />
                        </button>

                        {modalStep === "terms" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="text-orange-500" />
                                    <span className="text-orange-500 font-black tracking-widest text-[10px] uppercase">
                                        Covenant
                                    </span>
                                </div>
                                <h2 className="text-5xl font-black tracking-tighter uppercase leading-[0.9]">
                                    <span className="text-white">The</span> <br />
                                    <span className="text-orange-500">Protocol.</span>
                                </h2>
                                <div className="space-y-4">
                                    {[
                                        {
                                            t: "Community Code",
                                            d: "Respect privacy, contribute value, and uphold a culture of trust, collaboration, and mutual respect."
                                        }
                                    ].map((rule, i) => (
                                        <div key={i} className="flex gap-5 items-center bg-white/5 p-5 rounded-2xl border border-white/5">
                                            <span className="text-orange-500 font-black italic text-xl">0{i + 1}</span>
                                            <div>
                                                <p className="font-bold text-white text-sm uppercase">{rule.t}</p>
                                                <p className="text-xs text-slate-500">{rule.d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs leading-5 text-slate-400 font-medium">
                                    Please take a moment to read our{" "}
                                    <button
                                        type="button"
                                        onClick={handleTermsClick}
                                        className="text-orange-500 underline underline-offset-2 hover:text-orange-400 transition-colors font-bold"
                                    >
                                        Terms &amp; Conditions
                                    </button>{" "}
                                    before joining. Your acceptance confirms that you agree to comply with our policies, code of conduct, and community standards.
                                </p>
                                <label className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl cursor-pointer border border-white/5 group">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="w-5 h-5 accent-orange-600 rounded bg-transparent"
                                    />
                                    <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest">
                                        I swear to uphold the code
                                    </span>
                                </label>
                                <button
                                    disabled={!agreed}
                                    onClick={() => setModalStep("details")}
                                    className="w-full py-6 bg-white disabled:opacity-20 text-black font-black rounded-2xl text-xl hover:bg-orange-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl"
                                >
                                    I Accept <ChevronRight size={20} />
                                </button>
                            </motion.div>
                        )}

                        {modalStep === "details" && (
                            <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2 mb-6">
                                    <h2 className="text-orange-400 font-black tracking-tighter uppercase">Identity.</h2>
                                    <p className="text-orange-500 text-sm font-medium">Requesting entry into our den.</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="relative">
                                        <div className={`flex items-center gap-4 px-6 py-5 bg-white/5 border ${errors.name ? "border-red-500" : "border-white/10"} rounded-2xl focus-within:border-orange-500 transition-all`}>
                                            <User size={18} className="text-slate-500" />
                                            <input
                                                required
                                                type="text"
                                                placeholder="Full Name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="bg-transparent outline-none w-full font-bold text-white placeholder:text-slate-600"
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="text-[10px] text-red-500 font-black mt-2 ml-4 flex items-center gap-1 uppercase tracking-tighter">
                                                <AlertCircle size={10} /> {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <div className={`flex items-center gap-4 px-6 py-5 bg-white/5 border ${errors.email ? "border-red-500" : "border-white/10"} rounded-2xl focus-within:border-orange-500 transition-all`}>
                                            <Mail size={18} className="text-slate-500" />
                                            <input
                                                required
                                                type="email"
                                                placeholder="Email Address"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="bg-transparent outline-none w-full font-bold text-white placeholder:text-slate-600"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-[10px] text-red-500 font-black mt-2 ml-4 flex items-center gap-1 uppercase tracking-tighter">
                                                <AlertCircle size={10} /> {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <div className={`flex items-center gap-4 px-6 py-5 bg-white/5 border ${errors.contact ? "border-red-500" : "border-white/10"} rounded-2xl focus-within:border-orange-500 transition-all`}>
                                            <Smartphone size={18} className="text-slate-500" />
                                            <input
                                                required
                                                type="tel"
                                                placeholder="WhatsApp Number"
                                                value={formData.contact}
                                                onChange={handlePhoneChange}
                                                className="bg-transparent outline-none w-full font-bold text-white placeholder:text-slate-600"
                                            />
                                        </div>
                                        {errors.contact && (
                                            <p className="text-[10px] text-red-500 font-black mt-2 ml-4 flex items-center gap-1 uppercase tracking-tighter">
                                                <AlertCircle size={10} /> {errors.contact}
                                            </p>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <div className={`flex items-center gap-4 px-6 py-5 bg-white/5 border ${errors.profession ? "border-red-500" : "border-white/10"} rounded-2xl focus-within:border-orange-500 transition-all`}>
                                            <Briefcase size={18} className="text-slate-500" />
                                            <input
                                                required
                                                type="text"
                                                placeholder="What do you build? (Profession)"
                                                value={formData.profession}
                                                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                                                className="bg-transparent outline-none w-full font-bold text-white placeholder:text-slate-600"
                                            />
                                        </div>
                                        {errors.profession && (
                                            <p className="text-[10px] text-red-500 font-black mt-2 ml-4 flex items-center gap-1 uppercase tracking-tighter">
                                                <AlertCircle size={10} /> {errors.profession}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-6 bg-orange-600 text-white font-black rounded-2xl text-xl mt-6 shadow-xl shadow-orange-600/20 active:scale-95 transition-all uppercase tracking-tight"
                                >
                                    Request Entry
                                </button>
                            </motion.form>
                        )}

                        {modalStep === "submitting" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center flex flex-col items-center">
                                <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-8" />
                                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Vetting Identity...</h3>
                                <p className="text-slate-500 text-sm mt-2">Encrypting your data for the tribe.</p>
                            </motion.div>
                        )}

                        {modalStep === "success" && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center space-y-6">
                                <div className="w-24 h-24 bg-orange-600 rounded-[2.5rem] flex items-center justify-center mx-auto rotate-12 shadow-[0_0_50px_rgba(234,88,12,0.4)]">
                                    <Check size={48} strokeWidth={4} className="text-white" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-5xl font-black tracking-tighter uppercase italic text-orange-500 leading-none">Verified.</h3>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Welcome home. Joining the inner circle...</p>
                                </div>
                                <div className="pt-4">
                                    <a href={LINKTREE_URL} target="_blank" rel="noreferrer" className="inline-block px-12 py-5 bg-white text-black font-black rounded-2xl hover:bg-orange-600 hover:text-white transition-all shadow-xl">
                                        Visit Linktree
                                    </a>
                                    <p className="mt-4 text-[9px] text-slate-600 font-bold uppercase tracking-widest">Redirecting automatically in 2s</p>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}