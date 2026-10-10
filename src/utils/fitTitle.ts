/**
 * 标题自适应缩放计算（纯函数，便于单元测试）。
 * @param scrollWidth 文字内容实际宽度（溢出时为完整宽度）
 * @param maxWidth 容器可用宽度
 * @param currentPx 当前计算字号（px）
 * @returns 需要缩放时返回新字号（px，向下取整并留 4% 余量），不需要时返回 null
 */
export function computeFitFontSize(
  scrollWidth: number,
  maxWidth: number,
  currentPx: number,
): number | null {
  if (maxWidth <= 0 || currentPx <= 0) return null;
  if (scrollWidth <= maxWidth) return null;
  return Math.floor(currentPx * (maxWidth / scrollWidth) * 0.96);
}

/**
 * 对 DOM 元素执行一次自适应缩放。
 * 先将字号还原为空（回退到 CSS 类定义的 vw 字号），再按需缩小。
 * @param getStyle 可选注入，用于测试环境 mock 计算字号
 */
export function fitTitleElement(
  el: HTMLElement,
  getStyle: (e: HTMLElement) => number = (e) => parseFloat(getComputedStyle(e).fontSize),
): void {
  el.style.fontSize = '';
  const maxWidth = el.parentElement?.clientWidth ?? window.innerWidth;
  const current = getStyle(el);
  const next = computeFitFontSize(el.scrollWidth, maxWidth, current);
  if (next !== null) {
    el.style.fontSize = `${next}px`;
  }
}
