import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 项目站点子路径
  base: '/lake-portfolio/',
  test: {
    environment: 'jsdom',
  },
});
