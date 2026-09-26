package br.com.ampere.config;

import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.NormativeTableRow;
import br.com.ampere.domain.Standard;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Development copy of the tables the calculation reads, typed from the printed pages of DIS-NOR-053
 * REV 06 and DIS-NOR-030 REV 07 (SHA-256 in docs/tecnico/fontes-normativas.md). Production tables
 * are typed in the admin screen; this seed never runs there.
 */
public final class NormativeTableSeed {

  public static final String REGISTERED_BY = "DataSeeder";
  public static final String VERIFIED_BY = "Conferência do PR da US04";

  private NormativeTableSeed() {}

  public static List<NormativeTable> all(Map<String, Standard> standardsByName) {
    return List.of(
        table(NormativeTableCode.Q33_EV_STATIONS)
            .range(1, 10, "1.00")
            .range(11, 20, "0.86")
            .range(21, 30, "0.80")
            .range(31, 40, "0.78")
            .range(41, 50, "0.75")
            .range(51, 75, "0.70")
            .range(76, 100, "0.65")
            .above(100, "0.60")
            .build(standardsByName),
        quadro35().build(standardsByName),
        quadro36().build(standardsByName),
        table(NormativeTableCode.Q37_SAFETY_FACTOR)
            .labelled(null, "25", "1.5", "Dr ≤ 25 kVA")
            .labelled("25", "50", "1.3", "25 < Dr ≤ 50 kVA")
            .labelled("50", "100", "1.2", "50 < Dr ≤ 100 kVA")
            .labelledAbove("100", "1.1", "Dr > 100 kVA")
            .build(standardsByName),
        table(NormativeTableCode.T1_SERVICE_ENTRANCE_220_127)
            .entrance(0, 38, 1, 35, 100)
            .entrance(38, 48, 1, 50, 125)
            .entrance(48, 57, 1, 70, 150)
            .entrance(57, 76, 1, 95, 200)
            .entrance(76, 95, 1, 150, 250)
            .entrance(95, 122, 1, 240, 320)
            .entrance(122, 152, 2, 150, 400)
            .entrance(152, 191, 2, 240, 500)
            .entrance(191, 229, 3, 185, 600)
            .entrance(229, 300, 3, 300, 800)
            .build(standardsByName),
        table(NormativeTableCode.T2_SERVICE_ENTRANCE_380_220)
            .entrance(0, 46, 1, 16, 70)
            .entrance(46, 53, 1, 25, 80)
            .entrance(53, 66, 1, 35, 100)
            .entrance(66, 82, 1, 50, 125)
            .entrance(82, 99, 1, 70, 150)
            .entrance(99, 135, 1, 95, 200)
            .entrance(135, 165, 1, 150, 250)
            .entrance(165, 211, 1, 240, 320)
            .entrance(211, 263, 2, 150, 400)
            .entrance(263, 300, 2, 185, 450)
            .build(standardsByName),
        table(NormativeTableCode.T6_RESIDENTIAL_LIGHTING_OUTLETS)
            .labelled(null, "1", "0.86", "C ≤ 1")
            .labelled("1", "2", "0.75", "1 < C ≤ 2")
            .labelled("2", "3", "0.66", "2 < C ≤ 3")
            .labelled("3", "4", "0.59", "3 < C ≤ 4")
            .labelled("4", "5", "0.52", "4 < C ≤ 5")
            .labelled("5", "6", "0.45", "5 < C ≤ 6")
            .labelled("6", "7", "0.40", "6 < C ≤ 7")
            .labelled("7", "8", "0.35", "7 < C ≤ 8")
            .labelled("8", "9", "0.31", "8 < C ≤ 9")
            .labelled("9", "10", "0.27", "9 < C ≤ 10")
            .labelledAbove("10", "0.24", "C > 10")
            .build(standardsByName),
        tabela7().build(standardsByName),
        table(NormativeTableCode.T8_STORAGE_HEATING)
            .count(1, "1.00")
            .count(2, "0.72")
            .count(3, "0.62")
            .above(3, "0.62")
            .build(standardsByName),
        table(NormativeTableCode.T9_APPLIANCES)
            .count(1, "1.00")
            .range(2, 4, "0.70")
            .range(5, 6, "0.60")
            .above(6, "0.50")
            .build(standardsByName),
        tabela12().build(standardsByName),
        table(NormativeTableCode.T13_EV_INDIVIDUAL_STATIONS)
            .range(1, 10, "1.00")
            .range(11, 20, "0.90")
            .range(21, 30, "0.82")
            .range(31, 40, "0.80")
            .range(41, 50, "0.77")
            .above(50, "0.75")
            .build(standardsByName),
        table(NormativeTableCode.T14_MOTORS)
            .keyed("LARGEST", "1.00")
            .keyed("OTHERS", "0.50")
            .build(standardsByName),
        table(NormativeTableCode.T15_SPECIAL_EQUIPMENT)
            .keyed("LARGEST", "1.00")
            .keyed("OTHERS", "0.60")
            .build(standardsByName),
        table(NormativeTableCode.T16_PUMPS)
            .count(1, "1.00")
            .count(2, "0.56")
            .count(3, "0.47")
            .above(3, "0.39")
            .build(standardsByName),
        tabela18().build(standardsByName),
        tabela19().build(standardsByName),
        table(NormativeTableCode.T22_GENERAL_LIGHTING_OUTLETS)
            .keyed("COLLECTIVE_ADMINISTRATION_LIGHTING", "1.00")
            .keyed("COLLECTIVE_ADMINISTRATION_OUTLETS", "0.50")
            .keyed("STORES", "1.00")
            .build(standardsByName));
  }

