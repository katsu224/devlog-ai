import { Node, Edge } from 'reactflow';

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  includeErrors: boolean;
  generatedHtml?: string;
}

export interface UserProfile {
  name: string;
  role: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'other';
  level: 'junior' | 'mid' | 'senior';
  goal: string;
}

export interface ExamData {
  question: string;
  type: 'code' | 'concept';
}

export interface ExamResult {
  passed: boolean;
  feedback: string;
}

// Data specific to our learning nodes
export interface NodeData {
  label: string;
  status: 'locked' | 'unlocked' | 'active' | 'completed';
  description?: string;
  chatHistory?: Message[];
  summaryHtml?: string; // Cache for the generated HTML card of this module
}

export type RoadmapNode = Node<NodeData>;
export type RoadmapEdge = Edge;

export interface RoadmapData {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

export interface SavedRoadmap {
  id: string;
  title: string;
  description: string;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  createdAt: number;
  progress: number; // 0-100
  type: 'ai' | 'template';
  templateId?: string;
  projectHtml?: string; // Persist the final generated website
}

export enum View {
  WIZARD = 'WIZARD',
  DASHBOARD = 'DASHBOARD',
  ROADMAP = 'ROADMAP'
}