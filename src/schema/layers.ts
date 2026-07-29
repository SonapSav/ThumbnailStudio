import { z } from "zod";
import { zColor, zTextarea } from "@remotion/zod-types";
import { zTransform } from "./transform";
import { FONT_KEYS } from "../fonts";

/**
 * One z.object per layer type. We deliberately DO NOT use a discriminated
 * union across types, because Remotion's visual schema editor doesn't render
 * controls for discriminated unions. Instead each type lives in its own array
 * on the root schema, and all layers are unified at render time by `zIndex`.
 *
 * Every field has a `.default()`. Studio seeds a NEW array item from these
 * defaults, so a freshly added layer is immediately visible (centered, 100×100
 * for shapes, opaque, on top) rather than blank/zero-sized. Existing layers in
 * Root.tsx list every field explicitly, so the defaults only affect new items.
 */

export const zTextLayer = z.object({
  // zTextarea() gives a multi-line editor in Studio (good for line breaks).
  // NOTE: zColor()/zTextarea() brand themselves via their .describe() value, so
  // we must NOT call .describe() on them — doing so overwrites the brand and
  // Studio falls back to a plain single-line input / text box. (.default() is
  // fine — Studio unwraps it to find the brand.)
  text: zTextarea().default("New text"),
  color: zColor().default("#ffffff"),
  fontFamily: z.enum(FONT_KEYS).default("Inter").describe("Font"),
  fontSize: z.number().min(1).default(80).describe("Font size (px)"),
  fontWeight: z
    .enum(["400", "500", "600", "700", "800", "900"])
    .default("700")
    .describe("Font weight"),
  align: z.enum(["left", "center", "right"]).default("center").describe("Text align"),
  letterSpacing: z.number().default(0).describe("Letter spacing (px)"),
  lineHeight: z.number().min(0).step(0.05).default(1).describe("Line height (multiplier)"),
  maxWidth: z.number().min(0).default(0).describe("Max width (px, 0 = auto)"),
  strokeColor: zColor().default("#000000"),
  strokeWidth: z.number().min(0).default(0).describe("Outline width (px, 0 = none)"),
  backgroundColor: zColor().default("#000000"),
  backgroundEnabled: z.boolean().default(false).describe("Whole-phrase box: on/off"),
  paddingX: z.number().min(0).default(20).describe("Whole-phrase box padding X (px)"),
  paddingY: z.number().min(0).default(10).describe("Whole-phrase box padding Y (px)"),
  borderRadius: z.number().min(0).default(8).describe("Whole-phrase box radius (px)"),
  // Inline highlight: wrap any part of the text in ==double equals== to give
  // just that part its own box (a boxed word inside a longer title), on top of
  // and independent from the whole-phrase background box above. One style per
  // text layer; all ==marked== spans share it.
  highlightColor: zColor().default("#facc15"),
  highlightTextColor: zColor().default("#000000"),
  highlightPaddingX: z.number().min(0).default(10).describe("Inline highlight padding X (px)"),
  highlightPaddingY: z.number().min(0).default(2).describe("Inline highlight padding Y (px)"),
  highlightRadius: z.number().min(0).default(6).describe("Inline highlight radius (px)"),
  // Curved text: 0 = straight. Non-zero bends the text along a circle of this
  // radius (px) — positive arcs up (badge top), negative arcs down. Curved mode
  // is plain text: no box or inline ==highlights== (SVG text renders differently).
  curveRadius: z.number().default(0).describe("Curve radius (0=straight, +up/-down)"),
  // Drop shadow on the text GLYPHS. Offset is derived from angle + distance
  // (0° = right, 90° = down). Toggle shadowEnabled to turn it on.
  shadowEnabled: z.boolean().default(false).describe("Enable text shadow"),
  shadowColor: zColor().default("#000000"),
  shadowOpacity: z.number().min(0).max(1).step(0.01).default(0.5).describe("Shadow opacity (0–1)"),
  shadowAngle: z.number().default(90).describe("Shadow angle (deg: 0=right, 90=down)"),
  shadowDistance: z.number().min(0).default(6).describe("Shadow distance (px)"),
  shadowBlur: z.number().min(0).default(4).describe("Shadow blur (px)"),
  // Glow on the text GLYPHS (centered colored halo, stacked for intensity).
  glowEnabled: z.boolean().default(false).describe("Enable text glow"),
  glowColor: zColor().default("#ffffff"),
  glowOpacity: z.number().min(0).max(1).step(0.01).default(0.8).describe("Glow opacity (0–1)"),
  glowSize: z.number().min(0).default(12).describe("Glow size / blur (px)"),
  glowIntensity: z.number().int().min(1).max(5).default(2).describe("Glow intensity (1–5 passes)"),
  // Shadow on the highlight BOX (only when backgroundEnabled). Separate from
  // the glyph shadow so the pill/tag behind the text can cast its own shadow.
  bgShadowEnabled: z.boolean().default(false).describe("Enable background shadow"),
  bgShadowColor: zColor().default("#000000"),
  bgShadowOpacity: z.number().min(0).max(1).step(0.01).default(0.5).describe("Bg shadow opacity (0–1)"),
  bgShadowAngle: z.number().default(90).describe("Bg shadow angle (deg: 0=right, 90=down)"),
  bgShadowDistance: z.number().min(0).default(6).describe("Bg shadow distance (px)"),
  bgShadowBlur: z.number().min(0).default(8).describe("Bg shadow blur (px)"),
  // Glow on the highlight BOX (only when backgroundEnabled).
  bgGlowEnabled: z.boolean().default(false).describe("Enable background glow"),
  bgGlowColor: zColor().default("#ffffff"),
  bgGlowOpacity: z.number().min(0).max(1).step(0.01).default(0.8).describe("Bg glow opacity (0–1)"),
  bgGlowSize: z.number().min(0).default(16).describe("Bg glow size / blur (px)"),
  bgGlowIntensity: z.number().int().min(1).max(5).default(2).describe("Bg glow intensity (1–5 passes)"),
  blur: z.number().min(0).default(0).describe("Layer blur (px, 0=off)"),
  transform: zTransform.default({ x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, zIndex: 100 }),
});

