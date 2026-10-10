import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { ProjectItem } from '../data/content';

interface ProjectDetailProps {
  project: ProjectItem;
  index: number;
  onBack: () => void;
}

export default function ProjectDetail({ project, index, onBack }: ProjectDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative z-10 mx-auto min-h-screen max-w-5xl px-6 py-10 md:py-16"
    >
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-[#D7E2EA] transition-colors hover:bg-white/10"
      >
        <ArrowLeft size={16} /> 返回
      </button>

      <div className="mt-8 flex items-start justify-between gap-6">
        <span className="hero-heading text-6xl font-extrabold leading-none md:text-8xl">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h1 className="text-right text-3xl font-semibold text-[#D7E2EA] md:text-5xl">{project.name}</h1>
      </div>

      <p
        className="mt-4 text-lg text-white/60"
        style={{ fontFamily: "SimSun, 'Songti SC', serif" }}
      >
        {project.desc}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.tags.map((t) => (
          <span key={t} className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/70">
            {t}
          </span>
        ))}
      </div>

      {/* 主图（第 1 张） */}
      {project.images.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-3xl border-2 border-[#D7E2EA]/40">
          <img src={project.images[0]} alt={`${project.name} 主图`} className="h-[50vh] w-full object-cover md:h-[60vh]" />
        </div>
      )}

      {/* 详情正文 */}
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-10">
        {project.detail.split('\n').filter(Boolean).map((para, i) => (
          <p key={i} className="mb-4 leading-relaxed text-[#D7E2EA] last:mb-0 md:text-lg">
            {para}
          </p>
        ))}
      </div>

      {/* 其余细节图 */}
      {project.images.length > 1 && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {project.images.slice(1).map((src, k) => (
            <img key={k} src={src} alt={`细节 ${k + 1}`} className="h-56 w-full rounded-2xl object-cover md:h-72" />
          ))}
        </div>
      )}
    </motion.div>
  );
}
