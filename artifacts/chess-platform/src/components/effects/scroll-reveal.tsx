import { useRef, ReactNode } from "react";
import { motion, useInView } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "none";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: Direction;
  distance?: number;
  className?: string;
  style?: React.CSSProperties;
  once?: boolean;
}

export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.65,
  direction = "up",
  distance = 36,
  className,
  style,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once, margin: "-70px" });

  const initial = {
    opacity: 0,
    y: direction === "up" ? distance : direction === "down" ? -distance : 0,
    x: direction === "left" ? distance : direction === "right" ? -distance : 0,
  };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : initial}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: ReactNode[];
  stagger?: number;
  delay?: number;
  direction?: Direction;
  className?: string;
}

export function StaggerReveal({ children, stagger = 0.08, delay = 0, direction = "up", className }: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => {
        const initial = {
          opacity: 0,
          y: direction === "up" ? 32 : direction === "down" ? -32 : 0,
          x: direction === "left" ? 32 : direction === "right" ? -32 : 0,
        };
        return (
          <motion.div
            key={i}
            initial={initial}
            animate={isInView ? { opacity: 1, y: 0, x: 0 } : initial}
            transition={{ duration: 0.6, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
          >
            {child}
          </motion.div>
        );
      })}
    </div>
  );
}
