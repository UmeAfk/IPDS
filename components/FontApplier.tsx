"use client";

import { useEffect } from "react";
import { type SiteContent } from "@/lib/supabase";

const FONT_STACKS: Record<string, string> = {
  "Playfair Display": "'Playfair Display', serif",
  "DM Serif Display": "'DM Serif Display', serif",
  "Cormorant Garamond": "'Cormorant Garamond', serif",
  "Fraunces": "'Fraunces', serif",
  "Libre Baskerville": "'Libre Baskerville', serif",
  "Plus Jakarta Sans": "'Plus Jakarta Sans', sans-serif",
  "Cinzel": "'Cinzel', serif",
  "Inter": "'Inter', sans-serif",
  "Lora": "'Lora', serif",
  "Merriweather": "'Merriweather', serif",
  "Open Sans": "'Open Sans', sans-serif",
  "Source Sans 3": "'Source Sans 3', sans-serif",
  "Work Sans": "'Work Sans', sans-serif",
  "Nunito": "'Nunito', sans-serif",
  "JetBrains Mono": "'JetBrains Mono', monospace",
  "Fira Code": "'Fira Code', monospace",
  "IBM Plex Mono": "'IBM Plex Mono', monospace",
  "Space Mono": "'Space Mono', monospace",
  "Source Code Pro": "'Source Code Pro', monospace",
  "Roboto Mono": "'Roboto Mono', monospace",
  "Courier Prime": "'Courier Prime', monospace",
  "Inconsolata": "'Inconsolata', monospace",
};

export default function FontApplier({ settings }: { settings: SiteContent[] }) {
  useEffect(() => {
    const displayFont = settings.find(s => s.title === "font_display")?.body;
    const bodyFont = settings.find(s => s.title === "font_body")?.body;
    const monoFont = settings.find(s => s.title === "font_mono")?.body;

    if (displayFont && displayFont !== "Arsenal" && FONT_STACKS[displayFont]) {
      document.documentElement.style.setProperty("--font-display", FONT_STACKS[displayFont]);
    }
    if (bodyFont && bodyFont !== "Rubik" && FONT_STACKS[bodyFont]) {
      document.documentElement.style.setProperty("--font-body", FONT_STACKS[bodyFont]);
    }
    if (monoFont && monoFont !== "monospace" && FONT_STACKS[monoFont]) {
      document.documentElement.style.setProperty("--font-mono", FONT_STACKS[monoFont]);
    }
  }, [settings]);
  return null;
}
