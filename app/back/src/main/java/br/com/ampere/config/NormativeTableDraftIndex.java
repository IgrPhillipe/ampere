package br.com.ampere.config;

import br.com.ampere.repository.NormativeTableRepository;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManagerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * One pending revision per table, also when two are created at the same instant. A partial index is
 * out of reach of {@code ddl-auto=update}, so it is created here.
 */
@Component
public class NormativeTableDraftIndex {

  private static final Logger log = LoggerFactory.getLogger(NormativeTableDraftIndex.class);

  private final JdbcTemplate jdbcTemplate;

  // The factory is only a dependency: the table must exist before the index is created.
  public NormativeTableDraftIndex(JdbcTemplate jdbcTemplate, EntityManagerFactory schemaReady) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @PostConstruct
  void create() {
    try {
      jdbcTemplate.execute(
          "CREATE UNIQUE INDEX IF NOT EXISTS "
              + NormativeTableRepository.ONE_DRAFT_PER_CODE
              + " ON normative_table (code) WHERE status = 'DRAFT'");
    } catch (RuntimeException failure) {
      // An old database with two drafts of one table: delete one and restart.
      log.warn(
          "{} not created: {}", NormativeTableRepository.ONE_DRAFT_PER_CODE, failure.getMessage());
    }
  }
}
