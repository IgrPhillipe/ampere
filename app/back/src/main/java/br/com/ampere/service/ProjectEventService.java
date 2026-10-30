package br.com.ampere.service;

import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.CalculationCheck;
import br.com.ampere.domain.CheckStatus;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingAnswer;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
import br.com.ampere.domain.ReviewDecision;
import br.com.ampere.domain.User;
import br.com.ampere.repository.ProjectEventRepository;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

/** Records lifecycle facts inside the transaction of the operation that produced them. */
@Service
public class ProjectEventService {

  private final ProjectEventRepository eventRepository;

  public ProjectEventService(ProjectEventRepository eventRepository) {
    this.eventRepository = eventRepository;
  }

  public ProjectEvent created(Project project, User author) {
    return created(project, author, project.getCreatedAt());
  }

  public ProjectEvent created(Project project, User author, OffsetDateTime occurredAt) {
    return record(project, ProjectEventType.CREATED, author, "Projeto criado.", null, occurredAt);
  }

  public void submitted(
      Project project, User author, Calculation calculation, OffsetDateTime occurredAt) {
    boolean resubmission = project.getReviewCycle() > 1;
    String action = resubmission ? "reenviada" : "enviada";
    ProjectEventType type =
        resubmission ? ProjectEventType.RESUBMITTED : ProjectEventType.SUBMITTED;
    record(
        project,
        type,
        author,
        "Versão " + project.getReviewCycle() + " " + action + " para análise.",
        resubmission ? project.getChangeSummary() : null,
        occurredAt);
    preValidated(project, calculation, occurredAt);
  }

  public ProjectEvent assigned(Project project, User author, OffsetDateTime occurredAt) {
    return record(
        project,
        ProjectEventType.ASSIGNED,
        author,
        "Análise assumida por " + author.getName() + ".",
        null,
        occurredAt);
  }

  public ProjectEvent decided(
      Project project,
      ReviewDecision decision,
      User author,
      List<Finding> findings,
      String opinion,
      OffsetDateTime occurredAt) {
    if (decision == ReviewDecision.APPROVE) {
      return record(project, ProjectEventType.APPROVED, author, "Aprovado.", opinion, occurredAt);
    }

    long count =
        findings.stream()
            .filter(finding -> ProjectService.OPEN_FINDINGS.contains(finding.getStatus()))
            .count();
    String noun = count == 1 ? " apontamento." : " apontamentos.";
    return record(
        project,
        ProjectEventType.REJECTED,
        author,
        "Reprovado com " + count + noun,
        opinion,
        occurredAt);
  }

  public ProjectEvent findingAnswered(
      Project project,
      User author,
      FindingAnswer answer,
      String response,
      OffsetDateTime occurredAt) {
    String description =
        answer == FindingAnswer.FIXED ? "Apontamento corrigido." : "Apontamento contestado.";
    return record(
        project, ProjectEventType.FINDING_ANSWERED, author, description, response, occurredAt);
  }

  private ProjectEvent preValidated(
      Project project, Calculation calculation, OffsetDateTime occurredAt) {
    List<String> warnings =
        calculation.getChecks().stream()
            .filter(check -> check.getStatus() == CheckStatus.WARNING)
            .map(CalculationCheck::getMessage)
            .toList();
    String description =
        switch (warnings.size()) {
          case 0 -> "Pré-validação sem alertas.";
          case 1 -> "Pré-validação com 1 alerta.";
          default -> "Pré-validação com " + warnings.size() + " alertas.";
        };
    String detail = warnings.isEmpty() ? null : String.join("\n", warnings);

    return record(project, ProjectEventType.PRE_VALIDATED, null, description, detail, occurredAt);
  }

  private ProjectEvent record(
      Project project,
      ProjectEventType type,
      User author,
      String description,
      String detail,
      OffsetDateTime occurredAt) {
    return eventRepository.save(
        new ProjectEvent(
            project,
            type,
            project.getReviewCycle(),
            author,
            author == null ? null : author.getRole(),
            description,
            detail,
            occurredAt));
  }
}
