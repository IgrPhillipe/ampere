package br.com.ampere.config;

import br.com.ampere.config.ScenarioGroups.GroupDraft;
import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingAnswer;
import br.com.ampere.domain.FindingResolution;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.GroupSpec;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectDocument;
import br.com.ampere.domain.User;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * One scenario project being told. Every event takes the day it happened, counted back from the
 * seeding moment, and the case refuses a story that goes backwards in time. Events of the same day
 * keep the order they were told in: each kind happens a fixed span before the end of its day.
 */
final class ScenarioCase {

  // Minutes before the instant of the day, so events of one day fall in their natural order.
  private static final int CREATION = 360;
  private static final int DOCUMENTS = 300;
  private static final int CALCULATION = 240;
  private static final int FINDINGS = 180;
  private static final int RESPONSE = 120;
  private static final int EDIT = 90;

  /** A finding as the analyst writes it, before it belongs to a review. */
  record FindingSpec(
      FindingSeverity severity,
      FindingStage stage,
      ConsumerUnitGroup group,
      String calculationStepCode,
      DocumentType documentType,
      String description,
      String standardItem) {

    static FindingSpec projectData(FindingSeverity severity, String description) {
      return new FindingSpec(
          severity, FindingStage.PROJECT_DATA, null, null, null, description, null);
    }

    static FindingSpec units(
        FindingSeverity severity,
        ConsumerUnitGroup group,
        String description,
        String standardItem) {
      return new FindingSpec(
          severity, FindingStage.CONSUMER_UNITS, group, null, null, description, standardItem);
    }

    static FindingSpec calculation(
        FindingSeverity severity, String stepCode, String description, String standardItem) {
      return new FindingSpec(
          severity, FindingStage.CALCULATION, null, stepCode, null, description, standardItem);
    }

    static FindingSpec document(FindingSeverity severity, DocumentType type, String description) {
      return new FindingSpec(severity, FindingStage.DOCUMENTS, null, null, type, description, null);
    }
  }

  private final ScenarioKit kit;
  private final Project project;
  private final OffsetDateTime createdAt;
  private final List<Runnable> stamps = new ArrayList<>();
  private OffsetDateTime cursor;

  ScenarioCase(ScenarioKit kit, Project project, int createdDaysAgo) {
    this.kit = kit;
    this.project = project;
    this.cursor = kit.now.minusYears(20);
    this.createdAt = advance(createdDaysAgo, CREATION);
  }

  Project project() {
    return project;
  }

  ConsumerUnitGroup add(GroupDraft draft) {
    return addAll(draft).getFirst();
  }

  List<ConsumerUnitGroup> addAll(GroupDraft... drafts) {
    return kit.groups.saveAll(
        Arrays.stream(drafts).map(draft -> draft.kind().create(project, draft.spec())).toList());
  }

  ScenarioCase calculate(int daysAgo) {
    OffsetDateTime at = advance(daysAgo, CALCULATION);
    Calculation calculation =
        kit.calculations.save(
            kit.demand.compute(project, kit.groups.findAllByProjectIdOrderById(project.getId())));
    stamps.add(() -> kit.timestamps.calculation(calculation.getId(), at));

    return this;
  }

  /** The three PDFs, or only the types given. */
  ScenarioCase documents(int daysAgo, DocumentType... types) {
    OffsetDateTime at = advance(daysAgo, DOCUMENTS);
    List<DocumentType> chosen =
        types.length == 0 ? Arrays.asList(DocumentType.values()) : Arrays.asList(types);
    chosen.forEach(
        type -> {
          ProjectDocument document =
              kit.documents.save(
                  new ProjectDocument(
                      project,
                      type,
                      type.name().toLowerCase() + ".pdf",
                      ScenarioKit.samplePdf(type, project, null)));
          stamps.add(() -> kit.timestamps.document(document.getId(), at));
        });

    return this;
  }

