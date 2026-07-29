import { addCollection } from "@iconify/react";
import { icons as lucide } from "@iconify-json/lucide";
import { icons as mdi } from "@iconify-json/mdi";
import { icons as simpleIcons } from "@iconify-json/simple-icons";
import { icons as twemoji } from "@iconify-json/twemoji";

/**
 * Register bundled icon sets so their icons resolve *synchronously and offline*
 * — important for reliable Remotion stills. Any other Iconify set (there are
 * ~200 more) still works via the Iconify API, but needs network at export time.
 *
 * Bundled here:
 *  - lucide        clean stroke UI icons
 *  - mdi           Material Design Icons (huge general set)
 *  - simple-icons  brand / social logos (YouTube, Instagram, …)
 *  - twemoji       full color emoji (use via the icon layer, e.g. twemoji:fire)
 */
addCollection(lucide);
addCollection(mdi);
addCollection(simpleIcons);
addCollection(twemoji);
