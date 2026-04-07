-- ==========================================================
-- MODEL: Products
-- DESCRIPTION: Products core and their descriptions
-- ==========================================================

-- Main Product Table
CREATE TABLE `product` (
  `product_id` int NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `barcode` varchar(255) DEFAULT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `category_id` int NOT NULL,
  `supplier_id` int DEFAULT NULL,
  `hsn_code` varchar(20) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `idx_unique_barcode` (`barcode`),
  CONSTRAINT `fk_prod_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_prod_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_prod_hsn` FOREIGN KEY (`hsn_code`) REFERENCES `hsn_tax` (`hsn_code`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Product description (1:1 with Product)
CREATE TABLE `product_description` (
  `product_id` int NOT NULL,
  `product_description` text,
  PRIMARY KEY (`product_id`),
  CONSTRAINT `fk_prod_desc` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
