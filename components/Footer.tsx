export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-border bg-card">
      <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="font-mono text-xs tracking-wider text-muted-foreground">
          &copy; {year} IPDS. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground/50">Made by</span>
          <span className="font-mono text-xs tracking-wider text-accent/60">Vastu Chitra</span>
        </div>
      </div>
    </footer>
  );
}
