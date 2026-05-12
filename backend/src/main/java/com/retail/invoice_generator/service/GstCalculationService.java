package com.retail.invoice_generator.service;

import com.retail.invoice_generator.dto.response.GstSlabSummary;
import com.retail.invoice_generator.dto.response.GstSummary;
import com.retail.invoice_generator.model.InvoiceItem;
import com.retail.invoice_generator.model.SupplyType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GstCalculationService {

    public BigDecimal calculateLineTotal(BigDecimal unitPrice, int qty) {
        return unitPrice.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateGstAmount(BigDecimal lineTotal, BigDecimal gstRate) {
        return lineTotal.multiply(gstRate)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    public GstSummary buildGstSummary(List<InvoiceItem> items, SupplyType supplyType) {
        Map<BigDecimal, List<InvoiceItem>> itemsByRate = items.stream()
                .collect(Collectors.groupingBy(InvoiceItem::getGstRate));

        List<GstSlabSummary> slabs = new ArrayList<>();

        for (Map.Entry<BigDecimal, List<InvoiceItem>> entry : itemsByRate.entrySet()) {
            BigDecimal rate = entry.getKey();
            List<InvoiceItem> slabItems = entry.getValue();

            BigDecimal taxableAmount = slabItems.stream()
                    .map(InvoiceItem::getLineTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalGstForSlab = slabItems.stream()
                    .map(InvoiceItem::getGstAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal cgst = totalGstForSlab.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
            BigDecimal sgst = totalGstForSlab.subtract(cgst);
            BigDecimal igst = BigDecimal.ZERO;

            slabs.add(GstSlabSummary.builder()
                    .gstRate(rate)
                    .taxableAmount(taxableAmount)
                    .cgst(cgst)
                    .sgst(sgst)
                    .igst(igst)
                    .build());
        }

        return GstSummary.builder().slabs(slabs).build();
    }
}

