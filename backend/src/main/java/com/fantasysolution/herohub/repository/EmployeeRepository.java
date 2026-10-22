package com.fantasysolution.herohub.repository;

import com.fantasysolution.herohub.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/** Data layer: Spring Data JPA talks to the employees table (see /database/schema.sql). */
public interface EmployeeRepository extends JpaRepository<Employee, String> {

    Optional<Employee> findByEmailIgnoreCase(String email);
}
