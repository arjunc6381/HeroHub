# HeroHub — Employee Self-Service Portal

Employee directory with dashboard metrics, search, profiles and an add/edit form.
Built during the Fantasy Solution (Trichy) summer internship.

```
herohub/
├── frontend/   HTML, CSS, JavaScript (Bootstrap 5) — talks to the API with fetch()
├── backend/    Java 17, Spring Boot 3 REST API (controller → service → repository)
└── database/   schema.sql and seed.sql (H2 by default, MySQL optional)
```

## Tech stack

| Part     | Technology                                              |
|----------|---------------------------------------------------------|
| Frontend | HTML5, CSS3, JavaScript, Bootstrap 5                    |
| Backend  | Java 17, Spring Boot 3, Spring MVC, Spring Data JPA, Bean Validation |
| Database | H2 (in-memory, default) or MySQL                        |
| Tools    | Maven, Git, GitHub, JUnit 5 / MockMvc                   |

## Run it

You need JDK 17+ and Maven 3.8+. Use two terminals.

**1. Backend** (http://localhost:8080)

```bash
cd backend
mvn spring-boot:run
```

Start it from inside `backend/`, because it loads the SQL files from `../database`.

**2. Frontend** (http://localhost:5500)

```bash
cd frontend
python -m http.server 5500
```

Any static server works, for example the VS Code "Live Server" extension. If the backend is not on
`localhost:8080`, change the URL in `frontend/js/config.js`.

**Tests**

```bash
cd backend
mvn test
```

## REST API

| Method | Endpoint                                   | Description                              |
|--------|--------------------------------------------|------------------------------------------|
| GET    | `/api/employees?q=&department=`            | List / search (ID, name, dept, designation) |
| GET    | `/api/employees/{id}`                      | One employee                             |
| POST   | `/api/employees`                           | Create (ID is generated)                 |
| PUT    | `/api/employees/{id}`                      | Update                                   |
| DELETE | `/api/employees/{id}`                      | Delete                                   |
| GET    | `/api/dashboard`                           | Totals, average salary, department breakdown, recent joiners |
| GET    | `/api/departments`                         | Department list                          |

Errors are JSON: `{"status": 400, "message": "...", "errors": {"field": "message"}}`.

## OOP model

`Person` (private fields, getters/setters) is the base class; `Employee extends Person` adds Employee ID,
department, designation, salary and joining date.

## Future work

- Authentication and role-based access (Spring Security + JWT)
- Report exports (CSV / PDF)
- Docker and deployment readiness
