-- ==========================================================
-- MODEL: Purchase Orders
-- DESCRIPTION: Purchase order flows with suppliers
-- ==========================================================

-- Valid Status Flags for Purchase Orders
CREATE TABLE `purchase_order_status` (
  `status` varchar(50) NOT NULL,
  `payment_status` varchar(50) NOT NULL,
  PRIMARY KEY (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Purchase Order Master Record
CREATE TABLE `purchase_order` (
  `po_id` int NOT NULL,
  `supplier_id` int NOT NULL,
  `order_date` date NOT NULL,
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` varchar(50) NOT NULL DEFAULT 'Pending',
  `delivery_date` date DEFAULT NULL,
  PRIMARY KEY (`po_id`),
  CONSTRAINT `fk_po_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_po_status` FOREIGN KEY (`status`) REFERENCES `purchase_order_status` (`status`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Purchase Order Line Items
-- Fixed duplicate table naming: normalized to purchase_order_detail
CREATE TABLE `purchase_order_detail` (
  `po_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity_ordered` int NOT NULL,
  `batch_no` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`po_id`,`product_id`),
  CONSTRAINT `fk_pod_po` FOREIGN KEY (`po_id`) REFERENCES `purchase_order` (`po_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pod_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Purchase Order Delivery Logs
CREATE TABLE `delivery_details` (
  `po_id` int NOT NULL,
  `purchase_agent_name` varchar(255) DEFAULT NULL,
  `shipping_mode` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`po_id`),
  CONSTRAINT `fk_delivery_po` FOREIGN KEY (`po_id`) REFERENCES `purchase_order` (`po_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
