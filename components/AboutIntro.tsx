import { type SiteContent } from "@/lib/supabase";

export default function AboutIntro({ content }: { content: SiteContent[] }) {
  const item = content[0];
  if (!item) return null;

  return (
    <section className="pt-12 pb-10 md:pt-16 md:pb-12 bg-background">
      <div className="container-custom max-w-3xl">
        <p className="eyebrow mb-3">Who We Are</p>
        <h2 className="heading-section text-foreground mb-6">
          {item.title || ""}
        </h2>
        <div className="gold-divider mt-4 mb-8" />
        {item.body && (
          <p className="body-text leading-relaxed text-muted-foreground text-lg">
            {item.body}
          </p>
        )}
      </div>
    </section>
  );
}
