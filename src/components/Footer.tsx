import { Instagram, Mail, Phone, Heart, ArrowUp } from "lucide-react";
import logo from '../../assets/logo.PNG';
interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const links = [
    { name: "Home", id: "home" },
    { name: "About", id: "about" },
    { name: "Our Wings", id: "wings" },
    { name: "Events", id: "events" },
    { name: "Gallery", id: "gallery" },
    { name: "Contact & Enquiry", id: "contact" },
  ];

  const legalLinks = [
    { name: "Terms & Conditions", id: "terms" },
  ];

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900/80 pt-16 pb-8 relative overflow-hidden transition-colors duration-300">
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-slate-200 dark:border-slate-900">
          
          {/* Column 1: Brand */}
          <div className="md:col-span-5 text-left space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="IMC Tirupati logo"
                className="h-20 sm:h-30 w-auto object-contain"
              />
              <div className="flex flex-col text-left">
                <span className="text-sm font-black tracking-[0.25em] text-slate-900 dark:text-white uppercase leading-none">
                  Tirupati
                </span>
                <span className="text-[10px] font-semibold text-orange-500 dark:text-slate-400 tracking-[0.2em] uppercase mt-1">
                  IT'S MY COMMUNITY
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed max-w-sm">
              A licensed, community-driven platform bringing together residents, students, and professionals through shared passions.
            </p>

            <div className="flex items-center space-x-4 pt-2">
              <a href="https://instagram.com/imc.tirupati" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 flex items-center justify-center text-slate-500 hover:text-orange-500 transition-colors">
                <Instagram size={16} />
              </a>
              <a href="mailto:itsmycommunity.tirupati@gmail.com" className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 flex items-center justify-center text-slate-500 hover:text-orange-500 transition-colors">
                <Mail size={16} />
              </a>
              <a href="tel:+919550815185" className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 flex items-center justify-center text-slate-500 hover:text-orange-500 transition-colors">
                <Phone size={16} />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="md:col-span-3 text-left space-y-4">
            <h4 className="text-xs font-bold tracking-widest text-orange-500 uppercase">Navigation</h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.id}>
                  <button onClick={() => onNavigate(link.id)} className="text-sm text-slate-500 hover:text-orange-500 transition-colors">
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="md:col-span-4 text-left space-y-4">
            <h4 className="text-xs font-bold tracking-widest text-orange-500 uppercase">Legal & Guidelines</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.id}>
                  <button onClick={() => onNavigate(link.id)} className="text-sm text-slate-500 hover:text-orange-500 transition-colors">
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="pt-4">
               <p className="text-xs font-bold text-slate-800 dark:text-white uppercase">HQ Address</p>
               <p className="text-xs text-slate-500 mt-1">NGO Colony, Tirupati, 517501</p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500 font-light">
            &copy; {new Date().getFullYear()} IMC Tirupati. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-[11px] text-slate-500">
            <span className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart size={10} className="text-rose-500 fill-rose-500" />
              <span>for Tirupati</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button onClick={handleScrollToTop} className="inline-flex items-center space-x-1 hover:text-orange-500 transition-colors">
              <span>Back to Top</span>
              <ArrowUp size={12} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}