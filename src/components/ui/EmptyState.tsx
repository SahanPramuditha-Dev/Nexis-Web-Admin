import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action
}) => {
  return (
    <div className="py-16 px-6 text-center flex flex-col items-center justify-center space-y-3">
      <div className="h-12 w-12 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[#8E8E93]">
        <Icon className="h-6 w-6 stroke-[1.5]" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>
        <p className="text-xs text-[#8E8E93] leading-relaxed">{description}</p>
      </div>
      {action && (
        <div className="pt-2">
          <Button variant="secondary" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};
