-- ==========================================================
-- MODEL: Users and Stakeholders
-- DESCRIPTION: Employees, Addresses, and Customers
-- ==========================================================

-- Employee Address Table
-- Shared addresses for employees based on pincode normalization
CREATE TABLE `employee_address` (
  `pincode` varchar(10) NOT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  PRIMARY KEY (`pincode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Employee Table
-- Staff members managing the system
CREATE TABLE `employee` (
  `employee_id` int NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'Cashier',
  `phone_number` varchar(20) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `idx_unique_emp_email` (`email`),
  CONSTRAINT `fk_employee_pincode` FOREIGN KEY (`pincode`) REFERENCES `employee_address` (`pincode`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Customer Table
-- Information for end consumers
CREATE TABLE `customer` (
  `customer_id` int NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `address` text,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `idx_unique_cust_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
