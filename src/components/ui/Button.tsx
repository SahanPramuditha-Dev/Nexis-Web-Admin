import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'tinted' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all cursor-pointer select-none rounded-xl disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]';

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-xs md:text-sm',
    lg: 'px-4.5 py-2.5 text-sm md:text-base'
  }[size];

  const variantClasses = {
    primary:
      'bg-[#0A84FF] hover:bg-[#0071E3] text-white shadow-sm shadow-[#0A84FF]/25 border border-white/10',
    tinted:
      'bg-[#0A84FF]/15 hover:bg-[#0A84FF]/25 text-[#0A84FF] border border-[#0A84FF]/30',
    secondary:
      'bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white border border-white/[0.08]',
    destructive:
      'bg-[#FF453A] hover:bg-[#D70015] text-white shadow-sm shadow-[#FF453A]/25 border border-white/10',
    ghost:
      'text-[#8E8E93] hover:text-white hover:bg-white/[0.06]'
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {children}
    </button>
  );
};
