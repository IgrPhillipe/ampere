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
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.Finding;
import br.com.ampere.domain.GroupStatus;
import br.com.ampere.domain.NormativeTable;
import br.com.ampere.domain.NormativeTableCode;
import br.com.ampere.domain.NormativeTableStatus;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.stream.StreamSupport;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

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
    return seeder(
        projectRepository, findingRepository, standardRepository, mock(UserRepository.class));
  }

  private static DataSeeder seeder(
      ProjectRepository projectRepository,
      FindingRepository findingRepository,
      StandardRepository standardRepository,
      UserRepository userRepository) {
    return new DataSeeder(
        projectRepository,
        findingRepository,
        mock(ConsumerUnitGroupRepository.class),
        standardRepository,
        existingNormativeTables(),
        userRepository,
        new BCryptPasswordEncoder());
  }

  private static DataSeeder seeder(
      ProjectRepository projectRepository, ConsumerUnitGroupRepository groupRepository) {
    return new DataSeeder(
        projectRepository,
        mock(FindingRepository.class),
        groupRepository,
        seededStandards(),
        existingNormativeTables(),
        mock(UserRepository.class),
        new BCryptPasswordEncoder());
  }

  private static DataSeeder seeder(NormativeTableRepository normativeTableRepository) {
    return new DataSeeder(
        projectRepositoryWithProjects(),
        mock(FindingRepository.class),
        mock(ConsumerUnitGroupRepository.class),
        seededStandards(),
        normativeTableRepository,
        mock(UserRepository.class),
        new BCryptPasswordEncoder());
  }

  private static NormativeTableRepository existingNormativeTables() {
    NormativeTableRepository repository = mock(NormativeTableRepository.class);
    when(repository.count()).thenReturn((long) NormativeTableCode.values().length);
    return repository;
  }

  @Test
  void seedsEveryTableTheCalculationReadsAlreadyPublished() {
    NormativeTableRepository repository = mock(NormativeTableRepository.class);
    when(repository.count()).thenReturn(0L);

    seeder(repository).run();

    ArgumentCaptor<Iterable<NormativeTable>> captor = iterableCaptor();
    verify(repository).saveAll(captor.capture());
    List<NormativeTable> tables =
        StreamSupport.stream(captor.getValue().spliterator(), false).toList();
    assertThat(tables)
        .extracting(NormativeTable::getCode)
        .containsExactlyInAnyOrder(NormativeTableCode.values());
    assertThat(tables)
        .allSatisfy(
            table -> {
              assertThat(table.getStatus()).isEqualTo(NormativeTableStatus.PUBLISHED);
              assertThat(table.problems()).isEmpty();
              assertThat(table.getStandard().getName())
                  .isEqualTo(table.getCode().standard().code());
            });
  }

  @Test
  void leavesNormativeTablesUntouchedOnRestart() {
    NormativeTableRepository repository = existingNormativeTables();

    seeder(repository).run();

    verify(repository, never()).saveAll(any());
  }

  @Test
  void seedsTheDevelopmentUsersWithHashedPasswords() {
    UserRepository userRepository = mock(UserRepository.class);
    DataSeeder seeder =
        seeder(
            projectRepositoryWithProjects(),
            mock(FindingRepository.class),
            seededStandards(),
            userRepository);

    seeder.run();

    ArgumentCaptor<Iterable<User>> usersCaptor = iterableCaptor();
    verify(userRepository).saveAll(usersCaptor.capture());
    List<User> users = StreamSupport.stream(usersCaptor.getValue().spliterator(), false).toList();

    assertThat(users)
        .extracting(User::getEmail, User::getRole)
        .containsExactly(
            tuple("user@ampere.local", UserRole.USER),
            tuple("admin@ampere.local", UserRole.ADMIN),
            tuple("revisor@ampere.local", UserRole.ADMIN));
    assertThat(users)
        .allSatisfy(
            user -> {
              assertThat(user.getPasswordHash()).isNotEqualTo(DataSeeder.DEVELOPMENT_PASSWORD);
              assertThat(
                      new BCryptPasswordEncoder()
                          .matches(DataSeeder.DEVELOPMENT_PASSWORD, user.getPasswordHash()))
                  .isTrue();
            });
  }

  @Test
  void doesNotDuplicateUsersOnRestart() {
    UserRepository userRepository = mock(UserRepository.class);
    when(userRepository.findByEmail(any())).thenReturn(Optional.of(mock(User.class)));
    DataSeeder seeder =
        seeder(
            projectRepositoryWithProjects(),
            mock(FindingRepository.class),
            seededStandards(),
            userRepository);

    seeder.run();

    verify(userRepository, never()).saveAll(any());
  }

  @Test
  void addsTheReviewerToADatabaseSeededBeforeIt() {
    UserRepository userRepository = mock(UserRepository.class);
    when(userRepository.findByEmail(any())).thenReturn(Optional.of(mock(User.class)));
    when(userRepository.findByEmail("revisor@ampere.local")).thenReturn(Optional.empty());
    DataSeeder seeder =
        seeder(
            projectRepositoryWithProjects(),
            mock(FindingRepository.class),
            seededStandards(),
            userRepository);

    seeder.run();

    ArgumentCaptor<Iterable<User>> captor = iterableCaptor();
    verify(userRepository).saveAll(captor.capture());
    assertThat(StreamSupport.stream(captor.getValue().spliterator(), false))
        .extracting(User::getEmail)
        .containsExactly("revisor@ampere.local");
  }

  @Test
  void seedsTheGroupsOfPrototypeH3InTheDraftProject() {
    ProjectRepository projectRepository = projectRepositoryWithProjects();
    Project draft = mock(Project.class);
    when(draft.isDraft()).thenReturn(true);
    when(projectRepository.findByProtocol(DataSeeder.DRAFT_PROTOCOL))
        .thenReturn(Optional.of(draft));
    ConsumerUnitGroupRepository groupRepository = mock(ConsumerUnitGroupRepository.class);
    when(groupRepository.count()).thenReturn(0L);

    seeder(projectRepository, groupRepository).run();

    ArgumentCaptor<Iterable<ConsumerUnitGroup>> captor = iterableCaptor();
    verify(groupRepository).saveAll(captor.capture());
    assertThat(StreamSupport.stream(captor.getValue().spliterator(), false))
        .extracting(ConsumerUnitGroup::getName, ConsumerUnitGroup::status)
        .containsExactly(
            tuple("Apartamento tipo A", GroupStatus.VALIDATED),
            tuple("Apartamento tipo B", GroupStatus.VALIDATED),
            tuple("Cobertura duplex", GroupStatus.VALIDATED),
            tuple("Área comum", GroupStatus.REVIEW),
            tuple("Recarga de veículo elétrico", GroupStatus.MISSING_DATA));
  }

  @Test
  void doesNotDuplicateGroupsOnRestart() {
    ConsumerUnitGroupRepository groupRepository = mock(ConsumerUnitGroupRepository.class);
    when(groupRepository.count()).thenReturn(5L);

    seeder(projectRepositoryWithProjects(), groupRepository).run();

    verify(groupRepository, never()).saveAll(any());
  }

  private static ProjectRepository projectRepositoryWithProjects() {
    ProjectRepository projectRepository = mock(ProjectRepository.class);
    when(projectRepository.count()).thenReturn(6L);
    return projectRepository;
  }

  @SuppressWarnings({"rawtypes", "unchecked"})
  private static <T> ArgumentCaptor<Iterable<T>> iterableCaptor() {
    return (ArgumentCaptor) ArgumentCaptor.forClass(Iterable.class);
  }
}
