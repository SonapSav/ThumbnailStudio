import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  zTextLayer,
  zImageLayer,
  zShapeLayer,
  zIconLayer,
  zQrLayer,
  zLineLayer,
} from "./layers";

/**
 * Root props for a thumbnail. One full-canvas background plus the per-type
 * layer arrays. Every array is add/remove-editable in the Studio panel, and
 * all layers are composited by their `transform.zIndex`.
 *
 * Shapes carry a fillType (solid | gradient), so gradient panels are just
 * shapes with a gradient fill — there is no separate gradient layer type.
 */
export const thumbnailSchema = z.object({
  // Canvas background — a full-frame fill: solid color, linear/radial gradient,
  // or an image. backgroundColor is used for "solid" (and as the image
  // fallback); the gradient/image fields apply to their respective types.
  backgroundType: z
    .enum(["solid", "linear", "radial", "image"])
    .default("solid")
    .describe("Background type"),
  // Do not .describe() zColor() — that overwrites its color brand and Studio
  // would render a plain text box instead of the color picker.
  backgroundColor: zColor().default("#111827"),
  backgroundGradientFrom: zColor().default("#1e293b"),
  backgroundGradientTo: zColor().default("#0f172a"),
  backgroundGradientAngle: z.number().default(135).describe("Background gradient angle (deg)"),
  backgroundImageSrc: z.string().default("").describe("Background image (public/ file or URL)"),
  backgroundImageFit: z.enum(["cover", "contain"]).default("cover").describe("Background image fit"),
  backgroundImageFocusX: z.number().min(0).max(100).default(50).describe("Background focal X (%)"),
  backgroundImageFocusY: z.number().min(0).max(100).default(50).describe("Background focal Y (%)"),
  // Overlay (vignette / scrim) for legibility & mood. Placed at overlayZIndex in
  // the layer stack, so put it above photos (e.g. 50) but below your text.
  overlayType: z
    .enum(["none", "vignette", "top", "bottom", "full"])
    .default("none")
    .describe("Overlay type"),
  overlayColor: zColor().default("#000000"),
  overlayOpacity: z.number().min(0).max(1).step(0.01).default(0.5).describe("Overlay opacity (0–1)"),
  overlayZIndex: z.number().int().default(50).describe("Overlay stacking order"),
  // Film grain / noise over the whole thumbnail (always on top).
  noiseEnabled: z.boolean().default(false).describe("Enable noise / grain"),
  noiseOpacity: z.number().min(0).max(1).step(0.01).default(0.12).describe("Noise opacity (0–1)"),
  // Alignment grid — a non-exported design helper. Ruled lines every
  // `gridSpacing` px measured from the canvas centre outward, with the centre
  // axes emphasised. Sits above every layer (max zIndex). Turn OFF before export.
  gridEnabled: z.boolean().default(false).describe("Show alignment grid (helper)"),
  gridSpacing: z.number().int().min(10).default(100).describe("Grid spacing (px from center)"),
  gridColor: zColor().default("#ffffff"),
  gridOpacity: z.number().min(0).max(1).step(0.01).default(0.35).describe("Grid opacity (0–1)"),
  shapes: z.array(zShapeLayer).describe("Shapes"),
  lines: z.array(zLineLayer).describe("Lines"),
  images: z.array(zImageLayer).describe("Images"),
  icons: z.array(zIconLayer).describe("Icons"),
  qrcodes: z.array(zQrLayer).describe("QR codes"),
  texts: z.array(zTextLayer).describe("Text layers"),
});

export type ThumbnailProps = z.infer<typeof thumbnailSchema>;
