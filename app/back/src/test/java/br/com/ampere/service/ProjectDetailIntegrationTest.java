package br.com.ampere.service;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.ampere.domain.BuildingCategory;
import br.com.ampere.domain.ConnectionType;
import br.com.ampere.domain.EntranceStandard;
import br.com.ampere.domain.Project;
import br.com.ampere.domain.Standard;
import br.com.ampere.domain.SupplyVoltage;
import br.com.ampere.domain.User;
import br.com.ampere.domain.UserRole;
import br.com.ampere.repository.CalculationRepository;
import br.com.ampere.repository.FindingRepository;
import br.com.ampere.repository.NormativeTableRepository;
import br.com.ampere.repository.ProjectRepository;
import br.com.ampere.repository.StandardRepository;
import br.com.ampere.repository.UserRepository;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@SpringBootTest
class ProjectDetailIntegrationTest {

  @Autowired private ProjectService service;

  @Autowired private ProjectRepository projectRepository;

  @Autowired private FindingRepository findingRepository;

  @Autowired private StandardRepository standardRepository;

  @Autowired private CalculationRepository calculationRepository;

  @Autowired private NormativeTableRepository normativeTableRepository;

  @Autowired private UserRepository userRepository;

  @BeforeEach
  void setUp() {
    clearProjects();
    User owner =
        userRepository.save(new User("João Projetista", "joao@ampere.com", "hash", UserRole.USER));
    Jwt jwt =
        Jwt.withTokenValue("token")
            .header("alg", "none")
            .subject(String.valueOf(owner.getId()))
            .claim("email", owner.getEmail())
            .claim("role", owner.getRole().getValue())
            .build();
    SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt));
  }

  @AfterEach
  void tearDown() {
    SecurityContextHolder.clearContext();
    clearProjects();
  }

  private void clearProjects() {
    calculationRepository.deleteAll();
    findingRepository.deleteAll();
    projectRepository.deleteAll();
    normativeTableRepository.deleteAll();
    standardRepository.deleteAll();
    userRepository.deleteAll();
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
