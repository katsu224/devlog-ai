import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { geminiService } from '../../services/geminiService';
import { Check, Lock, ChevronRight, Play, Globe, Github, Hammer, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

const PreviewPanel: React.FC = () => {
  const { nodes, currentSession, updateSession } = useUserStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'preview'>('roadmap');

  const handleGenerate = async () => {
    if (!currentSession) return;
    
    setIsGenerating(true);
    setActiveTab('preview');
    
    try {
      const html = await geminiService.generateSummaryHtml(
          currentSession.messages, 
          currentSession.includeErrors
      );
      updateSession({ generatedHtml: html });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const RoadmapView = () => (
    <div className="p-8">
      <h2 className="text-xl font-bold text-white mb-6">Learning Path</h2>
      <div className="space-y-4">
        {nodes.map((item, idx) => (
          <div key={item.id} className={`relative pl-8 pb-8 border-l ${idx === nodes.length - 1 ? 'border-transparent' : 'border-slate-800'}`}>
            <div className={`absolute left-[-10px] top-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                item.data.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-black' :
                item.data.status === 'active' ? 'bg-[#0B0C10] border-emerald-500 text-emerald-500' :
                'bg-[#0B0C10] border-slate-700 text-slate-700'
            }`}>
                {item.data.status === 'completed' && <Check size={12} strokeWidth={3} />}
                {item.data.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                {item.data.status === 'locked' && <Lock size={10} />}
            </div>
            
            <div className={`transition-all ${item.data.status === 'locked' ? 'opacity-50 blur-[0.5px]' : 'opacity-100'}`}>
                <h3 className="font-semibold text-slate-200 text-lg mb-1">{item.data.label}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.data.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-slate-900/50 rounded-xl border border-slate-800">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
                <Terminal className="text-emerald-400" size={20} />
            </div>
            <div>
                <h4 className="font-medium text-white">Sesión Activa</h4>
                <p className="text-xs text-slate-400">El tutor está registrando tu progreso.</p>
            </div>
        </div>
        <button 
            onClick={handleGenerate}
            disabled={!currentSession || currentSession.messages.length < 3}
            className="w-full py-3 bg-slate-100 hover:bg-white text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Play size={16} fill="currentColor" />
            Generar Web & Preview
        </button>
      </div>
    </div>
  );

  const GeneratorView = () => {
    if (isGenerating) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                    <div className="absolute inset-0 border-t-4 border-emerald-500 rounded-full animate-spin"></div>
                    <Code2Icon className="absolute inset-0 m-auto text-emerald-500 animate-pulse" size={32} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Compiling Knowledge...</h3>
                    <p className="text-sm text-slate-500 font-mono mt-2">
                        Writing HTML5... <br/>
                        Applying Tailwind styles... <br/>
                        Documenting errors...
                    </p>
                </div>
            </div>
        );
    }

    if (!currentSession?.generatedHtml) return null;

    return (
        <div className="h-full flex flex-col">
            <div className="h-12 border-b border-slate-800 flex items-center justify-between px-4 bg-[#0d1117]">
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    localhost:3000
                </div>
                <div className="flex gap-2">
                    <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 transition-colors" title="Deploy to Vercel">
                        <div className="w-4 h-4 text-white font-bold flex items-center justify-center">▲</div>
                    </button>
                    <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 transition-colors" title="Push to GitHub">
                        <Github size={16} />
                    </button>
                </div>
            </div>
            <iframe 
                srcDoc={currentSession.generatedHtml}
                className="flex-1 w-full bg-white"
                title="Preview"
                sandbox="allow-scripts"
            />
        </div>
    );
  };

  return (
    <div className="h-full bg-[#050608] border-l border-white/5 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-white/5">
        <button 
            onClick={() => setActiveTab('roadmap')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'roadmap' ? 'border-emerald-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
            Roadmap
        </button>
        <button 
             onClick={() => setActiveTab('preview')}
             className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'preview' ? 'border-emerald-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
            Web Preview
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'roadmap' ? <RoadmapView /> : <GeneratorView />}
      </div>
    </div>
  );
};

// Helper icon
const Code2Icon = ({ className, size }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
);

export default PreviewPanel;