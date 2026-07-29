import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import type { ThumbnailProps } from "./schema/thumbnail";
import { TextLayer } from "./layers/TextLayer";
import { ImageLayer } from "./layers/ImageLayer";
import { ShapeLayer } from "./layers/ShapeLayer";
import { IconLayer } from "./layers/IconLayer";
import { QrLayer } from "./layers/QrLayer";
import { LineLayer } from "./layers/LineLayer";
import { fillStyle } from "./layers/fill";
import { toRgba } from "./layers/shadow";

// A grayscale fractal-noise tile for the film-grain overlay.
const NOISE_URI = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)}`;

/** CSS background for the vignette/scrim overlay. */
const overlayBackground = (
  type: ThumbnailProps["overlayType"],
  rgba: string,
): React.CSSProperties => {
  switch (type) {
    case "vignette":
      return { backgroundImage: `radial-gradient(ellipse at center, transparent 45%, ${rgba} 100%)` };
    case "top":
      return { backgroundImage: `linear-gradient(to bottom, ${rgba} 0%, transparent 55%)` };
    case "bottom":
      return { backgroundImage: `linear-gradient(to top, ${rgba} 0%, transparent 55%)` };
    case "full":
      return { backgroundColor: rgba };
    default:
      return {};
  }
};

/**
 * A non-exported alignment helper: ruled lines every `spacing` px measured out
 * from the canvas centre in all four directions, with the centre axes drawn
 * brighter/thicker. Rendered above everything so it is always visible.
 */
const AlignmentGrid: React.FC<{
  width: number;
  height: number;
  spacing: number;
  color: string;
  opacity: number;
}> = ({ width, height, spacing, color, opacity }) => {
  const cx = width / 2;
  const cy = height / 2;
  const step = Math.max(10, spacing);

  // Offsets from centre outwards (excluding 0, which is the emphasised axis).
  const xs: number[] = [];
  for (let x = cx - step; x > 0; x -= step) xs.push(x);
  for (let x = cx + step; x < width; x += step) xs.push(x);
  const ys: number[] = [];
  for (let y = cy - step; y > 0; y -= step) ys.push(y);
  for (let y = cy + step; y < height; y += step) ys.push(y);

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none", zIndex: 2147483647 }}>
      <svg width={width} height={height} style={{ display: "block" }}>
        {xs.map((x) => (
          <line key={`v${x}`} x1={x} y1={0} x2={x} y2={height} stroke={color} strokeWidth={1} strokeOpacity={0.5} />
        ))}
        {ys.map((y) => (
          <line key={`h${y}`} x1={0} y1={y} x2={width} y2={y} stroke={color} strokeWidth={1} strokeOpacity={0.5} />
        ))}
        {/* Emphasised centre axes. */}
        <line x1={cx} y1={0} x2={cx} y2={height} stroke={color} strokeWidth={2} />
        <line x1={0} y1={cy} x2={width} y2={cy} stroke={color} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={4} fill={color} />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Renders every layer from the per-type arrays, sorted into a single stacking
 * order by `transform.zIndex`. The wrapping AbsoluteFill paints the canvas
 * background (solid / gradient / image). Sort is stable so equal zIndex keeps
 * declaration order (shapes → images → texts, matching the schema field order).
 */
export const Thumbnail: React.FC<ThumbnailProps> = (props) => {
  const { shapes, lines, images, icons, qrcodes, texts } = props;
  const { width, height } = useVideoConfig();

  const background = fillStyle({
    fillType: props.backgroundType,
    fillColor: props.backgroundColor,
    gradientFrom: props.backgroundGradientFrom,
    gradientTo: props.backgroundGradientTo,
    gradientAngle: props.backgroundGradientAngle,
    imageSrc: props.backgroundImageSrc,
    imageFit: props.backgroundImageFit,
    focusX: props.backgroundImageFocusX,
    focusY: props.backgroundImageFocusY,
  });
  // Default to [] so stale/partial props (e.g. a Studio state saved under an
  // older schema, or a removed `gradients` array) can never crash the render.
  const items: { key: string; zIndex: number; node: React.ReactNode }[] = [
    ...(shapes ?? []).map((p, i) => ({
      key: `shape-${i}`,
      zIndex: p.transform.zIndex,
      node: <ShapeLayer {...p} />,
    })),
    ...(lines ?? []).map((p, i) => ({
      key: `line-${i}`,
      zIndex: p.transform.zIndex,
      node: <LineLayer {...p} />,
    })),
    ...(images ?? []).map((p, i) => ({
      key: `image-${i}`,
      zIndex: p.transform.zIndex,
      node: <ImageLayer {...p} />,
    })),
    ...(icons ?? []).map((p, i) => ({
      key: `icon-${i}`,
      zIndex: p.transform.zIndex,
      node: <IconLayer {...p} />,
    })),
    ...(qrcodes ?? []).map((p, i) => ({
      key: `qr-${i}`,
      zIndex: p.transform.zIndex,
      node: <QrLayer {...p} />,
    })),
    ...(texts ?? []).map((p, i) => ({
      key: `text-${i}`,
      zIndex: p.transform.zIndex,
      node: <TextLayer {...p} />,
    })),
  ];

  // Vignette / scrim overlay sits in the zIndex stack (above photos, below text).
  if (props.overlayType && props.overlayType !== "none") {
    items.push({
      key: "overlay",
      zIndex: props.overlayZIndex,
      node: (
        <AbsoluteFill
          style={overlayBackground(
            props.overlayType,
            toRgba(props.overlayColor, props.overlayOpacity),
          )}
        />
      ),
    });
  }

  // Stable sort by zIndex (Array.prototype.sort is stable in modern engines).
  const ordered = items
    .map((item, index) => ({ item, index }))
    .sort((a, b) =>
      a.item.zIndex === b.item.zIndex
        ? a.index - b.index
        : a.item.zIndex - b.item.zIndex,
    )
    .map(({ item }) => item);

  return (
    <AbsoluteFill style={background}>
      {ordered.map(({ key, node }) => (
        <React.Fragment key={key}>{node}</React.Fragment>
      ))}
      {props.noiseEnabled && (
        <AbsoluteFill
          style={{
            backgroundImage: `url("${NOISE_URI}")`,
            backgroundSize: "180px 180px",
            opacity: props.noiseOpacity,
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }}
        />
      )}
      {props.gridEnabled && (
        <AlignmentGrid
          width={width}
          height={height}
          spacing={props.gridSpacing}
          color={props.gridColor}
          opacity={props.gridOpacity}
        />
      )}
    </AbsoluteFill>
  );
};
