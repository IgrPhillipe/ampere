package br.com.ampere.config;

import static br.com.ampere.config.ScenarioCase.FindingSpec.calculation;
import static br.com.ampere.config.ScenarioCase.FindingSpec.document;
import static br.com.ampere.config.ScenarioCase.FindingSpec.projectData;
import static br.com.ampere.config.ScenarioCase.FindingSpec.units;
import static br.com.ampere.config.ScenarioGroups.apartments;
import static br.com.ampere.config.ScenarioGroups.charging;
import static br.com.ampere.config.ScenarioGroups.commercial;
import static br.com.ampere.config.ScenarioGroups.commonArea;
import static br.com.ampere.config.ScenarioGroups.compactApartments;
import static br.com.ampere.config.ScenarioGroups.item;
import static br.com.ampere.config.ScenarioGroups.load;
import static br.com.ampere.config.ScenarioGroups.withItem;
import static br.com.ampere.config.ScenarioGroups.withLoadManagement;
import static br.com.ampere.config.ScenarioGroups.withQuantity;
import static br.com.ampere.config.ScenarioGroups.withUsefulArea;
import static br.com.ampere.domain.DocumentType.ART;
import static br.com.ampere.domain.DocumentType.SINGLE_LINE_DIAGRAM;
import static br.com.ampere.domain.DocumentType.SITE_PLAN;
import static br.com.ampere.domain.FindingAnswer.CONTESTED;
import static br.com.ampere.domain.FindingAnswer.FIXED;
import static br.com.ampere.domain.FindingResolution.ACCEPT;
import static br.com.ampere.domain.FindingResolution.REOPEN;
import static br.com.ampere.domain.FindingSeverity.ADJUSTMENT;
import static br.com.ampere.domain.FindingSeverity.BLOCKING;
import static br.com.ampere.domain.LoadCategory.AIR_CONDITIONING;
import static br.com.ampere.domain.LoadCategory.APPLIANCES;
import static br.com.ampere.domain.LoadCategory.COOKING;
import static br.com.ampere.domain.LoadCategory.INSTANT_HEATING;
import static br.com.ampere.domain.LoadCategory.LIGHTING_AND_OUTLETS;
import static br.com.ampere.domain.LoadCategory.MOTORS;
import static br.com.ampere.domain.LoadCategory.PUMPS_AND_HOT_TUBS;
import static br.com.ampere.domain.LoadCategory.SPECIAL_EQUIPMENT;
import static br.com.ampere.domain.LoadCategory.STORAGE_HEATING;

import br.com.ampere.config.ScenarioGroups.GroupDraft;
import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.EvStationType;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.LampTechnology;
import br.com.ampere.domain.LoadUsage;
import br.com.ampere.domain.Mixed;
import br.com.ampere.domain.NonResidential;
import br.com.ampere.domain.PowerUnit;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.SupplyVoltage;
import java.util.ArrayList;
import java.util.List;

/**
 * Every project of the demonstration. The protocols 2026-1001 to 2026-1008 and 2026-2001 to
 * 2026-2019 are the ones earlier seeds filed, so a database that already has them gets no copy.
 */
final class DemoScenarios {

  private static final SupplyVoltage V380 = SupplyVoltage.V380_220;
  private static final SupplyVoltage V220 = SupplyVoltage.V220_127;

  private DemoScenarios() {}

  static List<Scenario> all(DemoUsers u) {
    List<Scenario> scenarios = new ArrayList<>();
    scenarios.addAll(legacy(u));
    scenarios.addAll(drafts(u));
    scenarios.addAll(underReview(u));
    scenarios.addAll(rejected(u));
    scenarios.addAll(approved(u));

    return scenarios;
  }

