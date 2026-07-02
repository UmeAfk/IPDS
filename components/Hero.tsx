"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col justify-end">
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
          className="max-w-2xl"
        >
          <h1 className="heading-hero text-white">
            Empowering to fulfill<br />
            the <em className="text-accent not-italic">real estate dream</em>
          </h1>
          <div className="flex gap-4 mt-10">
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}
