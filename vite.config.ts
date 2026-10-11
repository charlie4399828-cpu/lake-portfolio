import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * 开发服务器专用：接收编辑器「发布内容」的 POST，直接把 JSON 写入 public/content.json。
 * 仅 dev 模式存在（configureServer 不会进生产构建），localhost 本地调用，无需鉴权。
 */
function saveContentPlugin(): Plugin {
  return {
    name: 'save-content-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url ?? '').split('?')[0];
        if (req.method !== 'POST' || !url.endsWith('/__api/publish')) {
          next();
          return;
        }
        try {
          const chunks: Buffer[] = [];
          for await (const c of req) chunks.push(c as Buffer);
          const body = Buffer.concat(chunks).toString('utf-8');
          JSON.parse(body); // 校验是合法 JSON
          const target = path.resolve(process.cwd(), 'public/content.json');
          await writeFile(target, body, 'utf-8');
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: true, path: target }));
        } catch (e) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, error: String(e) }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), saveContentPlugin()],
  // GitHub Pages 项目站点子路径
  base: '/lake-portfolio/',
  test: {
    environment: 'jsdom',
  },
});
