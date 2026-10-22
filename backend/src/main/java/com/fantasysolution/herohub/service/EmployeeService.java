package com.fantasysolution.herohub.service;

import com.fantasysolution.herohub.dto.DashboardStats;
import com.fantasysolution.herohub.dto.DepartmentCount;
import com.fantasysolution.herohub.exception.DuplicateEmployeeException;
import com.fantasysolution.herohub.exception.EmployeeNotFoundException;
import com.fantasysolution.herohub.model.Department;
import com.fantasysolution.herohub.model.Employee;
import com.fantasysolution.herohub.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** Business layer: validation rules, ID generation, search and dashboard metrics. */
@Service
public class EmployeeService {

    private final EmployeeRepository repository;

    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
    }

    public List<Employee> findAll() {
        return repository.findAll().stream()
                .sorted(Comparator.comparing(Employee::getEmployeeId))
                .collect(Collectors.toList());
    }

    public Employee findById(String id) {
        return repository.findById(id).orElseThrow(() -> new EmployeeNotFoundException(id));
    }

    public synchronized Employee create(Employee employee) {
        checkEmailFree(employee.getEmail(), null);
        employee.setEmployeeId(nextId());
        return repository.save(employee);
    }

    public Employee update(String id, Employee form) {
        findById(id); // 404 if missing
        checkEmailFree(form.getEmail(), id);
        form.setEmployeeId(id);
        return repository.save(form);
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new EmployeeNotFoundException(id);
        }
        repository.deleteById(id);
    }

    /** Search by Employee ID, name, department or designation, optionally limited to one department. */
    public List<Employee> search(String query, Department department) {
        String term = query == null ? "" : query.trim().toLowerCase();
        return findAll().stream()
                .filter(e -> department == null || e.getDepartment() == department)
                .filter(e -> term.isEmpty() || matches(e, term))
                .collect(Collectors.toList());
    }

    public DashboardStats dashboard() {
        List<Employee> all = findAll();

        BigDecimal average = BigDecimal.ZERO;
        if (!all.isEmpty()) {
            BigDecimal sum = all.stream().map(Employee::getSalary).reduce(BigDecimal.ZERO, BigDecimal::add);
            average = sum.divide(BigDecimal.valueOf(all.size()), 0, RoundingMode.HALF_UP);
        }

        Map<Department, Long> counts = new EnumMap<>(Department.class);
        all.forEach(e -> counts.merge(e.getDepartment(), 1L, Long::sum));
        List<DepartmentCount> breakdown = counts.entrySet().stream()
                .sorted(Map.Entry.<Department, Long>comparingByValue().reversed())
                .map(en -> new DepartmentCount(en.getKey().name(), en.getKey().getLabel(), en.getValue()))
                .collect(Collectors.toList());

        List<Employee> recent = all.stream()
                .sorted(Comparator.comparing(Employee::getJoiningDate, Comparator.<LocalDate>reverseOrder()))
                .limit(5)
                .collect(Collectors.toList());

        return new DashboardStats(all.size(), counts.size(), average, breakdown, recent);
    }

    private void checkEmailFree(String email, String ownId) {
        repository.findByEmailIgnoreCase(email == null ? "" : email.trim()).ifPresent(existing -> {
            if (!existing.getEmployeeId().equals(ownId)) {
                throw new DuplicateEmployeeException("An employee with this email already exists");
            }
        });
    }

    private String nextId() {
        int max = repository.findAll().stream()
                .map(Employee::getEmployeeId)
                .filter(id -> id != null && id.matches("HH-\\d+"))
                .mapToInt(id -> Integer.parseInt(id.substring(3)))
                .max().orElse(1000);
        return "HH-" + (max + 1);
    }

    private boolean matches(Employee e, String term) {
        return contains(e.getEmployeeId(), term)
                || contains(e.getFullName(), term)
                || contains(e.getDepartment() == null ? null : e.getDepartment().getLabel(), term)
                || contains(e.getDesignation(), term);
    }

    private boolean contains(String value, String term) {
        return value != null && value.toLowerCase().contains(term);
    }
}
