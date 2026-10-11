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

interface ContentCtxValue {
  content: SiteContent;
  update: (next: SiteContent) => void;
  reset: () => void;
}

const ContentCtx = createContext<ContentCtxValue | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  // 同步初始值：本机 localStorage 草稿优先（少爷本机编辑预览），否则代码默认
  const [content, setContent] = useState<SiteContent>(() => loadContent());

  // 无本机草稿（即普通访客）→ 拉取随站点部署的已发布内容 content.json
  useEffect(() => {
    if (hasLocalDraft()) return;
    let cancelled = false;
    fetchPublishedContent().then((published) => {
      if (!cancelled && published) setContent(published);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback((next: SiteContent) => {
    setContent(next);
    saveContent(next);
  }, []);

  // 清除本机草稿后，回到线上已发布内容（无发布则回代码默认）
  const reset = useCallback(() => {
    resetContent();
    fetchPublishedContent().then((published) => setContent(published ?? DEFAULT_CONTENT));
  }, []);

  const value = useMemo(() => ({ content, update, reset }), [content, update, reset]);
  return <ContentCtx.Provider value={value}>{children}</ContentCtx.Provider>;
}

export function useContent(): ContentCtxValue {
  const ctx = useContext(ContentCtx);
  if (!ctx) throw new Error('useContent 必须在 ContentProvider 内使用');
  return ctx;
}
