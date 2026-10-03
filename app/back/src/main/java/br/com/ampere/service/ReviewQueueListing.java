package br.com.ampere.service;

import java.util.List;

public record ReviewQueueListing(List<ReviewQueueEntry> entries, long totalElements) {}
