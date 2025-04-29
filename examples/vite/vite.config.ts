import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import wasm from 'vite-plugin-wasm'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx() /* wasm() */],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),

      /**
       * 解决build-lib时报错：
       *  Could not load D:/work/Fontend_Medical_Image_Component/node_modules/@icr/polyseg-wasm/dist/ICRPolySeg.wasm
       * (imported by node_modules/@icr/polyseg-wasm/dist/index.js): "ESM integration proposal for Wasm" is not supported currently.
       * Use vite-plugin-wasm or other community plugins to handle this.
       * Alternatively, you can use `.wasm?init` or `.wasm?url`. See https://vitejs.dev/guide/features.html#webassembly for more details.
       */
      '@cornerstonejs/tools': '@cornerstonejs/tools/dist/umd/index.js'
    },
    preserveSymlinks: true
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  }
})
