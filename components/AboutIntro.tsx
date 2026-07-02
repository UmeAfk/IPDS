"use client";

import { useEffect, useState } from "react";
import { getSiteContent } from "@/lib/supabase";

export default function AboutIntro() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSiteContent("intro").then(data => {
      if (data[0]) {
        setTitle(data[0].title || "");
        setText(data[0].body || "");
      }
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;

  return (
    <section className="pt-12 pb-10 md:pt-16 md:pb-12 bg-background">
      <div className="container-custom max-w-3xl">
        <p className="eyebrow mb-3">Who We Are</p>
        <h2 className="heading-section text-foreground mb-6">
          {title}
        </h2>
        <div className="gold-divider mt-4 mb-8" />
        {text && (
          <p className="body-text leading-relaxed text-muted-foreground text-lg">
            {text}
          </p>
        )}
      </div>
    </section>
  );
}
