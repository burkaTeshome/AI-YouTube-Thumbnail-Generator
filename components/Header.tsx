
import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.25a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3a.75.75 0 01.75-.75zM6.166 7.834a.75.75 0 01-1.06 1.06l-2.122-2.12a.75.75 0 011.06-1.061l2.122 2.12zM17.834 6.166a.75.75 0 011.06 1.06l-2.12 2.122a.75.75 0 11-1.06-1.06l2.12-2.122zM21 12a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h3a.75.75 0 01.75.75zM3.75 12a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zM7.834 17.834a.75.75 0 01-1.06-1.06l-2.12-2.122a.75.75 0 011.06-1.06l2.12 2.122zM12 18.75a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3a.75.75 0 01.75-.75zM16.166 16.166a.75.75 0 011.06 1.06l2.122 2.12a.75.75 0 01-1.06 1.06l-2.122-2.12z" />
    </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="bg-dark-surface border-b border-dark-border shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-center">
        <SparklesIcon className="w-8 h-8 mr-3 text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-dark-text">
          AI YouTube Thumbnail Generator
        </h1>
      </div>
    </header>
  );
};
