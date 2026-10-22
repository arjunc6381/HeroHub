package com.fantasysolution.herohub.model;

public enum Department {
    ENGINEERING("Engineering"),
    HUMAN_RESOURCES("Human Resources"),
    FINANCE("Finance"),
    MARKETING("Marketing"),
    OPERATIONS("Operations"),
    SALES("Sales");

    private final String label;

    Department(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
