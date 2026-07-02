"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getProjectByToken, Project, ProjectAuth } from "@/lib/supabase";
import ProjectDetail from "@/components/ProjectDetail";

function useToken() {
  if (typeof window === "undefined") return "";
  return window.location.pathname.split("/p/")[1] ?? "";
}

import { ThemeProvider } from "@/components/ThemeProvider";

export default function PrivateLinkPage() {
  const token = useToken();
  const [project, setProject] = useState<Project | null>(null);
  const [auth,    setAuth]    = useState<ProjectAuth | null>(null);
  const [status,  setStatus]  = useState<"loading"|"not-found"|"granted">("loading");

  useEffect(() => {
    if (!token) { setStatus("not-found"); return; }
    (async () => {
      const { project: p, auth: a } = await getProjectByToken(token);
      if (!p || !a) { setStatus("not-found"); return; }
      setProject(p);
      setAuth(a);
      setStatus("granted");
    })();
  }, [token]);

  if (status === "loading") return <Loader />;
  if (status === "not-found") return <NotFound />;
  
  return (
    <ThemeProvider key={`theme-${project!.id}`} attribute="class" defaultTheme="dark" enableSystem={false} storageKey={`ipds-project-${project!.id}`}>
      <ProjectDetail
        project={project!}
        onBack={() => {}}
        onLaunch={() => {}}
        hideBackButton
        isPrivate
      />
    </ThemeProvider>
  );
}

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 rounded-full animate-spin border-accent/20 border-t-accent" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <X size={32} className="mb-4 text-destructive" />
      <h1 className="text-xl font-display mb-2 text-foreground">
        Link not found or expired
      </h1>
      <p className="text-sm text-center text-muted-foreground">
        This link may have expired or been revoked. Please contact your architect.
      </p>
    </div>
  );
}
