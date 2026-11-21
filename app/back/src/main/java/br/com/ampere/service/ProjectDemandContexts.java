package br.com.ampere.service;

import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.DemandContext;
import br.com.ampere.domain.FixedRevisions;
import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.NormativeTableSet;
import br.com.ampere.domain.NormativeTableStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.ProjectVersionRepository;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** The tables and building data a project's groups and calculation read, at its revisions. */
@Service
public class ProjectDemandContexts {

  static final String TABLE_IDS = "normativeTableIds";

  private static final int FIRST_VERSION = 1;

  private final NormativeTableRepository tableRepository;
  private final ProjectVersionRepository versionRepository;
  private final ObjectMapper objectMapper;

  public ProjectDemandContexts(
      NormativeTableRepository tableRepository,
      ProjectVersionRepository versionRepository,
      ObjectMapper objectMapper) {
    this.tableRepository = tableRepository;
    this.versionRepository = versionRepository;
    this.objectMapper = objectMapper;
  }

  @Transactional(readOnly = true)
  public DemandContext contextFor(Project project) {
    return contextFor(project, tablesFor(project));
  }

  /** For a caller that already loaded the published tables once for many drafts. */
  public static DemandContext contextFor(Project project, NormativeTableSet tables) {
    BuildingType building = project.getBuildingType();
    return new DemandContext(tables, building.getVoltage(), building.getConnectionType());
  }

  @Transactional(readOnly = true)
  public NormativeTableSet tablesFor(Project project) {
    FixedRevisions fixed = fixedRevisions(project);
    return fixed == null
        ? new NormativeTableSet(tableRepository.findAllByStatus(NormativeTableStatus.PUBLISHED))
        : new NormativeTableSet(tableRepository.findListingBy(), fixed);
  }

  /** Null before the first submission; afterwards, what the run of the first version used. */
  @Transactional(readOnly = true)
  public FixedRevisions fixedRevisions(Project project) {
    if (project.getSubmittedAt() == null) {
      return null;
    }
    return versionRepository
        .findByProjectIdAndNumber(project.getId(), FIRST_VERSION)
        .map(
            first -> new FixedRevisions(first.getSubmittedAt(), tableIdsOf(first.getCalculation())))
        // The first submission issues its memorial before its version is saved.
        .orElseGet(() -> new FixedRevisions(project.getSubmittedAt(), Map.of()));
  }

  @Transactional(readOnly = true)
  public List<NormativeTable> publishedTables() {
    return tableRepository.findAllByStatus(NormativeTableStatus.PUBLISHED);
  }

  private Map<NormativeTableCode, Long> tableIdsOf(Calculation calculation) {
    JsonNode ids = objectMapper.readTree(calculation.getInputSnapshot()).get(TABLE_IDS);
    Map<NormativeTableCode, Long> tableIds = new EnumMap<>(NormativeTableCode.class);
    if (ids != null) {
      ids.properties()
          .forEach(
              entry ->
                  tableIds.put(
                      NormativeTableCode.valueOf(entry.getKey()), entry.getValue().asLong()));
    }
    return tableIds;
  }
}
