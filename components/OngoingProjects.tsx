"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Project } from "@/lib/supabase";

const FILTERS = ["All", "Residential", "Commercial", "Institutional", "Temple", "Complex"] as const;

export default function OngoingProjects({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [filter, setFilter] = useState<string>("All");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const filtered = useMemo(
    () => projects.filter(p => filter === "All" || p.type === filter),
    [projects, filter]
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons);
    return () => el.removeEventListener("scroll", updateScrollButtons);
  }, [filter, projects]);

  return (
    <section className="pt-8 pb-20 md:pt-10 md:pb-28 bg-background" ref={ref}>
      <div className="container-custom mb-12">
        <p className="eyebrow mb-3">Current Works</p>
        <h2 className="heading-section text-foreground">Ongoing Redevelopment Projects</h2>
        <div className="gold-divider mt-6 mb-8" />
        <div className="flex flex-wrap gap-3 mb-10">
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

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-16 italic">No projects match this filter.</p>
      ) : (
        <div className="w-full px-6">
          <div className="relative overflow-hidden">
            <div
              ref={scrollRef}
              className="project-row overflow-x-auto scrollbar-hide"
              style={{ height: "500px", scrollBehavior: "smooth" }}
            >
              {filtered.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.2) }}
                  className="project-card"
                  style={{
                    flex:
                      hoveredIdx === idx
                        ? 5
                        : hoveredIdx === null && idx === 0
                          ? 3
                          : 1,
                    minWidth: "80px",
                    maxWidth: hoveredIdx === idx ? "600px" : undefined,
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <Image
                    src={project.image_url || "/images/JyotiVilla.jpg"}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                  <div className="project-card-label">
                    <h3>{project.title}</h3>
                    <p
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.5)",
                        marginTop: "4px",
                      }}
                    >
                      {project.location}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {canScrollLeft && (
              <button
                onClick={() =>
                  scrollRef.current?.scrollBy({ left: -400, behavior: "smooth" })
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-all"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={() =>
                  scrollRef.current?.scrollBy({ left: 400, behavior: "smooth" })
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-all"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-center mt-12"
      >
        <p className="font-display italic text-xl text-muted-foreground">
          ...and 150+ projects at discussion stage.
        </p>
      </motion.div>
    </section>
  );
}
