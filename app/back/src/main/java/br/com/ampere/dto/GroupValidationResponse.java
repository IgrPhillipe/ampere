package br.com.ampere.dto;

import java.math.BigDecimal;

public record GroupValidationResponse(
    boolean canCalculate,
    int pendingCount,
    int totalGroups,
    int totalUnits,
    BigDecimal totalDeclaredLoadKw) {}
