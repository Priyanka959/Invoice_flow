SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'invoice_db' AND table_name = 'products' AND column_name = 'created_at');
SET @sqlstmt := IF(@exist > 0, 'SELECT ''Column exists''', 'ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'invoice_db' AND table_name = 'customers' AND column_name = 'created_at');
SET @sqlstmt := IF(@exist > 0, 'SELECT ''Column exists''', 'ALTER TABLE customers ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'invoice_db' AND table_name = 'users' AND column_name = 'created_at');
SET @sqlstmt := IF(@exist > 0, 'SELECT ''Column exists''', 'ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'invoice_db' AND table_name = 'invoices' AND column_name = 'created_at');
SET @sqlstmt := IF(@exist > 0, 'SELECT ''Column exists''', 'ALTER TABLE invoices ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
