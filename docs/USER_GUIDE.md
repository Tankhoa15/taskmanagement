# Task Management System - Hướng Dẫn Sử Dụng

## Mục Lục
1. [Tổng Quan Hệ Thống](#tổng-quan-hệ-thống)
2. [Đăng Nhập / Đăng Ký](#đăng-nhập--đăng-ký)
3. [Giao Diện Chính](#giao-diện-chính)
4. [Quản Lý Nhóm (Groups)](#quản-lý-nhóm-groups)
5. [Quản Lý Công Việc](#quản-lý-công-việc)
6. [Tạo Công Việc Mới](#tạo-công-việc-mới)
7. [Cập Nhật Trạng Thái](#cập-nhật-trạng-thái)
8. [Thông Báo Email](#thông-báo-email)
9. [Trang Quản Trị (Admin)](#trang-quản-trị-admin)
10. [Hướng Dẫn QC - Checklist Kiểm Thử](#hướng-dẫn-qc---checklist-kiểm-thử)

---

## Tổng Quan Hệ Thống

**Task Management System** là hệ thống quản lý công việc theo nhóm.

### Tính Năng Chính

| Tính năng | Mô tả |
|------------|--------|
| ✅ Đăng nhập/đăng ký | Xác thực bằng email và mật khẩu |
| ✅ Quản lý nhóm | Tạo nhóm, thêm/xóa thành viên, phân quyền |
| ✅ Tạo công việc | Admin nhóm tạo và giao việc cho thành viên |
| ✅ Theo dõi tiến độ | Cập nhật trạng thái công việc |
| ✅ Email thông báo | Nhận email khi có công việc mới |
| ✅ Cảnh báo deadline | Thông báo trước khi hết hạn |
| ✅ Trang Admin | Quản lý tài khoản (chỉ System Admin) |

### Thông Tin Hệ Thống

| Thông tin | Chi tiết |
|-----------|----------|
| Backend API | http://localhost:8080 |
| Frontend Web | http://localhost:3000 |
| Mobile App | Expo (iOS/Android) |

---

## Đăng Nhập / Đăng Ký

### Cách Đăng Nhập

1. Truy cập: **http://localhost:3000**
2. Nhập email và mật khẩu → Click **"Đăng nhập"**
3. Hoặc chọn **"Đăng ký mới"** nếu chưa có tài khoản

### Lưu Ý

- Token đăng nhập có hiệu lực **24 giờ**
- Tài khoản bị vô hiệu hóa bởi Admin sẽ không đăng nhập được
- Role (USER/ADMIN) được trả về ngay khi đăng nhập — giao diện sẽ tự điều chỉnh

---

## Giao Diện Chính

### Menu Sidebar (Web)

```
┌──────────────────┐
│  TaskManager     │
├──────────────────┤
│  Dashboard       │
│  Tasks           │
│  Users           │
│  Groups          │
│  Quản trị        │  ← Chỉ hiện với System Admin
├──────────────────┤
│  [Avatar]        │
│  Tên             │
│  Email           │
│  [Admin badge]   │  ← Hiện nếu là System Admin
│  [Logout]        │
└──────────────────┘
```

### Vai Trò Người Dùng

| Vai trò | Ai có | Menu thêm |
|---------|-------|-----------|
| **USER** | Tất cả mặc định | Không có |
| **System ADMIN** | Do Admin cấp | "Quản trị" |

> **Lưu ý:** System Admin khác với Group Admin. Group Admin chỉ có quyền trong nhóm của mình.

---

## Quản Lý Nhóm (Groups)

### Vai Trò Trong Nhóm

| Vai trò | Quyền |
|---------|-------|
| **Admin nhóm** | Tạo task, thêm/xóa/đổi quyền thành viên |
| **Member nhóm** | Xem task, cập nhật trạng thái task của mình |

### Tạo Nhóm Mới

1. Vào trang **Groups**
2. Nhập tên nhóm ở ô "Tên nhóm mới"
3. Click **"Tạo nhóm"** → Bạn tự động trở thành Admin nhóm

### Thêm Thành Viên (chỉ Admin nhóm)

1. Chọn nhóm ở cột bên trái
2. Ở form bên phải: chọn user từ dropdown, chọn role (Member/Admin)
3. Click **"Thêm"**

### Đổi Quyền Thành Viên (chỉ Admin nhóm)

Trong danh sách thành viên, chọn role mới từ dropdown ngay cạnh tên thành viên.

### Xóa Thành Viên (chỉ Admin nhóm)

Click icon **thùng rác** cạnh thành viên muốn xóa.

> Không thể tự xóa mình khỏi nhóm.

---

## Quản Lý Công Việc

### Ai Xem Được Task Nào?

| Điều kiện | Xem được |
|-----------|---------|
| Là người được giao (Assignee) | ✅ |
| Là người tạo (Assigner) | ✅ |
| Là Admin của nhóm chứa task | ✅ |
| Không thuộc các trường hợp trên | ❌ |

### Các Trạng Thái Công Việc

| Trạng thái | Mô tả |
|-------------|--------|
| 🔵 OPEN (Mới) | Công việc vừa được tạo |
| 🟡 PENDING (Chờ) | Đang chờ xử lý |
| 🟠 PROCESS (Xử lý) | Đang được thực hiện |
| ✅ DONE (Hoàn thành) | Đã hoàn thành |
| ⚫ CANCEL (Hủy) | Đã bị hủy |

### Độ Ưu Tiên

| Mức ưu tiên | Mô tả |
|-------------|--------|
| LOW | Ưu tiên thấp |
| MEDIUM | Ưu tiên mặc định |
| HIGH | Cần ưu tiên cao |
| URGENT | Cần xử lý ngay |

### Luồng Trạng Thái

```
OPEN ──→ PENDING ──→ PROCESS ──→ DONE
   │         │            │
   ▼         ▼            ▼
 CANCEL    CANCEL       CANCEL
```

---

## Tạo Công Việc Mới

> **Yêu cầu:** Bạn phải là **Admin** của nhóm để tạo task.

### Các Bước Tạo (Web)

1. Click **"+ Tạo công việc"** hoặc vào **Tasks → Tạo mới**
2. Điền thông tin:
   - **Nhóm** (bắt buộc): Chỉ các nhóm mà bạn là Admin
   - **Tiêu đề** (bắt buộc)
   - **Nội dung** (tùy chọn)
   - **Độ ưu tiên**: Thấp / Trung bình / Cao / Khẩn cấp
   - **Điểm** (tùy chọn): 0-100
   - **Thời gian bắt đầu / kết thúc**
   - **Người được giao**: Chỉ thành viên của nhóm
3. Click **"Tạo công việc"**
4. Email sẽ được gửi tự động đến người được giao

### Lưu Ý

- Nếu bạn không có nhóm nào mà bạn là Admin → hãy tạo nhóm trước
- Assignee phải là thành viên của nhóm

---

## Cập Nhật Trạng Thái

### Ai Được Cập Nhật?

| Vai trò | Quyền |
|---------|-------|
| Người được giao (Assignee) | ✅ Cập nhật status |
| Admin nhóm | ✅ Cập nhật status |
| Người tạo (Assigner) | ❌ Chỉ xem (trừ khi là assignee hoặc group admin) |
| Người khác | ❌ Không có quyền |

### Cách Thay Đổi Trạng Thái

1. Vào trang chi tiết công việc
2. Click nút trạng thái mong muốn
3. Nếu hủy: nhập lý do (tùy chọn)

---

## Thông Báo Email

### Các Loại Thông Báo

| Loại | Khi nào | Gửi đến |
|------|---------|----------|
| Công việc mới | Khi tạo task | Người được giao |
| Cảnh báo deadline | 1 giờ trước hạn | Người được giao |
| Hoàn thành | Khi task DONE | Người tạo + Người nhận |

---

## Trang Quản Trị (Admin)

> Chỉ user có **System Role = ADMIN** mới truy cập được. User thường vào URL `/admin` sẽ bị redirect về Dashboard.

### Cách Vào Trang Admin

Khi login với tài khoản Admin, menu **"Quản trị"** sẽ hiện trong sidebar. Click vào để vào trang quản trị.

### Chức Năng

#### 1. Xem Danh Sách User

Hiển thị toàn bộ người dùng trong hệ thống với:
- Tên, email, ngày tham gia
- Trạng thái tài khoản (active/vô hiệu hóa)
- Role hiện tại (USER/ADMIN)

#### 2. Bật/Tắt Tài Khoản

Click **"Vô hiệu hóa"** hoặc **"Kích hoạt"** cạnh tên user.

- User bị vô hiệu hóa sẽ không đăng nhập được
- Không thể tự vô hiệu hóa tài khoản của mình

#### 3. Đổi Role

Chọn role mới từ dropdown (USER/ADMIN) cạnh tên user.

- Không thể tự đổi role của mình
- Cần cân nhắc khi cấp role ADMIN vì có quyền rất lớn

### Lưu Ý An Toàn

- Luôn có ít nhất **2 tài khoản Admin** để tránh bị lock out
- Role ADMIN nên được cấp hạn chế
- Tài khoản bị vô hiệu hóa vẫn còn dữ liệu trong hệ thống

---

## Hướng Dẫn QC - Checklist Kiểm Thử

### 1. Authentication

| STT | Test Case | Expected Result | Status |
|-----|-----------|----------------|--------|
| 1.1 | Đăng nhập email/password hợp lệ | Đăng nhập thành công, chuyển đến Dashboard | ☐ |
| 1.2 | Đăng nhập với mật khẩu sai | Báo lỗi "Invalid email or password" | ☐ |
| 1.3 | Đăng nhập với tài khoản bị vô hiệu hóa | Báo lỗi, không cho đăng nhập | ☐ |
| 1.4 | Đăng xuất | Xóa token, quay về trang login | ☐ |
| 1.5 | Truy cập trang protected khi chưa login | Redirect về login | ☐ |
| 1.6 | Login với tài khoản ADMIN | Hiển thị menu "Quản trị" và badge Admin | ☐ |
| 1.7 | Login với tài khoản USER | Không thấy menu "Quản trị" | ☐ |

### 2. Groups

| STT | Test Case | Expected Result | Status |
|-----|-----------|----------------|--------|
| 2.1 | Tạo nhóm mới | Nhóm tạo thành công, user là Admin nhóm | ☐ |
| 2.2 | Thêm thành viên vào nhóm (là Admin) | Thêm thành công | ☐ |
| 2.3 | Thêm thành viên (không phải Admin) | Bị từ chối (403) | ☐ |
| 2.4 | Đổi role thành viên | Cập nhật thành công | ☐ |
| 2.5 | Xóa thành viên khỏi nhóm | Xóa thành công | ☐ |
| 2.6 | Tự xóa mình khỏi nhóm | Bị từ chối | ☐ |
| 2.7 | Member xem danh sách thành viên | Cho phép xem | ☐ |
| 2.8 | Non-member xem thành viên | Bị từ chối (403) | ☐ |

### 3. Task Management

| STT | Test Case | Expected Result | Status |
|-----|-----------|----------------|--------|
| 3.1 | Tạo task (là Group Admin) | Tạo thành công | ☐ |
| 3.2 | Tạo task (không phải Group Admin) | Bị từ chối (403) | ☐ |
| 3.3 | Tạo task - dropdown nhóm chỉ hiện nhóm admin | Đúng | ☐ |
| 3.4 | Tạo task - assignee phải là member nhóm | Validate đúng | ☐ |
| 3.5 | Assignee cập nhật status task của mình | Cho phép | ☐ |
| 3.6 | User khác cập nhật status | Bị từ chối | ☐ |
| 3.7 | Group Admin cập nhật status | Cho phép | ☐ |
| 3.8 | Task chỉ hiện với assignee/assigner/group admin | Đúng | ☐ |

### 4. Admin Panel

| STT | Test Case | Expected Result | Status |
|-----|-----------|----------------|--------|
| 4.1 | User thường vào /admin | Redirect về Dashboard | ☐ |
| 4.2 | Admin vào /admin | Hiển thị trang quản trị | ☐ |
| 4.3 | Admin vô hiệu hóa user | User đó không đăng nhập được | ☐ |
| 4.4 | Admin kích hoạt lại user | User đó đăng nhập được bình thường | ☐ |
| 4.5 | Admin đổi role user thành ADMIN | User đó thấy menu Quản trị | ☐ |
| 4.6 | Admin tự vô hiệu hóa mình | Bị từ chối (nút disabled) | ☐ |
| 4.7 | Admin tự đổi role mình | Bị từ chối (dropdown disabled) | ☐ |
| 4.8 | PATCH /api/users/{id}/enabled không có token | 401 Unauthorized | ☐ |
| 4.9 | PATCH /api/users/{id}/role với token USER | 403 Forbidden | ☐ |

### 5. Email Notification

| STT | Test Case | Expected Result | Status |
|-----|-----------|----------------|--------|
| 5.1 | Tạo task mới | Email gửi đến assignee | ☐ |
| 5.2 | Task đến deadline (1h trước) | Email cảnh báo gửi đến assignee | ☐ |
| 5.3 | Task hoàn thành | Email gửi đến cả assigner và assignee | ☐ |

### 6. Security

| STT | Test Case | Expected Result | Status |
|-----|-----------|----------------|--------|
| 6.1 | Access /api/users không có token | 401 Unauthorized | ☐ |
| 6.2 | Access /api/users với token hết hạn | 401 Unauthorized | ☐ |
| 6.3 | USER tạo task trong nhóm của người khác | 403 Forbidden | ☐ |
| 6.4 | USER gọi PATCH /api/users/{id}/role | 403 Forbidden | ☐ |
| 6.5 | SQL Injection trong search | Được xử lý an toàn | ☐ |

### 7. UI/UX

| STT | Test Case | Expected Result | Status |
|-----|-----------|----------------|--------|
| 7.1 | Responsive trên desktop (>1200px) | Layout sidebar + content đúng | ☐ |
| 7.2 | Responsive trên mobile (<768px) | Menu hamburger, full width | ☐ |
| 7.3 | Loading state khi fetch data | Skeleton loader | ☐ |
| 7.4 | Toast notification thành công | Hiển thị đúng | ☐ |
| 7.5 | Toast notification lỗi | Hiển thị đúng | ☐ |
| 7.6 | Admin badge trong sidebar | Hiện với ADMIN, ẩn với USER | ☐ |

### 8. Performance

| STT | Test Case | Expected Result | Status |
|-----|-----------|----------------|--------|
| 8.1 | Load trang Dashboard | < 2 giây | ☐ |
| 8.2 | Load danh sách task | < 3 giây | ☐ |
| 8.3 | Tạo task | Phản hồi < 1 giây | ☐ |

---

## Bug Report Template

```markdown
### Bug ID: [Auto]

**Mô tả:** [Mô tả ngắn gọn]

**Môi trường:**
- Browser/Version:
- OS:
- App version:

**Steps to Reproduce:**
1.
2.
3.

**Expected:** [Kết quả mong đợi]
**Actual:** [Kết quả thực tế]

**Severity:** Critical / Major / Minor / Trivial
**Priority:** P1 / P2 / P3 / P4

**Screenshots:** [Đính kèm]
```

---

## Liên Hệ

| Bộ phận | Email |
|---------|-------|
| Development | dev@taskmanagement.com |
| QA/Testing | qa@taskmanagement.com |
| Support | support@taskmanagement.com |
