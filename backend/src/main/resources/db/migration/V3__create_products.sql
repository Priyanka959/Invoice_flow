CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    unit_price DECIMAL(10, 2) NOT NULL,
    gst_rate DECIMAL(5, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_products_sku (sku),
    INDEX idx_products_name (name)
);
