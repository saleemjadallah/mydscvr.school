"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({
  target,
  suffix = "",
  duration = 1.5,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(spring, (v) =>
    Math.round(v).toLocaleString()
  );

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(target);
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated, spring, target]);

  return (
    <span ref={ref} className={className}>
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}
