"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Search,
  PenTool,
  FileCheck,
  BarChart3,
  Users,
  ClipboardCheck,
  MessageCircle,
  Flag,
} from "lucide-react";

const services = [
  { icon: Search, label: "Feasibility studies and project planning" },
  { icon: PenTool, label: "Architectural and engineering design" },
  { icon: FileCheck, label: "Statutory approvals and liaison" },
  { icon: BarChart3, label: "Financial planning and budgeting" },
  { icon: Users, label: "Contractor selection and tender management" },
  { icon: ClipboardCheck, label: "Project monitoring and quality control" },
  { icon: MessageCircle, label: "Member coordination and communication" },
  { icon: Flag, label: "Handover and project completion" },
];

export default function ServicesCards() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="pb-12 md:pb-16 bg-background" ref={ref}>
      <div className="container-custom max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 hover:border-accent/30 transition-all"
            >
              <s.icon size={20} className="text-accent" />
              <p className="text-sm text-foreground leading-snug">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