  private static List<Scenario> legacy(DemoUsers u) {
    return List.of(
        Scenario.of(
            "2026-1001",
            "Residencial Monte Verde",
            "Rodovia BR-101, km 8",
            "Cabo de Santo Agostinho",
            "54505010",
            residential(12, V380),
            u.user(),
            14,
            c ->
                c.addAll(
                    apartments("Apartamento tipo A", 24, "68", 2, "6.50"),
                    apartments("Apartamento tipo B", 20, "92", 3, "8.20"),
                    apartments("Cobertura duplex", 4, "140", 4, "11.40"),
                    load(
                        "Área comum",
                        1,
                        LoadUsage.COMMON_AREA,
                        item(MOTORS, "Elevador", 1, "12", PowerUnit.CV, null, null),
                        item(
                            PUMPS_AND_HOT_TUBS,
                            "Bombas de recalque",
                            2,
                            "5",
                            PowerUnit.CV,
                            null,
                            null),
                        item(
                            LIGHTING_AND_OUTLETS,
                            "Iluminação",
                            1,
                            "10.00",
                            PowerUnit.KW,
                            LampTechnology.COMPACT_FLUORESCENT_LED,
                            null),
                        item(
                            LIGHTING_AND_OUTLETS,
                            "Tomadas",
                            1,
                            "15.80",
                            PowerUnit.KW,
                            LampTechnology.GENERAL_OUTLETS,
                            null)),
                    charging(
                        "Recarga de veículo elétrico",
                        6,
                        "7.40",
                        false,
                        null,
                        EvStationType.COLLECTIVE))),
        Scenario.of(
                "2026-1002",
                "Edifício Torre Norte",
                "Avenida Norte, 4501",
                "Recife",
                "52041000",
                mixed(18, V380),
                u.user(),
                95,
                c ->
                    ready(
                        c,
                        90,
                        apartments("Apartamento tipo A", 16, "72", 2, "6.80"),
                        commercial("Lojas do térreo", 6)))
            .awaitingSubmission(),
        Scenario.of(
            "2026-1003",
            "Edifício Residencial Aurora",
            "Rua da Aurora, 1240",
            "Recife",
            "50050000",
            residential(9, V220),
            u.user(),
            48,
            c -> {
              ready(
                  c,
                  42,
                  apartments("Apartamento tipo A", 24, "68", 2, "6.50"),
                  apartments("Apartamento tipo B", 20, "92", 3, "8.20"),
                  commonArea(),
                  charging(6));
              c.submit(40);
            }),
        Scenario.of(
            "2026-1004",
            "Condomínio Vila Nova",
            "Avenida Barreto de Menezes, 88",
            "Jaboatão dos Guararapes",
            "54410010",
            residential(6, V220, ConnectionType.TWO_PHASE, EntranceStandard.INDIVIDUAL),
            u.user(),
            20,
            c -> {
              List<ConsumerUnitGroup> groups =
                  ready(c, 15, apartments("Apartamento padrão", 8, "60", 2, "5.60"));
              c.submit(12).assignTo(u.revisor());
              c.reject(
                  0,
                  u.revisor(),
                  "Corrija a ART e a área útil do apartamento padrão antes de reenviar.",
                  document(BLOCKING, ART, "A ART não traz a assinatura do responsável técnico."),
                  units(
                      BLOCKING,
                      groups.getFirst(),
                      "A área útil do apartamento padrão diverge da planta baixa.",
                      "DIS-NOR-053, Quadro 35"),
                  projectData(ADJUSTMENT, "Informe o número do lote no endereço."));
            }),
        Scenario.of(
            "2026-1005",
            "Centro Empresarial Recife",
            "Avenida Guararapes, 250",
            "Recife",
            "50010000",
            nonResidential(14, V380, ConnectionType.THREE_PHASE, EntranceStandard.INDIVIDUAL),
            u.user(),
            70,
            c -> {
              ready(c, 65, commercial("Salas comerciais", 24), commonArea());
              c.submit(60).assignTo(u.revisor());
              c.reject(
                  35,
                  u.revisor(),
                  "Envie a planta de situação com escala.",
                  document(BLOCKING, SITE_PLAN, "A planta de situação está sem escala."));
            }),
        Scenario.of(
            "2026-1006",
            "Comercial Praça Sul",
            "Rua do Sol, 302",
            "Olinda",
            "53020140",
            nonResidential(3, V220, ConnectionType.SINGLE_PHASE, EntranceStandard.INDIVIDUAL),
            u.user(),
            26,
            c -> {
              ready(c, 22, commercial("Lojas", 4));
              c.submit(20).assignTo(u.revisor());
              c.approve(0, "Projeto em conformidade com a DIS-NOR-030.");
            }),
        Scenario.of(
            "2026-1007",
            "Edifício Comercial Boa Vista",
            "Rua do Futuro, 800",
            "Recife",
            "52050000",
            nonResidential(8, V380),
            u.user(),
            36,
            c -> {
              ready(c, 32, commercial("Salas comerciais", 40), charging(4));
              c.submit(30);
            }),
        Scenario.of(
            "2026-1008",
            "Condomínio Jardim Recife",
            "Avenida Caxangá, 2500",
            "Recife",
            "50740000",
            residential(6, V380),
            u.user(),
            52,
            c -> {
              ready(c, 47, apartments("Apartamento padrão", 12, "54", 2, "5.20"));
              c.submit(45).assignTo(u.revisor());
              List<Finding> findings =
                  c.reject(
                      12,
                      u.revisor(),
                      "Complete o diagrama unifilar com o disjuntor geral.",
                      document(
                          BLOCKING,
                          SINGLE_LINE_DIAGRAM,
                          "O diagrama unifilar não indica o disjuntor geral."),
                      projectData(ADJUSTMENT, "Informe o número do lote no endereço."));
              c.replaceDocument(11, SINGLE_LINE_DIAGRAM, 2);
              c.respond(
                  11, findings.get(0), FIXED, "Disjuntor geral de 100 A indicado na revisão 2.");
              c.respond(11, findings.get(1), FIXED, "Lote 14 incluído no endereço.");
              c.resubmit(10, "Diagrama unifilar com o disjuntor geral e lote informado.");
            }));
  }

