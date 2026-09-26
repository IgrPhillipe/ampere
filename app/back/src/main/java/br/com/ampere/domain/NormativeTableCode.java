package br.com.ampere.domain;

import java.util.List;

/**
 * The parametric tables the calculation reads. Each constant fixes what the generic columns of a
 * {@link NormativeTableRow} mean for that table.
 */
public enum NormativeTableCode {
  Q33_EV_STATIONS(
      StandardName.DIS_NOR_053,
      "Quadro 33",
      "Fator de demanda dos agrupamentos das estações de recarga veicular",
      "6.26.1",
      "98",
      List.of(),
      "Nº de estações",
      List.of("Fator de demanda")),
  Q35_APARTMENT_DEMAND(
      StandardName.DIS_NOR_053,
      "Quadro 35",
      "Demanda do apartamento em função da área útil",
      "Anexo I, item 1",
      "107",
      List.of(),
      "Área útil (m²)",
      List.of("Demanda (kVA)")),
  Q36_COINCIDENCE_FACTOR(
      StandardName.DIS_NOR_053,
      "Quadro 36",
      "Fator de coincidência em função do número de apartamentos",
      "Anexo I, item 3",
      "107",
      List.of(),
      "Nº de apartamentos",
      List.of("Fator de coincidência (%)")) {
    @Override
    public boolean percentValue() {
      return true;
    }
  },
  Q37_SAFETY_FACTOR(
      StandardName.DIS_NOR_053,
      "Quadro 37",
      "Fator de segurança recomendado",
      "Anexo I, item 5",
      "108",
      List.of(),
      "Demanda residencial (kVA)",
      List.of("Fator de segurança")),
  T1_SERVICE_ENTRANCE_220_127(
      StandardName.DIS_NOR_053,
      "Tabela 1",
      "Dimensionamento da entrada de serviço de edificações de uso coletivo em 220/127 V",
      "Anexo I, item 8.1",
      "123",
      List.of(),
      "Demanda máxima da edificação (kVA)",
      List.of("Circuitos", "Seção do condutor (mm²)", "Disjuntor geral (A)")),
  T2_SERVICE_ENTRANCE_380_220(
      StandardName.DIS_NOR_053,
      "Tabela 2",
      "Dimensionamento da entrada de serviço de edificações de uso coletivo em 380/220 V",
      "Anexo I, item 8.2",
      "123",
      List.of(),
      "Demanda máxima da edificação (kVA)",
      List.of("Circuitos", "Seção do condutor (mm²)", "Disjuntor geral (A)")),
  T6_RESIDENTIAL_LIGHTING_OUTLETS(
      StandardName.DIS_NOR_030,
      "Tabela 6",
      "Fatores de demanda de tomadas e iluminação residencial",
      "6.27.1.1",
      "65",
      List.of(),
      "Carga instalada (kW)",
      List.of("Fator de demanda")),
  T7_INSTANT_HEATING(
      StandardName.DIS_NOR_030,
      "Tabela 7",
      "Fatores de demanda de chuveiros, torneiras, aquecedores de passagem e ferros elétricos",
      "6.27.2.1",
      "66",
      List.of(),
      "Nº de aparelhos",
      List.of("Fator de demanda")),
  T8_STORAGE_HEATING(
      StandardName.DIS_NOR_030,
      "Tabela 8",
      "Fatores de demanda de aquecedor central ou de acumulação",
      "6.27.3",
      "66",
      List.of(),
      "Nº de aparelhos",
      List.of("Fator de demanda")),
  T9_APPLIANCES(
      StandardName.DIS_NOR_030,
      "Tabela 9",
      "Fatores de demanda de secadora, forno, máquina de lavar, lava-louça e micro-ondas",
      "6.27.4",
      "66",
      List.of(),
      "Nº de aparelhos",
      List.of("Fator de demanda")),
  T12_AIR_CONDITIONING(
      StandardName.DIS_NOR_030,
      "Tabela 12",
      "Fatores de demanda para condicionadores de ar",
      "6.27.6",
      "68",
      List.of(
          new NormativeTableKey("RESIDENTIAL", "Residencial"),
          new NormativeTableKey("COMMERCIAL", "Comercial")),
      "Nº de aparelhos",
      List.of("Fator de demanda")),
  T13_EV_INDIVIDUAL_STATIONS(
      StandardName.DIS_NOR_030,
      "Tabela 13",
      "Fatores de demanda para estações de recarga individuais",
      "6.27.10",
      "68",
      List.of(),
      "Nº de estações",
      List.of("Fator de demanda")),
  T14_MOTORS(
      StandardName.DIS_NOR_030,
      "Tabela 14",
      "Fatores de demanda de motores",
      "6.27.7",
      "68",
      List.of(
          new NormativeTableKey("LARGEST", "Maior motor"),
          new NormativeTableKey("OTHERS", "Demais")),
      null,
      List.of("Fator de demanda")),
  T15_SPECIAL_EQUIPMENT(
      StandardName.DIS_NOR_030,
      "Tabela 15",
      "Fatores de demanda de equipamentos especiais",
      "6.27.8",
      "68",
      List.of(
          new NormativeTableKey("LARGEST", "Maior equipamento"),
          new NormativeTableKey("OTHERS", "Demais")),
      null,
      List.of("Fator de demanda")),
  T16_PUMPS(
      StandardName.DIS_NOR_030,
      "Tabela 16",
      "Fatores de demanda de bombas e hidromassagem",
      "6.27.9",
      "68",
      List.of(),
      "Nº de aparelhos",
      List.of("Fator de demanda")),
  T18_SINGLE_PHASE_MOTORS(
      StandardName.DIS_NOR_030,
      "Tabela 18",
      "Características elétricas dos motores monofásicos",
      "6.27.7",
      "69",
      List.of(),
      "Potência nominal (cv ou HP)",
      List.of("Potência absorvida (kW)", "Potência absorvida (kVA)")),
  T19_THREE_PHASE_MOTORS(
      StandardName.DIS_NOR_030,
      "Tabela 19",
      "Características elétricas dos motores trifásicos",
      "6.27.7",
      "70",
      List.of(),
      "Potência nominal (cv ou HP)",
      List.of("Potência absorvida (kW)", "Potência absorvida (kVA)")),
  T22_GENERAL_LIGHTING_OUTLETS(
      StandardName.DIS_NOR_030,
      "Tabela 22",
      "Fatores de demanda para iluminação e tomadas de uso geral",
      "6.27.1.2",
      "72",
      List.of(
          new NormativeTableKey(
              "COLLECTIVE_ADMINISTRATION_LIGHTING",
              "Administração de edifícios de uso coletivo: iluminação"),
          new NormativeTableKey(
              "COLLECTIVE_ADMINISTRATION_OUTLETS",
              "Administração de edifícios de uso coletivo: tomadas"),
          new NormativeTableKey("STORES", "Bancos, lojas e semelhantes")),
      null,
      List.of("Fator de demanda"));

