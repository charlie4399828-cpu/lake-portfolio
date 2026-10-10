import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import type { RefObject } from 'react';

interface CharProps {
  char: string;
  progress: MotionValue<number>;
  range: [number, number];
}

/** 单个字符：滚动驱动 opacity 0.2 → 1 */
function Char({ char, progress, range }: CharProps) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  );
}

interface AnimatedTextProps {
  text: string;
  className?: string;
}

export default function AnimatedText({ text, className = '' }: AnimatedTextProps) {
  const ref: RefObject<HTMLParagraphElement> = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'] as const,
  });
  const chars: string[] = Array.from(text);

  return (
    <p ref={ref} className={className}>
      {chars.map((char: string, i: number) => (
        <Char
          key={`${char}-${i}`}
          char={char}
          progress={scrollYProgress}
          range={[i / chars.length, (i + 1) / chars.length]}
        />
      ))}
    </p>
  );
}
