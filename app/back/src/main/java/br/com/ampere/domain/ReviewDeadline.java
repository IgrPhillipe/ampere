package br.com.ampere.domain;

import java.time.LocalDate;

/** The deadline of the review in progress, read on a given day. Calculated, never persisted. */
public record ReviewDeadline(LocalDate date, DeadlineStatus status, long daysRemaining) {}
