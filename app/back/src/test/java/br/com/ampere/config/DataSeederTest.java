package br.com.ampere.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.ampere.domain.Finding;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.repository.ExampleRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectRepository;
import java.util.EnumSet;
import java.util.stream.StreamSupport;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class DataSeederTest {

  @Test
  void seedsAllStatusesAndFindingsWithoutDuplicatingProjects() throws Exception {
    ExampleRepository exampleRepository = mock(ExampleRepository.class);
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);
    when(exampleRepository.count()).thenReturn(1L);
    when(projectRepository.count()).thenReturn(0L, 6L);
    DataSeeder seeder = new DataSeeder(exampleRepository, projectRepository, findingRepository);

    seeder.run();
    seeder.run();

    ArgumentCaptor<Iterable<Project>> projectsCaptor = iterableCaptor();
    verify(projectRepository, times(1)).saveAll(projectsCaptor.capture());
    EnumSet<ProjectStatus> statuses = EnumSet.noneOf(ProjectStatus.class);
    StreamSupport.stream(projectsCaptor.getValue().spliterator(), false)
        .map(Project::getStatus)
        .forEach(statuses::add);
    assertThat(statuses).containsExactlyInAnyOrder(ProjectStatus.values());

    ArgumentCaptor<Iterable<Finding>> findingsCaptor = iterableCaptor();
    verify(findingRepository, times(1)).saveAll(findingsCaptor.capture());
    assertThat(StreamSupport.stream(findingsCaptor.getValue().spliterator(), false))
        .hasSize(4)
        .allMatch(finding -> finding.getProject().getStatus() == ProjectStatus.REJECTED);
  }

  @Test
  void leavesExistingProjectDataUntouched() throws Exception {
    ExampleRepository exampleRepository = mock(ExampleRepository.class);
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);
    when(exampleRepository.count()).thenReturn(1L);
    when(projectRepository.count()).thenReturn(1L);
    DataSeeder seeder = new DataSeeder(exampleRepository, projectRepository, findingRepository);

    seeder.run();

    verify(projectRepository, never()).saveAll(any());
    verify(findingRepository, never()).saveAll(any());
  }

  @SuppressWarnings({"rawtypes", "unchecked"})
  private static <T> ArgumentCaptor<Iterable<T>> iterableCaptor() {
    return (ArgumentCaptor) ArgumentCaptor.forClass(Iterable.class);
  }
}