  private final StandardName standard;
  private final String identification;
  private final String title;
  private final String item;
  private final String page;
  private final List<NormativeTableKey> keys;
  private final String argumentLabel;
  private final List<String> valueLabels;

  NormativeTableCode(
      StandardName standard,
      String identification,
      String title,
      String item,
      String page,
      List<NormativeTableKey> keys,
      String argumentLabel,
      List<String> valueLabels) {
    this.standard = standard;
    this.identification = identification;
    this.title = title;
    this.item = item;
    this.page = page;
    this.keys = keys;
    this.argumentLabel = argumentLabel;
    this.valueLabels = valueLabels;
  }

  public StandardName standard() {
    return standard;
  }

  public String identification() {
    return identification;
  }

  public String title() {
    return title;
  }

  public String item() {
    return item;
  }

  public String page() {
    return page;
  }

  public List<NormativeTableKey> keys() {
    return keys;
  }

  /** Null when the table is looked up by key only. */
  public String argumentLabel() {
    return argumentLabel;
  }

  public List<String> valueLabels() {
    return valueLabels;
  }

  public boolean keyed() {
    return !keys.isEmpty();
  }

  public boolean ranged() {
    return argumentLabel != null;
  }

  /** Whether the main value is printed as a percentage, like the Fc of Quadro 36. */
  public boolean percentValue() {
    return false;
  }

  public boolean acceptsKey(String key) {
    return keys.stream().anyMatch(candidate -> candidate.code().equals(key));
  }
}
