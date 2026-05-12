package com.retail.invoice_generator.controller;

import com.retail.invoice_generator.dto.request.CreateInvoiceRequest;
import com.retail.invoice_generator.dto.response.InvoiceListResponse;
import com.retail.invoice_generator.dto.response.InvoiceResponse;
import com.retail.invoice_generator.model.User;
import com.retail.invoice_generator.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final com.retail.invoice_generator.service.PdfGeneratorService pdfGeneratorService;
    private final com.retail.invoice_generator.service.EmailService emailService;

    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(
            @Valid @RequestBody CreateInvoiceRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        InvoiceResponse response = invoiceService.createInvoice(request, currentUser.getId());
        
        // If customer has an email, send the invoice auto-magically
        if (response.getCustomer() != null && response.getCustomer().getEmail() != null) {
            emailService.sendInvoiceEmail(response.getCustomer().getEmail(), response);
        }
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<InvoiceListResponse>> listInvoices(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) Long cashierId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(invoiceService.listInvoices(customerId, customerName, cashierId, from, to, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoice(id));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> exportInvoicePdf(@PathVariable Long id) {
        InvoiceResponse invoice = invoiceService.getInvoice(id);
        byte[] pdfBytes = pdfGeneratorService.generateInvoicePdf(invoice);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment()
                .filename(invoice.getInvoiceNumber() + ".pdf")
                .build());

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}

