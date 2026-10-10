import { useEffect, useRef } from 'react';
import { marqueeImages } from '../data/images';

// 第 1 行前 11 张，第 2 行后 10 张；三倍复制实现无缝循环
const ROW1 = marqueeImages.slice(0, 11);
const ROW2 = marqueeImages.slice(11, 21);

export default function MarqueeSection() {
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

  return (
    <section id="marquee" ref={sectionRef} className="overflow-hidden py-6 md:py-10">
      <div className="flex flex-col gap-3">
        {/* 第一行：向右滚动 */}
        <div ref={row1Ref} style={{ willChange: 'transform' }} className="flex w-max gap-3">
          {[...ROW1, ...ROW1, ...ROW1].map((src, i) => (
            <img
              key={`row1-${i}`}
              src={src}
              alt=""
              loading="lazy"
              className="h-[270px] w-[420px] shrink-0 rounded-2xl object-cover"
            />
          ))}
        </div>
        {/* 第二行：向左滚动 */}
        <div ref={row2Ref} style={{ willChange: 'transform' }} className="flex w-max gap-3">
          {[...ROW2, ...ROW2, ...ROW2].map((src, i) => (
            <img
              key={`row2-${i}`}
              src={src}
              alt=""
              loading="lazy"
              className="h-[270px] w-[420px] shrink-0 rounded-2xl object-cover"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
