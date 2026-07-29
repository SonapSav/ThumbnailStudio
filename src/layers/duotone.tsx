import React from "react";

/** Parse a hex or rgb(a) color into 0–1 RGB components. */
const toUnit = (color: string): { r: number; g: number; b: number } => {
  const c = (color || "").trim();
  const hex = c.match(/^#([0-9a-fA-F]{3,8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) {
      h = h
        .split("")
        .map((ch) => ch + ch)
        .join("");
    }
    return {
      r: parseInt(h.slice(0, 2), 16) / 255,
      g: parseInt(h.slice(2, 4), 16) / 255,
      b: parseInt(h.slice(4, 6), 16) / 255,
    };
  }
  const rgb = c.match(/rgba?\(([^)]+)\)/i);
  if (rgb) {
    const p = rgb[1].split(",").map((s) => parseFloat(s.trim()));
    return { r: (p[0] || 0) / 255, g: (p[1] || 0) / 255, b: (p[2] || 0) / 255 };
  }
  return { r: 0, g: 0, b: 0 };
};

/**
 * A hidden SVG <filter> that turns any element it's applied to (via
 * `filter: url(#id)`) into a duotone: luminance → a two-color ramp from the
 * shadow color (dark tones) to the highlight color (light tones).
 */
export const DuotoneFilter: React.FC<{
  id: string;
  shadow: string;
  highlight: string;
}> = ({ id, shadow, highlight }) => {
  const s = toUnit(shadow);
  const h = toUnit(highlight);
  return (
    <svg
      width={0}
      height={0}
      aria-hidden
      style={{ position: "absolute", width: 0, height: 0 }}
    >
      <defs>
        <filter id={id} colorInterpolationFilters="sRGB">
          {/* Desaturate to luminance. */}
          <feColorMatrix
            type="matrix"
            values="0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0"
          />
          {/* Map 0→shadow, 1→highlight per channel. */}
          <feComponentTransfer>
            <feFuncR type="table" tableValues={`${s.r} ${h.r}`} />
            <feFuncG type="table" tableValues={`${s.g} ${h.g}`} />
            <feFuncB type="table" tableValues={`${s.b} ${h.b}`} />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
};
