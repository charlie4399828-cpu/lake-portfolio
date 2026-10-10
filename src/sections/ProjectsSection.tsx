import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import FadeIn from '../components/FadeIn';
import { useContent } from '../context/ContentContext';
import type { ProjectItem } from '../data/content';

interface ProjectCardProps {
  index: number;
  total: number;
  progress: MotionValue<number>;
  project: ProjectItem;
  onOpen: (index: number) => void;
}

function ProjectCard({ index, total, progress, project, onOpen }: ProjectCardProps) {
  // scale 公式：1 - (totalCards - 1 - index) * 0.03
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);

  return (
    <div className="sticky top-24 flex h-[85vh] items-center justify-center px-4 sm:px-6 md:top-32 md:px-10">
      <motion.div
        style={{ scale, top: `${index * 28}px` }}
        onClick={() => onOpen(index)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onOpen(index)}
        className="relative flex h-[72%] w-full max-w-6xl origin-top cursor-pointer flex-col rounded-3xl border-2 border-[#D7E2EA] bg-[#0C0C0C] p-5 transition-colors hover:border-white sm:p-6 md:p-8"
      >
        {/* 顶部行：大序号 + 项目名 */}
        <div className="flex shrink-0 items-start justify-between">
          <span className="hero-heading text-5xl font-extrabold leading-none md:text-7xl">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="text-right">
            <h3 className="text-xl font-semibold text-[#D7E2EA] md:text-3xl">{project.name}</h3>
            {/* 卡片小字：半透明、白色、宋体 */}
            <p
              className="mt-1 text-sm text-white/50 md:text-base"
              style={{ fontFamily: "SimSun, 'Songti SC', serif" }}
            >
              {project.desc}
            </p>
          </div>
        </div>

        {/* 底部图片区：1 张全宽；2 张左 40% + 右 60%（第 1 张为大图，bigSide 可换侧）；3+ 张一大 + 小图堆叠 */}
        {project.images.length > 0 && (
          <div className="mt-4 flex min-h-0 flex-1 gap-3 md:mt-6">
            {project.images.length === 1 ? (
              <img
                src={project.images[0]}
                alt={`${project.name} 图 1`}
                loading="lazy"
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : project.images.length === 2 ? (
              <>
                {/* 小图 40%（大图在左时移到右侧） */}
                <div className={`min-w-0 w-2/5 ${project.bigSide === 'left' ? 'order-2' : ''}`}>
                  <img
                    src={project.images[1]}
                    alt={`${project.name} 图 2`}
                    loading="lazy"
                    className="h-full w-full rounded-2xl object-cover"
                  />
                </div>
                {/* 大图 60%（images[0]） */}
                <div className={`min-w-0 w-3/5 ${project.bigSide === 'left' ? 'order-1' : ''}`}>
                  <img
                    src={project.images[0]}
                    alt={`${project.name} 图 1`}
                    loading="lazy"
                    className="h-full w-full rounded-2xl object-cover"
                  />
                </div>
              </>
            ) : (
              <>
                {/* 小图列（与大图位置相反） */}
                <div
                  className={`grid w-2/5 gap-3 ${project.bigSide === 'left' ? 'order-2' : ''}`}
                  style={{ gridTemplateRows: `repeat(${project.images.length - 1}, minmax(0, 1fr))` }}
                >
                  {project.images.slice(1).map((src, k) => (
                    <img
                      key={k}
                      src={src}
                      alt={`${project.name} 图 ${k + 2}`}
                      loading="lazy"
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ))}
                </div>
                <div className={`w-3/5 ${project.bigSide === 'left' ? 'order-1' : ''}`}>
                  <img
                    src={project.images[0]}
                    alt={`${project.name} 主图`}
                    loading="lazy"
                    className="h-full w-full rounded-2xl object-cover"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

interface ProjectsSectionProps {
  onOpen: (index: number) => void;
}

export default function ProjectsSection({ onOpen }: ProjectsSectionProps) {
  const { content } = useContent();
  const projects = content.projects;
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section
      id="projects"
      className="relative z-10 -mt-16 overflow-x-clip rounded-t-[3rem] pb-20 md:-mt-24 md:rounded-t-[5rem] md:pb-28"
    >
      <div className="overflow-hidden px-6 pb-10 pt-16 text-center md:pb-16 md:pt-24">
        <FadeIn y={30}>
          <h2
            className="hero-heading font-black uppercase leading-none"
            style={{ fontSize: 'clamp(3.5rem, 12vw, 10rem)' }}
          >
            Project
          </h2>
        </FadeIn>
      </div>

      {/* 粘性堆叠卡片 */}
      <div ref={containerRef} className="relative">
        {projects.map((project, i) => (
          <ProjectCard
            key={`${project.name}-${i}`}
            index={i}
            total={projects.length}
            progress={scrollYProgress}
            project={project}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
}
