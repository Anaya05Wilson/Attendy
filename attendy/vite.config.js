import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: "Attendy",
        short_name: "Attendance",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        icons: []
      }
    })
  ]
})