export const zImageLayer = z.object({
  src: z
    .string()
    .default("")
    .describe("Image src (URL, or filename in public/ via staticFile)"),
  width: z.number().min(0).default(100).describe("Width (px)"),
  height: z.number().min(0).default(100).describe("Height (px)"),
  fit: z.enum(["cover", "contain", "fill"]).default("cover").describe("Object fit"),
  borderRadius: z.number().min(0).default(0).describe("Corner radius (px)"),
  // Duotone: recolor the photo into a two-tone ramp (dark tones → shadow color,
  // light tones → highlight color). That stylized magazine/poster look.
  duotoneEnabled: z.boolean().default(false).describe("Enable duotone"),
  duotoneShadow: zColor().default("#0f172a"),
  duotoneHighlight: zColor().default("#38bdf8"),
  // Sticker outline: a solid border hugging the image alpha (great on cutouts).
  outlineEnabled: z.boolean().default(false).describe("Enable sticker outline"),
  outlineColor: zColor().default("#ffffff"),
  outlineWidth: z.number().min(0).default(8).describe("Outline width (px)"),
  // Drop shadow — follows the image alpha (ideal for cutout PNGs).
  shadowEnabled: z.boolean().default(false).describe("Enable image shadow"),
  shadowColor: zColor().default("#000000"),
  shadowOpacity: z.number().min(0).max(1).step(0.01).default(0.5).describe("Shadow opacity (0–1)"),
  shadowAngle: z.number().default(90).describe("Shadow angle (deg: 0=right, 90=down)"),
  shadowDistance: z.number().min(0).default(6).describe("Shadow distance (px)"),
  shadowBlur: z.number().min(0).default(4).describe("Shadow blur (px)"),
  // Glow — a centered colored halo. glowIntensity stacks the halo for punch.
  glowEnabled: z.boolean().default(false).describe("Enable image glow"),
  glowColor: zColor().default("#ffffff"),
  glowOpacity: z.number().min(0).max(1).step(0.01).default(0.8).describe("Glow opacity (0–1)"),
  glowSize: z.number().min(0).default(24).describe("Glow size / blur (px)"),
  glowIntensity: z.number().int().min(1).max(5).default(2).describe("Glow intensity (1–5 passes)"),
  blur: z.number().min(0).default(0).describe("Layer blur (px, 0=off)"),
  transform: zTransform.default({ x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, zIndex: 100 }),
});

