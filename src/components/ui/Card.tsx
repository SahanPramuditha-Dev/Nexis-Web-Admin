import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glass = false }) => {
  return (
    <div
      className={`rounded-2xl transition-all ${
        glass
          ? 'ios-glass'
          : 'bg-[#1C1C1E] border border-white/[0.08] shadow-sm'
      } ${className}`}
    >
      {children}
    </div>
  );
};
