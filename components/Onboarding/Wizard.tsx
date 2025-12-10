import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Code2, Database, Layers, Smartphone, MoreHorizontal } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { UserProfile, View } from '../../types';

const Wizard: React.FC = () => {
  const { setProfile, setView } = useUserStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    role: 'frontend',
    level: 'mid',
    goal: '' // Goal is technically not needed for initial profile anymore, but kept for type compatibility
  });

  const nextStep = () => setStep(s => s + 1);

  const finishWizard = () => {
      setProfile(formData);
      setView(View.DASHBOARD);
  };

  const Step1Name = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
        Bienvenido a DevLog AI
      </h2>
      <p className="text-slate-400">Antes de empezar, ¿cómo te llamas?</p>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Tu nombre..."
        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
        autoFocus
      />
      <button
        onClick={nextStep}
        disabled={!formData.name}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        Continuar <ChevronRight size={18} />
      </button>
    </div>
  );

  const Step2Role = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">¿Cuál es tu enfoque principal?</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { id: 'frontend', label: 'Frontend', icon: Code2 },
          { id: 'backend', label: 'Backend', icon: Database },
          { id: 'fullstack', label: 'Fullstack', icon: Layers },
          { id: 'mobile', label: 'Mobile', icon: Smartphone },
          { id: 'other', label: 'General / Otro', icon: MoreHorizontal },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setFormData({ ...formData, role: item.id as any });
              nextStep();
            }}
            className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center ${
              formData.role === item.id
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const Step3Level = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">¿Cuál es tu nivel actual?</h2>
      <div className="space-y-3">
        {[
          { id: 'junior', label: 'Junior / Principiante', desc: 'Entiendo lo básico, quiero aprender más.' },
          { id: 'mid', label: 'Mid-Level', desc: 'Puedo construir cosas, busco mejores prácticas.' },
          { id: 'senior', label: 'Senior / Experto', desc: 'Busco arquitectura avanzada y optimización.' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setFormData({ ...formData, level: item.id as any });
              finishWizard(); // Finish after level selection
            }}
            className="w-full text-left p-4 rounded-xl border bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 transition-all"
          >
            <div className="font-medium text-white">{item.label}</div>
            <div className="text-sm text-slate-500">{item.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full glass-panel rounded-3xl p-8 md:p-12 relative z-10 shadow-2xl border border-white/5"
      >
        <div className="mb-8 flex justify-between items-center">
            <div className="flex space-x-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-700'}`} />
                ))}
            </div>
            <span className="text-xs text-slate-500 font-mono">STEP {step}/3</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && <Step1Name />}
            {step === 2 && <Step2Role />}
            {step === 3 && <Step3Level />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Wizard;