  private static List<Scenario> drafts(DemoUsers u) {
    return List.of(
        Scenario.of(
            "2026-2001",
            "Residencial Mar Azul",
            "Avenida Boa Viagem, 3400",
            "Recife",
            "51020010",
            residential(10, V380),
            u.user(),
            5,
            c -> {}),
        Scenario.of(
            "2026-2002",
            "Edifício Capibaribe",
            "Rua da Aurora, 520",
            "Recife",
            "50050000",
            residential(14, V380),
            u.user(),
            9,
            // The penthouse lacks its useful area: the step shows a pending group.
            c ->
                c.addAll(
                    apartments("Apartamento tipo", 16, "70", 2, "6.20"),
                    apartments("Cobertura", 2, null, 4, "12.00"))),
        Scenario.of(
            "2026-2003",
            "Condomínio Parque das Águas",
            "Avenida Barreto de Menezes, 1200",
            "Jaboatão dos Guararapes",
            "54410010",
            residential(12, V380),
            u.user(),
            12,
            c -> ready(c, 6, apartments("Apartamento tipo", 30, "65", 2, "6.00"), commonArea())),
        Scenario.of(
            "2026-2016",
            "Residencial Petrolina Sol",
            "Avenida Cardoso de Sá, 900",
            "Petrolina",
            "56302000",
            residential(5, V220),
            u.user(),
            20,
            c -> {
              c.add(apartments("Apartamento padrão", 10, "58", 2, "5.40"));
              c.calculate(8);
            }),
        Scenario.of(
            "2026-2025",
            "Galpão Industrial Caruaru",
            "Rodovia BR-104, km 62",
            "Caruaru",
            "55014000",
            nonResidential(2, V380),
            u.carla(),
            7,
            // Motors above 5 CV without the simultaneous start answer: the group asks for review.
            c ->
                c.addAll(
                    load(
                        "Galpão de produção",
                        1,
                        LoadUsage.COMMERCIAL,
                        item(MOTORS, "Motores das esteiras", 2, "7.5", PowerUnit.CV, null, null),
                        item(
                            LIGHTING_AND_OUTLETS,
                            "Iluminação",
                            1,
                            "3.00",
                            PowerUnit.KW,
                            LampTechnology.COMPACT_FLUORESCENT_LED,
                            null)),
                    commercial("Escritório", 1))),
        Scenario.of(
            "2026-2026",
            "Residencial Bosque de Camaragibe",
            "Rua Frei Caneca, 240",
            "Camaragibe",
            "54759000",
            residential(6, V380),
            u.user(),
            12,
            // A unit was added after the calculation: the memorial asks for a new one.
            c -> {
              List<ConsumerUnitGroup> groups =
                  ready(c, 6, apartments("Apartamento tipo", 14, "62", 2, "5.80"));
              c.edit(2, groups.getFirst(), withQuantity(groups.getFirst().spec(), 16));
            }),
        Scenario.of(
            "2026-2027",
            "Edifício Mirante de Ipojuca",
            "Avenida Beira Mar, 700",
            "Ipojuca",
            "55590000",
            residential(9, V380),
            u.carla(),
            14,
            // The supply voltage changed after the calculation.
            c -> {
              ready(c, 7, apartments("Apartamento tipo", 18, "66", 2, "6.00"), commonArea());
              c.changeBuilding(2, residential(9, V220));
            }),
        Scenario.of(
            "2026-2028",
            "Mercado Pedras de Fogo",
            "Rua Capitão Joaquim, 30",
            "Pedras de Fogo",
            "58328000",
            nonResidential(2, V380),
            u.joao(),
            9,
            c -> ready(c, 4, commercial("Lojas", 8))),
        Scenario.of(
            "2026-2029",
            "Edifício Misto Conde da Boa Vista",
            "Avenida Conde da Boa Vista, 1100",
            "Recife",
            "50060000",
            mixed(12, V220),
            u.admin(),
            8,
            c ->
                ready(
                    c,
                    3,
                    apartments("Apartamento tipo", 20, "58", 2, "5.40"),
                    commercial("Lojas do térreo", 5),
                    charging(2))),
        showcase(u),
        Scenario.of(
            "2026-2031",
            "Residencial Mata Norte",
            "Rua do Comércio, 95",
            "Vitória de Santo Antão",
            "55602000",
            residential(4, V380),
            u.carla(),
            10,
            c -> {
              c.add(apartments("Apartamento tipo", 12, "60", 2, "5.60"));
              c.documents(6, ART);
              c.calculate(5);
            }),
        Scenario.of(
            "2026-2032",
            "Complexo Reserva do Capibaribe",
            "Avenida Engenheiro Domingos Ferreira, 4000",
            "Recife",
            "51030000",
            residential(32, V380),
            u.carla(),
            15,
            // Above 300 kVA: no band of the entrance table reaches it.
            c ->
                ready(
                    c,
                    3,
                    apartments("Apartamento tipo 1", 240, "85", 3, "7.60"),
                    apartments("Apartamento tipo 2", 160, "110", 4, "9.40"),
                    commonArea(),
                    charging(20))),
        Scenario.of(
            "2026-2033",
            "Residencial Bela Vista",
            "Rua das Flores, 12",
            "Pedras de Fogo",
            "58328000",
            residential(2, V220),
            u.joao(),
            6,
            // Four small apartments: the minimum demand of the first band applies.
            c -> ready(c, 2, apartments("Apartamento padrão", 4, "55", 2, "5.00"))),
        Scenario.of(
            "2026-2034",
            "Residencial Janga",
            "Avenida Cláudio Gueiros Leite, 310",
            "Paulista",
            "53437000",
            residential(3, V220, ConnectionType.TWO_PHASE, EntranceStandard.INDIVIDUAL),
            u.carla(),
            12,
            c -> ready(c, 5, apartments("Apartamento padrão", 6, "50", 2, "4.80"))),
        Scenario.of(
            "2026-2035",
            "Padaria Central",
            "Rua Siqueira Campos, 140",
            "Pedras de Fogo",
            "58328000",
            nonResidential(1, V220, ConnectionType.SINGLE_PHASE, EntranceStandard.INDIVIDUAL),
            u.joao(),
            8,
            c -> ready(c, 3, commercial("Padaria", 1), commercial("Mercearia", 1))));
  }

