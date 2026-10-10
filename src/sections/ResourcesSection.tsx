import { ArrowUpRight } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import { useContent } from '../context/ContentContext';
import type { ResourceItem } from '../data/content';

function ResourceCard({ item, index }: { item: ResourceItem; index: number }) {
  return (
    <FadeIn delay={index * 0.1} y={30}>
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full flex-col overflow-hidden rounded-3xl border-2 border-[#D7E2EA]/40 bg-[#0C0C0C]/80 transition-all duration-300 hover:-translate-y-1.5 hover:border-white"
      >
        {/* 配图 */}
        <div className="relative h-44 w-full overflow-hidden md:h-52">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* 分类标签胶囊：渐变描边 */}
          <span
            className="absolute left-4 top-4 rounded-full p-[1.5px]"
            style={{
              backgroundImage:
                'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
            }}
          >
            <span className="block rounded-full bg-[#0C0C0C]/85 px-3 py-1 text-[11px] uppercase tracking-wider text-white">
              {item.category}
            </span>
          </span>
        </div>

        {/* 文字区 */}
        <div className="flex flex-1 flex-col gap-2 p-5 md:p-6">
          <h3 className="text-lg font-semibold text-[#D7E2EA] md:text-xl">{item.name}</h3>
          <p
            className="flex-1 text-sm leading-relaxed text-white/50"
            style={{ fontFamily: "SimSun, 'Songti SC', serif" }}
          >
            {item.desc}
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-white/70 transition-colors group-hover:text-white">
            访问链接
            <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </a>
    </FadeIn>
  );
}

export default function ResourcesSection() {
  const { content } = useContent();
  const resources = content.resources;

  return (
    <section id="resources" className="relative z-10 overflow-x-clip px-6 py-24 md:py-32">
      <div className="overflow-hidden pb-10 text-center md:pb-14">
        <FadeIn y={30}>
          <h2
            className="hero-heading font-black uppercase leading-none"
            style={{ fontSize: 'clamp(3rem, 10vw, 8rem)' }}
          >
            Resources
          </h2>
        </FadeIn>
        <FadeIn y={20} delay={0.1}>
          <p className="mt-4 text-xs uppercase tracking-widest text-[#D7E2EA]/60">
            我的技能 · 人脉 · 工具
          </p>
        </FadeIn>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((item, i) => (
          <ResourceCard key={`${item.name}-${i}`} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}
