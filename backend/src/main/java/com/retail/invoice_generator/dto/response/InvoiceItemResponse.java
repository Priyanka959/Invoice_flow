package com.retail.invoice_generator.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private BigDecimal unitPrice;
    private BigDecimal gstRate;
    private Integer quantity;
    private BigDecimal lineTotal;
    private BigDecimal gstAmount;
}

