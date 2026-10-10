import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import ContactModal from './ContactModal';
import type { ContactInfo } from '../data/content';

interface ContactButtonProps {
  contact: ContactInfo;
  className?: string;
}

export default function ContactButton({ contact, className = '' }: ContactButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          backgroundImage:
            'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
          boxShadow:
            'inset 0 2px 10px rgba(0, 0, 0, 0.45), inset 0 -2px 6px rgba(255, 255, 255, 0.15)',
          outline: '2px solid #FFFFFF',
          outlineOffset: '-3px',
        }}
        className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition-transform duration-200 hover:scale-105 active:scale-95 sm:px-9 sm:py-3.5 sm:text-sm md:px-11 md:py-4 md:text-base ${className}`}
      >
        联系我
        <ArrowUpRight className="h-3.5 w-3.5 md:h-5 md:w-5" strokeWidth={2.5} />
      </button>
      <ContactModal open={open} onClose={() => setOpen(false)} contact={contact} />
    </>
  );
}