  /** Every rare input of the calculation in one project. */
  private static Scenario showcase(DemoUsers u) {
    return Scenario.of(
        "2026-2030",
        "Complexo Multiuso Marco Zero",
        "Cais do Apolo, 222",
        "Recife",
        "50030230",
        mixed(12, V380),
        u.user(),
        11,
        c -> {
          c.addAll(
              compactApartments("Studios", 36, "32", 1, "3.20"),
              load(
                  "Área comum",
                  1,
                  LoadUsage.COMMON_AREA,
                  item(MOTORS, "Elevadores", 2, "10", PowerUnit.HP, null, true),
                  item(PUMPS_AND_HOT_TUBS, "Bombas de recalque", 2, "5", PowerUnit.HP, null, null),
                  item(
                      LIGHTING_AND_OUTLETS,
                      "Iluminação do estacionamento",
                      1,
                      "6.00",
                      PowerUnit.KW,
                      LampTechnology.FLUORESCENT_NEON_SODIUM,
                      null),
                  item(
                      LIGHTING_AND_OUTLETS,
                      "Tomadas da portaria",
                      1,
                      "2.40",
                      PowerUnit.KW,
                      LampTechnology.GENERAL_OUTLETS,
                      null),
                  item(
                      STORAGE_HEATING,
                      "Aquecedor central da piscina",
                      1,
                      "9.00",
                      PowerUnit.KW,
                      null,
                      null),
                  item(
                      AIR_CONDITIONING,
                      "Ar-condicionado do salão de festas",
                      3,
                      "2.20",
                      PowerUnit.KW,
                      null,
                      null)),
              load(
                  "Restaurante e clínica do térreo",
                  2,
                  LoadUsage.COMMERCIAL,
                  item(COOKING, "Fogão elétrico industrial", 1, "6.00", PowerUnit.KW, null, null),
                  item(
                      APPLIANCES, "Lava-louças e micro-ondas", 2, "2.50", PowerUnit.KW, null, null),
                  item(INSTANT_HEATING, "Torneiras elétricas", 3, "3.50", PowerUnit.KW, null, null),
                  item(
                      SPECIAL_EQUIPMENT,
                      "Equipamento de diagnóstico por imagem",
                      1,
                      "15.00",
                      PowerUnit.KW,
                      null,
                      null),
                  item(
                      AIR_CONDITIONING,
                      "Ar-condicionado split",
                      4,
                      "2.00",
                      PowerUnit.KW,
                      null,
                      null),
                  item(
                      LIGHTING_AND_OUTLETS,
                      "Iluminação",
                      1,
                      "1.50",
                      PowerUnit.KW,
                      LampTechnology.COMPACT_FLUORESCENT_LED,
                      null)),
              charging(
                  "Recarga individualizada por unidade",
                  12,
                  "7.40",
                  false,
                  true,
                  EvStationType.INDIVIDUAL),
              charging(
                  "Recarga incorporada ao veículo", 6, null, true, true, EvStationType.COLLECTIVE));
          c.documents(4).calculate(3);
        });
  }

  private static List<Scenario> underReview(DemoUsers u) {
    return List.of(
        Scenario.of(
            "2026-2004",
            "Residencial Boa Viagem Prime",
            "Rua Ernesto de Paula Santos, 1000",
            "Recife",
            "51021000",
            residential(20, V380),
            u.user(),
            10,
            c -> {
              ready(
                  c,
                  5,
                  apartments("Apartamento tipo", 40, "85", 3, "7.80"),
                  commonArea(),
                  charging(8));
              c.submit(3);
            }),
        Scenario.of(
            "2026-2005",
            "Empresarial Pina Office",
            "Avenida Herculano Bandeira, 513",
            "Recife",
            "51011000",
            nonResidential(12, V380),
            u.user(),
            40,
            c -> {
              ready(c, 34, commercial("Salas comerciais", 48));
              c.submit(30).assignTo(u.revisor());
              c.draftFindings(
                  1,
                  u.revisor(),
                  calculation(
                      BLOCKING,
                      "Dc",
                      "A carga de iluminação das salas está abaixo do mínimo por área.",
                      "DIS-NOR-030, item 6.23.1"),
                  document(ADJUSTMENT, SITE_PLAN, "Indique o norte na planta de situação."));
            }),
        Scenario.of(
            "2026-2006",
            "Mix Casa Forte",
            "Praça de Casa Forte, 120",
            "Recife",
            "52061000",
            mixed(10, V380),
            u.user(),
            45,
            c -> {
              ready(
                  c,
                  40,
                  apartments("Apartamento tipo", 18, "75", 2, "6.80"),
                  commercial("Lojas do térreo", 4));
              c.submit(36).assignTo(u.revisor());
            }),
        Scenario.of(
            "2026-2013",
            "Residencial Olinda Alta",
            "Rua do Amparo, 45",
            "Olinda",
            "53020140",
            residential(6, V220),
            u.carla(),
            16,
            c -> {
              ready(c, 12, apartments("Apartamento padrão", 12, "62", 2, "5.60"));
              c.submit(10);
            }),
        Scenario.of(
            "2026-2015",
            "Sede Regional Administrativa",
            "Avenida Agamenon Magalhães, 2400",
            "Recife",
            "52010000",
            nonResidential(6, V380),
            u.admin(),
            12,
            c -> {
              ready(c, 9, commercial("Escritórios", 20));
              c.submit(7).assignTo(u.revisor());
            }),
        Scenario.of(
            "2026-2036",
            "Condomínio Jardim Atlântico",
            "Avenida Presidente Kennedy, 1500",
            "Olinda",
            "53130000",
            residential(10, V380),
            u.carla(),
            35,
            // Submitted 28 days ago: two days left, nobody took it yet.
            c -> {
              ready(c, 30, apartments("Apartamento tipo", 20, "64", 2, "5.90"), commonArea());
              c.submit(28);
            }),
        Scenario.of(
            "2026-2037",
            "Edifício Comercial Santo Amaro",
            "Rua Santo Amaro, 340",
            "Recife",
            "50040000",
            nonResidential(7, V380),
            u.user(),
            32,
            // Three days left, with the second analyst.
            c -> {
              ready(c, 29, commercial("Salas comerciais", 16));
              c.submit(27).assignTo(u.ana());
            }),
        Scenario.of(
            "2026-2038",
            "Residencial Paraíso",
            "Rua Nova, 18",
            "Pedras de Fogo",
            "58328000",
            residential(3, V220),
            u.joao(),
            34,
            // One day left, taken by the administrator, who does not own it.
            c -> {
              ready(c, 31, apartments("Apartamento padrão", 10, "58", 2, "5.40"));
              c.submit(29).assignTo(u.admin());
            }),
        Scenario.of(
            "2026-2039",
            "Centro Médico Boa Viagem",
            "Rua dos Navegantes, 800",
            "Recife",
            "51021040",
            nonResidential(5, V380),
            u.carla(),
            33,
            // Back in review with no analyst: a state only the seed reaches.
            c -> {
              ready(c, 28, commercial("Consultórios", 14));
              c.submit(25);
              List<Finding> findings =
                  c.reject(
                      18,
                      u.revisor(),
                      "Complete o diagrama unifilar.",
                      document(
                          BLOCKING,
                          SINGLE_LINE_DIAGRAM,
                          "O diagrama unifilar não mostra o quadro de medição."));
              c.replaceDocument(10, SINGLE_LINE_DIAGRAM, 2);
              c.respond(10, findings.getFirst(), FIXED, "Quadro de medição incluído na revisão 2.");
              c.resubmit(8, "Diagrama unifilar com o quadro de medição.");
            }),
        Scenario.of(
            "2026-2040",
            "Condomínio Pedras Norte",
            "Rua José Inácio, 410",
            "Pedras de Fogo",
            "58328000",
            residential(4, V220),
            u.joao(),
            9,
            c -> {
              ready(c, 6, apartments("Apartamento padrão", 6, "52", 2, "4.90"));
              c.submit(5);
            }),
        Scenario.of(
            "2026-2043",
            "Edifício Comercial Centro de Pedras",
            "Praça da Matriz, 22",
            "Pedras de Fogo",
            "58328000",
            nonResidential(3, V220),
            u.joao(),
            20,
            c -> {
              ready(c, 15, commercial("Salas", 12));
              c.submit(12).assignTo(u.ana());
            }),
        reanalysisOfGracasGarden(u),
        reanalysisOfEspinheiro(u),
        threeCyclesOfRecifeAntigo(u));
  }

