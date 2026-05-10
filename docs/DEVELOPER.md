# Task Management System - Developer Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Backend Development](#backend-development)
7. [Frontend Web Development](#frontend-web-development)
8. [Mobile App Development](#mobile-app-development)
9. [API Documentation](#api-documentation)
10. [Database Schema](#database-schema)
11. [Message Queue](#message-queue)
12. [Testing](#testing)
13. [CI/CD Pipeline](#cicd-pipeline)
14. [Deployment](#deployment)

---

## Project Overview

Enterprise Task Management System cho phép:
- Đăng nhập qua Google OAuth2
- Tạo và quản lý công việc
- Giao công việc cho người khác
- Theo dõi tiến độ công việc
- Nhận thông báo qua email

---

## Technology Stack

### Backend
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Quarkus | 3.8.1 |
| Language | Java | 21 |
| ORM | Hibernate Panache | - |
| Database | PostgreSQL | 16 |
| Message Queue | RabbitMQ | 3.13 |
| Event Streaming | Apache Kafka | 7.5 |
| Migration | Flyway | - |
| Security | JWT + Google OAuth2 | - |

### Frontend Web
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | 18.2.0 |
| Build Tool | Vite | 5.1.0 |
| Language | TypeScript | 5.3.3 |
| Routing | React Router | 6.22.0 |
| State | Zustand | 4.5.0 |
| UI | Tailwind CSS | 3.4.1 |
| API Client | Axios + React Query | - |

### Mobile App
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React Native + Expo | 50.0.0 |
| Language | TypeScript | 5.1.3 |
| Navigation | React Navigation | 6.x |
| State | Zustand | 4.5.0 |
| Storage | AsyncStorage | 1.21.0 |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Web (React) │  │ Mobile (Expo)│  │    Other     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway / REST                       │
│                      (http://localhost:8080)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Auth   │  │   Task   │  │   User   │  │ Notifica │  │
│  │ Service  │  │ Service  │  │ Service  │  │  tion    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL     │  │    RabbitMQ    │  │     Kafka       │
│   (Database)     │  │  (Email Queue) │  │ (Audit Events) │
│   port: 5432     │  │   port: 5672   │  │  port: 9092    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Getting Started

### Prerequisites

- Java 21
- Node.js 18+
- Docker & Docker Compose
- Maven 3.9+
- Git

### 1. Clone & Setup

```bash
git clone <repository-url>
cd taskmanagement
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials:
# - GOOGLE_CLIENT_ID (from Google Cloud Console)
# - GOOGLE_CLIENT_SECRET
# - MAIL credentials
```

### 3. Start Infrastructure

```bash
# Start all infrastructure services
docker-compose up -d postgres rabbitmq kafka redis

# Check services are running
docker-compose ps
```

### 4. Generate JWT Keys (if not exists)

```bash
cd backend/src/main/resources
openssl genrsa -out privateKey.pem 2048
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt \
  -in privateKey.pem -out privateKey.pem
openssl rsa -in privateKey.pem -pubout -out publicKey.pem
```

### 5. Run Backend

```bash
cd backend

# Development mode (hot reload)
./mvnw quarkus:dev

# Or build and run
./mvnw package -DskipTests
java -jar target/quarkus-app/quarkus-run.jar
```

Backend sẽ chạy tại: **http://localhost:8080**

### 6. Run Frontend Web

```bash
cd frontend-web
npm install
npm run dev
```

Web sẽ chạy tại: **http://localhost:3000**

### 7. Run Mobile App

```bash
cd frontend-app
npm install
npx expo start
```

---

## Project Structure

### Root Structure

```
taskmanagement/
├── .github/
│   └── workflows/           # CI/CD pipelines
│       ├── ci.yml           # CI Pipeline
│       └── deploy.yml        # Deployment Pipeline
├── .env.example             # Environment template
├── docker-compose.yml        # Infrastructure (dev)
├── docker-compose.prod.yml  # Full stack (prod)
├── docs/                    # Documentation
├── backend/                 # Quarkus Backend
├── frontend-web/            # React Web App
├── frontend-app/            # React Native App
```

### Backend Structure

```
backend/
├── src/main/java/com/taskmanagement/
│   ├── auth/                    # Authentication
│   │   ├── controller/         # REST endpoints
│   │   ├── service/            # Business logic
│   │   ├── dto/                # Request/Response DTOs
│   │   └── security/           # JWT handling
│   ├── user/                    # User Management
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   ├── dto/
│   │   └── mapper/
│   ├── task/                    # Task Management (Core)
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   ├── dto/
│   │   ├── mapper/
│   │   ├── producer/           # RabbitMQ/Kafka producers
│   │   ├── consumer/          # Message consumers
│   │   └── scheduler/          # Scheduled jobs
│   ├── notification/            # Email notifications
│   │   └── mail/
│   ├── audit/                   # Audit logging
│   │   ├── kafka/
│   │   └── consumer/
│   ├── config/                  # Configuration
│   │   ├── security/
│   │   ├── rabbitmq/
│   │   └── kafka/
│   └── common/                  # Shared utilities
│       ├── exception/
│       ├── response/
│       ├── constants/
│       └── utils/
├── src/main/resources/
│   ├── application.yml         # Main config
│   ├── application-dev.properties
│   ├── application-prod.properties
│   ├── privateKey.pem          # JWT signing key
│   ├── publicKey.pem          # JWT verification key
│   └── db/migration/          # Flyway migrations
│       └── V1__init_schema.sql
├── src/test/java/              # Unit tests
├── pom.xml
├── Dockerfile
└── docker-compose.yml
```

### Frontend Web Structure

```
frontend-web/
├── src/
│   ├── components/              # Reusable components
│   │   └── Layout.tsx         # Main layout
│   ├── pages/                   # Page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── TasksPage.tsx
│   │   ├── TaskDetailPage.tsx
│   │   ├── CreateTaskPage.tsx
│   │   └── UsersPage.tsx
│   ├── services/               # API services
│   │   ├── api.ts              # Axios instance
│   │   ├── authService.ts
│   │   ├── taskService.ts
│   │   └── userService.ts
│   ├── store/                   # Zustand stores
│   │   ├── authStore.ts
│   │   └── taskStore.ts
│   ├── types/                   # TypeScript types
│   │   └── index.ts
│   ├── App.tsx                 # Main app with routing
│   └── main.tsx                # Entry point
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── .env.example
```

### Mobile App Structure

```
frontend-app/
├── src/
│   ├── screens/                 # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── TaskListScreen.tsx
│   │   ├── TaskDetailScreen.tsx
│   │   ├── CreateTaskScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── navigation/             # Navigation config
│   │   └── AppNavigator.tsx
│   ├── services/               # API services
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── taskService.ts
│   │   └── userService.ts
│   ├── store/                  # Zustand stores
│   │   └── authStore.ts
│   ├── types/                  # TypeScript types
│   │   └── index.ts
│   └── App.tsx                 # Main app
├── app.json
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Backend Development

### Create New Entity

1. **Entity Class** - `src/main/java/com/taskmanagement/{module}/entity/`

```java
@Entity
@Table(name = "my_entity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyEntity extends PanacheEntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
}
```

2. **DTO** - `src/main/java/com/taskmanagement/{module}/dto/`

```java
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyEntityDto {
    private UUID id;
    private String name;
}
```

3. **Mapper** - `src/main/java/com/taskmanagement/{module}/mapper/`

```java
@Mapper(componentModel = "cdi")
public interface MyEntityMapper {
    MyEntityMapper INSTANCE = Mappers.getMapper(MyEntityMapper.class);
    
    MyEntityDto toDto(MyEntity entity);
    MyEntity toEntity(MyEntityDto dto);
}
```

4. **Repository** - `src/main/java/com/taskmanagement/{module}/repository/`

```java
@ApplicationScoped
public class MyEntityRepository implements PanacheRepositoryBase<MyEntity, UUID> {
    public List<MyEntity> findByName(String name) {
        return list("name", name);
    }
}
```

5. **Service** - `src/main/java/com/taskmanagement/{module}/service/`

```java
@ApplicationScoped
public class MyEntityService {
    @Inject
    MyEntityRepository repository;
    
    public MyEntityDto findById(UUID id) {
        return repository.findByIdOptional(id)
            .map(mapper::toDto)
            .orElseThrow(() -> new ResourceNotFoundException("Entity", "id", id));
    }
}
```

6. **Controller** - `src/main/java/com/taskmanagement/{module}/controller/`

```java
@Path("/api/my-entities")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class MyEntityController {
    @Inject
    MyEntityService service;
    
    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") UUID id) {
        return Response.ok(ApiResponse.success(service.findById(id))).build();
    }
}
```

### Add Flyway Migration

Tạo file trong `src/main/resources/db/migration/`:

```sql
-- V2__add_new_table.sql
CREATE TABLE new_table (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Frontend Web Development

### Add New API Service

```typescript
// src/services/myService.ts
import api from './api'
import type { MyType, ApiResponse } from '../types'

export const myService = {
  getAll: async (): Promise<MyType[]> => {
    const response = await api.get<ApiResponse<MyType[]>>('/api/my-endpoint')
    return response.data.data || []
  },
}
```

### Add New Page

```typescript
// src/pages/MyPage.tsx
import { useQuery } from '@tanstack/react-query'
import { myService } from '../services/myService'

export default function MyPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-data'],
    queryFn: myService.getAll,
  })

  return <div>{/* Page content */}</div>
}
```

### Add Route

```typescript
// src/App.tsx
import MyPage from './pages/MyPage'

<Route path="my-page" element={<MyPage />} />
```

---

## Mobile App Development

### Add New Screen

```typescript
// src/screens/MyScreen.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function MyScreen() {
  return (
    <View style={styles.container}>
      <Text>My Screen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
```

### Add Navigation

```typescript
// src/navigation/AppNavigator.tsx
import MyScreen from '../screens/MyScreen'

<Tab.Screen name="MyScreen" component={MyScreen} />
```

---

## API Documentation

### Authentication

#### POST /api/auth/google
Login với Google token

**Request:**
```json
{
  "googleToken": "string (Google ID token)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "accessToken": "JWT token",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "email": "user@example.com",
    "name": "User Name",
    "pictureUrl": "https://..."
  }
}
```

### Tasks

#### POST /api/tasks
Tạo công việc mới

**Request:**
```json
{
  "title": "string (required)",
  "content": "string (optional)",
  "point": 10,
  "priority": "LOW|MEDIUM|HIGH|URGENT",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-20T18:00:00Z",
  "assigneeId": "UUID (required)"
}
```

#### GET /api/tasks/my
Lấy danh sách công việc của user

#### PATCH /api/tasks/{id}/status
Cập nhật trạng thái

**Request:**
```json
{
  "status": "OPEN|PENDING|PROCESS|DONE|CANCEL",
  "cancelReason": "string (optional)"
}
```

### Task Status Flow

```
OPEN ──→ PENDING ──→ PROCESS ──→ DONE
   │         │            │
   ▼         ▼            ▼
 CANCEL    CANCEL       CANCEL
```

### Users

#### GET /api/users/me
Lấy thông tin user hiện tại

#### GET /api/users
Lấy danh sách tất cả users

---

## Database Schema

### Tables

#### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| name | VARCHAR(255) | |
| picture_url | VARCHAR(500) | |
| google_id | VARCHAR(255) | UNIQUE |
| role | VARCHAR(50) | DEFAULT 'USER' |
| enabled | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| last_login_at | TIMESTAMPTZ | |

#### tasks
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| title | VARCHAR(255) | NOT NULL |
| content | TEXT | |
| point | INTEGER | DEFAULT 0 |
| priority | VARCHAR(20) | NOT NULL |
| status | VARCHAR(20) | NOT NULL |
| start_time | TIMESTAMPTZ | NOT NULL |
| end_time | TIMESTAMPTZ | NOT NULL |
| assigner_id | UUID | FK → users |
| assignee_id | UUID | FK → users |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| completed_at | TIMESTAMPTZ | |
| cancelled_at | TIMESTAMPTZ | |
| cancel_reason | TEXT | |

---

## Message Queue

### RabbitMQ Queues

| Queue | Purpose | Consumer |
|-------|---------|----------|
| task.created.email | Gửi email khi tạo task | TaskEventConsumer |
| task.deadline.warning | Cảnh báo deadline | DeadlineCheckScheduler |
| task.done.notification | Thông báo hoàn thành | TaskEventConsumer |

### Kafka Topics

| Topic | Purpose |
|-------|---------|
| task-events | Audit log các sự kiện task |
| user-events | Audit log các sự kiện user |

---

## Testing

### Backend Tests

```bash
cd backend
./mvnw test
```

### Frontend Web Tests

```bash
cd frontend-web
npm run test
```

### Mobile App Tests

```bash
cd frontend-app
npm run test
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

#### CI Pipeline (ci.yml)
Tự động chạy khi có push hoặc PR:
- Backend: Build + Unit Tests (Java 21)
- Frontend Web: Lint + Type Check + Build
- Mobile App: Type Check
- Docker Build (trên main branch)

#### Deploy Pipeline (deploy.yml)
Chạy khi có release hoặc manual trigger:
- Build Docker image
- Push lên registry
- Deploy lên server
- Health check

### Secrets Required

```
DOCKERHUB_USERNAME     # Docker Hub username
DOCKERHUB_TOKEN       # Docker Hub access token
SERVER_HOST          # Production server IP
SERVER_USER          # SSH user
SERVER_SSH_KEY       # SSH private key
FIREBASE_SERVICE_ACCOUNT  # Firebase service account
FIREBASE_PROJECT_ID   # Firebase project ID
FIREBASE_TOKEN       # Firebase CLI token
```

---

## Deployment

### Docker Deployment

```bash
# Build image
cd backend
docker build -t task-management-backend .

# Run with docker-compose
docker-compose -f ../docker-compose.prod.yml up -d
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_NAME | Database name | taskmanagement |
| DB_USERNAME | Database user | taskuser |
| DB_PASSWORD | Database password | taskpass123 |
| RABBITMQ_HOST | RabbitMQ host | localhost |
| RABBITMQ_PORT | RabbitMQ port | 5672 |
| KAFKA_HOST | Kafka host | localhost |
| KAFKA_PORT | Kafka port | 9092 |
| GOOGLE_CLIENT_ID | Google OAuth2 Client ID | - |
| GOOGLE_CLIENT_SECRET | Google OAuth2 Client Secret | - |

---

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL
docker-compose logs postgres

# Verify connection
pg_isready -h localhost -p 5432 -U taskuser
```

### Message Queue Issues

```bash
# Check RabbitMQ
docker-compose logs rabbitmq

# Access RabbitMQ UI
# http://localhost:15672 (guest/guest)
```

### Kafka Issues

```bash
# Check Kafka
docker-compose logs kafka

# List topics
docker exec taskmanagement-kafka kafka-topics --list --bootstrap-server localhost:9092
```

---

## Contact

Team Development: dev@taskmanagement.com
