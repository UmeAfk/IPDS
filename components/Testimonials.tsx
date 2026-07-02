"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Play } from "lucide-react";
import { getSiteContent, type SiteContent } from "@/lib/supabase";
import { toEmbedUrl } from "@/lib/utils";

function TestimonialCard({ t, onPlayVideo }: { t: SiteContent; onPlayVideo?: (url: string) => void }) {
  return (
    <div className="bg-card border border-border p-8 rounded-2xl flex flex-col gap-6 min-w-[320px] max-w-[400px]">
      {t.media_url && t.media_type === "image" && (
        <div className="relative h-40 rounded-xl overflow-hidden">
          <Image src={t.media_url} alt={t.author_name || ""} fill className="object-cover" />
        </div>
      )}
      {t.media_url && (t.media_type === "video" || t.media_type === "youtube") && (
        <div
          className="relative cursor-pointer group"
          onClick={() => onPlayVideo?.(t.media_url!)}
        >
          <div className="aspect-video rounded-xl overflow-hidden bg-black/20 relative">
            {t.thumbnail_url ? (
              <Image src={t.thumbnail_url} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-foreground/5" />
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
              <Play size={18} className="text-foreground ml-1" fill="currentColor" />
            </div>
          </div>
        </div>
      )}
      <span className="text-accent font-display text-5xl leading-none">&quot;</span>
      <p className="body-text text-foreground leading-relaxed flex-1">{t.body}</p>
      <div className="border-t border-border pt-4">
        <p className="font-medium text-foreground">{t.author_name}</p>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-1">
          {t.author_role}
        </p>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<SiteContent[]>([]);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    getSiteContent("testimonial").then(setTestimonials);
  }, []);

  if (testimonials.length === 0) return null;

  const tripled = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section className="section-padding bg-background overflow-hidden">
      <div className="container-custom mb-12">
        <p className="eyebrow mb-3">Client Stories</p>
        <h2 className="heading-section text-foreground">What Our Clients Say</h2>
        <div className="gold-divider mt-4 mb-8" />
      </div>
      <div className="overflow-hidden">
        <div
          className="flex gap-6"
          style={{
            animation: "marquee 40s linear infinite",
            width: "max-content",
            paddingLeft: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.animationPlayState = "paused")}
          onMouseLeave={e => (e.currentTarget.style.animationPlayState = "running")}
        >
          {tripled.map((t, i) => (
            <TestimonialCard key={`${t.id}-${i}`} t={t} onPlayVideo={setActiveVideo} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10"
            onClick={() => setActiveVideo(null)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-background rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-all"
              >
                <X size={16} />
              </button>
              <div className="aspect-video w-full">
                {activeVideo.includes("youtube.com") || activeVideo.includes("youtu.be") ? (
                  <iframe
                    src={toEmbedUrl(activeVideo) + "?autoplay=1"}
                    className="w-full h-full"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={activeVideo}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
