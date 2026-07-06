import { type SiteContent } from "@/lib/supabase";
import { toEmbedUrl } from "@/lib/utils";

export default function VideoShowcase({ videos }: { videos: SiteContent[] }) {
  if (videos.length === 0) return null;

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <p className="eyebrow mb-3">In Action</p>
        <h2 className="heading-section text-foreground">Watch Our Work</h2>
        <div className="gold-divider mt-4 mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v, i) => (
            <div key={v.id || i} className="rounded-2xl overflow-hidden border border-border">
              <div className="aspect-video">
                <iframe
                  src={toEmbedUrl(v.media_url || "")}
                  title={v.title || ""}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <p className="font-display text-foreground line-clamp-2">{v.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
