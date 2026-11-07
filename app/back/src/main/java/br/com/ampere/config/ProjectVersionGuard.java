package br.com.ampere.config;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** Refuses UPDATE and DELETE on the version tables, also for SQL run outside the application. */
@Component
@Profile("!test")
public class ProjectVersionGuard {

  private static final Logger log = LoggerFactory.getLogger(ProjectVersionGuard.class);

  private static final List<String> TABLES =
      List.of("project_version", "project_version_document", "project_version_memorial");

  private static final String REFUSE_CHANGE =
      """
      CREATE OR REPLACE FUNCTION refuse_version_change() RETURNS trigger AS $$
      BEGIN
        IF TG_OP = 'DELETE' AND current_setting('ampere.version_cleanup', true) = 'on' THEN
          RETURN OLD;
        END IF;
        RAISE EXCEPTION '% on % refused: a version is immutable', TG_OP, TG_TABLE_NAME;
      END
      $$ LANGUAGE plpgsql
      """;

  private final JdbcTemplate jdbcTemplate;

  public ProjectVersionGuard(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @EventListener(ApplicationReadyEvent.class)
  public void onReady() {
    try {
      install();
    } catch (RuntimeException failure) {
      log.warn("ProjectVersionGuard: triggers not installed: {}", failure.getMessage());
    }
  }

  public void install() {
    jdbcTemplate.execute(REFUSE_CHANGE);
    for (String table : TABLES) {
      jdbcTemplate.execute(
          "CREATE OR REPLACE TRIGGER refuse_change BEFORE UPDATE OR DELETE ON "
              + table
              + " FOR EACH ROW EXECUTE FUNCTION refuse_version_change()");
    }
  }

  public void uninstall() {
    for (String table : TABLES) {
      jdbcTemplate.execute("DROP TRIGGER IF EXISTS refuse_change ON " + table);
    }
  }
}
