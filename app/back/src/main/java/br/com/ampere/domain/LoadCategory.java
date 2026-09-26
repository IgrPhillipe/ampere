package br.com.ampere.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * The nine parcels of the installed load method, DIS-NOR-030 item 6.27 (a to i). Each parcel owns
 * its validation and its demand rule, so a new rule is a new constant body.
 */
public enum LoadCategory {
  LIGHTING_AND_OUTLETS("a", "Iluminação e tomadas") {
    /** Lighting and outlets take different factors (6.27.1.2), so each item says which it is. */
    @Override
    List<ValidationIssue> issues(LoadItem item, String path, LoadUsage usage) {
      if (item.getLampTechnology() == null) {
        return List.of(
            ValidationIssue.missing(
                path + ".lampTechnology",
                "Informe se \""
                    + item.getDescription()
                    + "\" é iluminação, e com que lâmpadas, ou tomadas de uso geral. Isso define os"
                    + " fatores de potência e de demanda."));
      }
      return List.of();
    }

    @Override
    ParcelDemand demand(
        List<LoadItem> items, int groupQuantity, LoadUsage usage, DemandContext context) {
      NormativeValue lighting =
          context
              .tables()
              .find(NormativeTableCode.T22_GENERAL_LIGHTING_OUTLETS, usage.lightingKey());
      NormativeValue outlets =
          context
              .tables()
              .find(NormativeTableCode.T22_GENERAL_LIGHTING_OUTLETS, usage.outletsKey());

      Map<LampTechnology, BigDecimal> kwByTechnology =
          items.stream()
              .collect(
                  Collectors.groupingBy(
                      LoadItem::getLampTechnology,
                      TreeMap::new,
                      Collectors.reducing(
                          BigDecimal.ZERO,
                          item -> installedKw(item, groupQuantity),
                          BigDecimal::add)));

      List<String> terms = new ArrayList<>();
      BigDecimal kva = BigDecimal.ZERO;
      for (Map.Entry<LampTechnology, BigDecimal> technology : kwByTechnology.entrySet()) {
        LampTechnology lamp = technology.getKey();
        BigDecimal factor = lamp.lighting() ? lighting.value() : outlets.value();
        kva = kva.add(divide(technology.getValue(), lamp.powerFactor()).multiply(factor));
        String dividedBy =
            lamp.lighting() ? " ÷ " + DeclaredValues.fixed(lamp.powerFactor(), 2) : "";
        terms.add(
            DeclaredValues.fixed(technology.getValue(), 2)
                + " kW"
                + dividedBy
                + " × "
                + DeclaredValues.fixed(factor, 2));
      }
      kva = DeclaredValues.kva(kva);

      return parcel(
          kva,
          String.join(" + ", terms) + " = " + DeclaredValues.fixed(kva, 2) + " kVA",
          List.of(),
          lighting.reference());
    }
  },
  INSTANT_HEATING("b", "Chuveiros, torneiras e aquecedores de passagem") {
    @Override
    ParcelDemand demand(
        List<LoadItem> items, int groupQuantity, LoadUsage usage, DemandContext context) {
      return byCount(
          items,
          groupQuantity,
          NormativeTableCode.T7_INSTANT_HEATING,
          null,
          BigDecimal.ONE,
          context);
    }
  },
  STORAGE_HEATING("c", "Aquecedor central ou de acumulação") {
    @Override
    ParcelDemand demand(
        List<LoadItem> items, int groupQuantity, LoadUsage usage, DemandContext context) {
      return byCount(
          items,
          groupQuantity,
          NormativeTableCode.T8_STORAGE_HEATING,
          null,
          BigDecimal.ONE,
          context);
    }
  },
  APPLIANCES("d", "Secadoras, lava-roupas, lava-louças e micro-ondas") {
    @Override
    ParcelDemand demand(
        List<LoadItem> items, int groupQuantity, LoadUsage usage, DemandContext context) {
      return byCount(
          items, groupQuantity, NormativeTableCode.T9_APPLIANCES, null, APPLIANCES_PF, context);
    }
  },
  COOKING("e", "Fornos e fogões elétricos") {
    @Override
    ParcelDemand demand(
        List<LoadItem> items, int groupQuantity, LoadUsage usage, DemandContext context) {
      return byCount(
          items, groupQuantity, NormativeTableCode.T9_APPLIANCES, null, BigDecimal.ONE, context);
    }
  },
  AIR_CONDITIONING("f", "Condicionadores de ar") {
    @Override
    ParcelDemand demand(
        List<LoadItem> items, int groupQuantity, LoadUsage usage, DemandContext context) {
      return byCount(
          items,
          groupQuantity,
          NormativeTableCode.T12_AIR_CONDITIONING,
          usage.airConditioningKey(),
          BigDecimal.ONE,
          context);
    }
  },
  MOTORS("g", "Motores e máquinas de solda a motor") {
    /** Above 5 CV the starting condition changes the demand of the parcel (Tabela 14). */
    @Override
    List<ValidationIssue> issues(LoadItem item, String path, LoadUsage usage) {
      BigDecimal power = item.getPowerUnit().toCv(item.getPower());
      if (power.compareTo(LARGE_MOTOR_CV) > 0 && item.getSimultaneousStart() == null) {
        return List.of(
            ValidationIssue.review(
                path + ".simultaneousStart",
                item.getDescription()
                    + " declarado com "
                    + DeclaredValues.decimal(item.getPower())
                    + " "
                    + item.getPowerUnit().label()
                    + ". Motores acima de 5 CV entram com fator de partida próprio: informe se a"
                    + " partida é simultânea."));
      }
      return List.of();
    }

    /** Motors that must start together count as one; of equal largest ones, only one is. */
    @Override
    ParcelDemand demand(
        List<LoadItem> items, int groupQuantity, LoadUsage usage, DemandContext context) {
      List<String> notes = new ArrayList<>();
      List<NormativeReference> references = new ArrayList<>();
      SortedMap<BigDecimal, Long> motors = units();
      BigDecimal simultaneous = BigDecimal.ZERO;
      for (LoadItem item : items) {
        NormativeValue motor = motorKva(item, context, notes);
        references.add(motor.reference());
        long count = (long) item.getQuantity() * groupQuantity;
        if (Boolean.TRUE.equals(item.getSimultaneousStart())) {
          simultaneous = simultaneous.add(motor.secondValue().multiply(BigDecimal.valueOf(count)));
        } else {
          motors.merge(motor.secondValue(), count, Long::sum);
        }
      }
      if (simultaneous.signum() > 0) {
        motors.merge(simultaneous, 1L, Long::sum);
        notes.add(
            "Motores de partida simultânea somados como um só: "
                + DeclaredValues.fixed(simultaneous, 2)
                + " kVA");
      }

      return largestFirst(motors, NormativeTableCode.T14_MOTORS, notes, references, context);
    }
  },
  SPECIAL_EQUIPMENT("h", "Equipamentos especiais") {
    @Override
    ParcelDemand demand(
        List<LoadItem> items, int groupQuantity, LoadUsage usage, DemandContext context) {
      SortedMap<BigDecimal, Long> equipment = units();
      items.forEach(
          item ->
              equipment.merge(
                  item.getPowerUnit().toKilowatts(item.getPower()),
                  (long) item.getQuantity() * groupQuantity,
                  Long::sum));
      return largestFirst(
          equipment,
          NormativeTableCode.T15_SPECIAL_EQUIPMENT,
          new ArrayList<>(),
          new ArrayList<>(),
          context);
    }
  },
  PUMPS_AND_HOT_TUBS("i", "Bombas e hidromassagem") {
    /** Pumps rated in CV or HP take their kVA from the motor table; in kW, power factor 1,00. */
    @Override
    ParcelDemand demand(
        List<LoadItem> items, int groupQuantity, LoadUsage usage, DemandContext context) {
      List<String> notes = new ArrayList<>();
      List<NormativeReference> references = new ArrayList<>();
      SortedMap<BigDecimal, Long> pumps = units();
      for (LoadItem item : items) {
        BigDecimal kva;
        if (item.getPowerUnit() == PowerUnit.KW) {
          kva = item.getPower();
        } else {
          NormativeValue motor = motorKva(item, context, notes);
          references.add(motor.reference());
          kva = motor.secondValue();
        }
        pumps.merge(kva, (long) item.getQuantity() * groupQuantity, Long::sum);
      }

      long count = pumps.values().stream().mapToLong(Long::longValue).sum();
      NormativeValue factor =
          context.tables().find(NormativeTableCode.T16_PUMPS, BigDecimal.valueOf(count));
      references.add(0, factor.reference());
      BigDecimal kva = DeclaredValues.kva(total(pumps).multiply(factor.value()));

      return new ParcelDemand(
          this,
          kva,
          prefixed(
              this,
              sumOf(pumps)
                  + " × "
                  + DeclaredValues.fixed(factor.value(), 2)
                  + " = "
                  + DeclaredValues.fixed(kva, 2)
                  + " kVA",
              notes),
          DemandComponent.distinct(references));
    }
  };

