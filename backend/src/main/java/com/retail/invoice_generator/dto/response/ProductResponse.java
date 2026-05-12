package com.retail.invoice_generator.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String sku;
    private String hsnCode;
    private BigDecimal unitPrice;
    private BigDecimal gstRate;
    private Integer stockQuantity;
    private String description;
    private Boolean active;
    private LocalDateTime createdAt;
}
