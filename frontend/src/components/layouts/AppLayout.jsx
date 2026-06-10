import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NavRail from '../organisms/NavRail';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
  },
};

const AppLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: 'var(--base)', color: 'var(--text-primary)' }}>

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden" style={{ background: 'var(--base)' }}>
        {/* Noise texture */}
        <div className="absolute inset-0 charged-noise" />

        {/* Ambient mesh — barely perceptible blue, landing page DNA */}
        <div
          className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full animate-mesh-shift"
          style={{
            background: 'radial-gradient(circle, rgba(37,99,235,0.03) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Second mesh — bottom left, indigo hint */}
        <div
          className="absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] rounded-full animate-mesh-shift"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.02) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animationDelay: '-15s',
          }}
        />
      </div>

      <NavRail />

      {/* Main Content — full bleed, pages control their own backgrounds */}
      <main className="flex-1 h-full relative overflow-hidden flex flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
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
      </main>
    </div>
  );
};

export default AppLayout;
