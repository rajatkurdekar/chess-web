import React from "react";

interface PieceProps {
  className?: string;
  style?: React.CSSProperties;
}

// ─── SHARED GRADIENT DEFS ─────────────────────────────────────────────────────
// Render once in the DOM; all piece SVGs reference these shared IDs.

export function ChessDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {/* White piece – main body: warm ivory to brown, light from upper-left */}
        <radialGradient id="cf-w-body" cx="36%" cy="26%" r="72%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#FFFFFF" />
          <stop offset="18%"  stopColor="#FAF0D8" />
          <stop offset="50%"  stopColor="#E0C88C" />
          <stop offset="82%"  stopColor="#B89060" />
          <stop offset="100%" stopColor="#7A5030" />
        </radialGradient>

        {/* White piece – ball details (queen orbs, etc) */}
        <radialGradient id="cf-w-ball" cx="33%" cy="28%" r="65%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#FFFFFF" />
          <stop offset="45%"  stopColor="#ECD8A8" />
          <stop offset="100%" stopColor="#907050" />
        </radialGradient>

        {/* White piece – base platform */}
        <radialGradient id="cf-w-base" cx="40%" cy="32%" r="68%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#FFFFF2" />
          <stop offset="35%"  stopColor="#E8D4A0" />
          <stop offset="70%"  stopColor="#C0A068" />
          <stop offset="100%" stopColor="#7A5832" />
        </radialGradient>

        {/* Black piece – main body: ebony with warm specular, light from upper-left */}
        <radialGradient id="cf-b-body" cx="36%" cy="26%" r="72%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#908880" />
          <stop offset="20%"  stopColor="#504540" />
          <stop offset="55%"  stopColor="#201A14" />
          <stop offset="82%"  stopColor="#100C08" />
          <stop offset="100%" stopColor="#050302" />
        </radialGradient>

        {/* Black piece – ball details */}
        <radialGradient id="cf-b-ball" cx="33%" cy="28%" r="65%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#A09888" />
          <stop offset="45%"  stopColor="#302820" />
          <stop offset="100%" stopColor="#070504" />
        </radialGradient>

        {/* Black piece – base platform */}
        <radialGradient id="cf-b-base" cx="40%" cy="32%" r="68%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#787068" />
          <stop offset="35%"  stopColor="#302820" />
          <stop offset="70%"  stopColor="#181210" />
          <stop offset="100%" stopColor="#060402" />
        </radialGradient>

        {/* Ambient shadow under every piece */}
        <radialGradient id="cf-shadow" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.50)" />
          <stop offset="65%"  stopColor="rgba(0,0,0,0.18)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>

        {/* Inner-glow filter for check / selected state */}
        <filter id="cf-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

// ─── WHITE PIECES ─────────────────────────────────────────────────────────────

export const WhiteKing = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    {/* Ground shadow */}
    <ellipse cx="22.5" cy="42.5" rx="12" ry="2" fill="url(#cf-shadow)" />
    <g stroke="#5A3818" strokeLinecap="round" strokeLinejoin="round">
      {/* Base platform */}
      <path fill="url(#cf-w-base)" strokeWidth="1.2"
        d="M11.5 40.5h22v-3h-22z" />
      {/* Lower skirt */}
      <path fill="url(#cf-w-base)" strokeWidth="1.0" strokeLinecap="butt"
        d="M12.5 37c1-5.5 5.5-8 10-8s9 2.5 10 8" />
      {/* Main body / cape */}
      <path fill="url(#cf-w-body)" strokeWidth="1.1" strokeLinecap="butt" strokeLinejoin="miter"
        d="M20 8v4l-7.5 2s0 6 2.5 8 4.5 5 7.5 5 7.5-3 10-5 2.5-8 2.5-8L25 12V8z" />
      {/* Crown center detail */}
      <path fill="url(#cf-w-body)" strokeWidth="1.0" strokeLinecap="butt" strokeLinejoin="miter"
        d="M22.5 25c0 0 4.5-7.5 3-10.5 0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
      {/* Cross */}
      <path strokeWidth="1.8" strokeLinejoin="miter" fill="none"
        d="M22.5 11.63V6M20 8h5" />
    </g>
    {/* Rim light (right edge of body) */}
    <path fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2"
      d="M29 14.5s2.5 3.5 2.5 8-3.5 7-7 9" />
    {/* Specular highlight */}
    <ellipse cx="18.5" cy="18" rx="3.2" ry="1.8" fill="rgba(255,255,255,0.50)" transform="rotate(-25,18.5,18)" />
  </svg>
);

