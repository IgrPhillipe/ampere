package br.com.ampere.domain;

import java.math.BigDecimal;
import java.util.List;

/** One line of the calculation memory: its formula, value and where the rule comes from. */
public record DemandStep(
    String code,
    String title,
    boolean applies,
    String formula,
    List<String> details,
    BigDecimal valueKva,
    NormativeReference reference,
    List<NormativeReference> references,
    ResidentialTrace residential) {

  static DemandStep notApplicable(DemandComponent component) {
    return new DemandStep(
        component.symbol(),
        component.title(),
        false,
        "Não se aplica: nenhum grupo deste tipo no projeto",
        List.of(),
        BigDecimal.ZERO.setScale(2),
        null,
        List.of(),
        null);
  }
}
