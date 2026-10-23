package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.ampere.domain.BuildingCategory;
import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.DemandComponent;
import br.com.ampere.domain.DemandResult;
import br.com.ampere.domain.DemandStep;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectSort;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.SortDirection;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.error.BusinessException;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
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

  @Autowired private CalculationRepository calculationRepository;

  @Autowired private NormativeTableRepository normativeTableRepository;

  @Autowired private UserRepository userRepository;

  private User owner;

  private AuthenticatedUser designer;

  @BeforeEach
  void clearProjects() {
    calculationRepository.deleteAll();
    findingRepository.deleteAll();
    projectRepository.deleteAll();
    normativeTableRepository.deleteAll();
    standardRepository.deleteAll();
    userRepository.deleteAll();
    owner =
        userRepository.save(new User("João Projetista", "joao@ampere.com", "hash", UserRole.USER));
    designer = new AuthenticatedUser(owner.getId(), UserRole.USER);
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
    findingRepository.save(published(finding(rejectedProject)));
    findingRepository.save(published(finding(rejectedProject)));
    findingRepository.save(finding(rejectedProject));

    ProjectListing listing = list(ProjectStatus.REJECTED, "VILA");

    assertThat(listing.totalElements()).isOne();
    assertThat(listing.projects()).containsExactly(rejectedProject);
    assertThat(listing.pendingCountFor(rejectedProject)).isEqualTo(2);
  }

  @Test
  void countsProjectsPerStatusIgnoringTheListingFilters() {
    projectRepository.save(project("A", "Rua A, 1", "Recife", "2026-9001", ProjectStatus.REJECTED));
    projectRepository.save(project("B", "Rua B, 2", "Recife", "2026-9002", ProjectStatus.APPROVED));

    assertThat(service.countPerStatus(designer))
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

    ProjectListing listing = list(null, "5231");

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

    ProjectListing listing = list(null, "projeto inexistente");

    assertThat(listing.projects()).isEmpty();
    assertThat(listing.pendingCounts()).isEmpty();
    assertThat(service.countPerStatus(designer)).containsEntry(ProjectStatus.UNDER_REVIEW, 1L);
  }

  @Test
  void searchesWithoutAccentsAndRegardlessOfCase() {
    Project project =
        projectRepository.save(
            project(
                "Edifício Residencial Aurora",
                "Rua da Aurora, 1240",
                "Recife",
                "2026-5231",
                ProjectStatus.UNDER_REVIEW));

    assertThat(list(null, "edificio").projects()).containsExactly(project);
    assertThat(list(null, "EDIFÍCIO").projects()).containsExactly(project);
    assertThat(list(null, "Edifício").projects()).containsExactly(project);
  }

  @Test
  void doesNotSearchOutsideNameAndProtocol() {
    projectRepository.save(
        project(
            "Edifício Residencial Aurora",
            "Rua da Aurora, 1240",
            "Recife",
            "2026-5231",
            ProjectStatus.UNDER_REVIEW));

    // Address and municipality are outside the search contract.
    assertThat(list(null, "Recife").projects()).isEmpty();
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

    assertThat(list(null, "%").projects()).isEmpty();
    assertThat(list(null, "_").projects()).isEmpty();
    assertThat(list(null, "vila%nova").projects()).isEmpty();
  }

  @Test
  void ordersByNameAlphabeticallyCaseInsensitive() {
    Project b =
        projectRepository.save(
            project("beta", "Rua B", "Recife", "2026-0002", ProjectStatus.DRAFT));
    Project a =
        projectRepository.save(
            project("Alpha", "Rua A", "Recife", "2026-0001", ProjectStatus.DRAFT));
    Project g =
        projectRepository.save(
            project("Gama", "Rua G", "Recife", "2026-0003", ProjectStatus.DRAFT));

    ProjectListing asc =
        service.list(
            1,
            20,
            null,
            null,
            ProjectSort.NAME,
            SortDirection.ASC,
            null,
            null,
            null,
            null,
            designer);
    assertThat(asc.projects()).containsExactly(a, b, g);

    ProjectListing desc =
        service.list(
            1,
            20,
            null,
            null,
            ProjectSort.NAME,
            SortDirection.DESC,
            null,
            null,
            null,
            null,
            designer);
    assertThat(desc.projects()).containsExactly(g, b, a);
  }

  @Test
  void ordersByDemandWithProjectsWithoutCalculationAtTheEndInBothDirections() {
    Project p100 =
        projectRepository.save(
            project("P100", "Rua 1", "Recife", "2026-0100", ProjectStatus.DRAFT));
    Project p50 =
        projectRepository.save(project("P50", "Rua 2", "Recife", "2026-0050", ProjectStatus.DRAFT));
    Project pNone =
        projectRepository.save(
            project("PNone", "Rua 3", "Recife", "2026-0000", ProjectStatus.DRAFT));

    withDemand(p100, new BigDecimal("100.00"));
    withDemand(p50, new BigDecimal("50.00"));

    ProjectListing asc =
        service.list(
            1,
            20,
            null,
            null,
            ProjectSort.DEMAND,
            SortDirection.ASC,
            null,
            null,
            null,
            null,
            designer);
    assertThat(asc.projects()).containsExactly(p50, p100, pNone);

    ProjectListing desc =
        service.list(
            1,
            20,
            null,
            null,
            ProjectSort.DEMAND,
            SortDirection.DESC,
            null,
            null,
            null,
            null,
            designer);
    assertThat(desc.projects()).containsExactly(p100, p50, pNone);
  }

  @Test
  void filtersByMunicipalityExactCaseInsensitive() {
    Project recife =
        projectRepository.save(project("A", "Rua 1", "Recife", "2026-0010", ProjectStatus.DRAFT));
    projectRepository.save(project("B", "Rua 2", "Olinda", "2026-0020", ProjectStatus.DRAFT));

    ProjectListing listing =
        service.list(
            1,
            20,
            null,
            null,
            ProjectSort.UPDATED_AT,
            SortDirection.DESC,
            "recife",
            null,
            null,
            null,
            designer);
    assertThat(listing.projects()).containsExactly(recife);
  }

  @Test
  void filtersByHasBlockingTrue() {
    Project blockingProject =
        projectRepository.save(
            project("Com Bloqueio", "Rua 1", "Recife", "2026-0030", ProjectStatus.UNDER_REVIEW));
    Project otherProject =
        projectRepository.save(
            project("Sem Bloqueio", "Rua 2", "Recife", "2026-0040", ProjectStatus.UNDER_REVIEW));

    Finding openBlocking =
        new Finding(
            blockingProject,
            FindingSeverity.BLOCKING,
            FindingStage.PROJECT_DATA,
            null,
            null,
            null,
            "Documento obrigatório faltando.",
            null,
            owner,
            1);
    openBlocking.publish();
    findingRepository.save(openBlocking);

    Finding openAdjustment =
        new Finding(
            otherProject,
            FindingSeverity.ADJUSTMENT,
            FindingStage.PROJECT_DATA,
            null,
            null,
            null,
            "Pequeno ajuste no memorial.",
            null,
            owner,
            1);
    openAdjustment.publish();
    findingRepository.save(openAdjustment);

    ProjectListing listing =
        service.list(
            1,
            20,
            null,
            null,
            ProjectSort.UPDATED_AT,
            SortDirection.DESC,
            null,
            null,
            null,
            true,
            designer);
    assertThat(listing.projects()).containsExactly(blockingProject);
  }

  @Test
  void listsDistinctMunicipalitiesForDesignerAndAnalyst() {
    projectRepository.save(project("A", "Rua 1", "Recife", "2026-0010", ProjectStatus.DRAFT));
    projectRepository.save(project("B", "Rua 2", "Olinda", "2026-0020", ProjectStatus.DRAFT));
    projectRepository.save(project("C", "Rua 3", "recife", "2026-0030", ProjectStatus.DRAFT));
    projectRepository.save(
        project("E", "Rua 5", "Jaboatão dos Guararapes", "2026-0050", ProjectStatus.DRAFT));

    User analystUser =
        userRepository.save(new User("Admin", "admin@ampere.com", "hash", UserRole.ADMIN));
    AuthenticatedUser analyst = new AuthenticatedUser(analystUser.getId(), UserRole.ADMIN);

    assertThat(service.listMunicipalities(designer))
        .containsExactly("Jaboatão dos Guararapes", "Olinda", "Recife");
    assertThat(service.listMunicipalities(analyst)).isEmpty();

    Project submitted = project("D", "Rua 4", "Caruaru", "2026-0040", ProjectStatus.UNDER_REVIEW);
    submitted.submit(OffsetDateTime.now(ZoneOffset.UTC));
    projectRepository.save(submitted);

    assertThat(service.listMunicipalities(analyst)).containsExactly("Caruaru");
  }

  @Test
  void createsADraftProjectWithAGeneratedProtocolAndBothStandards() {
    Project created =
        service.create(parameters(BuildingCategory.RESIDENTIAL_MULTIFAMILY), designer);

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
  void assignsTheAuthenticatedUserAsTheOwner() {
    Project created =
        service.create(parameters(BuildingCategory.RESIDENTIAL_MULTIFAMILY), designer);

    assertThat(created.getOwner().getId()).isEqualTo(owner.getId());
  }

  @Test
  void generatesSequentialProtocolsWithinTheYear() {
    String first = service.create(parameters(BuildingCategory.MIXED), designer).getProtocol();
    String second = service.create(parameters(BuildingCategory.MIXED), designer).getProtocol();
    String third =
        service.create(parameters(BuildingCategory.NON_RESIDENTIAL), designer).getProtocol();

    assertThat(List.of(first, second, third)).doesNotHaveDuplicates().isSorted();
  }

  @Test
  void updatesTheTechnicalParametersOfADraft() {
    Long id =
        service.create(parameters(BuildingCategory.RESIDENTIAL_MULTIFAMILY), designer).getId();

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
                EntranceStandard.INDIVIDUAL),
            designer);

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
            () -> service.update(underReview.getId(), parameters(BuildingCategory.MIXED), designer))
        .isInstanceOf(BusinessException.class)
        .hasMessage("Só é possível alterar um projeto em rascunho.");
  }

  @Test
  void deletesADraftProjectAndItsFindings() {
    Project draft = service.create(parameters(BuildingCategory.MIXED), designer);
    findingRepository.save(published(finding(draft)));

    service.delete(draft.getId(), designer);

    assertThat(projectRepository.findById(draft.getId())).isEmpty();
    assertThat(findingRepository.findAllByProjectIdOrderByCreatedAtAscIdAsc(draft.getId()))
        .isEmpty();
  }

  @Test
  void refusesToDeleteAnApprovedProject() {
    Project approved =
        projectRepository.save(
            project("Praça Sul", "Rua do Sol, 302", "Olinda", "2026-5232", ProjectStatus.APPROVED));

    assertThatThrownBy(() -> service.delete(approved.getId(), designer))
        .isInstanceOf(BusinessException.class)
        .hasMessage("Só é possível excluir um projeto em rascunho.");
    assertThat(projectRepository.findById(approved.getId())).isPresent();
  }

  private ProjectListing list(ProjectStatus status, String search) {
    return service.list(
        1,
        20,
        status,
        search,
        ProjectSort.UPDATED_AT,
        SortDirection.DESC,
        null,
        null,
        null,
        null,
        designer);
  }

  private void withDemand(Project project, BigDecimal demandKva) {
    List<DemandStep> steps =
        List.of(
            new DemandStep(
                DemandComponent.RESIDENTIAL_UNITS.symbol(),
                DemandComponent.RESIDENTIAL_UNITS.title(),
                false,
                "",
                List.of(),
                BigDecimal.ZERO,
                null,
                List.of(),
                null),
            new DemandStep(
                DemandComponent.CONDOMINIUM_SERVICES.symbol(),
                DemandComponent.CONDOMINIUM_SERVICES.title(),
                false,
                "",
                List.of(),
                BigDecimal.ZERO,
                null,
                List.of(),
                null),
            new DemandStep(
                DemandComponent.NON_RESIDENTIAL_UNITS.symbol(),
                DemandComponent.NON_RESIDENTIAL_UNITS.title(),
                false,
                "",
                List.of(),
                BigDecimal.ZERO,
                null,
                List.of(),
                null),
            new DemandStep(
                DemandComponent.EV_CHARGING.symbol(),
                DemandComponent.EV_CHARGING.title(),
                false,
                "",
                List.of(),
                BigDecimal.ZERO,
                null,
                List.of(),
                null),
            new DemandStep(
                "Ded",
                "Demanda Total da Edificação",
                true,
                "",
                List.of(),
                demandKva,
                null,
                List.of(),
                null));
    DemandResult result =
        new DemandResult(
            steps,
            demandKva,
            demandKva,
            demandKva,
            false,
            null,
            new BigDecimal("50.00"),
            List.of(),
            List.of());
    calculationRepository.save(new Calculation(project, result, "{}"));
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

  private Project project(
      String name, String address, String municipality, String protocol, ProjectStatus status) {
    return new Project(
        name, address, municipality, protocol, status, buildingType(), List.of(), owner);
  }

  private Finding finding(Project project) {
    return new Finding(
        project,
        FindingSeverity.ADJUSTMENT,
        FindingStage.PROJECT_DATA,
        null,
        null,
        null,
        "Informe o número do lote.",
        null,
        owner,
        1);
  }

  private static Finding published(Finding finding) {
    finding.publish();

    return finding;
  }

  private static BuildingType buildingType() {
    return new ResidentialMultifamily(
        6, SupplyVoltage.V220_127, ConnectionType.TWO_PHASE, EntranceStandard.INDIVIDUAL);
  }
}
