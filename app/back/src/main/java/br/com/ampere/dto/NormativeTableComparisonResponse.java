package br.com.ampere.dto;

import br.com.ampere.domain.NormativeTableComparison;
import br.com.ampere.service.PersonNames;
import java.util.List;

/** The rows that entered, left or changed value between two revisions, from the older one. */
public record NormativeTableComparisonResponse(
    NormativeTableResponse from,
    NormativeTableResponse to,
    List<NormativeTableRowResponse> included,
    List<NormativeTableRowResponse> removed,
    List<RowChangeResponse> changed) {

  public record RowChangeResponse(
      NormativeTableRowResponse before, NormativeTableRowResponse after) {

    static RowChangeResponse from(NormativeTableComparison.RowChange change) {
      return new RowChangeResponse(
          NormativeTableRowResponse.from(change.before()),
          NormativeTableRowResponse.from(change.after()));
    }
  }

  public static NormativeTableComparisonResponse from(
      NormativeTableComparison comparison, PersonNames names) {
    return new NormativeTableComparisonResponse(
        NormativeTableResponse.summary(comparison.from(), names),
        NormativeTableResponse.summary(comparison.to(), names),
        comparison.included().stream().map(NormativeTableRowResponse::from).toList(),
        comparison.removed().stream().map(NormativeTableRowResponse::from).toList(),
        comparison.changed().stream().map(RowChangeResponse::from).toList());
  }
}
