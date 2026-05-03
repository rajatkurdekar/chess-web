import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function PremiumCursor() {
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 180, damping: 22 });
  const ringY = useSpring(dotY, { stiffness: 180, damping: 22 });
  const ringScale = useMotionValue(1);
  const springScale = useSpring(ringScale, { stiffness: 250, damping: 20 });
  const isHovering = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };

    const onEnter = () => { isHovering.current = true; ringScale.set(2.2); };
    const onLeave = () => { isHovering.current = false; ringScale.set(1); };

    window.addEventListener("mousemove", onMove);

    const attach = () => {
      document.querySelectorAll("a,button,[role='button'],input,textarea,select,[tabindex]")
        .forEach(el => {
          el.addEventListener("mouseenter", onEnter);
          el.addEventListener("mouseleave", onLeave);
        });
    };
    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      observer.disconnect();
    };
  }, [dotX, dotY, ringScale]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 z-[99999] pointer-events-none rounded-full hidden md:block"
        style={{
          x: dotX, y: dotY,
          translateX: "-50%", translateY: "-50%",
          width: 6, height: 6,
          background: "#C9A84C",
          mixBlendMode: "difference",
        }}
      />
      <motion.div
        className="fixed top-0 left-0 z-[99998] pointer-events-none rounded-full hidden md:block"
        style={{
          x: ringX, y: ringY,
          translateX: "-50%", translateY: "-50%",
          width: 30, height: 30,
          border: "1.5px solid rgba(201,168,76,0.55)",
          scale: springScale,
        }}
      />
    </>
  );
}
