package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

class ProjectServiceTest {

  @Test
  void normalizesSearchAndUsesStablePaginationOrder() {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);
    when(projectRepository.searchProjects(isNull(), eq("\\%\\_\\\\"), any(Pageable.class)))
        .thenReturn(Page.empty());
    when(projectRepository.countPerStatus()).thenReturn(List.of());
    ProjectService service = new ProjectService(projectRepository, findingRepository);

    service.list(1, 20, null, " %_\\ ");

    ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
    verify(projectRepository).searchProjects(isNull(), eq("\\%\\_\\\\"), pageableCaptor.capture());
    Pageable pageable = pageableCaptor.getValue();
    assertThat(pageable.getPageNumber()).isZero();
    assertThat(pageable.getPageSize()).isEqualTo(20);
    assertThat(pageable.getSort().stream().map(Object::toString))
        .containsExactly("updatedAt: DESC", "id: DESC");
  }
}
