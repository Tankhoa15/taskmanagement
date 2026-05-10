# Task Management System - Tài Liệu Cho Product Owner

## Mục Lục
1. [Tổng Quan Dự Án](#tổng-quan-dự-án)
2. [Mục Tiêu & Phạm Vi](#mục-tiêu--phạm-vi)
3. [User Stories](#user-stories)
4. [Sơ Đồ Luồng Nghiệp Vụ](#sơ-đồ-luồng-nghiệp-vụ)
5. [Yêu Cầu Chức Năng](#yêu-cầu-chức-năng)
6. [Yêu Cầu Phi Chức Năng](#yêu-cầu-phi-chức-năng)
7. [Thiết Kế Database](#thiết-kế-database)
8. [API Specification](#api-specification)
9. [Mockups & Wireframes](#mockups--wireframes)
10. [Definition of Done](#definition-of-done)
11. [Kế Hoạch Phát Triển](#kế-hoạch-phát-triển)
12. [Rủi Ro & Mitigation](#rủi-ro--mitigation)
13. [CI/CD & Deployment](#cicd--deployment)

---

## Tổng Quan Dự Án

### Thông Tin Dự Án

| Thông tin | Chi tiết |
|-----------|----------|
| Tên dự án | Task Management System |
| Phiên bản | 1.0.0 |
| Ngày bắt đầu | 2024 |
| Mục tiêu | Quản lý công việc hiệu quả cho team |
| Số lượng user dự kiến | 50-100 users |

### Công Nghệ Sử Dụng

| Layer | Công nghệ |
|-------|------------|
| Web Frontend | React + Vite + TypeScript |
| Mobile App | React Native + Expo |
| Backend API | Quarkus + Java 21 |
| Database | PostgreSQL 16 |
| Message Queue | RabbitMQ 3.13 |
| Event Streaming | Apache Kafka 7.5 |
| Authentication | Email/password + JWT |

---

## Mục Tiêu & Phạm Vi

### Mục Tiêu Chính

1. **Quản lý công việc tập trung**
   - Tạo, cập nhật, theo dõi tiến độ
   - Giao việc giữa các thành viên

2. **Giao tiếp hiệu quả**
   - Thông báo email tự động
   - Cảnh báo deadline

3. **Transparency & Accountability**
   - Audit log các thay đổi
   - Theo dõi người tạo/người nhận

### Phạm Vi (In Scope)

| STT | Tính năng | Priority |
|-----|-----------|----------|
| 1 | Authentication bằng email/password | Must |
| 2 | CRUD Task | Must |
| 3 | Giao việc cho user khác | Must |
| 4 | Cập nhật trạng thái task | Must |
| 5 | Email notification | Must |
| 6 | Deadline warning | Must |
| 7 | Dashboard thống kê | Should |
| 8 | Web application | Must |
| 9 | Mobile application (iOS/Android) | Should |

### Phạm Vi (Out of Scope)

- SSO với các provider khác
- Integration với Slack/Teams
- File attachment
- Comment/Discussion
- Time tracking chi tiết
- Gantt chart
- Mobile offline mode
- Multi-language

---

## User Stories

### US-001: Đăng Nhập Hệ Thống

**Mô tả:** Là một user, tôi muốn đăng nhập bằng email và mật khẩu để sử dụng hệ thống.

**Acceptance Criteria:**
- [ ] User có thể đăng nhập bằng email và mật khẩu
- [ ] Hệ thống tạo user mới nếu chưa tồn tại
- [ ] User nhận được JWT token sau khi đăng nhập
- [ ] Token có hiệu lực 24 giờ

### US-002: Tạo Công Việc Mới

**Mô tả:** Là một user, tôi muốn tạo công việc và giao cho đồng nghiệp.

**Acceptance Criteria:**
- [ ] User nhập được tiêu đề, nội dung, độ ưu tiên, thời gian
- [ ] User chọn được người được giao từ danh sách
- [ ] Sau khi tạo, email được gửi đến người được giao
- [ ] Task được lưu vào database

### US-003: Cập Nhật Trạng Thái Công Việc

**Mô tả:** Là người nhận công việc, tôi muốn cập nhật trạng thái công việc.

**Acceptance Criteria:**
- [ ] Người nhận có thể thay đổi: OPEN → PENDING → PROCESS → DONE
- [ ] Có thể hủy công việc với lý do
- [ ] Khi hoàn thành, email thông báo gửi đến cả 2 bên

### US-004: Theo Dõi Deadline

**Mô tả:** Hệ thống tự động cảnh báo khi công việc sắp hết hạn.

**Acceptance Criteria:**
- [ ] Scheduler chạy mỗi 10 phút
- [ ] 1 giờ trước deadline, email cảnh báo được gửi
- [ ] Email gửi đến người được giao

### US-005: Xem Dashboard

**Mô tả:** Là một user, tôi muốn xem tổng quan công việc của mình.

**Acceptance Criteria:**
- [ ] Hiển thị số lượng task theo từng trạng thái
- [ ] Hiển thị danh sách task khẩn cấp
- [ ] Thống kê cập nhật real-time

### US-006: Tìm Kiếm & Lọc Công Việc

**Mô tả:** Là một user, tôi muốn tìm kiếm và lọc công việc.

**Acceptance Criteria:**
- [ ] Có thể lọc theo trạng thái
- [ ] Có thể tìm kiếm theo tiêu đề
- [ ] Kết quả lọc cập nhật ngay lập tức

---

## Sơ Đồ Luồng Nghiệp Vụ

### Luồng Tạo Công Việc

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  User A     │     │   Backend   │     │  RabbitMQ   │
│  Tạo Task   │────▶│   Service   │────▶│   Queue     │
└─────────────┘     └──────┬───────┘     └──────┬──────┘
                           │                     │
                           ▼                     ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  PostgreSQL  │     │   Email     │
                    │  (Save Task) │     │   Service   │
                    └──────────────┘     └─────────────┘
                           │                     │
                           │                     ▼
                           │              ┌─────────────┐
                           │              │  User B     │
                           │              │  (Nhận mail)│
                           │              └─────────────┘
                           ▼
                    ┌──────────────┐
                    │    Kafka     │
                    │ (Audit Log)  │
                    └──────────────┘
```

### Luồng Deadline Warning

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Scheduler  │     │   Backend    │     │  RabbitMQ   │
│  (10 phút)  │────▶│   Service    │────▶│   Queue     │
└─────────────┘     └──────┬───────┘     └──────┬──────┘
                           │                     │
                           ▼                     ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  PostgreSQL  │     │   Email     │
                    │(Query Tasks) │     │   Service   │
                    └──────────────┘     └─────────────┘
```

### Luồng Hoàn Thành Task

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  User B    │     │   Backend    │     │  RabbitMQ   │
│  DONE Task │────▶│   Service    │────▶│   Queue     │
└─────────────┘     └──────┬───────┘     └──────┬──────┘
                           │                     │
                           ▼                     ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  PostgreSQL  │     │   Email     │
                    │(Update Status│     │  × 2 Emails │
                    └──────────────┘     │(Assigner +  │
                           │             │ Assignee)   │
                           ▼             └─────────────┘
                    ┌──────────────┐
                    │    Kafka     │
                    │ (Audit Log)  │
                    └──────────────┘
```

---

## Yêu Cầu Chức Năng

### FR-001: Authentication

| ID | Yêu cầu | Mô tả | Priority |
|----|---------|-------|----------|
| FR-001.1 | Email/password Login | Đăng nhập/đăng ký bằng email và mật khẩu | Must |
| FR-001.2 | JWT Token | Generate JWT sau khi login | Must |
| FR-001.3 | Token Expiry | Token hết hạn sau 24h | Must |
| FR-001.4 | Auto-create User | Tạo user mới nếu chưa tồn tại | Must |

### FR-002: Task Management

| ID | Yêu cầu | Mô tả | Priority |
|----|---------|-------|----------|
| FR-002.1 | Create Task | Tạo task mới | Must |
| FR-002.2 | Update Task | Cập nhật thông tin task | Should |
| FR-002.3 | Update Status | Cập nhật trạng thái task | Must |
| FR-002.4 | Assign Task | Giao task cho user khác | Must |
| FR-002.5 | List Tasks | Liệt kê danh sách task | Must |
| FR-002.6 | Filter Tasks | Lọc task theo trạng thái | Should |
| FR-002.7 | Search Tasks | Tìm kiếm task theo tên | Should |

### FR-003: Notifications

| ID | Yêu cầu | Mô tả | Priority |
|----|---------|-------|----------|
| FR-003.1 | Task Created Email | Gửi email khi tạo task | Must |
| FR-003.2 | Deadline Warning | Cảnh báo 1h trước deadline | Must |
| FR-003.3 | Task Done Email | Gửi email khi task hoàn thành | Must |

### FR-004: Dashboard

| ID | Yêu cầu | Mô tả | Priority |
|----|---------|-------|----------|
| FR-004.1 | Task Stats | Thống kê số task theo trạng thái | Should |
| FR-004.2 | Urgent Tasks | Hiển thị task khẩn cấp | Should |
| FR-004.3 | Quick Actions | Tạo task nhanh | Should |

---

## Yêu Cầu Phi Chức Năng

### NFR-001: Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time | < 200ms (p95) | Backend metrics |
| Page Load Time | < 2s | Frontend analytics |
| Concurrent Users | 100 users | Load testing |

### NFR-002: Availability

| Metric | Target |
|--------|--------|
| Uptime | 99.5% |
| Planned Maintenance | < 4h/month |
| Recovery Time | < 30 phút |

### NFR-003: Security

| Requirement | Implementation |
|-------------|----------------|
| Authentication | Email/password + JWT |
| Data Encryption | HTTPS (TLS 1.2+) |
| Input Validation | Server-side validation |
| SQL Injection | Parameterized queries (Panache) |

### NFR-004: Scalability

| Component | Scaling Strategy |
|-----------|------------------|
| Backend | Horizontal scaling (stateless) |
| Database | Connection pooling |
| Message Queue | RabbitMQ cluster |
| Kafka | Partition replication |

---

## Thiết Kế Database

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     USERS       │       │     TASKS       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◀──┐   │ id (PK)         │
│ email           │   │   │ title           │
│ name            │   │   │ content         │
│ picture_url     │   │   │ point           │
│ password_hash  │   │   │ priority        │
│ role           │   └───│ assigner_id (FK)│
│ enabled        │       │ assignee_id (FK)│
│ created_at      │       │ status          │
│ updated_at      │       │ start_time      │
└─────────────────┘       │ end_time        │
                           │ created_at      │
                           │ updated_at      │
                           │ completed_at    │
                           │ cancelled_at    │
                           └─────────────────┘
                                   │
                                   ▼
                           ┌─────────────────┐
                           │  TASK_HISTORY   │
                           ├─────────────────┤
                           │ id (PK)         │
                           │ task_id (FK)   │
                           │ user_id (FK)   │
                           │ action         │
                           │ old_status     │
                           │ new_status     │
                           │ created_at     │
                           └─────────────────┘
```

### Table Definitions

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    picture_url VARCHAR(500),
    password_hash VARCHAR(500),
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE
);
```

#### tasks
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    point INTEGER NOT NULL DEFAULT 0,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    assigner_id UUID NOT NULL REFERENCES users(id),
    assignee_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancel_reason TEXT
);
```

---

## API Specification

### Authentication API

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
Đăng nhập bằng email và mật khẩu.

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
    "accessToken": "JWT token",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "email": "user@example.com",
    "name": "User Name",
    "pictureUrl": "https://..."
  }
}
```

### Task API

#### POST /api/tasks
Tạo công việc mới.

#### GET /api/tasks/my
Lấy danh sách công việc của user hiện tại.

#### GET /api/tasks/assigned
Lấy công việc được giao.

#### GET /api/tasks/created
Lấy công việc đã tạo.

#### GET /api/tasks/{id}
Lấy chi tiết công việc.

#### PUT /api/tasks/{id}
Cập nhật công việc.

#### PATCH /api/tasks/{id}/status
Cập nhật trạng thái.

#### PATCH /api/tasks/{id}/assign
Giao lại công việc.

### User API

#### GET /api/users/me
Lấy thông tin user hiện tại.

#### GET /api/users
Lấy danh sách tất cả users.

---

## Mockups & Wireframes

### Desktop - Dashboard

```
┌────────────────────────────────────────────────────────────────┐
│  📋 TaskManager              🔔  👤 User Name ▼                │
├──────────┬───────────────────────────────────────────────────┤
│          │                                                   │
│ Dashboard│   Chào mừng, User Name 👋                        │
│ Tasks    │   Cùng xem công việc hôm nay                      │
│ Users    │                                                   │
│          │   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│          │   │ Tổng   │ │ Mới    │ │ Đang   │ │ Hoàn  │    │
│          │   │  15    │ │   3    │ │ xử lý │ │ Done  │    │
│          │   └────────┘ └────────┘ │   5    │ │   7   │    │
│          │                          └────────┘ └────────┘    │
│          │                                                   │
│          │   ⚡ Công việc khẩn cấp                          │
│          │   ┌────────────────────────────────────────────┐  │
│          │   │ Review Pull Request #123                   │  │
│          │   │ Deadline: 15/01/2024 18:00                 │  │
│          │   └────────────────────────────────────────────┘  │
│          │                                                   │
└──────────┴───────────────────────────────────────────────────┘
```

### Mobile - Task List

```
┌─────────────────────────┐
│  🔍 Tìm kiếm...        │
├─────────────────────────┤
│ [Tất cả] [Mới] [Xử lý]│
├─────────────────────────┤
│ ┌─────────────────────┐│
│ │ 🔵 Mới    🔴 Khẩn   ││
│ │ Review Code PR #456  ││
│ │ 👤 John  📅 15/01   ││
│ └─────────────────────┘│
│ ┌─────────────────────┐│
│ │ 🟡 Chờ   🔵 TB      ││
│ │ Fix Bug Login Flow   ││
│ │ 👤 Sarah 📅 16/01   ││
│ └─────────────────────┘│
│                         │
│                   [+]   │
└─────────────────────────┘
```

---

## Definition of Done

### Code Level
- [ ] Code compiles without errors
- [ ] Unit tests pass (>80% coverage for core logic)
- [ ] No critical security vulnerabilities
- [ ] Code follows style guide
- [ ] No TODO comments left

### Functional Level
- [ ] All acceptance criteria met
- [ ] All user stories completed
- [ ] Tested on supported browsers/devices
- [ ] No blocking bugs

### Technical Level
- [ ] API documentation updated
- [ ] Database migrations created
- [ ] Environment variables documented
- [ ] Deployment checklist completed

### Review Level
- [ ] Code review approved
- [ ] QA sign-off received
- [ ] PO acceptance confirmed

---

## Kế Hoạch Phát Triển

### Sprint 1: Core Infrastructure (2 tuần)

| Task | Assigned | Status |
|------|----------|--------|
| Backend project setup | Dev | ☐ |
| Database design | Dev | ☐ |
| Flyway migrations | Dev | ☐ |
| User entity & API | Dev | ☐ |
| Authentication (email/password) | Dev | ☐ |
| Docker Compose setup | Dev | ☐ |

### Sprint 2: Task Management (2 tuần)

| Task | Assigned | Status |
|------|----------|--------|
| Task entity & API | Dev | ☐ |
| Task CRUD operations | Dev | ☐ |
| Task assignment | Dev | ☐ |
| Status update flow | Dev | ☐ |
| Frontend Web - Task pages | Dev | ☐ |
| Mobile App - Task screens | Dev | ☐ |

### Sprint 3: Notifications (2 tuần)

| Task | Assigned | Status |
|------|----------|--------|
| RabbitMQ setup | Dev | ☐ |
| Kafka setup | Dev | ☐ |
| Email service | Dev | ☐ |
| Task created notification | Dev | ☐ |
| Deadline warning scheduler | Dev | ☐ |
| Task done notification | Dev | ☐ |

### Sprint 4: Polish & Deploy (1 tuần)

| Task | Assigned | Status |
|------|----------|--------|
| Dashboard stats | Dev | ☐ |
| Search & filter | Dev | ☐ |
| Unit tests | Dev | ☐ |
| Bug fixes | Dev | ☐ |
| Deployment | Dev | ☐ |

---

## Rủi Ro & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Email/password auth issues | High | Medium | Reset mật khẩu hoặc tạo lại tài khoản |
| Email delivery failures | Medium | Low | Queue retry mechanism |
| Database performance | Medium | Medium | Connection pooling, indexing |
| Mobile app rejection | High | Low | Follow App Store guidelines |
| Security vulnerabilities | High | Low | Regular security audits |
| Integration failures | Medium | Medium | Comprehensive error handling |

---

## CI/CD & Deployment

### CI Pipeline

```
Push/PR → GitHub Actions → Build → Test → Deploy
                    ↓
              Docker Image → Registry
```

### GitHub Actions Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| ci.yml | Push/PR | Build + Test |
| deploy.yml | Release/Manual | Deploy to production |

### Deployment Environments

| Environment | URL | Purpose |
|------------|-----|---------|
| Development | localhost:3000 | Local development |
| Staging | staging.taskmanagement.com | Pre-production testing |
| Production | taskmanagement.com | Live environment |

### Secrets Required

| Secret | Description |
|--------|-------------|
| DOCKERHUB_USERNAME | Docker Hub username |
| DOCKERHUB_TOKEN | Docker Hub access token |
| SERVER_HOST | Production server IP |
| SERVER_USER | SSH username |
| SERVER_SSH_KEY | SSH private key |
| FIREBASE_SERVICE_ACCOUNT | Firebase service account |

---

## Glossary

| Term | Definition |
|------|------------|
| Assigner | Người tạo/giao công việc |
| Assignee | Người được giao công việc |
| Task Status | Trạng thái của công việc (OPEN, PENDING, PROCESS, DONE, CANCEL) |
| Priority | Mức ưu tiên của công việc |
| JWT | JSON Web Token - token xác thực |
| Deadline | Thời hạn hoàn thành công việc |

---

## Project Structure

```
taskmanagement/
├── .github/
│   └── workflows/           # CI/CD pipelines
│       ├── ci.yml
│       └── deploy.yml
├── .env.example            # Environment template
├── docker-compose.yml       # Infrastructure (dev)
├── docker-compose.prod.yml # Production
├── docs/                   # Documentation
│   ├── DEVELOPER.md
│   ├── USER_GUIDE.md
│   └── PRODUCT_OWNER.md
├── backend/               # Quarkus Backend
│   ├── src/main/java/     # Java source
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/
│   └── pom.xml
├── frontend-web/          # React Web
│   ├── src/
│   └── package.json
└── frontend-app/          # React Native
    ├── src/
    └── package.json
```

---

## Appendix

### Contact

| Role | Name | Email |
|------|------|-------|
| Product Owner | [Name] | [email] |
| Tech Lead | [Name] | [email] |
| QA Lead | [Name] | [email] |

### References

- Backend Repository: [URL]
- Frontend Web Repository: [URL]
- Mobile App Repository: [URL]
- Design System: [URL]
- API Documentation: [URL]

---

*Document Version: 1.0*
*Last Updated: May 2024*
*Document Owner: Product Owner*
