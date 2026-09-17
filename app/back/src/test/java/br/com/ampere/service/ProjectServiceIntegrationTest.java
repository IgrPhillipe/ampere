package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.ampere.domain.Finding;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.service.ProjectService.ProjectListing;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class ProjectServiceIntegrationTest {

  @Autowired private ProjectService service;

  @Autowired private ProjectRepository projectRepository;

  @Autowired private FindingRepository findingRepository;

  @BeforeEach
  void clearProjects() {
    findingRepository.deleteAll();
    projectRepository.deleteAll();
  }

  @Test
  void listsProjectsWithPaginationFiltersSearchAndPendingCounts() {
    Project rejectedProject =
        projectRepository.save(
            new Project(
                "Condomínio Vila Nova",
                "Avenida Barreto de Menezes, 88",
                "Jaboatão dos Guararapes",
                "2026-8475",
                ProjectStatus.REJECTED));
    projectRepository.save(
        new Project(
            "Comercial Praça Sul",
            "Rua do Sol, 302",
            "Olinda",
            "2026-1002",
            ProjectStatus.APPROVED));
    findingRepository.save(new Finding(rejectedProject));
    findingRepository.save(new Finding(rejectedProject));

    ProjectListing listing = service.list(1, 20, "rejected", "VILA");

    assertThat(listing.projects().getTotalElements()).isOne();
    assertThat(listing.projects().getNumber()).isZero();
    assertThat(listing.projects().getContent()).containsExactly(rejectedProject);
    assertThat(listing.pendingCountFor(rejectedProject)).isEqualTo(2);
    assertThat(listing.statusCounts())
        .containsEntry(ProjectStatus.REJECTED, 1L)
        .containsEntry(ProjectStatus.APPROVED, 1L);
  }

  @Test
  void searchesProjectsByProtocol() {
    Project project =
        projectRepository.save(
            new Project(
                "Edifício Residencial Aurora",
                "Rua da Aurora, 1240",
                "Recife",
                "2026-5231",
                ProjectStatus.UNDER_REVIEW));

    ProjectListing listing = service.list(1, 20, null, "5231");

    assertThat(listing.projects().getContent()).containsExactly(project);
    assertThat(listing.pendingCountFor(project)).isZero();
  }

  @Test
  void returnsEmptyPageForUnknownSearch() {
    projectRepository.save(
        new Project(
            "Edifício Residencial Aurora",
            "Rua da Aurora, 1240",
            "Recife",
            "2026-5231",
            ProjectStatus.UNDER_REVIEW));

    ProjectListing listing = service.list(1, 20, null, "projeto inexistente");

    assertThat(listing.projects()).isEmpty();
    assertThat(listing.pendingCounts()).isEmpty();
    assertThat(listing.statusCounts()).containsEntry(ProjectStatus.UNDER_REVIEW, 1L);
  }

  @Test
  void rejectsInvalidPaginationAndStatus() {
    assertThatThrownBy(() -> service.list(0, 20, null, null))
        .isInstanceOf(BusinessException.class)
        .hasMessage("A página deve ser maior ou igual a 1.");
    assertThatThrownBy(() -> service.list(1, 101, null, null))
        .isInstanceOf(BusinessException.class)
        .hasMessage("O tamanho da página deve estar entre 1 e 100.");
    assertThatThrownBy(() -> service.list(1, 20, "unknown", null))
        .isInstanceOf(BusinessException.class)
        .hasMessage("Status de projeto inválido.");
  }
}
