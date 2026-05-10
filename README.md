# Task Management System

Enterprise Task Management System - Quản lý công việc cho doanh nghiệp

## 🚀 Quick Start

### 1. Clone & Setup

```bash
git clone <repository-url>
cd taskmanagement
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your local database, messaging, and mail credentials
```

### 3. Run Services

```bash
# Backend (port 8080)
cd backend && ./mvnw quarkus:dev

# Frontend Web (port 3000)
cd frontend-web && npm install && npm run dev
```

---

## 📁 Project Structure

```
taskmanagement/
├── backend/              # Quarkus Backend (Java 21)
│   ├── src/main/java/   # Java source code
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── privateKey.pem
│   │   └── db/migration/
│   └── pom.xml
│
├── frontend-web/        # React Web App
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── store/      # Zustand stores
│   └── package.json
│
├── frontend-app/       # React Native App
│   ├── src/
│   │   ├── screens/    # Screen components
│   │   └── services/  # API services
│   └── package.json
│
├── docs/               # Documentation
│   ├── DEVELOPER.md     # Developer guide
│   ├── USER_GUIDE.md   # User guide + QC checklist
│   └── PRODUCT_OWNER.md # PO documentation
│
└── .github/workflows/  # CI/CD pipelines
```

---

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Backend | Quarkus + Java | 21 |
| Database | PostgreSQL | 16 |
| Message Queue | RabbitMQ | 3.13 |
| Event Streaming | Apache Kafka | 7.5 |
| Frontend Web | React + Vite | 18 / 5 |
| Mobile App | React Native + Expo | 50 |
| Auth | Email/password + JWT | - |

---

## ✨ Features

- ✅ **Authentication** - Đăng nhập/đăng ký bằng email và mật khẩu
- ✅ **Task CRUD** - Tạo, đọc, cập nhật công việc
- ✅ **Task Assignment** - Giao việc cho đồng nghiệp
- ✅ **Status Tracking** - Theo dõi trạng thái: OPEN → PENDING → PROCESS → DONE
- ✅ **Email Notifications** - Thông báo khi có task mới, deadline, hoàn thành
- ✅ **Deadline Warning** - Cảnh báo trước 1 giờ
- ✅ **Dashboard** - Thống kê công việc
- ✅ **Audit Log** - Kafka event streaming

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [DEVELOPER.md](docs/DEVELOPER.md) | Developer guide - setup, coding, API |
| [USER_GUIDE.md](docs/USER_GUIDE.md) | User guide + **40+ test cases** |
| [PRODUCT_OWNER.md](docs/PRODUCT_OWNER.md) | PO documentation - specs, plan |

---

## 🔧 Development

### Backend

```bash
cd backend

# Development mode
./mvnw quarkus:dev

# Build
./mvnw package -DskipTests

# Run tests
./mvnw test
```

### Frontend Web

```bash
cd frontend-web

# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build
```

### Mobile App

```bash
cd frontend-app

# Install dependencies
npm install

# Start Expo
npx expo start

# Build Android
npx expo build:android

# Build iOS
npx expo build:ios
```

---

## 🔐 Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskmanagement
DB_USERNAME=taskuser
DB_PASSWORD=taskpass123

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672

# Kafka
KAFKA_HOST=localhost
KAFKA_PORT=9092

# Mail
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

---

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register  # Register with email/password
POST /api/auth/login     # Login with email/password
```

### Tasks
```
POST   /api/tasks                    # Create task
GET    /api/tasks/my                 # Get my tasks
GET    /api/tasks/assigned           # Get assigned tasks
GET    /api/tasks/created           # Get created tasks
GET    /api/tasks/{id}              # Get task by ID
PUT    /api/tasks/{id}              # Update task
PATCH  /api/tasks/{id}/status       # Update status
PATCH  /api/tasks/{id}/assign       # Reassign task
```

### Users
```
GET    /api/users/me                # Get current user
GET    /api/users                   # Get all users
```

---

## ✅ QC Checklist

Xem chi tiết trong [USER_GUIDE.md](docs/USER_GUIDE.md)

| Module | Test Cases |
|--------|-----------|
| Authentication | 7 cases |
| Task Management | 18 cases |
| Email Notifications | 5 cases |
| UI/UX | 8 cases |
| Security | 7 cases |
| Performance | 5 cases |
| Mobile App | 7 cases |

---

## 🚢 Deployment

### GitHub Actions CI/CD

Tự động chạy khi có push/PR:
- Build Backend (Java 21)
- Build Frontend Web
- Type Check Mobile

---

## 📞 Contact

| Team | Email |
|------|-------|
| Development | dev@taskmanagement.com |
| QA | qa@taskmanagement.com |
| Product Owner | po@taskmanagement.com |

---

## 📄 License

MIT License
