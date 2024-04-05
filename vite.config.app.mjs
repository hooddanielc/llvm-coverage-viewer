import {join} from 'node:path';

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const PACKAGE_ROOT = __dirname;
const empty = join(PACKAGE_ROOT, 'src/app/util/empty.js');


// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [react()],
  mode: 'development',
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
      'path': empty,
      'fs': empty,
      '@mui/styles': 'mui-styles',
    },
  },
  build: {
    outDir: "dist/app",
    minify: false,
    sourcemap: false,
    rollupOptions: {
      input: [
        'src/app/llvm-coverage-viewer.jsx',
      ],
      output: {
        entryFileNames: '[name]-browser.js',
        assetFileNames: 'assets/[name][extname]',
      },
      onLog(level, log, handler) {
        if (log.cause && log.cause.message === `Can't resolve original location of error.`) {
          return;
        }
        handler(level, log);
      }
    }
  }
})
