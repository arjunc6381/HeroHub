package com.fantasysolution.herohub.dto;

import com.fantasysolution.herohub.model.Employee;

import java.math.BigDecimal;
import java.util.List;

public record DashboardStats(int totalEmployees,
                             int totalDepartments,
                             BigDecimal averageSalary,
                             List<DepartmentCount> departmentBreakdown,
                             List<Employee> recentHires) {
}
