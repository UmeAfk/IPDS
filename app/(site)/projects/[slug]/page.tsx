"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Download, FileText, ChevronLeft, ChevronRight, X, Play, Loader2 } from "lucide-react";
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

  // Helper functions for YouTube URLs & thumbnails
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return m ? m[1] : null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const id = getYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : undefined;
  };

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
        items.push({
          type: "youtube",
          url: u.media_url,
          thumb: u.thumbnail_url || getYouTubeThumbnail(u.media_url),
          caption: u.caption
        });
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
  }, [lightboxOpen, goTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-accent" />
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl font-semibold mb-4">Project Not Found</h1>
        <p className="text-muted-foreground mb-8">The project you are looking for does not exist or has been removed.</p>
        <button onClick={() => router.push("/")} className="h-10 px-6 rounded-xl bg-accent text-accent-foreground text-xs font-bold uppercase tracking-widest">
          Back to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* HERO SECTION */}
      <section className="relative w-full aspect-[2/1] min-h-[320px] max-h-[580px] bg-neutral-950 overflow-hidden">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={project.title}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950" />
        )}

        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none z-10" />

        {/* Smooth transparent bottom fade — blends image naturally into page */}
        <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none z-10" />

        {/* Header bar controls */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-white hover:bg-black/60 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <ThemeToggle />
        </div>
      </section>

      {/* MAIN CONTENT SECTION */}
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
                    <div className="flex flex-wrap gap-3 mt-1">
                      {finalBrochure && (
                        <a
                          href={finalBrochure}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-all text-xs font-bold uppercase tracking-widest shadow-md"
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

            {/* IMAGE / VIDEO GALLERY */}
            <div className="rounded-2xl border border-border shadow-lg overflow-hidden bg-card self-start">
              {/* Featured Viewer */}
              <div className="group relative aspect-[4/3] overflow-hidden bg-muted">
                {currentItem ? (
                  currentItem.type === "image" ? (
                    <div className="relative w-full h-full cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
                      <Image
                        src={currentItem.url}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ) : currentItem.type === "video" ? (
                    <video
                      src={currentItem.url}
                      poster={currentItem.thumb}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                    />
                  ) : currentItem.type === "youtube" ? (
                    getYouTubeId(currentItem.url) ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(currentItem.url)}?autoplay=1&rel=0`}
                        title={project.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={currentItem.url}
                        poster={currentItem.thumb}
                        className="w-full h-full object-cover"
                        controls
                        playsInline
                      />
                    )
                  ) : null
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}

                {/* Type indicator badge */}
                {currentItem && currentItem.type !== "image" && (
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 z-10 pointer-events-none">
                    <Play size={12} className="text-brand-accent fill-brand-accent" />
                    {currentItem.type === "youtube" ? "YouTube Walkthrough" : "Video"}
                  </div>
                )}

                {/* Nav arrows */}
                {galleryItems.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); goTo(-1); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/70 z-20"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); goTo(1); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/70 z-20"
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

        {/* PROJECT WALKTHROUGH & 3D TOUR CARD SECTION */}
        {(() => {
          const walkthroughUrl = project.stream_url || (project.gallery_updates || []).find((u: any) => u.media_type === "youtube")?.media_url;
          const ytId = walkthroughUrl ? getYouTubeId(walkthroughUrl) : null;
          const dlConfig = getDownloadsConfig(project.narrative_sections || []);
          const displayTitle = dlConfig.walkthrough_title || "Project Walkthrough & 3D Tour";

          if (!walkthroughUrl && !ytId) return null;

          return (
            <section className="w-full py-8 md:py-14 bg-background">
              <div className="max-w-7xl mx-auto px-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                      {displayTitle}
                    </h2>
                  </div>
                </div>

                <div className="relative aspect-video rounded-3xl overflow-hidden border border-border shadow-2xl bg-black">
                  {ytId ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0`}
                      title={`${project.title} Walkthrough`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : walkthroughUrl?.endsWith(".mp4") || walkthroughUrl?.endsWith(".webm") ? (
                    <video
                      src={walkthroughUrl}
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <iframe
                      src={walkthroughUrl}
                      title={`${project.title} Tour`}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            </section>
          );
        })()}

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
    </div>
  );
}
