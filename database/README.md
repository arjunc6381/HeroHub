# Database

| File         | Purpose                                      |
|--------------|----------------------------------------------|
| `schema.sql` | Creates the `employees` table                |
| `seed.sql`   | Inserts 10 sample employees (HH-1001…HH-1010) |

## Default: H2 (no setup)

The backend loads both scripts automatically into an in-memory H2 database when it starts.
Data resets on every restart. H2 console is not enabled.

## MySQL

```sql
CREATE DATABASE herohub;
USE herohub;
SOURCE schema.sql;
SOURCE seed.sql;
```

Edit the username and password in `backend/src/main/resources/application-mysql.properties`, then:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

## Table: `employees`

| Column         | Type           | Notes                           |
|----------------|----------------|---------------------------------|
| `employee_id`  | VARCHAR(20)    | Primary key, e.g. `HH-1001`     |
| `first_name`   | VARCHAR(50)    |                                 |
| `last_name`    | VARCHAR(50)    |                                 |
| `email`        | VARCHAR(120)   | Unique                          |
| `phone`        | VARCHAR(20)    |                                 |
| `department`   | VARCHAR(30)    | Enum name, e.g. `ENGINEERING`   |
| `designation`  | VARCHAR(80)    |                                 |
| `salary`       | DECIMAL(12,2)  | Annual, in ₹                    |
| `joining_date` | DATE           |                                 |
