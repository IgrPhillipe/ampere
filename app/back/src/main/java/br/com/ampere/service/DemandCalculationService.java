package br.com.ampere.service;

import br.com.ampere.domain.AppliedTable;
import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.DemandContext;
import br.com.ampere.domain.DemandEngine;
import br.com.ampere.domain.DemandResult;
import br.com.ampere.domain.FixedRevisions;
import br.com.ampere.domain.MissingNormativeValueException;
import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.NormativeTableSet;
import br.com.ampere.domain.NormativeTableStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.ProjectVersionRepository;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.StreamSupport;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

@Service
public class DemandCalculationService {

  private static final String TABLE_IDS = "normativeTableIds";

  private static final int FIRST_VERSION = 1;

  private final ProjectService projectService;
  private final ConsumerUnitGroupRepository groupRepository;
  private final NormativeTableRepository tableRepository;
  private final CalculationRepository calculationRepository;
  private final ProjectVersionRepository versionRepository;
  private final ProjectEventService eventService;
  private final ObjectMapper objectMapper;

  public DemandCalculationService(
      ProjectService projectService,
      ConsumerUnitGroupRepository groupRepository,
      NormativeTableRepository tableRepository,
      CalculationRepository calculationRepository,
      ProjectVersionRepository versionRepository,
      ProjectEventService eventService,
      ObjectMapper objectMapper) {
    this.projectService = projectService;
    this.groupRepository = groupRepository;
    this.tableRepository = tableRepository;
    this.calculationRepository = calculationRepository;
    this.versionRepository = versionRepository;
    this.eventService = eventService;
    this.objectMapper = objectMapper;
  }

  /** The run the designer asks for, recorded in the protocol history as its latest activity. */
  @Transactional
  public Calculation calculateAndRecord(Long projectId, AuthenticatedUser user) {
    Calculation calculation = calculate(projectId, user);
    eventService.calculated(calculation.getProject(), calculation);

    return calculation;
  }

  /** Every run is kept: a later one does not overwrite what an earlier one showed. */
  @Transactional
  public Calculation calculate(Long projectId, AuthenticatedUser user) {
    Project project = projectService.findWritableById(projectId, user);
    // A project awaiting submission keeps its data but takes the revisions in force.
    if (!project.canBeSubmitted()) {
      throw new BusinessException(
          "Só é possível calcular a demanda de um projeto em rascunho, aguardando envio ou"
              + " reprovado.",
          HttpStatus.CONFLICT);
    }
    List<ConsumerUnitGroup> groups = groupRepository.findAllByProjectIdOrderById(projectId);
    if (groups.isEmpty()) {
      throw unprocessable("Cadastre ao menos um grupo de unidades antes de calcular a demanda.");
    }
    if (!GroupValidation.of(groups).canCalculate()) {
      throw unprocessable("Há grupos com pendências. Corrija-os antes de calcular a demanda.");
    }
    project.touch();

    return calculationRepository.save(compute(project, groups));
  }

  /** The engine run alone, unsaved: the seed reuses it for projects already submitted. */
  public Calculation compute(Project project, List<ConsumerUnitGroup> groups) {
    BuildingType building = project.getBuildingType();
    NormativeTableSet tables = tablesFor(project);
    DemandContext context =
        new DemandContext(tables, building.getVoltage(), building.getConnectionType());
    DemandResult result;
    try {
      result = DemandEngine.run(groups, context);
    } catch (MissingNormativeValueException missing) {
      throw unprocessable(missing.getMessage());
    }

    Map<String, Object> input = input(project, groups);
    Map<String, Long> tableIds = new LinkedHashMap<>();
    result
        .appliedTables()
        .forEach(
            reference ->
                tables
                    .idOf(reference.code())
                    .ifPresent(id -> tableIds.put(reference.code().name(), id)));
    input.put(TABLE_IDS, tableIds);
    return new Calculation(project, result, objectMapper.writeValueAsString(input));
  }

  private NormativeTableSet tablesFor(Project project) {
    FixedRevisions fixed = fixedRevisions(project);
    return fixed == null
        ? new NormativeTableSet(tableRepository.findAllByStatus(NormativeTableStatus.PUBLISHED))
        : new NormativeTableSet(tableRepository.findListingBy(), fixed);
  }

  /** Null before the first submission; afterwards, what the run of the first version used. */
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

