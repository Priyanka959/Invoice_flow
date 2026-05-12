import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  Printer, 
  User, 
  Calendar,
  CreditCard,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { getInvoiceById, downloadInvoicePdf } from '../../api/invoices.api';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoiceById(id),
  });

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePdf(id);
      toast.success('Document finalized and downloaded');
    } catch (err) {
      toast.error('Failed to export PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner size={48} />
        <p className="mt-4 text-[10px] font-mono text-navy-700 uppercase tracking-[0.2em]">Defragmenting transaction data...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 text-center max-w-lg mx-auto">
        <h3 className="text-red-500 font-bold mb-2">ACCESS_DENIED_OR_NOT_FOUND</h3>
        <p className="text-sm text-red-400 font-mono">The requested transaction record could not be extracted from the ledger.</p>
        <button 
          onClick={() => navigate('/invoices')}
          className="mt-6 text-xs font-bold text-white uppercase tracking-widest hover:underline"
        >
          Return to directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700">
      {/* Detail Header */}
      <div className="flex items-center justify-between">
         <button 
            onClick={() => navigate('/invoices')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
         >
            <ArrowLeft size={16} />
            Directory
         </button>
         
         <div className="flex items-center gap-3">
            <button 
               onClick={() => window.print()}
               className="p-2.5 bg-navy-800 text-slate-400 hover:text-white rounded-lg transition-all border border-navy-700"
            >
               <Printer size={18} />
            </button>
            <button 
               onClick={handleDownload}
               disabled={isDownloading}
               className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-navy-950 px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all"
            >
               {isDownloading ? <Spinner size={16} className="text-navy-950" /> : <Download size={18} />}
               <span>Export Protocol</span>
            </button>
         </div>
      </div>

      {/* Main Document View */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-3xl overflow-hidden print:bg-white print:text-black print:shadow-none print:border-none">
        {/* Header Block */}
        <div className="bg-navy-950/50 px-10 py-12 border-b border-navy-800 flex justify-between items-start print:bg-transparent">
           <div>
              <h1 className="text-3xl font-black text-amber-500 tracking-tighter italic leading-none mb-1">InvoiceFlow</h1>
              <p className="text-[10px] font-mono text-navy-700 uppercase tracking-[0.3em]">Institutional Grade Biling</p>
           </div>
           <div className="text-right">
              <h2 className="text-2xl font-black font-mono text-white print:text-black tracking-tighter">
                TX-{invoice.id.toString().padStart(8, '0')}
              </h2>
              <p className="text-xs font-mono text-slate-500 uppercase mt-1">
                 {(() => {
                   const d = invoice.invoiceDate || invoice.createdAt;
                   if (!d) return 'N/A';
                   const dateObj = Array.isArray(d) ? new Date(d[0], d[1]-1, d[2]) : new Date(d);
                   return isNaN(dateObj.getTime()) ? 'Invalid Date' : dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
                 })()}
              </p>
           </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-10 bg-navy-900">
           <div className="space-y-6">
              <div>
                 <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-4 border-b border-navy-800 pb-2">Origin Entity</h4>
                 <div className="space-y-1">
                    <p className="text-sm font-bold text-white">RETAIL TERMINAL 01</p>
                    <p className="text-xs text-slate-400">Headquarters Dr, Silicon Valley</p>
                    <p className="text-xs text-slate-500 font-mono">GSTIN: 22AAAAA0000A1Z5</p>
                 </div>
              </div>
              <div className="flex gap-12">
                 <div>
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-2">Protocol</h4>
                    <Badge variant={invoice.supplyType === 'INTRA_STATE' ? 'info' : 'warning'}>{invoice.supplyType}</Badge>
                 </div>
                 <div>
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-2">Cashier</h4>
                    <span className="text-xs font-bold text-slate-300">{invoice.cashierName || 'SYSTEM_AUTO'}</span>
                 </div>
              </div>
           </div>

           <div>
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-navy-700 mb-4 border-b border-navy-800 pb-2">Recipient Domain</h4>
              <div className="space-y-3">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-navy-800 rounded flex items-center justify-center text-amber-500">
                       <User size={16} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-white">{invoice.customer?.name}</p>
                       <p className="text-xs text-slate-500 font-mono">UID-{invoice.customer?.id}</p>
                    </div>
                 </div>
                 <div className="pl-11 space-y-1">
                    <p className="text-xs text-slate-400">{invoice.customerAddress || 'Permanent Address Not Disclosed'}</p>
                    <p className="text-xs text-slate-400 font-mono">{invoice.customerPhone || invoice.customer?.phone}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Line Items */}
        <div className="px-10 py-6">
           <table className="w-full text-left">
              <thead>
                 <tr className="border-y border-navy-800 text-[10px] uppercase font-mono text-navy-700 tracking-widest">
                    <th className="py-4 font-bold">Asset Description</th>
                    <th className="py-4 font-bold text-center">Unit Price</th>
                    <th className="py-4 font-bold text-center">Quantity</th>
                    <th className="py-4 font-bold text-center">GST%</th>
                    <th className="py-4 font-bold text-right">Settlement Amt</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/30">
                 {invoice.items?.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-navy-800/10 transition-colors">
                       <td className="py-5">
                          <p className="text-sm font-bold text-white">{item.productName}</p>
                          <p className="text-[10px] font-mono text-navy-700 uppercase">SKU-{item.productId}</p>
                       </td>
                       <td className="py-5 text-center text-xs font-mono text-slate-400">${(item.unitPrice || 0).toLocaleString()}</td>
                       <td className="py-5 text-center text-xs font-mono font-bold text-white">{item.quantity}</td>
                       <td className="py-5 text-center">
                          <span className="text-[10px] font-mono border border-navy-800 px-2 py-0.5 rounded text-slate-500">{item.gstRate || 0}%</span>
                       </td>
                       <td className="py-5 text-right text-sm font-mono font-black text-white">
                          ₹{((item.lineTotal || 0) + (item.gstAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* Totals Summary */}
        <div className="p-10 bg-navy-950/30 flex justify-end">
           <div className="w-full max-w-xs space-y-4">
              <div className="flex justify-between text-[10px] uppercase font-mono text-navy-700 tracking-widest">
                 <span>Subtotal Base</span>
                 <span className="text-white">${(invoice.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase font-mono text-navy-700 tracking-widest">
                 <span>Aggregate GST</span>
                 <span className="text-white">${(invoice.totalGst || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-4 border-t border-navy-800 flex justify-between items-baseline">
                 <span className="text-xs font-black uppercase tracking-widest text-amber-500 italic">Grand Total</span>
                 <span className="text-3xl font-black font-mono text-white tracking-tighter">
                   ${(invoice.totalAmount || invoice.grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                 </span>
              </div>
           </div>
        </div>
      </div>

      <div className="flex justify-center py-8">
         <div className="flex items-center gap-2 text-[10px] font-mono text-navy-700 uppercase tracking-widest">
            <ShoppingBag size={12} />
            Secure Transaction Finalized
         </div>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
