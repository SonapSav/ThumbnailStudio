/**
 * Native platform dimensions for each aspect ratio we support.
 * These are the export resolutions; all three share one component + schema.
 */
export type FormatId = "landscape" | "portrait" | "square";

export interface Format {
  id: FormatId;
  compositionId: string;
  label: string;
  aspect: string;
  width: number;
  height: number;
}

export const FORMATS: Record<FormatId, Format> = {
  landscape: {
    id: "landscape",
    compositionId: "Thumbnail-Landscape",
    label: "YouTube (16:9)",
    aspect: "16:9",
    width: 1280,
    height: 720,
  },
  portrait: {
    id: "portrait",
    compositionId: "Thumbnail-Portrait",
    label: "Reels / Stories (9:16)",
    aspect: "9:16",
    width: 1080,
    height: 1920,
  },
  square: {
    id: "square",
    compositionId: "Thumbnail-Square",
    label: "Instagram Post (1:1)",
    aspect: "1:1",
    width: 1080,
    height: 1080,
  },
};
