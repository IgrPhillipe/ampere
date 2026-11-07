package br.com.ampere.service;

import br.com.ampere.domain.BuildingCategory;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.EvStationType;
import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.LampTechnology;
import br.com.ampere.domain.LoadCategory;
import br.com.ampere.domain.LoadUsage;
import br.com.ampere.domain.PowerUnit;
import br.com.ampere.domain.SupplyVoltage;
import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

final class VersionFieldLabels {

  private static final Pattern LOAD_ITEM =
      Pattern.compile("items\\[[^:]*:(.+?)(?:#(\\d+))?]\\.(\\w+)");

  private static final Map<String, String> FIELDS =
      Map.ofEntries(
          Map.entry("kind", "Tipo de grupo"),
          Map.entry("name", "Nome do grupo"),
          Map.entry("quantity", "Quantidade de unidades"),
          Map.entry("usefulArea", "Área útil"),
          Map.entry("bedrooms", "Quartos"),
          Map.entry("unitLoadKw", "Carga por unidade"),
          Map.entry("compactUnit", "Unidade compacta"),
          Map.entry("usage", "Tipo de uso"),
          Map.entry("powerPerPointKw", "Potência por ponto"),
          Map.entry("incorporatedInVehicle", "Estação incorporada ao veículo"),
          Map.entry("loadManagement", "Sistema de gerenciamento de carga"),
          Map.entry("stationType", "Tipo de posto"),
          Map.entry("buildingType", "Tipo de edificação"),
          Map.entry("floors", "Nº de pavimentos"),
          Map.entry("voltage", "Tensão de fornecimento"),
          Map.entry("connectionType", "Tipo de ligação"),
          Map.entry("entranceStandard", "Padrão de entrada"));

  private static final Map<String, String> LOAD_ITEM_FIELDS =
      Map.of(
          "category", "categoria",
          "description", "descrição",
          "quantity", "quantidade",
          "power", "potência de placa",
          "powerUnit", "unidade de potência",
          "lampTechnology", "tecnologia da lâmpada",
          "simultaneousStart", "partida simultânea");

  private static final Map<String, String> YES_NO = Map.of("true", "Sim", "false", "Não");

  private static final Map<String, Map<String, String>> VALUES =
      Map.ofEntries(
          Map.entry("kind", labels(GroupKind.values(), GroupKind::label)),
          Map.entry("usage", labels(LoadUsage.values(), LoadUsage::label)),
          Map.entry("stationType", labels(EvStationType.values(), EvStationType::label)),
          Map.entry("buildingType", labels(BuildingCategory.values(), BuildingCategory::label)),
          Map.entry("voltage", labels(SupplyVoltage.values(), SupplyVoltage::label)),
          Map.entry("connectionType", labels(ConnectionType.values(), ConnectionType::label)),
          Map.entry("entranceStandard", labels(EntranceStandard.values(), EntranceStandard::label)),
          Map.entry("category", labels(LoadCategory.values(), LoadCategory::label)),
          Map.entry("powerUnit", labels(PowerUnit.values(), PowerUnit::label)),
          Map.entry("lampTechnology", labels(LampTechnology.values(), LampTechnology::label)),
          Map.entry("compactUnit", YES_NO),
          Map.entry("incorporatedInVehicle", YES_NO),
          Map.entry("loadManagement", YES_NO),
          Map.entry("simultaneousStart", YES_NO));

  private VersionFieldLabels() {}

  private static <E extends Enum<E>> Map<String, String> labels(
      E[] values, Function<E, String> label) {
    return Arrays.stream(values).collect(Collectors.toMap(Enum::name, label));
  }

  /** The value as the screens show it; numbers and free text stay as they are. */
  static String ofValue(String field, String value) {
    String name = field.substring(field.lastIndexOf('.') + 1);

    return value == null ? null : VALUES.getOrDefault(name, Map.of()).getOrDefault(value, value);
  }

  static String of(String field) {
    Matcher item = LOAD_ITEM.matcher(field);
    if (item.matches()) {
      String name = item.group(2) == null ? item.group(1) : item.group(1) + " " + item.group(2);

      return name + ", " + LOAD_ITEM_FIELDS.getOrDefault(item.group(3), item.group(3));
    }

    return FIELDS.getOrDefault(field, field);
  }
}
