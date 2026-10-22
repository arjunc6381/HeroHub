-- HeroHub schema (works on MySQL 8 and H2 in MySQL mode)
CREATE TABLE IF NOT EXISTS employees (
    employee_id   VARCHAR(20)    NOT NULL,
    first_name    VARCHAR(50)    NOT NULL,
    last_name     VARCHAR(50)    NOT NULL,
    email         VARCHAR(120)   NOT NULL,
    phone         VARCHAR(20)    NOT NULL,
    department    VARCHAR(30)    NOT NULL,
    designation   VARCHAR(80)    NOT NULL,
    salary        DECIMAL(12, 2) NOT NULL,
    joining_date  DATE           NOT NULL,
    PRIMARY KEY (employee_id),
    CONSTRAINT uq_employees_email UNIQUE (email)
);
