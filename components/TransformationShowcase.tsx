"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { getSiteContent, type SiteContent } from "@/lib/supabase";

export default function TransformationShowcase() {
  const [items, setItems] = useState<SiteContent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    getSiteContent("transformation").then(data => { setItems(data); setLoaded(true); });
  }, []);

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <MotionDiv key={idx} {...motionProps}>
              <div
                className="overflow-hidden bg-muted border border-border hover:border-accent/30 transition-all duration-250"
                style={{ borderRadius: "var(--radius)" }}
              >
                <div className="aspect-[4/3] relative">
                  <img
                    src={(stage as any).media_url || ""}
                    alt={stage.body || ""}
                    className="w-full h-full object-cover"
                  />
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
    </section>
  );
}
