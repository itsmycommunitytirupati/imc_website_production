import { useState, useEffect } from "react";
import { Menu, X, Instagram, Users, Sun, Moon } from "lucide-react";
import logo from '../../assets/logo.PNG';


export default function Navbar({ activeSection, onNavigate, theme, onToggleTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navLinks = [
    { name: "Home", id: "home" },
    { name: "About", id: "about" },
    { name: "Our Wings", id: "wings" },
    { name: "Gallery", id: "gallery" },
    { name: "Contact", id: "contact" },
    { name: "Join Team", id: "team" },
  ];

  const handleLinkClick = (id) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-900 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
          {/* Logo */}
          <button
            className="flex-shrink-0 flex items-center cursor-pointer min-w-0"
            onClick={() => handleLinkClick("home")}
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={logo}
                alt="IMC Tirupati logo"
                className="h-14 sm:h-20 md:h-30 w-auto object-contain"
              />
              <div className="hidden sm:flex flex-col min-w-0 text-left">
                <span className="text-sm font-black tracking-[0.25em] text-slate-900 dark:text-white uppercase leading-none">
                  Tirupati
                </span>
                <span className="text-[10px] font-semibold text-orange-500 dark:text-slate-400 tracking-[0.2em] uppercase mt-1">
                  IT'S MY COMMUNITY
                </span>
              </div>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-orange-500 dark:hover:text-orange-400 relative py-1 ${
                  activeSection === link.id ? "text-orange-500 dark:text-orange-400 font-semibold" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {link.name}
                {activeSection === link.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Desktop right-side actions */}
          <div className="hidden lg:flex items-center space-x-4">
            

            <a
              href="https://www.instagram.com/imc.tirupati?igsh=MTE2ZjJzYXpmdXg4MQ=="
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-white transition-colors p-2"
              title="Official Instagram"
            >
              <Instagram size={20} />
            </a>
            <button
              onClick={() => onNavigate("about")}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2 px-5 rounded-full text-xs tracking-wider uppercase transition-transform active:scale-95 shadow-lg shadow-orange-500/20"
            >
              <Users size={14} />
              <span>Our Story</span>
            </button>
          </div>

          {/* Mobile / tablet controls — kept minimal so the bar never crowds on narrow screens */}
          <div className="lg:hidden flex items-center space-x-1 sm:space-x-2">
           
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 sm:p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-orange-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 shadow-xl max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="px-4 pt-3 pb-6 space-y-1.5">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`block w-full text-left px-4 py-3.5 rounded-lg text-base font-medium transition-colors ${
                  activeSection === link.id
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                {link.name}
              </button>
            ))}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-900 flex flex-col gap-3 px-1">
              <button
                onClick={() => handleLinkClick("contact")}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm tracking-wider uppercase shadow-md active:scale-95 transition-transform"
              >
                <Users size={16} />
                <span>Join Community</span>
              </button>

              <a
                href="https://www.instagram.com/imc.tirupati?igsh=MTE2ZjJzYXpmdXg4MQ=="
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <Instagram size={16} />
                <span>@imc.tirupati</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}