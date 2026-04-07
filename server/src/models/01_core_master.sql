-- ==========================================================
-- MODEL: Core Master Data
-- DESCRIPTION: Master tables for product categories and GST
-- ==========================================================

-- Category Table
-- Holds product classifications
CREATE TABLE `category` (
  `category_id` int NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `description` text,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `idx_unique_category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- HSN Tax Table
-- Standard tax codes and GST rates
CREATE TABLE `hsn_tax` (
  `hsn_code` varchar(20) NOT NULL,
  `gst_rate` decimal(5,2) NOT NULL,
  PRIMARY KEY (`hsn_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
