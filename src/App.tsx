import { useEffect, useState } from 'react';
import LakeSection from './sections/LakeSection';
import MarqueeSection from './sections/MarqueeSection';
import AboutSection from './sections/AboutSection';
import ProjectsSection from './sections/ProjectsSection';
import ResourcesSection from './sections/ResourcesSection';
import ProjectDetail from './sections/ProjectDetail';
import Starfield from './components/Starfield';
import BackToTop from './components/BackToTop';
import { ContentProvider, useContent } from './context/ContentContext';

function parseRoute(): number | null {
  const m = window.location.hash.match(/^#\/project\/(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

function Home() {
  const { content } = useContent();
  const [route, setRoute] = useState<number | null>(() => parseRoute());

  useEffect(() => {
    const onHash = () => {
      setRoute(parseRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const openProject = (i: number) => {
    window.location.hash = `#/project/${i}`;
  };
  const goHome = () => {
    window.location.hash = '';
  };

  const detail = route !== null ? content.projects[route] : null;

  return (
    <>
      <Starfield />
      {detail ? (
        <ProjectDetail project={detail} index={route!} onBack={goHome} />
      ) : (
        <main className="relative z-10 overflow-x-clip">
          <LakeSection />
          <MarqueeSection />
          <AboutSection />
          <ProjectsSection onOpen={openProject} />
          <ResourcesSection />
        </main>
      )}
      <BackToTop />
    </>
  );
}

export default function App() {
  return (
    <ContentProvider>
      <Home />
    </ContentProvider>
  );
}
