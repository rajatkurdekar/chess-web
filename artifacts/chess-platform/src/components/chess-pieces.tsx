import React from "react";

interface PieceProps {
  className?: string;
  style?: React.CSSProperties;
}

// ─── WHITE PIECES ─────────────────────────────────────────────────────────────

export const WhiteKing = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <g fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
      <path fill="white" strokeLinecap="butt" strokeLinejoin="miter"
        d="M22.5 25c0 0 4.5-7.5 3-10.5 0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
      <path fill="white" strokeLinecap="butt"
        d="M12.5 37c1-5.5 5.5-8 10-8s9 2.5 10 8" />
      <path fill="white" d="M11.5 37h22v3.5h-22z" />
      <path fill="white" strokeLinecap="butt" strokeLinejoin="miter"
        d="M20 8v4l-7.5 2s0 6 2.5 8 4.5 5 7.5 5 7.5-3 10-5 2.5-8 2.5-8L25 12V8z" />
    </g>
  </svg>
);

export const WhiteQueen = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <g fill="white" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="12" r="2.75" />
      <circle cx="14" cy="9" r="2.75" />
      <circle cx="22.5" cy="8" r="2.75" />
      <circle cx="31" cy="9" r="2.75" />
      <circle cx="39" cy="12" r="2.75" />
      <path strokeLinecap="butt"
        d="M9 26c8.5-8.5 15.5-8.5 27 0l2.5-12.5L31 25l-.3-9.5-5.2 9.5-5-9.5L17 25 6.5 13.5z" />
      <path strokeLinecap="butt"
        d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
      <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c4-1.5 17-1.5 21 0" />
    </g>
  </svg>
);

export const WhiteRook = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <g fill="white" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 39h27v-3H9zM12 36v-4h21v4zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinejoin="miter" />
      <path d="M34 14l-3 3H14l-3-3" />
      <path d="M31 17v12.5H14V17" strokeLinejoin="miter" strokeLinecap="butt" />
      <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
    </g>
  </svg>
);

export const WhiteBishop = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <g fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle fill="white" cx="22.5" cy="10" r="3" />
      <path fill="white"
        d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" />
      <path fill="white" strokeLinecap="butt"
        d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
      <path d="M25 8a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" fill="white" />
    </g>
  </svg>
);

export const WhiteKnight = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <g fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path fill="white"
        d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
      <path fill="white"
        d="M24 18c.38 5.12-4 6.85-8 8.5-4.5 2-6.5 1.5-7.5 4 1 1.5.5 2-.5 3 1.5 1 3.5 1.5 3.5 1.5-1.5 2.5.5 2.5.5 2.5 6.5 0 16.5 0 23-3 0-2 .5-4 0-6-7-2-14-6.5-14-11.5.3-4.5 4.3-9.5 6.5-8z" />
      <path fill="#000" d="M9.5 25.5a.5.5 0 110-1 .5.5 0 010 1z" />
      <path fill="#000" d="M15 15.5a.5.5 0 110-1 .5.5 0 010 1z" />
    </g>
  </svg>
);

export const WhitePawn = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <g fill="white" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="22.5" cy="9.5" r="4.5" />
      <path d="M22.5 14.5c-3.5 0-6 2.5-6 5.5 0 2 1.5 4.5 3 6l-2 2.5c-.5.5-.5 1-.5 2.5h11c0-1.5 0-2-.5-2.5l-2-2.5c1.5-1.5 3-4 3-6 0-3-2.5-5.5-6-5.5z" />
      <path d="M11.5 37h22v-3h-22zM12 34v-3h21v3" strokeLinejoin="miter" />
    </g>
  </svg>
);

// ─── BLACK PIECES ─────────────────────────────────────────────────────────────

