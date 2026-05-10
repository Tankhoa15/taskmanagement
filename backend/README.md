# Task Management Backend

Enterprise Task Management System built with Quarkus, PostgreSQL, RabbitMQ, and Kafka.

## Technology Stack

- **Backend Framework**: Quarkus 3.8.1 (Java 21)
- **Database**: PostgreSQL 16
- **Message Broker**: RabbitMQ 3.13
- **Event Streaming**: Apache Kafka 7.5
- **Security**: Google OAuth2 + JWT
- **Migration**: Flyway
- **ORM**: Hibernate Panache

## Architecture

```
Client (React/Vue/Mobile)
        |
        v
 API Gateway / REST
        |
        v
-------------------------
|   Task Management API  |
|-----------------------|
| Auth Module           |
| Task Module           |
| User Module           |
| Notification Module   |
-------------------------
        |
        +---- PostgreSQL
        |
        +---- RabbitMQ (Email Queue)
        |
        +---- Kafka (Audit/Analytics)
        |
        +---- Mail Service
```

## Features

- User authentication via Google OAuth2
- JWT token-based authorization
- Task CRUD operations
- Task assignment between users
- Email notifications for:
  - New task assigned
  - Deadline approaching
  - Task completion
- Async event processing with RabbitMQ
- Audit logging with Kafka

## Prerequisites

- Java 21
- Maven 3.9+

## Getting Started

### 1. Configure Environment

Create `backend/.env` file:

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
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest

# Kafka
KAFKA_HOST=localhost
KAFKA_PORT=9092

# Google OAuth2 (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Mail (optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@taskmanagement.com
```

### 2. Generate JWT Keys

```bash
# Generate private key
openssl genrsa -out src/main/resources/privateKey.pem 2048

# Convert to PKCS8 format
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt \
  -in src/main/resources/privateKey.pem \
  -out src/main/resources/privateKey.pem

# Generate public key
openssl rsa -in src/main/resources/privateKey.pem -pubout \
  -outform PEM -out src/main/resources/publicKey.pem
```

### 3. Run Application

Development mode:
```bash
./mvnw quarkus:dev
```

Production build:
```bash
./mvnw package -DskipTests
java -jar target/quarkus-app/quarkus-run.jar
```

## API Endpoints

### Authentication
- `POST /api/auth/google` - Authenticate with Google token

### Tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get task by ID
- `GET /api/tasks/my` - Get my tasks (created & assigned)
- `GET /api/tasks/assigned` - Get tasks assigned to me
- `GET /api/tasks/created` - Get tasks I created
- `PUT /api/tasks/{id}` - Update task
- `PATCH /api/tasks/{id}/status` - Update task status
- `PATCH /api/tasks/{id}/assign` - Reassign task

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users` - Get all users

### Health Check
- `GET /health` - Health check endpoint
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe

### Documentation
- `GET /swagger-ui` - Swagger UI
- `GET /openapi` - OpenAPI specification

## Task Status Flow

```
OPEN -> PENDING -> PROCESS -> DONE
           |          |
           v          v
        CANCEL     CANCEL
```

## Message Queues

### RabbitMQ Queues
- `task.created.email` - Task creation notifications
- `task.deadline.warning` - Deadline warning notifications
- `task.done.notification` - Task completion notifications

### Kafka Topics
- `task-events` - All task-related events for audit logging
- `user-events` - User activity events

## Environment Variables

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

## Development

### Run Tests
```bash
./mvnw test
```

### Build Native Image
```bash
./mvnw package -Pnative
```

## License

MIT License
