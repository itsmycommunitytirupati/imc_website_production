import { useState, useEffect } from "react";

// Components for Main Sections
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AboutSection from "./components/AboutSection";
import WingsSection from "./components/WingsSection";
import GallerySection from "./components/GallerySection";
import TestimonialsSection from "./components/TestimonialsSection";
import FAQSection from "./components/FAQSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";

// Components for Standalone Pages
import GalleryPage from "./components/GalleryPage";
import AboutPage from "./components/AboutusPage";
import LegalPage from "./components/LegalPage";

import JoinTeamPage from './components/joinTeam'

// Define the available views for the App
type AppView = "home" | "gallery" | "about" | "terms" | "privacy" | "guidelines" | "team";

export default function App() {
  const [view, setView] = useState<AppView>("home");
  const [activeSection, setActiveSection] = useState("home");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  // Prefill states for the Contact Section
  const [prefilledWing, setPrefilledWing] = useState("");
  const [prefilledType, setPrefilledType] = useState("");

  /* ------------------------------------------------------------------ */
  /*  1. THEME MANAGEMENT                                               */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const savedTheme = localStorage.getItem("imc-theme") as "dark" | "light";
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("imc-theme", theme);
  }, [theme]);

  useEffect(() => {
    const seoContent: Record<string, { title: string; description: string }> = {
      home: {
        title: "IMC Tirupati | Wings, Clubs, Music & Community in Tirupati",
        description:
          "IMC Tirupati is a vibrant community in Tirupati offering wings, clubs, music, sports, culture, and social experiences for students, professionals, and families.",
      },
      about: {
        title: "About IMC Tirupati | Community Wings & Clubs in Tirupati",
        description:
          "Learn about IMC Tirupati, a community-led platform in Tirupati connecting people through wings, clubs, music, sports, and cultural experiences.",
      },
      gallery: {
        title: "IMC Tirupati Gallery | Photos of Clubs, Music & Community Events",
        description:
          "Browse the IMC Tirupati gallery featuring community events, music gatherings, sports activities, and vibrant wings in Tirupati.",
      },
      terms: {
        title: "IMC Tirupati Terms & Conditions",
        description: "Read the terms and conditions for IMC Tirupati community events, memberships, and club activities.",
      },
      privacy: {
        title: "IMC Tirupati Privacy Policy",
        description: "Review the privacy policy for IMC Tirupati and its community engagement platform.",
      },
      guidelines: {
        title: "IMC Tirupati Community Guidelines",
        description: "Read the community guidelines for respectful and safe participation in IMC Tirupati spaces.",
      },
    };

    const currentSeo = seoContent[view] ?? seoContent.home;
    document.title = currentSeo.title;

    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute("content", currentSeo.description);
    }

    const canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonicalLink) {
      const path = view === "home" ? "/" : `/${view}`;
      canonicalLink.href = `https://imctirupati.org${path}`;
    }
  }, [view]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  /* ------------------------------------------------------------------ */
  /*  2. NAVIGATION & ROUTING LOGIC                                     */
  /* ------------------------------------------------------------------ */
  const handleNavigate = (targetId: string) => {
    const standalonePages: AppView[] = ["gallery", "about", "terms", "privacy", "guidelines", "team"];

    // Check if we are navigating to a full-page view
    if (standalonePages.includes(targetId as AppView)) {
      setView(targetId as AppView);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // If we are on a subpage and want to go to a home section (e.g., "wings")
    if (view !== "home") {
      setView("home");
      // Delay allows the Home components to mount before scrolling
      setTimeout(() => {
        scrollToSection(targetId);
      }, 100);
    } else {
      scrollToSection(targetId);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of fixed navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  /* ------------------------------------------------------------------ */
  /*  3. SCROLL SPY (For Navbar Highlighting)                           */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (view !== "home") {
      setActiveSection(view);
      return;
    }

    const sections = ["home", "about", "wings", "gallery", "contact"];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [view]);

  /* ------------------------------------------------------------------ */
  /*  4. CONTACT PREFILLS                                              */
  /* ------------------------------------------------------------------ */
  const handleClearPrefills = () => {
    setPrefilledWing("");
    setPrefilledType("");
  };

  /* ------------------------------------------------------------------ */
  /*  5. RENDER LOGIC                                                   */
  /* ------------------------------------------------------------------ */
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans selection:bg-orange-500 selection:text-white transition-colors duration-300">
      <FloatingWhatsApp />
      
      {/* View Switcher */}
      {view === "gallery" ? (
        <GalleryPage 
          onBackToHome={() => handleNavigate("home")} 
        />
      ) : view === "about" ? (
        <AboutPage 
          onBackToHome={() => handleNavigate("home")} 
        />
      ) : (view === "terms" || view === "privacy" || view === "guidelines") ? (
        <LegalPage 
          type={view as "terms" | "privacy" | "guidelines"} 
          onBack={() => handleNavigate("home")} 
        />
      ) : view === "team" ? (
        <JoinTeamPage
          theme={theme}
          onBackToHome={() => handleNavigate("home")}
          onNavigate={handleNavigate}
        />
      ) : (
        /* HOME VIEW */
        <>
          <Navbar 
            activeSection={activeSection} 
            onNavigate={handleNavigate} 
            theme={theme} 
            onToggleTheme={toggleTheme} 
          />

          <main>
            <Hero onNavigate={handleNavigate} />

            <section id="about">
              <AboutSection onExploreAbout={() => handleNavigate("about")} />
            </section>

            <section id="wings">
              <WingsSection onNavigate={handleNavigate} />
            </section>

            {/* Note: EventsSection is currently commented out in your design */}
            {/* <EventsSection /> */}

            <section id="gallery">
              <GallerySection onExploreStandalone={() => handleNavigate("gallery")} />
            </section>

            <TestimonialsSection onNavigate={handleNavigate} />
            
            <FAQSection />

            <section id="contact">
              <ContactSection
                prefilledWing={prefilledWing}
                prefilledType={prefilledType}
                onClearPrefills={handleClearPrefills}
              />
            </section>

          </main>
        </>
      )}

      {/* Footer is always accessible at the bottom */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}