package br.com.ampere.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.ampere.domain.BuildingCategory;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.Standard;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import java.util.EnumSet;
import java.util.List;
import java.util.stream.StreamSupport;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class DataSeederTest {

  @Test
  void seedsAllStatusesAndFindingsWithoutDuplicatingProjects() throws Exception {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);
    StandardRepository standardRepository = seededStandards();
    when(projectRepository.count()).thenReturn(0L, 6L);
    DataSeeder seeder = seeder(projectRepository, findingRepository, standardRepository);

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
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);
    StandardRepository standardRepository = mock(StandardRepository.class);
    when(projectRepository.count()).thenReturn(1L);
    DataSeeder seeder = seeder(projectRepository, findingRepository, standardRepository);

    seeder.run();

    verify(projectRepository, never()).saveAll(any());
    verify(findingRepository, never()).saveAll(any());
  }

  @Test
  void seedsBothCurrentStandardsOnce() throws Exception {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);
    StandardRepository standardRepository = mock(StandardRepository.class);
    when(standardRepository.count()).thenReturn(0L, 2L);
    DataSeeder seeder = seeder(projectRepository, findingRepository, standardRepository);

    seeder.run();
    seeder.run();

    ArgumentCaptor<Iterable<Standard>> captor = iterableCaptor();
    verify(standardRepository, times(1)).saveAll(captor.capture());
    assertThat(StreamSupport.stream(captor.getValue().spliterator(), false))
        .extracting(Standard::getName, Standard::getRevision)
        .containsExactlyInAnyOrder(tuple("DIS-NOR-053", "REV 06"), tuple("DIS-NOR-030", "REV 07"));
  }

  @Test
  void seedsStandardsEvenWhenProjectsAlreadyExist() throws Exception {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);
    StandardRepository standardRepository = mock(StandardRepository.class);
    when(projectRepository.count()).thenReturn(6L);
    when(standardRepository.count()).thenReturn(0L);
    DataSeeder seeder = seeder(projectRepository, findingRepository, standardRepository);

    seeder.run();

    verify(standardRepository, times(1)).saveAll(any());
    verify(projectRepository, never()).saveAll(any());
  }

  @Test
  void seedsEveryBuildingTypeSubclass() throws Exception {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);
    when(projectRepository.count()).thenReturn(0L);
    DataSeeder seeder = seeder(projectRepository, findingRepository, seededStandards());

    seeder.run();

    ArgumentCaptor<Iterable<Project>> captor = iterableCaptor();
    verify(projectRepository).saveAll(captor.capture());
    assertThat(StreamSupport.stream(captor.getValue().spliterator(), false))
        .extracting(project -> project.getBuildingType().category())
        .contains(
            BuildingCategory.RESIDENTIAL_MULTIFAMILY,
            BuildingCategory.NON_RESIDENTIAL,
            BuildingCategory.MIXED);
  }

  @Test
  void appliesBothStandardsToEverySeededProject() throws Exception {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    FindingRepository findingRepository = mock(FindingRepository.class);
    when(projectRepository.count()).thenReturn(0L);
    DataSeeder seeder = seeder(projectRepository, findingRepository, seededStandards());

    seeder.run();

    ArgumentCaptor<Iterable<Project>> captor = iterableCaptor();
    verify(projectRepository).saveAll(captor.capture());
    assertThat(StreamSupport.stream(captor.getValue().spliterator(), false))
        .allSatisfy(
            project ->
                assertThat(project.getStandards())
                    .extracting(Standard::getName)
                    .containsExactlyInAnyOrder("DIS-NOR-053", "DIS-NOR-030"));
  }

  private static StandardRepository seededStandards() {
    StandardRepository standardRepository = mock(StandardRepository.class);
    when(standardRepository.count()).thenReturn(2L);
    when(standardRepository.findAll())
        .thenReturn(
            List.of(new Standard("DIS-NOR-053", "REV 06"), new Standard("DIS-NOR-030", "REV 07")));
    return standardRepository;
  }

  private static DataSeeder seeder(
      ProjectRepository projectRepository,
      FindingRepository findingRepository,
      StandardRepository standardRepository) {
    return new DataSeeder(projectRepository, findingRepository, standardRepository);
  }

  @SuppressWarnings({"rawtypes", "unchecked"})
  private static <T> ArgumentCaptor<Iterable<T>> iterableCaptor() {
    return (ArgumentCaptor) ArgumentCaptor.forClass(Iterable.class);
  }
}
