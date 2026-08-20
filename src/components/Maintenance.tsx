import { Wrench, Mail } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-white px-6">
      <div className="max-w-md w-full text-center">
        
        {/* Animated Icon Circle */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping"></div>
          <div className="relative flex items-center justify-center w-full h-full bg-slate-900 border border-white/10 rounded-full shadow-2xl">
            <Wrench className="h-10 w-10 text-orange-500" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
          Under Maintenance
        </h1>
        
        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
          We’re currently fixing a few things to make your experience better. 
          Everything will be back to normal shortly.
        </p>

        {/* Contact Button */}
        <div className="flex flex-col items-center">
          <a
            href="mailto:itsmycommunity.tirupati@gmail.com"
            className="group flex items-center gap-3 bg-white text-black hover:bg-orange-500 hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-white/5"
          >
            <Mail className="h-4 w-4 transition-transform group-hover:scale-110" />
            Contact Support
          </a>
          
          <p className="mt-8 text-slate-600 text-xs uppercase tracking-widest">
            Its My Community
          </p>
        </div>
      </div>

      {/* Subtle Background Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg max-h-lg bg-orange-500/5 blur-[120px] rounded-full -z-10"></div>
    </div>
  );
}