  private static Builder quadro35() {
    Builder quadro =
        table(NormativeTableCode.Q35_APARTMENT_DEMAND).labelled(null, "40", "1.00", "até 40");
    String[][] bands = {
      {"41", "45", "1.05"},
      {"46", "50", "1.16"},
      {"51", "55", "1.26"},
      {"56", "60", "1.36"},
      {"61", "65", "1.47"},
      {"66", "70", "1.57"},
      {"71", "75", "1.67"},
      {"76", "80", "1.76"},
      {"81", "85", "1.86"},
      {"86", "90", "1.96"},
      {"91", "95", "2.06"},
      {"96", "100", "2.16"},
      {"101", "110", "2.35"},
      {"111", "120", "2.54"},
      {"121", "130", "2.73"},
      {"131", "140", "2.91"},
      {"141", "150", "3.06"},
      {"151", "160", "3.28"},
      {"161", "170", "3.47"},
      {"171", "180", "3.65"},
      {"181", "190", "3.83"},
      {"191", "200", "4.01"},
      {"201", "220", "4.36"},
      {"221", "240", "4.72"},
      {"241", "260", "5.07"},
      {"261", "280", "5.42"},
      {"281", "300", "5.76"},
      {"301", "350", "6.61"},
      {"351", "400", "7.45"},
      {"401", "450", "8.28"},
      {"451", "500", "9.10"},
      {"501", "550", "9.91"},
      {"551", "600", "10.71"},
      {"601", "650", "11.51"},
      {"651", "700", "12.30"},
      {"701", "800", "13.86"},
      {"801", "900", "15.40"},
      {"901", "1000", "16.93"}
    };
    for (String[] band : bands) {
      quadro.labelled(band[0], band[1], band[2], band[0] + " a " + band[1]);
    }
    return quadro;
  }

  private static Builder quadro36() {
    String[] factors = {
      "100.00", "98.00", "97.30", "97.00", "96.80", "96.60", "96.57", "96.50", "96.45", "96.40",
      "94.73", "93.33", "92.15", "91.14", "90.27", "89.50", "88.82", "88.22", "87.68", "87.20",
      "85.90", "84.77", "83.70", "82.75", "81.84", "81.00", "80.26", "79.54", "78.90", "78.27",
      "77.68", "77.16", "76.64", "76.18", "75.71", "75.28", "74.89", "74.45", "74.11", "73.80",
      "73.46", "73.17", "72.89", "72.60", "72.31", "71.96", "71.62", "71.29", "70.98", "70.68",
      "70.39", "70.17", "69.85", "69.60", "69.35", "69.11", "68.88", "68.66", "68.44"
    };
    Builder quadro = table(NormativeTableCode.Q36_COINCIDENCE_FACTOR);
    for (int apartments = 1; apartments <= factors.length; apartments++) {
      quadro.count(apartments, factors[apartments - 1]);
    }
    return quadro.labelledAbove("59", "68.23", "60 ou mais");
  }

  private static Builder tabela7() {
    String[] factors = {
      "1.00", "1.00", "0.84", "0.76", "0.70", "0.65", "0.60", "0.57", "0.54", "0.52", "0.49",
      "0.48", "0.46", "0.45", "0.44", "0.43", "0.42", "0.41", "0.40", "0.40", "0.39", "0.39",
      "0.39", "0.38", "0.38"
    };
    Builder tabela = table(NormativeTableCode.T7_INSTANT_HEATING);
    for (int appliances = 1; appliances <= factors.length; appliances++) {
      tabela.count(appliances, factors[appliances - 1]);
    }
    return tabela.above(25, "0.38");
  }

  private static Builder tabela12() {
    Builder tabela = table(NormativeTableCode.T12_AIR_CONDITIONING);
    String[][] bands = {
      {"1", "10", "1.00", "1.00"},
      {"11", "20", "0.90", "0.86"},
      {"21", "30", "0.82", "0.80"},
      {"31", "40", "0.80", "0.78"},
      {"41", "50", "0.77", "0.75"},
      {"51", "75", "0.75", "0.70"},
      {"76", "100", "0.75", "0.65"}
    };
    for (String key : List.of("COMMERCIAL", "RESIDENTIAL")) {
      int column = key.equals("COMMERCIAL") ? 2 : 3;
      for (String[] band : bands) {
        tabela.row(key, band[0], band[1], band[column], null, null, null);
      }
      tabela.row(key, "100", null, key.equals("COMMERCIAL") ? "0.75" : "0.60", null, null, null);
    }
    return tabela;
  }