export const zShapeLayer = z.object({
  kind: z.enum(["rectangle", "ellipse", "triangle"]).default("rectangle").describe("Shape"),
  // Fill mode: a solid color, a linear/radial gradient, or an image. Image and
  // gradient fills work on every kind (rect/ellipse/triangle) and are clipped
  // to the shape — e.g. an ellipse gives a circular photo crop. gradientAngle
  // applies to linear only; the image fields apply to fillType "image" only.
  fillType: z
    .enum(["solid", "linear", "radial", "image"])
    .default("solid")
    .describe("Fill type"),
  fillColor: zColor().default("#3b82f6"),
  gradientFrom: zColor().default("#3b82f6"),
  gradientTo: zColor().default("#1e293b"),
  gradientAngle: z.number().default(90).describe("Gradient angle (linear only, degrees)"),
  fillImageSrc: z
    .string()
    .default("")
    .describe("Fill image (file in public/ or URL)"),
  fillImageFit: z.enum(["cover", "contain"]).default("cover").describe("Fill image fit"),
  // Focal point: which part of the image stays framed when it's cropped (cover)
  // or where it sits within the box (contain). 50/50 = centered.
  fillImageFocusX: z.number().min(0).max(100).default(50).describe("Fill focal X (%, 0=left)"),
  fillImageFocusY: z.number().min(0).max(100).default(50).describe("Fill focal Y (%, 0=top)"),
  width: z.number().min(0).default(100).describe("Width (px)"),
  height: z.number().min(0).default(100).describe("Height (px)"),
  borderRadius: z.number().min(0).default(0).describe("Corner radius (rect only, px)"),
  strokeColor: zColor().default("#000000"),
  strokeWidth: z.number().min(0).default(0).describe("Stroke width (px, 0 = none)"),
  // Backdrop blur (frosted glass): blurs whatever is BEHIND this shape. Pair
  // with a translucent fill (e.g. white at low alpha) for a glassmorphism panel.
  // Rectangle/ellipse only (0 = off).
  backdropBlur: z.number().min(0).default(0).describe("Backdrop blur / glass (px, 0=off)"),
  // Drop shadow (via CSS filter, so it follows the shape's outline — rounded
  // rect, ellipse, or triangle). Offset from angle + distance (0°=right, 90°=down).
  shadowEnabled: z.boolean().default(false).describe("Enable shape shadow"),
  shadowColor: zColor().default("#000000"),
  shadowOpacity: z.number().min(0).max(1).step(0.01).default(0.5).describe("Shadow opacity (0–1)"),
  shadowAngle: z.number().default(90).describe("Shadow angle (deg: 0=right, 90=down)"),
  shadowDistance: z.number().min(0).default(6).describe("Shadow distance (px)"),
  shadowBlur: z.number().min(0).default(4).describe("Shadow blur (px)"),
  // Glow — a centered colored halo (via filter, so it hugs the shape outline).
  glowEnabled: z.boolean().default(false).describe("Enable shape glow"),
  glowColor: zColor().default("#ffffff"),
  glowOpacity: z.number().min(0).max(1).step(0.01).default(0.8).describe("Glow opacity (0–1)"),
  glowSize: z.number().min(0).default(16).describe("Glow size / blur (px)"),
  glowIntensity: z.number().int().min(1).max(5).default(2).describe("Glow intensity (1–5 passes)"),
  blur: z.number().min(0).default(0).describe("Layer blur (px, 0=off)"),
  transform: zTransform.default({ x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, zIndex: 100 }),
});

