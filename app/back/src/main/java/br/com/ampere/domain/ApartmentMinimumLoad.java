package br.com.ampere.domain;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.IntStream;

/** Least lighting and outlet load of a residence (DIS-NOR-030 item 6.26.1.1). */
final class ApartmentMinimumLoad {

  /** 100 W per light point, at least one per room or corridor. */
  static final BigDecimal LIGHT_POINT_KW = new BigDecimal("0.1");

  private static final BigDecimal WATTS_PER_KW = new BigDecimal("1000");

  private final Integer rooms;
  private final BigDecimal usefulArea;

  ApartmentMinimumLoad(Integer rooms, BigDecimal usefulArea) {
    this.rooms = rooms;
    this.usefulArea = usefulArea;
  }

  /** Nothing to say while a load of parcel a is incomplete: its own issue comes first. */
  List<ValidationIssue> check(List<LoadItem> loads, NormativeTables tables) {
    List<Integer> parcelA =
        IntStream.range(0, loads.size())
            .filter(index -> loads.get(index).getCategory() == LoadCategory.LIGHTING_AND_OUTLETS)
            .boxed()
            .toList();
    if (parcelA.stream().map(loads::get).anyMatch(ApartmentMinimumLoad::incomplete)) {
      return List.of();
    }

    List<ValidationIssue> issues = new ArrayList<>();
    lightingIssue(loads, parcelA).ifPresent(issues::add);
    outletsIssue(loads, parcelA, tables).ifPresent(issues::add);
    return issues;
  }

  private Optional<ValidationIssue> lightingIssue(List<LoadItem> loads, List<Integer> parcelA) {
    if (rooms == null) {
      return Optional.empty();
    }
    BigDecimal minimum = LIGHT_POINT_KW.multiply(BigDecimal.valueOf(rooms));
    BigDecimal declared = sum(loads, parcelA, LoadItem::isLighting);
    if (declared.compareTo(minimum) >= 0) {
      return Optional.empty();
    }
    return Optional.of(
        ValidationIssue.review(
            firstPower(loads, parcelA, LoadItem::isLighting).orElse("rooms"),
            "Iluminação de "
                + DeclaredValues.decimal(declared)
                + " kW abaixo do mínimo de "
                + DeclaredValues.decimal(minimum)
                + " kW para "
                + rooms
                + (rooms == 1 ? " cômodo ou corredor" : " cômodos e corredores")
                + ", 100 W por ponto de luz em cada um (DIS-NOR-030, item 6.26.1.1)."));
  }

  /** Above the last band of Tabela 5 the designer declares the outlets: nothing to compare. */
  private Optional<ValidationIssue> outletsIssue(
      List<LoadItem> loads, List<Integer> parcelA, NormativeTables tables) {
    if (!DeclaredValues.isPositive(usefulArea)
        || !tables.contains(NormativeTableCode.T5_MINIMUM_OUTLETS)) {
      return Optional.empty();
    }
    Optional<NormativeValue> row =
        tables.lookup(NormativeTableCode.T5_MINIMUM_OUTLETS, null, usefulArea);
    if (row.isEmpty()) {
      return Optional.empty();
    }
    BigDecimal minimum = row.get().value().divide(WATTS_PER_KW);
    Predicate<LoadItem> outlets = item -> !item.isLighting();
    BigDecimal declared = sum(loads, parcelA, outlets);
    if (declared.compareTo(minimum) >= 0) {
      return Optional.empty();
    }
    return Optional.of(
        ValidationIssue.review(
            firstPower(loads, parcelA, outlets).orElse("loads"),
            "Tomadas de "
                + DeclaredValues.decimal(declared)
                + " kW abaixo do mínimo de "
                + DeclaredValues.decimal(minimum)
                + " kW para "
                + DeclaredValues.decimal(usefulArea)
                + " m² de área útil (DIS-NOR-030, item 6.26.1.1, Tabela 5)."));
  }

  private static boolean incomplete(LoadItem item) {
    return item.getLampTechnology() == null || !item.hasPlatePower();
  }

  private static BigDecimal sum(
      List<LoadItem> loads, List<Integer> parcelA, Predicate<LoadItem> kind) {
    return parcelA.stream()
        .map(loads::get)
        .filter(kind)
        .map(LoadItem::plateKw)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  private static Optional<String> firstPower(
      List<LoadItem> loads, List<Integer> parcelA, Predicate<LoadItem> kind) {
    return parcelA.stream()
        .filter(index -> kind.test(loads.get(index)))
        .findFirst()
        .map(index -> "loads[" + index + "].power");
  }
}
