CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id BIGINT,
    created_by BIGINT,
    invoice_date DATE NOT NULL,
    supply_type ENUM('INTRA_STATE', 'INTER_STATE') NOT NULL,
    subtotal DECIMAL(12, 2),
    total_gst DECIMAL(12, 2),
    grand_total DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoices_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_invoices_user FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_invoices_number (invoice_number),
    INDEX idx_invoices_date (invoice_date)
);
