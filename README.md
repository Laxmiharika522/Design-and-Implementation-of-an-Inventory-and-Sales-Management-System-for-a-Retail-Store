# InventoryPro — Retail Inventory & Sales Management System

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

**InventoryPro** is a multi-portal retail management web application designed for modern retail stores, supermarkets, and supply chain operations. It integrates store administration, point-of-sale (POS) operations, supplier procurement, and customer e-commerce into a single application backed by a MySQL database.

---

## 🏛️ System Architecture & Multi-Portal Design

The system enforces strict **Role-Based Access Control (RBAC)** via JSON Web Tokens (JWT). Upon authentication, users are automatically routed to their designated portal:

```
                            ┌─────────────────────────────────────────┐
                            │            Authentication &             │
                            │           Smart Auto-Redirect           │
                            └────────────────────┬────────────────────┘
                                                 │
      ┌──────────────────────┬───────────────────┴───────────────────┬──────────────────────┐
      ▼                      ▼                                       ▼                      ▼
┌───────────┐         ┌──────────────┐                        ┌─────────────┐        ┌──────────────┐
│   Admin   │         │   Employee   │                        │  Supplier   │        │   Customer   │
│  Portal   │         │  / POS Page  │                        │   Portal    │        │    Portal    │
└─────┬─────┘         └──────┬───────┘                        └──────┬──────┘        └──────┬───────┘
      │                      │                                       │                      │
      ├─ Dashboard Analytics ├─ Point of Sale (POS)                  ├─ Purchase Orders     ├─ Product Catalog
      ├─ Products & Stock    ├─ Customer Profiles                    ├─ Shipment Dispatches ├─ Cart & Checkout
      ├─ Categories          ├─ Sales Log Audit                      ├─ Payment Trackers    ├─ Order History
      ├─ Supplier Management └─ Personal Metrics                     └─ Bank Profile        └─ Personal Profile
      ├─ Employee Roles
      └─ Sales & Tax Reports
```

---

## 🌐 Feature Breakdown by Portal

### 1. 🛡️ Admin Portal (`/admin/*`)
- **Executive Dashboard**: Real-time sales metrics, revenue analytics, low-stock alert counters, category distribution charts, and quick-action modals for reordering low stock items.
- **Product Management**: Complete catalog control with barcode search, pricing/MRP configuration, stock status badges, category tagging, image preview, and supplier mapping.
- **Category Management**: Hierarchical product classification, instant category search, custom descriptions, and category creation/edits.
- **Inventory & Stock Control**: Real-time stock level monitoring (stock-in, stock-out, net current stock), expiry date tracking, reorder level triggers, and manual stock adjustment logs.
- **Supplier Directory**: Full supplier master with contact info, complete address tracking (city, state, pincode), bank account details (Bank Name, Account No, IFSC, Branch), total orders placed, total spent, and recorded payment history.
- **Employee Management**: Access governance for staff members (Roles: Admin, Cashier, Employee), credentials management, phone, email, and location profiles.
- **Reports & Analytics**: Advanced business intelligence engine featuring:
  - Custom date range filters (Today, Yesterday, Last 7 Days, Last 30 Days, Custom Range).
  - Revenue, transaction volume, and average order value metrics.
  - Payment method distribution (Cash, UPI, Debit Card, Credit Card, Net Banking).
  - Top-performing products and sales breakdown tables.
  - Itemized transaction audit drawer with compact, printable invoice modals.

---

### 2. ⚡ Employee & POS Portal (`/employee/*` & `/pos`)
- **Point of Sale (POS) Interface**:
  - High-speed product search and barcode scanning.
  - Category pill filter tabs with visual emoji indicators.
  - Dynamic shopping cart with live subtotal, item quantities, and discount calculations (15% - 40% OFF).
  - Dynamic payment processing fee engine (Cash 0%, UPI 0.5%, Debit Card 1.0%, Credit Card 2.0%, Net Banking 1.5%).
  - One-click checkout with real-time stock deduction.
  - Digital receipt generator modal.
- **Employee Dashboard**: Individual performance tracking, today's sales processed count, total transactions handled, and quick POS shortcut.
- **Customer Directory**: Register and manage store customer profiles, view total orders placed, total lifetime spend, and contact information.
- **Sales Transaction Log**: Review past POS sales transactions with search and filter capabilities.

---

