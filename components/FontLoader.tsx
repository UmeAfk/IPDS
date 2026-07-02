"use client";

import { useEffect } from "react";
import { getSiteFont } from "@/lib/supabase";

export default function FontLoader() {
  useEffect(() => {
    getSiteFont().then(font => {
      if (!font || font === "Arsenal") return;
      const map: Record<string, string> = {
        "Playfair Display": "'Playfair Display', serif",
        "DM Serif Display": "'DM Serif Display', serif",
        "Cormorant Garamond": "'Cormorant Garamond', serif",
        "Fraunces": "'Fraunces', serif",
        "Libre Baskerville": "'Libre Baskerville', serif",
        "Plus Jakarta Sans": "'Plus Jakarta Sans', sans-serif",
      };
      if (map[font]) {
        document.documentElement.style.setProperty("--font-display", map[font]);
      }
    });
  }, []);
  return null;
}
