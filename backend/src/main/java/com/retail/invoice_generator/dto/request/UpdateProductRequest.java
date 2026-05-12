package com.retail.invoice_generator.dto.request;

import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {
    private String name;
    private String hsnCode;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    private BigDecimal unitPrice;
    
    @DecimalMin(value = "0.0", message = "GST Rate cannot be negative")
    private BigDecimal gstRate;

    @DecimalMin(value = "0", message = "Stock cannot be negative")
    private Integer stockQuantity;
    
    private String description;
    private Boolean active;
}
