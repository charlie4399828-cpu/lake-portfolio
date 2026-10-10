import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Trash2, RotateCcw, Save, LockKeyhole } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import type { SiteContent } from '../data/content';

interface EditorModalProps {
  open: boolean;
  onClose: () => void;
}

const inputCls =
  'w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#B600A8]';
const labelCls = 'mb-1 block text-xs uppercase tracking-wider text-white/50';

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {textarea ? (
        <textarea rows={3} className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

const EDIT_PASSWORD = '763560';

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
          col1: [d.projects[0]?.col1[0] ?? '', d.projects[0]?.col1[1] ?? ''],
          col2: d.projects[0]?.col2 ?? '',
          desc: '项目简介',
          detail: '项目详情',
          tags: ['React'],
        },
      ],
    }));

  const removeProject = (i: number) =>
    setDraft((d) => ({ ...d, projects: d.projects.filter((_, idx) => idx !== i) }));

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

  const save = () => {
    update(draft);
    onClose();
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
                  <Field label="二维码路径" value={draft.contact.qr} onChange={(v) => set('contact', { ...draft.contact, qr: v })} />
                </div>
              </section>

              {/* Hero 模块 */}
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#B600A8]">Hero 模块</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="大标题" value={draft.hero.title} onChange={(v) => set('hero', { ...draft.hero, title: v })} />
                  <Field label="左下角小字" value={draft.hero.tagline} onChange={(v) => set('hero', { ...draft.hero, tagline: v })} />
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
                        <button
                          onClick={() => removeProject(i)}
                          aria-label="删除卡片"
                          className="rounded-md p-1.5 text-white/50 hover:bg-red-500/20 hover:text-red-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="项目名" value={p.name} onChange={(v) => setProject(i, { name: v })} />
                        <Field label="卡片小字" value={p.desc} onChange={(v) => setProject(i, { desc: v })} />
                        <div className="sm:col-span-2">
                          <Field label="详情页内容" textarea value={p.detail} onChange={(v) => setProject(i, { detail: v })} />
                        </div>
                        <Field label="左图1" value={p.col1[0]} onChange={(v) => setProject(i, { col1: [v, p.col1[1]] })} />
                        <Field label="左图2" value={p.col1[1]} onChange={(v) => setProject(i, { col1: [p.col1[0], v] })} />
                        <div className="sm:col-span-2">
                          <Field label="右侧高图" value={p.col2} onChange={(v) => setProject(i, { col2: v })} />
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
                        <button
                          onClick={() => removeResource(i)}
                          aria-label="删除卡片"
                          className="rounded-md p-1.5 text-white/50 hover:bg-red-500/20 hover:text-red-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="资源名" value={r.name} onChange={(v) => setResource(i, { name: v })} />
                        <Field label="分类标签" value={r.category} onChange={(v) => setResource(i, { category: v })} />
                        <div className="sm:col-span-2">
                          <Field label="一句话简介" value={r.desc} onChange={(v) => setResource(i, { desc: v })} />
                        </div>
                        <Field label="配图路径" value={r.image} onChange={(v) => setResource(i, { image: v })} />
                        <Field label="跳转链接" value={r.link} onChange={(v) => setResource(i, { link: v })} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
              <button
                onClick={() => { reset(); onClose(); }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
              >
                <RotateCcw size={15} /> 恢复默认
              </button>
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
