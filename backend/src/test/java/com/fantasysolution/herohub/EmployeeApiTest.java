package com.fantasysolution.herohub;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Runs against the real schema and seed data in /database (start tests from backend/). */
@SpringBootTest
@AutoConfigureMockMvc
class EmployeeApiTest {

    @Autowired
    private MockMvc mvc;

    private static final String NEW_EMPLOYEE = """
            {"firstName":"Test","lastName":"User","email":"%s","phone":"9876543210",
             "department":"ENGINEERING","designation":"QA Engineer","salary":500000,"joiningDate":"2024-01-15"}
            """;

    @Test
    void listReturnsSeededEmployees() throws Exception {
        mvc.perform(get("/api/employees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(10)));
    }

    @Test
    void searchFiltersByTermAndDepartment() throws Exception {
        mvc.perform(get("/api/employees").param("q", "priya"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].employeeId", is("HH-1001")));
        mvc.perform(get("/api/employees").param("department", "FINANCE"))
                .andExpect(jsonPath("$[*].department", everyItem(is("FINANCE"))));
    }

    @Test
    void getByIdAndUnknownId() throws Exception {
        mvc.perform(get("/api/employees/HH-1001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName", is("Priya Sharma")));
        mvc.perform(get("/api/employees/HH-9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createUpdateDeleteLifecycle() throws Exception {
        String body = NEW_EMPLOYEE.formatted("lifecycle@herohub.com");
        String response = mvc.perform(post("/api/employees").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.employeeId", startsWith("HH-")))
                .andReturn().getResponse().getContentAsString();
        String id = response.replaceAll(".*\"employeeId\":\"(HH-\\d+)\".*", "$1");

        mvc.perform(put("/api/employees/" + id).contentType(MediaType.APPLICATION_JSON)
                        .content(body.replace("QA Engineer", "Lead QA")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.designation", is("Lead QA")));

        mvc.perform(delete("/api/employees/" + id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/employees/" + id)).andExpect(status().isNotFound());
    }

    @Test
    void invalidBodyReturns400WithFieldErrors() throws Exception {
        mvc.perform(post("/api/employees").contentType(MediaType.APPLICATION_JSON).content("{\"firstName\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.firstName").exists())
                .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    void duplicateEmailReturns409() throws Exception {
        mvc.perform(post("/api/employees").contentType(MediaType.APPLICATION_JSON)
                        .content(NEW_EMPLOYEE.formatted("priya.sharma@herohub.com")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    void dashboardAndDepartments() throws Exception {
        mvc.perform(get("/api/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEmployees", greaterThanOrEqualTo(10)))
                .andExpect(jsonPath("$.departmentBreakdown").isArray());
        mvc.perform(get("/api/departments"))
                .andExpect(jsonPath("$.length()", is(6)));
    }
}
