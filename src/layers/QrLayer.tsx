import React from "react";
import qrcode from "qrcode-generator";
import { LayerFrame } from "./LayerFrame";
import { cssFilter } from "./shadow";
import type { QrLayerProps } from "../schema/layers";

export const QrLayer: React.FC<QrLayerProps> = (props) => {
  const { data, color, bgColor, size, margin, borderRadius, transform } = props;

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

  if (!data.trim()) return null;

  // Generate the QR matrix synchronously (no delayRender needed).
  const qr = qrcode(0, "M");
  qr.addData(data);
  qr.make();
  const count = qr.getModuleCount();
  const dim = count + margin * 2;

  const cells: React.ReactNode[] = [];
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        cells.push(
          <rect key={`${r}-${c}`} x={c + margin} y={r + margin} width={1} height={1} fill={color} />,
        );
      }
    }
  }

  return (
    <LayerFrame transform={transform}>
      <div
        style={{
          borderRadius,
          overflow: "hidden",
          display: "inline-block",
          lineHeight: 0,
          filter,
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${dim} ${dim}`}
          shapeRendering="crispEdges"
          style={{ display: "block" }}
        >
          <rect x={0} y={0} width={dim} height={dim} fill={bgColor} />
          {cells}
        </svg>
      </div>
    </LayerFrame>
  );
};
