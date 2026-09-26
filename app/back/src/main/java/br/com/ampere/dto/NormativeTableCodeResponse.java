package br.com.ampere.dto;

import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.NormativeTableKey;
import java.util.Arrays;
import java.util.List;

/** What the admin form needs to show the columns of a table as the printed page does. */
public record NormativeTableCodeResponse(
    NormativeTableCode code,
    String standard,
    String identification,
    String title,
    String item,
    String page,
    List<NormativeTableKey> keys,
    String argumentLabel,
    List<String> valueLabels) {

  public static NormativeTableCodeResponse from(NormativeTableCode code) {
    return new NormativeTableCodeResponse(
        code,
        code.standard().code(),
        code.identification(),
        code.title(),
        code.item(),
        code.page(),
        code.keys(),
        code.argumentLabel(),
        code.valueLabels());
  }

  public static List<NormativeTableCodeResponse> all() {
    return Arrays.stream(NormativeTableCode.values())
        .map(NormativeTableCodeResponse::from)
        .toList();
  }
}
