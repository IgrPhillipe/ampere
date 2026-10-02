package br.com.ampere.service;

/**
 * Numbers shown above the queue. The project does not record when a review ended, so {@code
 * reviewedToday} and {@code monthlyRejectionRate} are not calculated yet and stay at zero.
 */
public record ReviewQueueIndicators(
    long total, long dueSoon, long reviewedToday, double monthlyRejectionRate) {}
