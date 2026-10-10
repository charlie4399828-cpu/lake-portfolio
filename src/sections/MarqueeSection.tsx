import { useEffect, useRef } from 'react';
import { useContent } from '../context/ContentContext';

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
    const update = () => {
      const section = sectionRef.current;
      if (!section) return;
      const sectionTop = section.offsetTop;
      // 滚动偏移公式
      const offset = (window.scrollY - sectionTop + window.innerHeight) * 0.3;
      if (row1Ref.current) row1Ref.current.style.transform = `translateX(${offset - 200}px)`;
      if (row2Ref.current) row2Ref.current.style.transform = `translateX(${-(offset - 200)}px)`;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const renderRow = (row: string[], keyPrefix: string, ref: React.RefObject<HTMLDivElement>) =>
    row.length > 0 && (
      <div ref={ref} style={{ willChange: 'transform' }} className="flex w-max gap-3">
        {[...row, ...row, ...row].map((src, i) => (
          <img
            key={`${keyPrefix}-${i}`}
            src={src}
            alt=""
            loading="lazy"
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
