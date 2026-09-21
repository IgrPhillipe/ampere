package br.com.ampere.domain;

/** One share of the calculation: what is measured, by which method, under which item. */
public record DemandRule(
    DemandComponent component,
    DemandMethod method,
    StandardName prescribedBy,
    String prescribedItem,
    StandardName methodFrom,
    String methodItem) {}
