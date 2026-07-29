import React from "react";
import { resolveFont } from "../fonts";
import { cssFilter } from "./shadow";
import type { TextLayerProps } from "../schema/layers";

/**
 * Text bent along a circular arc via SVG <textPath>. Positive curveRadius arcs
 * up (text on top of the circle, badge-style); negative arcs down. Plain text
 * only — the box and inline highlights of the flat renderer don't apply here.
 */
export const CurvedText: React.FC<TextLayerProps & { plainText: string }> = (
  props,
) => {
  const {
    plainText,
    color,
    fontFamily,
    fontSize,
    fontWeight,
    letterSpacing,
    strokeColor,
    strokeWidth,
    curveRadius,
  } = props;

  const R = Math.abs(curveRadius) || 1;
  const up = curveRadius > 0;
  const pad = fontSize * 1.3;
  const W = 2 * R + pad * 2;
  const H = R + pad * 2;
  const cx = W / 2;
  const cy = up ? H - pad : pad; // circle center; text rides the near edge
  const sweep = up ? 1 : 0; // dome (arc up) vs valley (arc down)
  const id = "curve-" + React.useId().replace(/:/g, "");

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

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ overflow: "visible", display: "block", filter }}
    >
      <defs>
        <path
          id={id}
          fill="none"
          d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 ${sweep} ${cx + R} ${cy}`}
        />
      </defs>
      <text
        fill={color}
        fontFamily={resolveFont(fontFamily)}
        fontSize={fontSize}
        fontWeight={Number(fontWeight)}
        letterSpacing={letterSpacing}
        textAnchor="middle"
        stroke={strokeWidth > 0 ? strokeColor : undefined}
        strokeWidth={strokeWidth > 0 ? strokeWidth : undefined}
        style={{ paintOrder: "stroke fill" }}
      >
        <textPath href={`#${id}`} startOffset="50%">
          {plainText}
        </textPath>
      </text>
    </svg>
  );
};
