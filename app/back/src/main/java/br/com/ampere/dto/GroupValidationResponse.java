package br.com.ampere.dto;

import java.math.BigDecimal;

/**
 * Totals of the consumer unit step, and whether the calculation is released.
 *
 * @param pendingCount validation issues across all groups; each one blocks the calculation
 */
public record GroupValidationResponse(
    boolean canCalculate,
    int pendingCount,
    int totalGroups,
    int totalUnits,
    BigDecimal totalDeclaredLoadKw) {}
