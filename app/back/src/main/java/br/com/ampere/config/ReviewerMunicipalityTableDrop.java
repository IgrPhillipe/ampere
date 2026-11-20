package br.com.ampere.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** The municipality rule was retired, and {@code ddl-auto=update} never drops a table. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ReviewerMunicipalityTableDrop implements ApplicationRunner {

  private static final Logger log = LoggerFactory.getLogger(ReviewerMunicipalityTableDrop.class);

  private final JdbcTemplate jdbcTemplate;

  public ReviewerMunicipalityTableDrop(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @Override
  public void run(ApplicationArguments args) {
    Boolean exists =
        jdbcTemplate.queryForObject(
            "SELECT to_regclass('reviewer_municipality') IS NOT NULL", Boolean.class);
    if (Boolean.TRUE.equals(exists)) {
      jdbcTemplate.execute("DROP TABLE reviewer_municipality");
      log.info("ReviewerMunicipalityTableDrop: table reviewer_municipality dropped.");
    }
  }
}