  private static Scenario reanalysisOfGracasGarden(DemoUsers u) {
    return Scenario.of(
        "2026-2009",
        "Condomínio Graças Garden",
        "Rua Amélia, 150",
        "Recife",
        "52050000",
        residential(18, V380),
        u.user(),
        34,
        c -> {
          List<ConsumerUnitGroup> groups =
              ready(c, 28, apartments("Apartamento tipo B", 32, "92", 3, "7.60"), commonArea());
          c.submit(25).assignTo(u.revisor());
          List<Finding> findings =
              c.reject(
                  18,
                  u.revisor(),
                  "Revise a área do tipo B e a ART.",
                  units(
                      BLOCKING,
                      groups.getFirst(),
                      "A área útil do apartamento tipo B diverge da planta baixa.",
                      "DIS-NOR-053, Quadro 35"),
                  document(ADJUSTMENT, ART, "A ART está sem o número de registro no CREA."));
          c.edit(9, groups.getFirst(), withUsefulArea(groups.getFirst().spec(), "84"));
          c.replaceDocument(9, SITE_PLAN, 3);
          c.respond(
              8,
              findings.get(0),
              FIXED,
              "Refizemos o levantamento da área útil a partir da planta baixa revisada (prancha 03,"
                  + " revisão C). O apartamento tipo B tinha a varanda técnica somada por engano;"
                  + " sem ela, a área cai de 92 m² para 84 m², o que muda a faixa do Quadro 35. O"
                  + " grupo foi corrigido, a demanda recalculada e a nova planta segue anexada, com"
                  + " as cotas da varanda destacadas para conferência.");
          c.respond(
              8,
              findings.get(1),
              CONTESTED,
              "O número do registro está no campo 4 da ART, na segunda página.");
          c.calculate(8);
          c.resubmit(
              6, "Área útil do apartamento tipo B corrigida para 84 m² e nova planta anexada.");
        });
  }

  private static Scenario reanalysisOfEspinheiro(DemoUsers u) {
    return Scenario.of(
        "2026-2010",
        "Residencial Espinheiro",
        "Rua do Espinheiro, 640",
        "Recife",
        "52020000",
        residential(12, V380),
        u.user(),
        30,
        c -> {
          ready(c, 25, apartments("Apartamento padrão", 24, "68", 2, "6.40"));
          c.submit(22).assignTo(u.revisor());
          List<Finding> findings =
              c.reject(
                  16,
                  u.revisor(),
                  "Complete o diagrama e revise os pavimentos.",
                  document(
                      BLOCKING,
                      SINGLE_LINE_DIAGRAM,
                      "O diagrama unifilar não mostra a proteção geral."),
                  projectData(ADJUSTMENT, "O número de pavimentos difere do memorial."));
          c.replaceDocument(9, SINGLE_LINE_DIAGRAM, 2);
          c.respond(9, findings.get(0), FIXED, "Proteção geral incluída no diagrama.");
          c.respond(
              9,
              findings.get(1),
              FIXED,
              "Contagem conferida: 12 pavimentos, com o térreo e o ático.");
          c.resubmit(7, "Diagrama unifilar completo e pavimentos conferidos.");
          // The analyst accepted one answer and reopened the other.
          c.resolve(findings.get(0), ACCEPT);
          c.resolve(findings.get(1), REOPEN);
        });
  }

