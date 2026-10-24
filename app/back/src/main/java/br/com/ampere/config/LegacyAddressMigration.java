package br.com.ampere.config;

import br.com.ampere.domain.BrazilianState;
import br.com.ampere.domain.ConcessionArea;
import br.com.ampere.domain.Project;
import br.com.ampere.repository.ProjectRepository;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Projects saved before the UF had a column: splits "Recife/PE" and stores the IBGE spelling. Runs
 * in every profile and changes nothing once the data is clean.
 */
@Component
@Order(0)
public class LegacyAddressMigration implements ApplicationRunner {

  private static final Logger log = LoggerFactory.getLogger(LegacyAddressMigration.class);

  private final ProjectRepository projectRepository;

  public LegacyAddressMigration(ProjectRepository projectRepository) {
    this.projectRepository = projectRepository;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    List<Project> changed =
        projectRepository.findAll().stream().filter(LegacyAddressMigration::normalize).toList();
    if (!changed.isEmpty()) {
      projectRepository.saveAll(changed);
      log.info("LegacyAddressMigration: address normalized in {} projects.", changed.size());
    }
  }

  private static boolean normalize(Project project) {
    String municipality = project.getMunicipality();
    BrazilianState state = project.getState();
    int slash = municipality.lastIndexOf('/');
    if (slash > 0) {
      String code = municipality.substring(slash + 1).trim().toUpperCase(Locale.ROOT);
      if (Arrays.stream(BrazilianState.values()).anyMatch(value -> value.name().equals(code))) {
        state = BrazilianState.valueOf(code);
        municipality = municipality.substring(0, slash);
      }
    }
    String canonical =
        ConcessionArea.municipalityOf(state, municipality).orElse(municipality.trim());
    if (canonical.equals(project.getMunicipality()) && state == project.getState()) {
      return false;
    }
    project.rename(project.getName(), project.getAddress(), canonical);
    project.locate(project.getPostalCode(), Objects.requireNonNull(state));
    return true;
  }
}
