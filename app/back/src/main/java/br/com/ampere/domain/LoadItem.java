package br.com.ampere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

/** One declared load, filed under its parcel of DIS-NOR-030 item 6.27. */
@Embeddable
public class LoadItem {

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private LoadCategory category;

  @Column(nullable = false)
  private String description;

  @Column(nullable = false)
  private Integer quantity;

  private BigDecimal power;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private PowerUnit powerUnit;

  @Enumerated(EnumType.STRING)
  private LampTechnology lampTechnology;

  private Boolean simultaneousStart;

  protected LoadItem() {}

  public LoadItem(
      LoadCategory category,
      String description,
      Integer quantity,
      BigDecimal power,
      PowerUnit powerUnit,
      LampTechnology lampTechnology,
      Boolean simultaneousStart) {
    this.category = Objects.requireNonNull(category, "category");
    this.description = Objects.requireNonNull(description, "description");
    this.quantity = Objects.requireNonNull(quantity, "quantity");
    this.power = power;
    this.powerUnit = Objects.requireNonNull(powerUnit, "powerUnit");
    this.lampTechnology = lampTechnology;
    this.simultaneousStart = simultaneousStart;
  }

  public LoadCategory getCategory() {
    return category;
  }

  public String getDescription() {
    return description;
  }

  public Integer getQuantity() {
    return quantity;
  }

  public BigDecimal getPower() {
    return power;
  }

  public PowerUnit getPowerUnit() {
    return powerUnit;
  }

  public LampTechnology getLampTechnology() {
    return lampTechnology;
  }

  public Boolean getSimultaneousStart() {
    return simultaneousStart;
  }

  public BigDecimal declaredLoadKw() {
    if (!DeclaredValues.isPositive(power)) {
      return BigDecimal.ZERO;
    }
    return powerUnit.toKilowatts(power).multiply(BigDecimal.valueOf(quantity));
  }

  List<ValidationIssue> validate(String path, LoadUsage usage) {
    if (!DeclaredValues.isPositive(power)) {
      return List.of(
          ValidationIssue.missing(
              path + ".power", "Informe a potência de placa de \"" + description + "\"."));
    }
    return category.issues(this, path, usage);
  }
}
