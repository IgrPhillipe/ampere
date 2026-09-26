package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.ConsumerUnitGroup;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.EvStationType;
import br.com.ampere.domain.GroupKind;
import br.com.ampere.domain.GroupSpec;
import br.com.ampere.domain.GroupStatus;
import br.com.ampere.domain.LampTechnology;
import br.com.ampere.domain.LoadCategory;
import br.com.ampere.domain.LoadGroup;
import br.com.ampere.domain.LoadItem;
import br.com.ampere.domain.LoadUsage;
import br.com.ampere.domain.PowerUnit;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.ProjectStatus;
import br.com.ampere.domain.ResidentialMultifamily;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.error.BusinessException;
import br.com.ampere.error.NotFoundException;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.ConsumerUnitGroupRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectRepository;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class ConsumerUnitGroupServiceIntegrationTest {

  @Autowired private ConsumerUnitGroupService service;

  @Autowired private ProjectService projectService;

  @Autowired private ConsumerUnitGroupRepository groupRepository;

  @Autowired private FindingRepository findingRepository;

  @Autowired private CalculationRepository calculationRepository;

  @Autowired private ProjectRepository projectRepository;

  @Autowired private EntityManager entityManager;

  @BeforeEach
  void clearProjects() {
    calculationRepository.deleteAll();
    groupRepository.deleteAll();
    findingRepository.deleteAll();
    projectRepository.deleteAll();
  }

  @Test
  void keepsTheLoadsOfALoadGroupInTheirOrder() {
    Long projectId = draft().getId();

    Long groupId = service.create(projectId, commonArea()).getId();
    entityManager.flush();
    entityManager.clear();

    ConsumerUnitGroup group = service.list(projectId).getFirst();
    assertThat(group.getId()).isEqualTo(groupId);
    assertThat(group).isInstanceOf(LoadGroup.class);
    assertThat(((LoadGroup) group).getItems())
        .extracting(LoadItem::getDescription)
        .containsExactly("Elevador", "Iluminação");
    assertThat(group.status()).isEqualTo(GroupStatus.REVIEW);
  }

  @Test
  void releasesTheCalculationOnlyWhenEveryGroupIsValidated() {
    Long projectId = draft().getId();
    assertThat(service.validation(projectId).canCalculate()).isFalse();

    ConsumerUnitGroup charging = service.create(projectId, charging(null));
    GroupValidation pending = service.validation(projectId);
    assertThat(pending.canCalculate()).isFalse();
    assertThat(pending.pendingIssues()).isEqualTo(1);
    assertThat(pending.totalUnits()).isEqualTo(6);
    assertThat(pending.totalDeclaredLoadKw()).isEqualByComparingTo("44.4");

    service.update(projectId, charging.getId(), charging(true));

    assertThat(service.validation(projectId).canCalculate()).isTrue();
  }

  @Test
  void refusesToChangeTheKindOfAGroup() {
    Long projectId = draft().getId();
    Long groupId = service.create(projectId, charging(true)).getId();

    assertThatThrownBy(() -> service.update(projectId, groupId, commonArea()))
        .isInstanceOfSatisfying(
            BusinessException.class,
            error -> assertThat(error.getStatus()).isEqualTo(HttpStatus.CONFLICT));
  }

  @Test
  void refusesToTouchTheGroupsOfAProjectAlreadySubmitted() {
    Project submitted =
        projectRepository.save(
            new Project(
                "Edifício Residencial Aurora",
                "Rua da Aurora, 1240",
                "Recife",
                "2026-1003",
                ProjectStatus.UNDER_REVIEW,
                building(),
                List.of()));

    assertThatThrownBy(() -> service.create(submitted.getId(), charging(true)))
        .isInstanceOf(BusinessException.class)
        .hasMessage("Só é possível alterar as unidades de um projeto em rascunho.");
  }

  @Test
  void doesNotFindAGroupThroughAnotherProject() {
    Long projectId = draft().getId();
    Long otherProjectId = draft("2026-1009").getId();
    Long groupId = service.create(projectId, charging(true)).getId();

    assertThatThrownBy(() -> service.delete(otherProjectId, groupId))
        .isInstanceOf(NotFoundException.class)
        .hasMessage("Grupo de unidades não encontrado.");
  }

  @Test
  void deletesTheGroupsTogetherWithTheProject() {
    Long projectId = draft().getId();
    service.create(projectId, commonArea());
    service.create(projectId, charging(true));
    entityManager.flush();

    projectService.delete(projectId);
    entityManager.flush();

    assertThat(groupRepository.count()).isZero();
    assertThat(projectRepository.existsById(projectId)).isFalse();
  }

  private Project draft() {
    return draft("2026-1008");
  }

  private Project draft(String protocol) {
    return projectRepository.save(
        Project.draft(
            "Residencial Monte Verde",
            "Rodovia BR-101, km 8",
            "Cabo de Santo Agostinho",
            protocol,
            building(),
            List.of()));
  }

  private static ResidentialMultifamily building() {
    return new ResidentialMultifamily(
        12, SupplyVoltage.V380_220, ConnectionType.THREE_PHASE, EntranceStandard.COLLECTIVE);
  }

  private static GroupParameters commonArea() {
    return new GroupParameters(
        GroupKind.LOAD,
        new GroupSpec(
            "Área comum",
            1,
            null,
            null,
            null,
            null,
            LoadUsage.COMMON_AREA,
            List.of(
                new LoadItem(
                    LoadCategory.MOTORS,
                    "Elevador",
                    1,
                    new BigDecimal("12"),
                    PowerUnit.CV,
                    null,
                    null),
                new LoadItem(
                    LoadCategory.LIGHTING_AND_OUTLETS,
                    "Iluminação",
                    1,
                    new BigDecimal("6"),
                    PowerUnit.KW,
                    LampTechnology.COMPACT_FLUORESCENT_LED,
                    null)),
            null,
            null,
            null,
            null));
  }

  private static GroupParameters charging(Boolean loadManagement) {
    return new GroupParameters(
        GroupKind.EV_CHARGING,
        new GroupSpec(
            "Recarga de veículo elétrico",
            6,
            null,
            null,
            null,
            null,
            null,
            null,
            new BigDecimal("7.4"),
            false,
            loadManagement,
            EvStationType.COLLECTIVE));
  }
}
