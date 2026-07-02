"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getProjectsByCategory, type Project } from "@/lib/supabase";
import { slugify } from "@/lib/slugify";

const FILTERS = ["All", "Residential", "Commercial", "Institutional", "Temple", "Complex"] as const;

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    getProjectsByCategory("key").then(data => {
      if (data.length > 0) setProjects(data);
    });
  }, []);

  const filtered = projects.filter(p => filter === "All" || p.type === filter);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const activeIndex = useTransform(scrollYProgress, (v) =>
    Math.min(Math.floor(v * filtered.length), filtered.length - 1)
  );

  const [index, setIndex] = useState(0);
  const safeIndex = Math.min(index, Math.max(filtered.length - 1, 0));
  const circlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = circlesRef.current;
    if (!el) return;
    const activeEl = el.children[safeIndex] as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [safeIndex]);

  useEffect(() => {
    const unsub = activeIndex.on("change", (v) => setIndex(v));
    return () => unsub();
  }, [activeIndex]);

  return (
    <section ref={sectionRef} className="relative isolate" style={{ height: `${Math.max(projects.length, 1) * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-background z-0">
        <div className="container-custom h-full flex flex-col justify-center">
          <div className="mb-4">
            <p className="eyebrow mb-3">Our Portfolio</p>
            <h2 className="heading-section text-foreground">Key Projects</h2>
            <div className="gold-divider mt-4 mb-6" />
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    filter === f
                      ? "bg-foreground text-background"
                      : "bg-secondary/30 border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-6 md:gap-16 items-start flex-1 overflow-hidden" style={{ maxHeight: "calc(100vh - 260px)" }}>
            {filtered.length === 0 ? (
              <p className="text-muted-foreground py-8">No projects match this filter.</p>
            ) : (
              <>
                <div
                  className="hidden md:flex flex-col items-center flex-shrink-0 relative"
                  style={{ height: "calc(100vh - 260px)" }}
                >
                  <div className="absolute top-0 bottom-0 w-px bg-foreground/15 left-1/2 -translate-x-1/2 z-0" />
                  <div ref={circlesRef} className="relative z-10 flex flex-col items-center gap-5 overflow-y-auto scrollbar-hide h-full py-2 w-14">
                    {filtered.map((project, i) => {
                      const isActive = i === safeIndex;
                      return (
                        <Link
                          key={project.id}
                          href={`/projects/${slugify(project.title)}`}
                          className="flex-shrink-0"
                        >
                          <div
                            className={`rounded-full flex items-center justify-center font-display transition-all duration-500 border ${
                              isActive
                                ? "w-12 h-12 text-sm bg-foreground text-background border-foreground scale-110 shadow-lg"
                                : "w-10 h-10 text-xs bg-background text-foreground/40 border-foreground/20 hover:border-foreground/50 hover:text-foreground hover:scale-105"
                            }`}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-1 relative h-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={index}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="absolute inset-0"
                    >
                      <Link
                        href={`/projects/${slugify(filtered[safeIndex].title)}`}
                        className="block w-full h-full relative overflow-hidden group"
                        style={{ borderRadius: "var(--radius)" }}
                      >
                        <Image
                          src={filtered[safeIndex].image_url}
                          alt={filtered[safeIndex].title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                          <h3 className="font-display text-3xl text-white mb-2">
                            {filtered[safeIndex].title}
                          </h3>
                          <p className="text-white/70 text-sm max-w-xl line-clamp-2">
                            {filtered[safeIndex].description}
                          </p>
                          <div className="project-card-arrow opacity-100 mt-4">
                            View project <ArrowUpRight size={14} />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
