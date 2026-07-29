import React, { useEffect, useRef, useState } from "react";
import { Icon, loadIcon, getIcon } from "@iconify/react";
import { delayRender, continueRender } from "remotion";
import { LayerFrame } from "./LayerFrame";
import { cssFilter } from "./shadow";
import { fillStyle } from "./fill";
import { OutlineFilter } from "./outline";
import type { IconLayerProps } from "../schema/layers";

/** Build a data-URI SVG of the icon shape, for use as a CSS mask. */
const iconMaskUri = (name: string): string | null => {
  const d = getIcon(name);
  if (!d) return null;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${d.left} ${d.top} ${d.width} ${d.height}">${d.body}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const IconLayer: React.FC<IconLayerProps> = (props) => {
  const { iconName, color, size, fillType, transform } = props;

  // Hold the frame until icon data is available (instant for bundled sets, a
  // network fetch otherwise) so stills never capture it blank. `ready` also
  // forces a re-render once data lands, so the mask (getIcon) resolves.
  const [handle] = useState(() => delayRender(`icon: ${iconName}`));
  const [ready, setReady] = useState(false);
  const done = useRef(false);
  useEffect(() => {
    const finish = () => {
      if (!done.current) {
        done.current = true;
        continueRender(handle);
      }
    };
    loadIcon(iconName)
      .then(() => {
        setReady(true);
        finish();
      })
      .catch(finish);
  }, [handle, iconName]);

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
  // Sticker outline hugs the icon shape; applied before shadow/glow.
  const outlineId = "outline-icon-" + React.useId().replace(/:/g, "");
  const useOutline = props.outlineEnabled && props.outlineWidth > 0;
  const filterWithOutline =
    [useOutline ? `url(#${outlineId})` : undefined, filter]
      .filter(Boolean)
      .join(" ") || undefined;
  const outlineDef = useOutline ? (
    <OutlineFilter id={outlineId} color={props.outlineColor} width={props.outlineWidth} />
  ) : null;

  if (!iconName.trim()) return null;

  // Solid: render the icon SVG directly, painted with `color` (crispest path).
  if (fillType === "solid") {
    return (
      <LayerFrame transform={transform}>
        {outlineDef}
        <Icon
          icon={iconName}
          width={size}
          height={size}
          style={{ color, filter: filterWithOutline, display: "block" }}
        />
      </LayerFrame>
    );
  }

  // Gradient / image: use the icon as a MASK over a filled box, so the fill
  // (a gradient or photo) shows through the icon's shape.
  const maskUri = ready ? iconMaskUri(iconName) : null;
  const bg = fillStyle({
    fillType,
    fillColor: color,
    gradientFrom: props.gradientFrom,
    gradientTo: props.gradientTo,
    gradientAngle: props.gradientAngle,
    imageSrc: props.fillImageSrc,
    imageFit: props.fillImageFit,
    focusX: props.fillImageFocusX,
    focusY: props.fillImageFocusY,
  });

  return (
    <LayerFrame transform={transform}>
      {outlineDef}
      <div
        style={{
          width: size,
          height: size,
          ...bg,
          ...(maskUri
            ? {
                maskImage: `url("${maskUri}")`,
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskImage: `url("${maskUri}")`,
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
              }
            : {}),
          filter: filterWithOutline,
        }}
      />
    </LayerFrame>
  );
};