export const BlackKing = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <g fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
      <path fill="#1a1a1a" stroke="#fff" strokeLinecap="butt" strokeLinejoin="miter"
        d="M22.5 25c0 0 4.5-7.5 3-10.5 0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
      <path fill="#1a1a1a" strokeLinecap="butt"
        d="M12.5 37c1-5.5 5.5-8 10-8s9 2.5 10 8" />
      <path fill="#1a1a1a" d="M11.5 37h22v3.5h-22z" />
      <path fill="#1a1a1a" strokeLinecap="butt" strokeLinejoin="miter"
        d="M20 8v4l-7.5 2s0 6 2.5 8 4.5 5 7.5 5 7.5-3 10-5 2.5-8 2.5-8L25 12V8z" />
    </g>
  </svg>
);

export const BlackQueen = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <g fill="#1a1a1a" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="12" r="2.75" />
      <circle cx="14" cy="9" r="2.75" />
      <circle cx="22.5" cy="8" r="2.75" />
      <circle cx="31" cy="9" r="2.75" />
      <circle cx="39" cy="12" r="2.75" />
      <path strokeLinecap="butt"
        d="M9 26c8.5-8.5 15.5-8.5 27 0l2.5-12.5L31 25l-.3-9.5-5.2 9.5-5-9.5L17 25 6.5 13.5z" />
      <path strokeLinecap="butt"
        d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
      <path stroke="#555" d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c4-1.5 17-1.5 21 0" />
    </g>
  </svg>
);

export const BlackRook = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <g fill="#1a1a1a" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 39h27v-3H9zM12 36v-4h21v4zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinejoin="miter" />
      <path d="M34 14l-3 3H14l-3-3" />
      <path d="M31 17v12.5H14V17" strokeLinejoin="miter" strokeLinecap="butt" />
      <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
    </g>
  </svg>
);

export const BlackBishop = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <g fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle fill="#1a1a1a" cx="22.5" cy="10" r="3" />
      <path fill="#1a1a1a"
        d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" />
      <path fill="#1a1a1a" strokeLinecap="butt"
        d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
      <path d="M25 8a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" fill="#1a1a1a" />
    </g>
  </svg>
);

export const BlackKnight = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <g fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path fill="#1a1a1a"
        d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
      <path fill="#1a1a1a"
        d="M24 18c.38 5.12-4 6.85-8 8.5-4.5 2-6.5 1.5-7.5 4 1 1.5.5 2-.5 3 1.5 1 3.5 1.5 3.5 1.5-1.5 2.5.5 2.5.5 2.5 6.5 0 16.5 0 23-3 0-2 .5-4 0-6-7-2-14-6.5-14-11.5.3-4.5 4.3-9.5 6.5-8z" />
      <path fill="#fff" d="M9.5 25.5a.5.5 0 110-1 .5.5 0 010 1z" />
      <path fill="#fff" d="M15 15.5a.5.5 0 110-1 .5.5 0 010 1z" />
    </g>
  </svg>
);

export const BlackPawn = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <g fill="#1a1a1a" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="22.5" cy="9.5" r="4.5" />
      <path d="M22.5 14.5c-3.5 0-6 2.5-6 5.5 0 2 1.5 4.5 3 6l-2 2.5c-.5.5-.5 1-.5 2.5h11c0-1.5 0-2-.5-2.5l-2-2.5c1.5-1.5 3-4 3-6 0-3-2.5-5.5-6-5.5z" />
      <path d="M11.5 37h22v-3h-22zM12 34v-3h21v3" strokeLinejoin="miter" />
    </g>
  </svg>
);

// ─── PIECE LOOKUP MAP ──────────────────────────────────────────────────────────

const PIECE_MAP: Record<string, React.ComponentType<PieceProps>> = {
  wK: WhiteKing,   wQ: WhiteQueen,  wR: WhiteRook,
  wB: WhiteBishop, wN: WhiteKnight, wP: WhitePawn,
  bK: BlackKing,   bQ: BlackQueen,  bR: BlackRook,
  bB: BlackBishop, bN: BlackKnight, bP: BlackPawn,
};

interface ChessPieceProps {
  color: "w" | "b";
  type: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ChessPiece({ color, type, className, style }: ChessPieceProps) {
  const key = `${color}${type.toUpperCase()}`;
  const Component = PIECE_MAP[key];
  if (!Component) return null;
  return <Component className={className} style={style} />;
}
