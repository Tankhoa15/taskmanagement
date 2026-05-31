# Task Management System - Tài Liệu Cho Product Owner

## Mục Lục
1. [Tổng Quan Dự Án](#tổng-quan-dự-án)
2. [Mục Tiêu & Phạm Vi](#mục-tiêu--phạm-vi)
3. [Mô Hình Phân Quyền](#mô-hình-phân-quyền)
4. [User Stories](#user-stories)
5. [Sơ Đồ Luồng Nghiệp Vụ](#sơ-đồ-luồng-nghiệp-vụ)
6. [Yêu Cầu Chức Năng](#yêu-cầu-chức-năng)
7. [Yêu Cầu Phi Chức Năng](#yêu-cầu-phi-chức-năng)
8. [Thiết Kế Database](#thiết-kế-database)
9. [API Specification](#api-specification)
10. [Mockups & Wireframes](#mockups--wireframes)
11. [Definition of Done](#definition-of-done)
12. [Kế Hoạch Phát Triển](#kế-hoạch-phát-triển)
13. [Rủi Ro & Mitigation](#rủi-ro--mitigation)
14. [CI/CD & Deployment](#cicd--deployment)

---

## Tổng Quan Dự Án

### Thông Tin Dự Án

| Thông tin | Chi tiết |
|-----------|----------|
| Tên dự án | Task Management System |
| Phiên bản | 1.1.0 |
| Ngày bắt đầu | 2024 |
| Mục tiêu | Quản lý công việc hiệu quả theo nhóm |
| Số lượng user dự kiến | 50-100 users |

### Công Nghệ Sử Dụng

| Layer | Công nghệ |
|-------|------------|
| Web Frontend | React + Vite + TypeScript |
| Mobile App | React Native + Expo |
| Backend API | Quarkus + Java 21 |
| Database | PostgreSQL 16 |
| Message Queue | RabbitMQ 3.13 |
| Event Streaming | Apache Kafka |
| Authentication | Email/password + JWT |

---

## Mục Tiêu & Phạm Vi

### Mục Tiêu Chính

1. **Quản lý công việc theo nhóm**
   - Tổ chức công việc trong các nhóm (groups)
   - Giao việc giữa các thành viên trong nhóm
   - Phân quyền rõ ràng: Admin nhóm và thành viên

2. **Giao tiếp hiệu quả**
   - Thông báo email tự động
   - Cảnh báo deadline

3. **Quản trị hệ thống**
   - Quản lý tài khoản người dùng (bật/tắt, phân quyền)
   - Phân vai trò: System Admin và User thường

4. **Transparency & Accountability**
   - Audit log các thay đổi
   - Theo dõi người tạo/người nhận

### Phạm Vi (In Scope)

| STT | Tính năng | Priority |
|-----|-----------|----------|
| 1 | Authentication bằng email/password | Must |
| 2 | CRUD Task | Must |
| 3 | Giao việc cho thành viên trong nhóm | Must |
| 4 | Cập nhật trạng thái task | Must |
| 5 | Email notification | Must |
| 6 | Deadline warning | Must |
| 7 | Dashboard thống kê | Should |
| 8 | Quản lý nhóm (Groups) | Must |
| 9 | Phân quyền 2 cấp (System + Group) | Must |
| 10 | Trang Admin quản trị hệ thống | Must |
| 11 | Web application | Must |
| 12 | Mobile application (iOS/Android) | Should |

### Phạm Vi (Out of Scope)

- SSO với provider ngoài
- Integration với Slack/Teams
- File attachment
- Comment/Discussion
- Time tracking chi tiết
- Gantt chart
- Mobile offline mode
- Multi-language

---

## Mô Hình Phân Quyền

Hệ thống có **2 cấp phân quyền độc lập**:

### Cấp 1: System Role (toàn hệ thống)

| Role | Ai có | Quyền |
|------|-------|-------|
| `USER` | Tất cả người dùng mới | Dùng hệ thống bình thường |
| `ADMIN` | Do Admin cấp | Quản lý tài khoản, đổi role bất kỳ user |

> System Admin chỉ có thể được cấp bởi một Admin khác (thông qua trang Quản trị).

### Cấp 2: Group Role (trong từng nhóm)

| Role | Ai có | Quyền |
|------|-------|-------|
| `ADMIN` | Người tạo nhóm, hoặc được promote | Tạo task, thêm/xóa/đổi quyền thành viên |
| `MEMBER` | Thành viên thường | Cập nhật trạng thái task của mình |

### Ma trận quyền

| Hành động | USER | Group MEMBER | Group ADMIN | System ADMIN |
|-----------|------|--------------|-------------|--------------|
| Xem danh sách user | ✅ | ✅ | ✅ | ✅ |
| Tạo nhóm | ✅ | ✅ | ✅ | ✅ |
| Xem thành viên nhóm | ✅ (nếu là thành viên) | ✅ | ✅ | ✅ |
| Tạo task | ❌ | ❌ | ✅ | ✅ |
| Cập nhật status task | ❌ (trừ task của mình) | ✅ | ✅ | ✅ |
| Thêm thành viên nhóm | ❌ | ❌ | ✅ | ✅ |
| Xóa thành viên nhóm | ❌ | ❌ | ✅ | ✅ |
| Bật/tắt tài khoản user | ❌ | ❌ | ❌ | ✅ |
| Đổi System Role | ❌ | ❌ | ❌ | ✅ |

---

## User Stories

### US-001: Đăng Nhập Hệ Thống

**Mô tả:** Là một user, tôi muốn đăng nhập bằng email và mật khẩu để sử dụng hệ thống.

**Acceptance Criteria:**
- [x] User có thể đăng nhập bằng email và mật khẩu
- [x] User nhận được JWT token sau khi đăng nhập
- [x] Token có hiệu lực 24 giờ
- [x] Response trả về role thực của user (USER/ADMIN)

### US-002: Tạo Nhóm và Quản Lý Thành Viên

**Mô tả:** Là một user, tôi muốn tạo nhóm và quản lý thành viên.

**Acceptance Criteria:**
- [x] User tạo được nhóm mới (tự động trở thành Admin nhóm)
- [x] Admin nhóm thêm được thành viên với role MEMBER hoặc ADMIN
- [x] Admin nhóm thay đổi được role của thành viên
- [x] Admin nhóm xóa được thành viên (không tự xóa mình)
- [x] Chỉ thành viên mới xem được danh sách thành viên nhóm

### US-003: Tạo Công Việc Mới

**Mô tả:** Là Admin nhóm, tôi muốn tạo công việc và giao cho thành viên trong nhóm.

**Acceptance Criteria:**
- [x] Chỉ Admin nhóm mới tạo được task trong nhóm
- [x] Assignee phải là thành viên của nhóm đó
- [x] Sau khi tạo, email gửi đến người được giao
- [x] Task được lưu vào database

### US-004: Cập Nhật Trạng Thái Công Việc

**Mô tả:** Là người nhận công việc, tôi muốn cập nhật trạng thái.

**Acceptance Criteria:**
- [x] Người nhận có thể thay đổi: OPEN → PENDING → PROCESS → DONE
- [x] Có thể hủy công việc với lý do
- [x] Admin nhóm cũng có thể cập nhật status
- [x] Khi hoàn thành, email gửi đến cả 2 bên

### US-005: Theo Dõi Deadline

**Mô tả:** Hệ thống tự động cảnh báo khi công việc sắp hết hạn.

**Acceptance Criteria:**
- [x] Scheduler chạy mỗi 10 phút
- [x] 1 giờ trước deadline, email cảnh báo được gửi
- [x] Email gửi đến người được giao

### US-006: Xem Dashboard

**Mô tả:** Là một user, tôi muốn xem tổng quan công việc của mình.

**Acceptance Criteria:**
- [x] Hiển thị số lượng task theo từng trạng thái
- [x] Hiển thị danh sách task khẩn cấp
- [x] Bell icon hiển thị số task đang active

### US-007: Trang Quản Trị Hệ Thống (Admin)

**Mô tả:** Là System Admin, tôi muốn quản lý tài khoản người dùng.

**Acceptance Criteria:**
- [x] Chỉ user có role ADMIN mới vào được trang /admin
- [x] Hiển thị danh sách toàn bộ user với trạng thái
- [x] Admin bật/tắt được tài khoản user (không tự tắt mình)
- [x] Admin thay đổi được role của user (USER ↔ ADMIN)
- [x] User bị vô hiệu hóa không thể đăng nhập
- [x] Menu "Quản trị" chỉ hiện với user có role ADMIN

### US-008: Tìm Kiếm & Lọc Công Việc

**Mô tả:** Là một user, tôi muốn tìm kiếm và lọc công việc.

**Acceptance Criteria:**
- [x] Có thể lọc theo trạng thái
- [x] Có thể tìm kiếm theo tiêu đề

---

## Sơ Đồ Luồng Nghiệp Vụ

### Luồng Tạo Nhóm & Giao Việc

```
User tạo nhóm
     │
     ▼
Trở thành Admin nhóm
     │
     ▼
Thêm thành viên (role MEMBER hoặc ADMIN)
     │
     ▼
Admin tạo task ──→ Backend ──→ Lưu DB ──→ RabbitMQ ──→ Email assignee
                      │
                      ▼
                   Kafka (Audit)
```

### Luồng Phân Quyền System Admin

```
System Admin đăng nhập
     │
     ▼
Vào trang /admin (chỉ ADMIN mới vào được)
     │
     ├──→ Bật/tắt tài khoản user
     │         │
     │         ▼
     │    PATCH /api/users/{id}/enabled
     │
     └──→ Đổi role user
               │
               ▼
          PATCH /api/users/{id}/role
```

### Luồng Tạo Công Việc

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Group Admin    │     │   Backend    │     │  RabbitMQ   │
│  Tạo Task       │────▶│   Service    │────▶│   Queue     │
└─────────────────┘     └──────┬───────┘     └──────┬──────┘
                               │                     │
                               ▼                     ▼
                        ┌──────────────┐     ┌─────────────┐
                        │  PostgreSQL  │     │   Email     │
                        │  (Save Task) │     │  Assignee   │
                        └──────────────┘     └─────────────┘
```

---

## Yêu Cầu Chức Năng

### FR-001: Authentication

| ID | Yêu cầu | Priority |
|----|---------|----------|
| FR-001.1 | Email/password Login | Must |
| FR-001.2 | JWT Token với role thực | Must |
| FR-001.3 | Token hết hạn sau 24h | Must |

### FR-002: Group Management

| ID | Yêu cầu | Priority |
|----|---------|----------|
| FR-002.1 | Tạo nhóm mới | Must |
| FR-002.2 | Thêm thành viên nhóm | Must |
| FR-002.3 | Xóa thành viên nhóm | Must |
| FR-002.4 | Đổi role thành viên (ADMIN/MEMBER) | Must |
| FR-002.5 | Xem danh sách thành viên | Must |

### FR-003: Task Management

| ID | Yêu cầu | Priority |
|----|---------|----------|
| FR-003.1 | Tạo task (chỉ Group Admin) | Must |
| FR-003.2 | Cập nhật task | Should |
| FR-003.3 | Cập nhật status (assignee/group admin) | Must |
| FR-003.4 | Giao lại task | Must |
| FR-003.5 | Lọc task theo status | Should |
| FR-003.6 | Task visibility theo quyền | Must |

### FR-004: Admin Panel

| ID | Yêu cầu | Priority |
|----|---------|----------|
| FR-004.1 | Trang /admin chỉ ADMIN mới vào | Must |
| FR-004.2 | Xem danh sách toàn bộ user | Must |
| FR-004.3 | Bật/tắt tài khoản user | Must |
| FR-004.4 | Đổi System Role (USER/ADMIN) | Must |
| FR-004.5 | Menu "Quản trị" ẩn với non-admin | Must |

### FR-005: Notifications

| ID | Yêu cầu | Priority |
|----|---------|----------|
| FR-005.1 | Email khi tạo task | Must |
| FR-005.2 | Email cảnh báo deadline (1h) | Must |
| FR-005.3 | Email khi task hoàn thành | Must |

---

## Yêu Cầu Phi Chức Năng

### NFR-001: Security

| Requirement | Implementation |
|-------------|----------------|
| Authentication | Email/password + JWT |
| Authorization | 2 cấp: System Role + Group Role |
| Route protection | Backend: @Authenticated, @RolesAllowed; Frontend: route guards |
| User endpoints | Yêu cầu xác thực (không public) |
| Admin endpoints | Yêu cầu role ADMIN |
| HTTPS | TLS 1.2+ |
| SQL Injection | Parameterized queries (Panache) |

### NFR-002: Performance

| Metric | Target |
|--------|--------|
| API Response Time | < 200ms (p95) |
| Page Load Time | < 2s |
| Concurrent Users | 100 users |

### NFR-003: Availability

| Metric | Target |
|--------|--------|
| Uptime | 99.5% |
| Recovery Time | < 30 phút |

---

## Thiết Kế Database

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     USERS       │       │   TASK_GROUPS   │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◀──┐   │ id (PK)         │
│ email           │   │   │ name            │
│ name            │   └───│ owner_id (FK)   │
│ role            │       │ created_at      │
│ enabled         │       └────────┬────────┘
│ created_at      │                │
└────────┬────────┘                │
         │              ┌──────────▼────────┐
         │              │ TASK_GROUP_MEMBERS│
         │              ├───────────────────┤
         │              │ id (PK)           │
         └─────────────▶│ user_id (FK)      │
                        │ group_id (FK)     │
                        │ role (ADMIN/MEMBER│
                        └───────────────────┘
                                 │
                        ┌────────▼────────┐
                        │     TASKS       │
                        ├─────────────────┤
                        │ id (PK)         │
                        │ title           │
                        │ status          │
                        │ priority        │
                        │ assigner_id(FK) │
                        │ assignee_id(FK) │
                        │ group_id (FK)   │
                        │ start_time      │
                        │ end_time        │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │  TASK_HISTORY   │
                        ├─────────────────┤
                        │ id (PK)         │
                        │ task_id (FK)    │
                        │ user_id (FK)    │
                        │ action          │
                        │ old_status      │
                        │ new_status      │
                        │ changes (JSONB) │
                        └─────────────────┘
```

---

## API Specification

### Auth Response (Login/Register)

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
    "role": "USER"
  }
}
```

> `role` = `"USER"` hoặc `"ADMIN"`. Frontend dùng để hiện/ẩn menu Quản trị.

### Admin Endpoints

```
PATCH /api/users/{id}/enabled   → Bật/tắt tài khoản (cần role ADMIN)
PATCH /api/users/{id}/role      → Đổi role user (cần role ADMIN)
```

### Group Endpoints

```
GET    /api/groups                              → Nhóm của tôi
POST   /api/groups                             → Tạo nhóm mới
GET    /api/groups/{id}/members                → Xem thành viên
POST   /api/groups/{id}/members                → Thêm thành viên
PATCH  /api/groups/{id}/members/{uid}/role     → Đổi role thành viên
DELETE /api/groups/{id}/members/{uid}          → Xóa thành viên
```

---

## Mockups & Wireframes

### Desktop - Dashboard

```
┌────────────────────────────────────────────────────────────────┐
│  TaskManager                                    🔔  User ▼     │
├──────────┬─────────────────────────────────────────────────────┤
│          │                                                      │
│ Dashboard│   Chào mừng, User Name                              │
│ Tasks    │                                                      │
│ Users    │   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │
│ Groups   │   │ Tổng   │ │  Mới   │ │ Đang   │ │  Done  │     │
│ [Quản trị│   │  15    │ │   3    │ │  xử lý │ │   7    │     │
│  chỉ ADM]│   └────────┘ └────────┘ │   5    │ └────────┘     │
│          │                          └────────┘                  │
│ ──────── │                                                      │
│ User Name│   Task khẩn cấp                                     │
│ USER/    │   ┌────────────────────────────────────────────┐    │
│ ADMIN    │   │ Review Pull Request #123   URGENT          │    │
│ [Logout] │   └────────────────────────────────────────────┘    │
└──────────┴─────────────────────────────────────────────────────┘
```

### Desktop - Admin Panel

```
┌────────────────────────────────────────────────────────────────┐
│  Quản trị hệ thống                                             │
├────────────────────────────────────────────────────────────────┤
│  Danh sách người dùng (25)                                     │
├───────────────────────┬──────────────┬────────────────────────┤
│  Nguyen Van A          │  [USER  ▼]  │  [Vô hiệu hóa]        │
│  a@company.com         │             │                        │
│  Tham gia: 01/01/2024 │             │                        │
├───────────────────────┼──────────────┼────────────────────────┤
│  Tran Thi B  [Bạn]    │  [ADMIN ▼]  │  [disabled - tự mình] │
│  b@company.com         │             │                        │
│  Tham gia: 15/01/2024 │             │                        │
├───────────────────────┼──────────────┼────────────────────────┤
│  Le Van C    [Vô hiệu]│  [USER  ▼]  │  [Kích hoạt]          │
│  c@company.com         │             │                        │
└───────────────────────┴──────────────┴────────────────────────┘
```

### Desktop - Groups

```
┌────────────────────────────────────────────────────────────────┐
│  Groups                                                        │
├────────────────┬───────────────────────────────────────────────┤
│ Nhóm của tôi  │  Team Alpha                    [Admin badge]  │
│                │                                               │
│ [Team Alpha  ] │  [Chọn user ▼] [Member ▼] [+ Thêm]         │
│  ADMIN         │                                               │
│ [Team Beta   ] │  ┌────────────────────────────────────────┐  │
│  MEMBER        │  │ Nguyen Van A   nguyen@...               │  │
│                │  │                    [ADMIN ▼] [🗑 xóa]  │  │
│ [+ Tạo nhóm ] │  ├────────────────────────────────────────┤  │
│                │  │ Tran Thi B    tran@...                  │  │
│                │  │                    [MEMBER▼] [🗑 xóa]  │  │
└────────────────┴───────────────────────────────────────────────┘
```

---

## Definition of Done

### Code Level
- [x] Code compiles without errors
- [x] TypeScript type check passes
- [x] No critical security vulnerabilities
- [x] Backend enforces all permission checks

### Functional Level
- [x] All acceptance criteria met
- [x] Permission checks hoạt động đúng (không hardcode)
- [x] Admin page ẩn với non-admin user
- [x] Frontend không hardcode role

### Technical Level
- [x] API documentation updated
- [x] Database migrations created
- [x] Docs updated (DEVELOPER, PRODUCT_OWNER, USER_GUIDE)

---

## Kế Hoạch Phát Triển

### Sprint 1: Core Infrastructure ✅
- Backend setup, DB design, Authentication, Docker

### Sprint 2: Task Management ✅
- Task CRUD, assignment, status flow, Frontend

### Sprint 3: Notifications ✅
- RabbitMQ, Kafka, Email service, Deadline scheduler

### Sprint 4: Groups & Authorization ✅
- Group management (tạo nhóm, thêm/xóa/đổi role thành viên)
- Phân quyền 2 cấp (System Role + Group Role)
- Admin Panel (quản lý tài khoản)
- Fix frontend role (bỏ hardcode USER)

### Sprint 5: Tiếp theo (đề xuất)
- Delete group endpoint
- Task search nâng cao
- Push notification (mobile)
- System statistics dashboard cho Admin

---

## Rủi Ro & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Admin bị lock out | High | Low | Cần ≥ 2 admin, không tự vô hiệu hóa mình |
| Phân quyền sai | High | Low | Backend enforce tất cả, frontend chỉ là UX |
| Email delivery failures | Medium | Low | Queue retry mechanism |
| Database performance | Medium | Medium | Connection pooling, indexing |
| Security vulnerabilities | High | Low | @RolesAllowed, @Authenticated enforce ở backend |

---

## CI/CD & Deployment

### GitHub Actions Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| ci.yml | Push/PR | Build + Test |
| deploy.yml | Release/Manual | Deploy to production |

### Environments

| Environment | URL | Purpose |
|------------|-----|---------|
| Development | localhost:3000 | Local development |
| Production | taskmanagement.com | Live |

---

## Glossary

| Term | Definition |
|------|------------|
| System Admin | User có `role = "ADMIN"` — quản lý tài khoản toàn hệ thống |
| Group Admin | User có `role = "ADMIN"` trong một nhóm cụ thể |
| Assigner | Người tạo/giao công việc |
| Assignee | Người được giao công việc |
| Task Status | OPEN, PENDING, PROCESS, DONE, CANCEL |
| JWT | JSON Web Token — chứa userId, email, role |

---

*Document Version: 1.1*
*Last Updated: 2026-05-30*
