import { join } from 'node:path';
import { defineConfig } from 'vite';


const PACKAGE_ROOT = __dirname;
const empty = join(PACKAGE_ROOT, 'src/app/util/empty.js');


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [],
    mode: 'development',
    resolve: {
        alias: {
            '/@/': join(PACKAGE_ROOT, 'src') + '/'
        },
    },
    build: {
        outDir: "dist/cli",
        ssr: true,
        minify: false,
        target: `node20`,
        rollupOptions: {
            input: [
                'src/server/llvm-coverage-viewer-cli.js',
            ],
            output: {
                format: 'cjs',
                entryFileNames: '[name].js',
            },
        }
    }
})