package com.fantasysolution.herohub.controller;

import com.fantasysolution.herohub.dto.DashboardStats;
import com.fantasysolution.herohub.dto.DepartmentOption;
import com.fantasysolution.herohub.model.Department;
import com.fantasysolution.herohub.model.Employee;
import com.fantasysolution.herohub.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

/** REST API consumed by the frontend. */
@RestController
@RequestMapping("/api")
public class EmployeeController {

    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    @GetMapping("/employees")
    public List<Employee> list(@RequestParam(required = false) String q,
                               @RequestParam(required = false) Department department) {
        return service.search(q, department);
    }

    @GetMapping("/employees/{id}")
    public Employee get(@PathVariable String id) {
        return service.findById(id);
    }

    @PostMapping("/employees")
    @ResponseStatus(HttpStatus.CREATED)
    public Employee create(@Valid @RequestBody Employee employee) {
        return service.create(employee);
    }

    @PutMapping("/employees/{id}")
    public Employee update(@PathVariable String id, @Valid @RequestBody Employee employee) {
        return service.update(id, employee);
    }

    @DeleteMapping("/employees/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        service.delete(id);
    }

    @GetMapping("/dashboard")
    public DashboardStats dashboard() {
        return service.dashboard();
    }

    @GetMapping("/departments")
    public List<DepartmentOption> departments() {
        return Arrays.stream(Department.values())
                .map(d -> new DepartmentOption(d.name(), d.getLabel()))
                .toList();
    }
}
