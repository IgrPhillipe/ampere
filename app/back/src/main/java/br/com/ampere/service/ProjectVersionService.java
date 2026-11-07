package br.com.ampere.service;

import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectDocument;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ProjectVersion;
import br.com.ampere.domain.ProjectVersionDocument;
import br.com.ampere.domain.ProjectVersionMemorial;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.ProjectDocumentRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.ProjectVersionDocumentRepository;
import br.com.ampere.repository.ProjectVersionRepository;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

@Service
public class ProjectVersionService {

  private static final String NOT_FOUND = "Versão não encontrada.";

  private static final String DOCUMENT_NOT_FOUND = "Documento não encontrado nesta versão.";

  // Locked since the submission, so they still hold the data that was sent.
  private static final List<ProjectStatus> FROZEN =
      List.of(ProjectStatus.UNDER_REVIEW, ProjectStatus.APPROVED);

  private final ProjectService projectService;
  private final MemorialPdfService memorialPdfService;
  private final ProjectVersionRepository versionRepository;
  private final ProjectVersionDocumentRepository versionDocumentRepository;
  private final ProjectDocumentRepository documentRepository;
  private final ConsumerUnitGroupRepository groupRepository;
  private final CalculationRepository calculationRepository;
  private final ProjectRepository projectRepository;
  private final ObjectMapper objectMapper;

  public ProjectVersionService(
      ProjectService projectService,
      MemorialPdfService memorialPdfService,
      ProjectVersionRepository versionRepository,
      ProjectVersionDocumentRepository versionDocumentRepository,
      ProjectDocumentRepository documentRepository,
      ConsumerUnitGroupRepository groupRepository,
      CalculationRepository calculationRepository,
      ProjectRepository projectRepository,
      ObjectMapper objectMapper) {
    this.projectService = projectService;
    this.memorialPdfService = memorialPdfService;
    this.versionRepository = versionRepository;
    this.versionDocumentRepository = versionDocumentRepository;
    this.documentRepository = documentRepository;
    this.groupRepository = groupRepository;
    this.calculationRepository = calculationRepository;
    this.projectRepository = projectRepository;
    this.objectMapper = objectMapper;
  }

  public record Entry(ProjectVersion version, List<DocumentSummary> documents) {}

  public record DocumentSummary(DocumentType type, String filename, Long fileSize) {}

  public record Comparison(
      ProjectVersion from,
      ProjectVersion to,
      List<GroupChange> included,
      List<GroupChange> removed,
      List<GroupChange> changed,
      List<FieldChange> building) {}

  public record GroupChange(Long id, String name, List<FieldChange> fields) {}

  public record FieldChange(
      String field, String label, String from, String to, String fromLabel, String toLabel) {}

  /** Runs inside the submission: the memorial is rendered here and never again. */
  public ProjectVersion register(
      Project project, Calculation calculation, OffsetDateTime submittedAt) {
    int number = project.getReviewCycle();
    List<ConsumerUnitGroup> groups = groupRepository.findAllByProjectIdOrderById(project.getId());
    MemorialPdfService.Issued issued =
        memorialPdfService.issue(project, calculation, groups, number, submittedAt);

    ProjectVersion version =
        versionRepository.save(
            new ProjectVersion(
                project,
                number,
                submittedAt,
                project.getOwner(),
                number > 1 ? project.getChangeSummary() : null,
                calculation,
                new ProjectVersionMemorial(issued.filename(), issued.content()),
                issued.sha256(),
                issued.verificationCode()));
    for (ProjectDocument document :
        documentRepository.findAllByProjectIdOrderByType(project.getId())) {
      versionDocumentRepository.save(new ProjectVersionDocument(version, document));
    }

    return version;
  }

  @Transactional(readOnly = true)
  public List<Long> projectsMissingVersion() {
    return versionRepository.findProjectIdsWithoutVersion(FROZEN);
  }

  @Transactional
  public void backfill(Long projectId) {
    Project project = projectRepository.findDetailById(projectId).orElseThrow();
    calculationRepository
        .findFirstByProjectIdOrderByIdDesc(projectId)
        .ifPresent(calculation -> register(project, calculation, project.getSubmittedAt()));
  }

  @Transactional(readOnly = true)
  public List<Entry> list(Long projectId, AuthenticatedUser user) {
    projectService.findById(projectId, user);
    List<ProjectVersion> versions = versionRepository.findAllByProjectId(projectId);
    if (versions.isEmpty()) {
      return List.of();
    }

    Map<Long, List<DocumentSummary>> documents = new LinkedHashMap<>();
    versionDocumentRepository
        .findSummaries(versions.stream().map(ProjectVersion::getId).toList())
        .forEach(
            document ->
                documents
                    .computeIfAbsent(document.getVersionId(), id -> new ArrayList<>())
                    .add(
                        new DocumentSummary(
                            document.getType(), document.getFilename(), document.getFileSize())));

    return versions.stream()
        .map(version -> new Entry(version, documents.getOrDefault(version.getId(), List.of())))
        .toList();
  }

  @Transactional(readOnly = true)
  public MemorialPdfService.Memorial memorial(Long projectId, int number, AuthenticatedUser user) {
    projectService.findById(projectId, user);

    return MemorialPdfService.storedMemorial(find(projectId, number));
  }

