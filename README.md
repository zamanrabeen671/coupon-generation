# Coupon Microservice System

This project is a **microservices-based coupon system** for an e-commerce platform. It includes:

- **coupon-service**: Manages creation of coupons (user-specific or time-specific) and assigning them to users.  
- **validation-service**: Handles coupon redemption and validation.  
- **RabbitMQ**: For communication between services.  
- **MySQL**: Shared database (`shopup`) for storing users, coupons, and assignments.  

Both services are built with **Node.js + TypeScript + TypeORM**.

---

## **Features**

1. Admin can create **time-specific** or **user-specific** coupons.  
2. Admin can assign **user-specific coupons** to individual users.  
3. Users can redeem coupons via validation-service.  
4. All services communicate via **RabbitMQ**.  
5. Supports Docker and Docker Compose for easy setup.  

---


#Configure Environment Variables

Create .env files in both services:

coupon-service/.env

DB_HOST=mysql-db
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=yourpassword
DB_NAME=shopup
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
PORT=3000

validation-service/.env
DB_HOST=mysql-db
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=yourpassword
DB_NAME=shopup
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
PORT=3001

3️⃣ Build & Run with Docker Compose
docker-compose up --build




AAPI Endpoints
Coupon Service (Admin)
1️⃣ Register User

POST /api/v1/auth/register
Body:

{
  "email": "user@example.com",
  "password": "123456"
}

2️⃣ Login

POST /api/v1/auth/login
Body:

{
  "email": "user@example.com",
  "password": "123456"
}

3️⃣ Create Coupon

POST /api/v1/admin/coupons
Body:

{
  "code": "WELCOME10",
  "type": "TIME_SPECIFIC",
  "discountPercent": 10,
  "validFrom": "2025-11-12T00:00:00Z",
  "validUntil": "2025-11-20T00:00:00Z",
  "maxUsagePerUser": 5
}

4️⃣ Assign Coupon to User

POST /api/v1/admin/coupons/:couponId/assign
Body:

{
  "userId": 1
}

Validation Service (User)
1️⃣ Redeem Coupon

POST /api/v1/redeem
Body:

{
  "userId": 1,
  "code": "WELCOME10"
}


✅ Returns:

Success if coupon is valid.

Error if coupon is expired, max usage reached, or invalid.
