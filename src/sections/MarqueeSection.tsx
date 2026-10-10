import { useEffect, useRef } from 'react';
import { useContent } from '../context/ContentContext';

const AUTO_SPEED = 0.45; // 每帧自动滚动像素

export default function MarqueeSection() {
  const { content } = useContent();
  const imgs = content.marquee;
  // 前一半第 1 行向右，后一半第 2 行向左；三倍复制实现无缝循环
  const half = Math.ceil(imgs.length / 2);
  const row1 = imgs.slice(0, half);
  const row2 = imgs.slice(half);

  const sectionRef = useRef<HTMLElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;
    let off1 = 0; // 第一行累计偏移（+ 向右）
    let off2 = 0; // 第二行累计偏移（- 向左）
    let vPar = 0; // 垂直滚动视差项（原公式）
    let dragging = false;
    let lastX = 0;

    const onScroll = () => {
      vPar = (window.scrollY - section.offsetTop + window.innerHeight) * 0.3;
    };

    // 拖拽 / 触摸横滑
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      off1 += dx;
      off2 += dx;
    };
    const onUp = () => {
      dragging = false;
    };

    // 三倍复制下的无缝取模：始终落在 (-w, 0]
    const wrap = (off: number, w: number) => {
      if (w <= 0) return 0;
      return (((off % w) + w) % w) - w;
    };

    const tick = () => {
      off1 += AUTO_SPEED;
      off2 -= AUTO_SPEED;
      const w1 = row1Ref.current ? row1Ref.current.scrollWidth / 3 : 0;
      const w2 = row2Ref.current ? row2Ref.current.scrollWidth / 3 : 0;
      if (row1Ref.current) row1Ref.current.style.transform = `translateX(${wrap(off1 + vPar, w1)}px)`;
      if (row2Ref.current) row2Ref.current.style.transform = `translateX(${wrap(off2 - vPar, w2)}px)`;
      raf = requestAnimationFrame(tick);
    };

    onScroll();
    raf = requestAnimationFrame(tick);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    section.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      section.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);

  const renderRow = (row: string[], keyPrefix: string, ref: React.RefObject<HTMLDivElement>) =>
    row.length > 0 && (
      <div
        ref={ref}
        style={{ willChange: 'transform', touchAction: 'pan-y' }}
        className="flex w-max cursor-grab select-none gap-3 active:cursor-grabbing"
      >
        {[...row, ...row, ...row].map((src, i) => (
          <img
            key={`${keyPrefix}-${i}`}
            src={src}
            alt=""
            loading="lazy"
            draggable={false}
            className="h-[270px] w-[420px] shrink-0 rounded-2xl object-cover"
          />
        ))}
      </div>
    );

  return (
    <section id="marquee" ref={sectionRef} className="overflow-hidden py-6 md:py-10">
      <div className="flex flex-col gap-3">
        {renderRow(row1, 'row1', row1Ref)}
        {renderRow(row2, 'row2', row2Ref)}
      </div>
    </section>
  );
}