  private static Scenario threeCyclesOfRecifeAntigo(DemoUsers u) {
    return Scenario.of(
        "2026-2017",
        "Edifício Recife Antigo",
        "Rua do Bom Jesus, 180",
        "Recife",
        "50030170",
        mixed(7, V380),
        u.user(),
        65,
        c -> {
          List<ConsumerUnitGroup> groups =
              ready(
                  c,
                  55,
                  apartments("Apartamento tipo", 12, "68", 2, "6.20"),
                  commercial("Lojas do térreo", 3));
          ConsumerUnitGroup stores = groups.getLast();
          c.submit(50).assignTo(u.revisor());
          List<Finding> first =
              c.reject(
                  42,
                  u.revisor(),
                  "Indique a seção dos condutores no diagrama.",
                  document(
                      BLOCKING,
                      SINGLE_LINE_DIAGRAM,
                      "O diagrama unifilar não indica a seção dos condutores."));
          c.replaceDocument(38, SINGLE_LINE_DIAGRAM, 2);
          c.respond(38, first.getFirst(), FIXED, "Seções indicadas na revisão 2 do diagrama.");
          c.resubmit(36, "Diagrama unifilar com a seção dos condutores.");
          c.resolve(first.getFirst(), ACCEPT);
          List<Finding> second =
              c.reject(
                  28,
                  u.revisor(),
                  "Inclua o ar-condicionado nas lojas.",
                  units(
                      BLOCKING,
                      stores,
                      "A carga das lojas do térreo não inclui o ar-condicionado.",
                      null));
          c.edit(
              21,
              stores,
              withItem(
                  stores.spec(),
                  item(AIR_CONDITIONING, "Ar-condicionado", 1, "3.00", PowerUnit.KW, null, null)));
          c.respond(
              20, second.getFirst(), FIXED, "Ar-condicionado de 3 kW por loja incluído no grupo.");
          c.calculate(20);
          c.resubmit(18, "Carga de ar-condicionado incluída nas lojas.");
        });
  }

