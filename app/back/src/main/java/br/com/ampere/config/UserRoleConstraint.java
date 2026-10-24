package br.com.ampere.config;

import br.com.ampere.domain.UserRole;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManagerFactory;
import java.util.Arrays;
import java.util.stream.Collectors;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * {@code ddl-auto=update} keeps the role CHECK written when the table was created, so a database
 * older than a role refuses it. Rewritten on every startup until Flyway arrives (pendência 16).
 */
@Component
public class UserRoleConstraint {

  private final JdbcTemplate jdbcTemplate;

  /** The factory is injected only so the schema exists before the constraint is rewritten. */
  public UserRoleConstraint(JdbcTemplate jdbcTemplate, EntityManagerFactory schemaReady) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @PostConstruct
  void rewrite() {
    String roles =
        Arrays.stream(UserRole.values())
            .map(role -> "'" + role.name() + "'")
            .collect(Collectors.joining(", "));
    jdbcTemplate.execute("ALTER TABLE app_user DROP CONSTRAINT IF EXISTS app_user_role_check");
    jdbcTemplate.execute(
        "ALTER TABLE app_user ADD CONSTRAINT app_user_role_check CHECK (role IN (" + roles + "))");
  }
}
