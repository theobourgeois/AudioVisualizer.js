import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    lib: {
      entry: path.resolve(__dirname, "src/components/index.ts"),
      name: "audio-visualizer",
      fileName: (format) => `audio-visualizer.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "three"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "three": "THREE"
        },
      },
    },
  },
  plugins: [
    react(),
    dts({
      insertTypesEntry: true, // Automatically adds a "types" entry in your package.json
      outDir: "dist/types", // Output directory for generated types
      include: ["src/components/**/*.ts", "src/components/**/*.tsx"], // Include all relevant source files
      rollupTypes: true,
      compilerOptions: {
        paths: {
          "three": ["node_modules/three/src/Three.d.ts"]
        }
      },
      beforeWriteFile: (filePath, content) => {
        console.log(`Generating types for: ${filePath}`); // Logging to check files being processed
        return {
          filePath: filePath.replace("src/components", "dist/types"), // Replace the path to your desired output folder
          content,
        };
      },
      afterBuild: () => {
        console.log("Types have been generated!"); // Confirm types generation
      }
    }),
  ],
});
