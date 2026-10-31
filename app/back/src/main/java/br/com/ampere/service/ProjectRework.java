package br.com.ampere.service;

public record ProjectRework(
    Long cycleDays,
    int submittedVersions,
    long reviewCycles,
    long resolvedFindings,
    long openFindings,
    long redoneCalculationSteps) {}
