-- ==========================================================
-- MODEL: Core Master Data
-- DESCRIPTION: Master tables for product categories
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
