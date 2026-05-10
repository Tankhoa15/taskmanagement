# Task Management System - Hướng Dẫn Sử Dụng

## Mục Lục
1. [Tổng Quan Hệ Thống](#tổng-quan-hệ-thống)
2. [Đăng Nhập](#đăng-nhập)
3. [Giao Diện Chính](#giao-diện-chính)
4. [Quản Lý Công Việc](#quản-lý-công-việc)
5. [Tạo Công Việc Mới](#tạo-công-việc-mới)
6. [Cập Nhật Trạng Thái](#cập-nhật-trạng-thái)
7. [Thông Báo Email](#thông-báo-email)
8. [Hướng Dẫn QC - Checklist Kiểm Thử](#hướng-dẫn-qc---checklist-kiểm-thử)

---

## Tổng Quan Hệ Thống

**Task Management System** là hệ thống quản lý công việc dành cho doanh nghiệp.

### Tính Năng Chính

| Tính năng | Mô tả |
|------------|--------|
| ✅ Đăng nhập/đăng ký | Xác thực bằng email và mật khẩu |
| ✅ Tạo công việc | Tạo và giao việc cho đồng nghiệp |
| ✅ Theo dõi tiến độ | Cập nhật trạng thái công việc |
| ✅ Email thông báo | Nhận email khi có công việc mới |
| ✅ Cảnh báo deadline | Thông báo trước khi hết hạn |
| ✅ Hoàn thành | Thông báo khi công việc xong |

### Thông Tin Hệ Thống

| Thông tin | Chi tiết |
|-----------|----------|
| Phiên bản | 1.0.0 |
| Backend API | http://localhost:8080 |
| Frontend Web | http://localhost:3000 |
| Mobile App | Expo (iOS/Android) |

### Công Nghệ

| Component | Công nghệ |
|-----------|------------|
| Backend | Quarkus + Java 21 |
| Database | PostgreSQL |
| Message Queue | RabbitMQ |
| Event Streaming | Apache Kafka |
| Frontend Web | React + Vite |
| Mobile | React Native + Expo |

---

## Đăng Nhập

### Cách Đăng Nhập

1. Truy cập website: http://localhost:3000
2. Nhập email và mật khẩu rồi click **"Đăng nhập"**
3. Hoặc chọn **"Đăng ký mới"** nếu chưa có tài khoản
4. Hệ thống sẽ tự động đăng nhập

### Lưu Ý Quan Trọng

- Cần có tài khoản nội bộ để đăng nhập
- Lần đầu đăng nhập, hệ thống sẽ tự tạo tài khoản mới
- Token đăng nhập có hiệu lực **24 giờ**
- Sau 24 giờ, cần đăng nhập lại

---

## Giao Diện Chính

### Menu Chính (Web)

```
┌─────────────────────────────────────────────────────┐
│  📊 Dashboard    📋 Tasks    👥 Users    👤 Profile │
└─────────────────────────────────────────────────────┘
```

### Menu Chính (Mobile)

```
┌─────────────────────────┐
│  🏠 Home  📋 Tasks  👤 Profile │
└─────────────────────────┘
```

### Trang Dashboard

**Hiển thị:**
- Thống kê số công việc (tổng, mới, đang xử lý, hoàn thành)
- Danh sách công việc khẩn cấp
- Nút tạo công việc nhanh

### Trang Tasks

**Hiển thị:**
- Danh sách tất cả công việc của bạn
- Bộ lọc theo trạng thái
- Thanh tìm kiếm theo tên

---

## Quản Lý Công Việc

### Các Trạng Thái Công Việc

| Trạng thái | Màu sắc | Mô tả |
|-------------|---------|--------|
| 🟢 OPEN (Mới) | Xanh dương | Công việc vừa được tạo |
| 🟡 PENDING (Chờ) | Vàng | Đang chờ xử lý |
| 🟠 PROCESS (Xử lý) | Cam | Đang được thực hiện |
| ✅ DONE (Hoàn thành) | Xanh lá | Đã hoàn thành |
| ⚫ CANCEL (Hủy) | Xám | Đã bị hủy |

### Độ Ưu Tiên

| Mức ưu tiên | Màu sắc | Mô tả |
|-------------|---------|--------|
| LOW (Thấp) | Xám | Ưu tiên thấp |
| MEDIUM (Trung bình) | Xanh dương | Ưu tiên mặc định |
| HIGH (Cao) | Cam | Cần ưu tiên cao |
| URGENT (Khẩn cấp) | Đỏ | Cần xử lý ngay |

### Luồng Trạng Thái

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   OPEN   │────▶│  PENDING │────▶│ PROCESS  │────▶│   DONE   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
      │               │               │                  
      ▼               ▼               ▼                  
┌──────────────────────────────────────────────────────┐
│                      CANCEL                            │
└──────────────────────────────────────────────────────┘
```

---

## Tạo Công Việc Mới

### Các Bước Tạo (Web)

1. Click **"+ Tạo công việc"** hoặc vào **Tasks → Tạo mới**
2. Điền thông tin công việc:
   - **Tiêu đề** (bắt buộc): Tên công việc
   - **Nội dung** (tùy chọn): Mô tả chi tiết
   - **Độ ưu tiên**: Thấp / Trung bình / Cao / Khẩn cấp
   - **Điểm** (tùy chọn): 0-100 điểm
   - **Thời gian bắt đầu**: Ngày giờ bắt đầu
   - **Thời gian kết thúc**: Ngày giờ kết thúc
   - **Người được giao**: Chọn từ danh sách user
3. Click **"Tạo công việc"**

### Các Bước Tạo (Mobile)

1. Vào tab **Tasks** → Click nút **+**
2. Điền thông tin tương tự web
3. Click **"Tạo công việc"**

### Lưu Ý

- Thời gian kết thúc phải sau thời gian bắt đầu
- Bắt buộc chọn người được giao
- Sau khi tạo, **email sẽ gửi tự động** đến người được giao

---

## Cập Nhật Trạng Thái

### Cách Thay Đổi Trạng Thái

1. Vào trang chi tiết công việc
2. Click vào nút trạng thái mong muốn:
   - **Bắt đầu**: Chuyển sang PENDING
   - **Đang xử lý**: Chuyển sang PROCESS
   - **Hoàn thành**: Chuyển sang DONE
   - **Hủy**: Hủy công việc (có thể nhập lý do)

### Quyền Cập Nhật

| Vai trò | Quyền |
|---------|-------|
| Người tạo (Assigner) | Có thể cập nhật |
| Người nhận (Assignee) | Có thể cập nhật |
| User khác | Chỉ xem |

### Khi Hoàn Thành Công Việc

- Email thông báo sẽ gửi đến **cả người tạo** và **người nhận**
- Thời gian hoàn thành được ghi nhận

---

## Thông Báo Email

### Các Loại Thông Báo

| Loại | Khi nào | Gửi đến |
|------|---------|----------|
| Công việc mới | Khi tạo task | Người được giao |
| Cảnh báo deadline | 1 giờ trước deadline | Người được giao |
| Hoàn thành | Khi task DONE | Người tạo + Người nhận |

### Nội Dung Email

**Công việc mới:**
```
Tiêu đề: New Task Assigned: [Tên công việc]

Nội dung:
- Tên công việc
- Độ ưu tiên
- Thời hạn
- Mô tả chi tiết
```

**Cảnh báo deadline:**
```
Tiêu đề: Task Deadline Warning: [Tên công việc]

Nội dung:
- Tên công việc
- Thời gian còn lại
```

**Hoàn thành:**
```
Tiêu đề: Task Completed: [Tên công việc]

Nội dung:
- Thông báo hoàn thành
- Người hoàn thành
```

---

## Hướng Dẫn QC - Checklist Kiểm Thử

### 1. Authentication (Đăng nhập)

| STT | Test Case | Expected Result | Status |
|-----|-----------|----------------|--------|
| 1.1 | Đăng nhập email/password hợp lệ | Đăng nhập thành công, chuyển đến Dashboard | ☐ |
| 1.2 | Đăng nhập với email chưa đăng ký | Tự động tạo tài khoản mới | ☐ |
| 1.3 | Đăng nhập với token hết hạn | Yêu cầu đăng nhập lại | ☐ |
| 1.4 | Đăng xuất | Xóa token, quay về trang login | ☐ |
| 1.5 | Truy cập trang protected khi chưa login | Redirect về login | ☐ |
| 1.6 | Refresh token khi gần hết hạn | Tự động refresh | ☐ |
| 1.7 | Đăng nhập từ nhiều thiết bị | Mỗi thiết bị có token riêng | ☐ |

### 2. Task Management (Quản lý công việc)

| STT | Test Case | Expected Result | Status |
|-----|-----------|----------------|--------|
| 2.1 | Tạo task với thông tin đầy đủ | Task được tạo, hiển thị trong danh sách | ☐ |
| 2.2 | Tạo task thiếu tiêu đề | Hiển thị lỗi validation | ☐ |
| 2.3 | Tạo task không chọn assignee | Hiển thị lỗi validation | ☐ |
| 2.4 | Tạo task với end_time < start_time | Hiển thị lỗi validation | ☐ |
| 2.5 | Tạo task với priority không hợp lệ | Mặc định là MEDIUM | ☐ |
| 2.6 | Tạo task với point âm | Hiển thị lỗi validation | ☐ |
| 2.7 | Xem chi tiết task | Hiển thị đầy đủ thông tin | ☐ |
| 2.8 | Cập nhật task (title, content) | Lưu thay đổi thành công | ☐ |
| 2.9 | Cập nhật task status OPEN → PENDING | Trạng thái thay đổi | ☐ |
| 2.10 | Cập nhật task status PENDING → PROCESS | Trạng thái thay đổi | ☐ |
| 2.11 | Cập nhật task status PROCESS → DONE | Trạng thái thay đổi, completed_at được ghi | ☐ |
| 2.12 | Hủy task với lý do | Trạng thái CANCEL, lưu lý do | ☐ |
| 2.13 | Hủy task không có lý do | Vẫn cho phép hủy | ☐ |
| 2.14 | Lọc task theo status | Chỉ hiển thị task có status tương ứng | ☐ |
| 2.15 | Tìm kiếm task theo tên | Hiển thị kết quả phù hợp | ☐ |
| 2.16 | Xem task của tôi (assigned) | Hiển thị task được giao | ☐ |
| 2.17 | Xem task tôi tạo (created) | Hiển thị task do mình tạo | ☐ |
| 2.18 | Xóa task | Không có chức năng xóa (chỉ hủy) | ☐ |

### 3. Email Notification (Thông báo Email)

| STT | Test Case | Expected Result | Status |
|-----|-----------|----------------|--------|
| 3.1 | Tạo task mới | Email gửi đến assignee | ☐ |
| 3.2 | Task đến deadline (1h trước) | Email cảnh báo gửi đến assignee | ☐ |
| 3.3 | Task hoàn thành | Email gửi đến cả assigner và assignee | ☐ |
| 3.4 | Email có đầy đủ thông tin | Task title, deadline, nội dung đúng | ☐ |
| 3.5 | Email không gửi được | Log lỗi trong hệ thống | ☐ |

### 4. UI/UX (Giao diện)

| STT | Test Case | Expected Result | Status |
|-----|-----------|----------------|--------|
| 4.1 | Responsive trên desktop (>1200px) | Hiển thị đúng layout sidebar + content | ☐ |
| 4.2 | Responsive trên tablet (768-1200px) | Sidebar thu gọn | ☐ |
| 4.3 | Responsive trên mobile (<768px) | Menu hamburger, full width | ☐ |
| 4.4 | Loading state khi fetch data | Hiển thị spinner/ skeleton | ☐ |
| 4.5 | Error state khi API fail | Hiển thị thông báo lỗi + retry | ☐ |
| 4.6 | Toast notification | Hiển thị thông báo thành công/lỗi | ☐ |
| 4.7 | Empty state (không có task) | Hiển thị placeholder | ☐ |
| 4.8 | Hover state trên buttons/ links | Có hiệu ứng hover | ☐ |

### 5. Security (Bảo mật)

| STT | Test Case | Expected Result | Status |
|-----|-----------|----------------|--------|
| 5.1 | Access API không có token | Return 401 Unauthorized | ☐ |
| 5.2 | Access API với token không hợp lệ | Return 401 Unauthorized | ☐ |
| 5.3 | Access API với token hết hạn | Return 401 Unauthorized | ☐ |
| 5.4 | Access task của user khác (view) | Cho phép xem | ☐ |
| 5.5 | Update task không phải assigner/assignee | Không cho phép (403) | ☐ |
| 5.6 | SQL Injection trong search | Được xử lý an toàn | ☐ |
| 5.7 | XSS trong content task | Được escape | ☐ |

### 6. Performance (Hiệu năng)

| STT | Test Case | Expected Result | Status |
|-----|-----------|----------------|--------|
| 6.1 | Load trang Dashboard | < 2 giây | ☐ |
| 6.2 | Load danh sách 100 tasks | < 3 giây | ☐ |
| 6.3 | Tạo task mới | Phản hồi < 1 giây | ☐ |
| 6.4 | Update status | Phản hồi < 1 giây | ☐ |
| 6.5 | Search tasks | Phản hồi < 1 giây | ☐ |

### 7. Mobile App (Ứng dụng di động)

| STT | Test Case | Expected Result | Status |
|-----|-----------|----------------|--------|
| 7.1 | Login email/password trên iOS | Đăng nhập thành công | ☐ |
| 7.2 | Login email/password trên Android | Đăng nhập thành công | ☐ |
| 7.3 | Tạo task trên mobile | Task được tạo thành công | ☐ |
| 7.4 | Update status trên mobile | Status thay đổi | ☐ |
| 7.5 | Pull to refresh | Cập nhật danh sách | ☐ |
| 7.6 | Offline mode | Hiển thị thông báo offline | ☐ |
| 7.7 | Push notification (nếu có) | Nhận được notification | ☐ |

---

## Bug Report Template

```markdown
### Bug ID: [Auto-generated]

**Mô tả:**
[Mô tả ngắn gọn bug]

**Môi trường:**
- Browser/Phiên bản:
- OS:
- Thiết bị (mobile):
- App version:

**Steps to Reproduce:**
1. [Bước 1]
2. [Bước 2]
3. [Bước 3]

**Expected Result:**
[Kết quả mong đợi]

**Actual Result:**
[Kết quả thực tế]

**Severity:**
- [ ] Critical - Ảnh hưởng nghiêm trọng
- [ ] Major - Ảnh hưởng lớn
- [ ] Minor - Ảnh hưởng nhỏ
- [ ] Trivial - Rất nhỏ

**Priority:**
- [ ] P1 - Urgent (Fix ngay)
- [ ] P2 - High (Fix trong sprint)
- [ ] P3 - Medium (Fix khi có thời gian)
- [ ] P4 - Low (Nice to have)

**Screenshots/Video:**
[Đính kèm]
```

---

## Liên Hệ

| Bộ phận | Email |
|---------|-------|
| Development | dev@taskmanagement.com |
| QA/Testing | qa@taskmanagement.com |
| Product Owner | po@taskmanagement.com |
| Support | support@taskmanagement.com |
