import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Mail, Phone, MessageCircle, Copy, Check } from 'lucide-react';
import type { ContactInfo } from '../data/content';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  contact: ContactInfo;
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 剪贴板不可用时忽略 */
    }
  };
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-3 text-[#D7E2EA]">
        <span className="text-[#B600A8]">{icon}</span>
        <span className="text-xs uppercase tracking-wider opacity-60">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white">{value}</span>
        <button
          onClick={copy}
          aria-label={`复制${label}`}
          className="rounded-md p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

export default function ContactModal({ open, onClose, contact }: ContactModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 遮罩 */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            role="dialog"
            aria-modal
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-md rounded-3xl p-[2px]"
            style={{
              backgroundImage:
                'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
            }}
          >
            <div className="rounded-[calc(1.5rem-2px)] bg-[#0C0C0C] p-6 md:p-8">
              <div className="flex items-center justify-between">
                <h2 className="hero-heading text-2xl font-extrabold uppercase tracking-wide md:text-3xl">
                  联系我
                </h2>
                <button
                  onClick={onClose}
                  aria-label="关闭"
                  className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Row icon={<Mail size={18} />} label="邮箱" value={contact.email} />
                <Row icon={<Phone size={18} />} label="电话" value={contact.phone} />
                <Row icon={<MessageCircle size={18} />} label="微信号" value={contact.wechat} />
              </div>

              <div className="mt-6 flex flex-col items-center">
                <div className="rounded-2xl border-2 border-white/80 bg-white p-2">
                  <img src={contact.qr} alt="微信二维码" className="h-40 w-40 object-contain" />
                </div>
                <p className="mt-3 text-xs uppercase tracking-wider text-[#D7E2EA]/60">
                  扫码添加微信
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
