package com.fantasysolution.herohub.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Inheritance: Employee reuses everything from Person and adds its own fields. */
@Entity
@Table(name = "employees")
public class Employee extends Person {

    @Id
    private String employeeId;

    @NotNull(message = "Select a department")
    @Enumerated(EnumType.STRING)
    private Department department;

    @NotBlank(message = "Designation is required")
    @Size(max = 80, message = "Designation must be at most 80 characters")
    private String designation;

    @NotNull(message = "Salary is required")
    @DecimalMin(value = "1.00", message = "Salary must be greater than zero")
    private BigDecimal salary;

    @NotNull(message = "Joining date is required")
    @PastOrPresent(message = "Joining date cannot be in the future")
    private LocalDate joiningDate;

    public Employee() {
    }

    public Employee(String firstName, String lastName, String email, String phone,
                    Department department, String designation, BigDecimal salary, LocalDate joiningDate) {
        super(firstName, lastName, email, phone);
        this.department = department;
        this.designation = designation;
        this.salary = salary;
        this.joiningDate = joiningDate;
    }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public BigDecimal getSalary() { return salary; }
    public void setSalary(BigDecimal salary) { this.salary = salary; }

    public LocalDate getJoiningDate() { return joiningDate; }
    public void setJoiningDate(LocalDate joiningDate) { this.joiningDate = joiningDate; }
}