  private static final BigDecimal LARGE_MOTOR_CV = new BigDecimal("5");
  private static final BigDecimal APPLIANCES_PF = new BigDecimal("0.92");
  private static final String LARGEST = "LARGEST";
  private static final String OTHERS = "OTHERS";

  private final String parcel;
  private final String label;

  LoadCategory(String parcel, String label) {
    this.parcel = parcel;
    this.label = label;
  }

  public String parcel() {
    return parcel;
  }

  public String label() {
    return label;
  }

  /** What this parcel asks of an item whose power is already informed. */
  List<ValidationIssue> issues(LoadItem item, String path, LoadUsage usage) {
    return List.of();
  }

  /** Demand of this parcel over the items of one group, in kVA. */
  abstract ParcelDemand demand(
      List<LoadItem> items, int groupQuantity, LoadUsage usage, DemandContext context);

  /** Parcels whose factor depends only on how many appliances there are. */
  ParcelDemand byCount(
      List<LoadItem> items,
      int groupQuantity,
      NormativeTableCode table,
      String key,
      BigDecimal powerFactor,
      DemandContext context) {
    long appliances =
        items.stream().mapToLong(item -> (long) item.getQuantity() * groupQuantity).sum();
    BigDecimal kw =
        items.stream()
            .map(item -> installedKw(item, groupQuantity))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    NormativeValue factor = context.tables().find(table, key, BigDecimal.valueOf(appliances));
    BigDecimal kva = DeclaredValues.kva(divide(kw, powerFactor).multiply(factor.value()));

    String dividedBy =
        powerFactor.compareTo(BigDecimal.ONE) == 0
            ? ""
            : " ÷ " + DeclaredValues.fixed(powerFactor, 2);
    return parcel(
        kva,
        appliances
            + (appliances == 1 ? " aparelho, " : " aparelhos, ")
            + DeclaredValues.fixed(kw, 2)
            + " kW"
            + dividedBy
            + " × "
            + DeclaredValues.fixed(factor.value(), 2)
            + " = "
            + DeclaredValues.fixed(kva, 2)
            + " kVA",
        List.of(),
        factor.reference());
  }

