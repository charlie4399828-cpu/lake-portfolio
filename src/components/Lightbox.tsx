import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * 全局图片放大查看：任何带 data-zoomable 的 img 点击后在此放大。
 * 捕获阶段监听 + stopPropagation，避免触发卡片跳转/链接跳转。
 */
export default function Lightbox() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const img = (e.target as HTMLElement | null)?.closest?.('img[data-zoomable]') as HTMLImageElement | null;
      if (!img) return;
      e.stopPropagation();
      e.preventDefault();
      setSrc(img.currentSrc || img.src);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSrc(null);
    };
    document.addEventListener('click', onClick, true);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setSrc(null)}
          className="fixed inset-0 z-[95] flex cursor-zoom-out items-center justify-center bg-black/85 p-4 backdrop-blur-sm md:p-10"
        >
          <motion.img
            src={src}
            alt="放大预览"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-h-full max-w-full rounded-2xl border border-white/15 object-contain shadow-2xl"
          />
          <button
            aria-label="关闭"
            onClick={() => setSrc(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X size={20} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
