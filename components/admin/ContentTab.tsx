"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, Save, Upload, Check, X } from "lucide-react";
import { getSiteContent, getAllSiteContent, upsertSiteContent, deleteSiteContent, uploadSiteContentMedia, setSiteFont, type SiteContent } from "@/lib/supabase";

const DISPLAY_FONTS = [
  { name: "Arsenal", label: "Arsenal (Default)", style: "'Arsenal', serif" },
  { name: "Playfair Display", label: "Playfair Display", style: "'Playfair Display', serif" },
  { name: "DM Serif Display", label: "DM Serif Display", style: "'DM Serif Display', serif" },
  { name: "Cormorant Garamond", label: "Cormorant Garamond", style: "'Cormorant Garamond', serif" },
  { name: "Fraunces", label: "Fraunces", style: "'Fraunces', serif" },
  { name: "Libre Baskerville", label: "Libre Baskerville", style: "'Libre Baskerville', serif" },
  { name: "Plus Jakarta Sans", label: "Plus Jakarta Sans", style: "'Plus Jakarta Sans', sans-serif" },
  { name: "Cinzel", label: "Cinzel", style: "'Cinzel', serif" },
];

const BODY_FONTS = [
  { name: "Rubik", label: "Rubik (Default)", style: "'Rubik', sans-serif" },
  { name: "Inter", label: "Inter", style: "'Inter', sans-serif" },
  { name: "Lora", label: "Lora", style: "'Lora', serif" },
  { name: "Merriweather", label: "Merriweather", style: "'Merriweather', serif" },
  { name: "Open Sans", label: "Open Sans", style: "'Open Sans', sans-serif" },
  { name: "Source Sans 3", label: "Source Sans 3", style: "'Source Sans 3', sans-serif" },
  { name: "Work Sans", label: "Work Sans", style: "'Work Sans', sans-serif" },
  { name: "Nunito", label: "Nunito", style: "'Nunito', sans-serif" },
];

const MONO_FONTS = [
  { name: "monospace", label: "System Mono (Default)", style: "monospace" },
  { name: "JetBrains Mono", label: "JetBrains Mono", style: "'JetBrains Mono', monospace" },
  { name: "Fira Code", label: "Fira Code", style: "'Fira Code', monospace" },
  { name: "IBM Plex Mono", label: "IBM Plex Mono", style: "'IBM Plex Mono', monospace" },
  { name: "Space Mono", label: "Space Mono", style: "'Space Mono', monospace" },
  { name: "Source Code Pro", label: "Source Code Pro", style: "'Source Code Pro', monospace" },
  { name: "Roboto Mono", label: "Roboto Mono", style: "'Roboto Mono', monospace" },
  { name: "Courier Prime", label: "Courier Prime", style: "'Courier Prime', monospace" },
];

