-- ==========================================================
-- MODEL: Suppliers
-- DESCRIPTION: Supplier base entity, banking, and contact records
-- ==========================================================

-- Supplier Address Dictionary
CREATE TABLE `supplier_address` (
  `pincode` varchar(10) NOT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  PRIMARY KEY (`pincode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Supplier Bank Details Base
CREATE TABLE `supplier_bank_details` (
  `bank_account_number` varchar(20) NOT NULL,
  `ifsc_code` varchar(15) NOT NULL,
  `branch_name` varchar(255) NOT NULL,
  `bank_name` varchar(255) NOT NULL,
  PRIMARY KEY (`bank_account_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Supplier Main Entity
CREATE TABLE `supplier` (
  `supplier_id` int NOT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `bank_account_number` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`supplier_id`),
  UNIQUE KEY `idx_unique_sup_email` (`email`),
  UNIQUE KEY `idx_unique_sup_bank` (`bank_account_number`),
  CONSTRAINT `fk_supplier_address` FOREIGN KEY (`pincode`) REFERENCES `supplier_address` (`pincode`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_supplier_bank` FOREIGN KEY (`bank_account_number`) REFERENCES `supplier_bank_details` (`bank_account_number`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Secondary Supplier Contacts (1:N linking)
CREATE TABLE `supplier_contact` (
  `supplier_id` int NOT NULL,
  `phone` varchar(20) NOT NULL,
  PRIMARY KEY (`supplier_id`,`phone`),
  CONSTRAINT `fk_sup_contact` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
