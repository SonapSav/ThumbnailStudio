import React from "react";
import { LayerFrame } from "./LayerFrame";
import { cssFilter } from "./shadow";
import type { LineLayerProps } from "../schema/layers";

/**
 * A straight line. Two modes (both positioned by the transform origin):
 *  - "vector": starts at the origin, extends `length` px at `angle`.
 *  - "points": from (x1,y1) to (x2,y2), each measured from the origin.
 * style = solid / dashed / dotted. Shares the shadow/glow/blur, so a glowing
 * dotted line (neon) is just a matter of props.
 */
export const LineLayer: React.FC<LineLayerProps> = (props) => {
  const { mode, length, angle, thickness, color, style, transform } = props;

  // Endpoints relative to the transform origin (0,0).
  let ax = 0;
  let ay = 0;
  let bx: number;
  let by: number;
  if (mode === "points") {
    ax = props.x1;
    ay = props.y1;
    bx = props.x2;
    by = props.y2;
  } else {
    const rad = (angle * Math.PI) / 180;
    bx = Math.cos(rad) * length;
    by = Math.sin(rad) * length;
  }

  // Square SVG large enough to hold both points around its centre.
  const maxExtent = Math.max(Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by), 1);
  const size = 2 * maxExtent + thickness * 2 + 4;
  const c = size / 2;

  const cap = style === "solid" ? "butt" : "round";
  const dash =
    style === "dashed"
      ? `${thickness * 2.6} ${thickness * 1.6}`
      : style === "dotted"
        ? `0.01 ${thickness * 2}`
        : undefined;

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

  // Endpoint markers (scale with stroke width via markerUnits). One arrow marker
  // with auto-start-reverse points outward at either end; the dot is symmetric.
  const uid = React.useId().replace(/:/g, "");
  const arrowId = `arrow-${uid}`;
  const dotId = `dot-${uid}`;
  const capUrl = (capName: string) =>
    capName === "arrow"
      ? `url(#${arrowId})`
      : capName === "circle"
        ? `url(#${dotId})`
        : undefined;

  return (
    <LayerFrame transform={transform}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: "visible", display: "block", filter }}
      >
        <defs>
          <marker
            id={arrowId}
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L10,5 L0,10 z" fill={color} />
          </marker>
          <marker
            id={dotId}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            markerUnits="strokeWidth"
          >
            <circle cx="5" cy="5" r="5" fill={color} />
          </marker>
        </defs>
        <line
          x1={c + ax}
          y1={c + ay}
          x2={c + bx}
          y2={c + by}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap={cap}
          strokeDasharray={dash}
          markerStart={capUrl(props.startCap)}
          markerEnd={capUrl(props.endCap)}
        />
      </svg>
    </LayerFrame>
  );
};
