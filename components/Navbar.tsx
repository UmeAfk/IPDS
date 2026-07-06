"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#work" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 h-[60px] md:h-[72px] flex items-center transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-sm border-b border-border shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container-custom flex items-center justify-between w-full">
          <Link href="/" className="flex items-center">
            <div className="relative h-9 w-28">
              <Image src="/dlogo.png" alt="IPDS" fill className="object-contain" priority />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className={`text-sm font-body tracking-wide transition-colors ${
                  scrolled
                    ? "text-foreground hover:text-accent"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {label}
              </a>
            ))}
            <ThemeToggle />
            <button
              className="btn-primary py-2.5 px-5"
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              Get in touch
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-4 md:hidden">
            <ThemeToggle />
            <button
              className={`transition-colors ${
                scrolled ? "text-foreground" : "text-white"
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-2xl font-display text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </a>
            ))}
            <button
              className="btn-primary mt-4"
              onClick={() => {
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                setMobileOpen(false);
              }}
            >
              Get in touch
              <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
