export default defineConfig({
  base: "/DSExams/",
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.svg", "**/*.csv"],
<<<<<<< HEAD
})
=======
})
>>>>>>> 116cbf5 (Fix GitHub Pages deployment)