  private static List<Scenario> rejected(DemoUsers u) {
    return List.of(
        Scenario.of(
            "2026-2007",
            "Residencial Torre das Graças",
            "Rua das Graças, 310",
            "Recife",
            "52011000",
            residential(16, V380),
            u.user(),
            22,
            c -> {
              List<ConsumerUnitGroup> groups =
                  ready(c, 18, apartments("Apartamento tipo B", 28, "92", 3, "8.20"));
              c.submit(15).assignTo(u.revisor());
              c.reject(
                  8,
                  u.revisor(),
                  "Corrija a área útil do apartamento tipo B e reenvie.",
                  units(
                      BLOCKING,
                      groups.getFirst(),
                      "A área útil do apartamento tipo B diverge da planta baixa.",
                      "DIS-NOR-053, Quadro 35"),
                  projectData(ADJUSTMENT, "Informe o número do lote no endereço."));
            }),
        Scenario.of(
            "2026-2008",
            "Edifício Madalena",
            "Rua Real da Torre, 700",
            "Recife",
            "50610000",
            residential(8, V380),
            u.user(),
            28,
            // Halfway through the correction: one answer given, the blocking one still open.
            c -> {
              ready(c, 23, apartments("Apartamento padrão", 16, "60", 2, "5.80"));
              c.submit(20).assignTo(u.revisor());
              List<Finding> findings =
                  c.reject(
                      12,
                      u.revisor(),
                      "Assine a ART e complete o diagrama unifilar.",
                      document(
                          BLOCKING, ART, "A ART não traz a assinatura do responsável técnico."),
                      document(
                          ADJUSTMENT,
                          SINGLE_LINE_DIAGRAM,
                          "Inclua a legenda dos condutores no diagrama unifilar."));
              c.replaceDocument(2, SINGLE_LINE_DIAGRAM, 2);
              c.respond(2, findings.get(1), FIXED, "Legenda incluída na revisão 2 do diagrama.");
            }),
        Scenario.of(
            "2026-2014",
            "Condomínio Pedras de Fogo",
            "Rua Coronel Antônio Pessoa, 80",
            "Pedras de Fogo",
            "58328000",
            residential(4, V220),
            u.carla(),
            25,
            c -> {
              ready(c, 21, apartments("Apartamento padrão", 8, "55", 2, "5.20"));
              c.submit(18).assignTo(u.revisor());
              c.reject(
                  11,
                  u.revisor(),
                  "Envie a planta de situação com escala.",
                  document(BLOCKING, SITE_PLAN, "A planta de situação está sem escala."));
            }),
        Scenario.of(
            "2026-2018",
            "Residencial Casa Amarela",
            "Estrada do Arraial, 2100",
            "Recife",
            "52051380",
            residential(9, V380),
            u.user(),
            40,
            c -> {
              ready(c, 35, apartments("Apartamento tipo", 16, "70", 2, "6.40"), commonArea());
              c.submit(30).assignTo(u.ana());
              List<Finding> findings =
                  c.reject(
                      24,
                      u.ana(),
                      "Confira o número de pavimentos.",
                      projectData(
                          ADJUSTMENT, "O número de pavimentos não confere com o corte AA."));
              c.respond(
                  20,
                  findings.getFirst(),
                  CONTESTED,
                  "O corte AA inclui o pavimento técnico, que não tem unidades consumidoras.");
              c.resubmit(15, "Sem alteração nos dados: a contestação explica o pavimento técnico.");
              c.resolve(findings.getFirst(), ACCEPT);
              c.approve(7, "Contestação aceita: o pavimento técnico não entra na conta.");
            }),
        Scenario.of(
            "2026-2019",
            "Edifício Parnamirim",
            "Rua Joaquim Nabuco, 300",
            "Recife",
            "52011000",
            residential(14, V380),
            u.user(),
            50,
            // Rejected twice: the second review reopens the ART and adds a new finding.
            c -> {
              List<ConsumerUnitGroup> groups =
                  ready(c, 45, apartments("Apartamento tipo", 26, "90", 3, "7.80"), commonArea());
              c.submit(40).assignTo(u.revisor());
              List<Finding> first =
                  c.reject(
                      34,
                      u.revisor(),
                      "Envie a ART da entrada de serviço.",
                      document(BLOCKING, ART, "A ART não cobre a execução da entrada de serviço."));
              c.replaceDocument(30, ART, 2);
              c.respond(30, first.getFirst(), FIXED, "Nova ART anexada.");
              c.resubmit(28, "Nova ART anexada, com a execução da entrada de serviço.");
              c.resolve(first.getFirst(), REOPEN);
              c.reject(
                  3,
                  u.revisor(),
                  "A nova ART ainda não cita a entrada de serviço.",
                  units(
                      ADJUSTMENT,
                      groups.getFirst(),
                      "A carga por apartamento está acima da média dos projetos da região.",
                      null));
            }),
        Scenario.of(
            "2026-2020",
            "Residencial Parque Boa Vista",
            "Rua Dom Bosco, 410",
            "Recife",
            "50070000",
            residential(7, V380),
            u.user(),
            26,
            // Every blocking finding answered, one fixed and one contested: ready to resubmit.
            c -> {
              List<ConsumerUnitGroup> groups =
                  ready(c, 22, apartments("Apartamento tipo", 20, "66", 2, "6.10"), commonArea());
              c.submit(18).assignTo(u.revisor());
              List<Finding> findings =
                  c.reject(
                      9,
                      u.revisor(),
                      "Corrija o diagrama e a carga por apartamento, ou justifique.",
                      document(
                          BLOCKING,
                          SINGLE_LINE_DIAGRAM,
                          "O diagrama unifilar não mostra o aterramento."),
                      units(
                          BLOCKING,
                          groups.getFirst(),
                          "A carga por apartamento está abaixo da média dos projetos da região.",
                          null),
                      projectData(ADJUSTMENT, "Informe o bloco ou a torre no endereço."));
              c.replaceDocument(6, SINGLE_LINE_DIAGRAM, 2);
              c.respond(6, findings.get(0), FIXED, "Aterramento incluído na revisão 2.");
              c.respond(
                  5,
                  findings.get(1),
                  CONTESTED,
                  "A carga de 6,10 kW por unidade vem do levantamento das cargas do projeto"
                      + " elétrico, com chuveiro e ar-condicionado.");
              c.respond(5, findings.get(2), FIXED, "Endereço conferido: torre única, sem bloco.");
            }),
        Scenario.of(
            "2026-2021",
            "Residencial Serra Verde",
            "Avenida Santo Antônio, 520",
            "Garanhuns",
            "55290000",
            residential(5, V220),
            u.carla(),
            30,
            // Everything contested and waiting for the designer to resubmit.
            c -> {
              ready(c, 25, apartments("Apartamento padrão", 10, "62", 2, "5.80"));
              c.submit(20).assignTo(u.revisor());
              List<Finding> findings =
                  c.reject(
                      10,
                      u.revisor(),
                      "Revise o fator de coincidência e a data da ART.",
                      calculation(
                          BLOCKING,
                          "Drf",
                          "O fator de coincidência não considera as 10 unidades do projeto.",
                          "DIS-NOR-053, Quadro 36"),
                      document(ADJUSTMENT, ART, "A ART está sem a data de emissão."));
              c.respond(
                  6,
                  findings.get(0),
                  CONTESTED,
                  "O Fc de 10 apartamentos foi lido da linha de 10 do Quadro 36, como no memorial.");
              c.respond(
                  5,
                  findings.get(1),
                  CONTESTED,
                  "A data de emissão está no rodapé da primeira página da ART.");
            }),
        Scenario.of(
            "2026-2022",
            "Condomínio Mata Sul",
            "Rua José Inácio, 215",
            "Pedras de Fogo",
            "58328000",
            residential(4, V220),
            u.joao(),
            22,
            // Only adjustments: nothing blocks the resubmission.
            c -> {
              ready(c, 17, apartments("Apartamento padrão", 8, "55", 2, "5.20"));
              c.submit(14).assignTo(u.ana());
              c.reject(
                  6,
                  u.ana(),
                  "Ajustes simples: reenvie sem alterar o cálculo.",
                  document(ADJUSTMENT, SITE_PLAN, "Indique o norte na planta de situação."),
                  projectData(ADJUSTMENT, "Informe um ponto de referência no endereço."));
            }),
        Scenario.of(
            "2026-2023",
            "Edifício Empresarial Paulista Center",
            "Avenida Dr. Cláudio José Gueiros Leite, 900",
            "Paulista",
            "53401440",
            nonResidential(9, V380),
            u.carla(),
            24,
            // One finding in each stage of the review.
            c -> {
              List<ConsumerUnitGroup> groups = ready(c, 20, commercial("Salas comerciais", 30));
              c.submit(16).assignTo(u.revisor());
              c.reject(
                  5,
                  u.revisor(),
                  "Corrija os quatro pontos apontados e reenvie.",
                  projectData(
                      BLOCKING, "O número de pavimentos não confere com a planta de situação."),
                  units(
                      BLOCKING,
                      groups.getFirst(),
                      "A carga das salas comerciais não inclui o ar-condicionado.",
                      "DIS-NOR-030, item 6.27"),
                  calculation(
                      ADJUSTMENT,
                      "Dc",
                      "A demanda comercial deve refletir o ar-condicionado das salas.",
                      "DIS-NOR-030, item 6.27.1"),
                  document(BLOCKING, ART, "A ART está em nome de outro responsável técnico."));
            }),
        Scenario.of(
            "2026-2024",
            "Condomínio Solar da Torre",
            "Rua da Hora, 520",
            "Recife",
            "52021000",
            residential(8, V380),
            u.user(),
            30,
            // The designer fixed the area but did not calculate again: the calculation is outdated.
            c -> {
              List<ConsumerUnitGroup> groups =
                  ready(c, 26, apartments("Apartamento tipo", 18, "72", 3, "6.80"));
              c.submit(20).assignTo(u.revisor());
              List<Finding> findings =
                  c.reject(
                      8,
                      u.revisor(),
                      "Corrija a área útil do apartamento tipo e reenvie.",
                      units(
                          BLOCKING,
                          groups.getFirst(),
                          "A área útil de 72 m² diverge da planta baixa, que indica 68 m².",
                          "DIS-NOR-053, Quadro 35"));
              c.edit(3, groups.getFirst(), withUsefulArea(groups.getFirst().spec(), "68"));
              c.respond(
                  3,
                  findings.getFirst(),
                  FIXED,
                  "Área útil corrigida para 68 m² no grupo. Falta recalcular a demanda.");
            }));
  }

