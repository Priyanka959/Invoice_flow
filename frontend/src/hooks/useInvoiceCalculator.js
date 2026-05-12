import { useMemo } from 'react';

export const useInvoiceCalculator = (items, supplyType) => {
  return useMemo(() => {
    const subtotal = items.reduce((acc, item) => {
      const price = item.product?.unitPrice || item.product?.price || item.price || 0;
      const qty = item.quantity || 0;
      return acc + (price * qty);
    }, 0);

    // Group by GST rate for summary
    const gstGroups = items.reduce((acc, item) => {
      const product = item.product || item;
      if (!product) return acc;
      const rate = product.gstRate || 0;
      const price = product.unitPrice || product.price || 0;
      const lineTotal = price * (item.quantity || 0);
      const gstAmount = lineTotal * (rate / 100);

      if (!acc[rate]) {
        acc[rate] = { rate, taxable: 0, gst: 0 };
      }
      acc[rate].taxable += lineTotal;
      acc[rate].gst += gstAmount;
      return acc;
    }, {});

    const totalGst = Object.values(gstGroups).reduce((acc, group) => acc + group.gst, 0);
    
    const gstSummary = Object.values(gstGroups).map(group => {
      const isIntra = supplyType === 'INTRA_STATE';
      return {
        ...group,
        cgst: isIntra ? group.gst / 2 : 0,
        sgst: isIntra ? group.gst / 2 : 0,
        igst: !isIntra ? group.gst : 0
      };
    });

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalGst: parseFloat(totalGst.toFixed(2)),
      grandTotal: parseFloat((subtotal + totalGst).toFixed(2)),
      gstSummary
    };
  }, [items, supplyType]);
};
