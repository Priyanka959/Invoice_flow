package com.retail.invoice_generator.service;

import com.retail.invoice_generator.dto.response.*;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGeneratorService {

    @Value("${app.shop.name}")
    private String shopName;

    @Value("${app.shop.address}")
    private String shopAddress;

    @Value("${app.shop.gstin}")
    private String shopGstin;

    private static final DecimalFormat CURRENCY_FORMAT = new DecimalFormat("₹ #,##0.00");

    public byte[] generateInvoicePdf(InvoiceResponse invoice) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            PdfFont font = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA);
            PdfFont bold = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA_BOLD);

            // Header Section
            document.add(new Paragraph(shopName).setFont(bold).setFontSize(20).setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph(shopAddress).setFontSize(10).setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph("GSTIN: " + shopGstin).setFontSize(10).setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph("\n"));

            // Metadata Table
            Table metaTable = new Table(UnitValue.createPointArray(new float[]{1, 1}));
            metaTable.setWidth(UnitValue.createPercentValue(100));
            
            metaTable.addCell(createCell("Invoice No: " + invoice.getInvoiceNumber(), font));
            metaTable.addCell(createCell("Customer: " + invoice.getCustomer().getName(), font));
            metaTable.addCell(createCell("Date: " + invoice.getInvoiceDate().toString(), font));
            metaTable.addCell(createCell("Phone: " + (invoice.getCustomer().getPhone() != null ? invoice.getCustomer().getPhone() : "N/A"), font));
            metaTable.addCell(createCell("Cashier: " + invoice.getCreatedBy(), font));
            
            document.add(metaTable);
            document.add(new Paragraph("\n"));

            // Items Table
            Table itemTable = new Table(UnitValue.createPointArray(new float[]{1, 3, 1, 1, 1, 1, 1}));
            itemTable.setWidth(UnitValue.createPercentValue(100));
            
            String[] headers = {"#", "Product", "Qty", "Price", "GST%", "GST Amt", "Total"};
            for (String header : headers) {
                itemTable.addHeaderCell(new Cell().add(new Paragraph(header).setFont(bold)).setBackgroundColor(ColorConstants.LIGHT_GRAY));
            }

            int count = 1;
            for (InvoiceItemResponse item : invoice.getItems()) {
                itemTable.addCell(new Cell().add(new Paragraph(String.valueOf(count++))));
                itemTable.addCell(new Cell().add(new Paragraph(item.getProductName())));
                itemTable.addCell(new Cell().add(new Paragraph(String.valueOf(item.getQuantity()))));
                itemTable.addCell(new Cell().add(new Paragraph(CURRENCY_FORMAT.format(item.getUnitPrice()))));
                itemTable.addCell(new Cell().add(new Paragraph(item.getGstRate() + "%")));
                itemTable.addCell(new Cell().add(new Paragraph(CURRENCY_FORMAT.format(item.getGstAmount()))));
                itemTable.addCell(new Cell().add(new Paragraph(CURRENCY_FORMAT.format(item.getLineTotal()))));
            }
            document.add(itemTable);
            document.add(new Paragraph("\n"));

            // GST Summary Table
            if (invoice.getGstSummary() != null && invoice.getGstSummary().getSlabs() != null) {
                document.add(new Paragraph("GST Summary").setFont(bold));
                Table gstTable = new Table(UnitValue.createPointArray(new float[]{1, 1, 1, 1, 1}));
                gstTable.setWidth(UnitValue.createPercentValue(100));
                
                String[] gstHeaders = {"Rate", "Taxable Amt", "CGST", "SGST"};
                for (String h : gstHeaders) {
                    gstTable.addHeaderCell(new Cell().add(new Paragraph(h).setFont(bold)).setBackgroundColor(ColorConstants.LIGHT_GRAY));
                }

                for (GstSlabSummary slab : invoice.getGstSummary().getSlabs()) {
                    gstTable.addCell(new Cell().add(new Paragraph(slab.getGstRate() + "%")));
                    gstTable.addCell(new Cell().add(new Paragraph(CURRENCY_FORMAT.format(slab.getTaxableAmount()))));
                    gstTable.addCell(new Cell().add(new Paragraph(CURRENCY_FORMAT.format(slab.getCgst()))));
                    gstTable.addCell(new Cell().add(new Paragraph(CURRENCY_FORMAT.format(slab.getSgst()))));
                }
                document.add(gstTable);
            }
            document.add(new Paragraph("\n"));

            // Summary section
            Paragraph totals = new Paragraph()
                .add("Subtotal: " + CURRENCY_FORMAT.format(invoice.getSubtotal()) + "\n")
                .add("Total GST: " + CURRENCY_FORMAT.format(invoice.getTotalGst()) + "\n")
                .add(new Paragraph("Grand Total: " + CURRENCY_FORMAT.format(invoice.getGrandTotal()))
                    .setFont(bold).setFontSize(14))
                .setTextAlignment(TextAlignment.RIGHT);
            document.add(totals);

            // Footer
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Thank you for your business")
                .setTextAlignment(TextAlignment.CENTER).setItalic());
            document.add(new Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss")))
                .setFontSize(8).setTextAlignment(TextAlignment.CENTER));

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    private Cell createCell(String text, PdfFont font) {
        return new Cell().add(new Paragraph(text).setFont(font)).setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
    }
}