export const WhiteQueen = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <ellipse cx="22.5" cy="42.5" rx="12" ry="2" fill="url(#cf-shadow)" />
    <g stroke="#5A3818" strokeLinecap="round" strokeLinejoin="round">
      {/* Crown orbs */}
      <circle cx="6"    cy="12" r="2.75" fill="url(#cf-w-ball)" strokeWidth="1.1" />
      <circle cx="14"   cy="9"  r="2.75" fill="url(#cf-w-ball)" strokeWidth="1.1" />
      <circle cx="22.5" cy="8"  r="2.75" fill="url(#cf-w-ball)" strokeWidth="1.1" />
      <circle cx="31"   cy="9"  r="2.75" fill="url(#cf-w-ball)" strokeWidth="1.1" />
      <circle cx="39"   cy="12" r="2.75" fill="url(#cf-w-ball)" strokeWidth="1.1" />
      {/* Body */}
      <path fill="url(#cf-w-body)" strokeWidth="1.1" strokeLinecap="butt"
        d="M9 26c8.5-8.5 15.5-8.5 27 0l2.5-12.5L31 25l-.3-9.5-5.2 9.5-5-9.5L17 25 6.5 13.5z" />
      {/* Skirt */}
      <path fill="url(#cf-w-body)" strokeWidth="1.0" strokeLinecap="butt"
        d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
      {/* Decorative lines on skirt */}
      <path fill="none" stroke="#5A3818" strokeWidth="0.8"
        d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c4-1.5 17-1.5 21 0" />
      {/* Base */}
      <path fill="url(#cf-w-base)" strokeWidth="1.2"
        d="M11 38h23v3H11z" />
    </g>
    {/* Rim light */}
    <path fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1.1"
      d="M33 26c1 2 2 2.5 1.5 4-.5 2-1.5 2.5-1 3.5.5 1.5 1.5 1.5 0 2.5" />
    {/* Specular */}
    <ellipse cx="17" cy="21" rx="3.5" ry="2" fill="rgba(255,255,255,0.48)" transform="rotate(-28,17,21)" />
  </svg>
);

export const WhiteRook = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <ellipse cx="22.5" cy="42.5" rx="12" ry="2" fill="url(#cf-shadow)" />
    <g stroke="#5A3818" strokeLinecap="round" strokeLinejoin="round">
      {/* Base */}
      <path fill="url(#cf-w-base)" strokeWidth="1.2" d="M9 39h27v-3H9z" />
      {/* Mid step */}
      <path fill="url(#cf-w-base)" strokeWidth="1.0" d="M12 36v-4h21v4z" />
      {/* Tower body */}
      <path fill="url(#cf-w-body)" strokeWidth="1.0" strokeLinecap="butt"
        d="M31 17v12.5H14V17" strokeLinejoin="miter" />
      {/* Body–base join */}
      <path fill="url(#cf-w-body)" strokeWidth="1.0" d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
      {/* Shoulder taper */}
      <path fill="url(#cf-w-body)" strokeWidth="1.0" d="M34 14l-3 3H14l-3-3" />
      {/* Battlements */}
      <path fill="url(#cf-w-body)" strokeWidth="1.1" strokeLinejoin="miter"
        d="M11 14V9h4v2h5V9h5v2h5V9h4v5" />
    </g>
    {/* Rim light on right side */}
    <path fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.1"
      d="M31 17.5v11.5M34 14.5v-5" />
    {/* Specular */}
    <ellipse cx="19" cy="21" rx="3" ry="5" fill="rgba(255,255,255,0.38)" transform="rotate(-10,19,21)" />
  </svg>
);

export const WhiteBishop = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <ellipse cx="22.5" cy="42.5" rx="12" ry="2" fill="url(#cf-shadow)" />
    <g stroke="#5A3818" strokeLinecap="round" strokeLinejoin="round">
      {/* Finial ball at top */}
      <circle cx="22.5" cy="10" r="3" fill="url(#cf-w-ball)" strokeWidth="1.1" />
      {/* Bishop body */}
      <path fill="url(#cf-w-body)" strokeWidth="1.0" strokeLinecap="butt"
        d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
      {/* Base collar */}
      <path fill="url(#cf-w-base)" strokeWidth="1.0"
        d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" />
      {/* Mitre line */}
      <path fill="url(#cf-w-body)" strokeWidth="1.0" d="M25 8a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </g>
    {/* Rim light */}
    <path fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="1.2"
      d="M28 26c2 1 2.5 4.5 2 5.5" />
    {/* Specular on finial */}
    <ellipse cx="21" cy="8.5" rx="1.5" ry="1" fill="rgba(255,255,255,0.65)" transform="rotate(-20,21,8.5)" />
    {/* Specular on body */}
    <ellipse cx="18.5" cy="20" rx="2.5" ry="4" fill="rgba(255,255,255,0.36)" transform="rotate(-12,18.5,20)" />
  </svg>
);

