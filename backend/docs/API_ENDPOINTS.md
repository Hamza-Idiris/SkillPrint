# SkillSprint API Reference Documentation

## Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new student account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Protected | Fetch current logged-in user profile |

## Course Routes (`/api/courses`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | Public | List courses with search, category, and price sorting |
| `GET` | `/api/courses/:id` | Public | Get single course detail & public lesson list |
| `POST` | `/api/courses` | Admin | Create a new course |
| `PUT` | `/api/courses/:id` | Admin | Update course details, pricing, and discounts |
| `DELETE` | `/api/courses/:id` | Admin | Delete a course and clean up cover image |

## Health & System (`/api/health`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | API status check |
| `GET` | `/api/health/metrics` | Public | Detailed system memory, uptime & database metrics |
