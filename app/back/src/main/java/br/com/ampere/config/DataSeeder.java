package br.com.ampere.config;

import br.com.ampere.domain.Finding;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Popula as tabelas de desenvolvimento no primeiro boot.
 *
 * <p>Existe porque, sem Flyway, nao ha migration para carregar dado inicial — e uma API que sobe
 * com o banco vazio nao mostra nada. So roda quando a tabela esta vazia, entao reiniciar nao
 * duplica registro.
 */
@Component
@Profile("!prod & !test")
public class DataSeeder implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

  private final ProjectRepository projectRepository;
  private final FindingRepository findingRepository;

  public DataSeeder(ProjectRepository projectRepository, FindingRepository findingRepository) {
    this.projectRepository = projectRepository;
    this.findingRepository = findingRepository;
  }

  @Override
  @Transactional
  public void run(String... args) {
    seedProjects();
  }

  private void seedProjects() {
    if (projectRepository.count() > 0) {
      return;
    }

    Project draft =
        new Project(
            "Residencial Monte Verde",
            "Rodovia BR-101, km 8",
            "Cabo de Santo Agostinho",
            "2026-1001",
            ProjectStatus.DRAFT);
    Project awaitingSubmission =
        new Project(
            "Edifício Torre Norte",
            "Avenida Norte, 4501",
            "Recife",
            "2026-1002",
            ProjectStatus.AWAITING_SUBMISSION);
    Project underReview =
        new Project(
            "Edifício Residencial Aurora",
            "Rua da Aurora, 1240",
            "Recife",
            "2026-1003",
            ProjectStatus.UNDER_REVIEW);
    Project rejected =
        new Project(
            "Condomínio Vila Nova",
            "Avenida Barreto de Menezes, 88",
            "Jaboatão dos Guararapes",
            "2026-1004",
            ProjectStatus.REJECTED);
    Project anotherRejected =
        new Project(
            "Centro Empresarial Recife",
            "Avenida Guararapes, 250",
            "Recife",
            "2026-1005",
            ProjectStatus.REJECTED);
    Project approved =
        new Project(
            "Comercial Praça Sul",
            "Rua do Sol, 302",
            "Olinda",
            "2026-1006",
            ProjectStatus.APPROVED);

    projectRepository.saveAll(
        List.of(draft, awaitingSubmission, underReview, rejected, anotherRejected, approved));
    findingRepository.saveAll(
        List.of(
            new Finding(rejected),
            new Finding(rejected),
            new Finding(rejected),
            new Finding(anotherRejected)));

    log.info("DataSeeder: seis projetos e quatro apontamentos inseridos.");
  }
}
