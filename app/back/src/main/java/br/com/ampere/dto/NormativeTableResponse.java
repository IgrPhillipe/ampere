package br.com.ampere.dto;

import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.NormativeTableStatus;
import br.com.ampere.service.NormativeTableListing;
import br.com.ampere.service.PersonNames;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import java.util.List;

/** A table with its rows, or without them in the listing. The e-mails come with the names. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record NormativeTableResponse(
    String id,
    StandardResponse standard,
    NormativeTableCode code,
    String title,
    String identification,
    String item,
    String page,
    long version,
    NormativeTableStatus status,
    int rowCount,
    String registeredBy,
    String registeredByName,
    OffsetDateTime registeredAt,
    String verifiedBy,
    String verifiedByName,
    OffsetDateTime verifiedAt,
    OffsetDateTime supersededAt,
    @Schema(description = "Revisões do código; só na listagem") Integer revisionCount,
    @Schema(description = "Revisão aguardando aprovação atrás da vigente; só na listagem")
        NormativeTableResponse pendingRevision,
    List<NormativeTableRowResponse> rows) {

  public static NormativeTableResponse summary(NormativeTable table, PersonNames names) {
    return of(table, names, null, null, null);
  }

  public static NormativeTableResponse listing(NormativeTableListing listing, PersonNames names) {
    return of(
        listing.table(),
        names,
        listing.revisionCount(),
        listing.pendingRevision() == null ? null : summary(listing.pendingRevision(), names),
        null);
  }

  public static NormativeTableResponse from(NormativeTable table, PersonNames names) {
    return of(
        table,
        names,
        null,
        null,
        table.getRows().stream().map(NormativeTableRowResponse::from).toList());
  }

  private static NormativeTableResponse of(
      NormativeTable table,
      PersonNames names,
      Integer revisionCount,
      NormativeTableResponse pendingRevision,
      List<NormativeTableRowResponse> rows) {
    return new NormativeTableResponse(
        String.valueOf(table.getId()),
        StandardResponse.from(table.getStandard()),
        table.getCode(),
        table.getCode().title(),
        table.getIdentification(),
        table.getItem(),
        table.getPage(),
        table.getVersion(),
        table.getStatus(),
        table.getRows().size(),
        table.getRegisteredBy(),
        names.of(table.getRegisteredBy()),
        table.getRegisteredAt(),
        table.getVerifiedBy(),
        names.of(table.getVerifiedBy()),
        table.getVerifiedAt(),
        table.getSupersededAt(),
        revisionCount,
        pendingRevision,
        rows);
  }
}
