"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Download, FileText } from "lucide-react";
import type { Project, BlogSection } from "@/lib/supabase";
import { getDownloadsConfig } from "@/lib/supabase";

export default function ProjectPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setProject)
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) return notFound();

  const heroImage = project.image_url || "";
  const thumb1 = project.gallery_updates?.[0]?.media_url || project.image_url_dark || "";
  const thumb2 = project.gallery_updates?.[1]?.media_url || project.image_url_light || "";

  return (
    <>
      <main>
        <div className="bg-background border-b border-border sticky top-0 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Link href="/#projects" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors">
              ← Back to Projects
            </Link>
          </div>
        </div>

        <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
          <Image
            src={heroImage}
            alt={project.title}
            fill
            className="object-cover"
            priority
            unoptimized
            sizes="100vw"
          />
        </div>

        <section className="bg-background">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20">
              <div>
                <p className="eyebrow mb-3">{project.type} · {project.location}</p>
                <div className="gold-divider mb-6" />
                <h1 className="heading-hero text-foreground mb-6">
                  {project.title}
                </h1>
                {project.year && (
                  <p className="font-mono text-xs text-muted-foreground mb-6 tracking-wide uppercase">
                    RERA: {project.title.slice(0, 3).toUpperCase()}/{project.year}/{project.location.slice(0, 4).toUpperCase()}
                  </p>
                )}
                <p className="body-text">
                  {project.long_description || project.description}
                </p>
              </div>

              <div className="space-y-6">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
                  <Image
                    src={thumb1}
                    alt={`${project.title} view 1`}
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
                  <Image
                    src={thumb2}
                    alt={`${project.title} view 2`}
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                {(() => {
                  const dl = getDownloadsConfig(project.narrative_sections || []);
                  return (
                    <div className="flex flex-wrap gap-3">
                      {dl.show_brochure && dl.brochure_url && (
                        <a
                          href={dl.brochure_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-all text-xs font-bold uppercase tracking-widest"
                        >
                          <Download size={14} /> Brochure
                        </a>
                      )}
                      {dl.show_rera && dl.rera_url && (
                        <a
                          href={dl.rera_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-all text-xs font-bold uppercase tracking-widest"
                        >
                          <FileText size={14} /> RERA
                        </a>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-16" style={{ background: "#b8922a" }}>
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <h2 className="heading-section text-white text-center md:text-left">
              Interested in this project?
            </h2>
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium text-[#b8922a] bg-white hover:bg-white/90 transition-all"
            >
              Get in Touch
              <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