  private static List<Scenario> approved(DemoUsers u) {
    return List.of(
        Scenario.of(
            "2026-2011",
            "Edifício Derby Center",
            "Praça do Derby, 50",
            "Recife",
            "52010000",
            nonResidential(8, V380),
            u.user(),
            30,
            c -> {
              ready(c, 25, commercial("Salas comerciais", 30));
              c.submit(20).assignTo(u.revisor());
              c.approve(12, "Projeto em conformidade com a DIS-NOR-030.");
            }),
        Scenario.of(
            "2026-2012",
            "Residencial Jaqueira",
            "Rua do Futuro, 1100",
            "Recife",
            "52050020",
            residential(15, V380),
            u.user(),
            55,
            c -> {
              List<ConsumerUnitGroup> groups =
                  ready(
                      c,
                      45,
                      apartments("Apartamento tipo", 30, "78", 3, "7.20"),
                      commonArea(),
                      charging(4));
              ConsumerUnitGroup charging = groups.get(2);
              c.submit(40).assignTo(u.revisor());
              List<Finding> findings =
                  c.reject(
                      33,
                      u.revisor(),
                      "Comprove o gerenciamento da recarga.",
                      calculation(
                          BLOCKING,
                          "Dve",
                          "Comprove o sistema de gerenciamento da recarga.",
                          "DIS-NOR-030, item 6.26.4.2"));
              c.edit(29, charging, withLoadManagement(charging.spec(), true));
              c.replaceDocument(28, ART, 2);
              c.respond(
                  28,
                  findings.getFirst(),
                  FIXED,
                  "Memorial do fabricante do gerenciador anexado à ART.");
              c.calculate(28);
              c.resubmit(26, "Comprovação do gerenciamento de recarga anexada.");
              c.resolve(findings.getFirst(), ACCEPT);
              c.approve(20, "Correção aceita. Projeto aprovado.");
            }),
        Scenario.of(
            "2026-2041",
            "Centro Comercial Caruaru Plaza",
            "Avenida Agamenon Magalhães, 1200",
            "Caruaru",
            "55012000",
            nonResidential(4, V380),
            u.carla(),
            60,
            // Non-residential, approved by the second analyst after one rework.
            c -> {
              List<ConsumerUnitGroup> groups = ready(c, 52, commercial("Lojas", 36));
              ConsumerUnitGroup stores = groups.getFirst();
              c.submit(48).assignTo(u.ana());
              List<Finding> findings =
                  c.reject(
                      40,
                      u.ana(),
                      "Considere o ar-condicionado das lojas.",
                      calculation(
                          BLOCKING,
                          "Dc",
                          "A carga de ar-condicionado das lojas não foi considerada na demanda"
                              + " comercial.",
                          "DIS-NOR-030, item 6.27.1"));
              c.edit(
                  36,
                  stores,
                  withItem(
                      stores.spec(),
                      item(
                          AIR_CONDITIONING,
                          "Ar-condicionado",
                          1,
                          "2.50",
                          PowerUnit.KW,
                          null,
                          null)));
              c.respond(
                  35,
                  findings.getFirst(),
                  FIXED,
                  "Ar-condicionado de 2,5 kW por loja incluído e demanda recalculada.");
              c.calculate(35);
              c.resubmit(33, "Ar-condicionado das lojas incluído no cálculo.");
              c.resolve(findings.getFirst(), ACCEPT);
              c.approve(26, "Correção aceita. Projeto aprovado.");
            }),
        Scenario.of(
            "2026-2042",
            "Edifício Parque das Flores",
            "Avenida Conselheiro Aguiar, 2000",
            "Recife",
            "51111000",
            residential(6, V380),
            u.bruno(),
            175,
            // Old project of the designer whose account was deactivated since.
            c -> {
              ready(c, 170, apartments("Apartamento padrão", 12, "60", 2, "5.60"));
              c.submit(165).assignTo(u.revisor());
              c.approve(150, "Projeto em conformidade com a DIS-NOR-053.");
            }));
  }

  /** The groups, then the documents and the calculation of the same day. */
  private static List<ConsumerUnitGroup> ready(ScenarioCase c, int daysAgo, GroupDraft... groups) {
    List<ConsumerUnitGroup> saved = c.addAll(groups);
    c.documents(daysAgo).calculate(daysAgo);

    return saved;
  }

  private static BuildingType residential(int floors, SupplyVoltage voltage) {
    return residential(floors, voltage, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE);
  }

  private static BuildingType residential(
      int floors, SupplyVoltage voltage, ConnectionType connection, EntranceStandard entrance) {
    return new ResidentialMultifamily(floors, voltage, connection, entrance);
  }

  private static BuildingType nonResidential(int floors, SupplyVoltage voltage) {
    return nonResidential(floors, voltage, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE);
  }

  private static BuildingType nonResidential(
      int floors, SupplyVoltage voltage, ConnectionType connection, EntranceStandard entrance) {
    return new NonResidential(floors, voltage, connection, entrance);
  }

  private static BuildingType mixed(int floors, SupplyVoltage voltage) {
    return new Mixed(floors, voltage, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE);
  }
}