  /** The designer sends a corrected file over the one in the project. */
  ScenarioCase replaceDocument(int daysAgo, DocumentType type, int revision) {
    OffsetDateTime at = advance(daysAgo, DOCUMENTS);
    ProjectDocument document =
        kit.documents.findByProjectIdAndType(project.getId(), type).orElseThrow();
    document.replace(
        type.name().toLowerCase() + "_rev" + revision + ".pdf",
        ScenarioKit.samplePdf(type, project, "revisão " + revision));
    stamps.add(() -> kit.timestamps.document(document.getId(), at));

    return this;
  }

  /** A change the designer makes to a group after the calculation, or after a rejection. */
  ScenarioCase edit(int daysAgo, ConsumerUnitGroup group, GroupSpec spec) {
    advance(daysAgo, EDIT);
    group.update(spec);

    return this;
  }

  ScenarioCase changeBuilding(int daysAgo, BuildingType building) {
    advance(daysAgo, EDIT);
    project.changeBuildingType(building);

    return this;
  }

  ScenarioCase assignTo(User reviewer) {
    project.assignReviewer(reviewer);

    return this;
  }

  ScenarioCase submit(int daysAgo) {
    project.submit(advance(daysAgo, 0));

    return this;
  }

  ScenarioCase resubmit(int daysAgo, String changeSummary) {
    project.recordChangeSummary(changeSummary);

    return submit(daysAgo);
  }

  /** Findings written and published together with the decision, as the analyst does it. */
  List<Finding> reject(int daysAgo, User analyst, String opinion, FindingSpec... specs) {
    List<Finding> findings = write(analyst, advance(daysAgo, FINDINGS), specs);
    findings.forEach(Finding::publish);
    project.reject(advance(daysAgo, 0), opinion);

    return findings;
  }

  ScenarioCase approve(int daysAgo, String opinion) {
    project.approve(advance(daysAgo, 0), opinion);

    return this;
  }

  /** Findings the analyst is still writing: the designer does not see them yet. */
  List<Finding> draftFindings(int daysAgo, User analyst, FindingSpec... specs) {
    return write(analyst, advance(daysAgo, FINDINGS), specs);
  }

  ScenarioCase respond(int daysAgo, Finding finding, FindingAnswer answer, String response) {
    finding.respond(answer, response, advance(daysAgo, RESPONSE));

    return this;
  }

  /** The analyst's call on an answer, made while the project is back in review. */
  ScenarioCase resolve(Finding finding, FindingResolution resolution) {
    finding.resolve(resolution);

    return this;
  }

  /** Writes the dates the story told; called once, after the last event. */
  void finish() {
    kit.timestamps.project(project.getId(), createdAt, cursor);
    stamps.forEach(Runnable::run);
  }

  private List<Finding> write(User author, OffsetDateTime at, FindingSpec[] specs) {
    List<Finding> findings =
        kit.findings.saveAll(
            Arrays.stream(specs)
                .map(
                    spec ->
                        new Finding(
                            project,
                            spec.severity(),
                            spec.stage(),
                            spec.group(),
                            spec.calculationStepCode(),
                            spec.documentType(),
                            spec.description(),
                            spec.standardItem(),
                            author,
                            project.getReviewCycle()))
                .toList());
    findings.forEach(finding -> stamps.add(() -> kit.timestamps.finding(finding.getId(), at)));

    return findings;
  }

  private OffsetDateTime advance(int daysAgo, int minutesBefore) {
    OffsetDateTime day = kit.now.minusDays(daysAgo);
    OffsetDateTime at = day.minusMinutes(minutesBefore);
    if (!at.isAfter(cursor)) {
      at = cursor.plusMinutes(1);
    }
    if (at.isAfter(day)) {
      throw new IllegalStateException(
          "The story of " + project.getProtocol() + " goes backwards at " + daysAgo + " days ago.");
    }
    cursor = at;

    return at;
  }
}
