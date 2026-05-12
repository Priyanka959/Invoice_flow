package com.retail.invoice_generator.service;

import com.retail.invoice_generator.dto.request.CreateInvoiceRequest;
import com.retail.invoice_generator.dto.request.InvoiceItemRequest;
import com.retail.invoice_generator.dto.response.*;
import com.retail.invoice_generator.exception.ResourceNotFoundException;
import com.retail.invoice_generator.model.*;
import com.retail.invoice_generator.repository.CustomerRepository;
import com.retail.invoice_generator.repository.InvoiceItemRepository;
import com.retail.invoice_generator.repository.InvoiceRepository;
import com.retail.invoice_generator.repository.UserRepository;
import com.retail.invoice_generator.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository; // Note: Assuming Product module exists from folder structure
    private final InvoiceNumberGenerator invoiceNumberGenerator;
    private final GstCalculationService gstCalculationService;

    @Transactional
    public InvoiceResponse createInvoice(CreateInvoiceRequest request, Long createdByUserId) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        User creator = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumberGenerator.generateNextInvoiceNumber())
                .customer(customer)
                .createdBy(creator)
                .invoiceDate(request.getInvoiceDate())
                .supplyType(request.getSupplyType())
                .items(new ArrayList<>())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalGst = BigDecimal.ZERO;

        for (InvoiceItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));
            
            if (!product.isActive()) {
                throw new com.retail.invoice_generator.exception.BusinessException("Product is inactive: " + product.getName());
            }

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new com.retail.invoice_generator.exception.BusinessException("Insufficient stock for product: " + product.getName() + 
                    " (Available: " + product.getStockQuantity() + ", Requested: " + itemReq.getQuantity() + ")");
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);

            BigDecimal lineTotal = gstCalculationService.calculateLineTotal(product.getUnitPrice(), itemReq.getQuantity());
            BigDecimal gstAmount = gstCalculationService.calculateGstAmount(lineTotal, product.getGstRate());

            InvoiceItem item = InvoiceItem.builder()
                    .invoice(invoice)
                    .product(product)
                    .productName(product.getName())
                    .unitPrice(product.getUnitPrice())
                    .gstRate(product.getGstRate())
                    .quantity(itemReq.getQuantity())
                    .lineTotal(lineTotal)
                    .gstAmount(gstAmount)
                    .build();

            invoice.getItems().add(item);
            subtotal = subtotal.add(lineTotal);
            totalGst = totalGst.add(gstAmount);
        }

        invoice.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        invoice.setTotalGst(totalGst.setScale(2, RoundingMode.HALF_UP));
        invoice.setGrandTotal(subtotal.add(totalGst).setScale(2, RoundingMode.HALF_UP));

        Invoice savedInvoice = invoiceRepository.save(invoice);
        return mapToResponse(savedInvoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        return mapToResponse(invoice);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceListResponse> listInvoices(Long customerId, String customerName, Long createdById, LocalDate from, LocalDate to, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        String normalizedName = (customerName != null && !customerName.trim().isEmpty()) ? customerName.trim() : null;
        return invoiceRepository.findWithFilters(customerId, normalizedName, createdById, from, to, pageable)
                .map(i -> InvoiceListResponse.builder()
                        .id(i.getId())
                        .invoiceNumber(i.getInvoiceNumber())
                        .customerName(i.getCustomer().getName())
                        .createdBy(i.getCreatedBy().getFullName())
                        .invoiceDate(i.getInvoiceDate())
                        .supplyType(i.getSupplyType())
                        .grandTotal(i.getGrandTotal())
                        .build());
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        List<InvoiceItemResponse> itemResponses = invoice.getItems().stream()
                .map(item -> InvoiceItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                        .productName(item.getProductName())
                        .unitPrice(item.getUnitPrice())
                        .gstRate(item.getGstRate())
                        .quantity(item.getQuantity())
                        .lineTotal(item.getLineTotal())
                        .gstAmount(item.getGstAmount())
                        .build())
                .collect(Collectors.toList());

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .customer(CustomerResponse.builder()
                        .id(invoice.getCustomer().getId())
                        .name(invoice.getCustomer().getName())
                        .email(invoice.getCustomer().getEmail())
                        .phone(invoice.getCustomer().getPhone())
                        .address(invoice.getCustomer().getAddress())
                        .createdAt(invoice.getCustomer().getCreatedAt())
                        .build())
                .createdBy(invoice.getCreatedBy().getFullName())
                .invoiceDate(invoice.getInvoiceDate())
                .supplyType(invoice.getSupplyType())
                .subtotal(invoice.getSubtotal())
                .totalGst(invoice.getTotalGst())
                .grandTotal(invoice.getGrandTotal())
                .items(itemResponses)
                .gstSummary(gstCalculationService.buildGstSummary(invoice.getItems(), invoice.getSupplyType()))
                .build();
    }
}

