package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.ampere.domain.BuildingCategory;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Deliberately not transactional: with open-in-view disabled, this is the only way to prove the
 * entity graph works. Inside a transaction the assertions would pass without it.
 */
@SpringBootTest
class ProjectDetailIntegrationTest {

  @Autowired private ProjectService service;

  @Autowired private ProjectRepository projectRepository;

  @Autowired private FindingRepository findingRepository;

  @Autowired private StandardRepository standardRepository;

  @BeforeEach
  @AfterEach
  void clearProjects() {
    findingRepository.deleteAll();
    projectRepository.deleteAll();
    standardRepository.deleteAll();
  }

  @Test
  void loadsTheBuildingTypeAndTheStandardsOutsideTheTransaction() {
    standardRepository.saveAll(
        List.of(new Standard("DIS-NOR-053", "REV 06"), new Standard("DIS-NOR-030", "REV 07")));
    Long id =
        service
            .create(
                new ProjectParameters(
                    "Residencial Monte Verde",
                    "Rodovia BR-101, km 8",
                    "Cabo de Santo Agostinho",
                    BuildingCategory.RESIDENTIAL_MULTIFAMILY,
                    12,
                    SupplyVoltage.V380_220,
                    ConnectionType.THREE_PHASE,
                    EntranceStandard.COLLECTIVE))
            .getId();

    Project project = service.findById(id);

    assertThat(project.getStandards()).extracting(Standard::getRevision).hasSize(2);
    assertThat(project.getBuildingType().demandRules()).hasSize(2);
    assertThat(project.getBuildingType().category())
        .isEqualTo(BuildingCategory.RESIDENTIAL_MULTIFAMILY);
  }
}
