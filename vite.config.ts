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
      insertTypesEntry: true,
      include: ['src/components/**/*.ts', 'src/components/**/*.tsx'],
      exclude: ['node_modules/**'],
      outDir: 'dist',
      compilerOptions: {
        declaration: true,
        declarationMap: true,
        emitDeclarationOnly: false,
        noEmit: false,
        composite: false
      }
    }),
  ],
});