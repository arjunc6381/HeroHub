package com.fantasysolution.herohub.model;

import jakarta.persistence.MappedSuperclass;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * OOP base class. Encapsulation: fields are private and exposed only through
 * getters/setters. {@link Employee} inherits from this class.
 */
@MappedSuperclass
public class Person {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be 2-50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must be at most 50 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-\\s]{10,15}$", message = "Enter a valid phone number (10-15 digits)")
    private String phone;

    public Person() {
    }

    public Person(String firstName, String lastName, String email, String phone) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
    }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getFullName() {
        return (firstName == null ? "" : firstName.trim()) + " " + (lastName == null ? "" : lastName.trim());
    }

    public String getInitials() {
        String f = (firstName == null || firstName.isBlank()) ? "" : firstName.trim().substring(0, 1);
        String l = (lastName == null || lastName.isBlank()) ? "" : lastName.trim().substring(0, 1);
        return (f + l).toUpperCase();
    }
}
