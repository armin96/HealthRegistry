

# Health Registry: Hybrid Database Implementation SQL and NoSQL 

Name : Seyedarmin Hosseinilargani <br>
Student ID: GH1042143



A  hybrid database platform that demonstrates Polyglot Persistence, integrating MySQL 8 for structured administrative data and MongoDB 7 for semi-structured clinical documentation.




---

##  Overview
The Health Registry is designed to handle the dual nature of modern medical records:
- Administrative Logic (SQL): Patient IDs, Doctor scheduling, Departments, and Prescriptions — where ACID compliance and strict relations are paramount..
- Clinical Flexibility (NoSQL): Medical history, diverse lab reports, and system-wide audit logs — where schema-less flexibility allows for varied data collected at the point of care.

---

## Technology Stack
- **Database (Relational)**: MySQL 8
- **Database (NoSQL)**: MongoDB 7
- **Runtime**: Node.js v18+
- **Backend**: Express.js, EJS (Templating), Morgan (Logging)
- **Frontend**: Vanilla CSS, Responsive Grid/Flexbox (Premium UI)

---



---

## Setup & Installation

### 1. Prerequisites
Ensure you have MySQL and MongoDB instances running.

### 2. Install Dependencies
```bash
cd app-node
npm install
```

### 3. Initialize & Seed Database 
This script will drop existing schemas, recreate them, and populate the system with a massive, unique dataset of **1,900+ records**.
```bash
npm run setup
```

### 4. Start the Application
```bash
npm start
```
The dashboard will be available at: [http://localhost:3000](http://localhost:3000)

---