  private static Builder tabela18() {
    return table(NormativeTableCode.T18_SINGLE_PHASE_MOTORS)
        .motor("0.25", "¼", "0.42", "0.66")
        .motor("0.3333", "⅓", "0.51", "0.77")
        .motor("0.5", "½", "0.79", "1.18")
        .motor("0.75", "¾", "0.90", "1.34")
        .motor("1", "1", "1.14", "1.56")
        .motor("1.5", "1½", "1.67", "2.35")
        .motor("2", "2", "2.17", "2.97")
        .motor("3", "3", "3.22", "4.07")
        .motor("5", "5", "5.11", "6.16")
        .motor("7.5", "7½", "7.07", "8.84")
        .motor("10", "10", "9.31", "11.64")
        .motor("12.5", "12½", "11.58", "14.94")
        .motor("15", "15", "13.72", "16.94");
  }

  private static Builder tabela19() {
    return table(NormativeTableCode.T19_THREE_PHASE_MOTORS)
        .motor("0.3333", "⅓", "0.39", "0.65")
        .motor("0.5", "½", "0.58", "0.87")
        .motor("0.75", "¾", "0.83", "1.26")
        .motor("1", "1", "1.05", "1.52")
        .motor("1.5", "1½", "1.54", "2.17")
        .motor("2", "2", "1.95", "2.70")
        .motor("3", "3", "2.95", "4.04")
        .motor("4", "4", "3.72", "5.03")
        .motor("5", "5", "4.51", "6.02")
        .motor("7.5", "7½", "6.57", "8.65")
        .motor("10", "10", "8.89", "11.54")
        .motor("12.5", "12½", "10.85", "14.09")
        .motor("15", "15", "12.82", "16.65")
        .motor("20", "20", "17.01", "22.10")
        .motor("25", "25", "20.92", "25.83")
        .motor("30", "30", "25.03", "30.52")
        .motor("40", "40", "33.38", "39.74")
        .motor("50", "50", "40.93", "48.73")
        .motor("60", "60", "49.42", "58.15")
        .motor("75", "75", "61.44", "72.28")
        .motor("100", "100", "81.23", "95.56")
        .motor("125", "125", "100.67", "117.05")
        .motor("150", "150", "120.09", "141.29")
        .motor("200", "200", "161.65", "190.18");
  }

  private static Builder table(NormativeTableCode code) {
    return new Builder(code);
  }

  private static BigDecimal decimal(String value) {
    return value == null ? null : new BigDecimal(value);
  }

  private static final class Builder {

    private final NormativeTableCode code;
    private final List<NormativeTableRow> rows = new ArrayList<>();

    private Builder(NormativeTableCode code) {
      this.code = code;
    }

    Builder row(
        String key,
        String lower,
        String upper,
        String value,
        String second,
        String third,
        String label) {
      rows.add(
          new NormativeTableRow(
              key,
              decimal(lower),
              decimal(upper),
              decimal(value),
              decimal(second),
              decimal(third),
              label));
      return this;
    }

    Builder range(int lower, int upper, String value) {
      return row(null, String.valueOf(lower), String.valueOf(upper), value, null, null, null);
    }

    Builder count(int count, String value) {
      return range(count, count, value);
    }

    Builder above(int lower, String value) {
      return row(null, String.valueOf(lower), null, value, null, null, null);
    }

    Builder labelled(String lower, String upper, String value, String label) {
      return row(null, lower, upper, value, null, null, label);
    }

    Builder labelledAbove(String lower, String value, String label) {
      return row(null, lower, null, value, null, null, label);
    }

    Builder keyed(String key, String value) {
      return row(key, null, null, value, null, null, null);
    }

    /** Tabelas 1 e 2: the band ceiling is the demand considered; circuits, cable, breaker. */
    Builder entrance(int lower, int upper, int circuits, int cableMm2, int breakerAmps) {
      return row(
          null,
          String.valueOf(lower),
          String.valueOf(upper),
          String.valueOf(circuits),
          String.valueOf(cableMm2),
          String.valueOf(breakerAmps),
          lower + " < De ≤ " + upper);
    }

    Builder motor(String cv, String printed, String kw, String kva) {
      return row(null, cv, cv, kw, kva, null, printed + " cv");
    }

    NormativeTable build(Map<String, Standard> standardsByName) {
      NormativeTable table =
          new NormativeTable(
              standardsByName.get(code.standard().code()),
              code,
              code.identification(),
              code.item(),
              code.page(),
              rows,
              REGISTERED_BY);
      table.publish(VERIFIED_BY);
      return table;
    }
  }
}
