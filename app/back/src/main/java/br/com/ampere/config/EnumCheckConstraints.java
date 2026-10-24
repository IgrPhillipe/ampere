package br.com.ampere.config;

import br.com.ampere.domain.LampTechnology;
import br.com.ampere.domain.UserRole;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManagerFactory;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** {@code ddl-auto=update} never rewrites an enum CHECK, so a value added later is refused. */
@Component
public class EnumCheckConstraints {

  private record Constraint(String table, String column, Class<? extends Enum<?>> values) {}

  private static final List<Constraint> CONSTRAINTS =
      List.of(
          new Constraint("app_user", "role", UserRole.class),
          new Constraint("load_group_item", "lamp_technology", LampTechnology.class));

  private final JdbcTemplate jdbcTemplate;

  // The factory is only a dependency: the schema must exist before the CHECK is rewritten.
  public EnumCheckConstraints(JdbcTemplate jdbcTemplate, EntityManagerFactory schemaReady) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @PostConstruct
  void rewrite() {
    CONSTRAINTS.forEach(this::rewrite);
  }

  private void rewrite(Constraint constraint) {
    String name = constraint.table() + "_" + constraint.column() + "_check";
    String values =
        Arrays.stream(constraint.values().getEnumConstants())
            .map(value -> "'" + value.name() + "'")
            .collect(Collectors.joining(", "));
    jdbcTemplate.execute(
        "ALTER TABLE "
            + constraint.table()
            + " DROP CONSTRAINT IF EXISTS "
            + name
            + ", ADD CONSTRAINT "
            + name
            + " CHECK ("
            + constraint.column()
            + " IN ("
            + values
            + "))");
  }
}
