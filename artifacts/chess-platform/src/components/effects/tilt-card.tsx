import { useRef, useState, ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxTilt?: number;
  scale?: number;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function TiltCard({ children, className, style, maxTilt = 10, scale = 1.02, onClick, onMouseEnter, onMouseLeave }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const [glow, setGlow] = useState({ x: 50, y: 50, visible: false });

  const springRotX = useSpring(rotX, { stiffness: 220, damping: 22 });
  const springRotY = useSpring(rotY, { stiffness: 220, damping: 22 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    rotX.set((y - 0.5) * -maxTilt);
    rotY.set((x - 0.5) * maxTilt);
    setGlow({ x: x * 100, y: y * 100, visible: true });
  };

  const handleLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    rotX.set(0);
    rotY.set(0);
    setGlow(g => ({ ...g, visible: false }));
    onMouseLeave?.();
  };

  const handleEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseEnter?.();
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseEnter={handleEnter}
      onClick={onClick}
      style={{
        rotateX: springRotX,
        rotateY: springRotY,
        transformStyle: "preserve-3d",
        perspective: 1000,
        ...style,
      }}
      whileHover={{ scale }}
      transition={{ scale: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
      className={className}
    >
      {/* Spotlight overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.055) 0%, transparent 55%)`,
          opacity: glow.visible ? 1 : 0,
        }}
      />
      {children}
    </motion.div>
  );
}
