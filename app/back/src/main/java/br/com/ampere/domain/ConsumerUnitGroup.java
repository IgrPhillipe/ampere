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

/**
 * Consumer units of a project that share a type and are declared together.
 *
 * <p>Each kind knows which normative data it needs, so the validation shown to the designer is
 * dispatched by type and never decided by a chain of conditionals.
 */
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

  /** Replaces what the designer declared. The kind of a group never changes. */
  public final void update(GroupSpec spec) {
    this.name = Objects.requireNonNull(spec.name(), "name");
    this.quantity = Objects.requireNonNull(spec.quantity(), "quantity");
    applySpec(spec);
  }

  protected abstract void applySpec(GroupSpec spec);

  /** What the designer declared, as it would be sent again to update the group. */
  public abstract GroupSpec spec();

  public abstract GroupKind kind();

  /** What still blocks the calculation, in the order the designer should fix it. */
  public abstract List<ValidationIssue> validate();

  /** Installed load of one unit of the group, in kW, or null while it is not informed. */
  public abstract BigDecimal loadPerUnitKw();

  /** One line describing the group and the table that applies to it. */
  public abstract String summary();

  public final GroupStatus status() {
    return validate().stream()
        .map(ValidationIssue::severity)
        .map(IssueSeverity::status)
        .max(Comparator.naturalOrder())
        .orElse(GroupStatus.VALIDATED);
  }

  /** Installed load of the whole group, in kW. Zero while it is not informed. */
  public final BigDecimal declaredLoadKw() {
    BigDecimal perUnit = loadPerUnitKw();
    return perUnit == null ? BigDecimal.ZERO : perUnit.multiply(BigDecimal.valueOf(quantity));
  }
}
