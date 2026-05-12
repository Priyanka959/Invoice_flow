import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, totalPages, onPageChange, totalElements, size = 20 }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 bg-navy-950/50 border-t border-navy-800 flex items-center justify-between">
      <p className="text-[10px] font-mono text-navy-700 uppercase">
        Showing records {page * size + 1}-{Math.min((page + 1) * size, totalElements)} of {totalElements}
      </p>
      <div className="flex items-center gap-1">
        <button 
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="p-1.5 bg-navy-900 border border-navy-800 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-1 px-3">
           {[...Array(totalPages)].map((_, i) => (
             <button 
                key={i}
                onClick={() => onPageChange(i)}
                className={`w-6 h-6 text-[10px] font-mono rounded flex items-center justify-center transition-all ${
                  page === i ? 'bg-amber-500 text-navy-950 font-black' : 'text-slate-500 hover:text-slate-300'
                }`}
             >
               {i + 1}
             </button>
           ))}
        </div>
        <button 
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="p-1.5 bg-navy-900 border border-navy-800 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