export const WhiteKnight = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <ellipse cx="22.5" cy="42.5" rx="12" ry="2" fill="url(#cf-shadow)" />
    <g stroke="#5A3818" strokeLinecap="round" strokeLinejoin="round">
      {/* Main horse silhouette */}
      <path fill="url(#cf-w-body)" strokeWidth="1.1"
        d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
      {/* Head / muzzle */}
      <path fill="url(#cf-w-body)" strokeWidth="1.0"
        d="M24 18c.38 5.12-4 6.85-8 8.5-4.5 2-6.5 1.5-7.5 4 1 1.5.5 2-.5 3 1.5 1 3.5 1.5 3.5 1.5-1.5 2.5.5 2.5.5 2.5 6.5 0 16.5 0 23-3 0-2 .5-4 0-6-7-2-14-6.5-14-11.5.3-4.5 4.3-9.5 6.5-8z" />
      {/* Eye */}
      <circle cx="9.5" cy="25" r="1.1" fill="#5A3818" stroke="none" />
      {/* Nostril */}
      <circle cx="15"  cy="15" r="1.1" fill="#5A3818" stroke="none" />
    </g>
    {/* Rim light on back */}
    <path fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="1.2"
      d="M35 16c2 4 3 10 3 20" />
    {/* Specular highlight on head */}
    <ellipse cx="21" cy="14" rx="3.5" ry="2" fill="rgba(255,255,255,0.48)" transform="rotate(-30,21,14)" />
  </svg>
);

export const WhitePawn = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <ellipse cx="22.5" cy="42.5" rx="11" ry="2" fill="url(#cf-shadow)" />
    <g stroke="#5A3818" strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <circle cx="22.5" cy="9.5" r="4.5" fill="url(#cf-w-ball)" strokeWidth="1.1" />
      {/* Body */}
      <path fill="url(#cf-w-body)" strokeWidth="1.0"
        d="M22.5 14.5c-3.5 0-6 2.5-6 5.5 0 2 1.5 4.5 3 6l-2 2.5c-.5.5-.5 1-.5 2.5h11c0-1.5 0-2-.5-2.5l-2-2.5c1.5-1.5 3-4 3-6 0-3-2.5-5.5-6-5.5z" />
      {/* Base step */}
      <path fill="url(#cf-w-base)" strokeWidth="1.0" strokeLinejoin="miter"
        d="M12 34v-3h21v3" />
      {/* Base platform */}
      <path fill="url(#cf-w-base)" strokeWidth="1.2"
        d="M11.5 37h22v-3h-22z" />
    </g>
    {/* Rim light */}
    <path fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.0"
      d="M26 15c2 1.5 2.5 4 2 6s-1.5 4-2 5" />
    {/* Specular on head */}
    <ellipse cx="20" cy="7.5" rx="2.2" ry="1.4" fill="rgba(255,255,255,0.60)" transform="rotate(-20,20,7.5)" />
  </svg>
);

// ─── BLACK PIECES ─────────────────────────────────────────────────────────────

export const BlackKing = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <ellipse cx="22.5" cy="42.5" rx="12" ry="2" fill="url(#cf-shadow)" />
    <g stroke="#000000" strokeLinecap="round" strokeLinejoin="round">
      {/* Base platform */}
      <path fill="url(#cf-b-base)" strokeWidth="1.2"
        d="M11.5 40.5h22v-3h-22z" />
      {/* Lower skirt */}
      <path fill="url(#cf-b-base)" strokeWidth="1.0" strokeLinecap="butt"
        d="M12.5 37c1-5.5 5.5-8 10-8s9 2.5 10 8" />
      {/* Main body */}
      <path fill="url(#cf-b-body)" strokeWidth="1.1" strokeLinecap="butt" strokeLinejoin="miter"
        d="M20 8v4l-7.5 2s0 6 2.5 8 4.5 5 7.5 5 7.5-3 10-5 2.5-8 2.5-8L25 12V8z" />
      {/* Crown center boss */}
      <path fill="url(#cf-b-body)" strokeWidth="1.0" strokeLinecap="butt" strokeLinejoin="miter"
        d="M22.5 25c0 0 4.5-7.5 3-10.5 0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
      {/* Cross */}
      <path strokeWidth="1.8" strokeLinejoin="miter" fill="none"
        d="M22.5 11.63V6M20 8h5" stroke="#000" />
    </g>
    {/* Inner detail lines */}
    <path fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.9"
      d="M15 14.5s-.5 6 2 8.5M20 8.5v3.5" />
    {/* Rim light */}
    <path fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3"
      d="M29 14.5s2.5 3.5 2.5 8-3.5 7-7 9" />
    {/* Specular */}
    <ellipse cx="18.5" cy="18" rx="3" ry="1.7" fill="rgba(255,255,255,0.18)" transform="rotate(-25,18.5,18)" />
  </svg>
);

