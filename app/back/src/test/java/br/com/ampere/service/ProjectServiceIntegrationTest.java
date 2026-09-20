package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.ampere.domain.Finding;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectRepository;
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

    ProjectListing listing = service.list(1, 20, ProjectStatus.REJECTED, "VILA");

    assertThat(listing.totalElements()).isOne();
    assertThat(listing.projects()).containsExactly(rejectedProject);
    assertThat(listing.pendingCountFor(rejectedProject)).isEqualTo(2);
  }

  @Test
  void countsProjectsPerStatusIgnoringTheListingFilters() {
    projectRepository.save(
        new Project("A", "Rua A, 1", "Recife", "2026-9001", ProjectStatus.REJECTED));
    projectRepository.save(
        new Project("B", "Rua B, 2", "Recife", "2026-9002", ProjectStatus.APPROVED));

    assertThat(service.countPerStatus())
        .containsEntry(ProjectStatus.REJECTED, 1L)
        .containsEntry(ProjectStatus.APPROVED, 1L)
        .doesNotContainKey(ProjectStatus.DRAFT);
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

    assertThat(listing.projects()).containsExactly(project);
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
    assertThat(service.countPerStatus()).containsEntry(ProjectStatus.UNDER_REVIEW, 1L);
  }

  @Test
  void searchesWithoutAccentsAndRegardlessOfCase() {
    Project project =
        projectRepository.save(
            new Project(
                "Edifício Residencial Aurora",
                "Rua da Aurora, 1240",
                "Recife",
                "2026-5231",
                ProjectStatus.UNDER_REVIEW));

    assertThat(service.list(1, 20, null, "edificio").projects()).containsExactly(project);
    assertThat(service.list(1, 20, null, "EDIFÍCIO").projects()).containsExactly(project);
    assertThat(service.list(1, 20, null, "Edifício").projects()).containsExactly(project);
  }

  @Test
  void doesNotSearchOutsideNameAndProtocol() {
    projectRepository.save(
        new Project(
            "Edifício Residencial Aurora",
            "Rua da Aurora, 1240",
            "Recife",
            "2026-5231",
            ProjectStatus.UNDER_REVIEW));

    // O endereco e o municipio estao fora do contrato de busca.
    assertThat(service.list(1, 20, null, "Recife").projects()).isEmpty();
  }

  @Test
  void treatsLikeWildcardsAsLiteralSearchCharacters() {
    projectRepository.save(
        new Project(
            "Condomínio Vila Nova",
            "Avenida Barreto de Menezes, 88",
            "Jaboatão dos Guararapes",
            "2026-8475",
            ProjectStatus.REJECTED));

    assertThat(service.list(1, 20, null, "%").projects()).isEmpty();
    assertThat(service.list(1, 20, null, "_").projects()).isEmpty();
    assertThat(service.list(1, 20, null, "vila%nova").projects()).isEmpty();
  }
}
