import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, X, Globe, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserStore } from '../../store/userStore';
import { geminiService } from '../../services/geminiService';

interface RoadmapGeneratorProps {
  onClose: () => void;
}

const RoadmapGenerator: React.FC<RoadmapGeneratorProps> = ({ onClose }) => {
  const { nodes, profile, updateNodeSummary, saveActiveRoadmap, roadmaps } = useUserStore();
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');

  // Find the current roadmap to check if we already have a generated project
  const currentRoadmap = roadmaps.find(r => r.nodes === nodes); // This might be loose comparison, better if we passed roadmapID but store handles active state
  // We can just rely on local state generation for now, and save it on back.
  
  const completedNodes = nodes.filter(n => n.data.status === 'completed');

  useEffect(() => {
    // Attempt to load existing HTML from the current active roadmap found in the store list
    // Since 'nodes' is just the array, we check if we have a saved version in the store wrapper
    // Actually, let's just generate. If the user clicked "Generate", they want to see it.
    // If we have previous HTML in the saved roadmap, we could show it, but for this component, 
    // let's follow the "Incremental Check" pattern immediately.
    
    if (completedNodes.length > 0) {
        runIncrementalGeneration();
    }
  }, []);

  const runIncrementalGeneration = async () => {
    if (completedNodes.length === 0) return;
    setLoading(true);
    setError('');
    
    try {
        if (!profile) throw new Error("Perfil no encontrado");

        // 1. Check/Generate Summary for each completed node
        for (const node of completedNodes) {
            if (!node.data.summaryHtml) {
                setLoadingStep(`Analizando módulo: ${node.data.label}...`);
                const summaryHtml = await geminiService.generateModuleSummary(node);
                updateNodeSummary(node.id, summaryHtml);
                // Artificial delay to prevent rate limits and show progress
                await new Promise(r => setTimeout(r, 800)); 
            }
        }

        // 2. Assemble final project
        setLoadingStep("Ensamblando tu sitio web...");
        // Fetch fresh nodes from store? The 'nodes' prop might be stale if we just called updateNodeSummary?
        // updateNodeSummary updates the store, but this component's 'nodes' prop comes from the hook.
        // It should update automatically via React re-render. 
        // However, inside this async function, 'completedNodes' is a closure capture.
        // We need to re-read the nodes or optimistically use the summaries we just got.
        
        // Let's pass the updated list manually to the assembler to be safe
        const updatedNodes = completedNodes.map(n => ({
            ...n,
            data: {
                ...n.data,
                // If we just generated it, use that, otherwise use existing. 
                // Since we can't easily access the string we just generated inside the map without local storage,
                // we rely on the fact that if it was there, good. If we generated it, we have it in the loop.
                // Actually, let's just re-fetch the store nodes via a ref or trust React?
                // Safest approach: The loop updated the store. React will re-render this component.
                // We should put the 'Assemble' part in a useEffect that triggers when all completed nodes have summaries?
                // No, simpler: Just re-query or pass the strings.
            }
        }));
        
        // Since we can't await state updates in the middle of a function easily:
        // We will do a second pass using the data we have in hand (or wait for re-render).
        // Let's rely on the store update being fast enough or just re-generate the assembly (it's cheap context-wise).
        
        // Actually, let's pause and let the user click "Generate" again if we want to be pure, 
        // OR better: Just pass the nodes as they are (React state might not have propagated to 'nodes' variable in this scope yet).
        // We need to fetch the summaries we just made.
        
        // FIX: We can't rely on `nodes` variable updating mid-function. 
        // We will assume the summaries are now in the store. We'll call assemble with the *current* known state + new summaries.
        
        const nodesForAssembly = [...nodes]; // Clone
        // We need to make sure the summaries are attached.
        // Since we can't easily get them back from `updateNodeSummary` return, 
        // let's just re-run the `completedNodes` loop but keeping the results in a local map.
        
        const nodesWithSummaries = await Promise.all(completedNodes.map(async (n) => {
            if (n.data.summaryHtml) return n;
            // Generate
            setLoadingStep(`Generando resumen: ${n.data.label}...`);
            const html = await geminiService.generateModuleSummary(n);
            updateNodeSummary(n.id, html); // Save for future
            return { ...n, data: { ...n.data, summaryHtml: html } };
        }));

        setLoadingStep("Diseñando portafolio...");
        const finalHtml = await geminiService.assembleProjectWeb(nodesWithSummaries, profile);
        setHtml(finalHtml);
        
        // Save result to roadmap
        saveActiveRoadmap(finalHtml);

    } catch (e: any) {
        console.error(e);
        setError(e.message || "Error generando el sitio web.");
    } finally {
        setLoading(false);
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mi-portafolio-devlog.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (completedNodes.length === 0) {
      return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md text-center">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Sin Módulos Completados</h3>
                <p className="text-slate-400 mb-6">
                    Necesitas completar al menos un módulo (aprobar el examen) antes de generar tu sitio web.
                </p>
                <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                    Volver al Roadmap
                </button>
            </div>
        </div>
      );
  }

  return (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col"
    >
        {/* Header */}
        <div className="h-16 border-b border-slate-800 bg-[#020617] flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <Globe size={20} />
                </div>
                <div>
                    <h2 className="font-bold text-white">Generador Web de Portafolio</h2>
                    <p className="text-xs text-slate-500">{completedNodes.length} Módulos Completados</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={runIncrementalGeneration} 
                    disabled={loading}
                    className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Regenerar todo"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
                <button 
                    onClick={downloadHtml}
                    disabled={!html || loading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    <Download size={18} />
                    Descargar HTML
                </button>
                <div className="w-px h-6 bg-slate-800 mx-2" />
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors">
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative bg-[#0f172a]">
            {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <div className="relative w-24 h-24 mb-8">
                        <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
                        <div className="absolute inset-0 border-t-4 border-purple-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Globe className="text-purple-500 animate-pulse" size={32} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Construyendo tu Sitio Web</h3>
                    <p className="text-purple-400 animate-pulse font-medium">{loadingStep}</p>
                    <p className="text-slate-500 text-sm mt-4 max-w-md">
                        Estamos generando código HTML incremental para ahorrar recursos y tiempo.
                    </p>
                </div>
            ) : error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400">
                    <AlertTriangle size={48} className="mb-4" />
                    <p className="text-lg font-medium">{error}</p>
                    <button onClick={runIncrementalGeneration} className="mt-4 px-6 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-white">
                        Intentar de nuevo
                    </button>
                </div>
            ) : (
                <iframe 
                    srcDoc={html} 
                    className="w-full h-full border-0 bg-white"
                    title="Portfolio Preview"
                    sandbox="allow-scripts"
                />
            )}
        </div>
    </motion.div>
  );
};

export default RoadmapGenerator;