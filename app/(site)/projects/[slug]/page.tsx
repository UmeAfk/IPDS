"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Download, FileText, ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import type { Project, BlogSection, SiteUpdate } from "@/lib/supabase";
import { getDownloadsConfig } from "@/lib/supabase";
import ThemeToggle from "@/components/ThemeToggle";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeThumbRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${slug}`, { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setProject)
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => { setMounted(true); }, []);

  // Auto-scroll active thumbnail into view in the horizontal filmstrip
  useEffect(() => {
    if (activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeGalleryIndex]);

  // Always pick the best available image. Before mount (SSR/hydration), fall back
  // through all options so we never pass an empty string to <Image>.
  const heroImage =
    (mounted && theme === "dark" && project?.image_url_dark) ||
    (mounted && theme === "light" && project?.image_url_light) ||
    project?.image_url ||
    project?.image_url_dark ||
    project?.image_url_light ||
    "";

  // Build gallery images: hero image first, then all gallery_updates (images + videos with thumbnails)
  const galleryItems = useMemo(() => {
    const items: Array<{ type: "image" | "video" | "youtube"; url: string; thumb?: string; caption?: string }> = [];
    if (heroImage) items.push({ type: "image", url: heroImage });
    (project?.gallery_updates || []).forEach((u: SiteUpdate) => {
      if (u.media_type === "image") {
        items.push({ type: "image", url: u.media_url, caption: u.caption });
      } else if (u.media_type === "video") {
        items.push({ type: "video", url: u.media_url, thumb: u.thumbnail_url, caption: u.caption });
      } else if (u.media_type === "youtube") {
        items.push({ type: "youtube", url: u.media_url, caption: u.caption });
      }
    });
    return items;
  }, [project, heroImage]);

  const currentItem = galleryItems[activeGalleryIndex] || galleryItems[0] || null;

  const goTo = useCallback((dir: -1 | 1) => {
    if (galleryItems.length === 0) return;
    setActiveGalleryIndex(i => {
      const n = i + dir;
      if (n < 0) return galleryItems.length - 1;
      if (n >= galleryItems.length) return 0;
      return n;
    });
  }, [galleryItems.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goTo(-1);
      if (e.key === "ArrowRight") goTo(1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, galleryItems.length, goTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) return notFound();

  return (
    <>
      <main>
        {/* HERO BANNER — Full uncropped image with transparent bottom fade */}
        <div className="relative w-full overflow-hidden bg-background">
          {heroImage ? (
            <div className="relative w-full aspect-[16/9] md:aspect-[2/1] max-h-[80vh]">
              <Image
                src={heroImage}
                alt={project.title}
                fill
                className="object-cover object-center"
                priority
                sizes="100vw"
              />
              {/* Smooth transparent fade at bottom — blends image into page */}
              <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="w-full aspect-[21/9] bg-neutral-900" />
          )}

          {/* Floating nav row */}
          <div className="absolute top-0 inset-x-0 z-20 p-4 md:p-6 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-white hover:bg-black/60 transition-all"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <ThemeToggle />
          </div>
        </div>

        <section className="bg-background relative z-10">
          <div className="max-w-7xl mx-auto px-6 pt-12 md:pt-20 pb-16 md:pb-24">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20">
              <div>
                <p className="eyebrow mb-3">{project.type} · {project.location}</p>
                <div className="gold-divider mb-6" />
                <h1 className="heading-hero text-foreground mb-6">
                  {project.title}
                </h1>
                {/* Short Description (Overview Lead) */}
                {project.description && (
                  <div 
                    className="text-base md:text-lg font-medium text-foreground/90 leading-relaxed mb-6 space-y-2 font-sans"
                    dangerouslySetInnerHTML={{ __html: project.description }}
                  />
                )}

                {/* Long Description (Full Story Narrative) */}
                {project.long_description && project.long_description !== project.description && (
                  <div 
                    className="body-text leading-relaxed mb-8 text-muted-foreground whitespace-pre-line font-sans"
                    dangerouslySetInnerHTML={{ __html: project.long_description }}
                  />
                )}

                {(() => {
                  const dl = getDownloadsConfig(project.narrative_sections || []);
                  const finalBrochure = dl.brochure_url;
                  const finalReraUrl = dl.rera_url;
                  const reraNum = dl.rera_number;

                  if (!finalBrochure && !finalReraUrl && !reraNum) return null;

                  return (
                    <div className="flex flex-col gap-3 mt-6">
                      {reraNum && (
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-secondary/40 border border-border text-xs font-mono tracking-wider text-muted-foreground w-fit">
                          <span className="font-bold text-foreground">RERA:</span> {reraNum}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3">
                        {finalBrochure && (
                          <a
                            href={finalBrochure}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-all text-xs font-bold uppercase tracking-widest"
                          >
                            <Download size={14} /> Download Brochure
                          </a>
                        )}
                        {finalReraUrl && (
                          <a
                            href={finalReraUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-all text-xs font-bold uppercase tracking-widest"
                          >
                            <FileText size={14} /> RERA Document / QR
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* IMAGE GALLERY */}
              <div className="rounded-2xl border border-border shadow-lg overflow-hidden bg-card self-start">
                {/* Featured Viewer */}
                <div
                  className="group relative aspect-[4/3] overflow-hidden cursor-zoom-in bg-muted"
                  onClick={() => galleryItems.length > 0 && setLightboxOpen(true)}
                >
                  {currentItem ? (
                    currentItem.type === "image" ? (
                      <Image
                        src={currentItem.url}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : currentItem.type === "video" ? (
                      <video
                        src={currentItem.url}
                        poster={currentItem.thumb}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                          <Play size={28} />
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}

                  {/* Type indicator */}
                  {currentItem && currentItem.type !== "image" && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5">
                      <Play size={12} /> Video
                    </div>
                  )}

                  {/* Nav arrows */}
                  {galleryItems.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); goTo(-1); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/70"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); goTo(1); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/70"
                        aria-label="Next image"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {/* Caption */}
                  {currentItem?.caption && (
                    <div className="absolute bottom-4 left-4 right-4 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md text-white text-sm">
                      {currentItem.caption}
                    </div>
                  )}
                </div>

                {/* Thumbnail Filmstrip — compact horizontal previews at bottom */}
                {galleryItems.length > 0 && (
                  <div className="px-2.5 py-2.5 md:px-3 md:py-3 border-t border-border bg-background/60">
                    <div className="flex gap-2 md:gap-2.5 overflow-x-auto no-scrollbar">
                      {galleryItems.map((item, idx) => (
                        <button
                          key={idx}
                          ref={idx === activeGalleryIndex ? activeThumbRef : null}
                          onClick={() => setActiveGalleryIndex(idx)}
                          className={`relative flex-shrink-0 h-[56px] md:h-[68px] w-[90px] md:w-[110px] rounded-lg overflow-hidden transition-all border-2 ${idx === activeGalleryIndex
                            ? "border-accent shadow-md"
                            : "border-transparent opacity-65 hover:opacity-100 hover:border-border"
                            }`}
                        >
                          {item.type === "image" ? (
                            <Image
                              src={item.url}
                              alt={`${project.title} ${idx + 1}`}
                              fill
                              className="object-cover"
                              sizes="110px"
                            />
                          ) : (
                            <>
                              {item.thumb ? (
                                <Image
                                  src={item.thumb}
                                  alt={`${project.title} ${idx + 1}`}
                                  fill
                                  className="object-cover"
                                  sizes="110px"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center" />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                                <div className="w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white">
                                  <Play size={12} />
                                </div>
                              </div>
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxOpen && currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/10 flex items-center justify-center z-10"
              aria-label="Close"
            >
              <X size={22} />
            </button>

            {/* Nav arrows */}
            {galleryItems.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goTo(-1); }}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/10 flex items-center justify-center z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goTo(1); }}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/10 flex items-center justify-center z-10"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Content */}
            <div
              className="relative w-[90vw] h-[85vh] max-w-[1600px]"
              onClick={(e) => e.stopPropagation()}
            >
              {currentItem.type === "image" ? (
                <motion.div
                  key={currentItem.url}
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={currentItem.url}
                    alt={project.title}
                    fill
                    className="object-contain"
                    sizes="90vw"
                    quality={100}
                  />
                </motion.div>
              ) : currentItem.type === "video" ? (
                <video
                  src={currentItem.url}
                  poster={currentItem.thumb}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <a
                      href={currentItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
                    >
                      <Play size={20} /> Open YouTube Video
                    </a>
                  </div>
                </div>
              )}

              {/* Caption */}
              {currentItem.caption && (
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white text-lg text-center">{currentItem.caption}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