export const zIconLayer = z.object({
  // Iconify name as "set:name" (e.g. mdi:fire, lucide:play, simple-icons:youtube).
  // Use the icon picker (icon-picker.html) to search + copy names. Bundled sets
  // (lucide, mdi, simple-icons) render offline; others need network at export.
  iconName: z.string().default("mdi:star").describe("Icon (set:name — use the picker)"),
  color: zColor().default("#ffffff"),
  size: z.number().min(1).default(160).describe("Size (px)"),
  // Fill: "solid" paints the icon in `color`. linear/radial/image use the icon
  // as a MASK and show a gradient or photo through its shape (e.g. a heart or
  // play button filled with a photo). Image fields mirror the shape image fill.
  fillType: z.enum(["solid", "linear", "radial", "image"]).default("solid").describe("Icon fill"),
  gradientFrom: zColor().default("#6366f1"),
  gradientTo: zColor().default("#a855f7"),
  gradientAngle: z.number().default(135).describe("Icon gradient angle (deg)"),
  fillImageSrc: z.string().default("").describe("Icon fill image (public/ file or URL)"),
  fillImageFit: z.enum(["cover", "contain"]).default("cover").describe("Icon fill image fit"),
  fillImageFocusX: z.number().min(0).max(100).default(50).describe("Icon fill focal X (%)"),
  fillImageFocusY: z.number().min(0).max(100).default(50).describe("Icon fill focal Y (%)"),
  // Sticker outline: a solid border hugging the icon shape.
  outlineEnabled: z.boolean().default(false).describe("Enable sticker outline"),
  outlineColor: zColor().default("#ffffff"),
  outlineWidth: z.number().min(0).default(8).describe("Outline width (px)"),
  // Drop shadow — follows the icon's alpha (via CSS filter).
  shadowEnabled: z.boolean().default(false).describe("Enable icon shadow"),
  shadowColor: zColor().default("#000000"),
  shadowOpacity: z.number().min(0).max(1).step(0.01).default(0.5).describe("Shadow opacity (0–1)"),
  shadowAngle: z.number().default(90).describe("Shadow angle (deg: 0=right, 90=down)"),
  shadowDistance: z.number().min(0).default(6).describe("Shadow distance (px)"),
  shadowBlur: z.number().min(0).default(4).describe("Shadow blur (px)"),
  // Glow — a centered colored halo.
  glowEnabled: z.boolean().default(false).describe("Enable icon glow"),
  glowColor: zColor().default("#ffffff"),
  glowOpacity: z.number().min(0).max(1).step(0.01).default(0.8).describe("Glow opacity (0–1)"),
  glowSize: z.number().min(0).default(16).describe("Glow size / blur (px)"),
  glowIntensity: z.number().int().min(1).max(5).default(2).describe("Glow intensity (1–5 passes)"),
  blur: z.number().min(0).default(0).describe("Layer blur (px, 0=off)"),
  transform: zTransform.default({ x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, zIndex: 100 }),
});

