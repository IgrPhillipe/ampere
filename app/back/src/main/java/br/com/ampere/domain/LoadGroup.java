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
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/** Common areas or a commercial unit, by installed load (DIS-NOR-030 item 6.27). */
@Entity
@DiscriminatorValue("LOAD")
public class LoadGroup extends ConsumerUnitGroup {

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
    if (spec.items() != null) {
      this.items.addAll(spec.items());
    }
  }

  @Override
  public GroupSpec spec() {
    return new GroupSpec(
        getName(), getQuantity(), null, null, null, null, usage, items, null, null, null, null);
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

  /** Each parcel of DIS-NOR-030 item 6.27 present in the group, summed. */
  @Override
  public DemandContribution demand(DemandContext context) {
    Map<LoadCategory, List<LoadItem>> byParcel =
        items.stream()
            .collect(
                Collectors.groupingBy(
                    LoadItem::getCategory,
                    () -> new EnumMap<>(LoadCategory.class),
                    Collectors.toList()));
    List<ParcelDemand> parcels =
        byParcel.entrySet().stream()
            .map(parcel -> parcel.getKey().demand(parcel.getValue(), getQuantity(), usage, context))
            .toList();
    BigDecimal subtotal =
        parcels.stream().map(ParcelDemand::kva).reduce(BigDecimal.ZERO, BigDecimal::add);

    String symbols =
        String.join(" + ", parcels.stream().map(parcel -> parcel.category().parcel()).toList());
    String values =
        String.join(
            " + ", parcels.stream().map(parcel -> DeclaredValues.fixed(parcel.kva(), 2)).toList());

    return new DemandContribution(
        usage.component(),
        getName(),
        getQuantity(),
        false,
        subtotal,
        DeclaredValues.fixed(subtotal, 2),
        symbols + " = " + values,
        parcels.stream().flatMap(parcel -> parcel.lines().stream()).toList(),
        DemandComponent.distinct(
            parcels.stream().flatMap(parcel -> parcel.references().stream()).toList()));
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
    return loads + " (DIS-NOR-030 item 6.27)";
  }
}
