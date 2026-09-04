-- ==========================================================
-- MODEL: Inventory Management
-- DESCRIPTION: Product inventory stock, reorder levels, and adjustments tracking
-- ==========================================================

-- Live Inventory Stock Table
CREATE TABLE `inventory` (
  `inventory_id` int NOT NULL,
  `product_id` int NOT NULL,
  `stock_in` int DEFAULT '0',
  `stock_out` int DEFAULT '0',
  `current_stock` int DEFAULT '0',
  `expiry_date` date DEFAULT NULL,
  PRIMARY KEY (`inventory_id`),
  UNIQUE KEY `idx_unique_inv_product` (`product_id`),
  CONSTRAINT `fk_inv_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Reorder Levels Config
CREATE TABLE `product_reorder` (
  `product_id` int NOT NULL,
  `reorder_level` int NOT NULL DEFAULT '10',
  PRIMARY KEY (`product_id`),
  CONSTRAINT `fk_ro_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Internal Stock Adjustments Log
CREATE TABLE `stock_adjustment` (
  `adjustment_id` int NOT NULL,
  `product_id` int NOT NULL,
  `employee_id` int DEFAULT NULL,
  `adjustment_type` varchar(50) NOT NULL,
  `quantity_adjusted` int NOT NULL,
  `reason` text,
  `adjustment_date` datetime NOT NULL,
  PRIMARY KEY (`adjustment_id`),
  CONSTRAINT `fk_adj_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_adj_employee` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
