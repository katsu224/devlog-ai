import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Cpu, Download, Sparkles } from 'lucide-react';
import { Message, Session } from '../types';
import { geminiService } from '../services/geminiService';
import { useUserStore } from '../store/userStore';

interface ChatInterfaceProps {
  session: Session;
  onUpdateSession: (updatedSession: Session) => void;
  onBack: () => void;
  onFinish: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ session, onUpdateSession, onBack, onFinish }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile } = useUserStore();

  useEffect(() => {
    // Initialize AI context with history
    if (profile) {
      geminiService.startChat(session.messages, profile);
    }
    scrollToBottom();
  }, [profile]);

  useEffect(() => {
    scrollToBottom();
  }, [session.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    const updatedMessages = [...session.messages, userMsg];
    
    // Determine title if it's the first user message
    let updatedTitle = session.title;
    if (session.messages.length === 0) {
      updatedTitle = input.substring(0, 30) + (input.length > 30 ? '...' : '');
    }

    onUpdateSession({
      ...session,
      title: updatedTitle,
      messages: updatedMessages
    });

    setInput('');
    setIsTyping(true);

    try {
      // Create a placeholder for the AI response
      const aiMsgPlaceholder: Message = {
        role: 'model',
        text: '',
        timestamp: Date.now()
      };
      
      // Temporary state for streaming update
      let currentAiText = '';
      
      // We don't save the placeholder to global session state yet to avoid partial saves if we wanted, 
      // but here we want to show it immediately.
      // Ideally we would update the session state incrementally or use local state.
      // Let's use local state for the streaming part or just update the session frequently.
      // For simplicity in this demo, we'll wait for the full response to save to session storage via prop,
      // but we update a local view of messages? 
      // Actually, passing functional updates to onUpdateSession is safer.
      
      const stream = await geminiService.sendMessageStream(userMsg.text);
      
      for await (const chunk of stream) {
        currentAiText += chunk;
        onUpdateSession({
          ...session,
          title: updatedTitle,
          messages: [...updatedMessages, { ...aiMsgPlaceholder, text: currentAiText }]
        });
      }
      
    } catch (error) {
      console.error("Error communicating with AI:", error);
      const errorMsg: Message = {
        role: 'model',
        text: 'Lo siento, hubo un error al conectar con el tutor. Por favor intenta de nuevo.',
        timestamp: Date.now()
      };
      onUpdateSession({
        ...session,
        title: updatedTitle,
        messages: [...updatedMessages, errorMsg]
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-semibold text-white">{session.title || 'Nueva Sesión'}</h2>
            <div className="flex items-center text-xs text-emerald-400">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Tutor Activo
            </div>
          </div>
        </div>
        
        <button
          onClick={onFinish}
          disabled={session.messages.length < 2 || isTyping}
          className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-emerald-900/20"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Terminar y Generar Web
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {session.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-4 opacity-50">
            <Cpu className="w-12 h-12" />
            <p>Saluda al tutor para comenzar. <br/> Ejemplo: "Quiero aprender sobre React Hooks"</p>
          </div>
        )}
        
        {session.messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-4 text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-900/10' 
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-5 py-4">
               <div className="flex space-x-1.5">
                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></div>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu duda o respuesta aquí..."
            className="w-full bg-slate-950 text-white placeholder-slate-500 border border-slate-800 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none max-h-32"
            rows={1}
            style={{ minHeight: '50px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 bottom-2 p-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">
          La IA puede cometer errores. Verifica la información importante.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;