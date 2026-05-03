import { ReactNode } from "react";
import { motion } from "framer-motion";

interface MarqueeProps {
  items: string[];
  speed?: number;
  separator?: string;
  className?: string;
  itemClassName?: string;
}

export function Marquee({
  items,
  speed = 35,
  separator = "·",
  className,
  itemClassName,
}: MarqueeProps) {
  const doubled = [...items, ...items, ...items, ...items];
  const duration = items.length * (80 / speed);

  return (
    <div className={`overflow-hidden flex items-center ${className ?? ""}`}>
      <motion.div
        className="flex items-center gap-0 whitespace-nowrap flex-shrink-0"
        animate={{ x: [0, `-${100 / 4}%`] }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
          duration,
        }}
        style={{ willChange: "transform" }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className={itemClassName}>{item}</span>
            <span className="mx-5 opacity-40">{separator}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
