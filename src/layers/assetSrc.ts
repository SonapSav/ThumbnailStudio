import { staticFile } from "remotion";

/**
 * Resolve a user-supplied asset src. Absolute URLs and data URIs pass through;
 * a bare filename is treated as a file inside public/ via staticFile().
 * Returns "" for empty input so callers can fall back.
 */
export const resolveSrc = (src: string): string => {
  const trimmed = (src ?? "").trim();
  if (!trimmed) return "";
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed;
  }
  return staticFile(trimmed);
};
