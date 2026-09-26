package br.com.ampere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.math.BigDecimal;
import java.util.Objects;

/** One printed row: an optional key, an optional band and up to three values. */
@Embeddable
public class NormativeTableRow {

  private String rowKey;

  @Column(precision = 14, scale = 4)
  private BigDecimal lowerBound;

  // Null on the last band of a table, the one printed as "acima de".
  @Column(precision = 14, scale = 4)
  private BigDecimal upperBound;

  @Column(nullable = false, precision = 14, scale = 4)
  private BigDecimal primaryValue;

  @Column(precision = 14, scale = 4)
  private BigDecimal secondaryValue;

  @Column(precision = 14, scale = 4)
  private BigDecimal tertiaryValue;

  private String label;

  protected NormativeTableRow() {}

  public NormativeTableRow(
      String rowKey,
      BigDecimal lowerBound,
      BigDecimal upperBound,
      BigDecimal primaryValue,
      BigDecimal secondaryValue,
      BigDecimal tertiaryValue,
      String label) {
    this.rowKey = rowKey;
    this.lowerBound = lowerBound;
    this.upperBound = upperBound;
    this.primaryValue = Objects.requireNonNull(primaryValue, "primaryValue");
    this.secondaryValue = secondaryValue;
    this.tertiaryValue = tertiaryValue;
    this.label = label;
  }

  public String getRowKey() {
    return rowKey;
  }

  public BigDecimal getLowerBound() {
    return lowerBound;
  }

  public BigDecimal getUpperBound() {
    return upperBound;
  }

  public BigDecimal getPrimaryValue() {
    return primaryValue;
  }

  public BigDecimal getSecondaryValue() {
    return secondaryValue;
  }

  public BigDecimal getTertiaryValue() {
    return tertiaryValue;
  }

  public String getLabel() {
    return label;
  }

  boolean covers(BigDecimal argument) {
    return argument == null || upperBound == null || upperBound.compareTo(argument) >= 0;
  }

  /** The band as a reader of the table would say it, e.g. "66 a 70" or "acima de 100". */
  public String band() {
    if (label != null && !label.isBlank()) {
      return label;
    }
    if (upperBound == null) {
      return lowerBound == null ? "" : "acima de " + DeclaredValues.decimal(lowerBound);
    }
    if (lowerBound == null) {
      return "até " + DeclaredValues.decimal(upperBound);
    }
    if (lowerBound.compareTo(upperBound) == 0) {
      return DeclaredValues.decimal(upperBound);
    }
    return DeclaredValues.decimal(lowerBound) + " a " + DeclaredValues.decimal(upperBound);
  }
}
