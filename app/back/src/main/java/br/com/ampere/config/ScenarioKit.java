package br.com.ampere.config;

import br.com.ampere.domain.DocumentType;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.StandardName;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectDocumentRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.service.DemandCalculationService;
import br.com.ampere.service.ProjectEventService;
import com.lowagie.text.Document;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/** The repositories and the clock one seeding run shares among its scenarios. */
final class ScenarioKit {

  final ProjectRepository projects;
  final ConsumerUnitGroupRepository groups;
  final FindingRepository findings;
  final CalculationRepository calculations;
  final ProjectDocumentRepository documents;
  final DemandCalculationService demand;
  final ProjectEventService events;
  final SeedTimestamps timestamps;
  private final Map<String, Standard> standards;
  final OffsetDateTime now;

  ScenarioKit(
      ProjectRepository projects,
      ConsumerUnitGroupRepository groups,
      FindingRepository findings,
      CalculationRepository calculations,
      ProjectDocumentRepository documents,
      DemandCalculationService demand,
      ProjectEventService events,
      SeedTimestamps timestamps,
      Map<String, Standard> standards,
      OffsetDateTime now) {
    this.projects = projects;
    this.groups = groups;
    this.findings = findings;
    this.calculations = calculations;
    this.documents = documents;
    this.demand = demand;
    this.events = events;
    this.timestamps = timestamps;
    this.standards = standards;
    this.now = now;
  }

  ScenarioCase open(Scenario scenario) {
    List<Standard> applicable =
        scenario.building().applicableStandards().stream()
            .map(StandardName::code)
            .map(standards::get)
            .toList();
    Project project =
        new Project(
            scenario.name(),
            scenario.address(),
            scenario.municipality(),
            scenario.protocol(),
            scenario.initialStatus(),
            scenario.building(),
            applicable,
            scenario.owner());
    project.locate(scenario.postalCode(), scenario.state());

    return new ScenarioCase(this, projects.save(project), scenario.createdDaysAgo());
  }

  static byte[] samplePdf(DocumentType type, Project project, String revision) {
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    Document document = new Document(PageSize.A4);
    PdfWriter.getInstance(document, output);
    document.open();
    document.add(new Paragraph(type.label() + (revision == null ? "" : ", " + revision)));
    document.add(new Paragraph(project.getName() + ", protocolo " + project.getProtocol()));
    document.close();

    return output.toByteArray();
  }
}