export const zQrLayer = z.object({
  data: z.string().default("https://youtube.com").describe("QR content (URL or text)"),
  color: zColor().default("#000000"),
  bgColor: zColor().default("#ffffff"),
  size: z.number().min(1).default(220).describe("Size (px)"),
  margin: z.number().min(0).default(2).describe("Quiet zone (modules)"),
  borderRadius: z.number().min(0).default(10).describe("Card corner radius (px)"),
  shadowEnabled: z.boolean().default(false).describe("Enable QR shadow"),
  shadowColor: zColor().default("#000000"),
  shadowOpacity: z.number().min(0).max(1).step(0.01).default(0.5).describe("Shadow opacity (0–1)"),
  shadowAngle: z.number().default(90).describe("Shadow angle (deg: 0=right, 90=down)"),
  shadowDistance: z.number().min(0).default(6).describe("Shadow distance (px)"),
  shadowBlur: z.number().min(0).default(4).describe("Shadow blur (px)"),
  glowEnabled: z.boolean().default(false).describe("Enable QR glow"),
  glowColor: zColor().default("#ffffff"),
  glowOpacity: z.number().min(0).max(1).step(0.01).default(0.8).describe("Glow opacity (0–1)"),
  glowSize: z.number().min(0).default(16).describe("Glow size / blur (px)"),
  glowIntensity: z.number().int().min(1).max(5).default(2).describe("Glow intensity (1–5 passes)"),
  blur: z.number().min(0).default(0).describe("Layer blur (px, 0=off)"),
  transform: zTransform.default({ x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, zIndex: 100 }),
});

export const zLineLayer = z.object({
  // Two ways to define the line (both positioned by the transform):
  //  - "vector": starts at the transform origin, extends `length` px at `angle`.
  //  - "points": from (x1,y1) to (x2,y2), each measured from the transform origin.
  mode: z.enum(["vector", "points"]).default("vector").describe("Line mode"),
  length: z.number().min(0).default(320).describe("Length (px, vector mode)"),
  angle: z.number().default(0).describe("Angle (deg, vector mode: 0=right, 90=down)"),
  x1: z.number().default(-160).describe("Start X (points mode, from origin)"),
  y1: z.number().default(0).describe("Start Y (points mode)"),
  x2: z.number().default(160).describe("End X (points mode)"),
  y2: z.number().default(0).describe("End Y (points mode)"),
  thickness: z.number().min(0).default(6).describe("Thickness (px)"),
  color: zColor().default("#ffffff"),
  style: z.enum(["solid", "dashed", "dotted"]).default("solid").describe("Line style"),
  // Endpoint markers — set each end independently (none / both / either / mix).
  startCap: z.enum(["none", "arrow", "circle"]).default("none").describe("Start marker"),
  endCap: z.enum(["none", "arrow", "circle"]).default("none").describe("End marker"),
  shadowEnabled: z.boolean().default(false).describe("Enable line shadow"),
  shadowColor: zColor().default("#000000"),
  shadowOpacity: z.number().min(0).max(1).step(0.01).default(0.5).describe("Shadow opacity (0–1)"),
  shadowAngle: z.number().default(90).describe("Shadow angle (deg: 0=right, 90=down)"),
  shadowDistance: z.number().min(0).default(6).describe("Shadow distance (px)"),
  shadowBlur: z.number().min(0).default(4).describe("Shadow blur (px)"),
  glowEnabled: z.boolean().default(false).describe("Enable line glow"),
  glowColor: zColor().default("#ffffff"),
  glowOpacity: z.number().min(0).max(1).step(0.01).default(0.8).describe("Glow opacity (0–1)"),
  glowSize: z.number().min(0).default(16).describe("Glow size / blur (px)"),
  glowIntensity: z.number().int().min(1).max(5).default(2).describe("Glow intensity (1–5 passes)"),
  blur: z.number().min(0).default(0).describe("Layer blur (px, 0=off)"),
  transform: zTransform.default({ x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, zIndex: 100 }),
});

export type TextLayerProps = z.infer<typeof zTextLayer>;
export type ImageLayerProps = z.infer<typeof zImageLayer>;
export type ShapeLayerProps = z.infer<typeof zShapeLayer>;
export type IconLayerProps = z.infer<typeof zIconLayer>;
export type QrLayerProps = z.infer<typeof zQrLayer>;
export type LineLayerProps = z.infer<typeof zLineLayer>;