  /** The date the protocol's revisions are fixed at; null before the first submission. */
  @Transactional(readOnly = true)
  public OffsetDateTime revisionsFixedAt(Project project) {
    FixedRevisions fixed = fixedRevisions(project);
    return fixed == null ? null : fixed.fixedAt();
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

  /** Read once by a caller that checks many drafts. */
  @Transactional(readOnly = true)
  public List<NormativeTable> publishedTables() {
    return tableRepository.findAllByStatus(NormativeTableStatus.PUBLISHED);
  }

  /** The tables replaced since a draft's run; a submitted protocol keeps its revisions. */
  @Transactional(readOnly = true)
  public List<String> changedTables(Calculation calculation) {
    return calculation.getProject().getSubmittedAt() == null
        ? changedTables(calculation, publishedTables())
        : List.of();
  }

  private List<String> changedTables(Calculation calculation, List<NormativeTable> current) {
    if (calculation.getProject().getSubmittedAt() != null) {
      return List.of();
    }
    JsonNode ids = objectMapper.readTree(calculation.getInputSnapshot()).get(TABLE_IDS);
    if (ids != null) {
      return StreamSupport.stream(ids.properties().spliterator(), false)
          .filter(
              entry ->
                  current.stream()
                      .noneMatch(
                          table ->
                              table.getCode().name().equals(entry.getKey())
                                  && table.getId().longValue() == entry.getValue().asLong()))
          .map(entry -> NormativeTableCode.valueOf(entry.getKey()).identification())
          .toList();
    }
    // Older runs lack table IDs, so their references and publication dates are compared.
    return calculation.getAppliedTables().stream()
        .filter(
            applied ->
                current.stream()
                    .noneMatch(
                        table ->
                            table.getIdentification().equals(applied.getIdentification())
                                && table.getStandard().getName().equals(applied.getStandard())
                                && table.getStandard().getRevision().equals(applied.getRevision())
                                && !table.getVerifiedAt().isAfter(calculation.getCalculatedAt())))
        .map(AppliedTable::getIdentification)
        .distinct()
        .toList();
  }

  public boolean isCurrent(Calculation calculation) {
    return sameInput(
            calculation,
            groupRepository.findAllByProjectIdOrderById(calculation.getProject().getId()))
        && changedTables(calculation).isEmpty();
  }

  /** For a caller that already loaded the project's groups. */
  public boolean isCurrent(Calculation calculation, List<ConsumerUnitGroup> groups) {
    return sameInput(calculation, groups) && changedTables(calculation).isEmpty();
  }

  /** For a caller that also loaded the published tables once for many projects. */
  public boolean isCurrent(
      Calculation calculation, List<ConsumerUnitGroup> groups, List<NormativeTable> published) {
    return sameInput(calculation, groups) && changedTables(calculation, published).isEmpty();
  }

  /** Compared as JSON trees: key order varies across runs, and 60 and 60.00 are one value. */
  private boolean sameInput(Calculation calculation, List<ConsumerUnitGroup> groups) {
    ObjectNode recorded = (ObjectNode) objectMapper.readTree(calculation.getInputSnapshot());
    recorded.remove(TABLE_IDS);
    return recorded.equals(
        SAME_VALUE, objectMapper.valueToTree(input(calculation.getProject(), groups)));
  }

  private static final Comparator<JsonNode> SAME_VALUE =
      (left, right) ->
          left.isNumber() && right.isNumber()
              ? left.decimalValue().compareTo(right.decimalValue())
              : left.equals(right) ? 0 : 1;

  public record Latest(
      Calculation calculation,
      boolean outdated,
      List<String> changedTables,
      OffsetDateTime revisionsFixedAt) {}

  /** The last run, flagged when a project not yet under review changed after it. */
  @Transactional(readOnly = true)
  public Latest latest(Long projectId, AuthenticatedUser user) {
    Project project = projectService.findById(projectId, user);
    Calculation calculation =
        calculationRepository
            .findFirstByProjectIdOrderByIdDesc(projectId)
            .orElseThrow(
                () ->
                    new NotFoundException(
                        "Nenhum cálculo de demanda foi feito para este projeto."));

    if (!project.canBeSubmitted()) {
      return new Latest(calculation, false, List.of(), revisionsFixedAt(project));
    }
    List<String> changed = changedTables(calculation);
    boolean outdated =
        !changed.isEmpty()
            || !sameInput(calculation, groupRepository.findAllByProjectIdOrderById(projectId));

    return new Latest(calculation, outdated, changed, revisionsFixedAt(project));
  }

  private Map<String, Object> input(Project project, List<ConsumerUnitGroup> groups) {
    BuildingType building = project.getBuildingType();
    Map<String, Object> input = new LinkedHashMap<>();
    input.put("buildingType", building.category());
    input.put("floors", building.getFloors());
    input.put("voltage", building.getVoltage());
    input.put("connectionType", building.getConnectionType());
    input.put("entranceStandard", building.getEntranceStandard());
    input.put(
        "groups",
        groups.stream()
            .map(group -> Map.of("id", group.getId(), "kind", group.kind(), "spec", group.spec()))
            .toList());

    return input;
  }

  private static BusinessException unprocessable(String message) {
    return new BusinessException(message, HttpStatus.UNPROCESSABLE_CONTENT);
  }
}
