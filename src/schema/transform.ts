import { z } from "zod";

/**
 * Shared transform applied uniformly to every layer type.
 *
 * - x / y: pixel offset from the CENTER of the canvas (so 0,0 is dead center
 *   and defaults look sensible across all three aspect ratios).
 * - scale: multiplier (1 = natural size).
 * - rotation: degrees, clockwise.
 * - opacity: 0 (transparent) → 1 (opaque).
 * - zIndex: global stacking order across ALL layer arrays. Higher = on top.
 *
 * Every field carries a `.describe()` (Studio label) and a `.default()` — the
 * default is what Studio seeds a NEW array item with, so new layers appear
 * centered, full-size, opaque, and on top (zIndex 100) instead of at 0/blank.
 */
export const zTransform = z.object({
  x: z.number().default(0).describe("X offset from center (px)"),
  y: z.number().default(0).describe("Y offset from center (px)"),
  // .step() sets the drag increment in the Studio number editor, but it ALSO
  // adds a multipleOf() validation, so every allowed value must be a clean
  // multiple of the step. 0.01 keeps all current defaults valid (e.g. 0.12).
  scale: z.number().min(0).step(0.01).default(1).describe("Scale (1 = natural)"),
  rotation: z.number().default(0).describe("Rotation (degrees)"),
  opacity: z.number().min(0).max(1).step(0.01).default(1).describe("Opacity (0–1)"),
  // 100 sits above the template layers (0–12) so a new layer is visible on top.
  // Studio can't compute "max sibling + 1" for a new item, so we start high.
  zIndex: z.number().int().default(100).describe("Stacking order (higher = front)"),
});

export type Transform = z.infer<typeof zTransform>;

/** A convenient default transform for new layers. */
export const defaultTransform: Transform = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  opacity: 1,
  zIndex: 0,
};
