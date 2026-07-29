import { Config } from "@remotion/cli/config";

Config.setEntryPoint("./src/index.ts");

// Stills are PNG by default; keep them lossless and sharp.
Config.setVideoImageFormat("png");
// Ensure crisp output — no scaling artifacts.
Config.setScale(1);
