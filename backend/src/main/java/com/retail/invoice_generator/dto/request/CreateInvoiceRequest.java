package com.retail.invoice_generator.dto.request;

import com.retail.invoice_generator.model.SupplyType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateInvoiceRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Supply type is required")
    private SupplyType supplyType;

    @NotNull(message = "Invoice date is required")
    @PastOrPresent(message = "Invoice date cannot be in the future")
    private LocalDate invoiceDate;

    @NotEmpty(message = "Invoice must have at least one item")
    @Valid
    private List<InvoiceItemRequest> items;
}

