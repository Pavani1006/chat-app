// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
// });


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",   // allow other devices on LAN
    port: 5173,
    // https: true,       // 🔥 THIS ENABLES MIC ACCESS
  },
});
