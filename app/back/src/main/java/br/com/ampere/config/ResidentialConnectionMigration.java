package br.com.ampere.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Apartment groups saved before the connection per unit were single-phase. */
@Component
@Order(0)
public class ResidentialConnectionMigration implements ApplicationRunner {

  private static final Logger log = LoggerFactory.getLogger(ResidentialConnectionMigration.class);

  private final JdbcTemplate jdbcTemplate;

  public ResidentialConnectionMigration(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    int changed =
        jdbcTemplate.update(
            "UPDATE consumer_unit_group SET connection_type = 'SINGLE_PHASE'"
                + " WHERE kind = 'RESIDENTIAL' AND connection_type IS NULL");
    if (changed > 0) {
      log.info("ResidentialConnectionMigration: {} apartment groups set to single-phase.", changed);
    }
  }
}
