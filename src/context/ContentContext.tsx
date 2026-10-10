import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  loadContent,
  saveContent,
  resetContent,
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
  const [content, setContent] = useState<SiteContent>(() => loadContent());

  const update = useCallback((next: SiteContent) => {
    setContent(next);
    saveContent(next);
  }, []);

  const reset = useCallback(() => {
    resetContent();
    setContent(DEFAULT_CONTENT);
  }, []);

  const value = useMemo(() => ({ content, update, reset }), [content, update, reset]);
  return <ContentCtx.Provider value={value}>{children}</ContentCtx.Provider>;
}

export function useContent(): ContentCtxValue {
  const ctx = useContext(ContentCtx);
  if (!ctx) throw new Error('useContent 必须在 ContentProvider 内使用');
  return ctx;
}
