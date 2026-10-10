import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * 回到顶部悬浮按钮：
 * - 相对视口 fixed（浮于整个页面之上，不随某个 section）
 * - 滚动超过 200px 才出现
 * - 滚动中自动贴边隐藏（半透明、缩进右边缘），停止滑动后滑出
 */
export default function BackToTop() {
  const [past, setPast] = useState(false); // 是否滚过阈值
  const [idle, setIdle] = useState(true); // 是否处于停止滑动状态
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setPast(y > 200);
      setIdle(false);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setIdle(true), 260);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer.current);
    };
  }, []);

  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const shown = past && idle;

  return (
    <button
      type="button"
      aria-label="回到顶部"
      onClick={toTop}
      style={{ position: 'fixed' }}
      className={`bottom-6 right-6 z-[90] rounded-full border border-white/25 bg-white/10 p-3 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 ${
        shown
          ? 'translate-x-0 opacity-70 hover:opacity-100'
          : 'pointer-events-none translate-x-[70%] opacity-0'
      }`}
    >
      <ArrowUp size={20} strokeWidth={2.5} />
    </button>
  );
}
