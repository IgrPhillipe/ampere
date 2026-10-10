package br.com.ampere.domain;

/** Mutually exclusive views exposed by the analyst review queue. */
public enum ReviewQueueFilter {
  ALL,
  DUE_SOON,
  HIGH_DEMAND,
  REANALYSIS
}
