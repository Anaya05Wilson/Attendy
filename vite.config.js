import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // GitHub Pages
  base: "/Attendy/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "attendy-192.png",
        "attendy-512.png",
        "favicon.ico"
      ],
      manifest: {
        id: "/Attendy/",
        name: "Attendy – Attendance Tracker",
        short_name: "Attendy",
        description: "Personal attendance tracker for semester classes.",
        theme_color: "#020617",
        background_color: "#020617",
        display: "standalone",

        // GitHub Pages URL path
        start_url: "/Attendy/",
        scope: "/Attendy/",

        icons: [
          {
            src: "/attendy-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/attendy-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      injectRegister: "auto",
    }),
  ],
});
