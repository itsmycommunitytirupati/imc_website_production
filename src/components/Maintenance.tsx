import { Wrench } from "lucide-react";
// Drop your video file at src/assets/maintenance-video.mp4 (any name/format
// works — just update this import path and the filename to match).
import maintenanceVideo from "../../assets/launch.mp4";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-white px-6">
      <div className="max-w-lg w-full text-center flex flex-col items-center">
        <video
          src={maintenanceVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-full max-w-sm rounded-2xl shadow-lg shadow-black/40 mb-8"
        />

        <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-6">
          <Wrench className="h-7 w-7 text-orange-500" />
        </div>

        <a
          href="mailto:itsmycommunity.tirupati@gmail.com"
          className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2.5 px-6 rounded-full text-xs tracking-wider uppercase transition-transform active:scale-95 shadow-lg shadow-orange-500/20"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}