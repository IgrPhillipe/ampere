package br.com.ampere.service;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

  private VersionFieldLabels() {}

  static String of(String field) {
    Matcher item = LOAD_ITEM.matcher(field);
    if (item.matches()) {
      String name = item.group(2) == null ? item.group(1) : item.group(1) + " " + item.group(2);

      return name + ", " + LOAD_ITEM_FIELDS.getOrDefault(item.group(3), item.group(3));
    }

    return FIELDS.getOrDefault(field, field);
  }
}
