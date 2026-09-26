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
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectRepository;
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

  @Test
  void normalizesSearchAndUsesStablePaginationOrder() {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);
    when(projectRepository.searchProjects(isNull(), eq("\\%\\_\\\\"), any(Pageable.class)))
        .thenReturn(Page.empty());
    when(projectRepository.countPerStatus()).thenReturn(List.of());
    ProjectService service =
        new ProjectService(
            projectRepository,
            findingRepository,
            mock(ConsumerUnitGroupRepository.class),
            mock(ProjectCreation.class),
            mock(ApplicableStandards.class));

    service.list(1, 20, null, " %_\\ ");

    ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
    verify(projectRepository).searchProjects(isNull(), eq("\\%\\_\\\\"), pageableCaptor.capture());
    Pageable pageable = pageableCaptor.getValue();
    assertThat(pageable.getPageNumber()).isZero();
    assertThat(pageable.getPageSize()).isEqualTo(20);
    assertThat(pageable.getSort().stream().map(Object::toString))
        .containsExactly("updatedAt: DESC", "id: DESC");
  }

  @Test
  void retriesProtocolGenerationOnceOnACollision() {
    ProjectCreation creation = mock(ProjectCreation.class);
    Project created = mock(Project.class);
    when(creation.createWithGeneratedProtocol(any()))
        .thenThrow(new DataIntegrityViolationException("duplicate protocol"))
        .thenReturn(created);

    assertThat(service(creation).create(parameters())).isSameAs(created);
    verify(creation, times(2)).createWithGeneratedProtocol(any());
  }

  @Test
  void answersConflictWhenEveryProtocolAttemptCollides() {
    ProjectCreation creation = mock(ProjectCreation.class);
    when(creation.createWithGeneratedProtocol(any()))
        .thenThrow(new DataIntegrityViolationException("duplicate protocol"));

    assertThatThrownBy(() -> service(creation).create(parameters()))
        .isInstanceOf(BusinessException.class)
        .hasMessage("Não foi possível gerar o protocolo do projeto. Tente novamente.")
        .extracting(exception -> ((BusinessException) exception).getStatus())
        .isEqualTo(HttpStatus.CONFLICT);
    verify(creation, times(3)).createWithGeneratedProtocol(any());
  }

  @Test
  void answersNotFoundForAnUnknownProject() {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    when(projectRepository.findDetailById(99L)).thenReturn(Optional.empty());
    ProjectService service = service(projectRepository, mock(FindingRepository.class));

    assertThatThrownBy(() -> service.findById(99L))
        .isInstanceOf(NotFoundException.class)
        .hasMessage("Projeto não encontrado.");
    assertThatThrownBy(() -> service.update(99L, parameters()))
        .isInstanceOf(NotFoundException.class);
    assertThatThrownBy(() -> service.delete(99L)).isInstanceOf(NotFoundException.class);
  }

  @Test
  void refusesToUpdateAProjectThatLeftDraft() {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    when(projectRepository.findDetailById(1L))
        .thenReturn(Optional.of(projectWith(ProjectStatus.UNDER_REVIEW)));

    assertThatThrownBy(
            () ->
                service(projectRepository, mock(FindingRepository.class)).update(1L, parameters()))
        .isInstanceOf(BusinessException.class)
        .hasMessage("Só é possível alterar um projeto em rascunho.");
  }

  @Test
  void refusesToDeleteAProjectThatLeftDraft() {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);
    when(projectRepository.findDetailById(1L))
        .thenReturn(Optional.of(projectWith(ProjectStatus.APPROVED)));

    assertThatThrownBy(() -> service(projectRepository, findingRepository).delete(1L))
        .isInstanceOf(BusinessException.class)
        .hasMessage("Só é possível excluir um projeto em rascunho.");
    verify(projectRepository, times(0)).delete(any());
  }

  @Test
  void deletesTheFindingsBeforeTheProject() {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);
    Project project = projectWith(ProjectStatus.DRAFT);
    when(projectRepository.findDetailById(1L)).thenReturn(Optional.of(project));

    service(projectRepository, findingRepository).delete(1L);

    InOrder order = inOrder(findingRepository, projectRepository);
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
        List.of());
  }

  private static ProjectService service(ProjectCreation creation) {
    return new ProjectService(
        mock(ProjectRepository.class),
        mock(FindingRepository.class),
        mock(ConsumerUnitGroupRepository.class),
        creation,
        mock(ApplicableStandards.class));
  }

  private static ProjectService service(
      ProjectRepository projectRepository, FindingRepository findingRepository) {
    return new ProjectService(
        projectRepository,
        findingRepository,
        mock(ConsumerUnitGroupRepository.class),
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
