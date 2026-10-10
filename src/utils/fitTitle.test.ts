import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { computeFitFontSize, fitTitleElement } from './fitTitle';

describe('computeFitFontSize', () => {
  it('文字未超出容器时不缩放（返回 null）', () => {
    expect(computeFitFontSize(500, 800, 100)).toBeNull();
  });

  it('文字宽度恰好等于容器时不缩放', () => {
    expect(computeFitFontSize(800, 800, 100)).toBeNull();
  });

  it('溢出时按比例缩小并留 4% 余量（向下取整）', () => {
    // ratio = 400/800 = 0.5 → 100 * 0.5 * 0.96 = 48
    expect(computeFitFontSize(800, 400, 100)).toBe(48);
  });

  it('极端窄屏（手机 390px 装 791px 内容）能压到容器内', () => {
    const next = computeFitFontSize(791, 390, 54.6)!;
    expect(next).toBe(Math.floor(54.6 * (390 / 791) * 0.96)); // 25
    // 缩放后文字宽度 < 容器宽度
    expect((next / 54.6) * 791).toBeLessThan(390);
  });

  it('非法输入（容器宽 0 / 字号 0）不缩放', () => {
    expect(computeFitFontSize(800, 0, 100)).toBeNull();
    expect(computeFitFontSize(800, 400, 0)).toBeNull();
  });

  it('长标题在 PC 宽屏同样收敛', () => {
    // 10 个字 17.5vw@1920 → 3360px 内容 vs 1920 容器
    const next = computeFitFontSize(3360, 1920, 336)!;
    expect((next / 336) * 3360).toBeLessThanOrEqual(1920);
  });
});

describe('fitTitleElement（DOM 侧效果）', () => {
  let el: HTMLHeadingElement;

  // jsdom 不做真实布局，用 getter 模拟几何尺寸
  function mockGeometry({ scrollWidth, parentWidth }: { scrollWidth: number; parentWidth: number }) {
    Object.defineProperty(el, 'scrollWidth', { configurable: true, value: scrollWidth });
    Object.defineProperty(el.parentElement, 'clientWidth', { configurable: true, value: parentWidth });
  }

  beforeEach(() => {
    document.body.innerHTML = '<div id="wrap"><h1 id="t" style="font-size:100px">莱克的小屋</h1></div>';
    el = document.getElementById('t') as HTMLHeadingElement;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('未溢出：清空内联字号，保持 CSS 类字号', () => {
    mockGeometry({ scrollWidth: 500, parentWidth: 800 });
    fitTitleElement(el);
    expect(el.style.fontSize).toBe('');
  });

  it('溢出：写入缩小后的内联字号', () => {
    mockGeometry({ scrollWidth: 800, parentWidth: 400 });
    // 注入 mock 计算字号（模拟 CSS 类定义的 100px，避开 jsdom 默认 15px）
    fitTitleElement(el, () => 100);
    expect(el.style.fontSize).toBe('48px');
  });

  it('再次调用会先还原再重算（幂等，不会越缩越小）', () => {
    mockGeometry({ scrollWidth: 800, parentWidth: 400 });
    fitTitleElement(el, () => 100);
    const first = el.style.fontSize;
    // 模拟 resize：容器变宽到 800
    mockGeometry({ scrollWidth: 800, parentWidth: 800 });
    fitTitleElement(el, () => 100);
    expect(el.style.fontSize).toBe(''); // 还原为 CSS 字号
    // 再变窄
    mockGeometry({ scrollWidth: 800, parentWidth: 400 });
    fitTitleElement(el, () => 100);
    expect(el.style.fontSize).toBe(first); // 结果一致，非叠加缩小
  });

  it('无父元素时退化为 window.innerWidth，不抛错', () => {
    const orphan = document.createElement('h1');
    Object.defineProperty(orphan, 'scrollWidth', { configurable: true, value: 99999 });
    expect(() => fitTitleElement(orphan)).not.toThrow();
  });
});
