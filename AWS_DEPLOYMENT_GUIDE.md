# InventoryPro — Complete AWS Deployment & Architecture Guide

This comprehensive guide details the full architecture of **InventoryPro**, the compatibility enhancements implemented to make it cloud-native, and step-by-step instructions for deploying to **Amazon Web Services (AWS)**.

---

## 📋 Table of Contents
1. [Project Architecture Overview](#1-project-architecture-overview)
2. [Cloud & AWS Compatibility Upgrades Implemented](#2-cloud--aws-compatibility-upgrades-implemented)
3. [Choosing Your AWS Deployment Architecture](#3-choosing-your-aws-deployment-architecture)
4. [Step 1: Setting up Amazon RDS (MySQL 8.0)](#step-1-setting-up-amazon-rds-mysql-80)
5. [Step 2: Database Schema Migration & Seeding](#step-2-database-schema-migration--seeding)
6. [Step 3: Deploying the Application](#step-3-deploying-the-application)
   - [Option A (Recommended): AWS App Runner](#option-a-recommended-aws-app-runner)
   - [Option B: AWS Elastic Beanstalk](#option-b-aws-elastic-beanstalk)
   - [Option C: AWS S3 + CloudFront (Frontend) & App Runner / ECS (Backend)](#option-c-aws-s3--cloudfront-frontend--app-runner--ecs-backend)
   - [Option D: AWS EC2 / AWS Lightsail (Docker Compose)](#option-d-aws-ec2--aws-lightsail-docker-compose)
7. [Environment Variables Reference](#environment-variables-reference)
8. [Troubleshooting & Verification](#troubleshooting--verification)

---

## 1. Project Architecture Overview

**InventoryPro** is a modern full-stack multi-portal retail management web platform:

```
                            ┌──────────────────────────────────────────────┐
                            │               Clients / Users                │
                            │   (Admin, Employee/POS, Supplier, Customer)  │
                            └──────────────────────┬───────────────────────┘
                                                   │ HTTPS
                                                   ▼
                            ┌──────────────────────────────────────────────┐
                            │      Unified Service / Reverse Proxy         │
                            │      (AWS App Runner / CloudFront / ALB)     │
                            └──────────────┬────────────────┬──────────────┘
                                           │                │
                        / (Web App Assets) │                │ /api/* (REST API)
                                           ▼                ▼
                    ┌────────────────────────────┐    ┌────────────────────────────┐
                    │    React 19 + Vite 8 SPA   │    │  Express.js 5 REST Server  │
                    │   Tailwind CSS 4 + Lucide  │    │  JWT + RBAC Authentication │
                    └────────────────────────────┘    └─────────────┬──────────────┘
                                                                    │ MySQL Connection Pool
                                                                    │ (Keep-Alive + SSL)
                                                                    ▼
                                                      ┌────────────────────────────┐
                                                      │    Amazon RDS (MySQL 8.0)  │
                                                      │ 17+ Normalized Tables + FK │
                                                      └────────────────────────────┘
```

- **Frontend (`client/`)**: React 19, Vite 8, Tailwind CSS 4, React Router 7, TanStack Query 5, Chart.js, Lucide React.
- **Backend (`server/`)**: Node.js, Express.js 5, MySQL2 Connection Pool, JWT stateless authentication, bcrypt password hashing.
- **Database**: MySQL 8.0 with normalized relational schemas (Products, Inventory, Suppliers, Customers, Sales, Taxes).

---

## 2. Cloud & AWS Compatibility Upgrades Implemented

To make this project completely compatible with AWS production environments, the following changes were applied:

1. **Centralized Cloud API Configuration (`client/src/config/api.js`)**:
   - Replaced scattered and brittle `import.meta.env.VITE_API_URL` references with a single source of truth.
   - When deployed together on AWS or behind CloudFront/Nginx, requests dynamically use relative `/api` paths without hardcoding `localhost:5000` or breaking in production builds.
   - When deployed decoupled (Frontend on S3/CloudFront and Backend on separate domain), setting `VITE_API_URL=https://api.yourdomain.com/api` at build time routes requests seamlessly.

2. **Unified Single-Container Express Static Serving (`server/src/index.js`)**:
   - Express 5 now detects and serves the compiled React application from `client/dist`.
   - Includes SPA fallback middleware compatible with Express 5 routing that serves `index.html` for client-side routing while keeping `/api/*` and `/health` intact.
   - **Benefit**: You can deploy the entire full-stack app as **one single AWS container/service** (saving 50% hosting cost and eliminating CORS/SSL certificate headaches).

3. **Cloud-Native Health Check Endpoints**:
   - `/health` & `/api/health`: Validates database connectivity with `SELECT 1`, reporting uptime, timestamp, and status. Used by AWS ALB, App Runner, and Route 53 health checkers.
   - `/live` & `/api/live`: Lightweight liveness check returning `200 OK` immediately so container orchestrators do not kill containers while database connections establish.

4. **AWS RDS SSL & Connection Pool Resilience (`server/src/config/db.js`)**:
   - Added support for `DB_SSL=true/false` and automatic detection of remote AWS RDS endpoints.
   - Configured `rejectUnauthorized: false` for AWS RDS Amazon CA certificates so connections don't fail certificate chain verification.
   - Added `enableKeepAlive: true`, `keepAliveInitialDelay: 10000`, and `connectTimeout: 20000` to prevent AWS NAT Gateways and ALBs from severing idle TCP database connections.

5. **Graceful Shutdown & Resilience**:
   - Handled `SIGTERM` and `SIGINT` signals so AWS ECS, App Runner, or Kubernetes rolling updates close HTTP listeners and drain MySQL pools cleanly.
   - Added database retry connection loops during startup to prevent container crash loops during RDS reboot or scale events.

6. **Production Containerization**:
   - Root `Dockerfile`: Production multi-stage build that compiles Vite client and runs Express server on Node 20 Alpine with a non-root user.
   - `server/Dockerfile` & `client/Dockerfile`: Standalone containers for decoupled deployments.
   - `docker-compose.yml`: Local & EC2 orchestrator with MySQL 8.
   - `apprunner.yaml`: Native AWS App Runner configuration.
   - `.ebextensions/nodecommand.config` & `Procfile`: AWS Elastic Beanstalk configurations.

---

## 3. Choosing Your AWS Deployment Architecture

| Architecture | Best For | AWS Services | Complexity | Estimated Monthly Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Option A (Recommended)** | Most developers, fast setup, auto-scaling | **AWS App Runner** + **AWS RDS MySQL** | Low | Free tier eligible / ~$15–$25 |
| **Option B** | Classic PaaS managed environment | **AWS Elastic Beanstalk** + **AWS RDS** | Low-Medium | Free tier eligible / ~$15–$30 |
| **Option C** | High-traffic, enterprise decoupled | **AWS S3 + CloudFront** + **ECS Fargate** + **RDS** | Medium-High | Pay per request / ~$25–$50 |
| **Option D** | Budget-conscious single virtual machine | **AWS EC2 (t4g.small)** or **AWS Lightsail** | Low | ~$3.50 – $10 (flat) |

---

## Step 1: Setting up Amazon RDS (MySQL 8.0)

1. Sign in to the **[AWS Management Console](https://console.aws.amazon.com/)** and navigate to **Amazon RDS**.
2. Click **Create database**:
   - **Choose a database creation method**: *Standard create*
   - **Engine type**: *MySQL*
   - **Engine Version**: *MySQL 8.0.35* (or latest 8.0.x)
   - **Templates**: *Free tier* (or *Production* depending on your budget)
   - **Settings**:
     - DB instance identifier: `inventorypro-db`
     - Master username: `admin`
     - Master password: `<Choose a strong password>` (save this securely)
   - **Instance configuration**: `db.t4g.micro` or `db.t3.micro`
   - **Storage**: 20 GiB gp3 (General Purpose SSD)
   - **Connectivity**:
     - Virtual Private Cloud (VPC): *Default VPC*
     - Public access: Select **Yes** if you want to initialize the database from your local machine, or **No** if only connecting via AWS VPC / Cloud9 / Bastion.
     - VPC security group: Select *Create new* (e.g. `inventorypro-rds-sg`).
   - **Additional configuration**:
     - Initial database name: `retail_db`
     - Backup: Optional (7 days retention recommended)
3. Click **Create database** (takes 5–10 minutes).
4. **Configure Security Group Inbound Rules**:
   - Go to **EC2 Console** -> **Security Groups** -> select `inventorypro-rds-sg`.
   - Edit **Inbound rules**:
     - Type: *MySQL/Aurora (3306)*
     - Source:
       - To seed from local machine: Select *My IP*.
       - For AWS App Runner / ECS / Beanstalk: Add the security group of your compute service.
   - Save rules.
5. Copy your **RDS Endpoint** from the RDS console (e.g., `inventorypro-db.c0xyz123.us-east-1.rds.amazonaws.com`).

---

## Step 2: Database Schema Migration & Seeding

From your local machine terminal, test connection and seed all tables and master data directly into Amazon RDS:

### Windows (PowerShell):
```powershell
# Set RDS connection credentials
$env:DB_HOST="inventorypro-db.c0xyz123.us-east-1.rds.amazonaws.com"
$env:DB_PORT="3306"
$env:DB_USER="admin"
$env:DB_PASSWORD="your_rds_password"
$env:DB_NAME="retail_db"
$env:DB_SSL="true"

# Rebuild schema and seed products
cd server
npm run init-db
```

### Linux / macOS:
```bash
export DB_HOST="inventorypro-db.c0xyz123.us-east-1.rds.amazonaws.com"
export DB_PORT="3306"
export DB_USER="admin"
export DB_PASSWORD="your_rds_password"
export DB_NAME="retail_db"
export DB_SSL="true"

cd server
npm run init-db
```

You will see:
```text
Starting Database Initialization...
Found 7 model files to execute.
✅ Database schema rebuilt successfully.
Total 160+ products seeded.
✅ Full initialization and seeding completed.
```

---

## Step 3: Deploying the Application

### Option A (Recommended): AWS App Runner

**AWS App Runner** is a fully managed service that makes it easy to quickly deploy containerized web applications and APIs at scale, with automatic SSL, zero-downtime deployments, and automatic load balancing.

#### Method 1: Deploy Directly via GitHub
1. Push your project to a GitHub repository.
2. In AWS Console, open **AWS App Runner** -> click **Create service**.
3. **Source**:
   - Source type: **Source code repository**
   - Connect your GitHub account and select your `DBMS_PROJECT` repository.
   - Branch: `main`
   - Deployment trigger: **Automatic** (deploys on every git push)
4. **Configure build**:
   - Select **Use a configuration file** (App Runner will automatically detect `apprunner.yaml`).
   - Or select *Configure all settings here*:
     - Runtime: `Node.js 20`
     - Build command: `npm install --prefix server && npm install --prefix client && npm run build --prefix client`
     - Start command: `node server/src/index.js`
     - Port: `5000`
5. **Configure service**:
   - Service name: `inventorypro-app`
   - Virtual CPU & Memory: `1 vCPU, 2 GB`
   - **Environment variables**:
     - `NODE_ENV`: `production`
     - `PORT`: `5000`
     - `JWT_SECRET`: `<a-secure-random-32-char-string>`
     - `DB_HOST`: `<your-rds-endpoint>`
     - `DB_PORT`: `3306`
     - `DB_USER`: `admin`
     - `DB_PASSWORD`: `<your-rds-password>`
     - `DB_NAME`: `retail_db`
     - `DB_SSL`: `true`
     - `CORS_ORIGIN`: `*`
6. **Security & VPC Connection**:
   - Under **Networking** -> **Outgoing network traffic**:
     - If RDS is in a private VPC, select **Custom VPC** and add an App Runner **VPC Connector** attached to your RDS VPC subnets and security group.
     - If RDS is publicly accessible with security group allowing App Runner IP, select **Public endpoint**.
7. Click **Create & Deploy**.
8. In ~5 minutes, App Runner gives you a live HTTPS URL (e.g. `https://xxxxxx.us-east-1.awsapprunner.com`). Open it in your browser!

---

### Option B: AWS Elastic Beanstalk

1. Compress your project into a `.zip` file (excluding `node_modules` and `.git`).
2. Go to **AWS Elastic Beanstalk** -> **Create application**.
3. Select **Web server environment**:
   - Platform: **Node.js**
   - Platform branch: **Node.js 20 running on 64bit Amazon Linux 2023**
4. Under **Application code**, choose **Upload your code** and select your `.zip`.
5. Under **Configure more options**:
   - **Software** -> **Environment properties**: Add `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true`, `JWT_SECRET`, `PORT=5000`.
   - **Networking**: Select the same VPC as your RDS instance.
6. Click **Create app**. Elastic Beanstalk automatically executes the root `Procfile` (`web: node server/src/index.js`).

---

### Option C: AWS S3 + CloudFront (Frontend) & App Runner / ECS (Backend)

For large-scale production architectures separating static assets from API compute:

1. **Deploy Backend API**:
   - Build and deploy `server/` to AWS App Runner or AWS ECS Fargate following Option A.
   - Note your Backend URL: e.g. `https://api.yourdomain.com` or `https://xxxx.awsapprunner.com`.
2. **Build Frontend**:
   ```bash
   cd client
   # Provide your backend URL during build
   $env:VITE_API_URL="https://api.yourdomain.com/api"
   npm run build
   ```
3. **Upload to Amazon S3**:
   - Create an S3 bucket (e.g. `inventorypro-client-assets`).
   - Enable static website hosting (Index document: `index.html`, Error document: `index.html`).
   - Upload the contents of `client/dist/` to the S3 bucket.
4. **Create CloudFront Distribution**:
   - Origin 1: S3 bucket (for static files `/*`).
   - Origin 2: Backend API endpoint (for `/api/*`).
   - Error Pages: Configure custom error response for 403/404 to return `/index.html` with HTTP 200 (enables React Router deep linking).

---

### Option D: AWS EC2 / AWS Lightsail (Docker Compose)

For flat-rate low cost hosting on a single virtual server:

1. Launch an **EC2 Instance** (Ubuntu 22.04 / Amazon Linux 2023) or **AWS Lightsail Instance** ($3.50 – $7.00/mo).
2. Connect to the instance via SSH.
3. Install Docker & Docker Compose:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose git
   sudo systemctl enable --now docker
   sudo usermod -aG docker $USER
   ```
4. Clone your repository:
   ```bash
   git clone <your-repo-url>
   cd DBMS_PROJECT
   ```
5. Create `.env` in root or edit `docker-compose.yml` with your database credentials.
6. Start the unified container:
   ```bash
   docker-compose up -d --build
   ```
7. Open port `5000` (or `80`) in your EC2 Security Group.

---

## 7. Environment Variables Reference

### Backend (`server/`)
| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | Port for the HTTP server to listen on (default `5000`) | `5000` |
| `NODE_ENV` | Yes | Node environment (`development` or `production`) | `production` |
| `JWT_SECRET` | Yes | Cryptographic secret for signing JWT bearer tokens | `32+ random characters` |
| `DB_HOST` | Yes | Database hostname or AWS RDS endpoint | `inventorypro.c0xyz.rds.amazonaws.com` |
| `DB_PORT` | Optional | Database port (default `3306`) | `3306` |
| `DB_USER` | Yes | Database username | `admin` |
| `DB_PASSWORD` | Yes | Database password | `StrongSecret123!` |
| `DB_NAME` | Yes | MySQL database name | `retail_db` |
| `DB_SSL` | Optional | Enable SSL encryption (`true` for RDS, `false` for local) | `true` |
| `DB_CONNECTION_LIMIT` | Optional | Max MySQL pool connections (default `10`) | `10` |
| `CORS_ORIGIN` | Optional | Allowed origin URLs (comma-separated, or `*` for all) | `https://yourdomain.com` |

### Frontend (`client/`)
| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Optional | Backend API URL. If empty in production, defaults to `/api` (ideal for unified container or CloudFront). Set only if frontend is on a separate domain. | `https://api.yourdomain.com/api` |

---

## 8. Troubleshooting & Verification

### 1. Test Healthcheck Endpoints
Once your service is deployed, test the health check:
```bash
curl https://<your-aws-domain>/health
```
Expected response:
```json
{
  "status": "UP",
  "uptime": 142.5,
  "timestamp": "2026-11-05T09:30:00.000Z",
  "database": "connected"
}
```

### 2. Common Issues & Solutions

- **`ETIMEDOUT` or Cannot connect to database**:
  - *Cause*: Security Group on AWS RDS is blocking port 3306.
  - *Fix*: Go to AWS EC2 -> Security Groups -> select your RDS Security Group -> add Inbound Rule for MySQL (Port 3306) allowing your App Runner / EC2 Security Group.

- **`HANDSHAKE_SSL_ERROR`**:
  - *Cause*: Strict CA check failed or SSL mismatch.
  - *Fix*: Ensure `DB_SSL=true`. The updated `server/src/config/db.js` uses `rejectUnauthorized: false` to safely encrypt communication with Amazon's CA certificates.

- **React Router 404 on page refresh**:
  - *Cause*: Web server looking for physical file instead of falling back to `index.html`.
  - *Fix*: In the unified Docker/Express deployment, the SPA fallback in `server/src/index.js` already handles this. On S3/CloudFront, set Custom Error Response for 403/404 to return `/index.html` with HTTP 200.

