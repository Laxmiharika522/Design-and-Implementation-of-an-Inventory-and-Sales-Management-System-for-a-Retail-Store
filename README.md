# InventoryPro — Enterprise Retail Management & E-Commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![AWS](https://img.shields.io/badge/AWS-CloudFront%20|%20S3%20|%20EC2%20|%20RDS-FF9900?style=for-the-badge&logo=amazonwebservices)](https://aws.amazon.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

**InventoryPro** is an enterprise-grade, multi-portal retail management web platform designed for supermarkets, retail chains, and supply chain operators. It unifies administrative business intelligence, cashier Point of Sale (POS) operations, supplier procurement workflows, and an end-to-end customer e-commerce marketplace into a secure, decoupled **React SPA + Node.js REST API architecture** deployed across Amazon Web Services (AWS).

---

## 🏛️ System Highlights & Core Dashboards

| 🛒 Customer E-Commerce Experience | 🛡️ Store Executive Analytics |
| :---: | :---: |
| ![Customer Storefront](images/Customer_Portal/Customer_Dashboard1.png) | ![Admin Dashboard](images/Admin_Portal/Admin_Dashboard.png) |
| *Live grocery catalog, category filters, and checkout* | *Revenue metrics, stock warnings, and distribution charts* |

| ⚡ Cashier Point of Sale (POS) | 🚚 Supplier Order Fulfillment |
| :---: | :---: |
| ![Employee POS Dashboard](images/Employee_Portal/Employee_Dashboard.png) | ![Supplier Dashboard](images/Supplier_Portal/Supplier_Portal_Dashboard.png) |
| *Barcode scanning, cart totals, and one-click billing* | *Purchase orders, dispatched shipments, and settlements* |

---

## 🌐 Feature Breakdown by Portal

The platform operates on strict **Role-Based Access Control (RBAC)** via JSON Web Tokens (JWT). Users authenticate through a unified portal and are routed immediately to their dedicated domain:

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
      ├─ Executive Analytics ├─ Point of Sale (POS)                  ├─ Purchase Orders     ├─ Product Catalog
      ├─ Products & Stock    ├─ Customer Management                  ├─ Logistics Dispatch  ├─ Cart & Checkout
      ├─ Category Directory  ├─ Sales Transaction Audit              ├─ Payment Trackers    ├─ Order Receipts
      ├─ Supplier Governance └─ Cashier Shift Metrics                └─ Payout Bank Profile └─ Customer Profile
      ├─ Staff Access Control
      └─ Tax & Sales Audit
