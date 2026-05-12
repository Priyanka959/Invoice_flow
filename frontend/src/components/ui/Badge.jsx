import React from 'react';

const Badge = ({ children, variant = 'neutral' }) => {
  const variants = {
    success: 'bg-green-500/10 text-green-500 border-green-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-500 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase tracking-tighter ${variants[variant] || variants.neutral}`}>
      {children}
    </span>
  );
};

export default Badge;
