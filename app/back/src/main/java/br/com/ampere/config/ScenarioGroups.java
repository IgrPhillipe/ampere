package br.com.ampere.config;

import br.com.ampere.domain.EvStationType;
import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.GroupSpec;
import br.com.ampere.domain.LampTechnology;
import br.com.ampere.domain.LoadCategory;
import br.com.ampere.domain.LoadItem;
import br.com.ampere.domain.LoadUsage;
import br.com.ampere.domain.PowerUnit;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/** The consumer unit groups the scenarios declare, and the edits a designer makes to them. */
final class ScenarioGroups {

  /** What a group will be once the scenario attaches it to its project. */
  record GroupDraft(GroupKind kind, GroupSpec spec) {}

  private ScenarioGroups() {}

  static GroupDraft apartments(
      String name, int quantity, String usefulArea, int bedrooms, String unitLoadKw) {
    return residential(name, quantity, usefulArea, bedrooms, unitLoadKw, false);
  }

  /** Studios and similar: above 15 units they take the fixed coincidence factor. */
  static GroupDraft compactApartments(
      String name, int quantity, String usefulArea, int bedrooms, String unitLoadKw) {
    return residential(name, quantity, usefulArea, bedrooms, unitLoadKw, true);
  }

  static GroupDraft commonArea() {
    return load(
        "Área comum",
        1,
        LoadUsage.COMMON_AREA,
        item(LoadCategory.MOTORS, "Elevador", 1, "12", PowerUnit.CV, null, false),
        item(
            LoadCategory.LIGHTING_AND_OUTLETS,
            "Iluminação",
            1,
            "8.00",
            PowerUnit.KW,
            LampTechnology.COMPACT_FLUORESCENT_LED,
            null));
  }

  static GroupDraft commercial(String name, int quantity) {
    return load(
        name,
        quantity,
        LoadUsage.COMMERCIAL,
        item(
            LoadCategory.LIGHTING_AND_OUTLETS,
            "Iluminação",
            1,
            "1.20",
            PowerUnit.KW,
            LampTechnology.COMPACT_FLUORESCENT_LED,
            null),
        item(
            LoadCategory.LIGHTING_AND_OUTLETS,
            "Tomadas",
            1,
            "1.80",
            PowerUnit.KW,
            LampTechnology.GENERAL_OUTLETS,
            null));
  }

  static GroupDraft charging(int points) {
    return charging(
        "Recarga de veículo elétrico", points, "7.40", false, false, EvStationType.COLLECTIVE);
  }

  static GroupDraft charging(
      String name,
      int points,
      String powerPerPointKw,
      boolean incorporatedInVehicle,
      Boolean loadManagement,
      EvStationType stationType) {
    return new GroupDraft(
        GroupKind.EV_CHARGING,
        new GroupSpec(
            name,
            points,
            null,
            null,
            null,
            null,
            null,
            null,
            powerPerPointKw == null ? null : new BigDecimal(powerPerPointKw),
            incorporatedInVehicle,
            loadManagement,
            stationType));
  }

  static GroupDraft load(String name, int quantity, LoadUsage usage, LoadItem... items) {
    return new GroupDraft(
        GroupKind.LOAD,
        new GroupSpec(
            name, quantity, null, null, null, null, usage, List.of(items), null, null, null, null));
  }

  static LoadItem item(
      LoadCategory category,
      String description,
      int quantity,
      String power,
      PowerUnit unit,
      LampTechnology lamp,
      Boolean simultaneousStart) {
    return new LoadItem(
        category, description, quantity, new BigDecimal(power), unit, lamp, simultaneousStart);
  }

  static GroupSpec withQuantity(GroupSpec spec, int quantity) {
    return new GroupSpec(
        spec.name(),
        quantity,
        spec.usefulArea(),
        spec.bedrooms(),
        spec.unitLoadKw(),
        spec.compactUnit(),
        spec.usage(),
        spec.items(),
        spec.powerPerPointKw(),
        spec.incorporatedInVehicle(),
        spec.loadManagement(),
        spec.stationType());
  }

  static GroupSpec withUsefulArea(GroupSpec spec, String usefulArea) {
    return new GroupSpec(
        spec.name(),
        spec.quantity(),
        new BigDecimal(usefulArea),
        spec.bedrooms(),
        spec.unitLoadKw(),
        spec.compactUnit(),
        spec.usage(),
        spec.items(),
        spec.powerPerPointKw(),
        spec.incorporatedInVehicle(),
        spec.loadManagement(),
        spec.stationType());
  }

  static GroupSpec withLoadManagement(GroupSpec spec, boolean loadManagement) {
    return new GroupSpec(
        spec.name(),
        spec.quantity(),
        spec.usefulArea(),
        spec.bedrooms(),
        spec.unitLoadKw(),
        spec.compactUnit(),
        spec.usage(),
        spec.items(),
        spec.powerPerPointKw(),
        spec.incorporatedInVehicle(),
        loadManagement,
        spec.stationType());
  }

  static GroupSpec withItem(GroupSpec spec, LoadItem extra) {
    List<LoadItem> items = new ArrayList<>(spec.items());
    items.add(extra);

    return new GroupSpec(
        spec.name(),
        spec.quantity(),
        spec.usefulArea(),
        spec.bedrooms(),
        spec.unitLoadKw(),
        spec.compactUnit(),
        spec.usage(),
        items,
        spec.powerPerPointKw(),
        spec.incorporatedInVehicle(),
        spec.loadManagement(),
        spec.stationType());
  }

  private static GroupDraft residential(
      String name,
      int quantity,
      String usefulArea,
      int bedrooms,
      String unitLoadKw,
      boolean compact) {
    return new GroupDraft(
        GroupKind.RESIDENTIAL,
        new GroupSpec(
            name,
            quantity,
            usefulArea == null ? null : new BigDecimal(usefulArea),
            bedrooms,
            new BigDecimal(unitLoadKw),
            compact,
            null,
            null,
            null,
            null,
            null,
            null));
  }
}
