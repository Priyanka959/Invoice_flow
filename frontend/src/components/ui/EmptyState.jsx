import React from 'react';
import { Package } from 'lucide-react';

const EmptyState = ({ icon: Icon = Package, title, subtitle }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-navy-800 rounded-lg">
      <div className="p-4 bg-navy-800 rounded-full mb-4 text-navy-700">
        <Icon size={32} />
      </div>
      <h3 className="text-sm font-bold text-white uppercase tracking-widest leading-none mb-2">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 font-mono italic">{subtitle}</p>}
    </div>
  );
};

export default EmptyState;
