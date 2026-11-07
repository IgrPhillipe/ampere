package br.com.ampere.dto;

import br.com.ampere.domain.ProjectVersion;
import br.com.ampere.service.ProjectVersionService;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/** The groups included, removed and changed from one version to another, and each one's demand. */
public record VersionComparisonResponse(
    VersionDemand from,
    VersionDemand to,
    BigDecimal demandDifferenceKva,
    List<GroupChangeResponse> included,
    List<GroupChangeResponse> removed,
    List<GroupChangeResponse> changed,
    List<FieldChangeResponse> project) {

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

  public record FieldChangeResponse(String field, String from, String to) {

    static FieldChangeResponse from(ProjectVersionService.FieldChange change) {
      return new FieldChangeResponse(change.field(), change.from(), change.to());
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
        comparison.project().stream().map(FieldChangeResponse::from).toList());
  }
}
