/**
 * 临时占位图片：全部由文生图 API 随机生成，后续可直接替换为本地资源。
 */

const img = (prompt: string, size: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`;

const L = (prompt: string) => img(prompt, 'landscape_4_3');
const P = (prompt: string) => img(prompt, 'portrait_4_3');
const PT = (prompt: string) => img(prompt, 'portrait_16_9');

/** Hero 人像 */
export const heroPortrait = P(
  'cinematic studio portrait of a young creative developer wearing a dark hoodie, dramatic purple and magenta rim lighting, dark background, moody',
);

/** Marquee 21 张横向滚动图 */
const marqueePrompts: string[] = [
  'dark moody mountain lake at night with fog, cinematic photography',
  'abstract dark 3D fluid render with purple and magenta neon glow',
  'cyberpunk alley at night, rain, neon reflections, dark tones',
  'misty pine forest at dusk, dark cinematic landscape',
  'abstract dark glass sculpture with teal rim light, studio 3D render',
  'starry night sky reflected on a calm dark lake, long exposure',
  'dark brutalist concrete architecture in fog, moody photography',
  'liquid metal waves on black background, blue highlights, 3D render',
  'lighthouse at night in a storm, dark cinematic seascape',
  'macro shot of dark water ripples, deep blue and black',
  'aurora borealis over a dark lake, night landscape photography',
  'purple smoke on black background, dramatic studio lighting',
  'modern cabin by a lake at night, warm window light, dark forest',
  'dark minimal topographic lines artwork, subtle grey gradient',
  'full moon over a calm dark ocean, minimal cinematic photography',
  'floating geometric shapes, magenta and cyan neon on dark background, 3D render',
  'rowboat on a still dark lake at dawn, mist, cinematic',
  'silver smoke trails on black background, high contrast abstract',
  'night waterfall long exposure among dark rocks, cinematic',
  'dark ceramic vase still life with dramatic side light, minimal',
  'storm clouds over a dark lake horizon, moody landscape photography',
];

export const marqueeImages: string[] = marqueePrompts.map(L);

export interface Project {
  name: string;
  col1: [string, string]; // 左栏 40%：两张堆叠图
  col2: string; // 右栏 60%：一张高图
}

export const projects: Project[] = [
  {
    name: '湖畔博客',
    col1: [
      L('dark desk setup with laptop showing a blog, purple ambient light, moody'),
      L('coffee cup and notebook on dark wooden desk, moody cinematic light'),
    ],
    col2: PT('developer workspace at night by a window, dark room, screen glow, cinematic'),
  },
  {
    name: '涟漪仪表盘',
    col1: [
      L('dark analytics dashboard UI on a monitor, purple accents, modern'),
      L('close-up of dark UI charts and graphs glowing on a screen'),
    ],
    col2: PT('modern dark office desk with a wide monitor showing a dashboard, night'),
  },
  {
    name: '深水摄影',
    col1: [
      L('underwater dark blue scene with light rays from the surface'),
      L('silhouette of a diver in deep dark water, cinematic'),
    ],
    col2: PT('dark underwater cave with faint blue light rays, cinematic'),
  },
  {
    name: '湖屋商店',
    col1: [
      L('dark minimal product shot of a ceramic mug, purple backlight'),
      L('cozy dark interior of a lakeside cabin shop, warm lamps'),
    ],
    col2: PT('wooden shelf with handmade goods in a dark cozy store, warm light'),
  },
];
