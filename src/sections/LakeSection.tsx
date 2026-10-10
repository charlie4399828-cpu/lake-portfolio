import { useEffect, useRef, useState } from 'react';
import ContactButton from '../components/ContactButton';
import EditorModal from '../components/EditorModal';
import FadeIn from '../components/FadeIn';
import { useContent } from '../context/ContentContext';
import { fitTitleElement } from '../utils/fitTitle';

// 顶部导航对应页面四个章节
const NAV_LINKS = [
  { label: 'Lake', href: '#lake' },
  { label: 'Marquee', href: '#marquee' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Resources', href: '#resources' },
];

export default function LakeSection() {
  const { content } = useContent();
  const [editorOpen, setEditorOpen] = useState(false);
  const clickCount = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // 标题自适应收缩：无论标题多长、任何视口宽度，都不横向溢出
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const fit = () => fitTitleElement(el);
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [content.hero.title]);

  // 连续点击 3 次（800ms 内）打开编辑弹窗
  const onTaglineClick = () => {
    clickCount.current += 1;
    window.clearTimeout(timer.current);
    if (clickCount.current >= 3) {
      clickCount.current = 0;
      setEditorOpen(true);
      return;
    }
    timer.current = window.setTimeout(() => {
      clickCount.current = 0;
    }, 800);
  };

  return (
    <section id="lake" className="relative flex h-screen flex-col overflow-x-clip">
      {/* 导航栏 */}
      <FadeIn delay={0} className="shrink-0">
        <nav className="flex items-center justify-center gap-4 px-4 pt-5 sm:gap-12 sm:pt-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs uppercase tracking-wider text-[#D7E2EA] transition-opacity duration-200 hover:opacity-70 sm:text-sm"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </FadeIn>

      {/* 大标题 + 人像 */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
        <div className="w-full overflow-hidden">
          <FadeIn delay={0.15} y={40}>
            <h1 ref={titleRef} className="hero-heading mx-auto max-w-full whitespace-nowrap text-center text-[13vw] font-black uppercase leading-[0.9] sm:text-[15vw] md:text-[16vw] lg:text-[17.5vw]">
              {content.hero.title}
            </h1>
          </FadeIn>
        </div>
        <FadeIn delay={0.6} y={30} className="mt-5 md:mt-7">
          <img
            src={content.hero.portrait}
            alt="Lake 人像"
            loading="lazy"
            className="h-32 w-24 rounded-2xl object-cover sm:h-44 sm:w-32 md:h-56 md:w-40 lg:h-64 lg:w-48"
          />
        </FadeIn>
      </div>

      {/* 底部左右布局 */}
      <div className="flex shrink-0 items-end justify-between px-6 pb-6 sm:px-10 sm:pb-8">
        <FadeIn delay={0.35} y={20}>
          <p
            onClick={onTaglineClick}
            title="连续点击 3 次进入编辑"
            className="cursor-default select-none text-[10px] font-light uppercase tracking-wider text-[#D7E2EA] sm:text-xs"
          >
            {content.hero.tagline}
          </p>
        </FadeIn>
        <FadeIn delay={0.5} y={20}>
          <ContactButton contact={content.contact} />
        </FadeIn>
      </div>

      <EditorModal open={editorOpen} onClose={() => setEditorOpen(false)} />
    </section>
  );
}
