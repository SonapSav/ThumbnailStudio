import React from "react";

/**
 * A hidden SVG <filter> that draws a solid colored outline hugging the alpha of
 * whatever it's applied to (via `filter: url(#id)`) — the classic "sticker"
 * border around a cutout image or icon. Uses feMorphology(dilate) to grow the
 * alpha, fills it with the color, and lays the original graphic on top.
 */
export const OutlineFilter: React.FC<{
  id: string;
  color: string;
  width: number;
}> = ({ id, color, width }) => (
  <svg
    width={0}
    height={0}
    aria-hidden
    style={{ position: "absolute", width: 0, height: 0 }}
  >
    <defs>
      {/* Roomy region so a thick outline isn't clipped. */}
      <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
        <feMorphology
          in="SourceAlpha"
          operator="dilate"
          radius={width}
          result="dilated"
        />
        <feFlood floodColor={color} result="flood" />
        <feComposite in="flood" in2="dilated" operator="in" result="outline" />
        <feMerge>
          <feMergeNode in="outline" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);
