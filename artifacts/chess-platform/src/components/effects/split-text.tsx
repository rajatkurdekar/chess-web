import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface SplitTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  charDuration?: number;
  stagger?: number;
  as?: keyof React.JSX.IntrinsicElements;
}

export function SplitText({
  text,
  className,
  style,
  delay = 0,
  charDuration = 0.55,
  stagger = 0.028,
  as: Tag = "span",
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true, margin: "-60px" });

  const words = text.split(" ");
  let charCount = 0;

  const Wrapper = motion[Tag as keyof typeof motion] as typeof motion.span;

  return (
    <Wrapper ref={ref} className={className} style={{ ...style, display: "inline" }}>
      {words.map((word, wi) => (
        <span
          key={wi}
          style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", marginRight: "0.22em", paddingTop: "0.12em", paddingBottom: "0.1em" }}
        >
          {word.split("").map((char, ci) => {
            const idx = charCount++;
            return (
              <motion.span
                key={ci}
                style={{ display: "inline-block" }}
                initial={{ y: "105%", opacity: 0, rotateX: -40 }}
                animate={
                  isInView
                    ? { y: 0, opacity: 1, rotateX: 0 }
                    : { y: "105%", opacity: 0, rotateX: -40 }
                }
                transition={{
                  duration: charDuration,
                  delay: delay + idx * stagger,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {char}
              </motion.span>
            );
          })}
        </span>
      ))}
    </Wrapper>
  );
}

interface LineRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function LineReveal({ children, delay = 0, className, style }: LineRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true, margin: "-60px" });

  return (
    <div ref={ref} style={{ overflow: "hidden", ...style }} className={className}>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
