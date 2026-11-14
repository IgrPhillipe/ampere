package br.com.ampere.domain;

import java.time.LocalDate;

/**
 * Where a project stands, on a given day, against the 30-day review period and the 36-month
 * approval validity. Calculated, never persisted.
 *
 * @param deadline last day of the review period, the suspended days included; null unless under
 *     review
 * @param deadlineStatus null unless under review
 * @param daysRemaining days left in the review period, negative once overdue and frozen while
 *     suspended; null unless under review or suspended
 * @param elapsedDays days of the period used, the suspended ones excluded; null before the first
 *     submission
 * @param suspendedDays days the period stood still waiting for fixes, the current wait included;
 *     null before the first submission
 * @param suspended rejected and waiting for the designer: the period does not run
 * @param approvalValidUntil last valid day of the approval, also once expired; null if never
 *     approved
 */
public record ReviewTimeline(
    LocalDate deadline,
    DeadlineStatus deadlineStatus,
    Long daysRemaining,
    Long elapsedDays,
    Long suspendedDays,
    boolean suspended,
    LocalDate approvalValidUntil) {}
