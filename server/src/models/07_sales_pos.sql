-- ==========================================================
-- MODEL: Point of Sale (POS) Transactions
-- DESCRIPTION: Customer purchases, billing, and tax integrations
-- ==========================================================

-- Standard Tax Rate Dictionary
CREATE TABLE `sales_transaction_rates` (
  `tax_category` varchar(50) NOT NULL,
  `tax_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`tax_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Payment Method Config & Fees
CREATE TABLE `sales_transaction_fees` (
  `payment_type_id` varchar(50) NOT NULL,
  `payment_processing_fee` decimal(5,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`payment_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Master Sales / Bill Record
CREATE TABLE `sales_transaction` (
  `transaction_id` int NOT NULL,
  `customer_id` int DEFAULT NULL,
  `employee_id` int DEFAULT NULL,
  `transaction_date` datetime NOT NULL,
  `total_items` int NOT NULL DEFAULT '0',
  `grand_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `payment_type_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  CONSTRAINT `fk_sales_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sales_employee` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sales_fees` FOREIGN KEY (`payment_type_id`) REFERENCES `sales_transaction_fees` (`payment_type_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Line items for Bill
CREATE TABLE `sales_transaction_details` (
  `transaction_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity_sold` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `tax_category` varchar(50) DEFAULT NULL,
  `tax` decimal(10,2) DEFAULT '0.00',
  `line_total` decimal(12,2) NOT NULL,
  PRIMARY KEY (`transaction_id`,`product_id`),
  CONSTRAINT `fk_std_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `sales_transaction` (`transaction_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_std_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_std_tax_rate` FOREIGN KEY (`tax_category`) REFERENCES `sales_transaction_rates` (`tax_category`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Customer Payments Tracking
CREATE TABLE `payment` (
  `payment_id` int NOT NULL,
  `transaction_id` int NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `amount_paid` decimal(12,2) NOT NULL,
  `payment_date` datetime NOT NULL,
  `payment_status` varchar(20) NOT NULL DEFAULT 'Completed',
  PRIMARY KEY (`payment_id`),
  CONSTRAINT `fk_payment_txn` FOREIGN KEY (`transaction_id`) REFERENCES `sales_transaction` (`transaction_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
