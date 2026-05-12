package com.retail.invoice_generator.service;

import com.retail.invoice_generator.dto.response.InvoiceResponse;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final PdfGeneratorService pdfGeneratorService;

    public void sendInvoiceEmail(String toEmail, InvoiceResponse invoice) {
        try {
            byte[] pdfBytes = pdfGeneratorService.generateInvoicePdf(invoice);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(toEmail);
            helper.setSubject("Invoice: " + invoice.getInvoiceNumber() + " - InvoiceFlow");
            helper.setText("Dear Customer,\n\nPlease find attached the invoice for your recent purchase.\n\nThank you for choosing InvoiceFlow.");

            helper.addAttachment(invoice.getInvoiceNumber() + ".pdf", new ByteArrayResource(pdfBytes));

            mailSender.send(message);
            log.info("Email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to {}", toEmail, e);
        }
    }
}