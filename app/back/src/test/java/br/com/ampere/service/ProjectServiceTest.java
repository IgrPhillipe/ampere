package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.ampere.domain.BuildingCategory;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectSort;
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
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
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
  void normalizesSearchAndUsesStablePaginationOrder() {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);
    when(projectRepository.searchAccessibleProjects(
            isNull(),
            eq("\\%\\_\\\\"),
            eq(7L),
            eq(false),
            isNull(),
            isNull(),
            isNull(),
            eq(false),
            eq(ProjectSort.UPDATED_AT),
            eq(SortDirection.DESC),
            any(Pageable.class)))
        .thenReturn(Page.empty());
    when(projectRepository.countAccessiblePerStatus(7L, false)).thenReturn(List.of());
    ProjectService service =
        new ProjectService(
            projectRepository,
            findingRepository,
            mock(ConsumerUnitGroupRepository.class),
            mock(CalculationRepository.class),
            mock(ProjectDocumentRepository.class),
            mock(ProjectCreation.class),
            mock(ApplicableStandards.class));

    service.list(
        1,
        20,
        null,
        " %_\\ ",
        ProjectSort.UPDATED_AT,
        SortDirection.DESC,
        null,
        null,
        null,
        null,
        DESIGNER);

    ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
    verify(projectRepository)
        .searchAccessibleProjects(
            isNull(),
            eq("\\%\\_\\\\"),
            eq(7L),
            eq(false),
            isNull(),
            isNull(),
            isNull(),
            eq(false),
            eq(ProjectSort.UPDATED_AT),
            eq(SortDirection.DESC),
            pageableCaptor.capture());
    Pageable pageable = pageableCaptor.getValue();
    assertThat(pageable.getPageNumber()).isZero();
    assertThat(pageable.getPageSize()).isEqualTo(20);
  }

  @Test
  void ordersByTheOldestUpdateWhenAscending() {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    when(projectRepository.searchAccessibleProjects(
            isNull(),
            eq(""),
            eq(7L),
            eq(false),
            isNull(),
            isNull(),
            isNull(),
            eq(false),
            eq(ProjectSort.UPDATED_AT),
            eq(SortDirection.ASC),
            any(Pageable.class)))
        .thenReturn(Page.empty());
    ProjectService service =
        new ProjectService(
            projectRepository,
            mock(FindingRepository.class),
            mock(ConsumerUnitGroupRepository.class),
            mock(CalculationRepository.class),
            mock(ProjectDocumentRepository.class),
            mock(ProjectCreation.class),
            mock(ApplicableStandards.class));

    service.list(
        1,
        20,
        null,
        null,
        ProjectSort.UPDATED_AT,
        SortDirection.ASC,
        null,
        null,
        null,
        null,
        DESIGNER);

    ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
    verify(projectRepository)
        .searchAccessibleProjects(
            isNull(),
            eq(""),
            eq(7L),
            eq(false),
            isNull(),
            isNull(),
            isNull(),
            eq(false),
            eq(ProjectSort.UPDATED_AT),
            eq(SortDirection.ASC),
            pageableCaptor.capture());
  }

  @Test
  void validatesCreatedFromBeforeOrEqualCreatedTo() {
    ProjectService service =
        new ProjectService(
            mock(ProjectRepository.class),
            mock(FindingRepository.class),
            mock(ConsumerUnitGroupRepository.class),
            mock(CalculationRepository.class),
            mock(ProjectDocumentRepository.class),
            mock(ProjectCreation.class),
            mock(ApplicableStandards.class));

    LocalDate from = LocalDate.of(2026, 10, 15);
    LocalDate to = LocalDate.of(2026, 10, 10);

    assertThatThrownBy(
            () ->
                service.list(
                    1,
                    20,
                    null,
                    null,
                    ProjectSort.UPDATED_AT,
                    SortDirection.DESC,
                    null,
                    from,
                    to,
                    null,
                    DESIGNER))
        .isInstanceOf(BusinessException.class)
        .hasMessage("A data inicial deve ser anterior ou igual à data final.");
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
  void givesUpAndAnswersWithConflictWhenProtocolRetriesAreExhausted() {
    ProjectCreation creation = mock(ProjectCreation.class);
    when(creation.createWithGeneratedProtocol(any(), any()))
        .thenThrow(new DataIntegrityViolationException("duplicate protocol"));

    assertThatThrownBy(() -> service(creation).create(parameters(), DESIGNER))
        .isInstanceOf(BusinessException.class)
        .hasMessage("Não foi possível gerar o protocolo do projeto. Tente novamente.")
        .satisfies(
            exception ->
                assertThat(((BusinessException) exception).getStatus())
                    .isEqualTo(HttpStatus.CONFLICT));
    verify(creation, times(3)).createWithGeneratedProtocol(any(), any());
  }

  @Test
  void deletesDraftAndItsAssociatedChildren() {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);
    ConsumerUnitGroupRepository groupRepository = mock(ConsumerUnitGroupRepository.class);
    CalculationRepository calculationRepository = mock(CalculationRepository.class);
    ProjectDocumentRepository documentRepository = mock(ProjectDocumentRepository.class);

    Project project = draft();
    when(projectRepository.findDetailById(42L)).thenReturn(Optional.of(project));

    ProjectService service =
        new ProjectService(
            projectRepository,
            findingRepository,
            groupRepository,
            calculationRepository,
            documentRepository,
            mock(ProjectCreation.class),
            mock(ApplicableStandards.class));

    service.delete(42L, DESIGNER);

    InOrder order =
        inOrder(
            calculationRepository,
            findingRepository,
            groupRepository,
            documentRepository,
            projectRepository);
    order.verify(calculationRepository).deleteAllByProjectId(42L);
    order.verify(findingRepository).deleteAllByProjectId(42L);
    order.verify(groupRepository).deleteAllByProjectId(42L);
    order.verify(documentRepository).deleteAllByProjectId(42L);
    order.verify(projectRepository).delete(project);
  }

  @Test
  void throwsNotFoundWhenProjectDoesNotExist() {
    ProjectRepository repository = mock(ProjectRepository.class);
    when(repository.findDetailById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(
            () -> service(repository, mock(FindingRepository.class)).findById(99L, DESIGNER))
        .isInstanceOf(NotFoundException.class)
        .hasMessage("Projeto não encontrado.");
  }

  @Test
  void concealsAnotherOwnersProjectAsNotFound() {
    ProjectRepository repository = mock(ProjectRepository.class);
    when(repository.findDetailById(42L)).thenReturn(Optional.of(draftOwnedBy(99L)));

    assertThatThrownBy(
            () -> service(repository, mock(FindingRepository.class)).findById(42L, DESIGNER))
        .isInstanceOf(NotFoundException.class)
        .hasMessage("Projeto não encontrado.");
  }

  @Test
  void analystCanViewSubmittedProjectOfAnotherOwner() {
    ProjectRepository repository = mock(ProjectRepository.class);
    Project project = draftOwnedBy(99L);
    project.submit(OffsetDateTime.now(ZoneOffset.UTC));
    when(repository.findDetailById(42L)).thenReturn(Optional.of(project));

    Project found =
        service(repository, mock(FindingRepository.class))
            .findById(42L, new AuthenticatedUser(1L, UserRole.ADMIN));

    assertThat(found).isSameAs(project);
  }

  private static Project draft() {
    return draftOwnedBy(DESIGNER.id());
  }

  private static Project draftOwnedBy(Long ownerId) {
    return Project.draft(
        "Residencial Monte Verde",
        "Rodovia BR-101, km 8",
        "Cabo de Santo Agostinho",
        "2026-1007",
        new ResidentialMultifamily(
            12, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE),
        List.of(),
        user(ownerId));
  }

  private static User user(Long id) {
    User designer = new User("João Projetista", "user@ampere.com", "hash", UserRole.USER);
    try {
      java.lang.reflect.Field field = User.class.getDeclaredField("id");
      field.setAccessible(true);
      field.set(designer, id);
    } catch (ReflectiveOperationException e) {
      throw new RuntimeException(e);
    }

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
