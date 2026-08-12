"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Save, Loader2, Image as ImageIcon, Plus, Trash2, 
  Activity, Upload, Video, Settings, BookOpen, Type, FileText, Paperclip, Check, ExternalLink, Download
} from "lucide-react";
import { haptic } from "ios-haptics";
import Image from "next/image";
import { 
  updateProject, 
  getProjectBlog, 
  addSiteUpdate, 
  deleteSiteUpdate,
  deleteProject,
  getDownloadsConfig,
  setDownloadsConfig,
  type Project,
  type SiteUpdate,
  addYoutubeToGallery,
  updateProjectBlogOverview,
  setSiteUpdateThumbnail
} from "@/lib/supabase";
import CustomSelect from "@/components/ui/CustomSelect";

const TYPE_OPTIONS = [
  { value: "Residential", label: "Residential" },
  { value: "Commercial", label: "Commercial" },
  { value: "Institutional", label: "Institutional" },
  { value: "Temple", label: "Temple/Religious" },
  { value: "Complex", label: "Mixed Complex" },
];

const CATEGORY_OPTIONS = [
  { value: "key", label: "Key Projects" },
  { value: "ongoing", label: "Ongoing Redevelopment" },
];

const ACCESS_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "password", label: "Password" },
  { value: "otp", label: "OTP Code" },
];

interface EditProjectModalProps {
  project?: Project; // Optional for creation mode
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditProjectModal({ project, onClose, onUpdate }: EditProjectModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "content" | "updates">("general");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  
  const isNew = !project?.id;
  
  // General Fields
  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [streamUrl, setStreamUrl] = useState(project?.stream_url || "");
  const [location, setLocation] = useState(project?.location || "");
  const [year, setYear] = useState(project?.year || "2024");
  const [type, setType] = useState<any>(project?.type || "Residential");
  const [accessType, setAccessType] = useState<any>(project?.access_type || "public");
  const [accessPassword, setAccessPassword] = useState(project?.access_password || "");
  const [category, setCategory] = useState<"ongoing" | "key" | "">(project?.category ?? "");
  
  // Image Uploads for New Projects
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [darkImage, setDarkImage] = useState<File | null>(null);
  const [lightImage, setLightImage] = useState<File | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [darkImageUrl, setDarkImageUrl] = useState<string | null>(null);
  const [lightImageUrl, setLightImageUrl] = useState<string | null>(null);
  const savingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drag-over states for thumbnail pickers
  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isDraggingDark, setIsDraggingDark] = useState(false);
  const [isDraggingLight, setIsDraggingLight] = useState(false);

