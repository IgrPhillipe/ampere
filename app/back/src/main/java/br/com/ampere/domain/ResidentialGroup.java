package br.com.ampere.domain;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Apartments of the same useful area. Their demand comes from the useful area method, DIS-NOR-053
 * Anexo I, Quadro 35; the installed load per unit feeds the individual calculation of item 6.22.3.
 */
@Entity
@DiscriminatorValue("RESIDENTIAL")
public class ResidentialGroup extends ConsumerUnitGroup {

  /** Last row of Quadro 35: 901 to 1000 m². */
  private static final BigDecimal LARGEST_TABULATED_AREA = new BigDecimal("1000");

  private BigDecimal usefulArea;

  private Integer bedrooms;

  private BigDecimal unitLoadKw;

  // Nullable in the table: SINGLE_TABLE shares the row with the other kinds.
  private Boolean compactUnit;

  protected ResidentialGroup() {}

  public ResidentialGroup(Project project, GroupSpec spec) {
    super(project);
    update(spec);
  }

  @Override
  protected void applySpec(GroupSpec spec) {
    this.usefulArea = spec.usefulArea();
    this.bedrooms = spec.bedrooms();
    this.unitLoadKw = spec.unitLoadKw();
    this.compactUnit = Boolean.TRUE.equals(spec.compactUnit());
  }

  @Override
  public GroupSpec spec() {
    return new GroupSpec(
        getName(),
        getQuantity(),
        usefulArea,
        bedrooms,
        unitLoadKw,
        compactUnit,
        null,
        null,
        null,
        null,
        null,
        null);
  }

  public BigDecimal getUsefulArea() {
    return usefulArea;
  }

  public Integer getBedrooms() {
    return bedrooms;
  }

  public BigDecimal getUnitLoadKw() {
    return unitLoadKw;
  }

  /** Smart, studio or home studio: above 15 units the coincidence factor is fixed (6.25.1). */
  public boolean isCompactUnit() {
    return Boolean.TRUE.equals(compactUnit);
  }

  @Override
  public GroupKind kind() {
    return GroupKind.RESIDENTIAL;
  }

  @Override
  public List<ValidationIssue> validate() {
    List<ValidationIssue> issues = new ArrayList<>();
    if (!DeclaredValues.isPositive(usefulArea)) {
      issues.add(
          ValidationIssue.missing(
              "usefulArea", "Informe a área útil. Ela define a demanda de cada unidade."));
    } else if (usefulArea.compareTo(LARGEST_TABULATED_AREA) > 0) {
      issues.add(
          ValidationIssue.review(
              "usefulArea",
              "Área útil de "
                  + DeclaredValues.decimal(usefulArea)
                  + " m² passa da última faixa do Quadro 35 (1.000 m²): confirme o valor."));
    }
    if (!DeclaredValues.isPositive(unitLoadKw)) {
      issues.add(
          ValidationIssue.missing(
              "unitLoadKw",
              "Informe a carga instalada por unidade, usada no cálculo individual do item"
                  + " 6.22.3."));
    }
    return issues;
  }

  @Override
  public BigDecimal loadPerUnitKw() {
    return DeclaredValues.isPositive(unitLoadKw) ? unitLoadKw : null;
  }

  @Override
  public String summary() {
    List<String> parts = new ArrayList<>();
    parts.add(
        DeclaredValues.isPositive(usefulArea)
            ? DeclaredValues.decimal(usefulArea) + " m²"
            : "Área útil não informada");
    if (bedrooms != null) {
      parts.add(bedrooms + (bedrooms == 1 ? " quarto" : " quartos"));
    }
    parts.add("DIS-NOR-053 Quadro 35");
    return String.join(" · ", parts);
  }
}
