import React, { useEffect, useState } from 'react';
import { Download, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { Session } from '../types';
import { geminiService } from '../services/geminiService';

interface WebGeneratorProps {
  session: Session;
  onUpdateSession: (updatedSession: Session) => void;
  onBack: () => void;
}

const WebGenerator: React.FC<WebGeneratorProps> = ({ session, onUpdateSession, onBack }) => {
  const [html, setHtml] = useState<string>(session.generatedHtml || '');
  const [loading, setLoading] = useState(!session.generatedHtml);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session.generatedHtml) {
      generateSite();
    }
  }, []);

  const generateSite = async () => {
    setLoading(true);
    setError('');
    try {
      const generated = await geminiService.generateSummaryHtml(session.messages, session.includeErrors);
      setHtml(generated);
      onUpdateSession({ ...session, generatedHtml: generated });
    } catch (err) {
      console.error(err);
      setError('Hubo un error generando el sitio web. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devlog-${session.id.slice(0, 8)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shadow-md z-10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-semibold text-white">Vista Previa del Generador</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={generateSite}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Regenerar"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={downloadHtml}
            disabled={loading || !html}
            className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar HTML
          </button>
        </div>
      </header>

      <div className="flex-1 bg-slate-950 relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
            <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
            <p className="animate-pulse">Transformando conocimiento en código...</p>
            <p className="text-sm text-slate-500 mt-2">Esto puede tomar unos segundos</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400">
            <p className="mb-4">{error}</p>
            <button 
              onClick={generateSite} 
              className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-white"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="w-full h-full p-4 md:p-8">
            <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-800">
              <iframe 
                srcDoc={html} 
                className="w-full h-full border-0" 
                title="Preview"
                sandbox="allow-scripts" 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebGenerator;