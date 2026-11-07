package br.com.ampere;

import java.util.List;
import javax.sql.DataSource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestContext;
import org.springframework.test.context.support.AbstractTestExecutionListener;

/** Registered for every Spring test in META-INF/spring.factories, so new classes need no setup. */
public class DatabaseCleanupListener extends AbstractTestExecutionListener {

  private static final String LIST_TABLES =
      "select quote_ident(tablename) from pg_tables where schemaname = current_schema()";

  @Override
  public void afterTestClass(TestContext testContext) {
    if (testContext.hasApplicationContext()) {
      testContext
          .getApplicationContext()
          .getBeanProvider(DataSource.class)
          .ifAvailable(this::truncateTables);
    }
  }

  private void truncateTables(DataSource dataSource) {
    JdbcTemplate jdbc = new JdbcTemplate(dataSource);
    List<String> tables = jdbc.queryForList(LIST_TABLES, String.class);
    if (!tables.isEmpty()) {
      jdbc.execute("truncate table " + String.join(", ", tables) + " cascade");
    }
  }
}
