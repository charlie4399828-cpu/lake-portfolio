/**
 * 站点可编辑内容的单一数据源。
 * 默认值在此定义，编辑弹窗修改后写入 localStorage 覆盖。
 */

import { projects as defaultProjects, type Project } from './images';

export interface ContactInfo {
  email: string;
  phone: string;
  wechat: string;
  qr: string;
}

export interface ProjectItem extends Project {
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
  hero: { title: string; tagline: string };
  about: { title: string; text: string };
  projects: ProjectItem[];
  resources: ResourceItem[];
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
  },
  about: {
    title: 'About me',
    text: '这里放你的自我介绍啊喂',
  },
  projects: defaultProjects.map((p, i) => ({
    ...p,
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

const KEY = 'lake-portfolio-content-v1';

export function loadContent(): SiteContent {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SiteContent;
      // 保证关键字段存在（版本兼容）
      return { ...DEFAULT_CONTENT, ...parsed };
    }
  } catch {
    /* 忽略损坏数据 */
  }
  return DEFAULT_CONTENT;
}

export function saveContent(content: SiteContent) {
  try {
    localStorage.setItem(KEY, JSON.stringify(content));
  } catch {
    /* 存储失败忽略 */
  }
}

export function resetContent() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
