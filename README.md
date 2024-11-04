# Fake-Bank_BACK

## Table of Contents

1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Tech Stack & Dependencies](#tech-stack--dependencies)
4. [Installation & Setup](#installation--setup)

---

### Project Overview

This project is a back-end application simulating a bank's services, including authentication module (login, registeration) and user module (transfer, BPAY, recurring payment etc.). The application is built using NestJS.

---

### Directory Structure

```
/src
├── auth
|   ├── auth.service.ts
|   └── auth.controller.ts
├── schemas
|   ├── BPAY.schema.ts
|   ├── existingPayee.schema.ts
|   └── ...
├── User
|    ├── dto
|    |    ├── creatAcc.dto.ts
|    |    └── ...
|    ├── user.controller.ts
|    ├── user.service.ts
|    └── user.module.ts 
├── app.controller.ts
├── app.service.ts
└── main.ts
```

### Tech Stack & Dependencies

- **Framework**: NestJS
- **Database**: MongoDB
- **Additional Libraries**:
  - `Cron`: for checking user expiration status everyday
  - `mongoose`: An Object Data Modeling (ODM) library for MongoDB, used in the Node.js environment. Can greatly simplify interactions with the MongoDB database

### Installation & Setup

1. **Node Version Requirement**: nest.js version >= 10.4.4

2. **Install Dependencies**:
   Run the following commands to set up the project:

   ```
   # Install core dependencies
   npm

   # Install additional required packages
   npm install class-validator class-transformer
   npm install cron 
   npm install mongoose

3. **Project Startup**:
   - Ensure all dependencies are installed.
   - Run "npm start" to launch the project on the local development server.
   - To test with local mongodb database, create a local mongodb database on localhost:27017 using tools like mongodb compass.
      - Go to app.module.ts.
      - uncomment line 10:  `//imports: [MongooseModule.forRoot('mongodb://localhost:27017'),` 
      - comment line 11: `imports: [MongooseModule.forRoot(...)`
   
