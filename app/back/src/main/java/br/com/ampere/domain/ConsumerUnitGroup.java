package br.com.ampere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

/** Consumer units of a project declared together under one kind. */
@Entity
@Table(name = "consumer_unit_group")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "kind")
public abstract class ConsumerUnitGroup {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(nullable = false)
  private Project project;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private Integer quantity;

  protected ConsumerUnitGroup() {}

  protected ConsumerUnitGroup(Project project) {
    this.project = Objects.requireNonNull(project, "project");
  }

  public Long getId() {
    return id;
  }

  public Project getProject() {
    return project;
  }

  public String getName() {
    return name;
  }

  public Integer getQuantity() {
    return quantity;
  }

  public final void update(GroupSpec spec) {
    this.name = Objects.requireNonNull(spec.name(), "name");
    this.quantity = Objects.requireNonNull(spec.quantity(), "quantity");
    applySpec(spec);
  }

  protected abstract void applySpec(GroupSpec spec);

  public abstract GroupSpec spec();

  public abstract GroupKind kind();

  public abstract List<ValidationIssue> validate();

  /** Null while not informed. */
  public abstract BigDecimal loadPerUnitKw();

  public abstract String summary();

  /** This group's share of the demand. Only called once every group is validated. */
  public abstract DemandContribution demand(DemandContext context);

  public final GroupStatus status() {
    return validate().stream()
        .map(ValidationIssue::severity)
        .map(IssueSeverity::status)
        .max(Comparator.naturalOrder())
        .orElse(GroupStatus.VALIDATED);
  }

  public final BigDecimal declaredLoadKw() {
    BigDecimal perUnit = loadPerUnitKw();
    return perUnit == null ? BigDecimal.ZERO : perUnit.multiply(BigDecimal.valueOf(quantity));
  }
}