export const BlackQueen = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <ellipse cx="22.5" cy="42.5" rx="12" ry="2" fill="url(#cf-shadow)" />
    <g stroke="#000000" strokeLinecap="round" strokeLinejoin="round">
      {/* Crown orbs */}
      <circle cx="6"    cy="12" r="2.75" fill="url(#cf-b-ball)" strokeWidth="1.1" />
      <circle cx="14"   cy="9"  r="2.75" fill="url(#cf-b-ball)" strokeWidth="1.1" />
      <circle cx="22.5" cy="8"  r="2.75" fill="url(#cf-b-ball)" strokeWidth="1.1" />
      <circle cx="31"   cy="9"  r="2.75" fill="url(#cf-b-ball)" strokeWidth="1.1" />
      <circle cx="39"   cy="12" r="2.75" fill="url(#cf-b-ball)" strokeWidth="1.1" />
      {/* Body */}
      <path fill="url(#cf-b-body)" strokeWidth="1.1" strokeLinecap="butt"
        d="M9 26c8.5-8.5 15.5-8.5 27 0l2.5-12.5L31 25l-.3-9.5-5.2 9.5-5-9.5L17 25 6.5 13.5z" />
      {/* Skirt */}
      <path fill="url(#cf-b-body)" strokeWidth="1.0" strokeLinecap="butt"
        d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
      {/* Decorative lines */}
      <path fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="0.8"
        d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c4-1.5 17-1.5 21 0" />
      {/* Base */}
      <path fill="url(#cf-b-base)" strokeWidth="1.2" d="M11 38h23v3H11z" />
    </g>
    {/* Rim light */}
    <path fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="1.2"
      d="M33 26c1 2 2 2.5 1.5 4-.5 2-1.5 2.5-1 3.5.5 1.5 1.5 1.5 0 2.5" />
    {/* Specular on orbs */}
    <ellipse cx="21.5" cy="6.8" rx="1.3" ry="0.9" fill="rgba(255,255,255,0.30)" />
    {/* Specular on body */}
    <ellipse cx="17" cy="21" rx="3.2" ry="1.8" fill="rgba(255,255,255,0.16)" transform="rotate(-28,17,21)" />
  </svg>
);

export const BlackRook = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <ellipse cx="22.5" cy="42.5" rx="12" ry="2" fill="url(#cf-shadow)" />
    <g stroke="#000000" strokeLinecap="round" strokeLinejoin="round">
      {/* Base */}
      <path fill="url(#cf-b-base)" strokeWidth="1.2" d="M9 39h27v-3H9z" />
      {/* Mid step */}
      <path fill="url(#cf-b-base)" strokeWidth="1.0" d="M12 36v-4h21v4z" />
      {/* Tower body */}
      <path fill="url(#cf-b-body)" strokeWidth="1.0" strokeLinecap="butt" strokeLinejoin="miter"
        d="M31 17v12.5H14V17" />
      {/* Body–base join */}
      <path fill="url(#cf-b-body)" strokeWidth="1.0" d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
      {/* Shoulder taper */}
      <path fill="url(#cf-b-body)" strokeWidth="1.0" d="M34 14l-3 3H14l-3-3" />
      {/* Battlements */}
      <path fill="url(#cf-b-body)" strokeWidth="1.1" strokeLinejoin="miter"
        d="M11 14V9h4v2h5V9h5v2h5V9h4v5" />
    </g>
    {/* Inner detail lines */}
    <path fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="0.8"
      d="M14 17v12M22.5 17v12" />
    {/* Rim light */}
    <path fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.1"
      d="M31 17.5v11.5M34 14.5v-5" />
    {/* Specular */}
    <ellipse cx="19" cy="21" rx="2.8" ry="4.8" fill="rgba(255,255,255,0.14)" transform="rotate(-10,19,21)" />
  </svg>
);

