/**
 * Load a curated set of Google Fonts once, at module load, so they're
 * available in the Studio preview and in headless still renders.
 *
 * We restrict each font to the "latin" subset and only the weights we expose,
 * which keeps render-time network requests small and fast.
 *
 * The `FONT_KEYS` tuple is the single source of truth for the `fontFamily`
 * enum in the schema — keep them in sync.
 */
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadRoboto } from "@remotion/google-fonts/Roboto";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadArchivoBlack } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadFredoka } from "@remotion/google-fonts/Fredoka";
import { loadFont as loadTeko } from "@remotion/google-fonts/Teko";
import { loadFont as loadBangers } from "@remotion/google-fonts/Bangers";
import { loadFont as loadPermanentMarker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";

// Each call is inlined (no shared spread) so TypeScript contextually types the
// `weights`/`subsets` literals against each font's own accepted union.
// Restricting to the "latin" subset and only the weights we expose keeps
// render-time font requests small.
const inter = loadInter("normal", {
  weights: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
const roboto = loadRoboto("normal", {
  weights: ["400", "500", "700", "900"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
const montserrat = loadMontserrat("normal", {
  weights: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
const poppins = loadPoppins("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
// Display faces that ship a single weight only.
const bebas = loadBebas("normal", {
  weights: ["400"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
const anton = loadAnton("normal", {
  weights: ["400"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
const oswald = loadOswald("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
const playfair = loadPlayfair("normal", {
  weights: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
const fredoka = loadFredoka("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
const teko = loadTeko("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
const caveat = loadCaveat("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
// Single-weight display / handwriting faces.
const archivoBlack = loadArchivoBlack("normal", {
  weights: ["400"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
const bangers = loadBangers("normal", {
  weights: ["400"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
const permanentMarker = loadPermanentMarker("normal", {
  weights: ["400"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

/** The exact CSS family name each font exposes. */
export const FONTS = {
  Inter: inter.fontFamily,
  Roboto: roboto.fontFamily,
  Montserrat: montserrat.fontFamily,
  "Bebas Neue": bebas.fontFamily,
  Poppins: poppins.fontFamily,
  Anton: anton.fontFamily,
  Oswald: oswald.fontFamily,
  "Archivo Black": archivoBlack.fontFamily,
  "Playfair Display": playfair.fontFamily,
  Fredoka: fredoka.fontFamily,
  Teko: teko.fontFamily,
  Bangers: bangers.fontFamily,
  // Handwriting
  "Permanent Marker": permanentMarker.fontFamily,
  Caveat: caveat.fontFamily,
} as const;

export type FontKey = keyof typeof FONTS;

/** Tuple form for building the zod enum. */
export const FONT_KEYS = Object.keys(FONTS) as [FontKey, ...FontKey[]];

/** Resolve a schema font key to its real CSS font-family string. */
export const resolveFont = (key: FontKey): string => FONTS[key];
