import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/tenant/index.ts',
    'src/catalog/index.ts',
    'src/order/index.ts',
    'src/booking/index.ts',
    'src/pix/index.ts',
    'src/common/index.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
})
