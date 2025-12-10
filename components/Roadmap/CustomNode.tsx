import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Lock, Play, CheckCircle, BookOpen } from 'lucide-react';
import { NodeData } from '../../types';

const CustomNode = ({ data, selected }: NodeProps<NodeData>) => {
  const { label, status } = data;

  const getStatusStyles = () => {
    switch (status) {
      case 'locked':
        return 'border-slate-700 bg-slate-900/50 text-slate-500 opacity-60 cursor-not-allowed';
      case 'unlocked':
        return 'border-emerald-500/50 bg-slate-900 text-white shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)] hover:border-emerald-400';
      case 'active':
        return 'border-emerald-400 bg-slate-900 text-white shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)] ring-2 ring-emerald-500/20 ring-offset-2 ring-offset-slate-950 animate-pulse-slow';
      case 'completed':
        return 'border-cyan-500 bg-slate-900 text-cyan-50 shadow-[0_0_15px_-3px_rgba(6,182,212,0.2)]';
      default:
        return 'border-slate-700 bg-slate-900';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'locked': return <Lock size={14} />;
      case 'unlocked': return <Play size={14} fill="currentColor" />;
      case 'active': return <BookOpen size={14} />;
      case 'completed': return <CheckCircle size={14} className="text-cyan-400" />;
    }
  };

  return (
    <div className="relative group">
      {/* Glow Effect */}
      {status !== 'locked' && (
        <div className={`absolute -inset-0.5 rounded-lg blur opacity-30 transition duration-1000 group-hover:opacity-70 ${
            status === 'completed' ? 'bg-cyan-500' : 'bg-emerald-500'
        }`} />
      )}
      
      <div 
        className={`relative min-w-[200px] px-4 py-3 rounded-lg border-2 transition-all duration-300 flex items-center justify-between gap-3 ${getStatusStyles()} ${selected ? 'scale-105' : ''}`}
      >
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-wide">{label}</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
            {status}
          </span>
        </div>
        
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
           status === 'locked' ? 'bg-slate-800 border-slate-700' : 
           status === 'completed' ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' :
           'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
        }`}>
          {getIcon()}
        </div>

        {/* Connection Handles */}
        <Handle type="target" position={Position.Top} className="!bg-slate-500 !w-2 !h-1 !rounded-none !border-none" />
        <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !w-2 !h-1 !rounded-none !border-none" />
      </div>
    </div>
  );
};

export default memo(CustomNode);
