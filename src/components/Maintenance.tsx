import { Settings, Timer, Mail, ShieldAlert, Construction } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] text-slate-200 px-6 relative overflow-hidden">
      
      {/* --- Animated Background Shapes --- */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="max-w-2xl w-full z-10">
        {/* Main Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
          
          {/* Top Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Settings className="h-12 w-12 text-orange-500 animate-[spin_4s_linear_infinite]" />
                <Construction className="h-6 w-6 text-white absolute -bottom-1 -right-1 bg-orange-600 rounded-full p-1 border-2 border-slate-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">System Update</h1>
                <div className="flex items-center gap-2 text-orange-500/80 text-xs font-mono uppercase tracking-widest">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  Maintenance in progress
                </div>
              </div>
            </div>

            <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
               <Timer className="h-5 w-5 text-slate-400" />
               <div className="text-left">
                  <p className="text-[10px] uppercase text-slate-500 font-bold">Estimated Time</p>
                  <p className="text-sm font-mono text-slate-200">~ 45 Minutes</p>
               </div>
            </div>
          </div>

          {/* Message Section */}
          <div className="space-y-4 mb-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              We're polishing <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">
                something better.
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
              Our community platform is undergoing a scheduled upgrade to improve performance and security. We'll be back online shortly.
            </p>
          </div>

          {/* Progress Visualizer */}
          <div className="space-y-3 mb-10">
             <div className="flex justify-between text-xs font-mono text-slate-500 uppercase tracking-tighter">
                <span>Optimization</span>
                <span>85% Complete</span>
             </div>
             <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400 w-[85%] transition-all duration-1000" />
             </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center gap-6">
            <a
              href="mailto:itsmycommunity.tirupati@gmail.com"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-950 hover:bg-orange-500 hover:text-white font-bold py-3 px-8 rounded-xl transition-all duration-300"
            >
              <Mail className="h-4 w-4" />
              Get Notified
            </a>
            
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <ShieldAlert className="h-4 w-4" />
              <span>Security systems remain active.</span>
            </div>
          </div>

        </div>

        {/* Support ID / Meta info */}
        <p className="mt-8 text-center text-slate-600 text-[10px] uppercase tracking-[0.3em]">
          Reference ID: IMC-UPGRADE-2024
        </p>
      </div>
    </div>
  );
}
