package com.retail.invoice_generator.dto.response;

import com.retail.invoice_generator.model.SupplyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceResponse {
    private Long id;
    private String invoiceNumber;
    private CustomerResponse customer;
    private String createdBy; // Full name or username
    private LocalDate invoiceDate;
    private SupplyType supplyType;
    private BigDecimal subtotal;
    private BigDecimal totalGst;
    private BigDecimal grandTotal;
    private List<InvoiceItemResponse> items;
    private GstSummary gstSummary;
}

