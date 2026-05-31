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
10. [Authorization Model](#authorization-model)
11. [Database Schema](#database-schema)
12. [Message Queue](#message-queue)
13. [Testing](#testing)
14. [CI/CD Pipeline](#cicd-pipeline)
15. [Deployment](#deployment)

---

## Project Overview

Enterprise Task Management System cho phép:
- Đăng nhập/đăng ký bằng email và mật khẩu
- Tạo và quản lý công việc theo nhóm (group)
- Giao công việc cho thành viên trong nhóm
- Theo dõi tiến độ công việc
- Nhận thông báo qua email
- Quản trị hệ thống (Admin): quản lý tài khoản, phân quyền

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
| Security | JWT + MicroProfile JWT | - |

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
│  │   Auth   │  │   Task   │  │   User   │  │  Group   │  │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │  │
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
cp .env.example .env
# Edit .env với MAIL credentials
```

### 3. Start Infrastructure

```bash
docker-compose up -d postgres rabbitmq kafka redis
docker-compose ps
```

### 4. Generate JWT Keys (nếu chưa có)

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
./mvnw quarkus:dev
```

Backend chạy tại: **http://localhost:8080**

### 6. Run Frontend Web

```bash
cd frontend-web
npm install
npm run dev
```

Web chạy tại: **http://localhost:3000**

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
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── .env.example
├── docker-compose.yml
├── docker-compose.prod.yml
├── docs/
├── backend/
├── frontend-web/
└── frontend-app/
```

### Backend Structure

```
backend/
├── src/main/java/com/taskmanagement/
│   ├── auth/
│   │   ├── controller/
│   │   ├── service/           # AuthService, JwtService, PasswordService
│   │   └── dto/               # AuthResponse (có userId, role), LoginRequest, RegisterRequest
│   ├── user/
│   │   ├── controller/        # UserController (ADMIN-only: set enabled, role)
│   │   ├── service/           # UserService (setUserEnabled, updateUserRole)
│   │   ├── repository/
│   │   ├── entity/
│   │   ├── dto/
│   │   └── mapper/
│   ├── task/
│   │   ├── controller/
│   │   ├── service/           # Có permission checks chi tiết
│   │   ├── repository/        # findVisibleToUser()
│   │   ├── entity/
│   │   ├── dto/
│   │   ├── mapper/
│   │   ├── producer/
│   │   ├── consumer/
│   │   └── scheduler/
│   ├── group/
│   │   ├── controller/        # TaskGroupController (có removeMember)
│   │   ├── service/           # TaskGroupService (có removeMember)
│   │   ├── repository/
│   │   ├── entity/            # TaskGroup, TaskGroupMember, GroupRole
│   │   └── dto/
│   ├── comment/
│   │   ├── controller/        # CommentController REST (GET/POST)
│   │   ├── service/           # CommentService (save + broadcast WS)
│   │   ├── repository/        # CommentRepository
│   │   ├── entity/            # TaskComment
│   │   ├── dto/               # CommentDto, CreateCommentRequest
│   │   └── websocket/         # TaskCommentWebSocket, WebSocketRoomManager
│   ├── notification/mail/
│   ├── audit/
│   ├── config/
│   │   ├── security/
│   │   └── rabbitmq/
│   └── common/
│       ├── exception/
│       └── response/
├── src/main/resources/
│   ├── application.yml
│   ├── privateKey.pem
│   ├── publicKey.pem
│   └── db/migration/
│       ├── V1__init_schema.sql
│       └── V5__add_task_groups.sql
└── pom.xml
```

### Frontend Web Structure

```
frontend-web/
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # Admin badge + menu "Quản trị" (chỉ role ADMIN)
│   │   └── CommentSection.tsx  # Chat/comment real-time component
│   ├── hooks/
│   │   └── useTaskWebSocket.ts # WebSocket hook (real-time comments)
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── TasksPage.tsx
│   │   ├── TaskDetailPage.tsx  # Có CommentSection
│   │   ├── CreateTaskPage.tsx
│   │   ├── UsersPage.tsx
│   │   ├── GroupsPage.tsx      # Có remove member
│   │   └── AdminPage.tsx       # Trang quản trị (chỉ ADMIN)
│   ├── services/
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── taskService.ts
│   │   ├── userService.ts      # Có setUserEnabled, updateUserRole
│   │   ├── groupService.ts     # Có removeMember
│   │   └── commentService.ts   # GET/POST comments
│   ├── store/
│   │   └── authStore.ts        # Lưu userId và role thực từ API
│   ├── types/
│   │   └── index.ts            # AuthResponse có userId, role; Comment type
│   ├── App.tsx                 # Có AdminRoute guard + /admin route
│   └── main.tsx
└── package.json
```

---

## Backend Development

### Authorization Annotations

```java
// Yêu cầu JWT hợp lệ (mọi user đã login)
@Authenticated

// Yêu cầu role ADMIN (system admin)
@RolesAllowed("ADMIN")

// Không yêu cầu xác thực (public)
// (không annotation hoặc @PermitAll)
```

JWT token chứa `groups` = [user.role], nên `@RolesAllowed("ADMIN")` hoạt động đúng khi user có `role = "ADMIN"`.

### Create New Entity

1. **Entity Class**

```java
@Entity
@Table(name = "my_entity")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MyEntity extends PanacheEntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;
}
```

2. **DTO**

```java
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MyEntityDto {
    private UUID id;
    private String name;
}
```

3. **Repository**

```java
@ApplicationScoped
public class MyEntityRepository implements PanacheRepositoryBase<MyEntity, UUID> {
    public List<MyEntity> findByName(String name) {
        return list("name", name);
    }
}
```

4. **Service**

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

5. **Controller**

```java
@Path("/api/my-entities")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class MyEntityController {
    @Inject MyEntityService service;

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") UUID id) {
        return Response.ok(ApiResponse.success(service.findById(id))).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMIN")  // Chỉ admin mới xóa được
    public Response delete(@PathParam("id") UUID id) {
        service.delete(id);
        return Response.ok(ApiResponse.success("Deleted", null)).build();
    }
}
```

### Add Flyway Migration

```sql
-- V6__add_new_table.sql
CREATE TABLE new_table (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Frontend Web Development

### Route Guards

```typescript
// Protected route — yêu cầu đăng nhập
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

// Admin route — yêu cầu role ADMIN
function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
```

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

### Kiểm tra role trong component

```typescript
const { user } = useAuthStore()
const isAdmin = user?.role === 'ADMIN'

// Chỉ render nếu là admin
{isAdmin && <AdminPanel />}
```

---

## API Documentation

### Authentication

#### POST /api/auth/register
Đăng ký bằng email và mật khẩu.

**Request:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /api/auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "JWT...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "userId": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "pictureUrl": null,
    "role": "USER"
  }
}
```

> `role` có thể là `"USER"` hoặc `"ADMIN"`. Frontend dùng giá trị này để hiện/ẩn menu Quản trị.

### Users (yêu cầu xác thực)

| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/api/users/me` | Authenticated | Thông tin user hiện tại |
| GET | `/api/users` | Authenticated | Danh sách tất cả user |
| GET | `/api/users/{id}` | Authenticated | Lấy user theo ID |
| GET | `/api/users/email/{email}` | Authenticated | Tìm theo email |
| PATCH | `/api/users/{id}/enabled` | **ADMIN** | Bật/tắt tài khoản |
| PATCH | `/api/users/{id}/role` | **ADMIN** | Đổi role user |

**PATCH /api/users/{id}/enabled**
```json
{ "enabled": false }
```

**PATCH /api/users/{id}/role**
```json
{ "role": "ADMIN" }
```

### Tasks (yêu cầu xác thực)

| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| POST | `/api/tasks` | Group ADMIN | Tạo task |
| GET | `/api/tasks/my` | Authenticated | Task hiển thị được |
| GET | `/api/tasks/assigned` | Authenticated | Task được giao cho tôi |
| GET | `/api/tasks/created` | Authenticated | Task tôi tạo |
| GET | `/api/tasks/{id}` | Assignee/Assigner/Group ADMIN | Chi tiết task |
| PUT | `/api/tasks/{id}` | Group ADMIN hoặc Assigner | Cập nhật task |
| PATCH | `/api/tasks/{id}/status` | Assignee hoặc Group ADMIN | Đổi trạng thái |
| PATCH | `/api/tasks/{id}/assign` | Group ADMIN hoặc Assigner | Giao lại task |

### Groups (yêu cầu xác thực)

| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/api/groups` | Authenticated | Nhóm của tôi |
| POST | `/api/groups` | Authenticated | Tạo nhóm mới |
| GET | `/api/groups/{id}/members` | Group MEMBER | Xem thành viên |
| POST | `/api/groups/{id}/members` | Group ADMIN | Thêm thành viên |
| PATCH | `/api/groups/{id}/members/{userId}/role` | Group ADMIN | Đổi role thành viên |
| DELETE | `/api/groups/{id}/members/{userId}` | Group ADMIN | Xóa thành viên |

### Comments & Real-time Chat

| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/api/tasks/{taskId}/comments` | Authenticated | Lấy toàn bộ comments của task |
| POST | `/api/tasks/{taskId}/comments` | Authenticated | Thêm comment mới |

**WebSocket endpoint:**
```
ws://localhost:8080/ws/task/{taskId}
```

- Mỗi task có một "room" riêng. Khi user mở trang Task Detail, frontend kết nối WS.
- Khi ai đó POST comment mới qua REST, backend lưu DB rồi broadcast message đến tất cả client đang kết nối cùng task.
- Message format:
```json
{
  "type": "NEW_COMMENT",
  "comment": {
    "id": "uuid",
    "taskId": "uuid",
    "authorId": "uuid",
    "authorName": "string",
    "authorEmail": "string",
    "content": "string",
    "createdAt": "2026-05-30T10:00:00Z"
  }
}
```

**Frontend flow:**
1. `useQuery` fetch toàn bộ comments khi mở trang (REST)
2. `useTaskWebSocket` mở WS connection → nhận `NEW_COMMENT` → cập nhật React Query cache
3. Khi submit comment: POST REST → response trả về ngay → hiển thị; WS broadcast đến người khác

### Task Status Flow

```
OPEN ──→ PENDING ──→ PROCESS ──→ DONE
   │         │            │
   ▼         ▼            ▼
 CANCEL    CANCEL       CANCEL
```

---

## Authorization Model

Hệ thống có 2 cấp phân quyền độc lập:

### 1. System Role (global)

Lưu trong `users.role`, nhúng vào JWT claim `groups`.

| Role | Mô tả | Quyền thêm |
|------|-------|------------|
| `USER` | Mặc định | Không có quyền đặc biệt |
| `ADMIN` | Quản trị viên hệ thống | Bật/tắt tài khoản, đổi role bất kỳ user |

Được kiểm tra bằng `@RolesAllowed("ADMIN")` ở backend, và `user?.role === 'ADMIN'` ở frontend.

### 2. Group Role (per-group)

Lưu trong `task_group_members.role`.

| Role | Mô tả |
|------|-------|
| `ADMIN` | Admin nhóm — tạo task, thêm/xóa/đổi role thành viên |
| `MEMBER` | Thành viên — xem task, cập nhật status task của mình |

### Permission Matrix

| Hành động | Điều kiện |
|-----------|-----------|
| Tạo task trong group | Group ADMIN |
| Xem task | Assignee OR Assigner OR Group ADMIN |
| Cập nhật task | Group ADMIN OR Assigner |
| Cập nhật status | Assignee OR Group ADMIN |
| Thêm/xóa thành viên | Group ADMIN (không tự xóa mình) |
| Đổi role thành viên | Group ADMIN |
| Bật/tắt tài khoản user | System ADMIN |
| Đổi role user | System ADMIN |

---

## Database Schema

### Tables

#### users
| Column | Type | Ghi chú |
|--------|------|---------|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| name | VARCHAR(255) | |
| picture_url | VARCHAR(500) | |
| password_hash | VARCHAR(500) | |
| role | VARCHAR(50) | `USER` hoặc `ADMIN` |
| enabled | BOOLEAN | Tài khoản bị vô hiệu hóa khi false |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| last_login_at | TIMESTAMPTZ | |

#### tasks
| Column | Type | Ghi chú |
|--------|------|---------|
| id | UUID | PK |
| title | VARCHAR(255) | NOT NULL |
| content | TEXT | |
| point | INTEGER | DEFAULT 0 |
| priority | VARCHAR(20) | LOW/MEDIUM/HIGH/URGENT |
| status | VARCHAR(20) | OPEN/PENDING/PROCESS/DONE/CANCEL |
| start_time | TIMESTAMPTZ | NOT NULL |
| end_time | TIMESTAMPTZ | NOT NULL |
| assigner_id | UUID | FK → users |
| assignee_id | UUID | FK → users |
| group_id | UUID | FK → task_groups (nullable) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |
| cancelled_at | TIMESTAMPTZ | |
| cancel_reason | TEXT | |

#### task_groups
| Column | Type | Ghi chú |
|--------|------|---------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| owner_id | UUID | FK → users |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### task_group_members
| Column | Type | Ghi chú |
|--------|------|---------|
| id | UUID | PK |
| group_id | UUID | FK → task_groups |
| user_id | UUID | FK → users |
| role | VARCHAR(20) | `ADMIN` hoặc `MEMBER` |
| created_at | TIMESTAMPTZ | |

#### task_history
| Column | Type | Ghi chú |
|--------|------|---------|
| id | UUID | PK |
| task_id | UUID | FK → tasks |
| user_id | UUID | FK → users |
| action | VARCHAR(50) | |
| old_status | VARCHAR(20) | |
| new_status | VARCHAR(20) | |
| changes | JSONB | |
| created_at | TIMESTAMPTZ | |

---

## Message Queue

### RabbitMQ Queues

| Queue | Purpose |
|-------|---------|
| task.created.email | Gửi email khi tạo task |
| task.deadline.warning | Cảnh báo deadline |
| task.done.notification | Thông báo hoàn thành |

### Kafka Topics

| Topic | Purpose |
|-------|---------|
| task-events | Audit log sự kiện task |
| user-events | Audit log sự kiện user |

---

## Testing

```bash
# Backend
cd backend && ./mvnw test

# Frontend Web
cd frontend-web && npm run test

# Mobile
cd frontend-app && npm run test
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

#### ci.yml — chạy khi push/PR
- Backend: Build + Unit Tests (Java 21)
- Frontend Web: Lint + Type Check + Build
- Mobile App: Type Check
- Docker Build (trên main branch)

#### deploy.yml — chạy khi release hoặc manual trigger
- Build Docker image → Push registry → Deploy → Health check

### Secrets Required

```
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
SERVER_HOST
SERVER_USER
SERVER_SSH_KEY
FIREBASE_SERVICE_ACCOUNT
FIREBASE_PROJECT_ID
FIREBASE_TOKEN
```

---

## Deployment

### Docker

```bash
cd backend
docker build -t task-management-backend .
docker-compose -f ../docker-compose.prod.yml up -d
```

### Environment Variables

| Variable | Default | Mô tả |
|----------|---------|-------|
| DB_HOST | localhost | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | taskmanagement | Database name |
| DB_USERNAME | taskuser | |
| DB_PASSWORD | taskpass123 | |
| RABBITMQ_HOST | localhost | |
| RABBITMQ_PORT | 5672 | |
| KAFKA_HOST | localhost | |
| KAFKA_PORT | 9092 | |

---

## Troubleshooting

```bash
# Database
docker-compose logs postgres
pg_isready -h localhost -p 5432 -U taskuser

# RabbitMQ
docker-compose logs rabbitmq
# UI: http://localhost:15672 (guest/guest)

# Kafka
docker-compose logs kafka
docker exec taskmanagement-kafka kafka-topics --list --bootstrap-server localhost:9092
```

---

## Contact

Team Development: dev@taskmanagement.com
