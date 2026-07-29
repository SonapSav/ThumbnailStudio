import React from "react";
import { LayerFrame } from "./LayerFrame";
import { cssFilter } from "./shadow";
import { resolveSrc } from "./assetSrc";
import { fillStyle } from "./fill";
import type { ShapeLayerProps } from "../schema/layers";

/**
 * SVG preserveAspectRatio can't take a continuous focal point, so bucket the
 * focus % into min/mid/max per axis (9 positions). Rect/ellipse fills use a
 * continuous CSS background-position instead.
 */
const svgAspect = (fit: "cover" | "contain", fx: number, fy: number): string => {
  const ax = fx < 33.34 ? "xMin" : fx > 66.66 ? "xMax" : "xMid";
  const ay = fy < 33.34 ? "YMin" : fy > 66.66 ? "YMax" : "YMid";
  return `${ax}${ay} ${fit === "contain" ? "meet" : "slice"}`;
};

export const ShapeLayer: React.FC<ShapeLayerProps> = (props) => {
  const {
    kind,
    fillType,
    fillColor,
    gradientFrom,
    gradientTo,
    gradientAngle,
    fillImageSrc,
    fillImageFit,
    fillImageFocusX,
    fillImageFocusY,
    width,
    height,
    borderRadius,
    strokeColor,
    strokeWidth,
    transform,
  } = props;

  const useGradient = fillType === "linear" || fillType === "radial";
  const imageUrl = fillType === "image" ? resolveSrc(fillImageSrc) : "";
  const useImage = fillType === "image" && imageUrl !== "";

  // drop-shadow() follows the rendered alpha, so shadow + glow hug the triangle
  // edges and the rounded/elliptical corners rather than a bounding box.
  const filter = cssFilter(
    {
      enabled: props.shadowEnabled,
      color: props.shadowColor,
      opacity: props.shadowOpacity,
      angle: props.shadowAngle,
      distance: props.shadowDistance,
      blur: props.shadowBlur,
    },
    {
      enabled: props.glowEnabled,
      color: props.glowColor,
      opacity: props.glowOpacity,
      size: props.glowSize,
      intensity: props.glowIntensity,
    },
    props.blur,
  );

  if (kind === "triangle") {
    // Inline SVG so the stroke follows the triangle edges cleanly. Gradient and
    // image fills need an SVG def (CSS background can't fill a polygon). Colons
    // from useId break url() refs, so strip them.
    const gid = "shape-fill-" + React.useId().replace(/:/g, "");
    const w = width;
    const h = height;
    const inset = strokeWidth / 2;
    // Match CSS linear-gradient(angle): 0deg → to top, 90deg → to right.
    const rad = (gradientAngle * Math.PI) / 180;
    const dx = Math.sin(rad);
    const dy = -Math.cos(rad);
    const usePaint = useGradient || useImage;
    return (
      <LayerFrame transform={transform}>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ filter }}>
          {usePaint && (
            <defs>
              {useImage ? (
                <pattern id={gid} patternUnits="userSpaceOnUse" width={w} height={h}>
                  <image
                    href={imageUrl}
                    x={0}
                    y={0}
                    width={w}
                    height={h}
                    preserveAspectRatio={svgAspect(
                      fillImageFit,
                      fillImageFocusX,
                      fillImageFocusY,
                    )}
                  />
                </pattern>
              ) : fillType === "radial" ? (
                <radialGradient id={gid} cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor={gradientFrom} />
                  <stop offset="100%" stopColor={gradientTo} />
                </radialGradient>
              ) : (
                <linearGradient
                  id={gid}
                  gradientUnits="objectBoundingBox"
                  x1={0.5 - dx / 2}
                  y1={0.5 - dy / 2}
                  x2={0.5 + dx / 2}
                  y2={0.5 + dy / 2}
                >
                  <stop offset="0%" stopColor={gradientFrom} />
                  <stop offset="100%" stopColor={gradientTo} />
                </linearGradient>
              )}
            </defs>
          )}
          <polygon
            points={`${w / 2},${inset} ${w - inset},${h - inset} ${inset},${h - inset}`}
            fill={usePaint ? `url(#${gid})` : fillColor}
            stroke={strokeWidth > 0 ? strokeColor : "none"}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </svg>
      </LayerFrame>
    );
  }

  // Rectangle / ellipse: a div filled with a solid color, a CSS gradient, or an
  // image (clipped by border-radius — an ellipse becomes a circular crop). The
  // fill uses the same helper as the canvas background.
  return (
    <LayerFrame transform={transform}>
      <div
        style={{
          width,
          height,
          ...fillStyle({
            fillType,
            fillColor,
            gradientFrom,
            gradientTo,
            gradientAngle,
            imageSrc: fillImageSrc,
            imageFit: fillImageFit,
            focusX: fillImageFocusX,
            focusY: fillImageFocusY,
          }),
          borderRadius: kind === "ellipse" ? "50%" : borderRadius,
          border: strokeWidth > 0 ? `${strokeWidth}px solid ${strokeColor}` : "none",
          boxSizing: "border-box",
          filter,
          ...(props.backdropBlur > 0
            ? {
                backdropFilter: `blur(${props.backdropBlur}px)`,
                WebkitBackdropFilter: `blur(${props.backdropBlur}px)`,
              }
            : {}),
        }}
      />
    </LayerFrame>
  );
};
