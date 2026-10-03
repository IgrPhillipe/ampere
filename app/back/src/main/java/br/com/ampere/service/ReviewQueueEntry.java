package br.com.ampere.service;

import br.com.ampere.domain.DeadlineStatus;
import br.com.ampere.domain.Project;
import java.time.LocalDate;

/**
 * One project in the review queue, with its deadline and the warnings of its latest calculation.
 */
public record ReviewQueueEntry(
    Project project,
    LocalDate deadline,
    DeadlineStatus deadlineStatus,
    long daysRemaining,
    long warnings) {}