  @Transactional(readOnly = true)
  public ProjectVersionDocument document(
      Long projectId, int number, DocumentType type, AuthenticatedUser user) {
    projectService.findById(projectId, user);

    return versionDocumentRepository
        .findByVersionProjectIdAndVersionNumberAndType(projectId, number, type)
        .orElseThrow(() -> new NotFoundException(DOCUMENT_NOT_FOUND));
  }

  @Transactional(readOnly = true)
  public Comparison compare(Long projectId, int from, int to, AuthenticatedUser user) {
    projectService.findById(projectId, user);
    if (from > to) {
      throw new BusinessException("A versão de origem não pode ser posterior à de destino.");
    }
    ProjectVersion older = find(projectId, from);
    ProjectVersion newer = find(projectId, to);

    JsonNode before = objectMapper.readTree(older.getCalculation().getInputSnapshot());
    JsonNode after = objectMapper.readTree(newer.getCalculation().getInputSnapshot());
    Map<Long, JsonNode> beforeGroups = groupsOf(before);
    Map<Long, JsonNode> afterGroups = groupsOf(after);

    List<GroupChange> included = new ArrayList<>();
    List<GroupChange> changed = new ArrayList<>();
    afterGroups.forEach(
        (id, group) -> {
          JsonNode previous = beforeGroups.get(id);
          if (previous == null) {
            included.add(new GroupChange(id, nameOf(group), List.of()));
            return;
          }
          List<FieldChange> fields = differences(specOf(previous), specOf(group));
          if (!kindOf(previous).equals(kindOf(group))) {
            fields.add(0, fieldChange("kind", kindOf(previous), kindOf(group)));
          }
          if (!fields.isEmpty()) {
            changed.add(new GroupChange(id, nameOf(group), fields));
          }
        });
    List<GroupChange> removed = new ArrayList<>();
    beforeGroups.forEach(
        (id, group) -> {
          if (!afterGroups.containsKey(id)) {
            removed.add(new GroupChange(id, nameOf(group), List.of()));
          }
        });

    return new Comparison(
        older,
        newer,
        included,
        removed,
        changed,
        differences(withoutGroups(before), withoutGroups(after)));
  }

  private ProjectVersion find(Long projectId, int number) {
    return versionRepository
        .findByProjectIdAndNumber(projectId, number)
        .orElseThrow(() -> new NotFoundException(NOT_FOUND));
  }

  private static Map<Long, JsonNode> groupsOf(JsonNode snapshot) {
    Map<Long, JsonNode> groups = new LinkedHashMap<>();
    for (JsonNode group : snapshot.path("groups")) {
      groups.put(group.path("id").asLong(), group);
    }

    return groups;
  }

  private static JsonNode specOf(JsonNode group) {
    return group.path("spec");
  }

  private static String kindOf(JsonNode group) {
    return group.path("kind").asString("");
  }

  private static String nameOf(JsonNode group) {
    return specOf(group).path("name").asString("");
  }

  private static JsonNode withoutGroups(JsonNode snapshot) {
    ObjectNode copy = ((ObjectNode) snapshot).deepCopy();
    copy.remove("groups");

    return copy;
  }

  private static List<FieldChange> differences(JsonNode before, JsonNode after) {
    Map<String, JsonNode> previous = leaves(before);
    Map<String, JsonNode> current = leaves(after);
    Set<String> fields = new LinkedHashSet<>(previous.keySet());
    fields.addAll(current.keySet());

    List<FieldChange> changes = new ArrayList<>();
    for (String field : fields) {
      JsonNode left = previous.get(field);
      JsonNode right = current.get(field);
      if (!sameValue(left, right)) {
        changes.add(fieldChange(field, display(left), display(right)));
      }
    }

    return changes;
  }

  private static FieldChange fieldChange(String field, String from, String to) {
    return new FieldChange(
        field,
        VersionFieldLabels.of(field),
        from,
        to,
        VersionFieldLabels.ofValue(field, from),
        VersionFieldLabels.ofValue(field, to));
  }

  /** Flattens objects and lists into paths such as items[MOTORS:Elevador].quantity. */
  private static Map<String, JsonNode> leaves(JsonNode node) {
    Map<String, JsonNode> leaves = new LinkedHashMap<>();
    collect("", node, leaves);

    return leaves;
  }

  private static void collect(String path, JsonNode node, Map<String, JsonNode> leaves) {
    if (node.isObject()) {
      node.properties()
          .forEach(
              property ->
                  collect(
                      path.isEmpty() ? property.getKey() : path + "." + property.getKey(),
                      property.getValue(),
                      leaves));
    } else if (node.isArray()) {
      Map<String, Integer> occurrences = new HashMap<>();
      for (JsonNode item : node) {
        String key = itemKey(item);
        int occurrence = occurrences.merge(key, 1, Integer::sum);
        String id = occurrence == 1 ? key : key + "#" + occurrence;
        collect(path + "[" + id + "]", item, leaves);
      }
    } else if (!node.isNull() && !node.isMissingNode()) {
      leaves.put(path, node);
    }
  }

  // Items have no id of their own, and the position shifts when one is removed.
  private static String itemKey(JsonNode item) {
    return item.path("category").asString("") + ":" + item.path("description").asString("");
  }

  private static boolean sameValue(JsonNode left, JsonNode right) {
    if (left == null || right == null) {
      return left == right;
    }
    if (left.isNumber() && right.isNumber()) {
      return left.decimalValue().compareTo(right.decimalValue()) == 0;
    }

    return left.equals(right);
  }

  private static String display(JsonNode value) {
    if (value == null) {
      return null;
    }

    return value.isString() ? value.asString() : value.toString();
  }
}
