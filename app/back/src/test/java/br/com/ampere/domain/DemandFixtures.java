package br.com.ampere.domain;

import br.com.ampere.config.NormativeTableSeed;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** Groups and published tables for calculation tests, typed as the examples of Anexo I state. */
public final class DemandFixtures {

  static final Map<String, Standard> STANDARDS =
      Map.of(
          "DIS-NOR-053", new Standard("DIS-NOR-053", "REV 06"),
          "DIS-NOR-030", new Standard("DIS-NOR-030", "REV 07"));

  private DemandFixtures() {}

  static NormativeTableSet tables() {
    return new NormativeTableSet(NormativeTableSeed.all(STANDARDS));
  }

  static DemandContext context(SupplyVoltage voltage, ConnectionType connection) {
    return new DemandContext(tables(), voltage, connection);
  }

  static Project project(SupplyVoltage voltage) {
    return Project.draft(
        "Edifício de exemplo",
        "Rua do Anexo I, 1",
        "Recife",
        "2026-0001",
        new ResidentialMultifamily(
            4, voltage, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
        List.of());
  }

  static ConsumerUnitGroup apartments(Project project, int quantity, String usefulArea) {
    return apartments(project, "Apartamento tipo", quantity, usefulArea, false);
  }

  static ConsumerUnitGroup apartments(
      Project project, String name, int quantity, String usefulArea, boolean compact) {
    return GroupKind.RESIDENTIAL.create(
        project,
        new GroupSpec(
            name,
            quantity,
            new BigDecimal(usefulArea),
            1,
            new BigDecimal("5"),
            compact,
            ConnectionType.SINGLE_PHASE,
            null,
            null,
            null,
            null,
            null,
            null));
  }

  static ConsumerUnitGroup threePhaseApartments(
      Project project, String name, int quantity, String usefulArea, List<LoadItem> loads) {
    return GroupKind.RESIDENTIAL.create(
        project,
        new GroupSpec(
            name,
            quantity,
            new BigDecimal(usefulArea),
            3,
            null,
            false,
            ConnectionType.THREE_PHASE,
            null,
            loads,
            null,
            null,
            null,
            null));
  }

  /** DIS-NOR-030 Exemplo 3 (p. 52 to 55), oven in parcel e and air conditioners in VA. */
  static List<LoadItem> exemplo3() {
    return List.of(
        item(LoadCategory.LIGHTING_AND_OUTLETS, "Tomadas", 1, "3.0", PowerUnit.KW),
        item(LoadCategory.LIGHTING_AND_OUTLETS, "Iluminação", 1, "1.2", PowerUnit.KW),
        item(LoadCategory.INSTANT_HEATING, "Chuveiro elétrico", 4, "4", PowerUnit.KW),
        item(LoadCategory.INSTANT_HEATING, "Torneira elétrica", 1, "3", PowerUnit.KW),
        item(LoadCategory.INSTANT_HEATING, "Ferro de passar", 1, "1", PowerUnit.KW),
        item(LoadCategory.APPLIANCES, "Lava-louças", 1, "2", PowerUnit.KW),
        item(LoadCategory.APPLIANCES, "Secadora de roupas", 1, "2.5", PowerUnit.KW),
        item(LoadCategory.COOKING, "Forno elétrico", 1, "1.5", PowerUnit.KW),
        item(LoadCategory.AIR_CONDITIONING, "Condicionador de ar", 2, "2.1", PowerUnit.KW),
        motor("Motor trifásico", 2, "1"));
  }

  static ConsumerUnitGroup loads(Project project, LoadUsage usage, LoadItem... items) {
    return loads(project, "Área comum", 1, usage, items);
  }

  static ConsumerUnitGroup loads(
      Project project, String name, int quantity, LoadUsage usage, LoadItem... items) {
    return GroupKind.LOAD.create(
        project,
        new GroupSpec(
            name,
            quantity,
            null,
            null,
            null,
            null,
            null,
            usage,
            new ArrayList<>(List.of(items)),
            null,
            null,
            null,
            null));
  }

  public static ConsumerUnitGroup charging(Project project, int points, String kw) {
    return GroupKind.EV_CHARGING.create(
        project,
        new GroupSpec(
            "Recarga",
            points,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            new BigDecimal(kw),
            false,
            true,
            EvStationType.COLLECTIVE));
  }

  static LoadItem lighting(String description, String kw, LampTechnology technology) {
    return new LoadItem(
        LoadCategory.LIGHTING_AND_OUTLETS,
        description,
        1,
        new BigDecimal(kw),
        PowerUnit.KW,
        technology,
        null);
  }

  static LoadItem outlets(String kw) {
    return lighting("Tomadas", kw, LampTechnology.GENERAL_OUTLETS);
  }

  static LoadItem item(
      LoadCategory category, String description, int quantity, String power, PowerUnit unit) {
    return new LoadItem(category, description, quantity, new BigDecimal(power), unit, null, false);
  }

  static LoadItem motor(String description, int quantity, String cv) {
    return item(LoadCategory.MOTORS, description, quantity, cv, PowerUnit.CV);
  }
}
