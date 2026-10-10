import AnimatedText from '../components/AnimatedText';
import ContactButton from '../components/ContactButton';
import FadeIn from '../components/FadeIn';
import { useContent } from '../context/ContentContext';

export default function AboutSection() {
  const { content } = useContent();
  return (
    <section
      id="about"
      className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-24 text-center md:gap-14"
    >
      <FadeIn y={30}>
        <h2
          className="hero-heading font-black uppercase leading-none"
          style={{ fontSize: 'clamp(3rem, 10vw, 7.5rem)' }}
        >
          {content.about.title}
        </h2>
      </FadeIn>

      <div className="max-w-[560px]">
        <AnimatedText
          text={content.about.text}
          className="text-lg font-light leading-relaxed text-[#D7E2EA] sm:text-xl md:text-2xl"
        />
      </div>

      <FadeIn y={20} delay={0.1}>
        <ContactButton contact={content.contact} />
      </FadeIn>
    </section>
  );
}
