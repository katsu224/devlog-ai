import React from 'react';
import { Terminal, Code2, Sparkles, ChevronRight } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[128px]"></div>
      </div>

      <div className="max-w-3xl w-full text-center space-y-8 z-10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Terminal className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            DevLog AI
          </h1>
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold text-slate-100">
          Convierte tus dudas en <span className="text-emerald-400">documentación</span>.
        </h2>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Estudia cualquier tema de programación conversando con una IA socrática. 
          Al terminar, generamos automáticamente un sitio web hermoso con lo que aprendiste.
        </p>

        <div className="pt-8">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-emerald-600 rounded-full hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 focus:ring-offset-slate-900"
          >
            <span className="mr-2 text-lg">Comenzar a Aprender</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            
            <div className="absolute inset-0 rounded-full ring-4 ring-white/10 group-hover:ring-white/20 transition-all"></div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center mb-4">
              <Code2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Mentoría Socrática</h3>
            <p className="text-sm text-slate-400">No recibas respuestas vacías. La IA te guía para que realmente entiendas el código.</p>
          </div>
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Generación Web</h3>
            <p className="text-sm text-slate-400">Transforma tu chat en un artículo HTML5 estilizado listo para tu portafolio.</p>
          </div>
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center mb-4">
              <Terminal className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Historial Local</h3>
            <p className="text-sm text-slate-400">Tus datos se guardan en tu navegador. Privacidad total y acceso rápido.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
