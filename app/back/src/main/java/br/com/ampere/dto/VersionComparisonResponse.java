package br.com.ampere.dto;

import br.com.ampere.domain.ProjectVersion;
import br.com.ampere.service.ProjectVersionService;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record VersionComparisonResponse(
    VersionDemand from,
    VersionDemand to,
    BigDecimal demandDifferenceKva,
    List<GroupChangeResponse> included,
    List<GroupChangeResponse> removed,
    List<GroupChangeResponse> changed,
    List<FieldChangeResponse> building) {

  public record VersionDemand(int number, OffsetDateTime submittedAt, BigDecimal demandKva) {

    static VersionDemand of(ProjectVersion version) {
      return new VersionDemand(
          version.getNumber(),
          version.getSubmittedAt(),
          version.getCalculation().getFinalTotalDemand());
    }
  }

  public record GroupChangeResponse(String id, String name, List<FieldChangeResponse> fields) {

    static GroupChangeResponse from(ProjectVersionService.GroupChange change) {
      return new GroupChangeResponse(
          String.valueOf(change.id()),
          change.name(),
          change.fields().stream().map(FieldChangeResponse::from).toList());
    }
  }

  public record FieldChangeResponse(
      String field, String label, String from, String to, String fromLabel, String toLabel) {

    static FieldChangeResponse from(ProjectVersionService.FieldChange change) {
      return new FieldChangeResponse(
          change.field(),
          change.label(),
          change.from(),
          change.to(),
          change.fromLabel(),
          change.toLabel());
    }
  }

  public static VersionComparisonResponse from(ProjectVersionService.Comparison comparison) {
    VersionDemand from = VersionDemand.of(comparison.from());
    VersionDemand to = VersionDemand.of(comparison.to());

    return new VersionComparisonResponse(
        from,
        to,
        to.demandKva().subtract(from.demandKva()),
        comparison.included().stream().map(GroupChangeResponse::from).toList(),
        comparison.removed().stream().map(GroupChangeResponse::from).toList(),
        comparison.changed().stream().map(GroupChangeResponse::from).toList(),
        comparison.building().stream().map(FieldChangeResponse::from).toList());
  }
}
