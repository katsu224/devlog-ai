import React from 'react';
import { Plus, Clock, FileCode, Trash2, ArrowRight } from 'lucide-react';
import { Session } from '../types';

interface DashboardProps {
  sessions: Session[];
  onNewSession: () => void;
  onOpenSession: (session: Session) => void;
  onDeleteSession: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ sessions, onNewSession, onOpenSession, onDeleteSession }) => {
  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tu Espacio de Aprendizaje</h1>
            <p className="text-slate-400">Administra tus sesiones de estudio y repasa tus notas.</p>
          </div>
          <button
            onClick={onNewSession}
            className="flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Sesión
          </button>
        </header>

        {sessions.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-6">
              <FileCode className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No hay sesiones todavía</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Empieza una nueva conversación con la IA para estudiar un tema. Al finalizar, verás aquí tus resultados.
            </p>
            <button
              onClick={onNewSession}
              className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline"
            >
              Crear mi primera sesión &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div 
                key={session.id}
                className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/10"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 group-hover:border-emerald-500/30 transition-colors">
                    <FileCode className="w-6 h-6 text-emerald-500" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="p-2 text-slate-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                    title="Eliminar sesión"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                  {session.title || 'Sesión sin título'}
                </h3>
                
                <div className="flex items-center text-xs text-slate-500 mb-6">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  {new Date(session.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>

                <button
                  onClick={() => onOpenSession(session)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm text-slate-300 transition-colors group-hover:text-white"
                >
                  <span>Continuar / Ver</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
