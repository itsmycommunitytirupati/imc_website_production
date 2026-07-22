import { useState } from "react";
import { motion } from "motion/react";
import { EVENTS_DATA } from "../data";
import { Calendar, MapPin, Sparkles, ChevronRight, BellRing } from "lucide-react";

interface EventsSectionProps {
  onJoinClick: (wingName: string, eventName: string) => void;
}

export default function EventsSection({ onJoinClick }: EventsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { name: "All Gatherings", id: "all" },
    { name: "Music", id: "music" },
    { name: "Playing", id: "playing" },
    { name: "Books", id: "books" },
    { name: "Craft", id: "craft" }
  ];

  const filteredEvents = selectedCategory === "all"
    ? EVENTS_DATA
    : EVENTS_DATA.filter(evt => evt.wingId === selectedCategory);

  return (
    <section id="events" className="py-20 md:py-32 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="text-left space-y-4 max-w-xl">
            <span className="text-xs font-bold tracking-widest text-orange-500 dark:text-orange-400 uppercase font-sans">
              Upcoming Events & Meetups
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-display leading-tight">
              Moments That <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Bring Us Together.</span>
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-light font-sans">
              Check out our scheduled gatherings. No prior experience or registration keys required — just turn up with raw enthusiasm and meet your tribe!
            </p>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap gap-2 shrink-0 justify-start">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 border ${
                  selectedCategory === cat.id
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-lg shadow-orange-500/15"
                    : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-800"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredEvents.map((evt, i) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ 
                y: -10, 
                scale: 1.03, 
                boxShadow: "0 25px 30px -5px rgba(249, 115, 22, 0.15), 0 12px 12px -5px rgba(249, 115, 22, 0.1)"
              }}
              className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 hover:border-orange-500/25 dark:hover:border-orange-500/25 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col group text-left relative"
            >
              {/* Image & Club Badge */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={evt.image}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent" />
                
                {/* Wing Badge */}
                <span className="absolute top-4 left-4 inline-flex items-center space-x-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-orange-400 border border-slate-900">
                  <Sparkles size={10} className="animate-pulse" />
                  <span>{evt.wingName}</span>
                </span>
              </div>

              {/* Event Content */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display tracking-tight leading-snug group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-sans font-light">
                    {evt.description}
                  </p>
                </div>

                {/* Event Details */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-900">
                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <Calendar size={13} className="text-orange-500 dark:text-orange-400 shrink-0" />
                    <span className="font-sans font-medium">{evt.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin size={13} className="text-slate-500 shrink-0" />
                    <span className="font-sans font-light line-clamp-1">{evt.location}</span>
                  </div>
                </div>

                {/* RSVP Call-to-action */}
                <button
                  onClick={() => onJoinClick(evt.wingName, evt.title)}
                  className="w-full mt-2 inline-flex items-center justify-center space-x-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 py-2 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors shadow-sm"
                >
                  <BellRing size={12} className="text-orange-500 dark:text-orange-400" />
                  <span>RSVP / Join Event</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic empty state */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-16 bg-slate-100/50 dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-900 rounded-3xl">
            <p className="text-slate-500 font-sans text-sm">No gatherings currently listed under this wing. Stay tuned for updates!</p>
          </div>
        )}

      </div>
    </section>
  );
}
