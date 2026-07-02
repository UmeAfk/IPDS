"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { saveEnquiry } from "@/lib/supabase";

export default function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [form, setForm] = useState({ name: "", email: "", contact: "", project: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await saveEnquiry(form);
    setLoading(false);
    if (!error) {
      setSubmitted(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => {
        setSubmitted(false);
        setForm({ name: "", email: "", contact: "", project: "", message: "" });
      }, 5000);
    }
  };

  const contacts = [
    { icon: Mail, label: "Email", value: "admin@i-pds.com", href: "mailto:admin@i-pds.com" },
    { icon: Phone, label: "Phone", value: "020-66268888", href: "tel:020-66268888" },
    { icon: MapPin, label: "Office", value: "Pune, Maharashtra", href: "https://maps.app.goo.gl/9X78pEzdHqe1iFya6" },
  ];

  return (
    <section id="contact" ref={ref} className="section-padding bg-background">
      <div className="container-custom">
        <p className="eyebrow mb-3">Get in Touch</p>
        <h2 className="heading-section text-foreground">Let&apos;s build together.</h2>
        <div className="gold-divider mt-4 mb-12" />

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="body-text mb-10 max-w-md">
              Have a project in mind? Share your brief and we&apos;ll respond within 24 hours.
            </p>
            <div className="space-y-6">
              {contacts.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-card border border-border group-hover:border-accent/50 transition-all" style={{ borderRadius: "var(--radius)" }}>
                    <Icon size={18} className="text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-base font-medium text-foreground">{value}</p>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="bg-card border border-border p-8" style={{ borderRadius: "var(--radius)" }}
          >
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6" style={{ background: "hsl(var(--accent) / 0.1)", borderRadius: "var(--radius)" }}>
                  <ArrowRight size={28} className="text-accent rotate-[-45deg]" />
                </div>
                <h3 className="heading-card text-foreground mb-3">Message sent!</h3>
                <p className="body-text">We&apos;ll review your project details and get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2" style={{ letterSpacing: "0.15em" }}>Full Name</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-3.5 bg-background border border-input focus:border-accent outline-none transition-colors"
                    style={{ borderRadius: "var(--radius)", fontFamily: "var(--font-body)", fontSize: "1rem", color: "hsl(var(--foreground))" }}
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2" style={{ letterSpacing: "0.15em" }}>Email</label>
                    <input
                      type="email" required
                      className="w-full px-4 py-3.5 bg-background border border-input focus:border-accent outline-none transition-colors"
                      style={{ borderRadius: "var(--radius)", fontFamily: "var(--font-body)", fontSize: "1rem", color: "hsl(var(--foreground))" }}
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2" style={{ letterSpacing: "0.15em" }}>Phone</label>
                    <input
                      type="tel" required
                      className="w-full px-4 py-3.5 bg-background border border-input focus:border-accent outline-none transition-colors"
                      style={{ borderRadius: "var(--radius)", fontFamily: "var(--font-body)", fontSize: "1rem", color: "hsl(var(--foreground))" }}
                      value={form.contact}
                      onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2" style={{ letterSpacing: "0.15em" }}>Project Details</label>
                  <textarea
                    required rows={5}
                    className="w-full px-4 py-3.5 bg-background border border-input focus:border-accent outline-none transition-colors resize-none"
                    style={{ borderRadius: "var(--radius)", fontFamily: "var(--font-body)", fontSize: "1rem", color: "hsl(var(--foreground))", minHeight: "140px" }}
                    placeholder="Tell us about your project..."
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-base">
                  {loading ? "Sending..." : "Send Enquiry"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
