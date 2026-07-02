"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ZoomIn, X } from "lucide-react";
import { getSiteContent, type SiteContent } from "@/lib/supabase";

export default function TransformationShowcase() {
  const [items, setItems] = useState<SiteContent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    getSiteContent("transformation").then(data => { setItems(data); setLoaded(true); });
  }, []);

  const [lightbox, setLightbox] = useState<string | null>(null);

  if (!loaded) return null;

  const heading = items.find(i => i.title)?.title || "";
  const stages = items.filter(i => i.body).length > 0 ? items.filter(i => i.body) : [];

  return (
    <section className="section-padding bg-background" ref={ref}>
      <div className="container-custom">
        <p className="eyebrow text-center mb-3">Our Process</p>
        <h2 className="heading-section text-foreground text-center max-w-3xl mx-auto">
          {heading}
        </h2>
        <div className="gold-divider mt-4 mb-12 mx-auto" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {stages.map((stage, idx) => {
            const MotionDiv = inView ? motion.div : "div";
            const motionProps = inView
              ? {
                  initial: { opacity: 0, y: 24 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.6, delay: idx * 0.1 },
                }
              : {};
            return (
            <MotionDiv key={idx} {...motionProps} className="h-full">
              <div
                className="overflow-hidden bg-muted border border-border hover:border-accent/30 transition-all duration-250 flex flex-col h-full"
                style={{ borderRadius: "var(--radius)" }}
              >
                <div
                  className="relative h-80 cursor-zoom-in"
                  onClick={() => setLightbox((stage as any).media_url || "")}
                >
                  <Image
                    src={(stage as any).media_url || ""}
                    alt={stage.body || ""}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                      <ZoomIn size={18} className="text-foreground" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-mono uppercase tracking-widest text-accent mb-1">
                    Stage {idx + 1}
                  </p>
                  <p className="heading-card text-foreground">{stage.body}</p>
                </div>
              </div>
              </MotionDiv>
          ); })}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10"
            onClick={() => setLightbox(null)}
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[85vh]"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setLightbox(null)}
                className="absolute -top-10 right-0 text-white/70 hover:text-white flex items-center gap-2 text-sm transition-colors"
              >
                <X size={18} /> Close
              </button>
              <div className="relative w-full h-[75vh] rounded-2xl overflow-hidden">
                <Image
                  src={lightbox}
                  alt="Stage view"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
