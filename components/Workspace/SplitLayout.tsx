import React from 'react';
import ChatPanel from './ChatPanel';
import PreviewPanel from './PreviewPanel';

const SplitLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0C10]">
      {/* Left Panel: Chat (45%) */}
      <div className="w-[45%] h-full min-w-[350px]">
        <ChatPanel />
      </div>

      {/* Right Panel: Preview (55%) */}
      <div className="flex-1 h-full min-w-[400px]">
        <PreviewPanel />
      </div>
    </div>
  );
};

export default SplitLayout;
