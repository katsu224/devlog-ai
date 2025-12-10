import React from 'react';
import { UserProvider, useUserStore } from './store/userStore';
import { View } from './types';
import Wizard from './components/Onboarding/Wizard';
import RoadmapCanvas from './components/Roadmap/RoadmapCanvas';
import Dashboard from './components/Dashboard/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';

const Main: React.FC = () => {
  const { view } = useUserStore();

  return (
    <AnimatePresence mode="wait">
      {view === View.WIZARD && (
        <motion.div
            key="wizard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
        >
            <Wizard />
        </motion.div>
      )}
      
      {view === View.DASHBOARD && (
        <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
        >
            <Dashboard />
        </motion.div>
      )}

      {view === View.ROADMAP && (
        <motion.div
            key="roadmap"
            initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, ease: "circOut" }}
        >
            <RoadmapCanvas />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function App() {
  return (
    <UserProvider>
      <Main />
    </UserProvider>
  );
}

export default App;