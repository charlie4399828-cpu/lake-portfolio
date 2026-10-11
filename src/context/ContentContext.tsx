import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  loadContent,
  saveContent,
  resetContent,
  hasLocalDraft,
  fetchPublishedContent,
  DEFAULT_CONTENT,
  type SiteContent,
} from '../data/content';
import { fetchCloudContent } from '../data/cloud';

interface ContentCtxValue {
  content: SiteContent;
  update: (next: SiteContent) => void;
  reset: () => void;
}

const ContentCtx = createContext<ContentCtxValue | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  // 同步初始值：本机 localStorage 草稿（含 _cmsUpdatedAt），无草稿则代码默认
  const [content, setContent] = useState<SiteContent>(() => loadContent());

  // 启动时同步云端：
  // 1) 云端有内容 → 与本机草稿按时间戳取新（少爷本机刚改未同步也不丢）
  // 2) 云端不可用/无数据 → 访客回退到随站点部署的静态 content.json
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      const cloud = await fetchCloudContent(controller.signal);
      if (controller.signal.aborted) return;

      if (cloud) {
        const local = hasLocalDraft() ? loadContent() : null;
        const localTs = local?._cmsUpdatedAt ?? 0;
        if (!local || cloud.ts >= localTs) {
          setContent(cloud.content);
        }
        return;
      }

      if (!hasLocalDraft()) {
        const published = await fetchPublishedContent();
        if (!controller.signal.aborted && published) setContent(published);
      }
    })();
    return () => controller.abort();
  }, []);

  // 本地保存（带时间戳）；云端同步由编辑弹窗携带密码另行触发
  const update = useCallback((next: SiteContent) => {
    const stamped = { ...next, _cmsUpdatedAt: Date.now() };
    setContent(stamped);
    saveContent(stamped);
  }, []);

  // 清除本机草稿：回到云端内容 → 静态发布 → 代码默认
  const reset = useCallback(() => {
    resetContent();
    (async () => {
      const cloud = await fetchCloudContent();
      if (cloud) {
        setContent(cloud.content);
        return;
      }
      setContent((await fetchPublishedContent()) ?? DEFAULT_CONTENT);
    })();
  }, []);

  const value = useMemo(() => ({ content, update, reset }), [content, update, reset]);
  return <ContentCtx.Provider value={value}>{children}</ContentCtx.Provider>;
}

export function useContent(): ContentCtxValue {
  const ctx = useContext(ContentCtx);
  if (!ctx) throw new Error('useContent 必须在 ContentProvider 内使用');
  return ctx;
}
