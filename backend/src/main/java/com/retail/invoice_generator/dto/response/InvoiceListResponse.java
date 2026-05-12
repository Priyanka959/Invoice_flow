package com.retail.invoice_generator.dto.response;

import com.retail.invoice_generator.model.SupplyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceListResponse {
    private Long id;
    private String invoiceNumber;
    private String customerName;
    private String createdBy;
    private LocalDate invoiceDate;
    private SupplyType supplyType;
    private BigDecimal grandTotal;
}

