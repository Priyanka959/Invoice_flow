package com.retail.invoice_generator.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotBlank(message = "HSN Code is required")
    private String hsnCode;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    private BigDecimal unitPrice;

    @NotNull(message = "GST Rate is required")
    @DecimalMin(value = "0.0", message = "GST Rate cannot be negative")
    private BigDecimal gstRate;

    @NotNull(message = "Stock quantity is required")
    @DecimalMin(value = "0", message = "Stock cannot be negative")
    private Integer stockQuantity;

    private String description;

    @Builder.Default
    private Boolean active = true;
}
