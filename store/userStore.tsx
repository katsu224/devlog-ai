import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, RoadmapNode, RoadmapEdge, View, NodeData, Session, SavedRoadmap } from '../types';
import { applyNodeChanges, applyEdgeChanges, OnNodesChange, OnEdgesChange, NodeChange, EdgeChange } from 'reactflow';

interface UserContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  
  // Dashboard State
  roadmaps: SavedRoadmap[];
  createRoadmap: (title: string, description: string, nodes: RoadmapNode[], edges: RoadmapEdge[], type: 'ai' | 'template') => void;
  deleteRoadmap: (id: string) => void;
  openRoadmap: (id: string) => void;
  saveActiveRoadmap: (generatedHtml?: string) => void;
  
  // React Flow State (Current Active Roadmap)
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  setRoadmap: (nodes: RoadmapNode[], edges: RoadmapEdge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  
  // Interaction State
  activeNodeId: string | null;
  setActiveNodeId: (id: string | null) => void;
  updateNodeStatus: (id: string, status: NodeData['status']) => void;
  updateNodeChat: (id: string, messages: any[]) => void;
  updateNodeSummary: (id: string, html: string) => void;
  
  // Session State
  currentSession: Session | null;
  updateSession: (updates: Partial<Session>) => void;
  
  view: View;
  setView: (view: View) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  
  // All Saved Roadmaps
  const [roadmaps, setRoadmaps] = useState<SavedRoadmap[]>([]);
  const [activeRoadmapId, setActiveRoadmapId] = useState<string | null>(null);

  // Active Roadmap State (ReactFlow)
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [edges, setEdges] = useState<RoadmapEdge[]>([]);
  
  const [view, setView] = useState<View>(View.WIZARD);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  // Load from local storage
  useEffect(() => {
    const savedProfile = localStorage.getItem('devlog_profile');
    const savedRoadmaps = localStorage.getItem('devlog_roadmaps');

    if (savedProfile) {
      setProfileState(JSON.parse(savedProfile));
      setView(View.DASHBOARD);
    }

    if (savedRoadmaps) {
      setRoadmaps(JSON.parse(savedRoadmaps));
    }
  }, []);

  // Save changes
  useEffect(() => {
    if (profile) localStorage.setItem('devlog_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('devlog_roadmaps', JSON.stringify(roadmaps));
  }, [roadmaps]);

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
  };

  // --- Roadmap Management ---

  const createRoadmap = (title: string, description: string, initialNodes: RoadmapNode[], initialEdges: RoadmapEdge[], type: 'ai' | 'template') => {
    const newRoadmap: SavedRoadmap = {
      id: crypto.randomUUID(),
      title,
      description,
      nodes: initialNodes,
      edges: initialEdges,
      createdAt: Date.now(),
      progress: 0,
      type
    };

    setRoadmaps(prev => [newRoadmap, ...prev]);
    // Automatically open it
    setActiveRoadmapId(newRoadmap.id);
    setNodes(initialNodes);
    setEdges(initialEdges);
    setView(View.ROADMAP);
  };

  const deleteRoadmap = (id: string) => {
    setRoadmaps(prev => prev.filter(r => r.id !== id));
    if (activeRoadmapId === id) {
      setView(View.DASHBOARD);
      setActiveRoadmapId(null);
    }
  };

  const openRoadmap = (id: string) => {
    const roadmap = roadmaps.find(r => r.id === id);
    if (roadmap) {
      setActiveRoadmapId(id);
      setNodes(roadmap.nodes);
      setEdges(roadmap.edges);
      setView(View.ROADMAP);
    }
  };

  const calculateProgress = (currentNodes: RoadmapNode[]) => {
      const total = currentNodes.length;
      if (total === 0) return 0;
      const completed = currentNodes.filter(n => n.data.status === 'completed').length;
      return Math.round((completed / total) * 100);
  };

  const saveActiveRoadmap = (generatedHtml?: string) => {
    if (!activeRoadmapId) return;
    
    setRoadmaps(prev => prev.map(r => {
      if (r.id === activeRoadmapId) {
        return {
          ...r,
          nodes: nodes,
          edges: edges,
          progress: calculateProgress(nodes),
          projectHtml: generatedHtml || r.projectHtml // Keep existing if not provided, or update
        };
      }
      return r;
    }));
  };

  // --- React Flow Logic ---

  const setRoadmap = (newNodes: RoadmapNode[], newEdges: RoadmapEdge[]) => {
    setNodes(newNodes);
    setEdges(newEdges);
  };

  const onNodesChange: OnNodesChange = (changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  const onEdgesChange: OnEdgesChange = (changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  };

  const updateNodeStatus = (id: string, status: NodeData['status']) => {
    setNodes((prevNodes) => {
      let nextNodes = prevNodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, status } };
        }
        return node;
      });

      if (status === 'completed') {
        const connectedTargetIds = edges
          .filter((edge) => edge.source === id)
          .map((edge) => edge.target);

        nextNodes = nextNodes.map((node) => {
          if (connectedTargetIds.includes(node.id) && node.data.status === 'locked') {
             return { ...node, data: { ...node.data, status: 'unlocked' as const } };
          }
          return node;
        });
      }
      return nextNodes;
    });
  };

  const updateNodeChat = (id: string, messages: any[]) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, chatHistory: messages } };
      }
      return node;
    }));
  };

  const updateNodeSummary = (id: string, html: string) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, summaryHtml: html } };
      }
      return node;
    }));
  };

  const updateSession = (updates: Partial<Session>) => {
    setCurrentSession(prev => {
        if (!prev) {
             return {
                id: crypto.randomUUID(),
                title: 'New Session',
                messages: [],
                createdAt: Date.now(),
                includeErrors: false,
                ...updates
             };
        }
        return { ...prev, ...updates };
    });
  };

  return (
    <UserContext.Provider value={{
      profile,
      setProfile,
      roadmaps,
      createRoadmap,
      deleteRoadmap,
      openRoadmap,
      saveActiveRoadmap,
      nodes,
      edges,
      setRoadmap,
      onNodesChange,
      onEdgesChange,
      activeNodeId,
      setActiveNodeId,
      updateNodeStatus,
      updateNodeChat,
      updateNodeSummary,
      currentSession,
      updateSession,
      view,
      setView
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserStore = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUserStore must be used within a UserProvider');
  return context;
};