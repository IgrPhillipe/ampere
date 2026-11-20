package br.com.ampere.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Recover historical interval ends from the next publication of the same table. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class NormativeTableValidityMigration implements ApplicationRunner {
  private final JdbcTemplate jdbc;

  public NormativeTableValidityMigration(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments arguments) {
    jdbc.update(
        """
        UPDATE normative_table old
        SET superseded_at = (
          SELECT MIN(newer.verified_at) FROM normative_table newer
          WHERE newer.code = old.code AND newer.verified_at > old.verified_at
            AND newer.status IN ('PUBLISHED', 'SUPERSEDED'))
        WHERE old.status = 'SUPERSEDED' AND old.superseded_at IS NULL
        """);
  }
}
