"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface FadeInProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "none";
  /** mount = odmah pri učitavanju stranice (hero); inView = pri skrolu (liste) */
  when?: "mount" | "inView";
}

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  when = "inView",
  ...props
}: FadeInProps) {
  const initial = {
    opacity: 0,
    y: direction === "up" ? 16 : 0,
    scale: direction === "none" ? 0.98 : 1,
  };
  const animate = { opacity: 1, y: 0, scale: 1 };
  const transition = { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const };

  if (when === "mount") {
    return (
      <motion.div
        initial={initial}
        animate={animate}
        transition={transition}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: "-40px" }}
      transition={transition}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
