package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.ampere.domain.BuildingCategory;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.OpenFindingsFilter;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectSort;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ProjectVisibility;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.SortDirection;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectDocumentRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.ProjectRepositoryCustom.ProjectSearch;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

class ProjectServiceTest {

  private static final AuthenticatedUser DESIGNER = new AuthenticatedUser(7L, UserRole.USER);

  @Test
  void convertsTheFiltersBeforeSearching() {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    when(projectRepository.searchAccessibleProjects(any(), any())).thenReturn(Page.empty());

    service(projectRepository, mock(FindingRepository.class))
        .list(
            2,
            20,
            new ProjectListQuery(
                ProjectStatus.DRAFT,
                " %_\\ ",
                ProjectSort.NAME,
                SortDirection.ASC,
                "Recife",
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 10),
                OpenFindingsFilter.ANY_OPEN),
            DESIGNER);

    ArgumentCaptor<ProjectSearch> searchCaptor = ArgumentCaptor.forClass(ProjectSearch.class);
    ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
    verify(projectRepository)
        .searchAccessibleProjects(searchCaptor.capture(), pageableCaptor.capture());
    ProjectSearch search = searchCaptor.getValue();
    assertThat(search.ownerId()).isEqualTo(7L);
    assertThat(search.visibility()).isEqualTo(ProjectVisibility.OWN);
    assertThat(search.search()).isEqualTo("\\%\\_\\\\");
    assertThat(search.createdFrom()).isEqualTo(OffsetDateTime.parse("2026-10-01T00:00-03:00"));
    assertThat(search.createdBefore()).isEqualTo(OffsetDateTime.parse("2026-10-11T00:00-03:00"));
    assertThat(search.findings()).isEqualTo(OpenFindingsFilter.ANY_OPEN);
    assertThat(pageableCaptor.getValue().getPageNumber()).isEqualTo(1);
    assertThat(pageableCaptor.getValue().getPageSize()).isEqualTo(20);
  }

  @Test
  void refusesAPeriodThatStartsAfterItEnds() {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    ProjectListQuery query =
        new ProjectListQuery(
            null,
            null,
            ProjectSort.UPDATED_AT,
            SortDirection.DESC,
            null,
            LocalDate.of(2026, 10, 10),
            LocalDate.of(2026, 10, 1),
            null);

    assertThatThrownBy(
            () ->
                service(projectRepository, mock(FindingRepository.class))
                    .list(1, 20, query, DESIGNER))
        .isInstanceOf(BusinessException.class)
        .hasMessage("A data inicial deve ser anterior ou igual à data final.");
    verify(projectRepository, times(0)).searchAccessibleProjects(any(), any());
  }

  @Test
  void retriesProtocolGenerationOnceOnACollision() {
    ProjectCreation creation = mock(ProjectCreation.class);
    Project created = mock(Project.class);
    when(creation.createWithGeneratedProtocol(any(), any()))
        .thenThrow(new DataIntegrityViolationException("duplicate protocol"))
        .thenReturn(created);

    assertThat(service(creation).create(parameters(), DESIGNER)).isSameAs(created);
    verify(creation, times(2)).createWithGeneratedProtocol(any(), any());
  }

  @Test
  void answersConflictWhenEveryProtocolAttemptCollides() {
    ProjectCreation creation = mock(ProjectCreation.class);
    when(creation.createWithGeneratedProtocol(any(), any()))
        .thenThrow(new DataIntegrityViolationException("duplicate protocol"));

    assertThatThrownBy(() -> service(creation).create(parameters(), DESIGNER))
        .isInstanceOf(BusinessException.class)
        .hasMessage("Não foi possível gerar o protocolo do projeto. Tente novamente.")
        .extracting(exception -> ((BusinessException) exception).getStatus())
        .isEqualTo(HttpStatus.CONFLICT);
    verify(creation, times(3)).createWithGeneratedProtocol(any(), any());
  }

  @Test
  void answersNotFoundForAnUnknownProject() {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    when(projectRepository.findDetailById(99L)).thenReturn(Optional.empty());
    ProjectService service = service(projectRepository, mock(FindingRepository.class));

    assertThatThrownBy(() -> service.findById(99L, DESIGNER))
        .isInstanceOf(NotFoundException.class)
        .hasMessage("Projeto não encontrado.");
    assertThatThrownBy(() -> service.update(99L, parameters(), DESIGNER))
        .isInstanceOf(NotFoundException.class);
    assertThatThrownBy(() -> service.delete(99L, DESIGNER)).isInstanceOf(NotFoundException.class);
  }

  @Test
  void refusesToUpdateAProjectThatLeftDraft() {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    Project project = projectWith(ProjectStatus.UNDER_REVIEW);
    when(projectRepository.findDetailById(1L)).thenReturn(Optional.of(project));

    assertThatThrownBy(
            () ->
                service(projectRepository, mock(FindingRepository.class))
                    .update(1L, parameters(), DESIGNER))
        .isInstanceOf(BusinessException.class)
        .hasMessage("Só é possível alterar um projeto em rascunho ou reprovado.");
  }

  @Test
  void refusesToDeleteAProjectThatLeftDraft() {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);
    Project project = projectWith(ProjectStatus.APPROVED);
    when(projectRepository.findDetailById(1L)).thenReturn(Optional.of(project));

    assertThatThrownBy(() -> service(projectRepository, findingRepository).delete(1L, DESIGNER))
        .isInstanceOf(BusinessException.class)
        .hasMessage("Só é possível excluir um projeto em rascunho.");
    verify(projectRepository, times(0)).delete(any());
  }

  @Test
  void deletesTheCalculationsAndFindingsBeforeTheProject() {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);
    CalculationRepository calculationRepository = mock(CalculationRepository.class);
    Project project = projectWith(ProjectStatus.DRAFT);
    when(projectRepository.findDetailById(1L)).thenReturn(Optional.of(project));

    service(projectRepository, findingRepository, calculationRepository).delete(1L, DESIGNER);

    InOrder order = inOrder(calculationRepository, findingRepository, projectRepository);
    order.verify(calculationRepository).deleteAllByProjectId(1L);
    order.verify(findingRepository).deleteAllByProjectId(1L);
    order.verify(projectRepository).delete(project);
  }

  private static Project projectWith(ProjectStatus status) {
    return new Project(
        "Condomínio Vila Nova",
        "Avenida Barreto de Menezes, 88",
        "Jaboatão dos Guararapes",
        "2026-8475",
        status,
        new ResidentialMultifamily(
            6, SupplyVoltage.V220_127, ConnectionType.TWO_PHASE, EntranceStandard.INDIVIDUAL),
        List.of(),
        designer());
  }

  private static User designer() {
    User designer = mock(User.class);
    when(designer.getId()).thenReturn(DESIGNER.id());

    return designer;
  }

  private static ProjectService service(ProjectCreation creation) {
    return new ProjectService(
        mock(ProjectRepository.class),
        mock(FindingRepository.class),
        mock(ConsumerUnitGroupRepository.class),
        mock(CalculationRepository.class),
        mock(ProjectDocumentRepository.class),
        creation,
        mock(ApplicableStandards.class));
  }

  private static ProjectService service(
      ProjectRepository projectRepository, FindingRepository findingRepository) {
    return service(projectRepository, findingRepository, mock(CalculationRepository.class));
  }

  private static ProjectService service(
      ProjectRepository projectRepository,
      FindingRepository findingRepository,
      CalculationRepository calculationRepository) {
    return new ProjectService(
        projectRepository,
        findingRepository,
        mock(ConsumerUnitGroupRepository.class),
        calculationRepository,
        mock(ProjectDocumentRepository.class),
        mock(ProjectCreation.class),
        mock(ApplicableStandards.class));
  }

  private static ProjectParameters parameters() {
    return new ProjectParameters(
        "Residencial Monte Verde",
        "Rodovia BR-101, km 8",
        "Cabo de Santo Agostinho",
        BuildingCategory.RESIDENTIAL_MULTIFAMILY,
        12,
        SupplyVoltage.V380_220,
        ConnectionType.THREE_PHASE,
        EntranceStandard.COLLECTIVE);
  }
}
