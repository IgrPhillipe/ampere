package br.com.ampere.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;

/**
 * Common areas or a commercial unit, calculated by installed load: DIS-NOR-030 item 6.27, the
 * method DIS-NOR-053 points to for condominium services (6.22.4) and commercial loads.
 */
@Entity
@DiscriminatorValue("LOAD")
public class LoadGroup extends ConsumerUnitGroup {

  /** How many item descriptions the summary lists before it stops. */
  private static final int SUMMARY_ITEMS = 3;

  @Enumerated(EnumType.STRING)
  private LoadUsage usage;

  // Eager: the controller maps the response after the transaction, with open-in-view off.
  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "load_group_item", joinColumns = @JoinColumn(name = "group_id"))
  @OrderColumn(name = "position")
  private List<LoadItem> items = new ArrayList<>();

  protected LoadGroup() {}

  public LoadGroup(Project project, GroupSpec spec) {
    super(project);
    update(spec);
  }

  @Override
  protected void applySpec(GroupSpec spec) {
    this.usage = spec.usage();
    this.items.clear();
    this.items.addAll(spec.items());
  }

  public LoadUsage getUsage() {
    return usage;
  }

  public List<LoadItem> getItems() {
    return List.copyOf(items);
  }

  @Override
  public GroupKind kind() {
    return GroupKind.LOAD;
  }

  @Override
  public List<ValidationIssue> validate() {
    List<ValidationIssue> issues = new ArrayList<>();
    if (usage == null) {
      issues.add(
          ValidationIssue.missing(
              "usage", "Informe se a carga é de área comum ou de unidade comercial."));
    }
    if (items.isEmpty()) {
      issues.add(
          ValidationIssue.missing(
              "items", "Informe as cargas instaladas: iluminação, motores, bombas e demais."));
    }
    IntStream.range(0, items.size())
        .forEach(index -> issues.addAll(items.get(index).validate("items[" + index + "]", usage)));
    return issues;
  }

  @Override
  public BigDecimal loadPerUnitKw() {
    if (items.isEmpty()) {
      return null;
    }
    return items.stream().map(LoadItem::declaredLoadKw).reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  @Override
  public String summary() {
    String loads =
        items.isEmpty()
            ? "Nenhuma carga informada"
            : String.join(
                ", ", items.stream().limit(SUMMARY_ITEMS).map(LoadItem::getDescription).toList());
    if (items.size() > SUMMARY_ITEMS) {
      loads += " e mais " + (items.size() - SUMMARY_ITEMS);
    }
    return loads + " · DIS-NOR-030 item 6.27";
  }
}
