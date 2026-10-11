import { describe, it, expect, afterEach, vi } from 'vitest';
import { fetchCloudContent, saveCloudContent } from './cloud';
import type { SiteContent } from './content';

/** 最小合法云端数据（normalize 会补齐其余默认字段） */
const cloudPayload = {
  contact: { email: 'a@b.c', phone: '1', wechat: 'w', qr: '/q.png' },
  hero: { title: '云端标题', tagline: 'TAG', portrait: '/p.png' },
  about: { title: 'About', text: '你好' },
  marquee: ['/m1.png', '/m2.png'],
  projects: [
    {
      name: '云端项目',
      images: ['/big.png', '/small.png'],
      bigSide: 'left' as const,
      desc: '小字',
      detail: '详情',
      tags: ['React'],
    },
  ],
  resources: [
    { name: '云端资源', category: '技能', desc: '简介', image: '/r.png', link: 'https://x.com' },
  ],
  _cmsUpdatedAt: 1791700000000,
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('fetchCloudContent（跨域读取）', () => {
  afterEach(() => vi.restoreAllMocks());

  it('200 且有内容：解析出 content，时间戳优先取 _cmsUpdatedAt', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse([{ content: cloudPayload, updated_at: '2026-10-11T00:00:00Z' }]));

    const result = await fetchCloudContent();

    expect(result).not.toBeNull();
    expect(result!.content.hero.title).toBe('云端标题');
    expect(result!.content.projects).toHaveLength(1);
    expect(result!.content.projects[0].bigSide).toBe('left');
    expect(result!.ts).toBe(1791700000000);
    // 请求的是 Lake 独立项目的 lake_content 表，并带匿名鉴权头
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain('kmsiybqaxvyptxktsxhr.supabase.co');
    expect(String(url)).toContain('/rest/v1/lake_content');
    expect((init!.headers as Record<string, string>).apikey).toBeTruthy();
  });

  it('无 _cmsUpdatedAt 时回退使用 updated_at', async () => {
    const { _cmsUpdatedAt, ...withoutTs } = cloudPayload;
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse([{ content: withoutTs, updated_at: '2026-10-11T08:00:00Z' }]),
    );
    const result = await fetchCloudContent();
    expect(result!.ts).toBe(new Date('2026-10-11T08:00:00Z').getTime());
  });

  it('云端为空行（未发布过任何内容）返回 null，交给调用方走静态兜底', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse([]));
    expect(await fetchCloudContent()).toBeNull();
  });

  it('content 是空对象返回 null', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse([{ content: {}, updated_at: null }]),
    );
    expect(await fetchCloudContent()).toBeNull();
  });

  it('HTTP 非 200（如 401/500）返回 null，不抛异常', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ message: 'jwt' }, 401));
    expect(await fetchCloudContent()).toBeNull();
  });

  it('网络失败 / 跨域被拦（fetch reject）返回 null', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    expect(await fetchCloudContent()).toBeNull();
  });

  it('AbortSignal 触发时返回 null', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('aborted', 'AbortError'));
    const controller = new AbortController();
    controller.abort();
    expect(await fetchCloudContent(controller.signal)).toBeNull();
  });
});

describe('saveCloudContent（密码保护写入）', () => {
  afterEach(() => vi.restoreAllMocks());

  it('云函数返回 200：请求体携带 action/password/data，不抛错', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ ok: true }));
    const data = { hero: { title: 'x' } } as unknown as SiteContent;

    await expect(saveCloudContent(data, '763560')).resolves.toBeUndefined();

    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain('/functions/v1/save-lake-site');
    expect(init!.method).toBe('POST');
    const body = JSON.parse(init!.body as string);
    expect(body).toMatchObject({ action: 'save', password: '763560' });
    expect(body.data.hero.title).toBe('x');
  });

  it('密码错误（401 带 error 文案）抛出云端返回的错误信息', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ error: '密码错误' }, 401));
    await expect(saveCloudContent({} as SiteContent, 'wrong')).rejects.toThrow('密码错误');
  });

  it('500 且无 JSON 错误体时抛出带状态码的兜底信息', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Internal Error', { status: 500 }),
    );
    await expect(saveCloudContent({} as SiteContent, '763560')).rejects.toThrow(
      '云端保存失败 (500)',
    );
  });
});
