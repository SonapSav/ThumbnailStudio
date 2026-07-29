import React from "react";
import { useVideoConfig } from "remotion";
import type { Transform } from "../schema/transform";

/**
 * Positions a layer using center-origin coordinates and applies the shared
 * transform (translate → rotate → scale) plus opacity. Every layer type wraps
 * its content in this frame so transforms behave identically everywhere.
 *
 * The wrapper is anchored at the canvas center (left/top 50%), and the child
 * is centered on that anchor via translate(-50%, -50%). The user's x/y then
 * shift it in pixels from center.
 */
export const LayerFrame: React.FC<{
  transform: Transform;
  children: React.ReactNode;
}> = ({ transform, children }) => {
  const { x, y, scale, rotation, opacity, zIndex } = transform;
  const { width, height } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        left: width / 2,
        top: height / 2,
        zIndex,
        opacity,
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: "center center",
        // Let clicks fall through in the preview; content is presentational.
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
};
