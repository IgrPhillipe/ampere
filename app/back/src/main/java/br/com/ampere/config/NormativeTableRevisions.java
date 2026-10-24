package br.com.ampere.config;

import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.NormativeTableRow;
import br.com.ampere.domain.NormativeTableStatus;
import br.com.ampere.repository.NormativeTableRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Objects;
import java.util.function.UnaryOperator;

/**
 * Revisions of the tables the seed itself published: an older one already replaced and one waiting
 * for the verifier, each with rows that really differ. A table typed by anyone else is never
 * copied.
 */
final class NormativeTableRevisions {

  private record Plan(
      NormativeTableCode code,
      NormativeTableStatus status,
      String registeredBy,
      UnaryOperator<NormativeTableRow> change) {}

  private static final List<Plan> PLANS =
      List.of(
          // The Quadro 35 first bands were lower in the revision that came before.
          new Plan(
              NormativeTableCode.Q35_APARTMENT_DEMAND,
              NormativeTableStatus.SUPERSEDED,
              NormativeTableSeed.REGISTERED_BY,
              row ->
                  switch (Objects.toString(row.getLabel(), "")) {
                    case "41 a 45" -> withValue(row, "1.02");
                    case "46 a 50" -> withValue(row, "1.12");
                    case "51 a 55" -> withValue(row, "1.22");
                    default -> row;
                  }),
          new Plan(
              NormativeTableCode.T22_GENERAL_LIGHTING_OUTLETS,
              NormativeTableStatus.SUPERSEDED,
              NormativeTableSeed.REGISTERED_BY,
              row -> "STORES".equals(row.getRowKey()) ? withValue(row, "0.90") : row),
          new Plan(
              NormativeTableCode.Q37_SAFETY_FACTOR,
              NormativeTableStatus.DRAFT,
              NormativeTableSeed.REGISTERED_BY,
              row ->
                  switch (Objects.toString(row.getLabel(), "")) {
                    case "Dr ≤ 25 kVA" -> withValue(row, "1.4");
                    case "25 < Dr ≤ 50 kVA" -> withValue(row, "1.25");
                    default -> row;
                  }),
          // Typed by the verifier, so the other administrator is the one who can publish it.
          new Plan(
              NormativeTableCode.T2_SERVICE_ENTRANCE_380_220,
              NormativeTableStatus.DRAFT,
              NormativeTableSeed.VERIFIED_BY,
              row ->
                  "53 < De ≤ 66".equals(row.getLabel())
                      ? new NormativeTableRow(
                          row.getRowKey(),
                          row.getLowerBound(),
                          row.getUpperBound(),
                          row.getPrimaryValue(),
                          new BigDecimal("50"),
                          new BigDecimal("125"),
                          row.getLabel())
                      : row));

  private final NormativeTableRepository repository;
  private final SeedTimestamps timestamps;

  NormativeTableRevisions(NormativeTableRepository repository, SeedTimestamps timestamps) {
    this.repository = repository;
    this.timestamps = timestamps;
  }

  /** Per table, only once and only where the published revision is the seed's own. */
  int seed() {
    List<NormativeTable> tables = repository.findListingBy();
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    int created = 0;
    for (Plan plan : PLANS) {
      boolean hasRevision =
          tables.stream()
              .anyMatch(
                  table ->
                      table.getCode() == plan.code()
                          && table.getStatus() != NormativeTableStatus.PUBLISHED);
      NormativeTable current =
          tables.stream()
              .filter(table -> table.getCode() == plan.code())
              .filter(table -> table.getStatus() == NormativeTableStatus.PUBLISHED)
              .filter(NormativeTableRevisions::isSeeded)
              .findFirst()
              .orElse(null);
      if (hasRevision || current == null) {
        continue;
      }
      revise(current, plan, now);
      created++;
    }

    return created;
  }

  private void revise(NormativeTable current, Plan plan, OffsetDateTime now) {
    NormativeTable revision =
        new NormativeTable(
            current.getStandard(),
            current.getCode(),
            current.getIdentification(),
            current.getItem(),
            current.getPage(),
            current.getRows().stream().map(plan.change()).toList(),
            plan.registeredBy());
    if (plan.status() == NormativeTableStatus.SUPERSEDED) {
      revision.publish(NormativeTableSeed.VERIFIED_BY);
      revision.supersede();
      repository.save(revision);
      OffsetDateTime registeredAt = current.getRegisteredAt().minusDays(120);
      timestamps.table(revision.getId(), registeredAt, registeredAt.plusDays(10));
    } else {
      repository.save(revision);
      timestamps.table(revision.getId(), now.minusDays(3), null);
    }
  }

  private static boolean isSeeded(NormativeTable table) {
    return NormativeTableSeed.REGISTERED_BY.equals(table.getRegisteredBy())
        && NormativeTableSeed.VERIFIED_BY.equals(table.getVerifiedBy());
  }

  private static NormativeTableRow withValue(NormativeTableRow row, String value) {
    return new NormativeTableRow(
        row.getRowKey(),
        row.getLowerBound(),
        row.getUpperBound(),
        new BigDecimal(value),
        row.getSecondaryValue(),
        row.getTertiaryValue(),
        row.getLabel());
  }
}