export default function ContentTab() {
  const [subtab, setSubtab] = useState<"intro" | "video" | "testimonial" | "stats" | "transformation" | "font">("intro");
  const [introTitle, setIntroTitle] = useState("");
  const [introText, setIntroText] = useState("");
  const [introId, setIntroId] = useState<string | null>(null);
  const [videos, setVideos] = useState<SiteContent[]>([]);
  const [testimonials, setTestimonials] = useState<SiteContent[]>([]);
  const [stats, setStats] = useState<SiteContent[]>([]);
  const [transformation, setTransformation] = useState<SiteContent[]>([]);
  const [displayFont, setDisplayFont] = useState("Arsenal");
  const [bodyFont, setBodyFont] = useState("Rubik");
  const [monoFont, setMonoFont] = useState("monospace");
  const [fontTab, setFontTab] = useState<"display" | "body" | "mono">("display");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const fetchAll = async () => {
    const all = await getAllSiteContent();
    const intro = all.find(c => c.section === "intro");
    if (intro) {
      setIntroTitle(intro.title || "");
      setIntroText(intro.body || "");
      setIntroId(intro.id);
    }
    setVideos(all.filter(c => c.section === "video"));
    setTestimonials(all.filter(c => c.section === "testimonial"));
    setStats(all.filter(c => c.section === "stats"));
    setTransformation(all.filter(c => c.section === "transformation"));
    const dFont = all.find(c => c.section === "settings" && c.title === "font_display");
    if (dFont?.body) setDisplayFont(dFont.body);
    const bFont = all.find(c => c.section === "settings" && c.title === "font_body");
    if (bFont?.body) setBodyFont(bFont.body);
    const mFont = all.find(c => c.section === "settings" && c.title === "font_mono");
    if (mFont?.body) setMonoFont(mFont.body);
  };

  useEffect(() => { fetchAll(); }, []);

  const saveIntro = async () => {
    const { error } = await upsertSiteContent({ id: introId || undefined, section: "intro", title: introTitle, body: introText, sort_order: 0, is_active: true });
    if (error) showToast("Failed to save. Try again.", "error");
    else showToast("Saved successfully");
    fetchAll();
  };

  const addVideo = () => {
    setVideos(prev => [...prev, { id: "", section: "video", title: "", media_url: "", media_type: "youtube", sort_order: prev.length, is_active: true } as any]);
  };

  const saveVideo = async (v: SiteContent) => {
    const { error } = await upsertSiteContent(v);
    if (error) showToast("Failed to save. Try again.", "error");
    else showToast("Saved successfully");
    fetchAll();
  };

  const addTestimonial = () => {
    setTestimonials(prev => [...prev, { id: "", section: "testimonial", title: "", body: "", author_name: "", author_role: "", media_url: "", media_type: "image", sort_order: prev.length, is_active: true } as any]);
  };

  const saveTestimonial = async (t: SiteContent) => {
    const { error } = await upsertSiteContent(t);
    if (error) showToast("Failed to save. Try again.", "error");
    else showToast("Saved successfully");
    fetchAll();
  };

  const remove = async (id: string) => {
    if (id) {
      const { error } = await deleteSiteContent(id);
      if (error) showToast("Failed to delete.", "error");
      else showToast("Deleted successfully");
    }
    fetchAll();
  };

  const addStat = () => {
    setStats(prev => [...prev, { id: "", section: "stats", title: "", subtitle: "", sort_order: prev.length, is_active: true } as any]);
  };

  const addTransformationStage = () => {
    setTransformation(prev => [...prev, { id: "", section: "transformation", title: "", body: "", media_url: "", sort_order: prev.length, is_active: true } as any]);
  };

  const tabs = [
    { id: "intro" as const, label: "Intro Text" },
    { id: "stats" as const, label: "Stats" },
    { id: "video" as const, label: "Videos" },
    { id: "testimonial" as const, label: "Testimonials" },
    { id: "transformation" as const, label: "Transformation" },
    { id: "font" as const, label: "Fonts" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSubtab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              subtab === t.id
                ? "bg-foreground text-background"
                : "bg-secondary/30 border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subtab === "intro" && (
        <div className="space-y-4">
          <input
            value={introTitle}
            onChange={e => setIntroTitle(e.target.value)}
            placeholder="Heading text (e.g. Redefining Redevelopment)"
            className="w-full px-4 py-3 rounded-2xl bg-card border border-border text-sm focus:outline-none"
          />
          <textarea
            value={introText}
            onChange={e => setIntroText(e.target.value)}
            rows={6}
            className="w-full p-4 rounded-2xl bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-brand-accent/20"
            placeholder="Enter intro paragraph text..."
          />
          <button onClick={saveIntro} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-foreground text-background text-xs font-bold uppercase tracking-widest">
            <Save size={14} /> Save Intro
          </button>
        </div>
      )}

      {subtab === "stats" && (
        <div className="space-y-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-card border border-border p-4 rounded-2xl flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={s.title || ""}
                  onChange={e => { const copy = [...stats]; copy[i] = { ...copy[i], title: e.target.value }; setStats(copy); }}
                  placeholder="Label (e.g. Projects Delivered)"
                  className="w-full px-4 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none"
                />
                <input
                  value={s.subtitle || ""}
                  onChange={e => { const copy = [...stats]; copy[i] = { ...copy[i], subtitle: e.target.value }; setStats(copy); }}
                  placeholder="Value (e.g. 50+)"
                  className="w-full px-4 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={async () => {
                  const { error } = await upsertSiteContent(s);
                  if (error) showToast("Failed to save.", "error");
                  else showToast("Saved successfully");
                  fetchAll();
                }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-[10px] font-bold uppercase tracking-widest">
                  <Save size={12} /> Save
                </button>
                {s.id && (
                  <button onClick={async () => {
                    const { error } = await deleteSiteContent(s.id);
                    if (error) showToast("Failed to delete.", "error");
                    else showToast("Deleted successfully");
                    fetchAll();
                  }} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-400/30 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
          <button onClick={addStat} className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-dashed border-border text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest">
            <Plus size={14} /> Add Stat
          </button>
        </div>
      )}

      {subtab === "video" && (
        <div className="space-y-4">
          {videos.map((v, i) => (
            <div key={i} className="bg-card border border-border p-4 rounded-2xl flex flex-col gap-3">
              <input
                value={v.title || ""}
                onChange={e => { const copy = [...videos]; copy[i] = { ...copy[i], title: e.target.value }; setVideos(copy); }}
                placeholder="Video title"
                className="w-full px-4 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none"
              />
              <div className="space-y-3">
                <input
                  value={v.media_url || ""}
                  onChange={e => { const copy = [...videos]; copy[i] = { ...copy[i], media_url: e.target.value }; setVideos(copy); }}
                  placeholder="YouTube URL (https://youtube.com/watch?v=...)"
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/30 border border-border text-sm outline-none"
                />
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">or upload from PC</span>
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-secondary/30 border border-border text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all">
                    <Upload size={12} className="inline mr-2" />
                    {saving ? "Uploading..." : "Choose File"}
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setSaving(true);
                        const { url, error } = await uploadSiteContentMedia(file, "video");
                        if (error) {
                          showToast("Upload failed. Check file size.", "error");
                        } else {
                          showToast("Media uploaded");
                          const copy = [...videos];
                          copy[i] = { ...copy[i], media_url: url, media_type: "video" };
                          setVideos(copy);
                        }
                        setSaving(false);
                      }}
                    />
                  </label>
                  {v.media_url && (
                    <span className="text-[10px] text-accent truncate max-w-[200px]">{v.media_url}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => saveVideo(v)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-[10px] font-bold uppercase tracking-widest">
                  <Save size={12} /> Save
                </button>
                {v.id && (
                  <button onClick={() => remove(v.id)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-400/30 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
          <button onClick={addVideo} className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-dashed border-border text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest">
            <Plus size={14} /> Add Video
          </button>
        </div>
      )}

      {subtab === "transformation" && (
        <div className="space-y-4">
          {transformation.map((t, i) => (
            <div key={i} className="bg-card border border-border p-4 rounded-2xl flex flex-col gap-3">
              {i === 0 && (
                <input
                  value={t.title || ""}
                  onChange={e => { const copy = [...transformation]; copy[i] = { ...copy[i], title: e.target.value }; setTransformation(copy); }}
                  placeholder="Heading text"
                  className="w-full px-4 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none"
                />
              )}
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={t.body || ""}
                  onChange={e => { const copy = [...transformation]; copy[i] = { ...copy[i], body: e.target.value }; setTransformation(copy); }}
                  placeholder="Stage label (e.g. Old Building)"
                  className="w-full px-4 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none"
                />
                <input
                  value={t.media_url || ""}
                  onChange={e => { const copy = [...transformation]; copy[i] = { ...copy[i], media_url: e.target.value }; setTransformation(copy); }}
                  placeholder="Image URL"
                  className="w-full px-4 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none"
                />
              </div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/30 border border-border text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all self-start">
                <Upload size={12} />
                {saving ? "Uploading..." : "Upload Image from PC"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setSaving(true);
                    const { url, error } = await uploadSiteContentMedia(file, "transformation");
                    if (error) {
                      showToast("Upload failed. Check file size.", "error");
                    } else {
                      showToast("Image uploaded");
                      const copy = [...transformation];
                      copy[i] = { ...copy[i], media_url: url, media_type: "image" };
                      setTransformation(copy);
                    }
                    setSaving(false);
                  }}
                />
              </label>
              <div className="flex gap-2">
                <button onClick={async () => {
                  const { error } = await upsertSiteContent(t);
                  if (error) showToast("Failed to save.", "error");
                  else showToast("Saved successfully");
                  fetchAll();
                }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-[10px] font-bold uppercase tracking-widest">
                  <Save size={12} /> Save
                </button>
                {t.id && (
                  <button onClick={async () => {
                    const { error } = await deleteSiteContent(t.id);
                    if (error) showToast("Failed to delete.", "error");
                    else showToast("Deleted successfully");
                    fetchAll();
                  }} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-400/30 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
          <button onClick={addTransformationStage} className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-dashed border-border text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest">
            <Plus size={14} /> Add Stage
          </button>
        </div>
      )}

      {subtab === "testimonial" && (
        <div className="space-y-4">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-card border border-border p-4 rounded-2xl flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={t.author_name || ""}
                  onChange={e => { const copy = [...testimonials]; copy[i] = { ...copy[i], author_name: e.target.value }; setTestimonials(copy); }}
                  placeholder="Author name"
                  className="w-full px-4 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none"
                />
                <input
                  value={t.author_role || ""}
                  onChange={e => { const copy = [...testimonials]; copy[i] = { ...copy[i], author_role: e.target.value }; setTestimonials(copy); }}
                  placeholder="Author role (e.g. Secretary, Jyoti Villa CHS)"
                  className="w-full px-4 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none"
                />
              </div>
              <textarea
                value={t.body || ""}
                onChange={e => { const copy = [...testimonials]; copy[i] = { ...copy[i], body: e.target.value }; setTestimonials(copy); }}
                rows={3}
                placeholder="Testimonial quote"
                className="w-full px-4 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none"
              />
              <div className="space-y-3">
                <input
                  value={t.media_url || ""}
                  onChange={e => { const copy = [...testimonials]; copy[i] = { ...copy[i], media_url: e.target.value }; setTestimonials(copy); }}
                  placeholder="Media URL (optional)"
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/30 border border-border text-sm outline-none"
                />
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/30 border border-border text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all">
                  <Upload size={12} />
                  {saving ? "Uploading..." : "Upload Image or Video"}
                  <input
                    type="file"
                    accept="image/*,video/mp4"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setSaving(true);
                      const { url, error } = await uploadSiteContentMedia(file, "testimonial");
                      if (error) {
                        showToast("Upload failed. Check file size.", "error");
                      } else {
                        showToast("Media uploaded");
                        const mediaType = file.type.includes("video") ? "video" : "image";
                        const copy = [...testimonials];
                        copy[i] = { ...copy[i], media_url: url, media_type: mediaType };
                        setTestimonials(copy);
                      }
                      setSaving(false);
                    }}
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <button onClick={() => saveTestimonial(t)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-[10px] font-bold uppercase tracking-widest">
                  <Save size={12} /> Save
                </button>
                {t.id && (
                  <button onClick={() => remove(t.id)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-400/30 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
          <button onClick={addTestimonial} className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-dashed border-border text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest">
            <Plus size={14} /> Add Testimonial
          </button>
        </div>
      )}

      {subtab === "font" && (
        <div className="space-y-6">
          <div className="flex gap-2">
            {(["display", "body", "mono"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFontTab(t)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  fontTab === t
                    ? "bg-foreground text-background"
                    : "bg-secondary/30 border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "display" ? "Display" : t === "body" ? "Body" : "Mono"}
              </button>
            ))}
          </div>

          {fontTab === "display" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Headings, hero titles, section headers.</p>
              <div className="bg-card border border-border p-6 rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Live Preview</p>
                <p style={{ fontFamily: displayFont === "Arsenal" ? "var(--font-display)" : DISPLAY_FONTS.find(f => f.name === displayFont)?.style }} className="text-4xl">
                  The quick brown fox
                </p>
                <p style={{ fontFamily: displayFont === "Arsenal" ? "var(--font-display)" : DISPLAY_FONTS.find(f => f.name === displayFont)?.style }} className="text-xl text-muted-foreground mt-1">
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DISPLAY_FONTS.map((font) => {
                  const isActive = displayFont === font.name;
                  return (
                    <button
                      key={font.name}
                      onClick={async () => {
                        await setSiteFont("display", font.name);
                        if (font.name === "Arsenal") {
                          document.documentElement.style.removeProperty("--font-display");
                        } else {
                          document.documentElement.style.setProperty("--font-display", font.style);
                        }
                        setDisplayFont(font.name);
                        showToast(`Display → ${font.label}`);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isActive ? "border-accent bg-accent/10 ring-1 ring-accent/30" : "border-border hover:border-foreground/30"
                      }`}
                    >
                      <p style={{ fontFamily: font.style }} className="text-xl mb-1">Aa</p>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-tight">
                        {font.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {fontTab === "body" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Paragraphs, buttons, navigation, form fields.</p>
              <div className="bg-card border border-border p-6 rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Live Preview</p>
                <p style={{ fontFamily: bodyFont === "Rubik" ? "var(--font-body)" : BODY_FONTS.find(f => f.name === bodyFont)?.style }} className="text-base leading-relaxed">
                  The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!
                </p>
                <p style={{ fontFamily: bodyFont === "Rubik" ? "var(--font-body)" : BODY_FONTS.find(f => f.name === bodyFont)?.style, fontWeight: 500 }} className="text-sm mt-2">
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BODY_FONTS.map((font) => {
                  const isActive = bodyFont === font.name;
                  return (
                    <button
                      key={font.name}
                      onClick={async () => {
                        await setSiteFont("body", font.name);
                        if (font.name === "Rubik") {
                          document.documentElement.style.removeProperty("--font-body");
                        } else {
                          document.documentElement.style.setProperty("--font-body", font.style);
                        }
                        setBodyFont(font.name);
                        showToast(`Body → ${font.label}`);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isActive ? "border-accent bg-accent/10 ring-1 ring-accent/30" : "border-border hover:border-foreground/30"
                      }`}
                    >
                      <p style={{ fontFamily: font.style }} className="text-base mb-1">Ag</p>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-tight">
                        {font.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {fontTab === "mono" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Labels, tags, admin chrome, code-like UI.</p>
              <div className="bg-card border border-border p-6 rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Live Preview</p>
                <p style={{ fontFamily: monoFont === "monospace" ? "monospace" : MONO_FONTS.find(f => f.name === monoFont)?.style }} className="text-sm">
                  The quick brown fox jumps over the lazy dog.
                </p>
                <p style={{ fontFamily: monoFont === "monospace" ? "monospace" : MONO_FONTS.find(f => f.name === monoFont)?.style }} className="text-xs text-muted-foreground mt-1">
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {MONO_FONTS.map((font) => {
                  const isActive = monoFont === font.name;
                  return (
                    <button
                      key={font.name}
                      onClick={async () => {
                        await setSiteFont("mono", font.name);
                        if (font.name === "monospace") {
                          document.documentElement.style.removeProperty("--font-mono");
                        } else {
                          document.documentElement.style.setProperty("--font-mono", font.style);
                        }
                        setMonoFont(font.name);
                        showToast(`Mono → ${font.label}`);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isActive ? "border-accent bg-accent/10 ring-1 ring-accent/30" : "border-border hover:border-foreground/30"
                      }`}
                    >
                      <p style={{ fontFamily: font.style }} className="text-sm mb-1">&gt;_</p>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-tight">
                        {font.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium border ${
              toast.type === "success"
                ? "bg-foreground text-background border-foreground"
                : "bg-red-500 text-white border-red-500"
            }`}
          >
            {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
