package br.com.ampere.dto;

import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.NormativeTableStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.util.List;

/** A table with its rows, or without them in the listing. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record NormativeTableResponse(
    String id,
    StandardResponse standard,
    NormativeTableCode code,
    String title,
    String identification,
    String item,
    String page,
    NormativeTableStatus status,
    int rowCount,
    String registeredBy,
    OffsetDateTime registeredAt,
    String verifiedBy,
    OffsetDateTime verifiedAt,
    List<NormativeTableRowResponse> rows) {

  public static NormativeTableResponse summary(NormativeTable table) {
    return of(table, null);
  }

  public static NormativeTableResponse from(NormativeTable table) {
    return of(table, table.getRows().stream().map(NormativeTableRowResponse::from).toList());
  }

  private static NormativeTableResponse of(
      NormativeTable table, List<NormativeTableRowResponse> rows) {
    return new NormativeTableResponse(
        String.valueOf(table.getId()),
        StandardResponse.from(table.getStandard()),
        table.getCode(),
        table.getCode().title(),
        table.getIdentification(),
        table.getItem(),
        table.getPage(),
        table.getStatus(),
        table.getRows().size(),
        table.getRegisteredBy(),
        table.getRegisteredAt(),
        table.getVerifiedBy(),
        table.getVerifiedAt(),
        rows);
  }
}
