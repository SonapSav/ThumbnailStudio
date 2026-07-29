/**
 * Shared shadow + glow helpers used by text, shape, and image layers so every
 * layer interprets the effect the same way.
 *
 * - Shadow offset is polar: 0° points right, 90° points down.
 * - Glow is a centered (zero-offset) colored halo, stacked `intensity` times so
 *   it can build up to a bright, tight halo.
 *
 * Two output flavors:
 * - `cssShadowList()` → a `text-shadow` / `box-shadow` value (comma-separated).
 *   Used for text glyphs and the text highlight box.
 * - `cssFilter()` → a `filter` value of chained `drop-shadow()`s. Used for
 *   shapes and images, because drop-shadow follows the rendered alpha (so it
 *   hugs triangles, ellipses, and cutout PNGs).
 */
export interface ShadowParams {
  enabled: boolean;
  color: string;
  opacity: number;
  angle: number;
  distance: number;
  blur: number;
}

export interface GlowParams {
  enabled: boolean;
  color: string;
  opacity: number;
  size: number;
  intensity: number;
}

/** Convert a hex or rgb(a) color + opacity multiplier into an rgba() string. */
export const toRgba = (color: string, alpha: number): string => {
  const c = (color || "").trim();
  const a = Math.max(0, Math.min(1, alpha));

  const hex = c.match(/^#([0-9a-fA-F]{3,8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) {
      h = h
        .split("")
        .map((ch) => ch + ch)
        .join("");
    }
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const baseA = h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return `rgba(${r}, ${g}, ${b}, ${baseA * a})`;
  }

  const rgb = c.match(/rgba?\(([^)]+)\)/i);
  if (rgb) {
    const parts = rgb[1].split(",").map((s) => s.trim());
    const baseA = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
    return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${baseA * a})`;
  }

  return c;
};

const xy = (angle: number, distance: number) => {
  const rad = ((angle ?? 90) * Math.PI) / 180;
  const d = distance ?? 0;
  return { x: (Math.cos(rad) * d).toFixed(2), y: (Math.sin(rad) * d).toFixed(2) };
};

const passes = (intensity: number) =>
  Math.max(1, Math.min(5, Math.round(intensity ?? 1)));

/**
 * `text-shadow` / `box-shadow` value combining an offset shadow and a stacked
 * glow, or undefined when both are disabled.
 */
export const cssShadowList = (
  s: ShadowParams,
  g: GlowParams,
): string | undefined => {
  const parts: string[] = [];
  if (s?.enabled) {
    const { x, y } = xy(s.angle, s.distance);
    parts.push(`${x}px ${y}px ${s.blur ?? 0}px ${toRgba(s.color, s.opacity)}`);
  }
  if (g?.enabled) {
    const one = `0 0 ${g.size ?? 0}px ${toRgba(g.color, g.opacity)}`;
    for (let i = 0; i < passes(g.intensity); i++) parts.push(one);
  }
  return parts.length ? parts.join(", ") : undefined;
};

/**
 * `filter` value (optional leading blur + chained drop-shadows) combining a
 * layer blur, an offset shadow, and a stacked glow. Undefined when all off.
 */
export const cssFilter = (
  s: ShadowParams,
  g: GlowParams,
  blurPx = 0,
): string | undefined => {
  const parts: string[] = [];
  if (blurPx > 0) parts.push(`blur(${blurPx}px)`);
  if (s?.enabled) {
    const { x, y } = xy(s.angle, s.distance);
    parts.push(
      `drop-shadow(${x}px ${y}px ${s.blur ?? 0}px ${toRgba(s.color, s.opacity)})`,
    );
  }
  if (g?.enabled) {
    const one = `drop-shadow(0 0 ${g.size ?? 0}px ${toRgba(g.color, g.opacity)})`;
    for (let i = 0; i < passes(g.intensity); i++) parts.push(one);
  }
  return parts.length ? parts.join(" ") : undefined;
};
