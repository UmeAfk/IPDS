"use client";

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

  useEffect(() => {
    const unsub = activeIndex.on("change", (v) => setIndex(v));
    return () => unsub();
  }, [activeIndex]);

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${Math.max(projects.length, 1) * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-background">
        <div className="container-custom h-full flex flex-col justify-center">
          <div className="mb-8">
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

          <div className="flex gap-16 items-center flex-1 max-h-[70vh]">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground py-8">No projects match this filter.</p>
            ) : (
              <>
                <div className="flex flex-col gap-6 flex-shrink-0">
                  {filtered.map((project, i) => {
                    const isActive = i === index;
                    return (
                      <Link
                        key={project.id}
                        href={`/projects/${slugify(project.title)}`}
                        className={`w-14 h-14 rounded-full flex items-center justify-center font-display text-lg transition-all duration-500 ${
                          isActive
                            ? "bg-foreground text-background scale-110"
                            : "border border-foreground/20 text-foreground/50 hover:border-foreground/50 hover:text-foreground/80"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </Link>
                    );
                  })}
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
                        href={`/projects/${slugify(filtered[index].title)}`}
                        className="block w-full h-full relative overflow-hidden group"
                        style={{ borderRadius: "var(--radius)" }}
                      >
                        <img
                          src={filtered[index].image_url}
                          alt={filtered[index].title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                          <h3 className="font-display text-3xl text-white mb-2">
                            {filtered[index].title}
                          </h3>
                          <p className="text-white/70 text-sm max-w-xl line-clamp-2">
                            {filtered[index].description}
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