```

---

### 1. 🛒 Customer Portal (`/customer/*`)
Designed as a modern, high-conversion online supermarket storefront for retail shoppers:
- **Product Catalog & Search**: Visual product cards featuring real-time MRP vs discounted prices, unit quantities, and stock-availability badges.
- **Category Navigation**: Instant filtering across Grocery, Dairy, Beverages, Snacks, Produce, Personal Care, and Household essentials.
- **Dynamic Shopping Cart**: Slide-out drawer displaying live item counters, subtotal, delivery charges, and order taxes.
- **Order Tracking & Invoices**: Itemized order history detailing past transactions, delivery addresses, transaction dates, and printable invoice breakdowns.
- **Customer Profile**: Personal account management for updating phone numbers, emails, and primary delivery addresses.

#### 📸 Customer Portal Showcase:
| Grocery Catalog Storefront | Catalog Category Filtering |
| :---: | :---: |
| ![Customer Shop](images/Customer_Portal/Customer_Dashboard1.png) | ![Customer Catalog Categories](images/Customer_Portal/Customer_Dashboard2.png) |

| Order History & Digital Receipts | Customer Account & Address Profile |
| :---: | :---: |
| ![Customer Orders](images/Customer_Portal/Customer_Orders.png) | ![Customer Profile](images/Customer_Portal/Customer_Profile.png) |

---

### 2. 🛡️ Admin Portal (`/admin/*`)
The central command hub for store owners, general managers, and inventory supervisors:
- **Executive BI Dashboard**: High-level KPIs including Gross Revenue, Today's Sales Volume, Total Active Products, Low-Stock Warnings, and interactive Category Revenue distributions.
- **Product Inventory & Barcodes**: Full catalog control enabling managers to register new SKUs, update barcodes, configure selling prices/cost prices, monitor stock levels, and assign preferred suppliers.
- **Category Management**: Hierarchical product classification with real-time search, descriptions, and category creation.
- **Stock Control & Adjustments**: Monitor incoming stock batches, track perishable shelf-life expiry dates, trigger reorder thresholds, and log manual inventory adjustments.
- **Supplier Directory**: Comprehensive supplier master directory containing operational addresses, phone contacts, and banking payout records (IFSC, Bank Name, Account Number).
- **Staff Governance**: Configure access credentials and assign system roles (`Admin`, `Cashier`, `Employee`).
- **Audit & Financial Reports**: Granular transaction logs with custom date filters, payment distribution metrics (Cash, UPI, Cards, Net Banking), and printable tax invoices.

#### 📸 Admin Portal Showcase:
| Executive Dashboard | Inventory Stock Updates |
| :---: | :---: |
| ![Admin Dashboard](images/Admin_Portal/Admin_Dashboard.png) | ![Inventory Update](images/Admin_Portal/Admin_Inventory_Update.png) |

| Purchase Orders from Suppliers | Financial & Tax Reports |
| :---: | :---: |
| ![Supplier Orders](images/Admin_Portal/Admin_Supplier_Order.png) | ![Reports & Analytics](images/Admin_Portal/Admin_Reports.png) |

<details>
<summary><b>📸 Click to Expand Additional Admin Screens (Products, Categories, Shifts, Audit Logs)</b></summary>
<br/>

| All Products Catalog | Employee Shift Overview | Category Management |
| :---: | :---: | :---: |
| ![All Products](images/Admin_Portal/Admin_All_Products.png) | ![Admin Employee Dashboard](images/Admin_Portal/Admin_Employee_Dashboard.png) | ![Category Management](images/Admin_Portal/Admin_Category.png) |

| Sales Order Records | Sales Transaction Audit | Supplier Directory |
| :---: | :---: | :---: |
| ![Sales Order](images/Admin_Portal/Admin_Sales_Order.png) | ![Sales Transactions](images/Admin_Portal/Admin_Sales_Transactions.png) | ![Admin Suppliers](images/Admin_Portal/Admin_Suppliers.png) |

| Store Customer Directory | Staff & Employee Roles |
| :---: | :---: |
| ![Admin Customers](images/Admin_Portal/Admin_Customers.png) | ![Admin Employees](images/Admin_Portal/Admin_Employees.png) |

</details>

---

### 3. ⚡ Employee & POS Portal (`/employee/*` & `/pos`)
Engineered for counter cashiers and retail sales associates for fast checkout:
- **High-Velocity Point of Sale (POS)**: Real-time product search and barcode scanning integration.
- **Dynamic Cart Calculations**: Instant calculations for quantity adjustments, promotional discounts, and payment processing fees (Cash 0%, UPI 0.5%, Debit Card 1.0%, Credit Card 2.0%, Net Banking 1.5%).
- **Instant Stock Sync**: Real-time inventory deduction in MySQL upon checkout completion.
- **Customer Lookup**: Fast customer profile lookup or instant on-counter customer registration.
- **Shift & Sales History**: Comprehensive sales audit log for reviewing transactions processed during the cashier's active shift.

#### 📸 Employee & POS Portal Showcase:
| Cashier POS Interface | Sales Order Processing |
| :---: | :---: |
| ![Employee Dashboard](images/Employee_Portal/Employee_Dashboard.png) | ![Employee Sales Order](images/Employee_Portal/Employee_Sales_Order.png) |

| Customer Directory & Registration | Sales Records Audit |
| :---: | :---: |
| ![Employee Customers](images/Employee_Portal/Employee_Customers.png) | ![Employee Sales](images/Employee_Portal/Employee_Sales.png) |

---

### 4. 🚚 Supplier Portal (`/supplier/*`)
Dedicated B2B vendor portal enabling external distributors and wholesalers to manage deliveries and payouts:
- **Order Fulfillment Pipeline**: Purchase orders issued by the store with automated status progression (`Pending` ➔ `In Progress` ➔ `Shipped` ➔ `Delivered`).
- **Itemized PO Invoicing**: Inspection of purchase order line items, batch numbers, unit wholesale costs, and delivery addresses.
- **Logistics Dispatch Tracking**: Shipping mode tracking (Road, Rail, Air, Express Courier), carrier details, and dispatch confirmations.
- **Payments & Ledger**: Real-time reconciliation of total invoiced amounts, completed payments, and outstanding store balances.
- **Bank & Business Profile**: Self-service management of payout banking details (IFSC, Account Number, Bank Name) and dispatch warehouse contacts.

#### 📸 Supplier Portal Showcase:
| Supplier Fulfillment Dashboard | Purchase Orders Pipeline |
| :---: | :---: |
| ![Supplier Dashboard](images/Supplier_Portal/Supplier_Portal_Dashboard.png) | ![Supplier Purchase Orders](images/Supplier_Portal/Supplier_Portal_Purchase_Order.png) |

| Logistics & Delivery Details | Payments & Ledger Balance |
| :---: | :---: |
| ![Delivery Details](images/Supplier_Portal/Supplier_Portal_Delivery_Details.png) | ![Supplier Payments](images/Supplier_Portal/Supplier_Portal_Payments.png) |

<details>
<summary><b>📸 Click to Expand Additional Supplier Screens (Bank & Warehouse Profile)</b></summary>
<br/>

| Supplier Bank & Warehouse Profile |
| :---: |
| ![Supplier Profile](images/Supplier_Portal/Supplier_Portal_profile.png) |

</details>

---

### 5. 🔐 Multi-Role Authentication
Unified entry point supporting role-based sign-in and customer self-registration:

| Unified Role-Selector Login | Customer Registration Portal |
| :---: | :---: |
| ![Sign In Page](images/Authentication/Sign_In_Page.png) | ![Register Page](images/Authentication/Register_page.png) |

---

## ☁️ Production AWS Cloud Deployment & Architecture

InventoryPro utilizes a decoupled **React SPA + Node.js REST API architecture** on AWS. Amazon CloudFront provides a single-domain routing setup that terminates SSL and simplifies CORS configuration between the static frontend and the backend API.

```mermaid
flowchart TD
    subgraph Clients["🌐 Client Layer"]
        User["User Web Browser<br/>(HTTPS / Desktop & Mobile)"]
    end

    subgraph Edge["🌍 Edge Layer (Amazon CloudFront CDN)"]
        CF["AWS CloudFront Distribution<br/><code>https://&lt;YOUR_CLOUDFRONT_DOMAIN&gt;.cloudfront.net</code>"]
        Cache["Edge Cache & SSL Termination<br/>Managed-CachingOptimized / CachingDisabled"]
    end

    subgraph StaticStorage["📦 Static Storage (Amazon S3)"]
        S3["Amazon S3 Static Bucket<br/><code>&lt;YOUR_S3_BUCKET_NAME&gt;</code><br/>(React 19 SPA Static Build)"]
    end

    subgraph Compute["⚡ Compute Layer (Amazon EC2 & Docker)"]
        EC2["Amazon EC2 (Ubuntu 24.04 LTS)<br/><code>t3.micro (us-east-1)</code>"]
        Docker["Docker Engine Container<br/><code>inventorypro-api (Node.js 20 Express)</code><br/>Host Port 80 ➔ Container Port 5000"]
    end

    subgraph Database["🗄️ Relational Persistence (Amazon RDS)"]
        RDS[("Amazon RDS MySQL 8.0 Engine<br/><code>&lt;YOUR_RDS_DB_NAME&gt;</code><br/>SSL Encrypted Connection Pool")]
    end

    User -->|HTTPS :443| CF
    CF -->|Default Route /*| S3
    CF -->|API Route /api/*| EC2
    EC2 --> Docker
    Docker -->|TLS/SSL Pool :3306| RDS
```

### 🏛️ AWS Infrastructure Component Breakdown

1. **Global Content Delivery (Amazon CloudFront)**:
   - **Distribution Domain**: `https://<YOUR_CLOUDFRONT_DOMAIN>.cloudfront.net`
   - **Unified Single-Origin Endpoint**: Operates as a reverse proxy router terminating SSL/TLS, simplifying cross-origin request handling.
   - **Path Behavior Routing**:
     - `/*` (Default) ➔ Directed to **Amazon S3** static hosting with `Managed-CachingOptimized` for fast edge delivery of static assets.
     - `/api/*` ➔ Dynamically proxied to the **Amazon EC2** container origin with `Managed-CachingDisabled` and `Managed-AllViewerExceptHostHeader` to pass authentication headers (`Authorization: Bearer <JWT>`).
   - **Allowed HTTP Methods**: Configured for `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`.
   - **Origin Access Control (OAC)**: S3 bucket is restricted from public internet access; only CloudFront edge requests can read static assets.

2. **Frontend Static Web Hosting (Amazon S3)**:
   - **Bucket**: `<YOUR_S3_BUCKET_NAME>` (US East, `us-east-1`).
   - Hosts pre-compiled, gzip-compressed React 19 production artifacts (`index.html`, chunked JavaScript bundles, and Tailwind CSS assets).

3. **Backend Container Compute (Amazon EC2 + Docker)**:
   - **Instance**: `t3.micro` running Ubuntu Linux in a custom AWS VPC security group allowing inbound HTTP (80) and SSH (22).
   - Multi-stage Docker container runs Node.js 20 Express backend as an unprivileged system user (`appuser`).
   - Health check probe pinging `/live` provides container liveness verification.

4. **Cloud Managed Relational Database (Amazon RDS MySQL 8.0)**:
   - **Instance Endpoint**: `<YOUR_RDS_ENDPOINT>:3306`.
   - Security group strictly gates access to port 3306 with SSL enforcement (`DB_SSL=true`).
   - Relational schema with 22 normalized tables maintaining relational integrity, automated sequences, and transactional consistency.

---

## 🛠️ Technology Stack & Dependencies

| Layer | Technology | Version | Function in System |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React + Vite | React 19.2 / Vite 8.0 | Single Page Application (SPA) architecture |
| **Styling & Design System** | Tailwind CSS | Tailwind CSS 4.2 | Responsive UI components, glassmorphism, and color accents |
| **Routing** | React Router DOM | v7.13 | Client-side routing with role-based protected route guards |
| **Edge CDN** | AWS CloudFront | Cloud-native | SSL termination, reverse proxy routing, and global asset edge caching |
| **Static Storage** | AWS S3 | Cloud-native | Static object hosting with Origin Access Control (OAC) |
| **Backend Runtime** | Node.js + Express.js | Node 20 / Express 5.2 | RESTful API service with route controllers and middleware |
| **Containerization** | Docker (Alpine Linux) | Docker 24+ | Lightweight, reproducible multi-stage application image |
| **Cloud Compute** | AWS EC2 (Ubuntu 24.04 LTS) | t3.micro | Production host running Dockerized backend services |
| **Database** | Amazon RDS MySQL | MySQL 8.0 | Fully managed cloud database with SSL encryption and pooling |
| **State & Data Fetching** | TanStack Query | React Query 5.94 | Server-state caching, automatic cache invalidation, and refetching |
| **Authentication** | JWT + Bcrypt | jsonwebtoken 9.0 / bcrypt 6.0 | Stateless cryptographic tokens and salted password hashing (10 rounds) |
| **Visual Analytics** | Chart.js & Recharts | Chart.js 4.5 | Interactive business intelligence charts and distribution graphs |

---

## 🗄️ Database Architecture

The relational schema (`retail_db`) incorporates 22 normalized tables:

```
category ─────────► product ──────────► inventory
                       │                     │
                       ├─► product_desc      ├─► product_reorder
                       │                     └─► stock_adjustment
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

## 🚀 AWS Cloud Deployment Runbook

### 1. Build and Run Backend via Docker on EC2
```bash
# Clone repository on EC2 instance
git clone <YOUR_GITHUB_REPOSITORY_URL> app
cd app

# Build multi-stage Docker image
sudo docker build -t inventorypro-backend -f server/Dockerfile .

# Run container on host port 80 connected to Amazon RDS
# For CORS_ORIGIN, supply your CloudFront distribution URL or custom domain
sudo docker run -d --name inventorypro-api --restart always \
  -p 80:5000 \
  -e PORT=5000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=<YOUR_JWT_SECRET_STRING> \
  -e DB_HOST=<YOUR_RDS_ENDPOINT> \
  -e DB_PORT=3306 \
  -e DB_USER=<YOUR_RDS_USERNAME> \
  -e DB_PASSWORD=<YOUR_RDS_PASSWORD> \
  -e DB_NAME=retail_db \
  -e DB_SSL=true \
  -e CORS_ORIGIN="https://<YOUR_CLOUDFRONT_DOMAIN>.cloudfront.net" \
  inventorypro-backend
```

### 2. Build and Deploy Frontend to S3 & CloudFront
```bash
cd client
npm install
npm run build

# Upload production artifacts to Amazon S3
aws s3 sync dist s3://<YOUR_S3_BUCKET_NAME> --delete

# Invalidate CloudFront edge cache to publish instantly
aws cloudfront create-invalidation --distribution-id <YOUR_CLOUDFRONT_DISTRIBUTION_ID> --paths "/*"
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- **Node.js** (`>= 20.x`)
- **MySQL Server** (`>= 8.0`)

### 2. Environment Configuration
Copy template environment files in both folders:

**`server/.env`**:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=retail_db
```

**`client/.env`**:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Initialize Database & Seed Products
```bash
cd server
npm install
node init_db.js
```

### 4. Run Development Servers
```bash
# Start backend API (http://localhost:5000)
cd server && npm run dev

# Start frontend client (http://localhost:5173)
cd client && npm run dev
```

---

## 🔒 Security Architecture & Compliance

- **Decoupled Secret Governance**: Production credentials and database certificates are excluded from version control via `.dockerignore` and `.gitignore`.
- **Single-Domain Edge Routing**: CloudFront serves both SPA static assets and REST API endpoints from a single domain origin, avoiding third-party cookie blocking and simplifying CORS configuration.
- **SSL/TLS In-Transit Encryption**: All public traffic uses HTTPS; communication between backend compute and Amazon RDS enforces TLS database pooling (`DB_SSL=true`).
- **SQL Injection Neutralization**: Database interactions strictly use parameterized queries (`mysql2/promises`) preventing SQL manipulation.
- **Cryptographic Password Hashing**: Passwords are saved as one-way non-reversible hashes using `bcrypt` (10 salt rounds).
- **Stateless Session Security**: JWT authorization tokens automatically expire in 12 hours with portal-type verification in every route handler.
