import React, { useMemo, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  BackgroundVariant,
  NodeTypes
} from 'reactflow';
import { ArrowLeft, Globe } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { View } from '../../types';
import CustomNode from './CustomNode';
import NodeChatSheet from './NodeChatSheet';
import RoadmapGenerator from './RoadmapGenerator';

const RoadmapCanvas: React.FC = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, setActiveNodeId, setView, saveActiveRoadmap } = useUserStore();
  const [showGenerator, setShowGenerator] = useState(false);

  const nodeTypes: NodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const handleNodeClick = (_: React.MouseEvent, node: any) => {
    if (node.data.status !== 'locked') {
        setActiveNodeId(node.id);
    }
  };

  const handleBack = () => {
      saveActiveRoadmap();
      setView(View.DASHBOARD);
  };

  return (
    <div className="w-screen h-screen bg-slate-950 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#334155', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={1.5} 
            color="#334155" 
            className="bg-slate-950"
        />
        <Controls className="bg-slate-800 border-slate-700 fill-white" />
        <MiniMap 
            nodeColor={(n) => {
                if (n.data.status === 'completed') return '#06b6d4'; // cyan
                if (n.data.status === 'active') return '#10b981'; // emerald
                return '#334155'; // slate
            }}
            className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden"
            maskColor="rgba(2, 6, 23, 0.7)"
        />
      </ReactFlow>

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start pointer-events-none">
         <div className="flex items-center gap-4 pointer-events-auto">
             <button 
                onClick={handleBack}
                className="p-3 bg-slate-900/80 backdrop-blur hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl transition-all"
             >
                 <ArrowLeft size={20} />
             </button>
             <h1 className="text-xl font-bold text-white bg-slate-950/50 backdrop-blur px-4 py-2.5 rounded-xl border border-white/5">
                 My Roadmap
             </h1>
         </div>

         <button 
            onClick={() => setShowGenerator(true)}
            className="pointer-events-auto flex items-center gap-2 px-5 py-3 bg-purple-600/90 hover:bg-purple-600 backdrop-blur text-white font-semibold rounded-xl shadow-lg shadow-purple-900/20 transition-all border border-purple-500/50"
         >
             <Globe size={18} />
             Generate Portfolio Web
         </button>
      </div>

      <NodeChatSheet />
      {showGenerator && <RoadmapGenerator onClose={() => setShowGenerator(false)} />}
    </div>
  );
};

export default RoadmapCanvas;