import React from "react";
import { LayerFrame } from "./LayerFrame";
import { CurvedText } from "./CurvedText";
import { resolveFont } from "../fonts";
import { cssShadowList } from "./shadow";
import type { TextLayerProps } from "../schema/layers";

type Segment = { text: string; hl: boolean; color?: string };

/**
 * Split text into normal + ==highlighted== segments. Only the inside of a
 * `==...==` pair is highlighted; the markers are removed. A span may start with
 * a hex color + space to override its box color for that word, e.g.
 * `==#22d3ee SALE==` gives "SALE" a cyan box (others use the layer's default).
 */
const parseSegments = (text: string): Segment[] => {
  const out: Segment[] = [];
  const re = /==([\s\S]+?)==/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), hl: false });
    let inner = m[1];
    let color: string | undefined;
    const c = inner.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}) (.*)$/s);
    if (c) {
      color = `#${c[1]}`;
      inner = c[2];
    }
    out.push({ text: inner, hl: true, color });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ text: text.slice(last), hl: false });
  return out;
};

export const TextLayer: React.FC<TextLayerProps> = (props) => {
  const {
    text,
    color,
    fontFamily,
    fontSize,
    fontWeight,
    align,
    letterSpacing,
    lineHeight,
    maxWidth,
    strokeColor,
    strokeWidth,
    backgroundColor,
    backgroundEnabled,
    paddingX,
    paddingY,
    borderRadius,
    transform,
  } = props;

  const segments = parseSegments(text);

  // Curved mode: render the plain text on an arc (no box/inline highlights).
  if (props.curveRadius !== 0) {
    return (
      <LayerFrame transform={transform}>
        <CurvedText plainText={segments.map((s) => s.text).join("")} {...props} />
      </LayerFrame>
    );
  }

  // Glyph shadow + glow → text-shadow (traces each letter).
  const textShadow = cssShadowList(
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
  );

  // Highlight-box shadow + glow → box-shadow (only meaningful with a box).
  const boxShadow = backgroundEnabled
    ? cssShadowList(
        {
          enabled: props.bgShadowEnabled,
          color: props.bgShadowColor,
          opacity: props.bgShadowOpacity,
          angle: props.bgShadowAngle,
          distance: props.bgShadowDistance,
          blur: props.bgShadowBlur,
        },
        {
          enabled: props.bgGlowEnabled,
          color: props.bgGlowColor,
          opacity: props.bgGlowOpacity,
          size: props.bgGlowSize,
          intensity: props.bgGlowIntensity,
        },
      )
    : undefined;

  // Inline highlight style applied to each ==marked== span. box-decoration-break
  // clone makes the box wrap cleanly if the highlight spans multiple lines.
  const highlightStyle: React.CSSProperties = {
    backgroundColor: props.highlightColor,
    color: props.highlightTextColor,
    padding: `${props.highlightPaddingY}px ${props.highlightPaddingX}px`,
    borderRadius: props.highlightRadius,
    boxDecorationBreak: "clone",
    WebkitBoxDecorationBreak: "clone",
  };

  return (
    <LayerFrame transform={transform}>
      <div
        style={{
          display: "inline-block",
          color,
          fontFamily: resolveFont(fontFamily),
          fontSize,
          fontWeight: Number(fontWeight),
          textAlign: align,
          letterSpacing,
          lineHeight,
          maxWidth: maxWidth > 0 ? maxWidth : undefined,
          whiteSpace: "pre-wrap",
          padding: backgroundEnabled ? `${paddingY}px ${paddingX}px` : 0,
          backgroundColor: backgroundEnabled ? backgroundColor : "transparent",
          borderRadius: backgroundEnabled ? borderRadius : 0,
          textShadow,
          boxShadow,
          filter: props.blur > 0 ? `blur(${props.blur}px)` : undefined,
          // Text outline via paint-order stroke (crisp, unlike text-shadow).
          WebkitTextStrokeWidth: strokeWidth > 0 ? strokeWidth : undefined,
          WebkitTextStrokeColor: strokeWidth > 0 ? strokeColor : undefined,
          paintOrder: "stroke fill",
        }}
      >
        {segments.map((seg, i) =>
          seg.hl ? (
            <span
              key={i}
              style={
                seg.color
                  ? { ...highlightStyle, backgroundColor: seg.color }
                  : highlightStyle
              }
            >
              {seg.text}
            </span>
          ) : (
            <React.Fragment key={i}>{seg.text}</React.Fragment>
          ),
        )}
      </div>
    </LayerFrame>
  );
};
