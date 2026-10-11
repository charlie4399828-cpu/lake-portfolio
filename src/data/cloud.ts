/**
 * Supabase 云端内容同步（Lake 专属独立项目 Lake_Portfolio）。
 * - 读：REST 直读 lake_content 单行（RLS 公开可读）
 * - 写：save-lake-site Edge Function，校验编辑密码后用 service role 写入
 * 本地 localStorage 只是缓存；任意访客打开网站都能拿到云端最新内容。
 */
import { normalizeContentFromCloud, type SiteContent } from './content';

const SUPABASE_URL = 'https://kmsiybqaxvyptxktsxhr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mU3GCORWbmqH7uo7Hii5kQ_cale7zin';
const SAVE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/save-lake-site`;

function authHeaders(): HeadersInit {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
}

export interface CloudContent {
  content: SiteContent;
  /** 云端内容时间戳（毫秒） */
  ts: number;
}

/** 拉取云端已发布内容；未配置 / 无数据 / 网络失败时返回 null（调用方走兜底） */
export async function fetchCloudContent(signal?: AbortSignal): Promise<CloudContent | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/lake_content?id=eq.1&select=content,updated_at`,
      { cache: 'no-store', headers: authHeaders(), signal },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{
      content?: Partial<SiteContent>;
      updated_at?: string;
    }>;
    const row = rows?.[0];
    if (!row?.content || !Object.keys(row.content).length) return null;
    const content = normalizeContentFromCloud(row.content);
    const ts =
      (row.content as { _cmsUpdatedAt?: number })._cmsUpdatedAt ||
      (row.updated_at ? new Date(row.updated_at).getTime() : 0);
    return { content, ts };
  } catch {
    return null;
  }
}

/** 用编辑密码把内容保存到云端（密码由 Edge Function 校验） */
export async function saveCloudContent(data: SiteContent, password: string): Promise<void> {
  const res = await fetch(SAVE_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ action: 'save', password, data }),
  });
  if (!res.ok) {
    let msg = `云端保存失败 (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) msg = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
}
