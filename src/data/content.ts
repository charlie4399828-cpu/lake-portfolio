/**
 * 站点可编辑内容的单一数据源。
 * 默认值在此定义，编辑弹窗修改后写入 localStorage 覆盖。
 */

import { projects as defaultProjects, heroPortrait, marqueeImages } from './images';

export interface ContactInfo {
  email: string;
  phone: string;
  wechat: string;
  qr: string;
}

export interface ProjectItem {
  name: string;
  images: string[]; // 1 张全宽；2 张左右并排；3+ 张时第 1 张为大图，其余小图堆叠
  bigSide?: 'left' | 'right'; // 3+ 张时大图位置，默认 right
  desc: string; // 卡片小字
  detail: string; // 详情页正文
  tags: string[];
}

export interface ResourceItem {
  name: string;
  category: string; // 分类标签：技能 / 人脉 / 工具 / 其他（可自定义文字）
  desc: string; // 一句话简介
  image: string;
  link: string; // 跳转链接（新标签页打开）
}

export interface SiteContent {
  contact: ContactInfo;
  hero: { title: string; tagline: string; portrait: string };
  about: { title: string; text: string };
  marquee: string[]; // 横向滚动图：前一半第一行向右，后一半第二行向左
  projects: ProjectItem[];
  resources: ResourceItem[];
  /** 云端同步时间戳（毫秒），本地缓存与云端内容按它取新 */
  _cmsUpdatedAt?: number;
}

export const DEFAULT_CONTENT: SiteContent = {
  contact: {
    email: 'hello@lake.studio',
    phone: '+86 138-0000-0000',
    wechat: 'lake-studio',
    qr: `${import.meta.env.BASE_URL}wechat-qr.svg`,
  },
  hero: {
    title: '莱克的小屋',
    tagline: 'Lake © 2026 — Portfolio',
    portrait: heroPortrait,
  },
  about: {
    title: 'About me',
    text: '这里放你的自我介绍啊喂',
  },
  marquee: marqueeImages,
  projects: defaultProjects.map((p, i) => ({
    name: p.name,
    images: [p.col2, ...p.col1], // 大图在前，小图随后
    desc:
      i === 0
        ? '记录湖畔的灵感与日常，一个安静的写作角落。'
        : `${p.name} 项目简介。`,
    detail: `${p.name} 的详细项目内容。\n\n在这里补充项目背景、目标、你的角色、用到的技术栈、遇到的挑战与最终的成果。\n\n支持多段文字。`,
    tags: ['React', 'TypeScript', 'TailwindCSS'],
  })),
  resources: [
    {
      name: '前端开发',
      category: '技能',
      desc: 'React / Vue / TypeScript，从设计稿到上线全流程。',
      image:
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' +
        encodeURIComponent(
          'modern web development workspace, laptop with glowing code editor, dark ambient room, blue and purple neon accents, cinematic lighting, photorealistic',
        ) +
        '&image_size=landscape_4_3',
      link: 'https://github.com',
    },
  ],
};

export const STORAGE_KEY = 'lake-portfolio-content-v1';

/** 本地资源路径自动补 BASE_URL（http/data 原样），保证 GitHub Pages 子路径下图片可用（幂等） */
function fixAssetPath(p: string): string {
  if (!p || /^https?:\/\//.test(p) || p.startsWith('data:') || p.startsWith('blob:')) return p;
  const base = import.meta.env.BASE_URL;
  if (p.startsWith(base)) return p; // 已带 base，避免重复拼接
  return base + p.replace(/^\/+/, '');
}

/** 合并默认值 + 旧版迁移 + 图片路径修正（localStorage 草稿、静态 content.json、云端数据共用） */
export function normalizeContentFromCloud(parsed: Partial<SiteContent>): SiteContent {
  // 旧版本迁移：projects[].col1/col2 → images[]
  const projects = Array.isArray(parsed.projects)
    ? parsed.projects.map((p) => {
        const legacy = p as unknown as { col1?: string[]; col2?: string; images?: string[] };
        let item: ProjectItem;
        if (Array.isArray(legacy.images)) {
          item = p;
        } else {
          const images = [legacy.col2, ...(legacy.col1 ?? [])].filter(
            (s): s is string => typeof s === 'string' && s.length > 0,
          );
          const rest = { ...(p as object) } as Record<string, unknown>;
          delete rest.col1;
          delete rest.col2;
          item = { ...rest, images } as unknown as ProjectItem;
        }
        return {
          ...item,
          images: item.images.map(fixAssetPath),
          bigSide: (item.bigSide === 'left' ? 'left' : 'right') as 'left' | 'right',
        };
      })
    : DEFAULT_CONTENT.projects;

  return {
    ...DEFAULT_CONTENT,
    ...parsed,
    contact: {
      ...DEFAULT_CONTENT.contact,
      ...parsed.contact,
      qr: fixAssetPath(parsed.contact?.qr ?? DEFAULT_CONTENT.contact.qr),
    },
    hero: {
      ...DEFAULT_CONTENT.hero,
      ...parsed.hero,
      portrait: fixAssetPath(parsed.hero?.portrait ?? DEFAULT_CONTENT.hero.portrait),
    },
    about: { ...DEFAULT_CONTENT.about, ...parsed.about },
    projects,
    resources: (Array.isArray(parsed.resources) ? parsed.resources : DEFAULT_CONTENT.resources).map((r) => ({
      ...r,
      image: fixAssetPath(r.image),
    })),
    marquee: (Array.isArray(parsed.marquee) ? parsed.marquee : DEFAULT_CONTENT.marquee).map(fixAssetPath),
  };
}

export function hasLocalDraft(): boolean {
  try {
    return !!localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

export function loadContent(): SiteContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeContentFromCloud(JSON.parse(raw) as Partial<SiteContent>);
  } catch {
    /* 忽略损坏数据 */
  }
  return DEFAULT_CONTENT;
}

/** 拉取随站点部署的"已发布内容"（public/content.json），所有访客共享 */
export async function fetchPublishedContent(): Promise<SiteContent | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}content.json`, { cache: 'no-cache' });
    if (!res.ok) return null;
    return normalizeContentFromCloud((await res.json()) as Partial<SiteContent>);
  } catch {
    return null;
  }
}

export function saveContent(content: SiteContent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  } catch {
    /* 存储失败忽略 */
  }
}

export function resetContent() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