  /** Tabelas 14 and 15: the largest at its own factor, the others at the reduced one. */
  ParcelDemand largestFirst(
      SortedMap<BigDecimal, Long> units,
      NormativeTableCode table,
      List<String> notes,
      List<NormativeReference> references,
      DemandContext context) {
    NormativeValue largest = context.tables().find(table, LARGEST);
    NormativeValue others = context.tables().find(table, OTHERS);
    references.add(0, largest.reference());

    BigDecimal biggest = units.firstKey();
    SortedMap<BigDecimal, Long> rest = units();
    rest.putAll(units);
    rest.computeIfPresent(biggest, (value, count) -> count == 1 ? null : count - 1);
    BigDecimal kva =
        DeclaredValues.kva(
            biggest.multiply(largest.value()).add(total(rest).multiply(others.value())));

    String formula =
        DeclaredValues.fixed(biggest, 2) + " × " + DeclaredValues.fixed(largest.value(), 2);
    if (!rest.isEmpty()) {
      formula += " + (" + terms(rest) + ") × " + DeclaredValues.fixed(others.value(), 2);
    }

    return new ParcelDemand(
        this,
        kva,
        prefixed(this, formula + " = " + DeclaredValues.fixed(kva, 2) + " kVA", notes),
        DemandComponent.distinct(references));
  }

  ParcelDemand parcel(
      BigDecimal kva, String formula, List<String> notes, NormativeReference reference) {
    return new ParcelDemand(this, kva, prefixed(this, formula, notes), List.of(reference));
  }

  /** Tabela 18 or 19 by the connection, at the first tabulated size that reaches the motor. */
  static NormativeValue motorKva(LoadItem item, DemandContext context, List<String> notes) {
    BigDecimal size =
        item.getPowerUnit() == PowerUnit.KW
            ? item.getPowerUnit().toCv(item.getPower())
            : item.getPower();
    NormativeValue motor = context.tables().find(context.connectionType().motorTable(), size);
    BigDecimal tabulated = motor.row().getUpperBound();
    if (tabulated != null && tabulated.compareTo(size) != 0) {
      notes.add(
          item.getDescription()
              + ": "
              + DeclaredValues.decimal(item.getPower())
              + " "
              + item.getPowerUnit().label()
              + " lido na linha de "
              + motor.band()
              + " da "
              + motor.reference().identification()
              + ", "
              + DeclaredValues.fixed(motor.secondValue(), 2)
              + " kVA");
    }
    return motor;
  }

  private static BigDecimal installedKw(LoadItem item, int groupQuantity) {
    return item.declaredLoadKw().multiply(BigDecimal.valueOf(groupQuantity));
  }

  private static BigDecimal divide(BigDecimal value, BigDecimal divisor) {
    return value.divide(divisor, 4, RoundingMode.HALF_UP);
  }

  /** Equal values counted once, largest first: 10⁴ motors must not become 10⁴ entries. */
  private static SortedMap<BigDecimal, Long> units() {
    return new TreeMap<>(Comparator.reverseOrder());
  }

  private static BigDecimal total(SortedMap<BigDecimal, Long> units) {
    return units.entrySet().stream()
        .map(unit -> unit.getKey().multiply(BigDecimal.valueOf(unit.getValue())))
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  private static String terms(SortedMap<BigDecimal, Long> units) {
    return String.join(
        " + ",
        units.entrySet().stream()
            .map(
                unit ->
                    unit.getValue() == 1
                        ? DeclaredValues.fixed(unit.getKey(), 2)
                        : unit.getValue() + " × " + DeclaredValues.fixed(unit.getKey(), 2))
            .toList());
  }

  private static String sumOf(SortedMap<BigDecimal, Long> units) {
    return units.size() == 1 ? terms(units) : "(" + terms(units) + ")";
  }

  private static List<String> prefixed(LoadCategory category, String formula, List<String> notes) {
    List<String> lines = new ArrayList<>();
    lines.add(category.parcel + " · " + category.label + ": " + formula);
    lines.addAll(notes);
    return lines;
  }
}
