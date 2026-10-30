package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.BuildingCategory;
import br.com.ampere.domain.BuildingType;
import br.com.ampere.domain.Calculation;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.DemandComponent;
import br.com.ampere.domain.DemandResult;
import br.com.ampere.domain.DemandStep;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.FindingAnswer;
import br.com.ampere.domain.FindingResolution;
import br.com.ampere.domain.FindingSeverity;
import br.com.ampere.domain.FindingStage;
import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.GroupSpec;
import br.com.ampere.domain.OpenFindingsFilter;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectEvent;
import br.com.ampere.domain.ProjectEventType;
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
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.ProjectEventRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
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

  @Autowired private ConsumerUnitGroupRepository groupRepository;

  @Autowired private ProjectEventRepository eventRepository;

  @Autowired private NormativeTableRepository normativeTableRepository;

  @Autowired private UserRepository userRepository;

  @Autowired private EntityManager entityManager;

  private User owner;

  private AuthenticatedUser designer;

  @BeforeEach
  void clearProjects() {
    eventRepository.deleteAll();
    calculationRepository.deleteAll();
    findingRepository.deleteAll();
    groupRepository.deleteAll();
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
  void detailsTheProjectWithItsSummaryMetricsAndLastEvent() {
    Project project =
        projectRepository.save(
            project(
                "Residencial Resumo",
                "Rua do Resumo, 10",
                "Recife",
                "2026-9110",
                ProjectStatus.REJECTED));
    Finding open = published(finding(project));
    Finding contested = published(finding(project));
    contested.respond(
        FindingAnswer.CONTESTED,
        "A solução já atende à norma.",
        OffsetDateTime.parse("2026-10-15T10:00:00Z"));
    Finding fixed = published(finding(project));
    fixed.respond(
        FindingAnswer.FIXED,
        "Número do lote informado.",
        OffsetDateTime.parse("2026-10-15T11:00:00Z"));
    findingRepository.saveAll(List.of(open, contested, fixed, finding(project)));
    groupRepository.saveAll(
        List.of(
            residentialGroup(project, "Apartamentos A", 5),
            residentialGroup(project, "Apartamentos B", 3)));
    withDemand(project, new BigDecimal("50.0"));
    withDemand(project, new BigDecimal("61.2"));
    OffsetDateTime lastActivityAt = OffsetDateTime.parse("2026-10-16T14:20:00Z");
    eventRepository.saveAll(
        List.of(
            event(project, ProjectEventType.SUBMITTED, "2026-10-04T13:00:00Z"),
            event(project, ProjectEventType.REJECTED, lastActivityAt.toString())));

    ProjectSummary summary = service.detail(project.getId(), designer);

    assertThat(summary.project()).isEqualTo(project);
    assertThat(summary.openFindingsCount()).isEqualTo(2);
    assertThat(summary.consumerUnitsCount()).isEqualTo(8);
    assertThat(summary.demandKva()).isEqualByComparingTo("61.2");
    assertThat(summary.lastActivityAt()).isEqualTo(lastActivityAt);
  }

  @Test
  void closesTheFindingsOfAnApprovedProject() {
    Project approved =
        projectRepository.save(
            project(
                "Residencial Aprovado",
                "Rua Aprovada, 20",
                "Recife",
                "2026-9111",
                ProjectStatus.APPROVED));
    findingRepository.save(published(finding(approved)));

    assertThat(service.detail(approved.getId(), designer).openFindingsCount()).isZero();
  }

  @Test
  void summarizesAProjectWithoutGroupsCalculationOrEvents() {
    Project draft =
        projectRepository.save(
            project(
                "Residencial Vazio", "Rua Vazia, 30", "Recife", "2026-9113", ProjectStatus.DRAFT));

    ProjectSummary summary = service.detail(draft.getId(), designer);

    assertThat(summary.openFindingsCount()).isZero();
    assertThat(summary.consumerUnitsCount()).isZero();
    assertThat(summary.demandKva()).isNull();
    assertThat(summary.lastActivityAt()).isEqualTo(draft.getUpdatedAt());
  }

  @Test
  void datesTheLegacySubmissionsWithTheirCreationAndLeavesTheRestAlone() {
    Project legacy =
        projectRepository.save(
            project("Legado", "Rua A, 1", "Recife", "2026-9101", ProjectStatus.UNDER_REVIEW));
    Project draft =
        projectRepository.save(
            project("Rascunho", "Rua B, 2", "Recife", "2026-9102", ProjectStatus.DRAFT));
    Project dated =
        projectRepository.save(
            project("Enviado", "Rua C, 3", "Recife", "2026-9103", ProjectStatus.DRAFT));
    OffsetDateTime submittedAt = OffsetDateTime.parse("2026-10-01T12:00:00Z");
    dated.submit(submittedAt);
    entityManager.flush();

    assertThat(projectRepository.dateLegacySubmissions()).isEqualTo(1);
    entityManager.clear();

    Project reloaded = projectRepository.findById(legacy.getId()).orElseThrow();
    assertThat(reloaded.getSubmittedAt()).isEqualTo(reloaded.getCreatedAt());
    assertThat(projectRepository.findById(draft.getId()).orElseThrow().getSubmittedAt()).isNull();
    assertThat(projectRepository.findById(dated.getId()).orElseThrow().getSubmittedAt())
        .isEqualTo(submittedAt);
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
  void ordersByNameIgnoringCase() {
    Project beta = save("beta", "Recife", "2026-0002");
    Project alpha = save("Alpha", "Recife", "2026-0001");
    Project gama = save("Gama", "Recife", "2026-0003");

    assertThat(list(sortedBy(ProjectSort.NAME, SortDirection.ASC)).projects())
        .containsExactly(alpha, beta, gama);
    assertThat(list(sortedBy(ProjectSort.NAME, SortDirection.DESC)).projects())
        .containsExactly(gama, beta, alpha);
  }

  @Test
  void ordersByTheLatestDemandWithUncalculatedProjectsLastInBothDirections() {
    Project hundred = save("P100", "Recife", "2026-0100");
    Project fifty = save("P50", "Recife", "2026-0050");
    Project uncalculated = save("PNone", "Recife", "2026-0000");
    withDemand(hundred, new BigDecimal("10.00"));
    withDemand(hundred, new BigDecimal("100.00"));
    withDemand(fifty, new BigDecimal("50.00"));

    assertThat(list(sortedBy(ProjectSort.DEMAND, SortDirection.ASC)).projects())
        .containsExactly(fifty, hundred, uncalculated);
    assertThat(list(sortedBy(ProjectSort.DEMAND, SortDirection.DESC)).projects())
        .containsExactly(hundred, fifty, uncalculated);
  }

  @Test
  void ordersByCreationAndBreaksTiesByIdInTheSameDirection() {
    Project first = save("A", "Recife", "2026-0001");
    Project second = save("B", "Recife", "2026-0002");
    Project oldest = save("C", "Recife", "2026-0003");
    stamp(first, "createdAt", "2026-10-05T12:00Z");
    stamp(second, "createdAt", "2026-10-05T12:00Z");
    stamp(oldest, "createdAt", "2026-10-01T12:00Z");

    assertThat(list(sortedBy(ProjectSort.CREATED_AT, SortDirection.ASC)).projects())
        .containsExactly(oldest, first, second);
    assertThat(list(sortedBy(ProjectSort.CREATED_AT, SortDirection.DESC)).projects())
        .containsExactly(second, first, oldest);
  }

  @Test
  void ordersByTheLastUpdateAndBreaksTiesById() {
    Project first = save("A", "Recife", "2026-0001");
    Project second = save("B", "Recife", "2026-0002");
    Project latest = save("C", "Recife", "2026-0003");
    stamp(first, "updatedAt", "2026-10-05T12:00Z");
    stamp(second, "updatedAt", "2026-10-05T12:00Z");
    stamp(latest, "updatedAt", "2026-10-09T12:00Z");

    assertThat(list(sortedBy(ProjectSort.UPDATED_AT, SortDirection.DESC)).projects())
        .containsExactly(latest, second, first);
    assertThat(list(sortedBy(ProjectSort.UPDATED_AT, SortDirection.ASC)).projects())
        .containsExactly(first, second, latest);
  }

  @Test
  void filtersByTheCreationPeriodInRecifeTime() {
    Project dayBefore = save("A", "Recife", "2026-0001");
    Project firstDay = save("B", "Recife", "2026-0002");
    Project lastDay = save("C", "Recife", "2026-0003");
    Project dayAfter = save("D", "Recife", "2026-0004");
    stamp(dayBefore, "createdAt", "2026-09-30T23:30-03:00");
    stamp(firstDay, "createdAt", "2026-10-01T00:30-03:00");
    stamp(lastDay, "createdAt", "2026-10-10T23:30-03:00");
    stamp(dayAfter, "createdAt", "2026-10-11T00:05-03:00");

    ProjectListing listing =
        list(filtered(null, LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 10)));

    assertThat(listing.projects()).containsExactlyInAnyOrder(firstDay, lastDay);
  }

  @Test
  void filtersByMunicipalityIgnoringCaseAndSurroundingSpaces() {
    Project recife = save("A", "Recife ", "2026-0010");
    save("B", "Olinda", "2026-0020");
    save("C", "Recife Antigo", "2026-0030");

    assertThat(list(filtered(" recife", null, null)).projects()).containsExactly(recife);
  }

  @Test
  void filtersByState() {
    Project recife = save("A", "Recife", "2026-0010");
    Project pedras = save("B", "Pedras de Fogo", "2026-0020");
    pedras.locate("58328000", BrazilianState.PB);
    projectRepository.save(pedras);

    ProjectListQuery inParaiba =
        new ProjectListQuery(
            null,
            null,
            ProjectSort.UPDATED_AT,
            SortDirection.DESC,
            Set.of(BrazilianState.PB),
            null,
            null,
            null,
            null,
            null);

    assertThat(list(inParaiba).projects()).containsExactly(pedras);
    assertThat(recife.getState()).isEqualTo(BrazilianState.PE);
  }

  @Test
  void filtersByTheFindingsStillOpen() {
    Project blocked = save("A", "Recife", "2026-0030");
    Project adjusted = save("B", "Recife", "2026-0040");
    Project drafted = save("C", "Recife", "2026-0050");
    Project resolved = save("D", "Recife", "2026-0060");
    Project clean = save("E", "Recife", "2026-0070");
    findingRepository.save(published(finding(blocked, FindingSeverity.BLOCKING)));
    findingRepository.save(published(finding(adjusted, FindingSeverity.ADJUSTMENT)));
    findingRepository.save(finding(drafted, FindingSeverity.BLOCKING));
    Finding accepted = published(finding(resolved, FindingSeverity.BLOCKING));
    accepted.resolve(FindingResolution.ACCEPT);
    findingRepository.save(accepted);

    assertThat(list(filtered(OpenFindingsFilter.BLOCKING_OPEN)).projects())
        .containsExactly(blocked);
    assertThat(list(filtered(OpenFindingsFilter.ANY_OPEN)).projects())
        .containsExactlyInAnyOrder(blocked, adjusted);
    assertThat(list(filtered(OpenFindingsFilter.NONE_OPEN)).projects())
        .containsExactlyInAnyOrder(drafted, resolved, clean);
    assertThat(list(filtered((OpenFindingsFilter) null)).projects()).hasSize(5);
    assertThat(
            list(new ProjectListQuery(
                    null,
                    null,
                    ProjectSort.UPDATED_AT,
                    SortDirection.DESC,
                    null,
                    null,
                    null,
                    null,
                    Set.of(OpenFindingsFilter.BLOCKING_OPEN, OpenFindingsFilter.NONE_OPEN),
                    null))
                .projects())
        .containsExactlyInAnyOrder(blocked, drafted, resolved, clean);
  }

  @Test
  void filtersBySeveralMunicipalitiesAtOnce() {
    Project recife = save("A", "Recife", "2026-0010");
    Project olinda = save("B", "Olinda", "2026-0020");
    save("C", "Paulista", "2026-0030");

    ProjectListQuery query =
        new ProjectListQuery(
            null,
            null,
            ProjectSort.UPDATED_AT,
            SortDirection.DESC,
            null,
            Set.of("recife", " Olinda "),
            null,
            null,
            null,
            null);

    assertThat(list(query).projects()).containsExactlyInAnyOrder(recife, olinda);
  }

  @Test
  void combinesTheFiltersWithTheSort() {
    Project zeta = save("Zeta", "Recife", "2026-0001");
    Project alpha = save("Alpha", "Recife", "2026-0002");
    Project olinda = save("Beta", "Olinda", "2026-0003");
    save("Gama", "Recife", "2026-0004");
    for (Project blocked : List.of(zeta, alpha, olinda)) {
      findingRepository.save(published(finding(blocked, FindingSeverity.BLOCKING)));
    }

    ProjectListing listing =
        list(
            new ProjectListQuery(
                ProjectStatus.UNDER_REVIEW,
                null,
                ProjectSort.NAME,
                SortDirection.ASC,
                null,
                Set.of("Recife"),
                null,
                null,
                Set.of(OpenFindingsFilter.BLOCKING_OPEN),
                null));

    assertThat(listing.projects()).containsExactly(alpha, zeta);
    assertThat(listing.totalElements()).isEqualTo(2);
  }

  @Test
  void createsADraftProjectWithAGeneratedProtocolAndBothStandards() {
    Project created =
        service.create(parameters(BuildingCategory.RESIDENTIAL_MULTIFAMILY), designer).project();

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
        service.create(parameters(BuildingCategory.RESIDENTIAL_MULTIFAMILY), designer).project();

    assertThat(created.getOwner().getId()).isEqualTo(owner.getId());
  }

  @Test
  void refusesAProjectOutsideTheConcessionArea() {
    ProjectParameters inJoaoPessoa =
        new ProjectParameters(
            "Residencial Tambaú",
            "58039000",
            BrazilianState.PB,
            "João Pessoa",
            "Avenida Almirante Tamandaré, 100",
            BuildingCategory.RESIDENTIAL_MULTIFAMILY,
            12,
            SupplyVoltage.V380_220,
            ConnectionType.THREE_PHASE,
            EntranceStandard.COLLECTIVE);

    assertThatThrownBy(() -> service.create(inJoaoPessoa, designer))
        .isInstanceOf(BusinessException.class)
        .hasMessageContaining("Pedras de Fogo (PB)");
  }

  @Test
  void refusesAPostalCodeFromAnotherStateOrAnUnknownMunicipality() {
    ProjectParameters paulistaCep =
        new ProjectParameters(
            "Residencial Aurora",
            "01001000",
            BrazilianState.PE,
            "Recife",
            "Rua da Aurora, 1",
            BuildingCategory.RESIDENTIAL_MULTIFAMILY,
            12,
            SupplyVoltage.V380_220,
            ConnectionType.THREE_PHASE,
            EntranceStandard.COLLECTIVE);
    ProjectParameters unknownCity =
        new ProjectParameters(
            "Residencial Aurora",
            "50030230",
            BrazilianState.PE,
            "Cidade Inventada",
            "Rua da Aurora, 1",
            BuildingCategory.RESIDENTIAL_MULTIFAMILY,
            12,
            SupplyVoltage.V380_220,
            ConnectionType.THREE_PHASE,
            EntranceStandard.COLLECTIVE);

    assertThatThrownBy(() -> service.create(paulistaCep, designer))
        .isInstanceOf(BusinessException.class)
        .hasMessage("O CEP não pertence à UF informada.");
    assertThatThrownBy(() -> service.create(unknownCity, designer))
        .isInstanceOf(BusinessException.class)
        .hasMessageContaining("Pedras de Fogo (PB)");
  }

  @Test
  void storesTheIbgeSpellingOfTheMunicipality() {
    ProjectParameters typed =
        new ProjectParameters(
            "Residencial Aurora",
            "54000000",
            BrazilianState.PE,
            " jaboatao dos guararapes ",
            "Rua 1",
            BuildingCategory.RESIDENTIAL_MULTIFAMILY,
            12,
            SupplyVoltage.V380_220,
            ConnectionType.THREE_PHASE,
            EntranceStandard.COLLECTIVE);

    assertThat(service.create(typed, designer).project().getMunicipality())
        .isEqualTo("Jaboatão dos Guararapes");
  }

  @Test
  void storesThePostalCodeAndTheState() {
    Project created =
        service.create(parameters(BuildingCategory.RESIDENTIAL_MULTIFAMILY), designer).project();

    assertThat(created.getPostalCode()).isEqualTo("54500000");
    assertThat(created.formattedPostalCode()).isEqualTo("54500-000");
    assertThat(created.getState()).isEqualTo(BrazilianState.PE);
  }

  @Test
  void generatesSequentialProtocolsWithinTheYear() {
    String first =
        service.create(parameters(BuildingCategory.MIXED), designer).project().getProtocol();
    String second =
        service.create(parameters(BuildingCategory.MIXED), designer).project().getProtocol();
    String third =
        service
            .create(parameters(BuildingCategory.NON_RESIDENTIAL), designer)
            .project()
            .getProtocol();

    assertThat(List.of(first, second, third)).doesNotHaveDuplicates().isSorted();
  }

  @Test
  void updatesTheTechnicalParametersOfADraft() {
    Long id =
        service
            .create(parameters(BuildingCategory.RESIDENTIAL_MULTIFAMILY), designer)
            .project()
            .getId();

    Project updated =
        service
            .update(
                id,
                new ProjectParameters(
                    "Comercial Praça Sul",
                    "54500000",
                    BrazilianState.PE,
                    "Olinda",
                    "Rua do Sol, 302",
                    BuildingCategory.NON_RESIDENTIAL,
                    3,
                    SupplyVoltage.V220_127,
                    ConnectionType.SINGLE_PHASE,
                    EntranceStandard.INDIVIDUAL),
                designer)
            .project();

    assertThat(updated.getName()).isEqualTo("Comercial Praça Sul");
    assertThat(updated.getMunicipality()).isEqualTo("Olinda");
    assertThat(updated.getBuildingType().getFloors()).isEqualTo(3);
    assertThat(updated.getBuildingType().category()).isEqualTo(BuildingCategory.NON_RESIDENTIAL);
    assertThat(updated.getStandards()).hasSize(2);
  }

  @Test
  void theLastActivityOfAProjectWithoutEventsFollowsItsUpdate() throws Exception {
    Project legacy =
        projectRepository.save(
            project(
                "Residencial Legado", "Rua Antiga, 5", "Recife", "2026-9112", ProjectStatus.DRAFT));
    OffsetDateTime before = legacy.getUpdatedAt();
    Thread.sleep(5);

    ProjectSummary summary =
        service.update(legacy.getId(), parameters(BuildingCategory.MIXED), designer);
    entityManager.flush();

    assertThat(summary.lastActivityAt()).isAfter(before).isEqualTo(legacy.getUpdatedAt());
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
        .hasMessage("Só é possível alterar um projeto em rascunho ou reprovado.");
  }

  @Test
  void updatesARejectedProjectKeepingItsRejectedStatusAndRefusesToDeleteIt() {
    Project rejected =
        projectRepository.save(
            project(
                "Condomínio Vila Nova",
                "Avenida Barreto de Menezes, 88",
                "Jaboatão dos Guararapes",
                "2026-5239",
                ProjectStatus.REJECTED));

    Project updated =
        service.update(rejected.getId(), parameters(BuildingCategory.MIXED), designer).project();

    assertThat(updated.getStatus()).isEqualTo(ProjectStatus.REJECTED);
    assertThat(updated.getBuildingType().category()).isEqualTo(BuildingCategory.MIXED);
    assertThatThrownBy(() -> service.delete(rejected.getId(), designer))
        .isInstanceOf(BusinessException.class)
        .hasMessage("Só é possível excluir um projeto em rascunho.");
  }

  @Test
  void deletesADraftProjectAndItsFindings() {
    Project draft = service.create(parameters(BuildingCategory.MIXED), designer).project();
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
    return list(
        new ProjectListQuery(
            status,
            search,
            ProjectSort.UPDATED_AT,
            SortDirection.DESC,
            null,
            null,
            null,
            null,
            null,
            null));
  }

  private ProjectListing list(ProjectListQuery query) {
    return service.list(1, 20, query, designer);
  }

  private static ProjectListQuery sortedBy(ProjectSort sort, SortDirection direction) {
    return new ProjectListQuery(null, null, sort, direction, null, null, null, null, null, null);
  }

  private static ProjectListQuery filtered(
      String municipality, LocalDate createdFrom, LocalDate createdTo) {
    return new ProjectListQuery(
        null,
        null,
        ProjectSort.UPDATED_AT,
        SortDirection.DESC,
        null,
        municipality == null ? null : Set.of(municipality),
        createdFrom,
        createdTo,
        null,
        null);
  }

  private static ProjectListQuery filtered(OpenFindingsFilter findings) {
    return new ProjectListQuery(
        null,
        null,
        ProjectSort.UPDATED_AT,
        SortDirection.DESC,
        null,
        null,
        null,
        null,
        findings == null ? null : Set.of(findings),
        null);
  }

  private Project save(String name, String municipality, String protocol) {
    return projectRepository.save(
        project(name, "Rua " + name, municipality, protocol, ProjectStatus.UNDER_REVIEW));
  }

  /** The entity sets its own timestamps, so tests move them with a bulk update. */
  private void stamp(Project project, String field, String instant) {
    entityManager
        .createQuery("UPDATE Project project SET project." + field + " = :at WHERE project = :p")
        .setParameter("at", OffsetDateTime.parse(instant))
        .setParameter("p", project)
        .executeUpdate();
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

  private static ConsumerUnitGroup residentialGroup(Project project, String name, int quantity) {
    return GroupKind.RESIDENTIAL.create(
        project,
        new GroupSpec(
            name,
            quantity,
            new BigDecimal("68"),
            2,
            new BigDecimal("6.5"),
            false,
            null,
            null,
            null,
            null,
            null,
            null));
  }

  private ProjectEvent event(Project project, ProjectEventType type, String occurredAt) {
    return new ProjectEvent(
        project,
        type,
        project.getReviewCycle(),
        owner,
        owner.getRole(),
        type.name(),
        null,
        OffsetDateTime.parse(occurredAt));
  }

  private static ProjectParameters parameters(BuildingCategory category) {
    return new ProjectParameters(
        "Residencial Monte Verde",
        "54500000",
        BrazilianState.PE,
        "Cabo de Santo Agostinho",
        "Rodovia BR-101, km 8",
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
    return finding(project, FindingSeverity.ADJUSTMENT);
  }

  private Finding finding(Project project, FindingSeverity severity) {
    return new Finding(
        project,
        severity,
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
