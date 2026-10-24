package br.com.ampere.config;

import br.com.ampere.domain.UserRole;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManagerFactory;
import java.util.Arrays;
import java.util.stream.Collectors;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** {@code ddl-auto=update} never rewrites the role CHECK, so a new role needs it rewritten. */
@Component
public class UserRoleConstraint {

  private final JdbcTemplate jdbcTemplate;

  // The factory is only a dependency: the schema must exist before the CHECK is rewritten.
  public UserRoleConstraint(JdbcTemplate jdbcTemplate, EntityManagerFactory schemaReady) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @PostConstruct
  void rewrite() {
    String roles =
        Arrays.stream(UserRole.values())
            .map(role -> "'" + role.name() + "'")
            .collect(Collectors.joining(", "));
    jdbcTemplate.execute(
        "ALTER TABLE app_user DROP CONSTRAINT IF EXISTS app_user_role_check,"
            + " ADD CONSTRAINT app_user_role_check CHECK (role IN ("
            + roles
            + "))");
  }
}
