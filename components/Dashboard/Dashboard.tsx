import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, BookOpen, Layers, Code2, Database, Smartphone, Brain, Sparkles, LayoutTemplate, MoreHorizontal, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../../store/userStore';
import { STATIC_TEMPLATES } from '../../lib/staticTemplates';
import { geminiService } from '../../services/geminiService';
import { UserProfile } from '../../types';

const Dashboard: React.FC = () => {
  const { profile, roadmaps, deleteRoadmap, openRoadmap, createRoadmap } = useUserStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customGoal, setCustomGoal] = useState('');

  // Template Icons mapping
  const TemplateIcons: Record<string, any> = {
    frontend: Code2,
    backend: Database,
    mobile: Smartphone,
    softskills: Brain,
  };

  const handleCreateCustom = async () => {
    if (!customGoal.trim() || !profile) return;
    setIsGenerating(true);
    
    try {
        // Create a temporary profile with the custom goal to feed the AI
        const tempProfile: UserProfile = { ...profile, goal: customGoal };
        const roadmapData = await geminiService.generateRoadmap(tempProfile);
        
        const formattedNodes = roadmapData.nodes.map(n => ({
            ...n,
            type: 'custom',
        }));

        createRoadmap(
            customGoal.length > 30 ? customGoal.substring(0, 30) + '...' : customGoal,
            `AI generated roadmap for: ${customGoal}`,
            formattedNodes,
            roadmapData.edges,
            'ai'
        );
        setShowCreateModal(false);
        setCustomGoal('');
    } catch (e) {
        console.error("Error generating roadmap", e);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleUseTemplate = (key: string, title: string, desc: string) => {
    const template = STATIC_TEMPLATES[key];
    if (template) {
        createRoadmap(title, desc, template.nodes, template.edges, 'template');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] p-6 md:p-12 font-sans relative overflow-x-hidden">
        {/* Ambient Background */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{profile?.name}</span>
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Tu tablero de aprendizaje. Gestiona tus roadmaps o crea uno nuevo.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm text-slate-300 font-medium capitalize">{profile?.level} {profile?.role}</span>
                </div>
            </div>

            {/* My Roadmaps Section */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <Layers className="text-emerald-400" />
                    <h2 className="text-2xl font-bold text-white">Mis Roadmaps</h2>
                </div>

                {roadmaps.length === 0 ? (
                    <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-500">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Tu tablero está vacío</h3>
                        <p className="text-slate-400 max-w-md mx-auto mb-6">
                            No has iniciado ningún roadmap aún. Elige una plantilla abajo o crea uno personalizado con IA.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roadmaps.map((map) => (
                            <motion.div 
                                key={map.id}
                                layoutId={map.id}
                                className="group relative bg-slate-900 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-emerald-900/10 flex flex-col h-full"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl border ${map.type === 'ai' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                                        {map.type === 'ai' ? <Sparkles size={20} /> : <LayoutTemplate size={20} />}
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteRoadmap(map.id); }}
                                        className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                
                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{map.title}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">{map.description}</p>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                                        <span>Progreso</span>
                                        <span>{map.progress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500" style={{ width: `${map.progress}%` }} />
                                    </div>
                                    
                                    <button 
                                        onClick={() => openRoadmap(map.id)}
                                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors group-hover:bg-emerald-600"
                                    >
                                        Continuar <ArrowRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* Templates & Tools Section */}
            <section>
                 <div className="flex items-center gap-3 mb-6">
                    <LayoutTemplate className="text-purple-400" />
                    <h2 className="text-2xl font-bold text-white">Explorar & Crear</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Create Custom AI Button */}
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="col-span-1 md:col-span-2 p-6 rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all text-left flex flex-col justify-between group h-[180px]"
                    >
                        <div className="flex justify-between w-full">
                            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl w-fit">
                                <Sparkles size={24} />
                            </div>
                            <span className="text-indigo-400 group-hover:translate-x-1 transition-transform">
                                <ArrowRight size={24} />
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Generar con IA</h3>
                            <p className="text-sm text-indigo-200/60">Crea un plan de estudios a medida basado en cualquier objetivo específico.</p>
                        </div>
                    </button>

                    {/* Static Templates */}
                    {[
                        { id: 'frontend', title: 'Frontend Mastery', desc: 'HTML, CSS, React Ecosystem', icon: Code2, color: 'emerald' },
                        { id: 'backend', title: 'Backend Architect', desc: 'Node.js, Databases, API Design', icon: Database, color: 'blue' },
                        { id: 'mobile', title: 'Mobile Dev', desc: 'React Native & Ecosystem', icon: Smartphone, color: 'cyan' },
                        { id: 'softskills', title: 'Soft Skills', desc: 'Learning & Communication', icon: Brain, color: 'pink' },
                    ].map(t => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.id}
                                onClick={() => handleUseTemplate(t.id, t.title, t.desc)}
                                className="p-6 rounded-2xl border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-700 transition-all text-left flex flex-col justify-between h-[180px]"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${t.color}-500/10 text-${t.color}-400`}>
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-200">{t.title}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>
        </div>

        {/* Create Modal */}
        <AnimatePresence>
            {showCreateModal && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCreateModal(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 m-auto z-50 max-w-lg w-full h-fit bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl"
                    >
                        <button 
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Sparkles size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Nuevo Roadmap IA</h2>
                            <p className="text-slate-400 text-sm mt-2">Dime qué quieres aprender y generaré un plan paso a paso.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Tu Objetivo</label>
                                <textarea 
                                    value={customGoal}
                                    onChange={(e) => setCustomGoal(e.target.value)}
                                    placeholder="Ej: Quiero aprender a crear smart contracts con Solidity..."
                                    className="w-full bg-[#020617] border border-slate-700 rounded-xl p-4 text-white focus:ring-1 focus:ring-indigo-500 outline-none h-32 resize-none"
                                />
                            </div>

                            <button 
                                onClick={handleCreateCustom}
                                disabled={!customGoal.trim() || isGenerating}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                                {isGenerating ? 'Diseñando Plan...' : 'Generar Roadmap'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    </div>
  );
};

export default Dashboard;