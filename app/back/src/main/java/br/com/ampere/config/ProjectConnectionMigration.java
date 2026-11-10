package br.com.ampere.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Retired two-phase projects become three-phase before the other startup runners read them. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ProjectConnectionMigration implements ApplicationRunner {

  private static final Logger log = LoggerFactory.getLogger(ProjectConnectionMigration.class);

  private final JdbcTemplate jdbcTemplate;

  public ProjectConnectionMigration(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    int projects =
        jdbcTemplate.update(
            "UPDATE building_type SET connection_type = 'THREE_PHASE'"
                + " WHERE connection_type = 'TWO_PHASE'");
    int calculations =
        jdbcTemplate.update(
            "UPDATE calculation SET connection_type = 'THREE_PHASE'"
                + " WHERE connection_type = 'TWO_PHASE'");
    if (projects > 0 || calculations > 0) {
      log.info(
          "ProjectConnectionMigration: {} projects and {} calculations set to three-phase.",
          projects,
          calculations);
    }
  }
}
