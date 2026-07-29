import React from "react";
import { Img } from "remotion";
import { LayerFrame } from "./LayerFrame";
import { cssFilter } from "./shadow";
import { resolveSrc } from "./assetSrc";
import { DuotoneFilter } from "./duotone";
import { OutlineFilter } from "./outline";
import type { ImageLayerProps } from "../schema/layers";

export const ImageLayer: React.FC<ImageLayerProps> = (props) => {
  const { src, width, height, fit, borderRadius, transform } = props;
  const uid = React.useId().replace(/:/g, "");
  const duotoneId = "duotone-" + uid;
  const outlineId = "outline-" + uid;

  if (!src.trim()) return null;

  // Shadow + glow both compile to CSS filters and chain together. drop-shadow
  // follows the image alpha, so cutout PNGs get a true contour shadow/glow.
  const shadowGlow = cssFilter(
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
  // Chain: duotone (recolor) → sticker outline → blur + shadow/glow.
  const filter =
    [
      props.duotoneEnabled ? `url(#${duotoneId})` : undefined,
      props.outlineEnabled && props.outlineWidth > 0
        ? `url(#${outlineId})`
        : undefined,
      shadowGlow,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <LayerFrame transform={transform}>
      {props.duotoneEnabled && (
        <DuotoneFilter
          id={duotoneId}
          shadow={props.duotoneShadow}
          highlight={props.duotoneHighlight}
        />
      )}
      {props.outlineEnabled && props.outlineWidth > 0 && (
        <OutlineFilter
          id={outlineId}
          color={props.outlineColor}
          width={props.outlineWidth}
        />
      )}
      <Img
        src={resolveSrc(src)}
        style={{
          width,
          height,
          objectFit: fit,
          borderRadius,
          display: "block",
          filter,
        }}
      />
    </LayerFrame>
  );
};
