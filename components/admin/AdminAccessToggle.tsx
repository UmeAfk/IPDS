"use client";

import { useEffect, useState } from "react";

export default function AdminAccessToggle() {
  const [required, setRequired] = useState(true);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin-access", { cache: "no-store" })
      .then(async res => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRequired(data.passwordRequired);
        setReady(true);
      })
      .catch(() => setError("Could not load admin access. Refresh to try again."));
  }, []);

  async function toggle() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin-access", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordRequired: !required }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRequired(data.passwordRequired);
      if (data.passwordRequired) window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save admin access.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mb-8 rounded-2xl border border-border bg-secondary/20 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold" id="admin-password-label">Require admin password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {required ? "Visitors must sign in to open the admin panel." : "Anyone with the admin link can open and edit this panel."}
          </p>
        </div>
        <button type="button" role="switch" aria-checked={required}
          aria-labelledby="admin-password-label" disabled={!ready || saving}
          onClick={toggle}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${required ? "bg-brand-accent" : "bg-muted-foreground/40"}`}>
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${required ? "left-6" : "left-1"}`} />
        </button>
      </div>
      {saving && <p role="status" className="mt-2 text-sm text-muted-foreground">Saving…</p>}
      {error && <p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
    </section>
  );
}
