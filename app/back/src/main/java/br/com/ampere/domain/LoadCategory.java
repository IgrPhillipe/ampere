package br.com.ampere.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
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
    List<ValidationIssue> issues(
        LoadItem item, String path, LoadOccupancy usage, DemandContext context) {
      if (!usage.residential() && item.getLampTechnology() == null) {
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
        List<LoadItem> items, int groupQuantity, LoadOccupancy usage, DemandContext context) {
      if (usage.residential()) {
        return residential(items, groupQuantity, context);
      }
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
                          item -> groupKw(item, groupQuantity, context),
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

    /** Item 6.27.1.1 (a1): lighting and outlets together, Tabela 6 by the total, power factor 1. */
    private ParcelDemand residential(
        List<LoadItem> items, int groupQuantity, DemandContext context) {
      BigDecimal kw =
          items.stream()
              .map(item -> groupKw(item, groupQuantity, context))
              .reduce(BigDecimal.ZERO, BigDecimal::add);
      NormativeValue factor =
          context.tables().find(NormativeTableCode.T6_RESIDENTIAL_LIGHTING_OUTLETS, kw);
      BigDecimal kva = DeclaredValues.kva(kw.multiply(factor.value()));

      return parcel(
          kva,
          DeclaredValues.fixed(kw, 2)
              + " kW × "
              + DeclaredValues.fixed(factor.value(), 2)
              + " = "
              + DeclaredValues.fixed(kva, 2)
              + " kVA",
          List.of(),
          factor.reference());
    }
  },
  INSTANT_HEATING("b", "Chuveiros, torneiras e aquecedores de passagem") {
    @Override
    ParcelDemand demand(
        List<LoadItem> items, int groupQuantity, LoadOccupancy usage, DemandContext context) {
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
        List<LoadItem> items, int groupQuantity, LoadOccupancy usage, DemandContext context) {
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
        List<LoadItem> items, int groupQuantity, LoadOccupancy usage, DemandContext context) {
      return byCount(
          items, groupQuantity, NormativeTableCode.T9_APPLIANCES, null, APPLIANCES_PF, context);
    }
  },
  COOKING("e", "Fornos e fogões elétricos") {
    @Override
    ParcelDemand demand(
        List<LoadItem> items, int groupQuantity, LoadOccupancy usage, DemandContext context) {
      return byCount(
          items, groupQuantity, NormativeTableCode.T9_APPLIANCES, null, BigDecimal.ONE, context);
    }
  },
  AIR_CONDITIONING("f", "Condicionadores de ar") {
    @Override
    List<ValidationIssue> issues(
        LoadItem item, String path, LoadOccupancy usage, DemandContext context) {
      return item.getPowerUnit() == PowerUnit.BTU_H
          ? ratedIssues(
              item, path, context, NormativeTableCode.T11_AIR_CONDITIONERS, item.getPower())
          : List.of();
    }

    /** In BTU/h, the W of Tabela 11 (item 6.27.6); the manufacturer's kW otherwise. */
    @Override
    BigDecimal installedKw(LoadItem item, DemandContext context) {
      return item.getPowerUnit() == PowerUnit.BTU_H
          ? ratedKw(item, context, NormativeTableCode.T11_AIR_CONDITIONERS, item.getPower())
          : item.plateKw();
    }

    @Override
    boolean acceptsCapacity() {
      return true;
    }

    /** Tabela 12 over the VA of Tabela 11, or the manufacturer's kW at power factor 1,00. */
    @Override
    ParcelDemand demand(
        List<LoadItem> items, int groupQuantity, LoadOccupancy usage, DemandContext context) {
      List<String> notes = new ArrayList<>();
      List<NormativeReference> references = new ArrayList<>();
      long appliances = 0;
      BigDecimal apparent = BigDecimal.ZERO;
      for (LoadItem item : items) {
        long count = (long) item.getQuantity() * groupQuantity;
        appliances += count;
        if (item.getPowerUnit() == PowerUnit.BTU_H) {
          NormativeValue unit = airConditioner(item, context, notes);
          references.add(unit.reference());
          apparent = apparent.add(unit.secondValue().multiply(BigDecimal.valueOf(count)));
        } else {
          apparent = apparent.add(groupKw(item, groupQuantity, context));
        }
      }
      NormativeValue factor =
          context
              .tables()
              .find(
                  NormativeTableCode.T12_AIR_CONDITIONING,
                  usage.airConditioningKey(),
                  BigDecimal.valueOf(appliances));
      references.add(0, factor.reference());
      BigDecimal kva = DeclaredValues.kva(apparent.multiply(factor.value()));

      return new ParcelDemand(
          this,
          kva,
          prefixed(
              this,
              appliances
                  + (appliances == 1 ? " aparelho, " : " aparelhos, ")
                  + DeclaredValues.fixed(apparent, 2)
                  + " kVA × "
                  + DeclaredValues.fixed(factor.value(), 2)
                  + " = "
                  + DeclaredValues.fixed(kva, 2)
                  + " kVA",
              notes),
          DemandComponent.distinct(references));
    }
  },
  MOTORS("g", "Motores e máquinas de solda a motor") {
    /** Above 5 CV the starting condition changes the demand of the parcel (Tabela 14). */
    @Override
    List<ValidationIssue> issues(
        LoadItem item, String path, LoadOccupancy usage, DemandContext context) {
      List<ValidationIssue> issues = new ArrayList<>(motorTableIssues(item, path, context));
      BigDecimal power = item.getPowerUnit().toCv(item.getPower());
      if (power.compareTo(LARGE_MOTOR_CV) > 0 && item.getSimultaneousStart() == null) {
        issues.add(
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
      return issues;
    }

    /** The absorbed power of Tabela 18 or 19, not the plate converted (item 6.27.7). */
    @Override
    BigDecimal installedKw(LoadItem item, DemandContext context) {
      return absorbedKw(item, context);
    }

    @Override
    boolean ratedByMotorTable(LoadItem item) {
      return true;
    }

    /** Motors that must start together count as one; of equal largest ones, only one is. */
    @Override
    ParcelDemand demand(
        List<LoadItem> items, int groupQuantity, LoadOccupancy usage, DemandContext context) {
      List<String> notes = new ArrayList<>();
      List<NormativeReference> references = new ArrayList<>();
      SortedMap<BigDecimal, Long> motors = units();
      BigDecimal simultaneous = BigDecimal.ZERO;
      for (LoadItem item : items) {
        NormativeValue motor = motorKva(item, context, notes);
        references.add(motor.reference());
        notes.add(
            item.getDescription()
                + ": "
                + item.getQuantity()
                + " × "
                + DeclaredValues.fixed(motor.value(), 2)
                + " kW de carga instalada ("
                + motor.reference().identification()
                + ")");
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
        List<LoadItem> items, int groupQuantity, LoadOccupancy usage, DemandContext context) {
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
    @Override
    List<ValidationIssue> issues(
        LoadItem item, String path, LoadOccupancy usage, DemandContext context) {
      return item.getPowerUnit() == PowerUnit.KW
          ? List.of()
          : motorTableIssues(item, path, context);
    }

    /** Rated like a motor when the plate is in CV or HP, as its kVA is. */
    @Override
    BigDecimal installedKw(LoadItem item, DemandContext context) {
      return ratedByMotorTable(item) ? absorbedKw(item, context) : item.plateKw();
    }

    @Override
    boolean ratedByMotorTable(LoadItem item) {
      return item.getPowerUnit() == PowerUnit.CV || item.getPowerUnit() == PowerUnit.HP;
    }

    /** Pumps rated in CV or HP take their kVA from the motor table; in kW, power factor 1,00. */
    @Override
    ParcelDemand demand(
        List<LoadItem> items, int groupQuantity, LoadOccupancy usage, DemandContext context) {
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

  /** Each parcel present among the items, in the order of item 6.27 (a to i). */
  static List<ParcelDemand> parcels(
      List<LoadItem> items, int groupQuantity, LoadOccupancy usage, DemandContext context) {
    Map<LoadCategory, List<LoadItem>> byParcel =
        items.stream()
            .collect(
                Collectors.groupingBy(
                    LoadItem::getCategory,
                    () -> new EnumMap<>(LoadCategory.class),
                    Collectors.toList()));
    return byParcel.entrySet().stream()
        .map(parcel -> parcel.getKey().demand(parcel.getValue(), groupQuantity, usage, context))
        .toList();
  }

  /** "a + b = 2,18 + 13,00": the parcels as they add up. */
  static String sum(List<ParcelDemand> parcels) {
    String symbols =
        String.join(" + ", parcels.stream().map(parcel -> parcel.category().parcel()).toList());
    String values =
        String.join(
            " + ", parcels.stream().map(parcel -> DeclaredValues.fixed(parcel.kva(), 2)).toList());
    return symbols + " = " + values;
  }

  /** What this parcel asks of an item whose power is already informed. */
  List<ValidationIssue> issues(
      LoadItem item, String path, LoadOccupancy usage, DemandContext context) {
    return List.of();
  }

  /** Installed kW of an item with its quantity; the plate converted unless the parcel rates it. */
  BigDecimal installedKw(LoadItem item, DemandContext context) {
    return item.plateKw();
  }

  /** Whether the installed load comes from Tabela 18 or 19 instead of the plate. */
  boolean ratedByMotorTable(LoadItem item) {
    return false;
  }

  /** Whether a capacity in BTU/h means anything for this parcel. */
  boolean acceptsCapacity() {
    return false;
  }

  /** Demand of this parcel over the items of one group, in kVA. */
  abstract ParcelDemand demand(
      List<LoadItem> items, int groupQuantity, LoadOccupancy usage, DemandContext context);

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
            .map(item -> groupKw(item, groupQuantity, context))
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
    BigDecimal size = motorSize(item);
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

  /** The row a motor is read at: CV or HP as on the plate, kW converted to CV. */
  private static BigDecimal motorSize(LoadItem item) {
    return item.getPowerUnit() == PowerUnit.KW
        ? item.getPowerUnit().toCv(item.getPower())
        : item.getPower();
  }

  /** Tabela 11 at the first tabulated capacity that reaches the appliance, as Exemplo 3 does. */
  private static NormativeValue airConditioner(
      LoadItem item, DemandContext context, List<String> notes) {
    NormativeValue unit =
        context.tables().find(NormativeTableCode.T11_AIR_CONDITIONERS, item.getPower());
    String read =
        unit.row().getUpperBound().compareTo(item.getPower()) == 0
            ? " pela "
            : " lido na linha de " + unit.band() + " da ";
    notes.add(
        item.getDescription()
            + ": "
            + DeclaredValues.decimal(item.getPower())
            + " BTU/h"
            + read
            + unit.reference().identification()
            + ", "
            + DeclaredValues.fixed(unit.value(), 2)
            + " kW e "
            + DeclaredValues.fixed(unit.secondValue(), 2)
            + " kVA cada");
    return unit;
  }

  /** The kW column of a rating table with the item's quantity; the plate while it cannot. */
  private static BigDecimal ratedKw(
      LoadItem item, DemandContext context, NormativeTableCode table, BigDecimal argument) {
    if (!context.tables().contains(table)) {
      return item.plateKw();
    }
    return context
        .tables()
        .lookup(table, null, argument)
        .map(row -> row.value().multiply(BigDecimal.valueOf(item.getQuantity())))
        .orElseGet(item::plateKw);
  }

  /** What blocks the run while the plate is shown: the table missing or no row reached. */
  private static List<ValidationIssue> ratedIssues(
      LoadItem item,
      String path,
      DemandContext context,
      NormativeTableCode table,
      BigDecimal argument) {
    String citation = table.identification() + " da " + table.standard().code();
    if (!context.tables().contains(table)) {
      return List.of(
          ValidationIssue.review(
              path + ".power",
              "A "
                  + citation
                  + " não está publicada: sem ela não há carga nem demanda de \""
                  + item.getDescription()
                  + "\". Publique a tabela em Normas e Tabelas."));
    }
    if (context.tables().lookup(table, null, argument).isEmpty()) {
      return List.of(
          ValidationIssue.review(
              path + ".power",
              "\""
                  + item.getDescription()
                  + "\" declarado com "
                  + DeclaredValues.decimal(item.getPower())
                  + " "
                  + item.getPowerUnit().label()
                  + " passa da última linha da "
                  + citation
                  + (item.getPowerUnit() == PowerUnit.BTU_H
                      ? ": confira a capacidade do aparelho."
                      : ": confira a potência de placa.")));
    }
    return List.of();
  }

  private static BigDecimal absorbedKw(LoadItem item, DemandContext context) {
    return ratedKw(item, context, context.connectionType().motorTable(), motorSize(item));
  }

  private static List<ValidationIssue> motorTableIssues(
      LoadItem item, String path, DemandContext context) {
    return ratedIssues(item, path, context, context.connectionType().motorTable(), motorSize(item));
  }

  private static BigDecimal groupKw(LoadItem item, int groupQuantity, DemandContext context) {
    return item.installedKw(context).multiply(BigDecimal.valueOf(groupQuantity));
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
    lines.add(category.parcel + ") " + category.label + ": " + formula);
    lines.addAll(notes);
    return lines;
  }
}
