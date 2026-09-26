package br.com.ampere.domain;

import java.math.BigDecimal;
import java.util.List;

/** The nine parcels of the installed load method, DIS-NOR-030 item 6.27. */
public enum LoadCategory {
  LIGHTING_AND_OUTLETS("a", "Iluminação e tomadas") {
    @Override
    List<ValidationIssue> issues(LoadItem item, String path, LoadUsage usage) {
      if (usage == LoadUsage.COMMERCIAL && item.getLampTechnology() == null) {
        return List.of(
            ValidationIssue.missing(
                path + ".lampTechnology",
                "Informe a tecnologia das lâmpadas de \""
                    + item.getDescription()
                    + "\". Ela define o fator de potência da iluminação."));
      }
      return List.of();
    }
  },
  INSTANT_HEATING("b", "Chuveiros, torneiras e aquecedores de passagem"),
  STORAGE_HEATING("c", "Aquecedor central ou de acumulação"),
  APPLIANCES("d", "Secadoras, lava-roupas, lava-louças e micro-ondas"),
  COOKING("e", "Fornos e fogões elétricos"),
  AIR_CONDITIONING("f", "Condicionadores de ar"),
  MOTORS("g", "Motores e máquinas de solda a motor") {
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
  },
  SPECIAL_EQUIPMENT("h", "Equipamentos especiais"),
  PUMPS_AND_HOT_TUBS("i", "Bombas e hidromassagem");

  private static final BigDecimal LARGE_MOTOR_CV = new BigDecimal("5");

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

  List<ValidationIssue> issues(LoadItem item, String path, LoadUsage usage) {
    return List.of();
  }
}