export const BlackBishop = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <ellipse cx="22.5" cy="42.5" rx="12" ry="2" fill="url(#cf-shadow)" />
    <g stroke="#000000" strokeLinecap="round" strokeLinejoin="round">
      {/* Finial */}
      <circle cx="22.5" cy="10" r="3" fill="url(#cf-b-ball)" strokeWidth="1.1" />
      {/* Body */}
      <path fill="url(#cf-b-body)" strokeWidth="1.0" strokeLinecap="butt"
        d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
      {/* Base collar */}
      <path fill="url(#cf-b-base)" strokeWidth="1.0"
        d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" />
      {/* Top detail */}
      <path fill="url(#cf-b-body)" strokeWidth="1.0" d="M25 8a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </g>
    {/* Inner detail */}
    <path fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="0.8"
      d="M22.5 13c-4 2-5.5 8-4 13" />
    {/* Rim light */}
    <path fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2"
      d="M28 26c2 1 2.5 4.5 2 5.5" />
    {/* Specular on finial */}
    <ellipse cx="21" cy="8.5" rx="1.4" ry="0.9" fill="rgba(255,255,255,0.28)" transform="rotate(-20,21,8.5)" />
    {/* Specular on body */}
    <ellipse cx="18.5" cy="20" rx="2.2" ry="3.8" fill="rgba(255,255,255,0.13)" transform="rotate(-12,18.5,20)" />
  </svg>
);

export const BlackKnight = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <ellipse cx="22.5" cy="42.5" rx="12" ry="2" fill="url(#cf-shadow)" />
    <g stroke="#000000" strokeLinecap="round" strokeLinejoin="round">
      {/* Main body */}
      <path fill="url(#cf-b-body)" strokeWidth="1.1"
        d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
      {/* Head */}
      <path fill="url(#cf-b-body)" strokeWidth="1.0"
        d="M24 18c.38 5.12-4 6.85-8 8.5-4.5 2-6.5 1.5-7.5 4 1 1.5.5 2-.5 3 1.5 1 3.5 1.5 3.5 1.5-1.5 2.5.5 2.5.5 2.5 6.5 0 16.5 0 23-3 0-2 .5-4 0-6-7-2-14-6.5-14-11.5.3-4.5 4.3-9.5 6.5-8z" />
      {/* Eye (light) */}
      <circle cx="9.5" cy="25" r="1.1" fill="rgba(255,255,255,0.70)" stroke="none" />
      {/* Nostril */}
      <circle cx="15"  cy="15" r="1.1" fill="rgba(255,255,255,0.50)" stroke="none" />
    </g>
    {/* Inner detail */}
    <path fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8"
      d="M18 18c-2 2-3 5-3 9" />
    {/* Rim light on back */}
    <path fill="none" stroke="rgba(255,255,255,0.24)" strokeWidth="1.3"
      d="M35 16c2 4 3 10 3 20" />
    {/* Specular on head */}
    <ellipse cx="21" cy="14" rx="3" ry="1.8" fill="rgba(255,255,255,0.16)" transform="rotate(-30,21,14)" />
  </svg>
);

export const BlackPawn = ({ className, style }: PieceProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className={className} style={style}>
    <ellipse cx="22.5" cy="42.5" rx="11" ry="2" fill="url(#cf-shadow)" />
    <g stroke="#000000" strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <circle cx="22.5" cy="9.5" r="4.5" fill="url(#cf-b-ball)" strokeWidth="1.1" />
      {/* Body */}
      <path fill="url(#cf-b-body)" strokeWidth="1.0"
        d="M22.5 14.5c-3.5 0-6 2.5-6 5.5 0 2 1.5 4.5 3 6l-2 2.5c-.5.5-.5 1-.5 2.5h11c0-1.5 0-2-.5-2.5l-2-2.5c1.5-1.5 3-4 3-6 0-3-2.5-5.5-6-5.5z" />
      {/* Base step */}
      <path fill="url(#cf-b-base)" strokeWidth="1.0" strokeLinejoin="miter"
        d="M12 34v-3h21v3" />
      {/* Base */}
      <path fill="url(#cf-b-base)" strokeWidth="1.2"
        d="M11.5 37h22v-3h-22z" />
    </g>
    {/* Rim light */}
    <path fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.0"
      d="M26 15c2 1.5 2.5 4 2 6s-1.5 4-2 5" />
    {/* Specular on head */}
    <ellipse cx="20" cy="7.5" rx="2" ry="1.3" fill="rgba(255,255,255,0.24)" transform="rotate(-20,20,7.5)" />
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
