"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { getSiteContent, type SiteContent } from "@/lib/supabase";

export default function Achievements() {
  const [stats, setStats] = useState<SiteContent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    getSiteContent("stats").then(data => { setStats(data); setLoaded(true); });
  }, []);

  if (!loaded || stats.length === 0) return null;

  return (
    <section id="work" ref={ref} className="section-padding bg-card relative z-10">
      <div className="container-custom">
        <p className="eyebrow text-center mb-3">Our Impact</p>
        <h2 className="heading-section text-foreground text-center">By the Numbers</h2>
        <div className="gold-divider mx-auto mt-4 mb-12" />
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0">
          {stats.map((stat, idx) => {
            const MotionTag = inView ? motion.p : "p";
            const motionProps = inView
              ? {
                  initial: { opacity: 0, y: 24 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.6, delay: idx * 0.08 },
                }
              : {};
            return (
              <div key={idx} className="flex items-center">
                <div className="text-center px-8 md:px-12">
                  <MotionTag
                    {...motionProps}
                    className="font-display text-5xl md:text-6xl text-accent"
                  >
                    {stat.subtitle}
                  </MotionTag>
                  <p className="eyebrow mt-3">{stat.title}</p>
                </div>
                {idx < stats.length - 1 && (
                  <div className="hidden md:block w-px h-12 bg-border" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
