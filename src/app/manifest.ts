import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Upendo System",
    short_name: "Upendo",
    description: "Raporo y'ibikorwa bya bar na restaurant",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#065f46",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
