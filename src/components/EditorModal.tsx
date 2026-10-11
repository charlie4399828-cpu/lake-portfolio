import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Trash2, RotateCcw, Save, LockKeyhole, ArrowUp, ArrowDown, Download, Upload } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { DEFAULT_CONTENT, type SiteContent } from '../data/content';

interface EditorModalProps {
  open: boolean;
  onClose: () => void;
}

const inputCls =
  'w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#B600A8]';
const labelCls = 'mb-1 block text-xs uppercase tracking-wider text-white/50';

/** 图片缩略图预览（加载失败显示占位） */
function Thumb({ src }: { src: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <span className="flex h-9 w-14 shrink-0 items-center justify-center rounded-md border border-dashed border-white/15 text-[10px] text-white/30">
        无图
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      onError={() => setErr(true)}
      className="h-9 w-14 shrink-0 rounded-md border border-white/15 object-cover"
    />
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  preview,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  preview?: boolean;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {textarea ? (
        <textarea rows={3} className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : preview ? (
        <div className="flex items-center gap-2">
          <Thumb key={value} src={value} />
          <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
      ) : (
        <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

const EDIT_PASSWORD = '763560';

/** 通用数组元素上移/下移 */
function moveItem<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = arr.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** 上移/下移按钮组（端点禁用） */
function MoveButtons({
  index,
  total,
  onMove,
}: {
  index: number;
  total: number;
  onMove: (dir: -1 | 1) => void;
}) {
  const btn = 'rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-white/50';
  return (
    <span className="inline-flex items-center gap-0.5">
      <button onClick={() => onMove(-1)} disabled={index === 0} aria-label="上移" className={btn}>
        <ArrowUp size={15} />
      </button>
      <button onClick={() => onMove(1)} disabled={index === total - 1} aria-label="下移" className={btn}>
        <ArrowDown size={15} />
      </button>
    </span>
  );
}

/** 图片列表编辑器：增删 + 上下移（项目卡 / Marquee 共用） */
function ImageListEditor({
  images,
  onChange,
  hint,
  labelFor,
}: {
  images: string[];
  onChange: (next: string[]) => void;
  hint: string;
  labelFor: (k: number) => string;
}) {
  const setImg = (k: number, v: string) => onChange(images.map((s, idx) => (idx === k ? v : s)));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className={labelCls}>{hint}</span>
        <button
          onClick={() => onChange([...images, ''])}
          className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20"
        >
          <Plus size={12} /> 添加图片
        </button>
      </div>
      <div className="space-y-2">
        {images.map((src, k) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="w-8 shrink-0 text-center text-xs text-white/40">{labelFor(k)}</span>
            <Thumb key={src} src={src} />
            <input
              className={inputCls}
              value={src}
              placeholder="图片地址"
              onChange={(e) => setImg(k, e.target.value)}
            />
            <MoveButtons index={k} total={images.length} onMove={(dir) => onChange(moveItem(images, k, dir))} />
            <button
              onClick={() => onChange(images.filter((_, idx) => idx !== k))}
              aria-label="删除图片"
              className="shrink-0 rounded-md p-1.5 text-white/50 hover:bg-red-500/20 hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {images.length === 0 && <p className="text-xs text-white/30">暂无图片，点右上角"添加图片"</p>}
      </div>
    </div>
  );
}

export default function EditorModal({ open, onClose }: EditorModalProps) {
  const { content, update, reset } = useContent();
  const [draft, setDraft] = useState<SiteContent>(content);
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [pwdError, setPwdError] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(content);
      setAuthed(false);
      setPwd('');
      setPwdError(false);
    }
  }, [open, content]);

  const submitPwd = () => {
    if (pwd === EDIT_PASSWORD) {
      setAuthed(true);
      setPwdError(false);
    } else {
      setPwdError(true);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const set = <K extends keyof SiteContent>(key: K, val: SiteContent[K]) =>
    setDraft((d) => ({ ...d, [key]: val }));

  const setProject = (i: number, patch: Partial<SiteContent['projects'][number]>) =>
    setDraft((d) => {
      const projects = d.projects.slice();
      projects[i] = { ...projects[i], ...patch };
      return { ...d, projects };
    });

  const addProject = () =>
    setDraft((d) => ({
      ...d,
      projects: [
        ...d.projects,
        {
          name: `新项目 ${d.projects.length + 1}`,
          images: d.projects[0] ? [...d.projects[0].images] : [],
          desc: '项目简介',
          detail: '项目详情',
          tags: ['React'],
        },
      ],
    }));

  const removeProject = (i: number) =>
    setDraft((d) => ({ ...d, projects: d.projects.filter((_, idx) => idx !== i) }));

  const moveProject = (i: number, dir: -1 | 1) =>
    setDraft((d) => ({ ...d, projects: moveItem(d.projects, i, dir) }));

  const setMarquee = (v: string[]) => set('marquee', v);

  const setResource = (i: number, patch: Partial<SiteContent['resources'][number]>) =>
    setDraft((d) => {
      const resources = d.resources.slice();
      resources[i] = { ...resources[i], ...patch };
      return { ...d, resources };
    });

  const addResource = () =>
    setDraft((d) => ({
      ...d,
      resources: [
        ...d.resources,
        {
          name: `新资源 ${d.resources.length + 1}`,
          category: '技能',
          desc: '一句话介绍这个资源',
          image: d.resources[0]?.image ?? '',
          link: 'https://',
        },
      ],
    }));

  const removeResource = (i: number) =>
    setDraft((d) => ({ ...d, resources: d.resources.filter((_, idx) => idx !== i) }));

  const moveResource = (i: number, dir: -1 | 1) =>
    setDraft((d) => ({ ...d, resources: moveItem(d.resources, i, dir) }));

  const save = () => {
    update(draft);
    onClose();
  };

  // 导出 / 导入配置 JSON（跨浏览器迁移内容）
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lake-content.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        setDraft({ ...DEFAULT_CONTENT, ...parsed });
      } catch {
        alert('导入失败：文件不是有效的 JSON');
      }
    };
    reader.readAsText(f);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border-2 border-[#D7E2EA]/30 bg-[#0C0C0C]"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 className="hero-heading text-xl font-extrabold uppercase md:text-2xl">编辑网页内容</h2>
              <button onClick={onClose} aria-label="关闭" className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {!authed ? (
              /* 密码验证阶段 */
              <div className="flex flex-col items-center gap-4 px-6 py-16">
                <LockKeyhole size={28} className="text-[#B600A8]" />
                <p className="text-sm text-[#D7E2EA]/70">请输入编辑密码</p>
                <input
                  type="password"
                  inputMode="numeric"
                  value={pwd}
                  autoFocus
                  onChange={(e) => { setPwd(e.target.value); setPwdError(false); }}
                  onKeyDown={(e) => e.key === 'Enter' && submitPwd()}
                  placeholder="••••••"
                  className={`w-48 rounded-lg border bg-white/5 px-4 py-2.5 text-center text-lg tracking-[0.4em] text-white outline-none ${
                    pwdError ? 'border-red-500' : 'border-white/15 focus:border-[#B600A8]'
                  }`}
                />
                {pwdError && <p className="text-xs text-red-400">密码错误，请重试</p>}
                <button
                  onClick={submitPwd}
                  style={{
                    backgroundImage:
                      'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
                    outline: '2px solid #FFFFFF',
                    outlineOffset: '-3px',
                  }}
                  className="mt-2 rounded-full px-8 py-2 text-sm font-semibold uppercase tracking-wider text-white transition-transform hover:scale-105"
                >
                  确认
                </button>
              </div>
            ) : (
            <>
            <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 py-6">
              {/* 联系方式 */}
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#B600A8]">联系方式</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="邮箱" value={draft.contact.email} onChange={(v) => set('contact', { ...draft.contact, email: v })} />
                  <Field label="电话" value={draft.contact.phone} onChange={(v) => set('contact', { ...draft.contact, phone: v })} />
                  <Field label="微信号" value={draft.contact.wechat} onChange={(v) => set('contact', { ...draft.contact, wechat: v })} />
                  <Field label="二维码路径" preview value={draft.contact.qr} onChange={(v) => set('contact', { ...draft.contact, qr: v })} />
                </div>
              </section>

              {/* Hero 模块 */}
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#B600A8]">Hero 模块</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="大标题" value={draft.hero.title} onChange={(v) => set('hero', { ...draft.hero, title: v })} />
                  <Field label="左下角小字" value={draft.hero.tagline} onChange={(v) => set('hero', { ...draft.hero, tagline: v })} />
                  <div className="sm:col-span-2">
                    <Field label="人像图片" preview value={draft.hero.portrait} onChange={(v) => set('hero', { ...draft.hero, portrait: v })} />
                  </div>
                </div>
              </section>

              {/* About 模块 */}
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#B600A8]">About 模块</h3>
                <div className="grid grid-cols-1 gap-3">
                  <Field label="标题" value={draft.about.title} onChange={(v) => set('about', { ...draft.about, title: v })} />
                  <Field label="自我介绍" textarea value={draft.about.text} onChange={(v) => set('about', { ...draft.about, text: v })} />
                </div>
              </section>

              {/* Marquee 模块（滚动图片增删 + 调序） */}
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#B600A8]">
                  Marquee 模块（{draft.marquee.length} 张图）
                </h3>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <ImageListEditor
                    images={draft.marquee}
                    onChange={setMarquee}
                    hint={`滚动图片（前 ${Math.ceil(draft.marquee.length / 2)} 张第一行向右，其余第二行向左）`}
                    labelFor={(k) => `图${k + 1}`}
                  />
                </div>
              </section>

              {/* Projects 模块（卡片数量 + 子模块内容） */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#B600A8]">
                    Projects 模块（{draft.projects.length} 张卡片）
                  </h3>
                  <button
                    onClick={addProject}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
                  >
                    <Plus size={14} /> 添加卡片
                  </button>
                </div>
                <div className="space-y-4">
                  {draft.projects.map((p, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="hero-heading text-lg font-extrabold">{String(i + 1).padStart(2, '0')}</span>
                        <span className="flex items-center gap-1">
                          <MoveButtons index={i} total={draft.projects.length} onMove={(dir) => moveProject(i, dir)} />
                          <button
                            onClick={() => removeProject(i)}
                            aria-label="删除卡片"
                            className="rounded-md p-1.5 text-white/50 hover:bg-red-500/20 hover:text-red-400"
                          >
                            <Trash2 size={15} />
                          </button>
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="项目名" value={p.name} onChange={(v) => setProject(i, { name: v })} />
                        <Field label="卡片小字" value={p.desc} onChange={(v) => setProject(i, { desc: v })} />
                        <div className="sm:col-span-2">
                          <Field label="详情页内容" textarea value={p.detail} onChange={(v) => setProject(i, { detail: v })} />
                        </div>
                        {/* 图片列表：1 张全宽 / 2 张并排 / 3+ 张一大 N 小，可增删、上下调序 */}
                        <div className="sm:col-span-2">
                          <ImageListEditor
                            images={p.images}
                            onChange={(imgs) => setProject(i, { images: imgs })}
                            hint={
                              p.images.length <= 1
                                ? '图片（1 张全宽）'
                                : p.images.length === 2
                                  ? '图片（第 1 张为大图 60%，第 2 张 40%，可切换左右）'
                                  : '图片（第 1 张为大图，其余小图堆叠）'
                            }
                            labelFor={(k) => (p.images.length >= 2 && k === 0 ? '大图' : `图${k + 1}`)}
                          />
                          {/* 2+ 张时可选大图位置 */}
                          {p.images.length >= 2 && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-white/50">大图位置</span>
                              {(['right', 'left'] as const).map((side) => (
                                <button
                                  key={side}
                                  onClick={() => setProject(i, { bigSide: side })}
                                  className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                                    (p.bigSide ?? 'right') === side
                                      ? 'bg-[#B600A8] text-white'
                                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                                  }`}
                                >
                                  {side === 'right' ? '右侧' : '左侧'}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Resources 模块（卡片数量 + 子模块内容） */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#B600A8]">
                    Resources 模块（{draft.resources.length} 张卡片）
                  </h3>
                  <button
                    onClick={addResource}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
                  >
                    <Plus size={14} /> 添加卡片
                  </button>
                </div>
                <div className="space-y-4">
                  {draft.resources.map((r, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="hero-heading text-lg font-extrabold">{String(i + 1).padStart(2, '0')}</span>
                        <span className="flex items-center gap-1">
                          <MoveButtons index={i} total={draft.resources.length} onMove={(dir) => moveResource(i, dir)} />
                          <button
                            onClick={() => removeResource(i)}
                            aria-label="删除卡片"
                            className="rounded-md p-1.5 text-white/50 hover:bg-red-500/20 hover:text-red-400"
                          >
                            <Trash2 size={15} />
                          </button>
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="资源名" value={r.name} onChange={(v) => setResource(i, { name: v })} />
                        <Field label="分类标签" value={r.category} onChange={(v) => setResource(i, { category: v })} />
                        <div className="sm:col-span-2">
                          <Field label="一句话简介" value={r.desc} onChange={(v) => setResource(i, { desc: v })} />
                        </div>
                        <Field label="配图路径" preview value={r.image} onChange={(v) => setResource(i, { image: v })} />
                        <Field label="跳转链接" value={r.link} onChange={(v) => setResource(i, { link: v })} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { reset(); onClose(); }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
                >
                  <RotateCcw size={15} /> 恢复默认
                </button>
                {/* 导出/导入配置：解决换浏览器 localStorage 为空的问题 */}
                <button
                  onClick={exportJson}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
                >
                  <Download size={15} /> 导出
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
                >
                  <Upload size={15} /> 导入
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) importJson(f);
                    e.target.value = '';
                  }}
                />
              </div>
              <button
                onClick={save}
                style={{
                  backgroundImage:
                    'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
                  outline: '2px solid #FFFFFF',
                  outlineOffset: '-3px',
                }}
                className="inline-flex items-center gap-1.5 rounded-full px-6 py-2 text-sm font-semibold uppercase tracking-wider text-white transition-transform hover:scale-105"
              >
                <Save size={15} /> 保存
              </button>
            </div>
            </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
