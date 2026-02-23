"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { scrollReveal } from "@/lib/animations";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimatedSection({
  children,
  className,
  delay = 0,
}: AnimatedSectionProps) {
  return (
    <motion.section
      variants={scrollReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
