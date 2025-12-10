import { RoadmapNode, RoadmapEdge } from '../types';

export const STATIC_TEMPLATES: Record<string, { nodes: RoadmapNode[], edges: RoadmapEdge[] }> = {
  frontend: {
    nodes: [
      { id: '1', type: 'custom', position: { x: 250, y: 0 }, data: { label: 'HTML5 & CSS3 Architecture', status: 'unlocked', description: 'Semantic HTML, CSS Grid, Flexbox, and responsive design patterns.' } },
      { id: '2', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'JavaScript ES6+ Mastery', status: 'locked', description: 'Closures, Async/Await, Modules, and DOM manipulation.' } },
      { id: '3', type: 'custom', position: { x: 250, y: 300 }, data: { label: 'Modern React Framework', status: 'locked', description: 'Hooks, Context API, and State Management.' } },
      { id: '4', type: 'custom', position: { x: 250, y: 450 }, data: { label: 'Advanced State & Performance', status: 'locked', description: 'Redux/Zustand, Memoization, and code splitting.' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
    ]
  },
  backend: {
    nodes: [
      { id: '1', type: 'custom', position: { x: 250, y: 0 }, data: { label: 'Node.js Internals', status: 'unlocked', description: 'Event Loop, Streams, and Buffer handling.' } },
      { id: '2', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'API Design (REST & GraphQL)', status: 'locked', description: 'Designing scalable and secure endpoints.' } },
      { id: '3', type: 'custom', position: { x: 250, y: 300 }, data: { label: 'Database Architectures', status: 'locked', description: 'SQL vs NoSQL modeling, indexing, and transactions.' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
    ]
  },
  mobile: {
    nodes: [
      { id: '1', type: 'custom', position: { x: 250, y: 0 }, data: { label: 'React Native Core', status: 'unlocked', description: 'Components, styling, and native platform differences.' } },
      { id: '2', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Navigation & Gestures', status: 'locked', description: 'React Navigation and Reanimated.' } },
      { id: '3', type: 'custom', position: { x: 250, y: 300 }, data: { label: 'Native Modules', status: 'locked', description: 'Bridging native code (Swift/Kotlin) with JS.' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
    ]
  },
  softskills: {
    nodes: [
      { id: '1', type: 'custom', position: { x: 250, y: 0 }, data: { label: 'Learning to Learn', status: 'unlocked', description: 'Techniques like Feynman, Spaced Repetition, and Active Recall.' } },
      { id: '2', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Technical Communication', status: 'locked', description: 'Writing documentation, RFCs, and code review etiquette.' } },
      { id: '3', type: 'custom', position: { x: 250, y: 300 }, data: { label: 'System Design Thinking', status: 'locked', description: 'Approaching vague problems and breaking them down.' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
    ]
  }
};