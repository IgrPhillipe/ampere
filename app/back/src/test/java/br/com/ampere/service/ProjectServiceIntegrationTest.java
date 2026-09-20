package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.ampere.domain.BuildingCategory;
import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import java.util.List;
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

  @Autowired private StandardRepository standardRepository;

  @BeforeEach
  void clearProjects() {
    findingRepository.deleteAll();
    projectRepository.deleteAll();
    standardRepository.deleteAll();
    standardRepository.saveAll(
        List.of(new Standard("DIS-NOR-053", "REV 06"), new Standard("DIS-NOR-030", "REV 07")));
  }

  @Test
  void listsProjectsWithPaginationFiltersSearchAndPendingCounts() {
    Project rejectedProject =
        projectRepository.save(
            project(
                "Condomínio Vila Nova",
                "Avenida Barreto de Menezes, 88",
                "Jaboatão dos Guararapes",
                "2026-8475",
                ProjectStatus.REJECTED));
    projectRepository.save(
        project(
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
    projectRepository.save(project("A", "Rua A, 1", "Recife", "2026-9001", ProjectStatus.REJECTED));
    projectRepository.save(project("B", "Rua B, 2", "Recife", "2026-9002", ProjectStatus.APPROVED));

    assertThat(service.countPerStatus())
        .containsEntry(ProjectStatus.REJECTED, 1L)
        .containsEntry(ProjectStatus.APPROVED, 1L)
        .doesNotContainKey(ProjectStatus.DRAFT);
  }

  @Test
  void searchesProjectsByProtocol() {
    Project project =
        projectRepository.save(
            project(
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
        project(
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
  void treatsLikeWildcardsAsLiteralSearchCharacters() {
    projectRepository.save(
        project(
            "Condomínio Vila Nova",
            "Avenida Barreto de Menezes, 88",
            "Jaboatão dos Guararapes",
            "2026-8475",
            ProjectStatus.REJECTED));

    assertThat(service.list(1, 20, null, "%").projects()).isEmpty();
    assertThat(service.list(1, 20, null, "_").projects()).isEmpty();
    assertThat(service.list(1, 20, null, "vila%nova").projects()).isEmpty();
  }

  @Test
  void createsADraftProjectWithAGeneratedProtocolAndBothStandards() {
    Project created = service.create(parameters(BuildingCategory.RESIDENTIAL_MULTIFAMILY));

    assertThat(created.getId()).isNotNull();
    assertThat(created.getStatus()).isEqualTo(ProjectStatus.DRAFT);
    assertThat(created.getProtocol()).matches("\\d{4}-\\d{4}");
    assertThat(created.getStandards())
        .extracting(Standard::getName)
        .containsExactlyInAnyOrder("DIS-NOR-053", "DIS-NOR-030");
    assertThat(created.getBuildingType().category())
        .isEqualTo(BuildingCategory.RESIDENTIAL_MULTIFAMILY);
  }

  @Test
  void generatesSequentialProtocolsWithinTheYear() {
    String first = service.create(parameters(BuildingCategory.MIXED)).getProtocol();
    String second = service.create(parameters(BuildingCategory.MIXED)).getProtocol();
    String third = service.create(parameters(BuildingCategory.NON_RESIDENTIAL)).getProtocol();

    assertThat(List.of(first, second, third)).doesNotHaveDuplicates().isSorted();
  }

  @Test
  void updatesTheTechnicalParametersOfADraft() {
    Long id = service.create(parameters(BuildingCategory.RESIDENTIAL_MULTIFAMILY)).getId();

    Project updated =
        service.update(
            id,
            new ProjectParameters(
                "Comercial Praça Sul",
                "Rua do Sol, 302",
                "Olinda",
                BuildingCategory.NON_RESIDENTIAL,
                3,
                SupplyVoltage.V220_127,
                ConnectionType.SINGLE_PHASE,
                EntranceStandard.INDIVIDUAL));

    assertThat(updated.getName()).isEqualTo("Comercial Praça Sul");
    assertThat(updated.getMunicipality()).isEqualTo("Olinda");
    assertThat(updated.getBuildingType().getFloors()).isEqualTo(3);
    assertThat(updated.getBuildingType().category()).isEqualTo(BuildingCategory.NON_RESIDENTIAL);
    assertThat(updated.getStandards()).hasSize(2);
  }

  @Test
  void refusesToUpdateAProjectUnderReview() {
    Project underReview =
        projectRepository.save(
            project(
                "Aurora",
                "Rua da Aurora, 1240",
                "Recife",
                "2026-5231",
                ProjectStatus.UNDER_REVIEW));

    assertThatThrownBy(
            () -> service.update(underReview.getId(), parameters(BuildingCategory.MIXED)))
        .isInstanceOf(BusinessException.class)
        .hasMessage("Só é possível alterar um projeto em rascunho.");
  }

  @Test
  void deletesADraftProjectAndItsFindings() {
    Project draft = service.create(parameters(BuildingCategory.MIXED));
    findingRepository.save(new Finding(draft));

    service.delete(draft.getId());

    assertThat(projectRepository.findById(draft.getId())).isEmpty();
    assertThat(findingRepository.countPerProject(List.of(draft.getId()))).isEmpty();
  }

  @Test
  void refusesToDeleteAnApprovedProject() {
    Project approved =
        projectRepository.save(
            project("Praça Sul", "Rua do Sol, 302", "Olinda", "2026-5232", ProjectStatus.APPROVED));

    assertThatThrownBy(() -> service.delete(approved.getId()))
        .isInstanceOf(BusinessException.class)
        .hasMessage("Só é possível excluir um projeto em rascunho.");
    assertThat(projectRepository.findById(approved.getId())).isPresent();
  }

  private static ProjectParameters parameters(BuildingCategory category) {
    return new ProjectParameters(
        "Residencial Monte Verde",
        "Rodovia BR-101, km 8",
        "Cabo de Santo Agostinho",
        category,
        12,
        SupplyVoltage.V380_220,
        ConnectionType.THREE_PHASE,
        EntranceStandard.COLLECTIVE);
  }

  private static Project project(
      String name, String address, String municipality, String protocol, ProjectStatus status) {
    return new Project(name, address, municipality, protocol, status, buildingType(), List.of());
  }

  private static BuildingType buildingType() {
    return new ResidentialMultifamily(
        6, SupplyVoltage.V220_127, ConnectionType.TWO_PHASE, EntranceStandard.INDIVIDUAL);
  }
}