### 3. 🚚 Supplier Portal (`/supplier/*`)
- **Supplier Dashboard**: Supplier metrics overview (Total Orders received, Pending Orders, Shipped Orders, Delivered Orders, Total Revenue, Outstanding Unpaid Balance).
- **Purchase Order Management**: View all purchase orders issued by the store, status filter tabs (Pending, In Progress, Shipped, Delivered, Cancelled), and order status updating workflow.
- **Standardized Invoice Modal**: View compact, professional purchase order invoices displaying itemized product details, batch numbers, unit prices, tax summaries, and supplier payment status.
- **Delivery Management**: Dispatch tracking, shipping mode selection (Road, Rail, Air, Express Courier), delivery date logging, and purchase agent assignment.
- **Payments Management**: Payment audit history, paid vs unpaid order balances, and payment receipt logs.
- **Supplier Profile**: Manage business contact details, operational address, and bank payout information (Account Number, IFSC Code, Bank Name, Branch).

---

### 4. 🛒 Customer Portal (`/customer/*`)
- **E-Commerce Shop**: Browse retail products with visual cards, live price tags, stock status badges, category filters, and product search.
- **Interactive Cart & Checkout**: Slide-over shopping cart drawer, live total calculation, custom payment method selection, and instant order placement.
- **Order History**: Track order status (Pending, In Progress, Delivered), order date, grand total, itemized product breakdown, and invoice view.
- **Customer Profile**: Manage personal contact information, phone, and delivery address.

---

## 🛠️ Technology Stack & Dependencies

| Layer | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | SPA architecture with HMR dev environment |
| **Styling & UI** | Tailwind CSS | Custom dark/light utility themes, glassmorphism, responsive grids |
| **Icons** | Lucide React | Clean, modern UI icon system |
| **State & Data Fetching**| TanStack Query (React Query) | Server state caching, optimistic updates, query invalidation |
| **Routing** | React Router DOM v6 | Protected routes, layout wrapping, smart role redirection |
| **Charts & Visuals** | Recharts | Interactive revenue charts & category distribution bar charts |
| **Backend Runtime** | Node.js + Express.js | REST API services and routing middleware |
| **Database** | MySQL 8.0 | Relational database storage |
| **DB Client** | MySQL2 | Prepared statements & promise-based connection pooling |
| **Authentication** | JWT + Bcrypt | Bearer token authorization & password hashing (10 rounds) |

---

## 🗄️ Database Architecture

The relational schema (`retail_db`) consists of normalized tables:

```
category ─────────► product ──────────► inventory
                       │                     │
                       ├─► product_desc      └─► stock_adjustment
                       │
supplier ──────────► purchase_order ──► purchase_order_detail
  │                    │
  ├─► supplier_addr    ├─► purchase_order_status
  ├─► supplier_bank    └─► delivery_details
  └─► supplier_contact
                       
employee ──────────► sales_transaction ──► sales_transaction_details
  │                    │                         │
  └─► employee_addr    ├─► payment               └─► sales_transaction_rates
                       └─► sales_transaction_fees
```

---

## ⚙️ Installation & Setup Guide

### 1. Prerequisites
- **Node.js** (`>= 18.x`)
- **MySQL Server** (`>= 8.0`)

### 2. Environment Configuration

Copy the template `.env.example` files to `.env` in both `server/` and `client/` directories:

#### Server Configuration (`server/.env`):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here

# Local MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=retail_db
```

#### Client Configuration (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

> 🔒 **Security Notice**: `.env` files containing actual passwords and database keys are excluded from git tracking via `.gitignore`.

---

### 3. Database Initialization & Data Seeding

Run the automated database setup script from the `server` directory:

```bash
cd server
npm install
node init_db.js
```

This single command will:
1. Rebuild all tables with clean foreign key relationships.
2. Seed master categories and suppliers.
3. Populate over 160 retail products with stock inventory, descriptions, prices, and barcodes.

---

### 4. Running the Application

#### Start Backend API Server:
```bash
cd server
npm run dev
```
*(Server listens on `http://localhost:5000`)*

#### Start Frontend Client:
```bash
cd client
npm install
npm run dev
```
*(Client opens on `http://localhost:5173`)*

---

## 🔒 Security Architecture & Data Compliance

- **Decoupled Secret Management**: Application credentials, API keys, and environment variables are strictly isolated from the source tree using `.env` environment files and protected via `.gitignore` patterns.
- **Cryptographic Access Control**: API endpoints enforce stateless JSON Web Token (JWT) verification with role-based access control (RBAC) across distinct permission tiers (`Admin`, `Cashier`, `Employee`, `Supplier`, `Customer`).
- **SQL Injection Mitigation**: Database access layers strictly utilize parameterized prepared statements (`mysql2`) across all transactional and reporting queries to neutralize input tampering and injection vectors.
- **Credential Storage Security**: User and partner authentication records utilize `bcrypt` adaptive hashing with randomized salt rounds (10 rounds) to ensure non-reversibility of stored credentials.
