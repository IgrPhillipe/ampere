package br.com.ampere.service;

import br.com.ampere.domain.DeadlineStatus;
import br.com.ampere.domain.Project;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * One project in the review queue, with its deadline, the days used and suspended, and the warnings
 * of its latest calculation.
 */
public record ReviewQueueEntry(
    Project project,
    LocalDate deadline,
    DeadlineStatus deadlineStatus,
    long daysRemaining,
    long elapsedDays,
    long suspendedDays,
    List<String> warnings,
    long consumerUnitsCount,
    BigDecimal demandKva) {}
