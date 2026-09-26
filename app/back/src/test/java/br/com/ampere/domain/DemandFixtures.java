package br.com.ampere.domain;

import br.com.ampere.config.NormativeTableSeed;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** Groups and published tables for calculation tests, typed as the examples of Anexo I state. */
final class DemandFixtures {

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
            null,
            null,
            null,
            null,
            null,
            null));
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
            usage,
            new ArrayList<>(List.of(items)),
            null,
            null,
            null,
            null));
  }

  static ConsumerUnitGroup charging(Project project, int points, String kw) {
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
