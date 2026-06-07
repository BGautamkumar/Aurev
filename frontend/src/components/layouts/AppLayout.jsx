import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NavRail from '../organisms/NavRail';


const pageVariants = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.98, y: -10, transition: { duration: 0.1, ease: [0.22, 1, 0.36, 1] } }
};

const AppLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-surface-base text-text font-sans">
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-surface-base">
        {/* Base noise texture for minimal luxury (very subtle) */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />
        
        {/* Subtle cinematic radial light - top left */}
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent/5 blur-[120px] animate-ambient-shift mix-blend-[var(--ambient-overlay,screen)]" />
        
        {/* Subtle cinematic radial light - bottom right */}
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/3 blur-[100px] animate-ambient-shift mix-blend-[var(--ambient-overlay,screen)]" style={{ animationDelay: '-15s' }} />
      </div>
      <NavRail />
      <main className="flex-1 h-full relative overflow-hidden flex p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-4 pl-0 md:pl-4">
        {/* We wrap the content in a div to manage the internal layout margins */}
        <div className="w-full h-full max-w-[1200px] mx-auto relative rounded-2xl overflow-hidden bg-surface/30 backdrop-blur-md border border-default shadow-spatial-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              className="w-full h-full relative overflow-hidden"
            >
              {children || <Outlet />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
