"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col justify-center">
      <Image
        src="/images/ShreeSadhna.jpg"
        alt="Modern architecture"
        fill
        priority
        className="object-cover animate-ken-burns"
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(10,8,5,0.88) 0%, rgba(10,8,5,0.45) 50%, rgba(10,8,5,0.15) 100%)",
        }}
      />
      <div className="relative z-10 container-custom pb-20 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.05 }}
            className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/50 mb-6"
          >
            Pune's Pioneer in Self-Redevelopment
          </motion.p>
          <h1 className="font-display text-white leading-tight"
              style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)", fontWeight: 700 }}>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="block"
            >
              Empowering to Fulfill
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="block"
            >
              the{" "}
              <span className="text-accent italic" style={{ fontWeight: 400 }}>
                Real Estate Dream
              </span>
            </motion.span>
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex gap-4 mt-10 justify-center"
          >
            <button
              className="btn-primary"
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
            >
              View our work
              <ArrowRight size={16} />
            </button>
            <button
              className="btn-outline"
              style={{ borderColor: "white", color: "white" }}
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              Start a project
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
