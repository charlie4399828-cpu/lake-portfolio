// 从 src/data/content.ts 的 DEFAULT_CONTENT 生成 public/content.json（线上已发布内容的初始版本）
// 用法：node scripts/gen-content.mjs
import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';

const result = await build({
  entryPoints: ['src/data/content.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  logLevel: 'silent',
  define: { 'import.meta.env.BASE_URL': JSON.stringify('/') },
});

const code = result.outputFiles[0].text;
const mod = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

writeFileSync('public/content.json', JSON.stringify(mod.DEFAULT_CONTENT, null, 2), 'utf-8');
console.log('public/content.json 已生成');
