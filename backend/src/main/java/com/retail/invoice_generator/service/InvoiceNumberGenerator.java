package com.retail.invoice_generator.service;

import com.retail.invoice_generator.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class InvoiceNumberGenerator {

    private final InvoiceRepository invoiceRepository;

    @Transactional
    public synchronized String generateNextInvoiceNumber() {
        int year = LocalDate.now().getYear();
        String pattern = "INV-" + year + "-%";
        
        String lastInvoiceNumber = invoiceRepository.findLastInvoiceNumberInYear(pattern).orElse(null);
        
        int nextSequence = 1;
        if (lastInvoiceNumber != null) {
            try {
                String[] parts = lastInvoiceNumber.split("-");
                if (parts.length == 3) {
                    nextSequence = Integer.parseInt(parts[2]) + 1;
                }
            } catch (NumberFormatException e) {
                // Should not happen with well-formed INV-YEAR-SEQ pattern
                nextSequence = 1;
            }
        }
        
        return String.format("INV-%d-%04d", year, nextSequence);
    }
}