  // Gallery multi-file upload queue
  const [uploadQueue, setUploadQueue] = useState<{name: string; status: 'pending' | 'uploading' | 'done' | 'error'}[]>([]);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);

  useEffect(() => {
    if (!mainImage) { setMainImageUrl(null); return; }
    const url = URL.createObjectURL(mainImage);
    setMainImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [mainImage]);

  useEffect(() => {
    if (!darkImage) { setDarkImageUrl(null); return; }
    const url = URL.createObjectURL(darkImage);
    setDarkImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [darkImage]);

  useEffect(() => {
    if (!lightImage) { setLightImageUrl(null); return; }
    const url = URL.createObjectURL(lightImage);
    setLightImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [lightImage]);

  useEffect(() => {
    return () => { if (savingTimer.current) clearTimeout(savingTimer.current); };
  }, []);
  
  
  // Downloads & RERA (stored in narrative_sections JSONB — no extra DB columns needed)
  const dl = project ? getDownloadsConfig(project.narrative_sections || []) : { brochure_url: "", rera_url: "", rera_number: "", show_brochure: false, show_rera: false };
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [brochureUrl, setBrochureUrl] = useState(dl.brochure_url);
  const [reraNumber, setReraNumber] = useState(dl.rera_number);
  const [reraFile, setReraFile] = useState<File | null>(null);
  const [reraUrl, setReraUrl] = useState(dl.rera_url);
  const [isDraggingBrochure, setIsDraggingBrochure] = useState(false);
  const [isDraggingRera, setIsDraggingRera] = useState(false);

  // Blog Data
  const [blogData, setBlogData] = useState<any>(null);
  const [story, setStory] = useState(project?.long_description || "");
  const [hasLiveUpdates, setHasLiveUpdates] = useState(true);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const loadBlogData = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true);
    const data = await getProjectBlog(project.id);
    if (data) {
      setBlogData(data);
      setStory(data.long_description || "");
      setHasLiveUpdates(data.has_live_updates ?? true);
    }
    setLoading(false);
  }, [project?.id]);

  useEffect(() => {
    if (project?.id) loadBlogData();
  }, [project?.id, loadBlogData]);

  async function handleSaveAll() {
    setSaving("general");
    
    if (isNew) {
      if (!mainImage) {
        alert("Please select a main thumbnail image.");
        setSaving(null);
        return;
      }
      let finalBrochureUrl = brochureUrl;
      let finalReraUrl = reraUrl;
      const { createProject, uploadProjectDocument } = await import("@/lib/supabase");
      
      if (brochureFile) {
        const b = await uploadProjectDocument(brochureFile, title, "brochure");
        if (!b.error) finalBrochureUrl = b.url;
      }
      if (reraFile) {
        const r = await uploadProjectDocument(reraFile, title, "rera");
        if (!r.error) finalReraUrl = r.url;
      }

      const initSections = setDownloadsConfig([], {
        brochure_url: finalBrochureUrl, rera_url: finalReraUrl, rera_number: reraNumber,
      });
      const { error } = await createProject(
        { 
          title, description, stream_url: streamUrl, location, year, type, 
          featured: false, is_active: true, sort_order: 0, 
          access_type: accessType, access_password: accessPassword, 
          status: "published",
          long_description: story,
          narrative_sections: initSections,
          gallery_updates: [],
          category: category || null
        },
        mainImage,
        darkImage,
        lightImage
      );
      if (error) alert(error);
      else {
        haptic.confirm();
        onUpdate();
        onClose();
      }
    } else {
      let mainUrl = project!.image_url;
      let darkUrl = project!.image_url_dark;
      let lightUrl = project!.image_url_light;
      let finalBrochureUrl = brochureUrl;
      let finalReraUrl = reraUrl;
      
      const { uploadProjectImage, uploadProjectDocument, updateProjectBlogOverview } = await import("@/lib/supabase");
      
      if (mainImage) {
        const m = await uploadProjectImage(mainImage, title);
        if (!m.error) mainUrl = m.url;
      }
      if (darkImage) {
        const d = await uploadProjectImage(darkImage, title, "-dark");
        if (!d.error) darkUrl = d.url;
      }
      if (lightImage) {
        const l = await uploadProjectImage(lightImage, title, "-light");
        if (!l.error) lightUrl = l.url;
      }
      if (brochureFile) {
        const b = await uploadProjectDocument(brochureFile, title, "brochure");
        if (!b.error) finalBrochureUrl = b.url;
      }
      if (reraFile) {
        const r = await uploadProjectDocument(reraFile, title, "rera");
        if (!r.error) finalReraUrl = r.url;
      }

      const updatedSections = setDownloadsConfig(project!.narrative_sections || [], {
        brochure_url: finalBrochureUrl, rera_url: finalReraUrl, rera_number: reraNumber,
      });
      const { error } = await updateProject(project!.id, {
        title, description, long_description: story,
        stream_url: streamUrl, location, year, type,
        access_type: accessType, access_password: accessPassword,
        status: "published", narrative_sections: updatedSections,
        image_url: mainUrl,
        image_url_dark: darkUrl,
        image_url_light: lightUrl,
        category: category || null,
      });

      // Also sync the blog overview
      await updateProjectBlogOverview(project!.id, {
        long_description: story, has_live_updates: hasLiveUpdates
      });

      if (!error) {
        haptic.confirm();
        onUpdate();
      }
    }
    setSaving("success");
    if (savingTimer.current) clearTimeout(savingTimer.current);
    savingTimer.current = setTimeout(() => {
      setSaving(null);
    }, 2000);
  }

  async function handleDelete() {
    if (isNew) return;
    if (!confirm("Are you sure you want to PERMANENTLY delete this project? This cannot be undone.")) return;
    setSaving("deleting");
    const { error } = await deleteProject(project!.id);
    setSaving(null);
    if (!error) {
      haptic.confirm();
      onUpdate();
      onClose();
    } else {
      alert(error);
    }
  }

  async function handleAddYoutube() {
    if (!youtubeUrl.trim() || !project?.id) return;
    setSaving("youtube");
    const { error } = await addYoutubeToGallery(project.id, youtubeUrl, blogData?.gallery_updates || []);
    setSaving(null);
    if (!error) {
      setYoutubeUrl("");
      haptic.confirm();
      loadBlogData();
    } else {
      alert(error);
    }
  }

  async function handleGalleryFiles(files: File[]) {
    const allowed = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
    if (!allowed.length || !project?.id) return;

    setUploadQueue(allowed.map(f => ({ name: f.name, status: 'pending' as const })));
    let currentGallery: any[] = blogData?.gallery_updates || [];

    for (let i = 0; i < allowed.length; i++) {
      setUploadQueue(q => q.map((item, idx) => idx === i ? { ...item, status: 'uploading' as const } : item));
      const { error, url } = await addSiteUpdate(project!.id, allowed[i], currentGallery);
      if (!error && url) {
        const mt = allowed[i].type.includes('video') ? 'video' : 'image';
        currentGallery = [...currentGallery, { media_url: url, media_type: mt, caption: '' }];
        setUploadQueue(q => q.map((item, idx) => idx === i ? { ...item, status: 'done' as const } : item));
      } else {
        setUploadQueue(q => q.map((item, idx) => idx === i ? { ...item, status: 'error' as const } : item));
      }
    }

    haptic.confirm();
    loadBlogData();
    setTimeout(() => setUploadQueue([]), 2500);
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[1600px] h-full max-h-[90vh] bg-card border border-border/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-medium tracking-tighter">{isNew ? "Add New Project" : "Edit Project"}</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">{isNew ? "Initialize a new vision" : project?.title}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-secondary flex items-center justify-center transition-all active:scale-95">
            <X size={20} />
          </button>
        </div>

        {/* Tabs & Top Actions */}
        <div className="px-8 py-3.5 border-b border-border flex items-center justify-between gap-4 bg-secondary/10">
          <div className="p-1.5 rounded-full bg-secondary/40 border border-border/60 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: "general", label: "General", icon: Settings },
              { id: "content", label: "Story", icon: Type },
              { id: "updates", label: "Gallery", icon: Activity, disabled: isNew },
            ].map((t) => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  disabled={t.disabled}
                  onClick={() => { haptic(); setActiveTab(t.id as any); }}
                  className={`relative flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                    isActive ? "text-background" : "text-muted-foreground hover:text-foreground"
                  } ${t.disabled ? "opacity-30 cursor-not-allowed" : ""}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-foreground rounded-full shadow-md z-0"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <t.icon size={14} />
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {!isNew && (
              <button
                onClick={handleDelete}
                disabled={!!saving}
                className="h-10 px-4 rounded-full text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-40 flex items-center gap-1.5 active:scale-[0.98]"
                title="Delete Project"
              >
                {saving === 'deleting' ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}

            <button
              onClick={handleSaveAll}
              disabled={!!saving}
              className="btn-vercel h-10 px-7 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 justify-center shadow-lg active:scale-[0.98] transition-all"
            >
              {saving === 'general' || saving === 'overview' ? (
                <><Loader2 size={13} className="animate-spin" /> Saving...</>
              ) : saving === 'success' ? (
                <>✓ Saved!</>
              ) : (
                <><Save size={13} /> {isNew ? 'Create Project' : 'Save Project'}</>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "general" && (
              <motion.div 
                key="general"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Project Title</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-5 py-3 rounded-2xl bg-secondary/30 border border-border text-sm outline-none focus:border-brand-accent/40 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Location</label>
                    <input value={location} onChange={e => setLocation(e.target.value)} className="w-full px-5 py-3 rounded-2xl bg-secondary/30 border border-border text-sm outline-none focus:border-brand-accent/40 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Stream URL (Pixel Streaming)</label>
                    <input value={streamUrl} onChange={e => setStreamUrl(e.target.value)} className="w-full px-5 py-3 rounded-2xl bg-secondary/30 border border-border text-sm outline-none focus:border-brand-accent/40 transition-all" placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Year</label>
                    <input value={year} onChange={e => setYear(e.target.value)} className="w-full px-5 py-3 rounded-2xl bg-secondary/30 border border-border text-xs outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Type</label>
                    <CustomSelect value={type} onChange={setType} options={TYPE_OPTIONS} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Category</label>
                    <CustomSelect value={category} onChange={val => setCategory(val as any)} options={CATEGORY_OPTIONS} placeholder="Select Category" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Access</label>
                    <CustomSelect value={accessType} onChange={setAccessType} options={ACCESS_OPTIONS} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Password</label>
                    <input value={accessPassword} onChange={e => setAccessPassword(e.target.value)} disabled={accessType !== "password"} placeholder="••••••" className="w-full px-5 py-3 rounded-2xl bg-secondary/30 border border-border text-xs outline-none disabled:opacity-30" />
                  </div>
                </div>

                {/* ── Brochure & RERA Section ────────────────── */}
                <div className="space-y-4 pt-6 border-t border-border/40">
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Brochure & RERA Compliance</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                      {/* Brochure File Upload */}
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Project Brochure (PDF or Image)</label>
                         <div
                           className={`relative aspect-[3/1] bg-secondary/20 border-2 border-dashed rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                             isDraggingBrochure ? 'border-brand-accent bg-brand-accent/5' : 'border-border hover:border-brand-accent/40'
                           }`}
                           onDragOver={e => { e.preventDefault(); setIsDraggingBrochure(true); }}
                           onDragLeave={() => setIsDraggingBrochure(false)}
                           onDrop={e => { e.preventDefault(); setIsDraggingBrochure(false); const f = e.dataTransfer.files[0]; if (f) setBrochureFile(f); }}
                           onClick={() => document.getElementById('brochure-file-input')?.click()}
                         >
                            <div className="flex items-center gap-3 overflow-hidden">
                               <div className="w-9 h-9 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center flex-shrink-0">
                                  <FileText size={18} />
                               </div>
                               <div className="truncate">
                                  <p className="text-xs font-semibold truncate text-foreground">
                                     {brochureFile ? brochureFile.name : brochureUrl ? "Brochure Attached" : "Upload Brochure"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                     {brochureFile ? `${(brochureFile.size / 1024 / 1024).toFixed(1)} MB` : brochureUrl ? "Click to replace" : "PDF or Image"}
                                  </p>
                               </div>
                            </div>
                            {brochureUrl && !brochureFile && (
                               <a href={brochureUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all flex-shrink-0" title="View Brochure">
                                  <ExternalLink size={14} />
                               </a>
                            )}
                            <input type="file" accept="application/pdf,image/*" id="brochure-file-input" className="hidden" onChange={e => setBrochureFile(e.target.files?.[0] || null)} />
                         </div>
                      </div>

                      {/* RERA Number */}
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">RERA Registration Number</label>
                         <input
                           value={reraNumber}
                           onChange={e => setReraNumber(e.target.value)}
                           placeholder="e.g. P52100012345"
                           className="w-full px-5 py-3 rounded-2xl bg-secondary/30 border border-border text-xs outline-none focus:border-brand-accent/40 font-mono tracking-wider"
                         />
                      </div>

                      {/* RERA Certificate / QR */}
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">RERA Document / QR Code</label>
                         <div
                           className={`relative aspect-[3/1] bg-secondary/20 border-2 border-dashed rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                             isDraggingRera ? 'border-brand-accent bg-brand-accent/5' : 'border-border hover:border-brand-accent/40'
                           }`}
                           onDragOver={e => { e.preventDefault(); setIsDraggingRera(true); }}
                           onDragLeave={() => setIsDraggingRera(false)}
                           onDrop={e => { e.preventDefault(); setIsDraggingRera(false); const f = e.dataTransfer.files[0]; if (f) setReraFile(f); }}
                           onClick={() => document.getElementById('rera-file-input')?.click()}
                         >
                            <div className="flex items-center gap-3 overflow-hidden">
                               <div className="w-9 h-9 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center flex-shrink-0">
                                  <Paperclip size={18} />
                               </div>
                               <div className="truncate">
                                  <p className="text-xs font-semibold truncate text-foreground">
                                     {reraFile ? reraFile.name : reraUrl ? "RERA Doc Attached" : "Upload RERA QR/Doc"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                     {reraFile ? `${(reraFile.size / 1024 / 1024).toFixed(1)} MB` : reraUrl ? "Click to replace" : "PDF or Image"}
                                  </p>
                               </div>
                            </div>
                            {reraUrl && !reraFile && (
                               <a href={reraUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all flex-shrink-0" title="View Document">
                                  <ExternalLink size={14} />
                               </a>
                            )}
                            <input type="file" accept="application/pdf,image/*" id="rera-file-input" className="hidden" onChange={e => setReraFile(e.target.files?.[0] || null)} />
                         </div>
                      </div>

                   </div>
                </div>

                <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                      {/* ── Main Thumbnail ─────────────────────────── */}
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Main Thumbnail</label>
                         <div
                           className={`relative group aspect-video bg-secondary/20 border-2 border-dashed rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                             isDraggingMain ? 'border-brand-accent bg-brand-accent/5 scale-[1.01]' : 'border-border hover:border-brand-accent/40 hover:bg-secondary/30'
                           }`}
                           onDragOver={e => { e.preventDefault(); setIsDraggingMain(true); }}
                           onDragLeave={() => setIsDraggingMain(false)}
                           onDrop={e => { e.preventDefault(); setIsDraggingMain(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) setMainImage(f); }}
                           onClick={() => document.getElementById('main-thumb-input')?.click()}
                         >
                            {mainImageUrl ? <Image src={mainImageUrl} alt="Preview" fill unoptimized className="absolute inset-0 object-cover" />
                             : project?.image_url ? <Image src={project.image_url} alt={project.title} fill className="absolute inset-0 object-cover" />
                             : <>
                                 <Upload size={20} className={isDraggingMain ? 'text-brand-accent' : 'text-muted-foreground/30'} />
                                 <span className={`text-[10px] font-bold ${isDraggingMain ? 'text-brand-accent' : 'text-muted-foreground/50'}`}>
                                   {isDraggingMain ? 'Drop to set' : 'Click or drag image'}
                                 </span>
                               </>}
                            {(mainImageUrl || project?.image_url) && (
                              <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                                isDraggingMain ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}>
                                <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                                  {isDraggingMain ? 'Drop to replace' : 'Click or drag to replace'}
                                </span>
                              </div>
                            )}
                            <input type="file" accept="image/*" id="main-thumb-input" className="hidden" onChange={e => setMainImage(e.target.files?.[0] || null)} />
                         </div>
                      </div>

                      {/* ── Dark Mode ──────────────────────────────── */}
                      <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                         <label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Dark Mode (Opt)</label>
                         <div
                           className={`relative group aspect-video bg-secondary/20 border-2 border-dashed rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                             isDraggingDark ? 'border-brand-accent bg-brand-accent/5 scale-[1.01]' : 'border-border'
                           }`}
                           onDragOver={e => { e.preventDefault(); setIsDraggingDark(true); }}
                           onDragLeave={() => setIsDraggingDark(false)}
                           onDrop={e => { e.preventDefault(); setIsDraggingDark(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) setDarkImage(f); }}
                           onClick={() => document.getElementById('dark-thumb-input')?.click()}
                         >
                            {darkImageUrl ? <Image src={darkImageUrl} alt="Dark preview" fill unoptimized className="absolute inset-0 object-cover" />
                             : project?.image_url_dark ? <Image src={project.image_url_dark} alt="Dark version" fill className="absolute inset-0 object-cover" />
                             : <ImageIcon size={20} className={isDraggingDark ? 'text-brand-accent' : 'text-muted-foreground/30'} />}
                            {(darkImageUrl || project?.image_url_dark) && (
                              <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                                isDraggingDark ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}>
                                <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                                  {isDraggingDark ? 'Drop to replace' : 'Click or drag'}
                                </span>
                              </div>
                            )}
                            <input type="file" accept="image/*" id="dark-thumb-input" className="hidden" onChange={e => setDarkImage(e.target.files?.[0] || null)} />
                         </div>
                      </div>

                      {/* ── Light Mode ─────────────────────────────── */}
                      <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                         <label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Light Mode (Opt)</label>
                         <div
                           className={`relative group aspect-video bg-secondary/20 border-2 border-dashed rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                             isDraggingLight ? 'border-brand-accent bg-brand-accent/5 scale-[1.01]' : 'border-border'
                           }`}
                           onDragOver={e => { e.preventDefault(); setIsDraggingLight(true); }}
                           onDragLeave={() => setIsDraggingLight(false)}
                           onDrop={e => { e.preventDefault(); setIsDraggingLight(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) setLightImage(f); }}
                           onClick={() => document.getElementById('light-thumb-input')?.click()}
                         >
                            {lightImageUrl ? <Image src={lightImageUrl} alt="Light preview" fill unoptimized className="absolute inset-0 object-cover" />
                             : project?.image_url_light ? <Image src={project.image_url_light} alt="Light version" fill className="absolute inset-0 object-cover" />
                             : <ImageIcon size={20} className={isDraggingLight ? 'text-brand-accent' : 'text-muted-foreground/30'} />}
                            {(lightImageUrl || project?.image_url_light) && (
                              <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                                isDraggingLight ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}>
                                <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                                  {isDraggingLight ? 'Drop to replace' : 'Click or drag'}
                                </span>
                              </div>
                            )}
                            <input type="file" accept="image/*" id="light-thumb-input" className="hidden" onChange={e => setLightImage(e.target.files?.[0] || null)} />
                         </div>
                      </div>

                   </div>
                </div>

               </motion.div>
            )}

            {activeTab === "content" && (
              <motion.div 
                key="content"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-brand-accent"><BookOpen size={18} /></div>
                    <div>
                      <h3 className="text-lg font-medium tracking-tight">Project Narrative & Story</h3>
                      <p className="text-xs text-muted-foreground">Craft the short overview and long detailed story for this project</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Short Description (Overview Summary)</label>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-secondary/50 border border-border text-xs">
                        <button type="button" onClick={() => setDescription(prev => prev + " <b>Bold</b>")} className="px-1.5 py-0.5 rounded hover:bg-secondary font-bold text-foreground" title="Bold">B</button>
                        <button type="button" onClick={() => setDescription(prev => prev + " <i>Italic</i>")} className="px-1.5 py-0.5 rounded hover:bg-secondary italic text-foreground" title="Italic">I</button>
                        <button type="button" onClick={() => setDescription(prev => prev + " <u>Underline</u>")} className="px-1.5 py-0.5 rounded hover:bg-secondary underline text-foreground" title="Underline">U</button>
                        <div className="w-px h-3 bg-border" />
                        <button type="button" onClick={() => setDescription(prev => prev + ' <span style="font-size: 1.25em;">Large text</span>')} className="px-1.5 py-0.5 rounded hover:bg-secondary font-bold text-[10px]" title="Font Size">A+</button>
                        <button type="button" onClick={() => setDescription(prev => prev + ' <span style="color: #b8922a;">Gold text</span>')} className="w-3.5 h-3.5 rounded-full bg-[#b8922a]" title="Gold Color" />
                        <button type="button" onClick={() => setDescription(prev => prev + ' <span style="color: #38bdf8;">Cyan text</span>')} className="w-3.5 h-3.5 rounded-full bg-[#38bdf8]" title="Cyan Color" />
                      </div>
                    </div>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-5 py-3 rounded-2xl bg-secondary/30 border border-border text-sm outline-none focus:border-brand-accent/40 transition-all resize-none font-light leading-relaxed"
                      placeholder="Write a brief 2-3 sentence overview..."
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Story Narrative (Detailed Description)</label>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-secondary/50 border border-border text-xs">
                        <button type="button" onClick={() => setStory(prev => prev + " <b>Bold</b>")} className="px-1.5 py-0.5 rounded hover:bg-secondary font-bold text-foreground" title="Bold">B</button>
                        <button type="button" onClick={() => setStory(prev => prev + " <i>Italic</i>")} className="px-1.5 py-0.5 rounded hover:bg-secondary italic text-foreground" title="Italic">I</button>
                        <button type="button" onClick={() => setStory(prev => prev + " <u>Underline</u>")} className="px-1.5 py-0.5 rounded hover:bg-secondary underline text-foreground" title="Underline">U</button>
                        <div className="w-px h-3 bg-border" />
                        <button type="button" onClick={() => setStory(prev => prev + ' <span style="font-size: 1.25em;">Large text</span>')} className="px-1.5 py-0.5 rounded hover:bg-secondary font-bold text-[10px]" title="Font Size">A+</button>
                        <button type="button" onClick={() => setStory(prev => prev + ' <span style="color: #b8922a;">Gold text</span>')} className="w-3.5 h-3.5 rounded-full bg-[#b8922a]" title="Gold Color" />
                        <button type="button" onClick={() => setStory(prev => prev + ' <span style="color: #38bdf8;">Cyan text</span>')} className="w-3.5 h-3.5 rounded-full bg-[#38bdf8]" title="Cyan Color" />
                      </div>
                    </div>
                    <textarea
                      value={story}
                      onChange={e => setStory(e.target.value)}
                      rows={7}
                      className="w-full px-5 py-3 rounded-2xl bg-secondary/50 border border-border text-sm outline-none focus:ring-1 focus:ring-brand-accent/20 resize-none font-light leading-relaxed"
                      placeholder="Write the full narrative for this project..."
                    />
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "updates" && (
              <motion.div 
                key="updates"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-brand-accent"><Upload size={18} /></div>
                  <h3 className="text-lg font-medium tracking-tight">Upload to Gallery</h3>
                </div>

                {/* ── Multi-file drag-and-drop dropzone ─────────── */}
                <div
                  className={`relative rounded-3xl border-2 border-dashed transition-all cursor-pointer select-none ${
                    isDraggingGallery
                      ? 'border-brand-accent bg-brand-accent/5 scale-[1.01]'
                      : 'border-border bg-secondary/10 hover:border-brand-accent/40 hover:bg-secondary/20'
                  }`}
                  onDragOver={e => { e.preventDefault(); setIsDraggingGallery(true); }}
                  onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDraggingGallery(false); }}
                  onDrop={e => { e.preventDefault(); setIsDraggingGallery(false); const files = Array.from(e.dataTransfer.files); if (files.length) handleGalleryFiles(files); }}
                  onClick={() => document.getElementById('gallery-multi-upload')?.click()}
                >
                  <div className="p-10 flex flex-col items-center justify-center text-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                      isDraggingGallery ? 'bg-brand-accent/20 text-brand-accent scale-110' : 'bg-secondary text-muted-foreground'
                    }`}>
                      <Upload size={28} />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm transition-colors ${
                        isDraggingGallery ? 'text-brand-accent' : 'text-foreground'
                      }`}>
                        {isDraggingGallery ? 'Drop your files here' : 'Drag & drop images or videos'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Or click to browse — select multiple files at once</p>
                      <p className="text-[10px] text-muted-foreground/40 mt-1.5 font-mono uppercase tracking-widest">JPG · PNG · WEBP · MP4 · WEBM &nbsp;·&nbsp; Max 80 MB each</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/webm"
                    multiple
                    id="gallery-multi-upload"
                    className="hidden"
                    onChange={e => {
                      const files = Array.from(e.target.files || []);
                      if (files.length) handleGalleryFiles(files);
                      e.target.value = '';
                    }}
                  />
                </div>

                {/* ── Upload Queue ──────────────────────────────── */}
                {uploadQueue.length > 0 && (
                  <div className="space-y-2 p-4 rounded-2xl bg-secondary/20 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Uploading {uploadQueue.filter(q => q.status === 'done').length} of {uploadQueue.length} files
                      </p>
                      {/* Overall progress bar */}
                      <div className="w-32 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-brand-accent rounded-full transition-all duration-500"
                          style={{ width: `${(uploadQueue.filter(q => q.status === 'done').length / uploadQueue.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    {uploadQueue.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 py-1">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${
                          item.status === 'done'      ? 'bg-green-400' :
                          item.status === 'error'     ? 'bg-red-400' :
                          item.status === 'uploading' ? 'bg-brand-accent animate-pulse' :
                          'bg-muted-foreground/20'
                        }`} />
                        <span className="text-xs text-muted-foreground truncate flex-1 font-mono">{item.name}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest flex-shrink-0 flex items-center gap-1 ${
                          item.status === 'done'      ? 'text-green-400' :
                          item.status === 'error'     ? 'text-red-400' :
                          item.status === 'uploading' ? 'text-brand-accent' :
                          'text-muted-foreground/30'
                        }`}>
                          {item.status === 'uploading' && <Loader2 size={10} className="animate-spin" />}
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── YouTube URL ───────────────────────────────── */}
                <div className="p-5 rounded-2xl border border-border bg-secondary/10 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-red-500/80 flex-shrink-0">
                    <Video size={18} />
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      value={youtubeUrl}
                      onChange={e => setYoutubeUrl(e.target.value)}
                      placeholder="Paste YouTube URL here..."
                      className="flex-1 px-4 py-2 rounded-xl bg-background border border-border text-xs outline-none focus:border-brand-accent/50"
                    />
                    <button
                      onClick={handleAddYoutube}
                      disabled={!!saving || !youtubeUrl}
                      className="btn-vercel h-10 px-4 text-[10px] whitespace-nowrap flex items-center gap-1"
                    >
                      {saving === 'youtube' ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                      Add Link
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                  {(blogData?.gallery_updates || []).map((u: any, i: number) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-border group bg-secondary/30 flex items-center justify-center">
                        {u.media_type === "image" ? (
                          <div className="relative w-full h-full">
                            <Image src={u.media_url} alt="Gallery item" fill className="object-cover" />
                          </div>
                        ) : (
                         <>
                           {u.thumbnail_url ? (
                             <div className="relative w-full h-full">
                               <Image src={u.thumbnail_url} alt="Video thumbnail" fill className="object-cover opacity-60" />
                             </div>
                           ) : (
                             <Video size={24} className="text-muted-foreground/30" />
                           )}
                           
                           {/* Custom Thumbnail Upload Trigger */}
                           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm z-10 cursor-pointer" onClick={() => document.getElementById(`thumb-upload-${i}`)?.click()}>
                             <div className="flex flex-col items-center justify-center text-white/80 hover:text-white transition-colors">
                               <ImageIcon size={16} className="mb-1" />
                               <span className="text-[8px] font-bold uppercase tracking-widest">{u.thumbnail_url ? "Replace Thumb" : "Set Thumb"}</span>
                             </div>
                           </div>
                           <input type="file" accept="image/*" className="hidden" id={`thumb-upload-${i}`} onChange={async (e) => {
                             const file = e.target.files?.[0];
                             if(!file) return;
                             setSaving("uploading");
                             const { error } = await setSiteUpdateThumbnail(project!.id, i, file, blogData?.gallery_updates || []);
                             setSaving(null);
                             if(!error) { haptic.confirm(); loadBlogData(); } else alert(error);
                           }} />
                           
                           <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[8px] font-bold text-white uppercase tracking-widest pointer-events-none z-20">
                             {u.media_type}
                           </div>
                         </>
                       )}
                       <button onClick={async (e) => { e.stopPropagation(); haptic.error(); await deleteSiteUpdate(project!.id, u.media_url, blogData?.gallery_updates || []); loadBlogData(); }} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-500"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
