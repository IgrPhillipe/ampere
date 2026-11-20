package br.com.ampere.config;

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

  private final JdbcTemplate jdbcTemplate;

  public ReviewerMunicipalityTableDrop(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @Override
  public void run(ApplicationArguments args) {
    jdbcTemplate.execute("DROP TABLE IF EXISTS reviewer_municipality");
  }
}
