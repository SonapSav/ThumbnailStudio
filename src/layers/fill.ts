import type { CSSProperties } from "react";
import { resolveSrc } from "./assetSrc";

/**
 * Computes the CSS background properties for a rectangular fill — a solid
 * color, a linear/radial gradient, or an image (cover/contain + focal point).
 * Shared by the canvas background and by rectangle/ellipse shapes so both
 * interpret the fill the same way. (Triangles need SVG and are handled in
 * ShapeLayer directly.)
 */
export interface FillParams {
  fillType: "solid" | "linear" | "radial" | "image";
  fillColor: string;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
  imageSrc: string;
  imageFit: "cover" | "contain";
  focusX: number;
  focusY: number;
}

export const fillStyle = (p: FillParams): CSSProperties => {
  if (p.fillType === "linear") {
    return {
      backgroundImage: `linear-gradient(${p.gradientAngle}deg, ${p.gradientFrom}, ${p.gradientTo})`,
    };
  }
  if (p.fillType === "radial") {
    return {
      backgroundImage: `radial-gradient(circle at center, ${p.gradientFrom}, ${p.gradientTo})`,
    };
  }
  if (p.fillType === "image") {
    const url = resolveSrc(p.imageSrc);
    if (url) {
      return {
        backgroundImage: `url(${url})`,
        backgroundSize: p.imageFit,
        backgroundPosition: `${p.focusX}% ${p.focusY}%`,
        backgroundRepeat: "no-repeat",
      };
    }
    // No image chosen yet → fall back to the solid color so it's never blank.
    return { backgroundColor: p.fillColor };
  }
  return { backgroundColor: p.fillColor };
};
